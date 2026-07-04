import { and, desc, eq, gt, inArray, not, sql } from 'drizzle-orm';
import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import {
	getHeroPlayerRankings,
	type HeroPlayerRanking,
	type HeroStatsRow
} from '$lib/server/heroStats';
import { getHeroOwnershipChanges, type OwnershipChange } from '$lib/server/heroOwnershipChanges';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';

type HeroMatchRow = HeroStatsRow & {
	heroId: number;
	matchId: number;
};

type HeroSummary = {
	id: number;
	name: string;
	img: string;
	matches: number;
	wins: number;
	losses: number;
	winRate: number;
	topPlayers: HeroPlayerRanking[];
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

	const rowsByHero = rows.reduce((map, row) => {
		const current = map.get(row.heroId) ?? [];
		current.push(row);
		map.set(row.heroId, current);
		return map;
	}, new Map<number, HeroMatchRow[]>());
	const ownershipChanges: OwnershipChange[] = await getHeroOwnershipChanges();

	const heroSummaries: HeroSummary[] = heroList
		.map((hero) => {
			const heroRows = rowsByHero.get(hero.id) ?? [];
			const wins = heroRows.filter((row) => row.team === row.winner).length;

			return {
				...hero,
				matches: heroRows.length,
				wins,
				losses: heroRows.length - wins,
				winRate: heroRows.length > 0 ? (wins / heroRows.length) * 100 : 0,
				topPlayers: getHeroPlayerRankings(heroRows)
			};
		})
		.sort((a, b) => {
			const bestScoreA = a.topPlayers[0]?.score ?? -1;
			const bestScoreB = b.topPlayers[0]?.score ?? -1;
			if (bestScoreB !== bestScoreA) return bestScoreB - bestScoreA;
			if (b.matches !== a.matches) return b.matches - a.matches;
			return a.name.localeCompare(b.name);
		});

	return {
		heroes: heroSummaries,
		ownershipChanges,
		totalMatches: rows.length,
		trackedHeroes: heroSummaries.filter((hero) => hero.matches > 0).length
	};
};
