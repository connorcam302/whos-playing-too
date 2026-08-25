import type { HeroStatsRow } from '$lib/server/heroStats';

export const HERO_MMR_START = 1000;
export const HERO_MMR_BASE_CHANGE = 25;
export const HERO_MMR_MIN_CHANGE = 15;
export const HERO_MMR_MAX_CHANGE = 35;
export const HERO_MMR_NEUTRAL_IMPACT = 85;
export const HERO_MMR_CALIBRATION_MATCHES = 20;
export const HERO_MMR_CALIBRATION_SCALE = 12;

export type HeroMmrPlayerRanking = {
	playerId: number;
	username: string;
	smurf: boolean;
	matches: number;
	wins: number;
	losses: number;
	winRate: number;
	recentForm: string;
	avgImpact: number;
	primaryRole: number;
	mmr: number;
	initialMmr: number;
	mmrChange: number;
	totalChange: number;
	peakMmr: number;
	lastPlayed: number;
};

type HeroMmrBucket = {
	playerId: number;
	username: string;
	smurf: boolean;
	matches: number;
	wins: number;
	impact: number;
	role: number;
	mmr: number;
	initialMmr: number | null;
	mmrChange: number;
	peakMmr: number;
	calibrationChanges: number[];
	recent: boolean[];
	lastPlayed: number;
};

const clamp = (value: number, minimum: number, maximum: number) =>
	Math.min(maximum, Math.max(minimum, value));

export const getHeroMmrChange = (isWin: boolean, impact: number) => {
	const safeImpact = Number.isFinite(impact) ? impact : HERO_MMR_NEUTRAL_IMPACT;
	const impactAdjustment = clamp(((safeImpact - HERO_MMR_NEUTRAL_IMPACT) / 55) * 10, -10, 10);
	const magnitude = isWin
		? HERO_MMR_BASE_CHANGE + impactAdjustment
		: HERO_MMR_BASE_CHANGE - impactAdjustment;
	const boundedMagnitude = Math.round(clamp(magnitude, HERO_MMR_MIN_CHANGE, HERO_MMR_MAX_CHANGE));

	return isWin ? boundedMagnitude : -boundedMagnitude;
};

export const getHeroInitialMmr = (changes: number[]) => {
	if (changes.length !== HERO_MMR_CALIBRATION_MATCHES) return null;
	const averageChange = changes.reduce((total, change) => total + change, 0) / changes.length;
	return Math.round(HERO_MMR_START + averageChange * HERO_MMR_CALIBRATION_SCALE);
};

export const getHeroMmrRankings = (rows: HeroStatsRow[], role: number): HeroMmrPlayerRanking[] => {
	const buckets = new Map<number, HeroMmrBucket>();
	const sortedRows = rows
		.filter((row) => row.role === role)
		.slice()
		.sort((a, b) => a.startTime - b.startTime || a.playerId - b.playerId);

	for (const row of sortedRows) {
		const isWin = row.team === row.winner;
		const resultChange = getHeroMmrChange(isWin, row.impact);
		const bucket =
			buckets.get(row.playerId) ??
			({
				playerId: row.playerId,
				username: row.username,
				smurf: row.smurf,
				matches: 0,
				wins: 0,
				impact: 0,
				role,
				mmr: HERO_MMR_START,
				initialMmr: null,
				mmrChange: 0,
				peakMmr: HERO_MMR_START,
				calibrationChanges: [],
				recent: [],
				lastPlayed: row.startTime
			} satisfies HeroMmrBucket);

		bucket.matches += 1;
		bucket.wins += isWin ? 1 : 0;
		bucket.impact += row.impact;
		if (bucket.matches <= HERO_MMR_CALIBRATION_MATCHES) {
			bucket.calibrationChanges.push(resultChange);
			if (bucket.matches === HERO_MMR_CALIBRATION_MATCHES) {
				const initialMmr = getHeroInitialMmr(bucket.calibrationChanges);
				bucket.initialMmr = initialMmr ?? HERO_MMR_START;
				bucket.mmr = bucket.initialMmr;
				bucket.mmrChange = bucket.initialMmr - HERO_MMR_START;
				bucket.peakMmr = bucket.initialMmr;
			}
		} else {
			bucket.mmr += resultChange;
			bucket.mmrChange = resultChange;
			bucket.peakMmr = Math.max(bucket.peakMmr, bucket.mmr);
		}
		bucket.lastPlayed = Math.max(bucket.lastPlayed, row.startTime);
		bucket.recent.push(isWin);
		if (bucket.recent.length > 10) bucket.recent.shift();

		buckets.set(row.playerId, bucket);
	}

	return Array.from(buckets.values())
		.filter((bucket) => bucket.matches >= HERO_MMR_CALIBRATION_MATCHES)
		.map((bucket) => ({
			playerId: bucket.playerId,
			username: bucket.username,
			smurf: bucket.smurf,
			matches: bucket.matches,
			wins: bucket.wins,
			losses: bucket.matches - bucket.wins,
			winRate: bucket.matches > 0 ? (bucket.wins / bucket.matches) * 100 : 0,
			recentForm: bucket.recent.map((win) => (win ? 'W' : 'L')).join(''),
			avgImpact: bucket.matches > 0 ? bucket.impact / bucket.matches : 0,
			primaryRole: bucket.role,
			mmr: bucket.mmr,
			initialMmr: bucket.initialMmr ?? HERO_MMR_START,
			mmrChange: bucket.mmrChange,
			totalChange: bucket.mmr - HERO_MMR_START,
			peakMmr: bucket.peakMmr,
			lastPlayed: bucket.lastPlayed
		}))
		.sort((a, b) => b.mmr - a.mmr || b.matches - a.matches || a.username.localeCompare(b.username));
};

export const getHeroMmrRoleRankings = (rows: HeroStatsRow[]) =>
	Object.fromEntries(
		[1, 2, 3, 4, 5].map((role) => [role, getHeroMmrRankings(rows, role)])
	) as Record<number, HeroMmrPlayerRanking[]>;
