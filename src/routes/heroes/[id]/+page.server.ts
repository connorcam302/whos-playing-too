import { error } from '@sveltejs/kit';
import { and, desc, eq, gt, inArray, not, sql } from 'drizzle-orm';
import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import { getHeroIdSting } from '$lib/functions';
import {
	getHeroPlayerRankings,
	getHeroScoreGroupRankings,
	getRoleLeader,
	toAverage,
	type HeroStatsRow
} from '$lib/server/heroStats';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';

type HeroMatchRow = HeroStatsRow & {
	matchId: number;
	sequenceNumber: number | null;
	lobby: number;
	gameMode: number;
};

const makeDurationBands = (rows: HeroMatchRow[]) => {
	const maxDuration = Math.max(0, ...rows.map((row) => row.duration));
	const maxBand = Math.ceil(maxDuration / 300) * 5;
	const minBand =
		rows.length > 0 ? Math.floor(Math.min(...rows.map((row) => row.duration)) / 300) * 5 : 0;
	const bands = [];

	for (let start = minBand; start <= maxBand; start += 5) {
		const end = start + 5;
		const matchesInBand = rows.filter(
			(row) => row.duration >= start * 60 && row.duration < end * 60
		);
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

const getRecord = (
	title: string,
	metric: string,
	rows: HeroMatchRow[],
	accessor: (row: HeroMatchRow) => number
) => {
	const row = rows.slice().sort((a, b) => accessor(b) - accessor(a))[0];

	if (!row) return null;

	return {
		title,
		metric,
		value: accessor(row),
		match: row
	};
};

const visiblePlayerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(players.id, hiddenFromAggregatePlayerIds))
		: sql`true`;

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
		.where(and(eq(matchData.heroId, heroId), gt(matches.duration, 900), visiblePlayerFilter()))
		.orderBy(desc(matches.startTime));

	const playerRankings = getHeroPlayerRankings(rows);
	const roleRankings = getHeroScoreGroupRankings(rows);

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
	const bestPlayer =
		Object.values(roleRankings)
			.flat()
			.sort((a, b) => b.score - a.score || b.matches - a.matches)[0] ?? null;
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
		roleRankings,
		roleBreakdown,
		durationBands: makeDurationBands(rows),
		records,
		matches: rows
	};
};
