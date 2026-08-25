import { and, desc, eq, gt, inArray, not, sql } from 'drizzle-orm';
import { evaluateHeroScores, type HeroScoreEvaluationRow } from '$lib/heroScoreEvaluation';
import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';

const visiblePlayerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(players.id, hiddenFromAggregatePlayerIds))
		: sql`true`;

const generateReport = async () => {
	const startedAt = performance.now();
	const rows: HeroScoreEvaluationRow[] = await db
		.select({
			heroId: matchData.heroId,
			heroName: heroes.name,
			matchId: matches.id,
			playerId: players.id,
			username: players.username,
			role: matchData.role,
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
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(and(gt(matches.duration, 900), visiblePlayerFilter()))
		.orderBy(desc(matches.startTime));
	const report = evaluateHeroScores(rows);

	return {
		...report,
		generationMs: Math.round(performance.now() - startedAt)
	};
};

export const load = () => ({
	report: generateReport()
});
