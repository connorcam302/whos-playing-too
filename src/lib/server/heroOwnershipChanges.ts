import { and, desc, eq, gt, inArray, not, sql } from 'drizzle-orm';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import { db } from '$lib/server/database';
import {
	getHeroScoreGroupRankings,
	type HeroPlayerRanking,
	type HeroStatsRow
} from '$lib/server/heroStats';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';

type HeroMatchRow = HeroStatsRow & {
	heroId: number;
	matchId: number;
};

export type OwnershipChange = {
	hero: {
		id: number;
		name: string;
		img: string;
	};
	previousOwner: HeroPlayerRanking | null;
	currentOwner: HeroPlayerRanking;
	changeType: 'changed' | 'new';
};

export type OwnershipChanges = {
	best: OwnershipChange[];
	worst: OwnershipChange[];
};

type OwnershipMode = keyof OwnershipChanges;

const visiblePlayerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(players.id, hiddenFromAggregatePlayerIds))
		: sql`true`;

const groupRowsByHero = (rows: HeroMatchRow[]) =>
	rows.reduce((map, row) => {
		const current = map.get(row.heroId) ?? [];
		current.push(row);
		map.set(row.heroId, current);
		return map;
	}, new Map<number, HeroMatchRow[]>());

const getRecentMatchIds = (rows: HeroMatchRow[], limit: number) => {
	const matchIds: number[] = [];
	const seen = new Set<number>();

	for (const row of rows) {
		if (seen.has(row.matchId)) continue;
		seen.add(row.matchId);
		matchIds.push(row.matchId);
		if (matchIds.length === limit) break;
	}

	return new Set(matchIds);
};

const getChangesFromRows = (
	heroList: { id: number; name: string; img: string }[],
	rowsByHero: Map<number, HeroMatchRow[]>,
	previousRowsByHero: Map<number, HeroMatchRow[]>,
	mode: OwnershipMode
): OwnershipChange[] =>
	heroList
		.flatMap((hero): OwnershipChange[] => {
			const getRankings = (rows: HeroMatchRow[]) =>
				Object.values(getHeroScoreGroupRankings(rows))
					.flat()
					.sort((a, b) => b.score - a.score || b.matches - a.matches);
			const currentRankings = getRankings(rowsByHero.get(hero.id) ?? []);
			const previousRankings = getRankings(previousRowsByHero.get(hero.id) ?? []);
			const currentOwner =
				(mode === 'worst' ? currentRankings[currentRankings.length - 1] : currentRankings[0]) ??
				null;
			const previousOwner =
				(mode === 'worst' ? previousRankings[previousRankings.length - 1] : previousRankings[0]) ??
				null;

			if (!currentOwner) return [];
			if (
				currentOwner.playerId === previousOwner?.playerId &&
				currentOwner.scoreGroup === previousOwner.scoreGroup
			) {
				return [];
			}

			return [
				{
					hero,
					previousOwner,
					currentOwner,
					changeType: previousOwner ? 'changed' : 'new'
				}
			];
		})
		.sort((a, b) => {
			if (a.changeType !== b.changeType) return a.changeType === 'changed' ? -1 : 1;
			const scoreDeltaA = a.currentOwner.score - (a.previousOwner?.score ?? 0);
			const scoreDeltaB = b.currentOwner.score - (b.previousOwner?.score ?? 0);
			return mode === 'worst' ? scoreDeltaA - scoreDeltaB : scoreDeltaB - scoreDeltaA;
		});

export const getHeroOwnershipChanges = async (matchLimit = 5) => {
	const heroList = await db
		.select({
			id: heroes.id,
			name: heroes.name,
			img: heroes.img
		})
		.from(heroes);

	const rows: HeroMatchRow[] = await db
		.select({
			heroId: matchData.heroId,
			matchId: matches.id,
			playerId: players.id,
			username: players.username,
			smurf: accounts.smurf,
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
			towerDamage: matchData.towerDamage
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(players.id, accounts.owner))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(and(gt(matches.duration, 900), visiblePlayerFilter()))
		.orderBy(desc(matches.startTime));

	const rowsByHero = groupRowsByHero(rows);
	const recentMatchIds = getRecentMatchIds(rows, matchLimit);
	const previousRowsByHero = groupRowsByHero(
		rows.filter((row) => !recentMatchIds.has(row.matchId))
	);

	return {
		best: getChangesFromRows(heroList, rowsByHero, previousRowsByHero, 'best'),
		worst: getChangesFromRows(heroList, rowsByHero, previousRowsByHero, 'worst')
	} satisfies OwnershipChanges;
};
