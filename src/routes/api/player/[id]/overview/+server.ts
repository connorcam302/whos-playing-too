import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getPlayerAverageStats, getPlayerWinLoss } from '$lib/server/db-functions';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '$lib/server/database';
import { accounts, matchData, matches } from '$lib/server/schema';
import { heroMap } from '$lib/data/heroMap';
import { itemMap } from '$lib/data/itemMap';
import type { PlayerOverviewData } from '$lib/player-overview';

export const GET: RequestHandler = async ({ params }) => {
	const playerId = Number(params.id);
	if (!Number.isSafeInteger(playerId) || playerId <= 0) error(400, 'Invalid player');

	const [results, average, roleStats, recentMatches] = await Promise.all([
		getPlayerWinLoss(playerId, 14),
		getPlayerAverageStats(playerId, 14),
		db
			.select({
				role: matchData.role,
				matches: sql<number>`cast(count(*) as int)`,
				wins: sql<number>`cast(count(*) filter (where ${matchData.team} = ${matches.winner}) as int)`
			})
			.from(matchData)
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.where(
				and(
					eq(accounts.owner, playerId),
					gte(matches.startTime, Math.floor(Date.now() / 1000) - 14 * 86400)
				)
			)
			.groupBy(matchData.role),
		db
			.select({
				id: matches.id,
				startTime: matches.startTime,
				duration: matches.duration,
				winner: matches.winner,
				team: matchData.team,
				heroId: matchData.heroId,
				kills: matchData.kills,
				deaths: matchData.deaths,
				assists: matchData.assists,
				lastHits: matchData.lastHits,
				heroDamage: matchData.heroDamage,
				towerDamage: matchData.towerDamage,
				gpm: matchData.goldPerMin,
				xpm: matchData.xpPerMin,
				impact: matchData.impact,
				role: matchData.role,
				item0: matchData.item0,
				item1: matchData.item1,
				item2: matchData.item2,
				item3: matchData.item3,
				item4: matchData.item4,
				item5: matchData.item5,
				itemNeutral: matchData.itemNeutral
			})
			.from(matchData)
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.where(eq(accounts.owner, playerId))
			.orderBy(desc(matches.startTime), desc(matches.id))
			.limit(1)
	]);
	const latest = recentMatches[0];
	const overview: PlayerOverviewData = {
		wins: results.wins,
		losses: results.losses,
		roles: [1, 2, 3, 4, 5].map(
			(role) => roleStats.find((stat) => stat.role === role) ?? { role, matches: 0, wins: 0 }
		),
		average: average ?? null,
		latestMatch: latest
			? {
					...latest,
					lastHits: latest.lastHits ?? 0,
					won: latest.team === latest.winner,
					items: [
						latest.item0,
						latest.item1,
						latest.item2,
						latest.item3,
						latest.item4,
						latest.item5
					].map(
						(id) =>
							itemMap.get(id) ?? {
								id,
								name: id === 0 ? 'Empty' : 'Unknown item',
								img: itemMap.get(0)?.img ?? ''
							}
					),
					neutralItem: latest.itemNeutral ? (itemMap.get(latest.itemNeutral) ?? null) : null,
					hero: heroMap.get(latest.heroId) ?? { id: latest.heroId, name: 'Unknown hero', img: '' }
				}
			: null
	};

	return json(overview, { headers: { 'cache-control': 'no-store' } });
};
