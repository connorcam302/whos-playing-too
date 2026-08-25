import {
	HERO_SCORE_IMPACT_MATCH_CAP,
	HERO_SCORE_RECENT_PERFORMANCE_MATCHES,
	blendHeroScorePerformance,
	decayHeroScoreRecentValue,
	getHeroMastery,
	getHeroScoreBreakdown,
	getHeroScoreConfidenceLabel,
	getHeroScoreEvidenceScale,
	getHeroScoreGroup,
	getHeroScoreGroupPrior,
	getHeroScoreRecencyWeight,
	getHeroScoreSampleWeight,
	updateHeroScorePerformancePulse,
	updateHeroScoreRecentAverage,
	type HeroScoreBreakdown,
	type HeroScoreGroup
} from '$lib/heroScores';

export type HeroStatsRow = {
	playerId: number;
	username: string;
	smurf: boolean;
	startTime: number;
	duration: number;
	winner: string;
	team: string;
	role: number;
	kills: number;
	deaths: number;
	assists: number;
	impact: number;
	gpm: number | null;
	xpm: number | null;
	lastHits: number | null;
	heroDamage: number | null;
	towerDamage: number | null;
};

export type HeroPlayerRanking = {
	playerId: number;
	username: string;
	smurf: boolean;
	matches: number;
	wins: number;
	losses: number;
	winRate: number;
	recentForm: string;
	avgKills: number;
	avgDeaths: number;
	avgAssists: number;
	kda: number;
	avgImpact: number;
	avgDuration: number;
	avgGpm: number;
	avgXpm: number;
	avgLastHits: number;
	avgHeroDamage: number;
	avgTowerDamage: number;
	primaryRole: number;
	scoreGroup: HeroScoreGroup;
	score: number;
	scoreWinRate: number;
	scoreRecentRate: number;
	scoreKda: number;
	scoreAvgImpact: number;
	performancePulse: number;
	volumeScore: number;
	sampleWeight: number;
	effectiveMatches: number;
	confidence: string;
	mastery: number;
	lastPlayed: number;
};

export type HeroScoreHistoryRow = {
	heroId: number;
	role: number;
	matchId: number;
	startTime: number;
	winner: string;
	team: string;
	kills: number;
	deaths: number;
	assists: number;
	impact: number;
};

export type HeroScoreHistoryEntry = {
	matchNumber: number;
	scoreAtPreviousMatch: number | null;
	scoreBefore: number | null;
	scoreAfter: number | null;
	scoreChange: number | null;
	inactivityChange: number | null;
	becameCalibrated: boolean;
	confidence: string;
	confidencePercent: number;
	mastery: number;
	componentChanges: HeroScoreComponentChanges | null;
};

type HeroScoreComponentChanges = Pick<
	HeroScoreBreakdown['contributions'],
	'winRate' | 'recentForm' | 'impact' | 'kda' | 'volume'
>;

type PlayerBucket = {
	playerId: number;
	username: string;
	smurf: boolean;
	matches: number;
	wins: number;
	kills: number;
	deaths: number;
	assists: number;
	impact: number;
	duration: number;
	gpm: number;
	xpm: number;
	lastHits: number;
	heroDamage: number;
	towerDamage: number;
	recent: boolean[];
	scoreWeight: number;
	scoreWins: number;
	scoreKills: number;
	scoreDeaths: number;
	scoreAssists: number;
	scoreImpact: number;
	recentWinRate: number;
	recentKda: number;
	recentImpact: number;
	performancePulse: number;
	recentPerformance: Array<{
		isWin: boolean;
		kills: number;
		deaths: number;
		assists: number;
		impact: number;
	}>;
	roles: Map<number, number>;
	lastPlayed: number;
	scoreGroup: HeroScoreGroup;
	scorePrior: ReturnType<typeof getHeroScoreGroupPrior>;
};

export const HERO_CALIBRATION_MATCHES = 10;

export const toAverage = (value: number, count: number) => (count > 0 ? value / count : 0);

export const getKda = (kills: number, deaths: number, assists: number) =>
	deaths === 0 ? kills + assists : (kills + assists) / deaths;

export const getSampleWeight = (matches: number) => getHeroScoreSampleWeight(matches);

export const getScoreBand = (effectiveMatches: number, actualMatches = effectiveMatches) => {
	if (actualMatches < HERO_CALIBRATION_MATCHES) return 'Uncalibrated';
	return getHeroScoreConfidenceLabel(effectiveMatches);
};

const getComponentChanges = (
	before: HeroScoreBreakdown | null,
	after: HeroScoreBreakdown
): HeroScoreComponentChanges | null => {
	if (!before) return null;
	return {
		winRate: after.contributions.winRate - before.contributions.winRate,
		recentForm: after.contributions.recentForm - before.contributions.recentForm,
		impact: after.contributions.impact - before.contributions.impact,
		kda: after.contributions.kda - before.contributions.kda,
		volume: after.contributions.volume - before.contributions.volume
	};
};

export const getPlayerHeroScoreHistory = (rows: HeroScoreHistoryRow[]) => {
	const history = new Map<number, HeroScoreHistoryEntry>();
	const rowsByHeroGroup = new Map<string, HeroScoreHistoryRow[]>();

	for (const row of rows) {
		const key = `${row.heroId}:${getHeroScoreGroup(row.role)}`;
		const heroRows = rowsByHeroGroup.get(key) ?? [];
		heroRows.push(row);
		rowsByHeroGroup.set(key, heroRows);
	}

	for (const heroRows of rowsByHeroGroup.values()) {
		const sortedRows = heroRows
			.slice()
			.sort((a, b) => a.startTime - b.startTime || a.matchId - b.matchId);
		let matches = 0;
		let scoreWeight = 0;
		let scoreWins = 0;
		let scoreKills = 0;
		let scoreDeaths = 0;
		let scoreAssists = 0;
		let scoreImpact = 0;
		let previousScore: number | null = null;
		const scoreGroup = getHeroScoreGroup(sortedRows[0]?.role ?? 0);
		const prior = getHeroScoreGroupPrior(scoreGroup);
		let recentWinRate = prior.winRate;
		let recentKda = prior.kda;
		let recentImpact = prior.impact;
		let performancePulse = 0;
		const recentResults: boolean[] = [];
		const recentPerformance: HeroScoreHistoryRow[] = [];
		let previousMatchTime = 0;
		const getBreakdown = () => {
			const historicalWinRate = toAverage(scoreWins, scoreWeight) * 100;
			const historicalKda = getKda(
				toAverage(scoreKills, scoreWeight),
				toAverage(scoreDeaths, scoreWeight),
				toAverage(scoreAssists, scoreWeight)
			);
			const historicalAvgImpact = toAverage(scoreImpact, scoreWeight);
			const recentPerformanceWins = recentPerformance.filter(
				(match) => match.team === match.winner
			).length;
			const recentPerformanceKda = getKda(
				toAverage(
					recentPerformance.reduce((total, match) => total + match.kills, 0),
					recentPerformance.length
				),
				toAverage(
					recentPerformance.reduce((total, match) => total + match.deaths, 0),
					recentPerformance.length
				),
				toAverage(
					recentPerformance.reduce((total, match) => total + match.assists, 0),
					recentPerformance.length
				)
			);
			const recentPerformanceImpact = toAverage(
				recentPerformance.reduce((total, match) => total + match.impact, 0),
				recentPerformance.length
			);
			return getHeroScoreBreakdown({
				winRate: blendHeroScorePerformance(
					historicalWinRate,
					toAverage(recentPerformanceWins, recentPerformance.length) * 100
				),
				recentRate: toAverage(recentResults.filter(Boolean).length, recentResults.length) * 100,
				avgImpact: blendHeroScorePerformance(historicalAvgImpact, recentPerformanceImpact),
				kda: blendHeroScorePerformance(historicalKda, recentPerformanceKda),
				matches,
				effectiveMatches: scoreWeight,
				performancePulse,
				prior
			});
		};

		for (const row of sortedRows) {
			const isWin = row.team === row.winner;
			if (previousMatchTime > 0) {
				const evidenceDecay = getHeroScoreRecencyWeight(previousMatchTime, row.startTime);
				scoreWeight *= evidenceDecay;
				scoreWins *= evidenceDecay;
				scoreKills *= evidenceDecay;
				scoreDeaths *= evidenceDecay;
				scoreAssists *= evidenceDecay;
				scoreImpact *= evidenceDecay;
				recentWinRate = decayHeroScoreRecentValue(
					recentWinRate,
					prior.winRate,
					previousMatchTime,
					row.startTime
				);
				recentKda = decayHeroScoreRecentValue(
					recentKda,
					prior.kda,
					previousMatchTime,
					row.startTime
				);
				recentImpact = decayHeroScoreRecentValue(
					recentImpact,
					prior.impact,
					previousMatchTime,
					row.startTime
				);
			}
			const preMatchBreakdown = matches > 0 && scoreWeight > 0 ? getBreakdown() : null;
			const scoreBefore =
				matches >= HERO_CALIBRATION_MATCHES && preMatchBreakdown ? preMatchBreakdown.score : null;

			const evidenceScale = getHeroScoreEvidenceScale(scoreWeight);
			scoreWeight *= evidenceScale;
			scoreWins *= evidenceScale;
			scoreKills *= evidenceScale;
			scoreDeaths *= evidenceScale;
			scoreAssists *= evidenceScale;
			scoreImpact *= evidenceScale;
			matches += 1;
			scoreWeight += 1;
			scoreWins += isWin ? 1 : 0;
			scoreKills += row.kills;
			scoreDeaths += row.deaths;
			scoreAssists += row.assists;
			scoreImpact += row.impact;
			recentWinRate = updateHeroScoreRecentAverage(recentWinRate, isWin ? 100 : 0);
			const matchKda = Math.min(6, getKda(row.kills, row.deaths, row.assists));
			recentKda = updateHeroScoreRecentAverage(recentKda, matchKda);
			recentImpact = updateHeroScoreRecentAverage(recentImpact, row.impact);
			recentResults.push(isWin);
			if (recentResults.length > 10) recentResults.shift();
			recentPerformance.push(row);
			if (recentPerformance.length > HERO_SCORE_RECENT_PERFORMANCE_MATCHES) {
				recentPerformance.shift();
			}
			performancePulse = 0;
			const breakdown = getBreakdown();
			const score = breakdown.score;
			const isCalibrated = matches >= HERO_CALIBRATION_MATCHES;
			const scoreAfter = isCalibrated ? score : null;

			history.set(row.matchId, {
				matchNumber: matches,
				scoreAtPreviousMatch: previousScore,
				scoreBefore,
				scoreAfter,
				scoreChange: scoreBefore !== null && scoreAfter !== null ? scoreAfter - scoreBefore : null,
				inactivityChange:
					previousScore !== null && scoreBefore !== null ? scoreBefore - previousScore : null,
				becameCalibrated: matches === HERO_CALIBRATION_MATCHES,
				confidence: getScoreBand(matches, matches),
				confidencePercent: getSampleWeight(matches),
				mastery: getHeroMastery(matches),
				componentChanges: getComponentChanges(preMatchBreakdown, breakdown)
			});

			previousScore = scoreAfter;
			previousMatchTime = row.startTime;
		}
	}

	return history;
};

const getPlayerScoreDetails = (bucket: PlayerBucket, referenceTime: number) => {
	const historicalWinRate = toAverage(bucket.scoreWins, bucket.scoreWeight) * 100;
	void referenceTime;
	const recentRate = toAverage(bucket.recent.filter(Boolean).length, bucket.recent.length) * 100;
	const historicalKda = getKda(
		toAverage(bucket.scoreKills, bucket.scoreWeight),
		toAverage(bucket.scoreDeaths, bucket.scoreWeight),
		toAverage(bucket.scoreAssists, bucket.scoreWeight)
	);
	const historicalAvgImpact = toAverage(bucket.scoreImpact, bucket.scoreWeight);
	const recentPerformanceWins = bucket.recentPerformance.filter(({ isWin }) => isWin).length;
	const recentPerformanceKda = getKda(
		toAverage(
			bucket.recentPerformance.reduce((total, match) => total + match.kills, 0),
			bucket.recentPerformance.length
		),
		toAverage(
			bucket.recentPerformance.reduce((total, match) => total + match.deaths, 0),
			bucket.recentPerformance.length
		),
		toAverage(
			bucket.recentPerformance.reduce((total, match) => total + match.assists, 0),
			bucket.recentPerformance.length
		)
	);
	const recentPerformanceImpact = toAverage(
		bucket.recentPerformance.reduce((total, match) => total + match.impact, 0),
		bucket.recentPerformance.length
	);
	const recentPerformanceWinRate =
		toAverage(recentPerformanceWins, bucket.recentPerformance.length) * 100;
	const scoreWinRate = blendHeroScorePerformance(historicalWinRate, recentPerformanceWinRate);
	const scoreKda = blendHeroScorePerformance(historicalKda, recentPerformanceKda);
	const scoreAvgImpact = blendHeroScorePerformance(historicalAvgImpact, recentPerformanceImpact);
	const breakdown = getHeroScoreBreakdown({
		winRate: scoreWinRate,
		recentRate,
		avgImpact: scoreAvgImpact,
		kda: scoreKda,
		matches: bucket.matches,
		effectiveMatches: bucket.scoreWeight,
		performancePulse: 0,
		prior: bucket.scorePrior
	});

	return {
		...breakdown,
		scoreWinRate,
		scoreRecentRate: recentRate,
		scoreKda,
		scoreAvgImpact
	};
};

export const getPlayerScore = (
	bucket: PlayerBucket,
	referenceTime = Math.floor(Date.now() / 1000)
) => getPlayerScoreDetails(bucket, referenceTime).score;

export const getRoleLeader = (roles: Map<number, number>) => {
	const [role] =
		Array.from(roles.entries()).sort((a, b) => {
			if (b[1] !== a[1]) return b[1] - a[1];
			return a[0] - b[0];
		})[0] ?? [];

	return role ?? 0;
};

export const getHeroPlayerRankings = (
	rows: HeroStatsRow[],
	includeUncalibrated = false,
	scoreGroup: HeroScoreGroup | null = null
): HeroPlayerRanking[] => {
	const eligibleRows =
		scoreGroup === null ? rows : rows.filter((row) => getHeroScoreGroup(row.role) === scoreGroup);
	const buckets = new Map<number, PlayerBucket>();
	const referenceTime = eligibleRows.reduce(
		(latest, row) => Math.max(latest, row.startTime),
		Math.floor(Date.now() / 1000)
	);
	const sortedRows = eligibleRows.slice().sort((a, b) => a.startTime - b.startTime);

	for (const row of sortedRows) {
		const scoreWeight = getHeroScoreRecencyWeight(row.startTime, referenceTime);
		const bucket =
			buckets.get(row.playerId) ??
			({
				playerId: row.playerId,
				username: row.username,
				smurf: row.smurf,
				matches: 0,
				wins: 0,
				kills: 0,
				deaths: 0,
				assists: 0,
				impact: 0,
				duration: 0,
				gpm: 0,
				xpm: 0,
				lastHits: 0,
				heroDamage: 0,
				towerDamage: 0,
				recent: [] as boolean[],
				scoreWeight: 0,
				scoreWins: 0,
				scoreKills: 0,
				scoreDeaths: 0,
				scoreAssists: 0,
				scoreImpact: 0,
				recentWinRate: getHeroScoreGroupPrior(row.role).winRate,
				recentKda: getHeroScoreGroupPrior(row.role).kda,
				recentImpact: getHeroScoreGroupPrior(row.role).impact,
				performancePulse: 0,
				recentPerformance: [] as PlayerBucket['recentPerformance'],
				roles: new Map<number, number>(),
				lastPlayed: row.startTime,
				scoreGroup: getHeroScoreGroup(row.role),
				scorePrior: getHeroScoreGroupPrior(row.role)
			} satisfies PlayerBucket);

		bucket.matches += 1;
		bucket.wins += row.team === row.winner ? 1 : 0;
		bucket.kills += row.kills;
		bucket.deaths += row.deaths;
		bucket.assists += row.assists;
		bucket.impact += row.impact;
		bucket.duration += row.duration;
		bucket.gpm += row.gpm ?? 0;
		bucket.xpm += row.xpm ?? 0;
		bucket.lastHits += row.lastHits ?? 0;
		bucket.heroDamage += row.heroDamage ?? 0;
		bucket.towerDamage += row.towerDamage ?? 0;
		const evidenceScale = getHeroScoreEvidenceScale(bucket.scoreWeight, scoreWeight);
		bucket.scoreWeight *= evidenceScale;
		bucket.scoreWins *= evidenceScale;
		bucket.scoreKills *= evidenceScale;
		bucket.scoreDeaths *= evidenceScale;
		bucket.scoreAssists *= evidenceScale;
		bucket.scoreImpact *= evidenceScale;
		bucket.scoreWeight += scoreWeight;
		bucket.scoreWins += row.team === row.winner ? scoreWeight : 0;
		bucket.scoreKills += row.kills * scoreWeight;
		bucket.scoreDeaths += row.deaths * scoreWeight;
		bucket.scoreAssists += row.assists * scoreWeight;
		const cappedImpact = Math.min(row.impact, HERO_SCORE_IMPACT_MATCH_CAP);
		bucket.scoreImpact += row.impact * scoreWeight;
		if (bucket.matches > 1) {
			bucket.recentWinRate = decayHeroScoreRecentValue(
				bucket.recentWinRate,
				bucket.scorePrior.winRate,
				bucket.lastPlayed,
				row.startTime
			);
			bucket.recentKda = decayHeroScoreRecentValue(
				bucket.recentKda,
				bucket.scorePrior.kda,
				bucket.lastPlayed,
				row.startTime
			);
			bucket.recentImpact = decayHeroScoreRecentValue(
				bucket.recentImpact,
				bucket.scorePrior.impact,
				bucket.lastPlayed,
				row.startTime
			);
		}
		bucket.recentWinRate = updateHeroScoreRecentAverage(
			bucket.recentWinRate,
			row.team === row.winner ? 100 : 0
		);
		const matchKda = Math.min(6, getKda(row.kills, row.deaths, row.assists));
		bucket.recentKda = updateHeroScoreRecentAverage(bucket.recentKda, matchKda);
		bucket.recentImpact = updateHeroScoreRecentAverage(bucket.recentImpact, cappedImpact);
		bucket.performancePulse = updateHeroScorePerformancePulse(
			bucket.performancePulse,
			cappedImpact,
			matchKda,
			bucket.scorePrior
		);
		bucket.recentPerformance.push({
			isWin: row.team === row.winner,
			kills: row.kills,
			deaths: row.deaths,
			assists: row.assists,
			impact: row.impact
		});
		if (bucket.recentPerformance.length > HERO_SCORE_RECENT_PERFORMANCE_MATCHES) {
			bucket.recentPerformance.shift();
		}
		bucket.roles.set(row.role, (bucket.roles.get(row.role) ?? 0) + 1);
		bucket.lastPlayed = Math.max(bucket.lastPlayed, row.startTime);
		bucket.recent.push(row.team === row.winner);
		if (bucket.recent.length > 10) bucket.recent.shift();

		buckets.set(row.playerId, bucket);
	}

	return Array.from(buckets.values())
		.filter((bucket) => includeUncalibrated || bucket.matches >= HERO_CALIBRATION_MATCHES)
		.map((bucket) => {
			const scoreDetails = getPlayerScoreDetails(bucket, referenceTime);
			const wins = bucket.wins;
			const losses = bucket.matches - bucket.wins;

			return {
				playerId: bucket.playerId,
				username: bucket.username,
				smurf: bucket.smurf,
				matches: bucket.matches,
				wins,
				losses,
				winRate: bucket.matches > 0 ? (wins / bucket.matches) * 100 : 0,
				recentForm: bucket.recent.map((win) => (win ? 'W' : 'L')).join(''),
				avgKills: toAverage(bucket.kills, bucket.matches),
				avgDeaths: toAverage(bucket.deaths, bucket.matches),
				avgAssists: toAverage(bucket.assists, bucket.matches),
				kda: getKda(bucket.kills, bucket.deaths, bucket.assists),
				avgImpact: toAverage(bucket.impact, bucket.matches),
				avgDuration: toAverage(bucket.duration, bucket.matches),
				avgGpm: toAverage(bucket.gpm, bucket.matches),
				avgXpm: toAverage(bucket.xpm, bucket.matches),
				avgLastHits: toAverage(bucket.lastHits, bucket.matches),
				avgHeroDamage: toAverage(bucket.heroDamage, bucket.matches),
				avgTowerDamage: toAverage(bucket.towerDamage, bucket.matches),
				primaryRole: getRoleLeader(bucket.roles),
				scoreGroup: bucket.scoreGroup,
				score: scoreDetails.score,
				scoreWinRate: scoreDetails.scoreWinRate,
				scoreRecentRate: scoreDetails.scoreRecentRate,
				scoreKda: scoreDetails.scoreKda,
				scoreAvgImpact: scoreDetails.scoreAvgImpact,
				performancePulse: 0,
				volumeScore: scoreDetails.volumeScore,
				sampleWeight: scoreDetails.sampleWeight,
				effectiveMatches: bucket.matches,
				confidence: getScoreBand(bucket.matches, bucket.matches),
				mastery: getHeroMastery(bucket.matches),
				lastPlayed: bucket.lastPlayed
			};
		})
		.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			return b.matches - a.matches;
		});
};

export const getHeroScoreGroupRankings = (rows: HeroStatsRow[], includeUncalibrated = false) =>
	Object.fromEntries(
		(['core', 'support'] as HeroScoreGroup[]).map((scoreGroup) => [
			scoreGroup,
			getHeroPlayerRankings(rows, includeUncalibrated, scoreGroup)
		])
	) as Record<HeroScoreGroup, HeroPlayerRanking[]>;
