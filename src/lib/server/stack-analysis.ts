import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';
import type { StackAnalysisRow } from '$lib/stack-analysis';
import { and, eq, gt, inArray, not, sql } from 'drizzle-orm';

const visiblePlayerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(players.id, hiddenFromAggregatePlayerIds))
		: sql`true`;

const cacheDuration = 5 * 60 * 1000;
let rowsCache: { expiresAt: number; rows: StackAnalysisRow[] } | undefined;
let rowsRequest: Promise<StackAnalysisRow[]> | undefined;

const loadStackAnalysisRows = async (): Promise<StackAnalysisRow[]> =>
	await db
		.select({
			playerId: players.id,
			username: players.username,
			matchId: matches.id,
			startTime: matches.startTime,
			winner: matches.winner,
			team: matchData.team,
			role: matchData.role,
			heroId: heroes.id,
			heroName: heroes.name,
			heroImg: heroes.img
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(players.id, accounts.owner))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(and(gt(matches.duration, 900), visiblePlayerFilter()));

export const getStackAnalysisRows = async (): Promise<StackAnalysisRow[]> => {
	if (rowsCache && rowsCache.expiresAt > Date.now()) return rowsCache.rows;
	if (rowsRequest) return rowsRequest;

	rowsRequest = loadStackAnalysisRows()
		.then((rows) => {
			rowsCache = { expiresAt: Date.now() + cacheDuration, rows };
			return rows;
		})
		.finally(() => {
			rowsRequest = undefined;
		});

	return rowsRequest;
};

export const getStackAnalysisData = async () => {
	const [allHeroes, rows] = await Promise.all([
		db
			.select({
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			})
			.from(heroes),
		getStackAnalysisRows()
	]);

	const playerList = Array.from(
		new Map(
			rows.map((row) => [row.playerId, { id: row.playerId, username: row.username }])
		).values()
	).sort((a, b) => a.username.localeCompare(b.username));
	const heroList = allHeroes.sort((a, b) => a.name.localeCompare(b.name));

	return {
		rows,
		playerList,
		heroList
	};
};
