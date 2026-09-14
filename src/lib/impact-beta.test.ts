import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBetaImpact, type BetaImpactInput } from './impact-beta';
import calibration from './impact-beta-calibration.json';

const player = (overrides: Partial<BetaImpactInput> = {}): BetaImpactInput => ({
	kills: 8,
	deaths: 4,
	assists: 16,
	lastHits: 240,
	role: 1,
	hero_id: 8,
	...overrides
});
const score = (input: Partial<BetaImpactInput> = {}, duration = 2400) =>
	getBetaImpact(player(input), duration)!;

test('exceptional combat keeps a quadratic reward without inflating low combat rates', () => {
	assert.equal(score({ kills: 8, assists: 16 }).exceptionalCombat, 0);
	const rare = {
		role: 1,
		heroId: 63,
		kills: 37,
		deaths: 1,
		assists: 12,
		lastHits: 215,
		heroDamage: 56087,
		towerDamage: 17424
	};
	const result = getBetaImpact(rare, 1769)!;
	// Real 37/1/12 match: legacy 629, beta 3 only 274. Preserve its exceptional tier.
	assert.ok(result.impact >= 500 && result.impact < 700);
	assert.ok(result.exceptionalCombat > 250);
	assert.equal(
		result.exceptionalCombat,
		getBetaImpact({ ...rare, heroHealing: 0 }, 1769)!.exceptionalCombat
	);
	const high = score({ kills: 30 });
	const higher = score({ kills: 40 });
	const highest = score({ kills: 50 });
	assert.ok(highest.impact - higher.impact > higher.impact - high.impact);
});

test('no standalone survival points for inactivity in any role', () => {
	for (let role = 1; role <= 5; role++)
		assert.equal(score({ role, kills: 0, assists: 0, deaths: 0, lastHits: 0 }).impact, 0);
});
test('survival can only adjust earned points by 15%, including noncombat contributions', () => {
	for (let role = 1; role <= 5; role++) {
		assert.ok(Math.abs(score({ role, deaths: 0 }).survivalMultiplier - 1.15) < 1e-10);
		assert.ok(score({ role, deaths: 1000 }).survivalMultiplier >= 0.85);
	}
	const farmer = { kills: 0, assists: 0, lastHits: 400 };
	assert.ok(score({ ...farmer, deaths: 0 }).impact > score({ ...farmer, deaths: 10 }).impact);
	assert.ok(score({ ...farmer, deaths: 0 }).impact >= 30);
	const tower = { role: 5, kills: 0, assists: 0, lastHits: 0, towerDamage: 8000 };
	assert.ok(score({ ...tower, deaths: 0 }).impact > score({ ...tower, deaths: 10 }).impact);
});
test('the 0/0/26 support no longer gets a survival-dominated S++', () => {
	const alive = score({ role: 5, kills: 0, assists: 26, deaths: 0 });
	const deaths = score({ role: 5, kills: 0, assists: 26, deaths: 5 });
	assert.ok(alive.impact < 150);
	assert.ok(alive.impact - deaths.impact < 30);
	assert.ok(alive.survival < alive.combat * 0.16);
});
test('team data never changes scores while participation is disabled', () => {
	for (let role = 1; role <= 5; role++) {
		const baseline = score({ role });
		for (const teamKills of [0, 1, 24, 30, 60, 100, null])
			assert.deepEqual(score({ role, teamKills }), baseline);
		for (const team of ['radiant', 'dire']) {
			for (const count of [2, 5]) {
				assert.deepEqual(
					getBetaImpact(player({ role, team }), 2400, {
						radiant_score: 30,
						dire_score: 60,
						radiant: Array.from({ length: count }, () => ({ kills: 10 })),
						dire: Array.from({ length: count }, () => ({ kills: 10 }))
					}),
					baseline
				);
			}
		}
		assert.equal(baseline.participationMultiplier, 1);
		assert.equal(baseline.participation, null);
	}
});
test('optional damage, objectives and healing count, while missing stays distinct from zero', () => {
	for (const field of ['heroDamage', 'towerDamage', 'heroHealing']) {
		assert.ok(score({ [field]: 40000 }).impact > score({ [field]: 1000 }).impact);
		assert.deepEqual(score({ [field]: null }), score());
		assert.equal(score({ [field]: 0 }).contributions.length, 1);
		assert.equal(score().contributions.length, 0);
	}
});
test('raw damage has modest influence while objectives retain separate credit', () => {
	for (let role = 1; role <= 5; role++) {
		const singleTarget = score({ role, heroDamage: 30000, towerDamage: 4000 });
		const aoe = score({ role, heroDamage: 60000, towerDamage: 4000 });
		assert.ok(aoe.impact > singleTarget.impact);
		assert.ok(aoe.impact - singleTarget.impact < 10);
		assert.equal(aoe.exceptionalCombat, singleTarget.exceptionalCombat);
		assert.equal(
			aoe.contributions.find((row) => row.key === 'objectives')!.value,
			singleTarget.contributions.find((row) => row.key === 'objectives')!.value
		);
	}
	const objectives = score({ heroDamage: 24000, towerDamage: 4000 });
	const damage = objectives.contributions.find((row) => row.key === 'damage')!.value;
	const towers = objectives.contributions.find((row) => row.key === 'objectives')!.value;
	assert.ok(Math.abs(towers - 3 * damage) < 1e-9);
});
test('API aliases and team identification agree with canonical inputs', () => {
	const a = score({ heroDamage: 30000, towerDamage: 5000, heroHealing: 1000, teamKills: 40 });
	const b = getBetaImpact(
		player({ hero_damage: 30000, tower_damage: 5000, hero_healing: 1000, player_slot: 128 }),
		2400,
		{ dire_score: 40 }
	)!;
	assert.deepEqual(a, b);
	for (const [role, heroId] of [
		[1, 1],
		[2, 46],
		[4, 20]
	]) {
		assert.deepEqual(
			score({ role, hero_id: heroId }),
			score({ role, hero_id: undefined, hero: { id: heroId } })
		);
	}
});
test('scores and farming remain uncapped, even beyond 1000', () => {
	for (let role = 1; role <= 5; role++) {
		assert.ok(score({ role, kills: 1000 }).impact > 1000);
		assert.ok(score({ role, kills: 2000 }).impact > score({ role, kills: 1000 }).impact);
	}
	assert.ok(score({ lastHits: 10000 }).impact > score({ lastHits: 5000 }).impact);
});
test('more contributions never hurt, more deaths never help, equal rates remain equal', () => {
	for (let role = 1; role <= 5; role++) {
		const base = score({ role });
		for (const changes of [{ kills: 12 }, { assists: 24 }, { lastHits: 400 }])
			assert.ok(score({ role, ...changes }).impact >= base.impact);
		assert.ok(score({ role, deaths: 8 }).impact <= base.impact);
	}
	assert.deepEqual(score(), score({ kills: 16, deaths: 8, assists: 32, lastHits: 480 }, 4800));
});
test('invalid required data and numeric overflow yield unavailable', () => {
	for (const duration of [0, -1, NaN, Infinity])
		assert.equal(getBetaImpact(player(), duration), null);
	for (const role of [0, 6, 1.5, NaN]) assert.equal(getBetaImpact(player({ role }), 2400), null);
	for (const stat of ['kills', 'deaths', 'assists', 'lastHits'])
		for (const value of [null, undefined, -1, NaN, Infinity]) {
			assert.equal(getBetaImpact({ ...player(), [stat]: value }, 2400), null);
		}
	assert.notEqual(getBetaImpact(player(), 599), null);
	assert.equal(getBetaImpact(player({ kills: Number.MAX_VALUE }), 2400), null);
	assert.notEqual(getBetaImpact(player({ role: 5, lastHits: null }), 2400), null);
});
test('frozen role calibration scales all breakdown components consistently', () => {
	for (let role = 1; role <= 5; role++) {
		const input = player({ role, heroDamage: 20000, towerDamage: 3000 });
		const raw = getBetaImpact(input, 2400, {}, [1, 1, 1, 1, 1])!;
		const calibrated = getBetaImpact(input, 2400)!;
		assert.equal(calibrated.scale, calibration.roleScales[role - 1]);
		assert.ok(Math.abs(calibrated.combat - raw.combat * calibrated.scale) < 1e-9);
		assert.equal(
			calibrated.impact,
			Math.round(calibrated.rows.reduce((sum, row) => sum + row.value, 0))
		);
	}
});
