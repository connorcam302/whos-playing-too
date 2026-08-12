import {
	HERO_SCORE_RECENT_PERFORMANCE_MATCHES,
	blendHeroScorePerformance,
	getHeroScoreBreakdown,
	getHeroScoreRecencyWeight,
	getHeroScoreSampleWeight,
	getHeroScoreVolumeScore
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
	score: number;
	scoreWinRate: number;
	scoreKda: number;
	scoreAvgImpact: number;
	volumeScore: number;
	sampleWeight: number;
	confidence: string;
	lastPlayed: number;
};

export type HeroScoreHistoryRow = {
	heroId: number;
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
	scoreBefore: number | null;
	scoreAfter: number | null;
	scoreChange: number | null;
	becameCalibrated: boolean;
};

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
	recentPerformanceMatches: number;
	recentPerformanceWins: number;
	recentPerformanceKills: number;
	recentPerformanceDeaths: number;
	recentPerformanceAssists: number;
	recentPerformanceImpact: number;
	roles: Map<number, number>;
	lastPlayed: number;
};

export const HERO_CALIBRATION_MATCHES = 10;

export const toAverage = (value: number, count: number) => (count > 0 ? value / count : 0);

export const getKda = (kills: number, deaths: number, assists: number) =>
	deaths === 0 ? kills + assists : (kills + assists) / deaths;

export const getSampleWeight = (matches: number) => getHeroScoreSampleWeight(matches);

export const getVolumeScore = (matches: number) => getHeroScoreVolumeScore(matches);

export const getScoreBand = (matches: number) => {
	if (matches < HERO_CALIBRATION_MATCHES) return 'Uncalibrated';
	return 'Proven';
};

export const getPlayerHeroScoreHistory = (
	rows: HeroScoreHistoryRow[],
	referenceTime = Math.floor(Date.now() / 1000)
) => {
	const history = new Map<number, HeroScoreHistoryEntry>();
	const rowsByHero = new Map<number, HeroScoreHistoryRow[]>();

	for (const row of rows) {
		const heroRows = rowsByHero.get(row.heroId) ?? [];
		heroRows.push(row);
		rowsByHero.set(row.heroId, heroRows);
	}

	for (const heroRows of rowsByHero.values()) {
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
		const recent: boolean[] = [];
		const recentPerformance: HeroScoreHistoryRow[] = [];

		for (const row of sortedRows) {
			const weight = getHeroScoreRecencyWeight(row.startTime, referenceTime);
			const isWin = row.team === row.winner;

			matches += 1;
			scoreWeight += weight;
			scoreWins += isWin ? weight : 0;
			scoreKills += row.kills * weight;
			scoreDeaths += row.deaths * weight;
			scoreAssists += row.assists * weight;
			scoreImpact += row.impact * weight;
			recent.push(isWin);
			if (recent.length > 10) recent.shift();
			recentPerformance.push(row);
			if (recentPerformance.length > HERO_SCORE_RECENT_PERFORMANCE_MATCHES) {
				recentPerformance.shift();
			}

			const recentPerformanceWins = recentPerformance.filter(
				(match) => match.team === match.winner
			).length;
			const recentPerformanceKills = recentPerformance.reduce(
				(total, match) => total + match.kills,
				0
			);
			const recentPerformanceDeaths = recentPerformance.reduce(
				(total, match) => total + match.deaths,
				0
			);
			const recentPerformanceAssists = recentPerformance.reduce(
				(total, match) => total + match.assists,
				0
			);
			const recentPerformanceImpact = recentPerformance.reduce(
				(total, match) => total + match.impact,
				0
			);
			const historicalWinRate = toAverage(scoreWins, scoreWeight) * 100;
			const historicalKda = getKda(
				toAverage(scoreKills, scoreWeight),
				toAverage(scoreDeaths, scoreWeight),
				toAverage(scoreAssists, scoreWeight)
			);
			const historicalAvgImpact = toAverage(scoreImpact, scoreWeight);
			const recentPerformanceWinRate =
				toAverage(recentPerformanceWins, recentPerformance.length) * 100;
			const recentPerformanceKda = getKda(
				toAverage(recentPerformanceKills, recentPerformance.length),
				toAverage(recentPerformanceDeaths, recentPerformance.length),
				toAverage(recentPerformanceAssists, recentPerformance.length)
			);
			const recentPerformanceAvgImpact = toAverage(
				recentPerformanceImpact,
				recentPerformance.length
			);
			const scoreWinRate = blendHeroScorePerformance(historicalWinRate, recentPerformanceWinRate);
			const scoreKda = blendHeroScorePerformance(historicalKda, recentPerformanceKda);
			const scoreAvgImpact = blendHeroScorePerformance(
				historicalAvgImpact,
				recentPerformanceAvgImpact
			);
			const recentRate = (recent.filter(Boolean).length / recent.length) * 100;
			const score = getHeroScoreBreakdown({
				winRate: scoreWinRate,
				recentRate,
				avgImpact: scoreAvgImpact,
				kda: scoreKda,
				matches
			}).score;
			const isCalibrated = matches >= HERO_CALIBRATION_MATCHES;
			const scoreAfter = isCalibrated ? score : null;

			history.set(row.matchId, {
				matchNumber: matches,
				scoreBefore: previousScore,
				scoreAfter,
				scoreChange:
					previousScore !== null && scoreAfter !== null ? scoreAfter - previousScore : null,
				becameCalibrated: matches === HERO_CALIBRATION_MATCHES
			});

			previousScore = scoreAfter;
		}
	}

	return history;
};

const getPlayerScoreDetails = (bucket: PlayerBucket) => {
	const historicalWinRate = toAverage(bucket.scoreWins, bucket.scoreWeight) * 100;
	const recentWins = bucket.recent.filter(Boolean).length;
	const recentRate =
		bucket.recent.length > 0 ? (recentWins / bucket.recent.length) * 100 : historicalWinRate;
	const historicalKda = getKda(
		toAverage(bucket.scoreKills, bucket.scoreWeight),
		toAverage(bucket.scoreDeaths, bucket.scoreWeight),
		toAverage(bucket.scoreAssists, bucket.scoreWeight)
	);
	const historicalAvgImpact = toAverage(bucket.scoreImpact, bucket.scoreWeight);
	const recentPerformanceWinRate =
		toAverage(bucket.recentPerformanceWins, bucket.recentPerformanceMatches) * 100;
	const recentPerformanceKda = getKda(
		toAverage(bucket.recentPerformanceKills, bucket.recentPerformanceMatches),
		toAverage(bucket.recentPerformanceDeaths, bucket.recentPerformanceMatches),
		toAverage(bucket.recentPerformanceAssists, bucket.recentPerformanceMatches)
	);
	const recentPerformanceAvgImpact = toAverage(
		bucket.recentPerformanceImpact,
		bucket.recentPerformanceMatches
	);
	const scoreWinRate = blendHeroScorePerformance(historicalWinRate, recentPerformanceWinRate);
	const scoreKda = blendHeroScorePerformance(historicalKda, recentPerformanceKda);
	const scoreAvgImpact = blendHeroScorePerformance(historicalAvgImpact, recentPerformanceAvgImpact);
	const breakdown = getHeroScoreBreakdown({
		winRate: scoreWinRate,
		recentRate,
		avgImpact: scoreAvgImpact,
		kda: scoreKda,
		matches: bucket.matches
	});

	return {
		...breakdown,
		scoreWinRate,
		scoreKda,
		scoreAvgImpact
	};
};

export const getPlayerScore = (bucket: PlayerBucket) => getPlayerScoreDetails(bucket).score;

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
	includeUncalibrated = false
): HeroPlayerRanking[] => {
	const buckets = new Map<number, PlayerBucket>();
	const referenceTime = rows.reduce(
		(latest, row) => Math.max(latest, row.startTime),
		Math.floor(Date.now() / 1000)
	);
	const sortedRows = rows.slice().sort((a, b) => b.startTime - a.startTime);

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
				recent: [],
				scoreWeight: 0,
				scoreWins: 0,
				scoreKills: 0,
				scoreDeaths: 0,
				scoreAssists: 0,
				scoreImpact: 0,
				recentPerformanceMatches: 0,
				recentPerformanceWins: 0,
				recentPerformanceKills: 0,
				recentPerformanceDeaths: 0,
				recentPerformanceAssists: 0,
				recentPerformanceImpact: 0,
				roles: new Map<number, number>(),
				lastPlayed: row.startTime
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
		bucket.scoreWeight += scoreWeight;
		bucket.scoreWins += row.team === row.winner ? scoreWeight : 0;
		bucket.scoreKills += row.kills * scoreWeight;
		bucket.scoreDeaths += row.deaths * scoreWeight;
		bucket.scoreAssists += row.assists * scoreWeight;
		bucket.scoreImpact += row.impact * scoreWeight;
		if (bucket.recentPerformanceMatches < HERO_SCORE_RECENT_PERFORMANCE_MATCHES) {
			bucket.recentPerformanceMatches += 1;
			bucket.recentPerformanceWins += row.team === row.winner ? 1 : 0;
			bucket.recentPerformanceKills += row.kills;
			bucket.recentPerformanceDeaths += row.deaths;
			bucket.recentPerformanceAssists += row.assists;
			bucket.recentPerformanceImpact += row.impact;
		}
		bucket.roles.set(row.role, (bucket.roles.get(row.role) ?? 0) + 1);
		bucket.lastPlayed = Math.max(bucket.lastPlayed, row.startTime);
		if (bucket.recent.length < 10) {
			bucket.recent.push(row.team === row.winner);
		}

		buckets.set(row.playerId, bucket);
	}

	return Array.from(buckets.values())
		.filter((bucket) => includeUncalibrated || bucket.matches >= HERO_CALIBRATION_MATCHES)
		.map((bucket) => {
			const scoreDetails = getPlayerScoreDetails(bucket);
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
				score: scoreDetails.score,
				scoreWinRate: scoreDetails.scoreWinRate,
				scoreKda: scoreDetails.scoreKda,
				scoreAvgImpact: scoreDetails.scoreAvgImpact,
				volumeScore: scoreDetails.volumeScore,
				sampleWeight: scoreDetails.sampleWeight,
				confidence: getScoreBand(bucket.matches),
				lastPlayed: bucket.lastPlayed
			};
		})
		.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			return b.matches - a.matches;
		});
};
