import type { RequestHandler } from './$types';
import { db } from '$lib/server/database';
import { accounts, matchData, matches, players } from '$lib/server/schema';
import { desc, eq, sql, type InferSelectModel, and, inArray, gte, lte } from 'drizzle-orm';
import { getPlayers } from '$lib/server/db-functions';
import { json } from '@sveltejs/kit';
import { heroData } from '$lib/data/heroData';
import { heroAbilities } from '$lib/data/heroAbilities';
import { itemMap } from '$lib/data/itemMap';
import { heroMap } from '$lib/data/heroMap';
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
		| 'itemzinc'
		| 'backpack0'
		| 'backpack1'
		| 'backpack2'
		| 'hero'
		? DotaAsset
		: MatchDataInfer[K];
};

type PlayerMatchData = MatchData & AccountInfer & PlayerInfer;

const getDateRangeBounds = (dateRange: string | null): DateRangeBounds => {
	if (!dateRange || dateRange === 'all') {
		return { start: null, end: null };
	}

	if (dateRange.startsWith('patch-')) {
		return getDotaPatchRangeBounds(dateRange.replace('patch-', ''));
	}

	const preset = DATE_RANGE_PRESETS.find((range) => range.value === dateRange);
	if (!preset?.amount || !preset.unit) {
		return { start: null, end: null };
	}

	return {
		start: dayjs().subtract(preset.amount, preset.unit).startOf('day').unix(),
		end: null
	};
};

const getDateFilters = (bounds: DateRangeBounds) => {
	const filters = [];
	if (bounds.start !== null) {
		filters.push(gte(matches.startTime, bounds.start));
	}
	if (bounds.end !== null) {
		filters.push(lte(matches.startTime, bounds.end));
	}
	return filters;
};

const calculateProfileStats = (rows: any[], profilePlayerId: number) => {
	const profileRows = rows
		.filter((row) => row.players.id === profilePlayerId)
		.map((row) => ({
			...row.match_data,
			match: row.matches,
			hero: heroMap.get(row.match_data.heroId)
		}));

	const matchCount = profileRows.length;
	const wins = profileRows.filter((row) => row.team === row.match.winner).length;
	const losses = matchCount - wins;
	const totals = profileRows.reduce(
		(acc, row) => {
			acc.kills += row.kills ?? 0;
			acc.deaths += row.deaths ?? 0;
			acc.assists += row.assists ?? 0;
			acc.impact += row.impact ?? 0;
			acc.gpm += row.goldPerMin ?? 0;
			acc.xpm += row.xpPerMin ?? 0;
			acc.lastHits += row.lastHits ?? 0;
			acc.heroDamage += row.heroDamage ?? 0;
			acc.towerDamage += row.towerDamage ?? 0;
			acc.duration += row.match.duration ?? 0;
			return acc;
		},
		{
			kills: 0,
			deaths: 0,
			assists: 0,
			impact: 0,
			gpm: 0,
			xpm: 0,
			lastHits: 0,
			heroDamage: 0,
			towerDamage: 0,
			duration: 0
		}
	);
	const divide = (value: number) => (matchCount > 0 ? value / matchCount : 0);
	const roleCounts = [1, 2, 3, 4, 5].map((role) => {
		const roleRows = profileRows.filter((row) => row.role === role);
		const roleWins = roleRows.filter((row) => row.team === row.match.winner).length;
		const roleImpact =
			roleRows.length > 0
				? roleRows.reduce((sum, row) => sum + (row.impact ?? 0), 0) / roleRows.length
				: 0;
		return {
			role,
			count: roleRows.length,
			wins: roleWins,
			losses: roleRows.length - roleWins,
			winRate: roleRows.length > 0 ? (roleWins / roleRows.length) * 100 : 0,
			impact: roleImpact
		};
	});
	const heroCountMap = profileRows.reduce(
		(map: Map<number, { count: number; wins: number; hero: DotaAsset | undefined }>, row) => {
			const current = map.get(row.heroId) ?? {
				count: 0,
				wins: 0,
				hero: row.hero
			};
			current.count += 1;
			if (row.team === row.match.winner) current.wins += 1;
			map.set(row.heroId, current);
			return map;
		},
		new Map<number, { count: number; wins: number; hero: DotaAsset | undefined }>()
	);
	const heroCounts = Array.from(heroCountMap.values())
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);
	const timeline = Array.from(
		profileRows
			.slice()
			.sort((a, b) => a.match.startTime - b.match.startTime)
			.reduce((map, row) => {
				const key = dayjs.unix(row.match.startTime).format('YYYY-MM-DD');
				const current = map.get(key) ?? { date: key, wins: 0, losses: 0 };
				if (row.team === row.match.winner) current.wins += 1;
				else current.losses += 1;
				map.set(key, current);
				return map;
			}, new Map<string, { date: string; wins: number; losses: number }>())
			.values()
	).slice(-14);

	return {
		matchCount,
		wins,
		losses,
		winRate: matchCount > 0 ? (wins / matchCount) * 100 : 0,
		averages: {
			kills: divide(totals.kills),
			deaths: divide(totals.deaths),
			assists: divide(totals.assists),
			impact: divide(totals.impact),
			gpm: divide(totals.gpm),
			xpm: divide(totals.xpm),
			lastHits: divide(totals.lastHits),
			heroDamage: divide(totals.heroDamage),
			towerDamage: divide(totals.towerDamage),
			duration: divide(totals.duration)
		},
		roleCounts,
		heroCounts,
		timeline
	};
};

export const GET: RequestHandler = async ({ url, params }) => {
	try {
		const allPlayers = await getPlayers();
		const allPlayerIds = allPlayers.map((player) => player.id);

		let playerFilter: number[] = allPlayerIds;
		if (url.searchParams.has('players')) {
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

		const allGameModes = [
			0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22
		];
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
		const dateBounds = getDateRangeBounds(url.searchParams.get('dateRange'));
		const dateFilters = getDateFilters(dateBounds);

		const smurfFilter: boolean[] = [false];
		if (url.searchParams.has('smurf')) {
			smurfFilter.push(Boolean(JSON.parse(url.searchParams.get('smurf')!)));
		}
		const resultFilter: string[] = url.searchParams.has('results')
			? JSON.parse(url.searchParams.get('results')!)
			: ['wins', 'losses'];

		const allMatchedIds = await db
			.select({
				id: matches.id,
				winner: matches.winner,
				duration: matches.duration,
				startTime: matches.startTime,
				gameMode: matches.gameMode,
				lobby: matches.lobby,
				sequenceNumber: matches.sequenceNumber
			})
			.from(matches)
			.leftJoin(matchData, eq(matches.id, matchData.matchId))
			.leftJoin(accounts, eq(matchData.playerId, accounts.accountId))
			.leftJoin(players, eq(accounts.owner, players.id))
			.where(
				and(
					inArray(players.id, playerFilter),
					inArray(matchData.heroId, heroFilter),
					inArray(matches.gameMode, gameModeFilter),
					inArray(matches.lobby, lobbyFilter),
					inArray(matchData.role, roleFilter),
					inArray(accounts.smurf, smurfFilter),
					...dateFilters
				)
			)
			.groupBy(matches.id)
			.having(sql`count(distinct ${players.id}) = ${playerFilter.length}`)
			.orderBy(desc(matches.id));

		const profileOutcomes =
			allMatchedIds.length > 0
				? await db
						.select({
							matchId: matchData.matchId,
							team: matchData.team,
							winner: matches.winner
						})
						.from(matchData)
						.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
						.innerJoin(players, eq(accounts.owner, players.id))
						.innerJoin(matches, eq(matches.id, matchData.matchId))
						.where(
							and(
								eq(players.id, Number(params.id)),
								inArray(
									matchData.matchId,
									allMatchedIds.map((match) => match.id)
								)
							)
						)
				: [];
		const outcomeByMatchId = new Map(profileOutcomes.map((outcome) => [outcome.matchId, outcome]));
		const filteredMatchIds = allMatchedIds.filter((match) => {
			const outcome = outcomeByMatchId.get(match.id);
			const isWin = outcome?.team === outcome?.winner;
			return (isWin && resultFilter.includes('wins')) || (!isWin && resultFilter.includes('losses'));
		});
		const matchIds = filteredMatchIds.slice(pageNumber * 20, pageNumber * 20 + 20);

		if (matchIds.length === 0) {
			return json({
				matches: [],
				stats: calculateProfileStats([], Number(params.id)),
				totalMatches: filteredMatchIds.length
			});
		}

		const allMatchData = await db
			.select()
			.from(matchData)
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.innerJoin(players, eq(accounts.owner, players.id))
			.where(
				inArray(
					matchData.matchId,
					matchIds.map((m) => m.id)
				)
			);
		const allFilteredMatchData = await db
			.select()
			.from(matchData)
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.innerJoin(players, eq(accounts.owner, players.id))
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.where(
				inArray(
					matchData.matchId,
					filteredMatchIds.map((m) => m.id)
				)
			);

		const processingStartTime = Date.now();

		// Group match data by match ID for faster lookup
		const matchDataByMatchId = new Map<number, any[]>();
		allMatchData.forEach((data) => {
			const matchId = data.match_data.matchId;
			if (!matchDataByMatchId.has(matchId)) {
				matchDataByMatchId.set(matchId, []);
			}
			matchDataByMatchId.get(matchId)!.push(data);
		});

		// Process matches
		const matchBlocks = matchIds.map((match) => {
			const matchPlayerData = matchDataByMatchId.get(match.id) || [];

			const processedPlayers: PlayerMatchData[] = matchPlayerData.map((player) => {
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

			// Split by team
			const radiant: PlayerMatchData[] = [];
			const dire: PlayerMatchData[] = [];
			processedPlayers.forEach((player: PlayerMatchData) => {
				if (player.team === 'radiant') {
					radiant.push(player);
				} else {
					dire.push(player);
				}
			});

			const player = processedPlayers.find((p) => p.owner === Number(params.id))!;

			return {
				radiant,
				dire,
				matchData: match,
				player
			};
		});

		// Sort by match completion time
		const matchBlocksSorted = matchBlocks.sort(
			(a, b) =>
				b.matchData.startTime +
				b.matchData.duration -
				(a.matchData.startTime + a.matchData.duration)
		);

		return json({
			matches: matchBlocksSorted,
			stats: calculateProfileStats(allFilteredMatchData, Number(params.id)),
			totalMatches: filteredMatchIds.length
		});
	} catch (error) {
		console.error(`❌ API Request failed for /api/matches/all/profile/${params.id}`, error);
		throw error;
	}
};
