import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBetaImpact } from '../impact-beta';
import { getHeroScoreBreakdown, getHeroScoreGroupPrior } from '../heroScores';
import { withBetaHeroImpact } from '../heroScoreImpact';
import {
	getHeroPlayerRankings,
	getHeroScoreGroupRankings,
	getPlayerHeroScoreHistory,
	type HeroStatsRow,
	type HeroScoreHistoryRow
} from './heroStats';

const row = (
	matchId: number,
	extra: Partial<HeroStatsRow & HeroScoreHistoryRow> = {}
): HeroStatsRow & HeroScoreHistoryRow => ({
	playerId: 1,
	username: 'Player',
	smurf: false,
	heroId: 63,
	matchId,
	startTime: 1700000000 + matchId * 3600,
	duration: 2400,
	winner: 'radiant',
	team: 'radiant',
	role: 1,
	kills: 10,
	deaths: 5,
	assists: 15,
	impact: 999,
	gpm: 500,
	xpm: 600,
	lastHits: 250,
	heroDamage: 30000,
	towerDamage: 5000,
	...extra
});
const games = Array.from({ length: 10 }, (_, index) => row(index + 1));

test('rankings and calibrated history use beta impact rather than stored impact', () => {
	const betaImpact = getBetaImpact(games[0], games[0].duration)!.impact;
	const expectedScore = getHeroScoreBreakdown({
		winRate: 100,
		recentRate: 100,
		avgImpact: betaImpact,
		kda: 5,
		matches: 10,
		effectiveMatches: 10,
		performancePulse: 0,
		prior: getHeroScoreGroupPrior('core')
	}).score;
	const [ranking] = getHeroPlayerRankings(games);
	assert.equal(ranking.avgImpact, betaImpact);
	assert.ok(Math.abs(ranking.scoreAvgImpact - betaImpact) < 0.000001);
	assert.equal(ranking.score, expectedScore);
	assert.equal(getPlayerHeroScoreHistory(games).get(10)?.scoreAfter, expectedScore);
	const changedLegacyImpact = games.map((game) => ({ ...game, impact: 0 }));
	assert.deepEqual(
		getHeroScoreGroupRankings(changedLegacyImpact),
		getHeroScoreGroupRankings(games)
	);
	assert.deepEqual(
		getPlayerHeroScoreHistory(changedLegacyImpact),
		getPlayerHeroScoreHistory(games)
	);
	assert.equal(games[0].impact, 999);
});

test('beta objectives, duration and hero farming exceptions feed hero scores', () => {
	const base = row(1, { heroId: 2, towerDamage: 0 });
	const [withoutObjectives, withObjectives, longerGame, farmException] = withBetaHeroImpact([
		base,
		{ ...base, towerDamage: 20000 },
		{ ...base, duration: 3600 },
		{ ...base, heroId: 1 }
	]);
	assert.ok(withObjectives.impact > withoutObjectives.impact);
	assert.ok(longerGame.impact < withoutObjectives.impact);
	assert.ok(farmException.impact < withoutObjectives.impact);
	assert.equal(
		getHeroPlayerRankings([{ ...base, towerDamage: 20000 }], true)[0].avgImpact,
		withObjectives.impact
	);
});

test('unavailable beta inputs cannot advance calibration; support last hits remain optional', () => {
	const invalidGames = [
		row(11, { lastHits: null }),
		row(12, { role: 0 }),
		row(13, { duration: 0 }),
		row(14, { kills: NaN })
	];
	assert.deepEqual(getHeroPlayerRankings([...games.slice(0, 9), ...invalidGames]), []);
	assert.deepEqual(getPlayerHeroScoreHistory(invalidGames), new Map());
	assert.deepEqual(
		getHeroPlayerRankings([...games, ...invalidGames]),
		getHeroPlayerRankings(games)
	);
	const support = row(15, { role: 5, lastHits: null, heroDamage: null, towerDamage: null });
	assert.equal(getHeroPlayerRankings([support], true)[0].matches, 1);
	assert.equal(getPlayerHeroScoreHistory([support]).get(15)?.matchNumber, 1);
});

test('restored main and smurf account samples are still combined', () => {
	const mixedGames = games.map((game, index) => ({ ...game, smurf: index % 2 === 0 }));
	assert.equal(getHeroPlayerRankings(mixedGames)[0].matches, 10);
	assert.equal(getPlayerHeroScoreHistory(mixedGames).get(10)?.becameCalibrated, true);
});
