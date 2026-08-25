import { and, desc, eq, gt, inArray, not, sql } from 'drizzle-orm';
import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import { getHeroMmrRoleRankings, type HeroMmrPlayerRanking } from '$lib/server/heroMmr';
import type { HeroStatsRow } from '$lib/server/heroStats';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';

type HeroMatchRow = HeroStatsRow & {
	heroId: number;
};

type HeroMmrSummary = {
	id: number;
	name: string;
	img: string;
	matches: number;
	wins: number;
	losses: number;
	winRate: number;
	roleRankings: Record<number, HeroMmrPlayerRanking[]>;
};

const visiblePlayerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(players.id, hiddenFromAggregatePlayerIds))
		: sql`true`;

export const load = async () => {
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

	const rowsByHero = rows.reduce((map, row) => {
		const current = map.get(row.heroId) ?? [];
		current.push(row);
		map.set(row.heroId, current);
		return map;
	}, new Map<number, HeroMatchRow[]>());

	const heroSummaries: HeroMmrSummary[] = heroList
		.map((hero) => {
			const heroRows = rowsByHero.get(hero.id) ?? [];
			const wins = heroRows.filter((row) => row.team === row.winner).length;

			return {
				...hero,
				matches: heroRows.length,
				wins,
				losses: heroRows.length - wins,
				winRate: heroRows.length > 0 ? (wins / heroRows.length) * 100 : 0,
				roleRankings: getHeroMmrRoleRankings(heroRows)
			};
		})
		.sort((a, b) => {
			const bestMmrA = Math.max(
				...Object.values(a.roleRankings)
					.flat()
					.map((ranking) => ranking.mmr),
				Number.NEGATIVE_INFINITY
			);
			const bestMmrB = Math.max(
				...Object.values(b.roleRankings)
					.flat()
					.map((ranking) => ranking.mmr),
				Number.NEGATIVE_INFINITY
			);
			if (bestMmrB !== bestMmrA) return bestMmrB - bestMmrA;
			if (b.matches !== a.matches) return b.matches - a.matches;
			return a.name.localeCompare(b.name);
		});

	return {
		heroes: heroSummaries,
		totalMatches: rows.length,
		trackedHeroes: heroSummaries.filter((hero) => hero.matches > 0).length,
		ratedCombinations: heroSummaries.reduce(
			(total, hero) =>
				total +
				Object.values(hero.roleRankings).reduce((count, rankings) => count + rankings.length, 0),
			0
		)
	};
};
