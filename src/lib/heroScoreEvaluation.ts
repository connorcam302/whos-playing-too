import {
	DEFAULT_HERO_SCORE_CONFIG,
	HERO_SCORE_GROUP_PRIORS,
	HERO_SCORE_GROUPS,
	HERO_SCORE_MAX,
	HERO_SCORE_RECENT_PERFORMANCE_MATCHES,
	blendHeroScorePerformance,
	getHeroScoreBreakdown,
	getHeroScoreAdjustedRecentRate,
	getHeroScoreConfidenceLabel,
	getHeroScoreEvidenceScale,
	getHeroScoreGroup,
	getHeroScoreGroupName,
	getHeroScoreGroupPrior,
	getHeroScoreRecencyWeight,
	getHeroScoreSampleWeight,
	getHeroScoreVolumeScore,
	type HeroScoreBreakdown,
	type HeroScoreConfig,
	type HeroScoreGroup,
	type HeroScorePrior
} from '$lib/heroScores';

const SECONDS_PER_DAY = 60 * 60 * 24;
const MINIMUM_SCORED_MATCHES = 10;
const PREDICTION_WINDOW = 10;
const HOLDOUT_FRACTION = 0.25;

export type HeroScoreEvaluationRow = {
	heroId: number;
	heroName: string;
	matchId: number;
	playerId: number;
	username: string;
	role: number;
	startTime: number;
	winner: string;
	team: string;
	kills: number;
	deaths: number;
	assists: number;
	impact: number;
};

type ReplayState = {
	scoreGroup: HeroScoreGroup;
	matches: number;
	scoreWeight: number;
	scoreWins: number;
	scoreKills: number;
	scoreDeaths: number;
	scoreAssists: number;
	scoreImpact: number;
	recentResults: boolean[];
	recentPerformance: Array<{
		isWin: boolean;
		kills: number;
		deaths: number;
		assists: number;
		impact: number;
	}>;
	lastPlayed: number;
	breakdown: HeroScoreBreakdown | null;
};

type ScoreSnapshot = {
	row: HeroScoreEvaluationRow;
	matches: number;
	effectiveMatches: number;
	breakdown: HeroScoreBreakdown;
	previousMatchBreakdown: HeroScoreBreakdown | null;
	preMatchBreakdown: HeroScoreBreakdown | null;
};

type PredictionPair = {
	x: number;
	y: number;
	scoreGroup: HeroScoreGroup;
	heroId: number;
	heroName: string;
	confidence: string;
};

export type HeroScoreInterval = {
	value: number | null;
	lower: number | null;
	upper: number | null;
};

export type HeroScoreAnomaly = {
	matchId: number;
	heroName: string;
	scoreGroup: HeroScoreGroup;
	username: string;
	result: 'Win' | 'Loss';
	matchNumber: number;
	scoreBefore: number;
	scoreAfter: number;
	scoreChange: number;
	inactivityChange: number;
	performanceChange: number;
	volumeChange: number;
};

export type HeroScoreConfidenceSummary = {
	label: string;
	count: number;
	average: number;
	standardDeviation: number;
	minimum: number;
	maximum: number;
	predictiveSamples: number;
	predictiveCorrelation: number | null;
};

export type HeroScorePredictiveCohort = {
	id: number | HeroScoreGroup;
	label: string;
	ratings: number;
	averageScore: number;
	scoreSpread: number;
	predictiveSamples: number;
	predictiveCorrelation: number | null;
	quartileLift: number | null;
};

export type HeroScorePriorSummary = {
	scoreGroup: HeroScoreGroup;
	matches: number;
	configured: HeroScorePrior;
	observed: HeroScorePrior;
};

export type HeroScoreQuartile = {
	label: string;
	winRate: number;
	lower: number;
	upper: number;
	samples: number;
};

export type HeroScoreEvaluationSummary = {
	config: HeroScoreConfig;
	calibratedRatings: number;
	scoreMean: number;
	scoreStandardDeviation: number;
	percentiles: { p10: number; p25: number; p50: number; p75: number; p90: number };
	lowerClampCount: number;
	upperClampCount: number;
	counterintuitiveCount: number;
	counterintuitiveRate: number;
	predictiveSamples: number;
	predictiveCorrelation: number | null;
	predictiveCorrelationInterval: HeroScoreInterval;
	predictiveQuartiles: HeroScoreQuartile[];
	predictiveBaseline: number;
	meanAbsoluteScoreMovement: number;
	meanAbsoluteInactivityMovement: number;
	meanAbsoluteRankMovement: number;
	leaderChanges: number;
	confidenceGroups: HeroScoreConfidenceSummary[];
	scoreGroups: HeroScorePredictiveCohort[];
	heroGroups: HeroScorePredictiveCohort[];
	anomalies: HeroScoreAnomaly[];
};

export type HeroScoreConfigurationResult = {
	label: string;
	config: HeroScoreConfig;
	predictiveCorrelation: number | null;
	predictiveCorrelationInterval: HeroScoreInterval;
	counterintuitiveRate: number;
	scoreStandardDeviation: number;
	clampRate: number;
	meanAbsoluteScoreMovement: number;
};

export type HeroScoreAblationResult = {
	label: string;
	detail: string;
	predictiveCorrelation: number | null;
	predictiveCorrelationInterval: HeroScoreInterval;
	quartileLift: number;
	meanAbsoluteScoreMovement: number;
	corePrediction: number | null;
	supportPrediction: number | null;
};

export type HeroScoreEvaluationReport = {
	generatedAt: string;
	generationMs: number;
	rowsEvaluated: number;
	playerHeroHistories: number;
	holdoutCutoff: string;
	current: HeroScoreEvaluationSummary;
	configurations: HeroScoreConfigurationResult[];
	ablations: HeroScoreAblationResult[];
	scoreGroupPriors: HeroScorePriorSummary[];
	invariants: Array<{ label: string; passed: boolean; detail: string }>;
};

const createState = (_config: HeroScoreConfig, scoreGroup: HeroScoreGroup): ReplayState => {
	return {
		scoreGroup,
		matches: 0,
		scoreWeight: 0,
		scoreWins: 0,
		scoreKills: 0,
		scoreDeaths: 0,
		scoreAssists: 0,
		scoreImpact: 0,
		recentResults: [],
		recentPerformance: [],
		lastPlayed: 0,
		breakdown: null
	};
};

const getKda = (kills: number, deaths: number, assists: number) =>
	deaths === 0 ? kills + assists : (kills + assists) / deaths;

const mean = (values: number[]) =>
	values.length > 0 ? values.reduce((total, value) => total + value, 0) / values.length : 0;

const standardDeviation = (values: number[]) => {
	if (values.length === 0) return 0;
	const average = mean(values);
	return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
};

const percentile = (values: number[], fraction: number) => {
	if (values.length === 0) return 0;
	const sorted = values.slice().sort((a, b) => a - b);
	const index = (sorted.length - 1) * fraction;
	const lower = Math.floor(index);
	const upper = Math.ceil(index);
	if (lower === upper) return sorted[lower];
	return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
};

const correlation = (pairs: Array<{ x: number; y: number }>) => {
	if (pairs.length < 2) return null;
	const meanX = mean(pairs.map(({ x }) => x));
	const meanY = mean(pairs.map(({ y }) => y));
	const numerator = pairs.reduce((total, { x, y }) => total + (x - meanX) * (y - meanY), 0);
	const denominatorX = Math.sqrt(pairs.reduce((total, { x }) => total + (x - meanX) ** 2, 0));
	const denominatorY = Math.sqrt(pairs.reduce((total, { y }) => total + (y - meanY) ** 2, 0));
	if (denominatorX === 0 || denominatorY === 0) return null;
	return numerator / (denominatorX * denominatorY);
};

const getCorrelationInterval = (pairs: Array<{ x: number; y: number }>): HeroScoreInterval => {
	const value = correlation(pairs);
	if (value === null || pairs.length <= 3) return { value, lower: null, upper: null };
	const bounded = Math.max(-0.999999, Math.min(0.999999, value));
	const transformed = Math.atanh(bounded);
	const margin = 1.96 / Math.sqrt(pairs.length - 3);
	return {
		value,
		lower: Math.tanh(transformed - margin),
		upper: Math.tanh(transformed + margin)
	};
};

const getMeanInterval = (values: number[]) => {
	if (values.length === 0) return { value: 0, lower: 0, upper: 0 };
	const value = mean(values);
	if (values.length === 1) return { value, lower: value, upper: value };
	const margin = 1.96 * (standardDeviation(values) / Math.sqrt(values.length));
	return { value, lower: Math.max(0, value - margin), upper: Math.min(100, value + margin) };
};

const groupRows = (rows: HeroScoreEvaluationRow[]) => {
	const groups = new Map<string, HeroScoreEvaluationRow[]>();
	for (const row of rows) {
		const key = `${row.heroId}:${row.playerId}:${getHeroScoreGroup(row.role)}`;
		const group = groups.get(key) ?? [];
		group.push(row);
		groups.set(key, group);
	}
	for (const group of groups.values()) {
		group.sort((a, b) => a.startTime - b.startTime || a.matchId - b.matchId);
	}
	return groups;
};

const decayStateTo = (state: ReplayState, targetTime: number, config: HeroScoreConfig) => {
	if (state.lastPlayed === 0 || targetTime <= state.lastPlayed) return;
	const elapsedSeconds = targetTime - state.lastPlayed;
	const evidenceDecay = 0.5 ** (elapsedSeconds / (config.recencyHalfLifeDays * SECONDS_PER_DAY));
	state.scoreWeight *= evidenceDecay;
	state.scoreWins *= evidenceDecay;
	state.scoreKills *= evidenceDecay;
	state.scoreDeaths *= evidenceDecay;
	state.scoreAssists *= evidenceDecay;
	state.scoreImpact *= evidenceDecay;
	state.lastPlayed = targetTime;
};

const getStateBreakdown = (state: ReplayState, config: HeroScoreConfig) => {
	const historicalWinRate = (state.scoreWins / state.scoreWeight) * 100;
	const historicalKda = getKda(
		state.scoreKills / state.scoreWeight,
		state.scoreDeaths / state.scoreWeight,
		state.scoreAssists / state.scoreWeight
	);
	const historicalImpact = state.scoreImpact / state.scoreWeight;
	const recentWins = state.recentResults.filter(Boolean).length;
	const recentRate =
		state.recentResults.length > 0 ? (recentWins / state.recentResults.length) * 100 : 0;
	const recentPerformanceWins = state.recentPerformance.filter(({ isWin }) => isWin).length;
	const recentPerformanceWinRate =
		state.recentPerformance.length > 0
			? (recentPerformanceWins / state.recentPerformance.length) * 100
			: historicalWinRate;
	const recentPerformanceImpact =
		state.recentPerformance.length > 0
			? mean(state.recentPerformance.map(({ impact }) => impact))
			: historicalImpact;
	const recentPerformanceKda =
		state.recentPerformance.length > 0
			? getKda(
					state.recentPerformance.reduce((total, row) => total + row.kills, 0),
					state.recentPerformance.reduce((total, row) => total + row.deaths, 0),
					state.recentPerformance.reduce((total, row) => total + row.assists, 0)
				)
			: historicalKda;
	return getHeroScoreBreakdown(
		{
			winRate: blendHeroScorePerformance(historicalWinRate, recentPerformanceWinRate, config),
			recentRate: recentRate,
			avgImpact: blendHeroScorePerformance(historicalImpact, recentPerformanceImpact, config),
			kda: blendHeroScorePerformance(historicalKda, recentPerformanceKda, config),
			matches: state.matches,
			prior: getHeroScoreGroupPrior(state.scoreGroup)
		},
		config
	);
};

const updateState = (
	state: ReplayState,
	row: HeroScoreEvaluationRow,
	config: HeroScoreConfig
): ScoreSnapshot => {
	const previousMatchBreakdown = state.breakdown;
	decayStateTo(state, row.startTime, config);
	const preMatchBreakdown = state.matches > 0 ? getStateBreakdown(state, config) : null;
	const isWin = row.team === row.winner;
	const evidenceScale = getHeroScoreEvidenceScale(state.scoreWeight, 1, config);
	state.scoreWeight *= evidenceScale;
	state.scoreWins *= evidenceScale;
	state.scoreKills *= evidenceScale;
	state.scoreDeaths *= evidenceScale;
	state.scoreAssists *= evidenceScale;
	state.scoreImpact *= evidenceScale;
	state.matches += 1;
	state.scoreWeight += 1;
	state.scoreWins += isWin ? 1 : 0;
	state.scoreKills += row.kills;
	state.scoreDeaths += row.deaths;
	state.scoreAssists += row.assists;
	state.scoreImpact += row.impact;
	state.recentResults.push(isWin);
	if (state.recentResults.length > 10) state.recentResults.shift();
	state.recentPerformance.push({
		isWin,
		kills: row.kills,
		deaths: row.deaths,
		assists: row.assists,
		impact: row.impact
	});
	if (state.recentPerformance.length > HERO_SCORE_RECENT_PERFORMANCE_MATCHES)
		state.recentPerformance.shift();
	state.lastPlayed = row.startTime;
	state.breakdown = getStateBreakdown(state, config);
	return {
		row,
		matches: state.matches,
		effectiveMatches: state.matches,
		breakdown: state.breakdown,
		previousMatchBreakdown,
		preMatchBreakdown
	};
};

const getPredictionQuartiles = (pairs: PredictionPair[]) => {
	const sorted = pairs.slice().sort((a, b) => a.x - b.x);
	const quartileSize = Math.ceil(sorted.length / 4);
	return Array.from({ length: 4 }, (_, index) => {
		const cohort = sorted.slice(index * quartileSize, (index + 1) * quartileSize);
		const interval = getMeanInterval(cohort.map(({ y }) => y));
		return {
			label: `Q${index + 1}`,
			winRate: interval.value,
			lower: interval.lower,
			upper: interval.upper,
			samples: cohort.length
		};
	});
};

const getQuartileLift = (pairs: PredictionPair[]) => {
	const quartiles = getPredictionQuartiles(pairs);
	if (quartiles[0]?.samples === 0 || quartiles[3]?.samples === 0) return null;
	return quartiles[3].winRate - quartiles[0].winRate;
};

const getConfidenceSummaries = (snapshots: ScoreSnapshot[], pairs: PredictionPair[]) => {
	const groups = new Map<string, ScoreSnapshot[]>();
	for (const snapshot of snapshots) {
		const label = getHeroScoreConfidenceLabel(snapshot.effectiveMatches);
		const values = groups.get(label) ?? [];
		values.push(snapshot);
		groups.set(label, values);
	}
	return ['Stale', 'Provisional', 'Established', 'High confidence']
		.map((label) => {
			const group = groups.get(label) ?? [];
			const values = group.map(({ breakdown }) => breakdown.score);
			const predictivePairs = pairs.filter((pair) => pair.confidence === label);
			return {
				label,
				count: values.length,
				average: mean(values),
				standardDeviation: standardDeviation(values),
				minimum: values.length > 0 ? Math.min(...values) : 0,
				maximum: values.length > 0 ? Math.max(...values) : 0,
				predictiveSamples: predictivePairs.length,
				predictiveCorrelation: correlation(predictivePairs)
			};
		})
		.filter(({ count }) => count > 0);
};

const getPredictiveCohorts = (
	snapshots: ScoreSnapshot[],
	pairs: PredictionPair[],
	key: 'scoreGroup' | 'hero'
): HeroScorePredictiveCohort[] => {
	const ids = new Set<number | HeroScoreGroup>();
	for (const snapshot of snapshots)
		ids.add(key === 'scoreGroup' ? getHeroScoreGroup(snapshot.row.role) : snapshot.row.heroId);
	return Array.from(ids)
		.map((id) => {
			const ratingSnapshots = snapshots.filter((snapshot) =>
				key === 'scoreGroup'
					? getHeroScoreGroup(snapshot.row.role) === id
					: snapshot.row.heroId === id
			);
			const predictivePairs = pairs.filter((pair) =>
				key === 'scoreGroup' ? pair.scoreGroup === id : pair.heroId === id
			);
			const scores = ratingSnapshots.map(({ breakdown }) => breakdown.score);
			const hasEnoughCorrelationSamples = predictivePairs.length >= 10;
			const hasEnoughQuartileSamples = predictivePairs.length >= 20;
			return {
				id,
				label:
					key === 'scoreGroup'
						? getHeroScoreGroupName(id as HeroScoreGroup)
						: (ratingSnapshots[0]?.row.heroName ?? predictivePairs[0]?.heroName ?? `Hero ${id}`),
				ratings: scores.length,
				averageScore: mean(scores),
				scoreSpread: standardDeviation(scores),
				predictiveSamples: predictivePairs.length,
				predictiveCorrelation: hasEnoughCorrelationSamples ? correlation(predictivePairs) : null,
				quartileLift: hasEnoughQuartileSamples ? getQuartileLift(predictivePairs) : null
			};
		})
		.sort((a, b) => b.predictiveSamples - a.predictiveSamples || a.label.localeCompare(b.label));
};

const getRankMetrics = (finalSnapshots: ScoreSnapshot[]) => {
	const byHero = new Map<number, ScoreSnapshot[]>();
	for (const snapshot of finalSnapshots) {
		if (!snapshot.preMatchBreakdown) continue;
		const heroSnapshots = byHero.get(snapshot.row.heroId) ?? [];
		heroSnapshots.push(snapshot);
		byHero.set(snapshot.row.heroId, heroSnapshots);
	}
	const movements: number[] = [];
	let leaderChanges = 0;
	for (const snapshots of byHero.values()) {
		if (snapshots.length < 2) continue;
		const before = snapshots
			.slice()
			.sort((a, b) => (b.preMatchBreakdown?.score ?? 0) - (a.preMatchBreakdown?.score ?? 0));
		const after = snapshots.slice().sort((a, b) => b.breakdown.score - a.breakdown.score);
		const beforeRanks = new Map(
			before.map((snapshot, index) => [
				`${snapshot.row.playerId}:${getHeroScoreGroup(snapshot.row.role)}`,
				index + 1
			])
		);
		for (const [index, snapshot] of after.entries()) {
			const identity = `${snapshot.row.playerId}:${getHeroScoreGroup(snapshot.row.role)}`;
			movements.push(Math.abs((beforeRanks.get(identity) ?? index + 1) - (index + 1)));
		}
		if (
			`${before[0]?.row.playerId}:${getHeroScoreGroup(before[0]?.row.role ?? 0)}` !==
			`${after[0]?.row.playerId}:${getHeroScoreGroup(after[0]?.row.role ?? 0)}`
		)
			leaderChanges += 1;
	}
	return { meanAbsoluteRankMovement: mean(movements), leaderChanges };
};

const getHoldoutCutoff = (rows: HeroScoreEvaluationRow[]) =>
	percentile(Array.from(new Set(rows.map(({ startTime }) => startTime))), 1 - HOLDOUT_FRACTION);

export const evaluateHeroScoreConfiguration = (
	rows: HeroScoreEvaluationRow[],
	config: HeroScoreConfig = DEFAULT_HERO_SCORE_CONFIG,
	includeAnomalies = true
): HeroScoreEvaluationSummary => {
	const groups = groupRows(rows);
	const holdoutCutoff = getHoldoutCutoff(rows);
	const allCalibratedSnapshots: ScoreSnapshot[] = [];
	const finalSnapshots: ScoreSnapshot[] = [];
	const predictionPairs: PredictionPair[] = [];
	const anomalies: HeroScoreAnomaly[] = [];
	let counterintuitiveCount = 0;
	const scoreMovements: number[] = [];
	const inactivityMovements: number[] = [];

	for (const group of groups.values()) {
		const state = createState(config, getHeroScoreGroup(group[0]?.role ?? 0));
		const snapshots = group.map((row) => updateState(state, row, config));
		const calibrated = snapshots.filter(({ matches }) => matches >= MINIMUM_SCORED_MATCHES);
		allCalibratedSnapshots.push(...calibrated);
		const finalSnapshotAtLastMatch = snapshots.at(-1);
		let finalSnapshot = finalSnapshotAtLastMatch;
		if (finalSnapshotAtLastMatch) {
			decayStateTo(state, Math.floor(Date.now() / 1000), config);
			state.breakdown = getStateBreakdown(state, config);
			finalSnapshot = {
				...finalSnapshotAtLastMatch,
				effectiveMatches: state.matches,
				breakdown: state.breakdown
			};
		}
		if (finalSnapshot && finalSnapshot.matches >= MINIMUM_SCORED_MATCHES)
			finalSnapshots.push(finalSnapshot);

		const anchorIndex = group.findLastIndex(({ startTime }) => startTime < holdoutCutoff);
		const anchor = snapshots[anchorIndex];
		const futureRows =
			anchorIndex >= 0 ? group.slice(anchorIndex + 1, anchorIndex + 1 + PREDICTION_WINDOW) : [];
		if (
			anchor &&
			anchor.matches >= MINIMUM_SCORED_MATCHES &&
			futureRows.length === PREDICTION_WINDOW &&
			futureRows.every(({ startTime }) => startTime >= holdoutCutoff)
		) {
			const futureWins = futureRows.filter((row) => row.team === row.winner).length;
			predictionPairs.push({
				x: anchor.breakdown.score,
				y: (futureWins / PREDICTION_WINDOW) * 100,
				scoreGroup: getHeroScoreGroup(anchor.row.role),
				heroId: anchor.row.heroId,
				heroName: anchor.row.heroName,
				confidence: getHeroScoreConfidenceLabel(anchor.effectiveMatches)
			});
		}

		for (const snapshot of calibrated) {
			if (!snapshot.preMatchBreakdown) continue;
			const scoreChange = snapshot.breakdown.score - snapshot.preMatchBreakdown.score;
			const inactivityChange = snapshot.previousMatchBreakdown
				? snapshot.preMatchBreakdown.score - snapshot.previousMatchBreakdown.score
				: 0;
			scoreMovements.push(Math.abs(scoreChange));
			inactivityMovements.push(Math.abs(inactivityChange));
			const isWin = snapshot.row.team === snapshot.row.winner;
			const isCounterintuitive = (isWin && scoreChange < -1) || (!isWin && scoreChange > 1);
			if (isCounterintuitive) counterintuitiveCount += 1;
			if (!isCounterintuitive || !includeAnomalies) continue;
			anomalies.push({
				matchId: snapshot.row.matchId,
				heroName: snapshot.row.heroName,
				scoreGroup: getHeroScoreGroup(snapshot.row.role),
				username: snapshot.row.username,
				result: isWin ? 'Win' : 'Loss',
				matchNumber: snapshot.matches,
				scoreBefore: snapshot.preMatchBreakdown.score,
				scoreAfter: snapshot.breakdown.score,
				scoreChange,
				inactivityChange,
				performanceChange:
					snapshot.breakdown.performanceScore - snapshot.preMatchBreakdown.performanceScore,
				volumeChange:
					snapshot.breakdown.contributions.volume - snapshot.preMatchBreakdown.contributions.volume
			});
		}
	}

	const scores = finalSnapshots.map(({ breakdown }) => breakdown.score);
	const correlationInterval = getCorrelationInterval(predictionPairs);
	const predictiveQuartiles = getPredictionQuartiles(predictionPairs);
	return {
		config,
		calibratedRatings: scores.length,
		scoreMean: mean(scores),
		scoreStandardDeviation: standardDeviation(scores),
		percentiles: {
			p10: percentile(scores, 0.1),
			p25: percentile(scores, 0.25),
			p50: percentile(scores, 0.5),
			p75: percentile(scores, 0.75),
			p90: percentile(scores, 0.9)
		},
		lowerClampCount: scores.filter((score) => score === 0).length,
		upperClampCount: scores.filter((score) => score === HERO_SCORE_MAX).length,
		counterintuitiveCount,
		counterintuitiveRate:
			allCalibratedSnapshots.length > 0 ? counterintuitiveCount / allCalibratedSnapshots.length : 0,
		predictiveSamples: predictionPairs.length,
		predictiveCorrelation: correlationInterval.value,
		predictiveCorrelationInterval: correlationInterval,
		predictiveQuartiles,
		predictiveBaseline: mean(predictionPairs.map(({ y }) => y)),
		meanAbsoluteScoreMovement: mean(scoreMovements),
		meanAbsoluteInactivityMovement: mean(inactivityMovements),
		...getRankMetrics(finalSnapshots),
		confidenceGroups: getConfidenceSummaries(finalSnapshots, predictionPairs),
		scoreGroups: getPredictiveCohorts(finalSnapshots, predictionPairs, 'scoreGroup'),
		heroGroups: getPredictiveCohorts(finalSnapshots, predictionPairs, 'hero'),
		anomalies: anomalies
			.sort((a, b) => Math.abs(b.scoreChange) - Math.abs(a.scoreChange))
			.slice(0, 25)
	};
};

const getConfigurationGrid = () => {
	const configurations: Array<{ label: string; config: HeroScoreConfig }> = [];
	for (const recencyHalfLifeDays of [365 * 2, 365 * 4, 365 * 8]) {
		for (const historicalPerformanceWeight of [0.5, 0.7, 0.9]) {
			for (const historicalEvidenceCap of [80, 120, 200]) {
				const config = {
					...DEFAULT_HERO_SCORE_CONFIG,
					recencyHalfLifeDays,
					historicalPerformanceWeight,
					historicalEvidenceCap
				};
				configurations.push({
					label: `${recencyHalfLifeDays / 365}y decay · ${Math.round(historicalPerformanceWeight * 100)}/${Math.round((1 - historicalPerformanceWeight) * 100)} history/recent · ${historicalEvidenceCap}-game memory`,
					config
				});
			}
		}
	}
	return configurations;
};

const getAblationConfigurations = () => [
	{
		label: 'Current model',
		detail:
			'Original weights with responsive history, regressed form, extended volume and role-normalised performance.',
		config: DEFAULT_HERO_SCORE_CONFIG
	},
	{
		label: 'No volume',
		detail: 'Removes match-count points and redistributes their weight across performance.',
		config: {
			...DEFAULT_HERO_SCORE_CONFIG,
			winRateWeight: 0.375,
			recentFormWeight: 0.125,
			impactWeight: 0.3125,
			kdaWeight: 0.1875,
			volumeWeight: 0
		}
	},
	{
		label: 'Results only',
		detail: 'Uses only historical win rate and last-ten form.',
		config: {
			...DEFAULT_HERO_SCORE_CONFIG,
			winRateWeight: 0.75,
			recentFormWeight: 0.25,
			impactWeight: 0,
			kdaWeight: 0,
			volumeWeight: 0
		}
	},
	{
		label: 'No recent blend',
		detail:
			'Uses time-weighted career values for win rate, impact and KDA without the latest-20 blend.',
		config: {
			...DEFAULT_HERO_SCORE_CONFIG,
			historicalPerformanceWeight: 1
		}
	},
	{
		label: 'Uncapped history',
		detail: 'Keeps every weighted historical match in the performance accumulator.',
		config: {
			...DEFAULT_HERO_SCORE_CONFIG,
			historicalEvidenceCap: Number.POSITIVE_INFINITY
		}
	},
	{
		label: 'Unshrunk recent form',
		detail: 'Uses the raw latest-10 win rate without regression toward 50%.',
		config: {
			...DEFAULT_HERO_SCORE_CONFIG,
			recentFormRegressionFactor: 1
		}
	},
	{
		label: 'No role normalisation',
		detail: 'Scores raw impact and KDA without adjusting for Core and Support baselines.',
		config: {
			...DEFAULT_HERO_SCORE_CONFIG,
			normalizeRolePerformance: false
		}
	},
	{
		label: 'No recent form',
		detail: 'Removes the separate last-ten result component and redistributes its weight.',
		config: {
			...DEFAULT_HERO_SCORE_CONFIG,
			winRateWeight: 1 / 3,
			recentFormWeight: 0,
			impactWeight: 5 / 18,
			kdaWeight: 1 / 6,
			volumeWeight: 2 / 9
		}
	},
	{
		label: 'No impact',
		detail: 'Removes average impact and redistributes its weight across the remaining components.',
		config: {
			...DEFAULT_HERO_SCORE_CONFIG,
			winRateWeight: 0.4,
			recentFormWeight: 2 / 15,
			impactWeight: 0,
			kdaWeight: 0.2,
			volumeWeight: 4 / 15
		}
	},
	{
		label: 'No KDA',
		detail: 'Removes KDA and redistributes its weight across the remaining components.',
		config: {
			...DEFAULT_HERO_SCORE_CONFIG,
			winRateWeight: 6 / 17,
			recentFormWeight: 2 / 17,
			impactWeight: 5 / 17,
			kdaWeight: 0,
			volumeWeight: 4 / 17
		}
	}
];

const getScoreGroupPriors = (rows: HeroScoreEvaluationRow[]): HeroScorePriorSummary[] =>
	HERO_SCORE_GROUPS.map((scoreGroup) => {
		const scoreGroupRows = rows.filter((row) => getHeroScoreGroup(row.role) === scoreGroup);
		const wins = scoreGroupRows.filter((row) => row.team === row.winner).length;
		const kills = scoreGroupRows.reduce((total, row) => total + row.kills, 0);
		const deaths = scoreGroupRows.reduce((total, row) => total + row.deaths, 0);
		const assists = scoreGroupRows.reduce((total, row) => total + row.assists, 0);
		return {
			scoreGroup,
			matches: scoreGroupRows.length,
			configured: HERO_SCORE_GROUP_PRIORS[scoreGroup],
			observed: {
				winRate: scoreGroupRows.length > 0 ? (wins / scoreGroupRows.length) * 100 : 0,
				impact: mean(scoreGroupRows.map((row) => row.impact)),
				kda: getKda(kills, deaths, assists)
			}
		};
	});

export const runHeroScoreRegressionChecks = () => {
	const score = (inputs: Parameters<typeof getHeroScoreBreakdown>[0]) =>
		getHeroScoreBreakdown(inputs).score;
	const weights =
		DEFAULT_HERO_SCORE_CONFIG.winRateWeight +
		DEFAULT_HERO_SCORE_CONFIG.recentFormWeight +
		DEFAULT_HERO_SCORE_CONFIG.impactWeight +
		DEFAULT_HERO_SCORE_CONFIG.kdaWeight +
		DEFAULT_HERO_SCORE_CONFIG.volumeWeight;
	const representativeInputs = [
		{ winRate: 20, recentRate: 20, avgImpact: 20, kda: 1, matches: 10 },
		{ winRate: 50, recentRate: 50, avgImpact: 75, kda: 3, matches: 75 },
		{ winRate: 80, recentRate: 80, avgImpact: 150, kda: 6, matches: 300 }
	];
	const boundedScores = representativeInputs.map(score);
	const baseline = { winRate: 55, recentRate: 55, avgImpact: 80, kda: 3.2, matches: 40 };
	const baselineScore = score(baseline);
	const improvedScores = [
		score({ ...baseline, winRate: 60 }),
		score({ ...baseline, recentRate: 60 }),
		score({ ...baseline, avgImpact: 90 }),
		score({ ...baseline, kda: 3.8 })
	];
	const sampleWeights = [0, 1, 5, 10, 24, 100].map(getHeroScoreSampleWeight);
	const volumeScores = [0, 1, 10, 24, 100, 500, 1000].map((matches) =>
		getHeroScoreVolumeScore(matches)
	);
	const fourYearWeight = getHeroScoreRecencyWeight(0, 365 * 4 * SECONDS_PER_DAY);
	const evidenceCap = DEFAULT_HERO_SCORE_CONFIG.historicalEvidenceCap;
	const cappedHistoryWeight =
		evidenceCap * getHeroScoreEvidenceScale(evidenceCap, 1, DEFAULT_HERO_SCORE_CONFIG) + 1;
	const regressedRecentRates = [40, 80].map((rate) => getHeroScoreAdjustedRecentRate(rate));
	const groupRelativePerformance = [
		HERO_SCORE_GROUP_PRIORS.core,
		HERO_SCORE_GROUP_PRIORS.support
	].map((prior) =>
		getHeroScoreBreakdown({
			winRate: 50,
			recentRate: 50,
			avgImpact: prior.impact * 1.2,
			kda: prior.kda * 1.2,
			matches: 100,
			prior
		})
	);
	return [
		{
			label: 'All component weights sum to 100%',
			passed: Math.abs(weights - 1) < 0.000001,
			detail: `Current total: ${(weights * 100).toFixed(1)}%`
		},
		{
			label: 'Scores remain inside the 0–1,000 scale',
			passed: boundedScores.every((value) => value >= 0 && value <= HERO_SCORE_MAX),
			detail: `Representative range: ${Math.min(...boundedScores)}–${Math.max(...boundedScores)}`
		},
		{
			label: 'Improving any scored metric cannot lower the score',
			passed: improvedScores.every((value) => value >= baselineScore),
			detail: `Baseline ${baselineScore}; improved cases ${improvedScores.join(', ')}`
		},
		{
			label: 'Sample confidence rises and reaches full weight at 24 matches',
			passed:
				sampleWeights.every((value, index) => index === 0 || value >= sampleWeights[index - 1]) &&
				Math.abs(getHeroScoreSampleWeight(24) - 1) < 0.000001,
			detail: `10 matches ${(getHeroScoreSampleWeight(10) * 100).toFixed(1)}%; 24 matches 100%`
		},
		{
			label: 'Volume rises and caps at 500 matches',
			passed:
				volumeScores.every((value, index) => index === 0 || value >= volumeScores[index - 1]) &&
				Math.abs(getHeroScoreVolumeScore(500) - 100) < 0.000001 &&
				Math.abs(getHeroScoreVolumeScore(1000) - 100) < 0.000001,
			detail: `100 matches ${getHeroScoreVolumeScore(100).toFixed(1)}%; 500+ matches 100%`
		},
		{
			label: 'Historical evidence halves after four years',
			passed: Math.abs(fourYearWeight - 0.5) < 0.000001,
			detail: `Four-year weight: ${(fourYearWeight * 100).toFixed(1)}%`
		},
		{
			label: 'Historical performance memory stays responsive',
			passed:
				Math.abs(cappedHistoryWeight - DEFAULT_HERO_SCORE_CONFIG.historicalEvidenceCap) <
				0.000001,
			detail: `Evidence remains capped at ${DEFAULT_HERO_SCORE_CONFIG.historicalEvidenceCap} effective games after a new match`
		},
		{
			label: 'Latest-10 form is regressed halfway toward neutral',
			passed:
				Math.abs(regressedRecentRates[0] - 45) < 0.000001 &&
				Math.abs(regressedRecentRates[1] - 65) < 0.000001,
			detail: `Raw 40% becomes ${regressedRecentRates[0].toFixed(0)}%; raw 80% becomes ${regressedRecentRates[1].toFixed(0)}%`
		},
		{
			label: 'Equal group-relative performance earns equal points',
			passed:
				Math.abs(
					groupRelativePerformance[0].contributions.impact -
						groupRelativePerformance[1].contributions.impact
				) < 0.000001 &&
				Math.abs(
					groupRelativePerformance[0].contributions.kda -
						groupRelativePerformance[1].contributions.kda
				) < 0.000001,
			detail: `Core and Support both earn ${groupRelativePerformance[0].contributions.impact.toFixed(1)} impact and ${groupRelativePerformance[0].contributions.kda.toFixed(1)} KDA points at 20% above baseline`
		}
	];
};

export const evaluateHeroScores = (rows: HeroScoreEvaluationRow[]): HeroScoreEvaluationReport => {
	const current = evaluateHeroScoreConfiguration(rows);
	const configurations = getConfigurationGrid()
		.map(({ label, config }) => {
			const result = evaluateHeroScoreConfiguration(rows, config, false);
			return {
				label,
				config,
				predictiveCorrelation: result.predictiveCorrelation,
				predictiveCorrelationInterval: result.predictiveCorrelationInterval,
				counterintuitiveRate: result.counterintuitiveRate,
				scoreStandardDeviation: result.scoreStandardDeviation,
				clampRate:
					result.calibratedRatings > 0
						? (result.lowerClampCount + result.upperClampCount) / result.calibratedRatings
						: 0,
				meanAbsoluteScoreMovement: result.meanAbsoluteScoreMovement
			};
		})
		.sort((a, b) => {
			const correlationDifference =
				(b.predictiveCorrelation ?? -1) - (a.predictiveCorrelation ?? -1);
			if (Math.abs(correlationDifference) > 0.0001) return correlationDifference;
			return a.counterintuitiveRate - b.counterintuitiveRate;
		});
	const ablations = getAblationConfigurations().map(({ label, detail, config }) => {
		const result = evaluateHeroScoreConfiguration(rows, config, false);
		return {
			label,
			detail,
			predictiveCorrelation: result.predictiveCorrelation,
			predictiveCorrelationInterval: result.predictiveCorrelationInterval,
			quartileLift:
				(result.predictiveQuartiles[3]?.winRate ?? 0) -
				(result.predictiveQuartiles[0]?.winRate ?? 0),
			meanAbsoluteScoreMovement: result.meanAbsoluteScoreMovement,
			corePrediction:
				result.scoreGroups.find(({ id }) => id === 'core')?.predictiveCorrelation ?? null,
			supportPrediction:
				result.scoreGroups.find(({ id }) => id === 'support')?.predictiveCorrelation ?? null
		};
	});
	const holdoutCutoff = getHoldoutCutoff(rows);
	return {
		generatedAt: new Date().toISOString(),
		generationMs: 0,
		rowsEvaluated: rows.length,
		playerHeroHistories: groupRows(rows).size,
		holdoutCutoff: new Date(holdoutCutoff * 1000).toISOString(),
		current,
		configurations,
		ablations,
		scoreGroupPriors: getScoreGroupPriors(rows),
		invariants: runHeroScoreRegressionChecks()
	};
};
