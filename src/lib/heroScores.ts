const HERO_SCORE_MULTIPLIER = 10;
const SECONDS_PER_DAY = 60 * 60 * 24;

export const HERO_SCORE_MAX = 100 * HERO_SCORE_MULTIPLIER;
export const HERO_SCORE_RECENCY_HALF_LIFE_DAYS = 365 * 4;
export const HERO_SCORE_RECENT_PERFORMANCE_MATCHES = 20;
export const HERO_SCORE_HISTORICAL_PERFORMANCE_WEIGHT = 0.7;
export const HERO_SCORE_RECENT_PERFORMANCE_WEIGHT = 1 - HERO_SCORE_HISTORICAL_PERFORMANCE_WEIGHT;

const HERO_SCORE_RECENCY_HALF_LIFE_SECONDS = HERO_SCORE_RECENCY_HALF_LIFE_DAYS * SECONDS_PER_DAY;

export type HeroScoreInputs = {
	winRate: number;
	recentRate: number;
	avgImpact: number;
	kda: number;
	matches: number;
};

export type HeroScoreBreakdown = {
	score: number;
	sampleWeight: number;
	volumeScore: number;
	impactScore: number;
	kdaScore: number;
	contributions: {
		winRate: number;
		recentForm: number;
		impact: number;
		kda: number;
		volume: number;
	};
};

export const toWholeHeroScore = (score: number) => Math.round(score * HERO_SCORE_MULTIPLIER);

export const getHeroScoreSampleWeight = (matches: number) =>
	Math.min(1, Math.log(matches + 1) / Math.log(25));

export const getHeroScoreVolumeScore = (matches: number) =>
	Math.min(100, (Math.log(matches + 1) / Math.log(101)) * 100);

export const getHeroScoreRecencyWeight = (startTime: number, referenceTime: number) => {
	const age = Math.max(0, referenceTime - startTime);
	return 0.5 ** (age / HERO_SCORE_RECENCY_HALF_LIFE_SECONDS);
};

export const blendHeroScorePerformance = (historicalValue: number, recentValue: number) =>
	historicalValue * HERO_SCORE_HISTORICAL_PERFORMANCE_WEIGHT +
	recentValue * HERO_SCORE_RECENT_PERFORMANCE_WEIGHT;

export const getHeroScoreBreakdown = ({
	winRate,
	recentRate,
	avgImpact,
	kda,
	matches
}: HeroScoreInputs): HeroScoreBreakdown => {
	const sampleWeight = getHeroScoreSampleWeight(matches);
	const volumeScore = getHeroScoreVolumeScore(matches);
	const impactScore = Math.min(100, (avgImpact / 150) * 100);
	const kdaScore = Math.min(100, (kda / 6) * 100);
	const contributions = {
		winRate: winRate * 0.3 * sampleWeight * HERO_SCORE_MULTIPLIER,
		recentForm: recentRate * 0.1 * sampleWeight * HERO_SCORE_MULTIPLIER,
		impact: impactScore * 0.25 * sampleWeight * HERO_SCORE_MULTIPLIER,
		kda: kdaScore * 0.15 * sampleWeight * HERO_SCORE_MULTIPLIER,
		volume: volumeScore * 0.2 * HERO_SCORE_MULTIPLIER
	};
	const score = Math.round(
		contributions.winRate +
			contributions.recentForm +
			contributions.impact +
			contributions.kda +
			contributions.volume
	);

	return {
		score,
		sampleWeight,
		volumeScore,
		impactScore,
		kdaScore,
		contributions
	};
};

export const formatHeroScore = (score: number) =>
	new Intl.NumberFormat('en-GB', {
		maximumFractionDigits: 0
	}).format(score);
