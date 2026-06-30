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
	volumeScore: number;
	sampleWeight: number;
	confidence: string;
	lastPlayed: number;
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
	roles: Map<number, number>;
	lastPlayed: number;
};

export const toAverage = (value: number, count: number) => (count > 0 ? value / count : 0);

export const getKda = (kills: number, deaths: number, assists: number) =>
	deaths === 0 ? kills + assists : (kills + assists) / deaths;

export const getSampleWeight = (matches: number) =>
	Math.min(1, Math.log(matches + 1) / Math.log(25));

export const getVolumeScore = (matches: number) =>
	Math.min(100, (Math.log(matches + 1) / Math.log(101)) * 100);

export const getScoreBand = (matches: number) => {
	if (matches < 3) return 'Low sample';
	if (matches < 6) return 'Developing';
	return 'Proven';
};

export const getPlayerScore = (bucket: PlayerBucket) => {
	const winRate = bucket.matches > 0 ? (bucket.wins / bucket.matches) * 100 : 0;
	const recentWins = bucket.recent.filter(Boolean).length;
	const recentRate = bucket.recent.length > 0 ? (recentWins / bucket.recent.length) * 100 : winRate;
	const avgImpact = toAverage(bucket.impact, bucket.matches);
	const kda = getKda(bucket.kills, bucket.deaths, bucket.assists);
	const sampleWeight = getSampleWeight(bucket.matches);
	const volumeScore = getVolumeScore(bucket.matches);
	const impactScore = Math.min(100, (avgImpact / 150) * 100);
	const kdaScore = Math.min(100, (kda / 6) * 100);
	const performanceScore = winRate * 0.3 + recentRate * 0.1 + impactScore * 0.25 + kdaScore * 0.15;

	return Math.round(performanceScore * sampleWeight + volumeScore * 0.2);
};

export const getRoleLeader = (roles: Map<number, number>) => {
	const [role] =
		Array.from(roles.entries()).sort((a, b) => {
			if (b[1] !== a[1]) return b[1] - a[1];
			return a[0] - b[0];
		})[0] ?? [];

	return role ?? 0;
};

export const getHeroPlayerRankings = (rows: HeroStatsRow[]): HeroPlayerRanking[] => {
	const buckets = new Map<number, PlayerBucket>();

	for (const row of rows) {
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
		bucket.roles.set(row.role, (bucket.roles.get(row.role) ?? 0) + 1);
		bucket.lastPlayed = Math.max(bucket.lastPlayed, row.startTime);
		if (bucket.recent.length < 10) {
			bucket.recent.push(row.team === row.winner);
		}

		buckets.set(row.playerId, bucket);
	}

	return Array.from(buckets.values())
		.map((bucket) => {
			const score = getPlayerScore(bucket);
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
				score,
				volumeScore: getVolumeScore(bucket.matches),
				sampleWeight: getSampleWeight(bucket.matches),
				confidence: getScoreBand(bucket.matches),
				lastPlayed: bucket.lastPlayed
			};
		})
		.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			return b.matches - a.matches;
		});
};
