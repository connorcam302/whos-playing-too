import type { RequestHandler } from './$types';
import { db } from '$lib/server/database';
import { accounts, matchData, matches, players } from '$lib/server/schema';
import { desc, eq, sql, type InferSelectModel, and, inArray } from 'drizzle-orm';
import { getPlayers } from '$lib/server/db-functions';
import { json } from '@sveltejs/kit';
import { heroData } from '$lib/data/heroData';
import { heroAbilities } from '$lib/data/heroAbilities';
import { itemMap } from '$lib/data/itemMap';
import { heroMap } from '$lib/data/heroMap';

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

		const matchIds = await db
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
					inArray(accounts.smurf, smurfFilter)
				)
			)
			.groupBy(matches.id)
			.orderBy(desc(matches.id))
			.limit(20) // Only get exactly what we need
			.offset(pageNumber * 20); // Use proper offset for pagination

		if (matchIds.length === 0) {
			return json([]);
		}

		const allMatchData = await db
			.select()
			.from(matchData)
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.innerJoin(players, eq(accounts.owner, players.id))
			.where(inArray(matchData.matchId, matchIds.map(m => m.id)));

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
				const heroName = heroData.find((hero) => hero.id === player.match_data.heroId)?.name;
				const facets = heroAbilities[`${heroName}`]?.facets || [];
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
				b.matchData.startTime + b.matchData.duration - (a.matchData.startTime + a.matchData.duration)
		);

		return json(matchBlocksSorted);

	} catch (error) {
		console.error(`❌ API Request failed for /api/matches/all/profile/${params.id}`, error);
		throw error;
	}
};
