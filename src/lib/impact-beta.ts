import calibration from './impact-beta-calibration.json';

export const IMPACT_BETA_VERSION = 'beta-3.3';

export type BetaImpactInput = {
	kills: number;
	deaths: number;
	assists: number;
	lastHits?: number | null;
	role: number;
	hero_id?: number;
	heroId?: number;
	hero?: { id: number };
	heroDamage?: number | null;
	towerDamage?: number | null;
	heroHealing?: number | null;
	hero_damage?: number | null;
	tower_damage?: number | null;
	hero_healing?: number | null;
	teamKills?: number | null;
	team?: string;
	isRadiant?: boolean;
	player_slot?: number;
};

export type BetaImpactContext = {
	radiant_score?: number;
	dire_score?: number;
	radiant?: readonly { kills: number }[];
	dire?: readonly { kills: number }[];
};

// Retain the original kill/assist coefficients and farming hero exceptions.
// Survival is now a modest multiplier; farming gets more weight for core roles.
const getRoleConfig = (role: number, heroId: number | undefined) => {
	if (role === 1)
		return {
			kill: 2.4,
			assist: 1.2,
			combatWeight: 0.475,
			farmWeight: 0.35,
			deathRate: 20,
			farmDivisor: [1, 89, 94, 48, 109].includes(heroId ?? 0) ? 25 : 20
		};
	if (role === 2)
		return {
			kill: 1.6,
			assist: 1.4,
			combatWeight: 0.65,
			farmWeight: 0.25,
			deathRate: 24,
			farmDivisor: [46, 113, 11].includes(heroId ?? 0) ? 23 : 18
		};
	if (role === 3)
		return {
			kill: 1.35,
			assist: 1.35,
			combatWeight: 0.65,
			farmWeight: 0.2,
			deathRate: 23,
			farmDivisor: 18
		};
	const adjustedSupport = [20, 105].includes(heroId ?? 0);
	return {
		kill: 0.65,
		assist: 1.35,
		combatWeight: adjustedSupport ? 0.7 : 0.55,
		farmWeight: 0,
		deathRate: 24,
		farmDivisor: 18
	};
};

const isValidStat = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value) && value >= 0;

export const getBetaImpact = (
	player: BetaImpactInput,
	durationSeconds: number,
	_context: BetaImpactContext = {},
	roleScales: readonly number[] = calibration.roleScales
) => {
	if (
		!Number.isFinite(durationSeconds) ||
		durationSeconds <= 0 ||
		!Number.isInteger(player.role) ||
		player.role < 1 ||
		player.role > 5 ||
		![player.kills, player.deaths, player.assists].every(isValidStat)
	)
		return null;

	const config = getRoleConfig(player.role, player.hero?.id ?? player.hero_id ?? player.heroId);
	if (config.farmWeight > 0 && !isValidStat(player.lastHits)) return null;
	const minutes = durationSeconds / 60;
	const combatRate = (player.kills * config.kill + player.assists * config.assist) / minutes;
	const combatRating = combatRate <= 1 ? combatRate ** 2 : 2 * combatRate - 1;
	// Restore the original quadratic tail above the unit combat rate. Keep this
	// exceptional contribution outside the optional-metric blend: recording more
	// kinds of contribution must not dilute the reward for an exceptional game.
	const exceptionalRating = Math.max(0, combatRate - 1) ** 2;
	// Disabled globally until team totals are consistently stored and backfilled.
	// Retain the context argument for callers, but never vary scores by coverage.
	const participation = null;
	const participationMultiplier = 1;
	const baseCombat = combatRating * config.combatWeight * 100 * participationMultiplier;
	const baseFarm =
		config.farmWeight > 0
			? ((player.lastHits! / minutes) ** 1.3 / config.farmDivisor) * config.farmWeight * 100
			: 0;

	const optionalMetrics = [
		{
			key: 'damage',
			label: 'Hero damage',
			value: player.heroDamage ?? player.hero_damage,
			reference: 600,
			// Raw damage reflects hero/AoE potential as well as useful contribution.
			// Keep it supporting evidence until hero-relative baselines are reliable.
			weight: 0.05
		},
		{
			key: 'objectives',
			label: 'Tower damage',
			value: player.towerDamage ?? player.tower_damage,
			reference: 100,
			weight: 0.15
		},
		{
			key: 'healing',
			label: 'Hero healing',
			value: player.heroHealing ?? player.hero_healing,
			reference: 150,
			weight: 0.1
		}
	] as const;
	const availableMetrics = optionalMetrics.filter((metric) => isValidStat(metric.value));
	// Missing metrics do not count as zero or earn free points. Redistribute their
	// share to the base combat/farm score; expose coverage alongside the result.
	const baseWeight = 1 - availableMetrics.reduce((sum, metric) => sum + metric.weight, 0);
	const scale = roleScales[player.role - 1];
	if (!Number.isFinite(scale) || scale <= 0) return null;
	const combat = baseCombat * baseWeight * scale;
	const exceptionalCombat =
		exceptionalRating * config.combatWeight * 100 * participationMultiplier * scale;
	const farming = baseFarm * baseWeight * scale;
	const contributions = availableMetrics.map((metric) => ({
		key: metric.key,
		label: metric.label,
		weight: metric.weight,
		value: (metric.value! / minutes / metric.reference) ** 0.7 * 100 * metric.weight * scale
	}));
	const earned =
		combat +
		exceptionalCombat +
		farming +
		contributions.reduce((sum, metric) => sum + metric.value, 0);
	// 0.85–1.15 multiplier: survival adjusts ALL earned contributions, never
	// creates points, and never ceases to matter just because combat is zero.
	const survivalMultiplier = 0.85 + 0.3 / (1 + (config.deathRate * player.deaths) / minutes);
	const survival = earned * (survivalMultiplier - 1);
	const total = earned + survival;
	if (!Number.isFinite(total)) return null;

	return {
		version: IMPACT_BETA_VERSION,
		impact: Math.round(total),
		combat,
		exceptionalCombat,
		farming,
		survival,
		survivalMultiplier,
		earnedSubtotal: earned,
		participation,
		participationMultiplier,
		scale,
		contributions,
		missingMetrics: optionalMetrics
			.filter((metric) => !isValidStat(metric.value))
			.map((metric) => metric.label),
		rows: [
			{ label: 'Combat contribution', value: combat, weight: config.combatWeight * baseWeight },
			...(exceptionalCombat > 0
				? [
						{
							label: 'Exceptional combat bonus',
							value: exceptionalCombat,
							weight: config.combatWeight
						}
					]
				: []),
			...(config.farmWeight > 0
				? [{ label: 'Farming', value: farming, weight: config.farmWeight * baseWeight }]
				: []),
			...contributions,
			{ label: 'Survival adjustment', value: survival, weight: survivalMultiplier - 1 }
		]
	};
};
