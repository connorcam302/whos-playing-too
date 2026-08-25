import { json, type RequestHandler } from '@sveltejs/kit';
import { and, desc, eq, gt, inArray, type InferSelectModel } from 'drizzle-orm';
import { heroAbilities } from '$lib/data/heroAbilities';
import { heroData } from '$lib/data/heroData';
import { heroMap } from '$lib/data/heroMap';
import { itemMap } from '$lib/data/itemMap';
import { db } from '$lib/server/database';
import { getPlayerHeroScoreHistory, type HeroScoreHistoryEntry } from '$lib/server/heroStats';
import { accounts, matchData, matches, players } from '$lib/server/schema';

type DotaAsset = { id: number; name: string; img: string };
type MatchDataInfer = InferSelectModel<typeof matchData>;
type MatchInfer = InferSelectModel<typeof matches>;
type AccountInfer = InferSelectModel<typeof accounts>;
type PlayerInfer = InferSelectModel<typeof players>;

type MatchPlayer = Omit<
	MatchDataInfer,
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
> &
	AccountInfer &
	PlayerInfer & {
		item0: DotaAsset | undefined;
		item1: DotaAsset | undefined;
		item2: DotaAsset | undefined;
		item3: DotaAsset | undefined;
		item4: DotaAsset | undefined;
		item5: DotaAsset | undefined;
		itemNeutral: DotaAsset | undefined;
		backpack0: DotaAsset | undefined;
		backpack1: DotaAsset | undefined;
		backpack2: DotaAsset | undefined;
		hero: DotaAsset | undefined;
		facets: (typeof heroAbilities)[keyof typeof heroAbilities]['facets'];
	};

const gameModes = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22];
const lobbies = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const roles = [1, 2, 3, 4, 5];

export const GET: RequestHandler = async () => {
	const recentMatches = await db
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
		.innerJoin(matchData, eq(matches.id, matchData.matchId))
		.innerJoin(accounts, eq(matchData.playerId, accounts.accountId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.where(
			and(
				inArray(matches.gameMode, gameModes),
				inArray(matches.lobby, lobbies),
				inArray(matchData.role, roles)
			)
		)
		.groupBy(matches.id)
		.orderBy(desc(matches.id))
		.limit(10);

	if (recentMatches.length === 0) {
		return json([], { headers: { 'cache-control': 'no-store, max-age=0' } });
	}

	const matchIds = recentMatches.map((match) => match.id);
	const playerRows = await db
		.select()
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.where(inArray(matchData.matchId, matchIds));

	const playersByMatch = new Map<number, MatchPlayer[]>();
	for (const row of playerRows) {
		const heroName = heroData.find((hero) => hero.id === row.match_data.heroId)?.name as
			| keyof typeof heroAbilities
			| undefined;
		const player: MatchPlayer = {
			...row.players,
			...row.accounts,
			...row.match_data,
			item0: itemMap.get(row.match_data.item0),
			item1: itemMap.get(row.match_data.item1),
			item2: itemMap.get(row.match_data.item2),
			item3: itemMap.get(row.match_data.item3),
			item4: itemMap.get(row.match_data.item4),
			item5: itemMap.get(row.match_data.item5),
			backpack0: itemMap.get(row.match_data.backpack0),
			backpack1: itemMap.get(row.match_data.backpack1),
			backpack2: itemMap.get(row.match_data.backpack2),
			itemNeutral: itemMap.get(row.match_data.itemNeutral),
			hero: heroMap.get(row.match_data.heroId),
			facets: heroName ? heroAbilities[heroName]?.facets || [] : []
		};
		const matchPlayers = playersByMatch.get(row.match_data.matchId) ?? [];
		matchPlayers.push(player);
		playersByMatch.set(row.match_data.matchId, matchPlayers);
	}

	const scorePlayerIds = Array.from(
		new Set(
			playerRows
				.map((row) => row.players.id)
				.filter((playerId): playerId is number => typeof playerId === 'number')
		)
	);
	const scoreHeroIds = Array.from(new Set(playerRows.map((row) => row.match_data.heroId)));
	const heroScoreRows = await db
		.select({
			playerId: players.id,
			heroId: matchData.heroId,
			role: matchData.role,
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
		);

	const scoreRowsByPlayer = new Map<number, typeof heroScoreRows>();
	for (const row of heroScoreRows) {
		const rows = scoreRowsByPlayer.get(row.playerId) ?? [];
		rows.push(row);
		scoreRowsByPlayer.set(row.playerId, rows);
	}

	const heroScoreByPlayerMatch = new Map<string, HeroScoreHistoryEntry>();
	for (const [playerId, rows] of scoreRowsByPlayer) {
		for (const [matchId, score] of getPlayerHeroScoreHistory(rows)) {
			heroScoreByPlayerMatch.set(`${playerId}:${matchId}`, score);
		}
	}

	const matchBlocks = recentMatches.map((match) => {
		const matchPlayers = playersByMatch.get(match.id) ?? [];
		const radiant = [];
		const dire = [];
		for (const player of matchPlayers) {
			const scoredPlayer = {
				...player,
				heroScore:
					match.duration > 900
						? (heroScoreByPlayerMatch.get(`${player.owner}:${match.id}`) ?? null)
						: {
								matchNumber: null,
								scoreBefore: null,
								scoreAfter: null,
								scoreChange: null,
								becameCalibrated: false
							}
			};
			if (player.team === 'radiant') radiant.push(scoredPlayer);
			else dire.push(scoredPlayer);
		}
		return { radiant, dire, matchData: match };
	});

	matchBlocks.sort(
		(a, b) =>
			b.matchData.startTime + b.matchData.duration -
			(a.matchData.startTime + a.matchData.duration)
	);

	return json(matchBlocks, { headers: { 'cache-control': 'no-store, max-age=0' } });
};
