import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';
import type { StackAnalysisRow } from '$lib/stack-analysis';
import { getHeroPlayerRankings, type HeroStatsRow } from '$lib/server/heroStats';
import { and, eq, gt, inArray, not, sql } from 'drizzle-orm';

const visiblePlayerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(players.id, hiddenFromAggregatePlayerIds))
		: sql`true`;

const cacheDuration = 5 * 60 * 1000;
let rowsCache: { expiresAt: number; rows: StackAnalysisRow[] } | undefined;
let rowsRequest: Promise<StackAnalysisRow[]> | undefined;

const loadStackAnalysisRows = async (): Promise<StackAnalysisRow[]> => {
	const rows = await db
		.select({
			playerId: players.id,
			username: players.username,
			smurf: accounts.smurf,
			matchId: matches.id,
			startTime: matches.startTime,
			duration: matches.duration,
			winner: matches.winner,
			team: matchData.team,
			role: matchData.role,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			heroDamage: matchData.heroDamage,
			towerDamage: matchData.towerDamage,
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

	const rowsByHeroRole = rows.reduce((groups, row) => {
		const key = `${row.heroId}:${row.role}`;
		const group = groups.get(key) ?? [];
		group.push(row);
		groups.set(key, group);
		return groups;
	}, new Map<string, typeof rows>());
	const heroScores = new Map<string, number>();
	for (const [heroRole, group] of rowsByHeroRole) {
		const rankingRows: HeroStatsRow[] = group.map(({ heroId: _heroId, matchId: _matchId, heroName: _heroName, heroImg: _heroImg, ...row }) => row);
		for (const ranking of getHeroPlayerRankings(rankingRows, true)) {
			heroScores.set(`${ranking.playerId}:${heroRole}`, ranking.score);
		}
	}

	const assignedHeroScores = new Set<string>();
	return rows.map(({ smurf: _smurf, duration: _duration, kills: _kills, deaths: _deaths, assists: _assists, impact: _impact, gpm: _gpm, xpm: _xpm, lastHits: _lastHits, heroDamage: _heroDamage, towerDamage: _towerDamage, ...row }) => {
		const scoreKey = `${row.playerId}:${row.heroId}:${row.role}`;
		const heroScore = assignedHeroScores.has(scoreKey) ? undefined : heroScores.get(scoreKey);
		assignedHeroScores.add(scoreKey);
		return { ...row, heroScore };
	});
};

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
