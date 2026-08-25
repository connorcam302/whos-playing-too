const HERO_SCORE_MULTIPLIER = 10;
const SECONDS_PER_DAY = 60 * 60 * 24;

export type HeroScoreConfig = {
	recencyHalfLifeDays: number;
	historicalEvidenceCap: number;
	recentFormRegressionFactor: number;
	volumeFullMatches: number;
	normalizeRolePerformance: boolean;
	recentInactivityHalfLifeDays: number;
	recentHalfLifeMatches: number;
	bayesianPriorMatches: number;
	confidencePriorMatches: number;
	impactMatchCap: number;
	uncertaintyPenaltyMax: number;
	neutralScore: number;
	spreadFactor: number;
	centeringOffset: number;
	historicalPerformanceWeight: number;
	performancePulseMax: number;
	performancePulseHalfLifeMatches: number;
	neutralWinRate: number;
	neutralImpact: number;
	neutralKda: number;
	winRateWeight: number;
	recentFormWeight: number;
	impactWeight: number;
	kdaWeight: number;
	volumeWeight: number;
};

export const HERO_SCORE_MAX = 100 * HERO_SCORE_MULTIPLIER;
export const HERO_SCORE_RECENCY_HALF_LIFE_DAYS = 365 * 4;
export const HERO_SCORE_HISTORICAL_EVIDENCE_CAP = 120;
export const HERO_SCORE_RECENT_FORM_REGRESSION_FACTOR = 0.5;
export const HERO_SCORE_VOLUME_FULL_MATCHES = 500;
export const HERO_SCORE_NORMALIZE_ROLE_PERFORMANCE = true;
export const HERO_SCORE_RECENT_INACTIVITY_HALF_LIFE_DAYS = 365;
export const HERO_SCORE_RECENT_HALF_LIFE_MATCHES = 10;
export const HERO_SCORE_RECENT_PERFORMANCE_MATCHES = 20;
export const HERO_SCORE_BAYESIAN_PRIOR_MATCHES = 20;
export const HERO_SCORE_CONFIDENCE_PRIOR_MATCHES = 10;
export const HERO_SCORE_IMPACT_MATCH_CAP = 300;
export const HERO_SCORE_UNCERTAINTY_PENALTY_MAX = 50;
export const HERO_SCORE_NEUTRAL = 500;
export const HERO_SCORE_SPREAD_FACTOR = 1;
export const HERO_SCORE_CENTERING_OFFSET = 50;
export const HERO_SCORE_HISTORICAL_PERFORMANCE_WEIGHT = 0.7;
export const HERO_SCORE_RECENT_PERFORMANCE_WEIGHT = 1 - HERO_SCORE_HISTORICAL_PERFORMANCE_WEIGHT;
export const HERO_SCORE_PERFORMANCE_PULSE_MAX = 15;
export const HERO_SCORE_PERFORMANCE_PULSE_HALF_LIFE_MATCHES = 5;
export const HERO_SCORE_NEUTRAL_WIN_RATE = 50;
export const HERO_SCORE_NEUTRAL_IMPACT = 75;
export const HERO_SCORE_NEUTRAL_KDA = 3;
export type HeroScorePrior = {
	winRate: number;
	impact: number;
	kda: number;
};

export type HeroScoreGroup = 'core' | 'support';

export const HERO_SCORE_GROUPS: HeroScoreGroup[] = ['core', 'support'];

export const HERO_SCORE_GROUP_PRIORS: Record<HeroScoreGroup, HeroScorePrior> = {
	core: { winRate: 51.4, impact: 81.9, kda: 3.27 },
	support: { winRate: 52.8, impact: 70.6, kda: 2.55 }
};

export const getHeroScoreGroup = (role: number): HeroScoreGroup => (role >= 4 ? 'support' : 'core');

export const getHeroScoreGroupName = (group: HeroScoreGroup) =>
	group === 'core' ? 'Core' : 'Support';

export const HERO_SCORE_WIN_RATE_WEIGHT = 0.3;
export const HERO_SCORE_RECENT_FORM_WEIGHT = 0.1;
export const HERO_SCORE_IMPACT_WEIGHT = 0.25;
export const HERO_SCORE_KDA_WEIGHT = 0.15;
export const HERO_SCORE_VOLUME_WEIGHT = 0.2;

export const DEFAULT_HERO_SCORE_CONFIG: HeroScoreConfig = {
	recencyHalfLifeDays: HERO_SCORE_RECENCY_HALF_LIFE_DAYS,
	historicalEvidenceCap: HERO_SCORE_HISTORICAL_EVIDENCE_CAP,
	recentFormRegressionFactor: HERO_SCORE_RECENT_FORM_REGRESSION_FACTOR,
	volumeFullMatches: HERO_SCORE_VOLUME_FULL_MATCHES,
	normalizeRolePerformance: HERO_SCORE_NORMALIZE_ROLE_PERFORMANCE,
	recentInactivityHalfLifeDays: HERO_SCORE_RECENT_INACTIVITY_HALF_LIFE_DAYS,
	recentHalfLifeMatches: HERO_SCORE_RECENT_HALF_LIFE_MATCHES,
	bayesianPriorMatches: HERO_SCORE_BAYESIAN_PRIOR_MATCHES,
	confidencePriorMatches: HERO_SCORE_CONFIDENCE_PRIOR_MATCHES,
	impactMatchCap: HERO_SCORE_IMPACT_MATCH_CAP,
	uncertaintyPenaltyMax: HERO_SCORE_UNCERTAINTY_PENALTY_MAX,
	neutralScore: HERO_SCORE_NEUTRAL,
	spreadFactor: HERO_SCORE_SPREAD_FACTOR,
	centeringOffset: HERO_SCORE_CENTERING_OFFSET,
	historicalPerformanceWeight: HERO_SCORE_HISTORICAL_PERFORMANCE_WEIGHT,
	performancePulseMax: HERO_SCORE_PERFORMANCE_PULSE_MAX,
	performancePulseHalfLifeMatches: HERO_SCORE_PERFORMANCE_PULSE_HALF_LIFE_MATCHES,
	neutralWinRate: HERO_SCORE_NEUTRAL_WIN_RATE,
	neutralImpact: HERO_SCORE_NEUTRAL_IMPACT,
	neutralKda: HERO_SCORE_NEUTRAL_KDA,
	winRateWeight: HERO_SCORE_WIN_RATE_WEIGHT,
	recentFormWeight: HERO_SCORE_RECENT_FORM_WEIGHT,
	impactWeight: HERO_SCORE_IMPACT_WEIGHT,
	kdaWeight: HERO_SCORE_KDA_WEIGHT,
	volumeWeight: HERO_SCORE_VOLUME_WEIGHT
};

export type HeroScoreInputs = {
	winRate: number;
	recentRate: number;
	avgImpact: number;
	kda: number;
	matches: number;
	effectiveMatches?: number;
	performancePulse?: number;
	prior?: HeroScorePrior;
};

export type HeroScoreBreakdown = {
	score: number;
	performanceScore: number;
	provenScore: number;
	spreadAdjustment: number;
	centeringAdjustment: number;
	sampleWeight: number;
	uncertaintyPenalty: number;
	volumeScore: number;
	impactScore: number;
	kdaScore: number;
	adjustedMetrics: {
		winRate: number;
		recentRate: number;
		avgImpact: number;
		normalizedImpact: number;
		kda: number;
	};
	contributions: {
		winRate: number;
		recentForm: number;
		impact: number;
		kda: number;
		volume: number;
		performancePulse: number;
		uncertainty: number;
		spread: number;
		centering: number;
	};
};

export type HeroScoreContributionKey = keyof HeroScoreBreakdown['contributions'];

export const toWholeHeroScore = (score: number) => Math.round(score * HERO_SCORE_MULTIPLIER);

export const getHeroScoreSampleWeight = (
	matches: number,
	_config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) => Math.min(1, Math.log(matches + 1) / Math.log(25));

export const getHeroScoreVolumeScore = (
	matches: number,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) =>
	Math.min(100, (Math.log(matches + 1) / Math.log(config.volumeFullMatches + 1)) * 100);

export const getHeroScoreAdjustedRecentRate = (
	recentRate: number,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) => 50 + (recentRate - 50) * config.recentFormRegressionFactor;

export const getHeroScoreRecencyWeight = (
	startTime: number,
	referenceTime: number,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) => {
	const age = Math.max(0, referenceTime - startTime);
	const halfLifeSeconds = config.recencyHalfLifeDays * SECONDS_PER_DAY;
	return 0.5 ** (age / halfLifeSeconds);
};

export const getHeroScoreEvidenceScale = (
	currentWeight: number,
	incomingWeight = 1,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) => {
	if (currentWeight <= 0 || !Number.isFinite(config.historicalEvidenceCap)) return 1;
	const availableWeight = Math.max(0, config.historicalEvidenceCap - incomingWeight);
	return Math.min(1, availableWeight / currentWeight);
};

export const decayHeroScoreValue = (
	value: number,
	neutralValue: number,
	fromTime: number,
	toTime: number,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) => neutralValue + (value - neutralValue) * getHeroScoreRecencyWeight(fromTime, toTime, config);

export const decayHeroScoreRecentValue = (
	value: number,
	neutralValue: number,
	fromTime: number,
	toTime: number,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) => {
	const recentConfig = {
		...config,
		recencyHalfLifeDays: config.recentInactivityHalfLifeDays
	};
	return decayHeroScoreValue(value, neutralValue, fromTime, toTime, recentConfig);
};

export const getHeroScoreGroupPrior = (roleOrGroup: number | HeroScoreGroup): HeroScorePrior =>
	HERO_SCORE_GROUP_PRIORS[
		typeof roleOrGroup === 'number' ? getHeroScoreGroup(roleOrGroup) : roleOrGroup
	];

export const blendHeroScorePerformance = (
	historicalValue: number,
	recentValue: number,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) =>
	historicalValue * config.historicalPerformanceWeight +
	recentValue * (1 - config.historicalPerformanceWeight);

export const getHeroScoreRecentAlpha = (config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG) =>
	1 - 0.5 ** (1 / config.recentHalfLifeMatches);

export const updateHeroScoreRecentAverage = (
	previousValue: number,
	currentValue: number,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) => previousValue + getHeroScoreRecentAlpha(config) * (currentValue - previousValue);

export const getHeroScorePerformancePulseDecay = (
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) => 0.5 ** (1 / config.performancePulseHalfLifeMatches);

export const getHeroScoreMatchPerformancePulse = (
	impact: number,
	kda: number,
	prior: HeroScorePrior,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) => {
	if (config.performancePulseMax <= 0) return 0;
	const normalizedImpact =
		prior.impact > 0
			? Math.min(impact, config.impactMatchCap) * (config.neutralImpact / prior.impact)
			: Math.min(impact, config.impactMatchCap);
	const impactDelta = Math.max(
		-1,
		Math.min(1, (normalizedImpact - config.neutralImpact) / config.neutralImpact)
	);
	const kdaDelta = Math.max(-1, Math.min(1, (kda - prior.kda) / prior.kda));
	const performanceWeight = config.impactWeight + config.kdaWeight;
	const impactShare = performanceWeight > 0 ? config.impactWeight / performanceWeight : 0.5;
	const kdaShare = performanceWeight > 0 ? config.kdaWeight / performanceWeight : 0.5;
	const performanceDelta = Math.max(
		-1,
		Math.min(1, impactDelta * impactShare + kdaDelta * kdaShare)
	);
	return performanceDelta * config.performancePulseMax;
};

export const updateHeroScorePerformancePulse = (
	previousPulse: number,
	impact: number,
	kda: number,
	prior: HeroScorePrior,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) =>
	Math.max(
		-config.performancePulseMax,
		Math.min(
			config.performancePulseMax,
			previousPulse * getHeroScorePerformancePulseDecay(config) +
				getHeroScoreMatchPerformancePulse(impact, kda, prior, config)
		)
	);

export const getBayesianHeroScoreValue = (
	value: number,
	matches: number,
	priorValue: number,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
) =>
	(value * matches + priorValue * config.bayesianPriorMatches) /
	(matches + config.bayesianPriorMatches);

export const getHeroMastery = (matches: number) =>
	Math.round(Math.min(1000, (Math.log(matches + 1) / Math.log(501)) * 1000));

export const getHeroScoreConfidenceLabel = (matches: number) => {
	if (matches < 10) return 'Stale';
	if (matches < 20) return 'Provisional';
	if (matches < 50) return 'Established';
	return 'High confidence';
};

export const getHeroScoreBreakdown = (
	{
		winRate,
		recentRate,
		avgImpact,
		kda,
		matches,
		effectiveMatches,
		performancePulse = 0,
		prior
	}: HeroScoreInputs,
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG
): HeroScoreBreakdown => {
	void effectiveMatches;
	void performancePulse;
	const sampleWeight = getHeroScoreSampleWeight(matches, config);
	const volumeScore = getHeroScoreVolumeScore(matches, config);
	const adjustedRecentRate = getHeroScoreAdjustedRecentRate(recentRate, config);
	const normalizedImpact =
		config.normalizeRolePerformance && prior?.impact
			? avgImpact * (config.neutralImpact / prior.impact)
			: avgImpact;
	const normalizedKda =
		config.normalizeRolePerformance && prior?.kda ? kda * (config.neutralKda / prior.kda) : kda;
	const impactScore = Math.min(100, (normalizedImpact / 150) * 100);
	const kdaScore = Math.min(100, (normalizedKda / 6) * 100);
	const contributions = {
		winRate: winRate * config.winRateWeight * sampleWeight * HERO_SCORE_MULTIPLIER,
		recentForm:
			adjustedRecentRate * config.recentFormWeight * sampleWeight * HERO_SCORE_MULTIPLIER,
		impact: impactScore * config.impactWeight * sampleWeight * HERO_SCORE_MULTIPLIER,
		kda: kdaScore * config.kdaWeight * sampleWeight * HERO_SCORE_MULTIPLIER,
		volume: volumeScore * config.volumeWeight * HERO_SCORE_MULTIPLIER,
		performancePulse: 0,
		uncertainty: 0,
		spread: 0,
		centering: 0
	};
	const performanceScore =
		contributions.winRate + contributions.recentForm + contributions.impact + contributions.kda;
	const score = Math.round(performanceScore + contributions.volume);

	return {
		score,
		performanceScore,
		provenScore: score,
		spreadAdjustment: 0,
		centeringAdjustment: 0,
		sampleWeight,
		uncertaintyPenalty: 0,
		volumeScore,
		impactScore,
		kdaScore,
		adjustedMetrics: {
			winRate,
			recentRate: adjustedRecentRate,
			avgImpact,
			normalizedImpact,
			kda: normalizedKda
		},
		contributions
	};
};

export const formatHeroScore = (score: number) =>
	new Intl.NumberFormat('en-GB', {
		maximumFractionDigits: 0
	}).format(score);
