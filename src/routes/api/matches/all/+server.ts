import type { RequestHandler } from './$types';
import { db } from '$lib/server/database';
import { accounts, matchData, matches, players } from '$lib/server/schema';
import { desc, eq, type InferSelectModel, and, gt, gte, inArray, lte, ne } from 'drizzle-orm';
import { getPlayers } from '$lib/server/db-functions';
import { json } from '@sveltejs/kit';
import { heroData } from '$lib/data/heroData';
import { heroAbilities } from '$lib/data/heroAbilities';
import { itemMap } from '$lib/data/itemMap';
import { heroMap } from '$lib/data/heroMap';
import { getPlayerHeroScoreHistory, type HeroScoreHistoryEntry } from '$lib/server/heroStats';
import {
	DATE_RANGE_PRESETS,
	getDotaPatchRangeBounds,
	type DateRangeBounds
} from '$lib/data/dotaPatchRanges';
import dayjs from 'dayjs';

type DotaAsset = { id: number; name: string; img: string };

type MatchDataInfer = InferSelectModel<typeof matchData>;
type MatchInfer = InferSelectModel<typeof matches>;
type AccountInfer = InferSelectModel<typeof accounts>;
type PlayerInfer = InferSelectModel<typeof players>;

type MatchData = {
	[K in keyof MatchDataInfer]: K extends
		| 'item0'
		| 'item1'
		| 'item2'
		| 'item3'
		| 'item4'
		| 'item5'
		| 'itemNeutral'
		| 'backpack0'
		| 'backpack1'
		| 'backpack2'
		| 'hero'
		| 'facets'
		? DotaAsset
		: MatchDataInfer[K];
};

type PlayerMatchData = MatchData & AccountInfer & PlayerInfer;

const getDateRangeBounds = (dateRange: string | null): DateRangeBounds => {
	if (!dateRange || dateRange === 'all') return { start: null, end: null };
	if (dateRange.startsWith('patch-')) {
		return getDotaPatchRangeBounds(dateRange.replace('patch-', ''));
	}

	const preset = DATE_RANGE_PRESETS.find((range) => range.value === dateRange);
	if (!preset?.amount || !preset.unit) return { start: null, end: null };

	return {
		start: dayjs().subtract(preset.amount, preset.unit).startOf('day').unix(),
		end: null
	};
};

const getDateFilters = (bounds: DateRangeBounds) => {
	const filters = [];
	if (bounds.start !== null) filters.push(gte(matches.startTime, bounds.start));
	if (bounds.end !== null) filters.push(lte(matches.startTime, bounds.end));
	return filters;
};

const emptyStats = () => ({
	matchCount: 0,
	appearances: 0,
	wins: 0,
	losses: 0,
	winRate: 0,
	rankedMatches: 0,
	rankedRate: 0,
	averages: { kills: 0, deaths: 0, assists: 0, impact: 0, duration: 0 }
});

const calculateMatchStats = (
	rows: { match_data: MatchDataInfer; matches: MatchInfer }[],
	matchCount: number
) => {
	if (rows.length === 0) return emptyStats();

	const wins = rows.filter((row) => row.match_data.team === row.matches.winner).length;
	const rankedMatchIds = new Set(
		rows
			.filter((row) => row.matches.gameMode === 22 && row.matches.lobby === 7)
			.map((row) => row.matches.id)
	);
	const totals = rows.reduce(
		(acc, row) => {
			acc.kills += row.match_data.kills ?? 0;
			acc.deaths += row.match_data.deaths ?? 0;
			acc.assists += row.match_data.assists ?? 0;
			acc.impact += row.match_data.impact ?? 0;
			return acc;
		},
		{ kills: 0, deaths: 0, assists: 0, impact: 0 }
	);
	const durationsByMatch = new Map(rows.map((row) => [row.matches.id, row.matches.duration]));
	const average = (value: number) => value / rows.length;
	const averageDuration =
		Array.from(durationsByMatch.values()).reduce((sum, duration) => sum + duration, 0) /
		durationsByMatch.size;

	return {
		matchCount,
		appearances: rows.length,
		wins,
		losses: rows.length - wins,
		winRate: (wins / rows.length) * 100,
		rankedMatches: rankedMatchIds.size,
		rankedRate: matchCount > 0 ? (rankedMatchIds.size / matchCount) * 100 : 0,
		averages: {
			kills: average(totals.kills),
			deaths: average(totals.deaths),
			assists: average(totals.assists),
			impact: average(totals.impact),
			duration: averageDuration
		}
	};
};

export const GET: RequestHandler = async ({ url }) => {
	const allPlayers = await getPlayers({ includeHiddenFromAggregates: true });
	const allPlayerIds = allPlayers.map((player) => player.id);
	const hasPlayerFilter = url.searchParams.has('players');
	let playerFilter: number[] = allPlayerIds;
	if (hasPlayerFilter) {
		playerFilter = JSON.parse(url.searchParams.get('players')!);
	}

	const allHeroIds = heroData.map((hero) => hero.id);

	let heroFilter: number[] = allHeroIds;
	if (url.searchParams.has('heroes')) {
		heroFilter = JSON.parse(url.searchParams.get('heroes')!);
	}

	let pageNumber = 0;
	if (url.searchParams.has('page')) {
		pageNumber = parseInt(url.searchParams.get('page')!);
	}

	const allGameModes = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22];
	const allLobbies = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8];

	let gameModeFilter: number[] = allGameModes;
	let lobbyFilter: number[] = allLobbies;

	if (url.searchParams.has('gameMode')) {
		gameModeFilter = [];
		lobbyFilter = [];

		const gameModeSet = new Set<number>();
		const lobbySet = new Set<number>();
		const modes = JSON.parse(url.searchParams.get('gameMode')!);
		if (modes.includes('ranked-all-pick')) {
			gameModeSet.add(22);
			lobbySet.add(7);
		}
		if (modes.includes('unranked-all-pick')) {
			gameModeSet.add(22);
			lobbySet.add(0);
		}
		if (modes.includes('other')) {
			[0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21].forEach((mode) =>
				gameModeSet.add(mode)
			);
			[-1, 1, 2, 3, 4, 5, 6, 8].forEach((lobby) => lobbySet.add(lobby));
		}

		gameModeFilter = Array.from(gameModeSet);
		lobbyFilter = Array.from(lobbySet);
	}

	let roleFilter: number[] = [];
	if (url.searchParams.has('roles')) {
		roleFilter = JSON.parse(url.searchParams.get('roles')!);
	} else {
		roleFilter = [1, 2, 3, 4, 5];
	}

	const smurfFilter: boolean[] = [false];
	if (url.searchParams.has('smurf')) {
		smurfFilter.push(Boolean(JSON.parse(url.searchParams.get('smurf')!)));
	}
	const dateFilters = getDateFilters(getDateRangeBounds(url.searchParams.get('dateRange')));
	const resultFilter: string[] = url.searchParams.has('results')
		? JSON.parse(url.searchParams.get('results')!)
		: ['wins', 'losses'];
	const resultConditions = [
		...(resultFilter.includes('wins') ? [eq(matchData.team, matches.winner)] : []),
		...(resultFilter.includes('losses') ? [ne(matchData.team, matches.winner)] : [])
	];
	const versusFilter = url.searchParams.get('versus') === 'true';

	const matchingPlayerRows = await db
		.select({
			playerId: players.id,
			match_data: matchData,
			matches
		})
		.from(matches)
		.innerJoin(matchData, eq(matches.id, matchData.matchId))
		.innerJoin(accounts, eq(matchData.playerId, accounts.accountId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.where(
			and(
				inArray(players.id, playerFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(matches.gameMode, gameModeFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.role, roleFilter),
				inArray(accounts.smurf, smurfFilter),
				...dateFilters,
				...(resultConditions.length === 1 ? resultConditions : [])
			)
		)
		.orderBy(desc(matches.id));

	const rowsByMatch = matchingPlayerRows.reduce((map, row) => {
		const rows = map.get(row.matches.id) ?? [];
		rows.push(row);
		map.set(row.matches.id, rows);
		return map;
	}, new Map<number, typeof matchingPlayerRows>());
	const playerCompleteRowsByMatch = Array.from(rowsByMatch.values()).filter((rows) => {
			if (!hasPlayerFilter) return true;
			return new Set(rows.map((row) => row.playerId)).size === playerFilter.length;
		});
	const singlePlayerOpponentMatchIds = new Set<number>();
	if (versusFilter && hasPlayerFilter && playerFilter.length === 1) {
		const candidateMatchIds = playerCompleteRowsByMatch.map((rows) => rows[0].matches.id);
		const selectedTeamByMatch = new Map(
			playerCompleteRowsByMatch.map((rows) => [rows[0].matches.id, rows[0].match_data.team])
		);
		const opponentRows =
			candidateMatchIds.length > 0
				? await db
						.select({
							playerId: players.id,
							matchId: matchData.matchId,
							team: matchData.team
						})
						.from(matchData)
						.innerJoin(accounts, eq(matchData.playerId, accounts.accountId))
						.innerJoin(players, eq(accounts.owner, players.id))
						.where(
							and(
								inArray(matchData.matchId, candidateMatchIds),
								inArray(players.id, allPlayerIds),
								inArray(accounts.smurf, smurfFilter)
							)
						)
				: [];

		for (const row of opponentRows) {
			if (
				row.playerId !== playerFilter[0] &&
				row.team !== selectedTeamByMatch.get(row.matchId)
			) {
				singlePlayerOpponentMatchIds.add(row.matchId);
			}
		}
	}
	const qualifyingPlayerRows = playerCompleteRowsByMatch
		.filter((rows) => {
			if (!versusFilter) return true;
			if (hasPlayerFilter && playerFilter.length === 1) {
				return singlePlayerOpponentMatchIds.has(rows[0].matches.id);
			}
			return new Set(rows.map((row) => row.match_data.team)).size > 1;
		})
		.flat();
	const uniqueMatches = Array.from(
		new Map(qualifyingPlayerRows.map((row) => [row.matches.id, row.matches])).values()
	);
	const totalMatches = uniqueMatches.length;
	const matchArray = uniqueMatches.slice(pageNumber * 10, pageNumber * 10 + 10);
	const stats = calculateMatchStats(qualifyingPlayerRows, totalMatches);

	if (matchArray.length === 0) {
		return json({ matches: [], stats, totalMatches });
	}

	const matchBlockPromises = matchArray.map(async (match) => {
		const data = await db
			.select()
			.from(matchData)
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.innerJoin(players, eq(accounts.owner, players.id))
			.where(eq(matchData.matchId, match.id));

		const block: PlayerMatchData[] = data.map((player) => {
			const heroName = heroData.find((hero) => hero.id === player.match_data.heroId)?.name as
				| keyof typeof heroAbilities
				| undefined;
			const facets = heroName ? heroAbilities[heroName]?.facets || [] : [];

			return {
				...player.players,
				...player.accounts,
				...player.match_data,
				item0: itemMap.get(player.match_data.item0),
				item1: itemMap.get(player.match_data.item1),
				item2: itemMap.get(player.match_data.item2),
				item3: itemMap.get(player.match_data.item3),
				item4: itemMap.get(player.match_data.item4),
				item5: itemMap.get(player.match_data.item5),
				backpack0: itemMap.get(player.match_data.backpack0),
				backpack1: itemMap.get(player.match_data.backpack1),
				backpack2: itemMap.get(player.match_data.backpack2),
				itemNeutral: itemMap.get(player.match_data.itemNeutral),
				hero: heroMap.get(player.match_data.heroId),
				facets
			};
		});

		return block;
	});

	const matchBlocksCombined = await Promise.all(matchBlockPromises);
	const scorePlayerIds = Array.from(
		new Set(
			matchBlocksCombined
				.flatMap((block) => block.map((player) => player.owner))
				.filter((playerId): playerId is number => typeof playerId === 'number')
		)
	);
	const scoreHeroIds = Array.from(
		new Set(matchBlocksCombined.flatMap((block) => block.map((player) => player.heroId)))
	);
	const heroScoreRows =
		scorePlayerIds.length > 0 && scoreHeroIds.length > 0
			? await db
					.select({
						playerId: players.id,
						heroId: matchData.heroId,
						matchId: matchData.matchId,
						startTime: matches.startTime,
						winner: matches.winner,
						team: matchData.team,
						kills: matchData.kills,
						deaths: matchData.deaths,
						assists: matchData.assists,
						impact: matchData.impact
					})
					.from(matchData)
					.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
					.innerJoin(players, eq(players.id, accounts.owner))
					.innerJoin(matches, eq(matches.id, matchData.matchId))
					.where(
						and(
							inArray(players.id, scorePlayerIds),
							inArray(matchData.heroId, scoreHeroIds),
							gt(matches.duration, 900)
						)
					)
			: [];
	const scoreRowsByPlayer = new Map<number, typeof heroScoreRows>();
	for (const row of heroScoreRows) {
		const playerRows = scoreRowsByPlayer.get(row.playerId) ?? [];
		playerRows.push(row);
		scoreRowsByPlayer.set(row.playerId, playerRows);
	}

	const heroScoreByPlayerMatch = new Map<string, HeroScoreHistoryEntry>();
	for (const [playerId, playerRows] of scoreRowsByPlayer) {
		for (const [matchId, score] of getPlayerHeroScoreHistory(playerRows)) {
			heroScoreByPlayerMatch.set(`${playerId}:${matchId}`, score);
		}
	}

	const splitByTeam = (players: PlayerMatchData[]) => {
		const radiant: PlayerMatchData[] = [];
		const dire: PlayerMatchData[] = [];
		players.forEach((player: PlayerMatchData) => {
			if (player.team === 'radiant') {
				radiant.push(player);
			} else {
				dire.push(player);
			}
		});
		return { radiant, dire };
	};

	const matchBlocks = matchBlocksCombined.map((match) => {
		const matchData: MatchInfer = matchArray.find((data) => data.id === match[0]?.matchId)!;
		const scoredPlayers = match.map((player) => ({
			...player,
			heroScore:
				matchData.duration > 900
					? (heroScoreByPlayerMatch.get(`${player.owner}:${matchData.id}`) ?? null)
					: {
							matchNumber: null,
							scoreBefore: null,
							scoreAfter: null,
							scoreChange: null,
							becameCalibrated: false
						}
		}));
		const { radiant, dire } = splitByTeam(scoredPlayers);
		return { radiant, dire, matchData };
	});

	const matchBlocksSorted = matchBlocks.sort(
		(a, b) =>
			b.matchData.startTime + b.matchData.duration - (a.matchData.startTime + a.matchData.duration)
	);

	return json({ matches: matchBlocksSorted, stats, totalMatches });
};
