import { error } from '@sveltejs/kit';
import { and, desc, eq, gt } from 'drizzle-orm';
import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import { getHeroIdSting } from '$lib/functions';

type HeroMatchRow = {
	playerId: number;
	username: string;
	smurf: boolean;
	matchId: number;
	sequenceNumber: number | null;
	startTime: number;
	duration: number;
	lobby: number;
	gameMode: number;
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

const toAverage = (value: number, count: number) => (count > 0 ? value / count : 0);

const getKda = (kills: number, deaths: number, assists: number) =>
	deaths === 0 ? kills + assists : (kills + assists) / deaths;

const getSampleWeight = (matches: number) => Math.min(1, Math.log(matches + 1) / Math.log(25));

const getVolumeScore = (matches: number) => Math.min(100, (Math.log(matches + 1) / Math.log(101)) * 100);

const getScoreBand = (matches: number) => {
	if (matches < 3) return 'Low sample';
	if (matches < 6) return 'Developing';
	return 'Proven';
};

const getPlayerScore = (bucket: PlayerBucket) => {
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

const getRoleLeader = (roles: Map<number, number>) => {
	const [role] =
		Array.from(roles.entries()).sort((a, b) => {
			if (b[1] !== a[1]) return b[1] - a[1];
			return a[0] - b[0];
		})[0] ?? [];

	return role ?? 0;
};

const makeDurationBands = (rows: HeroMatchRow[]) => {
	const maxDuration = Math.max(0, ...rows.map((row) => row.duration));
	const maxBand = Math.ceil(maxDuration / 300) * 5;
	const minBand = rows.length > 0 ? Math.floor(Math.min(...rows.map((row) => row.duration)) / 300) * 5 : 0;
	const bands = [];

	for (let start = minBand; start <= maxBand; start += 5) {
		const end = start + 5;
		const matchesInBand = rows.filter((row) => row.duration >= start * 60 && row.duration < end * 60);
		const wins = matchesInBand.filter((row) => row.team === row.winner).length;

		bands.push({
			label: `${start}-${end}m`,
			start,
			end,
			matches: matchesInBand.length,
			wins,
			losses: matchesInBand.length - wins,
			winRate: matchesInBand.length > 0 ? (wins / matchesInBand.length) * 100 : 0
		});
	}

	return bands;
};

const getRecord = (title: string, metric: string, rows: HeroMatchRow[], accessor: (row: HeroMatchRow) => number) => {
	const row = rows.slice().sort((a, b) => accessor(b) - accessor(a))[0];

	if (!row) return null;

	return {
		title,
		metric,
		value: accessor(row),
		match: row
	};
};

export const load = async ({ params }) => {
	const heroId = Number(params.id);

	if (!Number.isFinite(heroId)) {
		throw error(404, 'Hero not found');
	}

	const hero = await db
		.select({
			id: heroes.id,
			name: heroes.name,
			img: heroes.img
		})
		.from(heroes)
		.where(eq(heroes.id, heroId))
		.limit(1);

	if (!hero[0]) {
		throw error(404, 'Hero not found');
	}

	const heroSlug = getHeroIdSting(heroId)?.replace('npc_dota_hero_', '') ?? '';
	const heroRenderImg = heroSlug
		? `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${heroSlug}.png`
		: hero[0].img;

	const rows: HeroMatchRow[] = await db
		.select({
			playerId: players.id,
			username: players.username,
			smurf: accounts.smurf,
			matchId: matches.id,
			sequenceNumber: matches.sequenceNumber,
			startTime: matches.startTime,
			duration: matches.duration,
			lobby: matches.lobby,
			gameMode: matches.gameMode,
			winner: matches.winner,
			team: matchData.team,
			role: matchData.role,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			heroDamage: matchData.heroDamage,
			towerDamage: matchData.towerDamage
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(players.id, accounts.owner))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(and(eq(matchData.heroId, heroId), gt(matches.duration, 900)))
		.orderBy(desc(matches.startTime));

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

	const playerRankings = Array.from(buckets.values())
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

	const roleBreakdown = [1, 2, 3, 4, 5].map((role) => {
		const roleRows = rows.filter((row) => row.role === role);
		const wins = roleRows.filter((row) => row.team === row.winner).length;

		return {
			role,
			matches: roleRows.length,
			wins,
			losses: roleRows.length - wins,
			winRate: roleRows.length > 0 ? (wins / roleRows.length) * 100 : 0,
			avgImpact: toAverage(
				roleRows.reduce((total, row) => total + row.impact, 0),
				roleRows.length
			),
			avgDuration: toAverage(
				roleRows.reduce((total, row) => total + row.duration, 0),
				roleRows.length
			),
			avgKills: toAverage(
				roleRows.reduce((total, row) => total + row.kills, 0),
				roleRows.length
			),
			avgDeaths: toAverage(
				roleRows.reduce((total, row) => total + row.deaths, 0),
				roleRows.length
			),
			avgAssists: toAverage(
				roleRows.reduce((total, row) => total + row.assists, 0),
				roleRows.length
			),
			avgLastHits: toAverage(
				roleRows.reduce((total, row) => total + (row.lastHits ?? 0), 0),
				roleRows.length
			)
		};
	});

	const wins = rows.filter((row) => row.team === row.winner).length;
	const recentRows = rows.slice(0, 10);
	const recentWins = recentRows.filter((row) => row.team === row.winner).length;
	const bestPlayer = playerRankings[0] ?? null;
	const mostPlayedBy = playerRankings.slice().sort((a, b) => b.matches - a.matches)[0] ?? null;
	const primaryRole = roleBreakdown.slice().sort((a, b) => b.matches - a.matches)[0]?.role ?? 0;

	const records = [
		getRecord('Most Kills', 'Kills', rows, (row) => row.kills),
		getRecord('Most Assists', 'Assists', rows, (row) => row.assists),
		getRecord('Highest Impact', 'Impact', rows, (row) => row.impact),
		getRecord('Highest GPM', 'GPM', rows, (row) => row.gpm ?? 0),
		getRecord('Highest XPM', 'XPM', rows, (row) => row.xpm ?? 0),
		getRecord('Most Hero Damage', 'Hero Damage', rows, (row) => row.heroDamage ?? 0),
		getRecord('Most Building Damage', 'Building Damage', rows, (row) => row.towerDamage ?? 0)
	].filter(Boolean);

	return {
		hero: {
			...hero[0],
			renderImg: heroRenderImg
		},
		summary: {
			matches: rows.length,
			wins,
			losses: rows.length - wins,
			winRate: rows.length > 0 ? (wins / rows.length) * 100 : 0,
			recentForm: recentRows.map((row) => (row.team === row.winner ? 'W' : 'L')).join(''),
			recentWinRate: recentRows.length > 0 ? (recentWins / recentRows.length) * 100 : 0,
			avgImpact: toAverage(
				rows.reduce((total, row) => total + row.impact, 0),
				rows.length
			),
			avgDuration: toAverage(
				rows.reduce((total, row) => total + row.duration, 0),
				rows.length
			),
			avgKills: toAverage(
				rows.reduce((total, row) => total + row.kills, 0),
				rows.length
			),
			avgDeaths: toAverage(
				rows.reduce((total, row) => total + row.deaths, 0),
				rows.length
			),
			avgAssists: toAverage(
				rows.reduce((total, row) => total + row.assists, 0),
				rows.length
			),
			avgLastHits: toAverage(
				rows.reduce((total, row) => total + (row.lastHits ?? 0), 0),
				rows.length
			),
			primaryRole,
			bestPlayer,
			mostPlayedBy
		},
		playerRankings,
		roleBreakdown,
		durationBands: makeDurationBands(rows),
		records,
		matches: rows
	};
};
