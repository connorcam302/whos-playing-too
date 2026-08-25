import { and, desc, eq, gt, gte, inArray, lt, not, sql } from 'drizzle-orm';
import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import {
	getHeroPlayerRankings,
	type HeroPlayerRanking,
	type HeroStatsRow
} from '$lib/server/heroStats';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';

type RoleMatchRow = HeroStatsRow & {
	heroId: number;
	heroName: string;
	heroImg: string;
};

type RoleRanking = HeroPlayerRanking & {
	previousRank: number | null;
	rankChange: number | null;
	topHero: {
		id: number;
		name: string;
		img: string;
		matches: number;
	} | null;
};

const visiblePlayerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(players.id, hiddenFromAggregatePlayerIds))
		: sql`true`;

const getMonthKey = (timestamp: number) => {
	const date = new Date(timestamp * 1000);
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

const getMonthRange = (monthKey: string) => {
	const [year, month] = monthKey.split('-').map(Number);
	return {
		start: Date.UTC(year, month - 1, 1) / 1000,
		end: Date.UTC(year, month, 1) / 1000
	};
};

const getRowsForMonth = async (monthKey: string): Promise<RoleMatchRow[]> => {
	const { start, end } = getMonthRange(monthKey);

	return db
		.select({
			playerId: players.id,
			username: players.username,
			smurf: accounts.smurf,
			startTime: matches.startTime,
			duration: matches.duration,
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
			towerDamage: matchData.towerDamage,
			heroId: heroes.id,
			heroName: heroes.name,
			heroImg: heroes.img
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(players.id, accounts.owner))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				gt(matches.duration, 900),
				gte(matches.startTime, start),
				lt(matches.startTime, end),
				inArray(matchData.role, [1, 2, 3, 4, 5]),
				visiblePlayerFilter()
			)
		)
		.orderBy(desc(matches.startTime));
};

const getTopHero = (rows: RoleMatchRow[], playerId: number) => {
	const heroCounts = new Map<
		number,
		{ id: number; name: string; img: string; matches: number; wins: number }
	>();

	for (const row of rows) {
		if (row.playerId !== playerId) continue;
		const hero = heroCounts.get(row.heroId) ?? {
			id: row.heroId,
			name: row.heroName,
			img: row.heroImg,
			matches: 0,
			wins: 0
		};
		hero.matches += 1;
		hero.wins += row.team === row.winner ? 1 : 0;
		heroCounts.set(row.heroId, hero);
	}

	const [topHero] = Array.from(heroCounts.values()).sort(
		(a, b) => b.matches - a.matches || b.wins - a.wins || a.name.localeCompare(b.name)
	);
	if (!topHero) return null;
	return {
		id: topHero.id,
		name: topHero.name,
		img: topHero.img,
		matches: topHero.matches
	};
};

const getRoleRankings = (
	rows: RoleMatchRow[],
	role: number,
	previousRows: RoleMatchRow[]
): RoleRanking[] => {
	const roleRows = rows.filter((row) => row.role === role);
	const previousRankings = getHeroPlayerRankings(
		previousRows.filter((row) => row.role === role),
		true
	);
	const previousRanks = new Map(
		previousRankings.map((ranking, index) => [ranking.playerId, index + 1])
	);

	return getHeroPlayerRankings(roleRows, true).map((ranking, index) => {
		const previousRank = previousRanks.get(ranking.playerId) ?? null;
		return {
			...ranking,
			previousRank,
			rankChange: previousRank === null ? null : previousRank - (index + 1),
			topHero: getTopHero(roleRows, ranking.playerId)
		};
	});
};

export const load = async ({ url }) => {
	const requestedRole = Number(url.searchParams.get('role'));
	const selectedRole = [1, 2, 3, 4, 5].includes(requestedRole) ? requestedRole : 1;
	const matchTimes = await db
		.select({ startTime: matches.startTime })
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(players.id, accounts.owner))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				gt(matches.duration, 900),
				inArray(matchData.role, [1, 2, 3, 4, 5]),
				visiblePlayerFilter()
			)
		)
		.groupBy(matches.startTime)
		.orderBy(desc(matches.startTime));
	const availableMonths = Array.from(
		new Set(matchTimes.map((match) => getMonthKey(match.startTime)))
	);
	const requestedMonth = url.searchParams.get('month');
	const selectedMonth =
		requestedMonth && availableMonths.includes(requestedMonth)
			? requestedMonth
			: (availableMonths[0] ?? getMonthKey(Math.floor(Date.now() / 1000)));
	const selectedMonthIndex = availableMonths.indexOf(selectedMonth);
	const previousMonth = availableMonths[selectedMonthIndex + 1] ?? null;
	const [rows, previousRows] = await Promise.all([
		getRowsForMonth(selectedMonth),
		previousMonth ? getRowsForMonth(previousMonth) : Promise.resolve([])
	]);

	const roles = [1, 2, 3, 4, 5].map((role) => {
		const roleRows = rows.filter((row) => row.role === role);
		const rankings = getRoleRankings(rows, role, previousRows);
		const wins = roleRows.filter((row) => row.team === row.winner).length;
		return {
			role,
			matches: roleRows.length,
			wins,
			losses: roleRows.length - wins,
			winRate: roleRows.length > 0 ? (wins / roleRows.length) * 100 : 0,
			players: rankings.length,
			leader: rankings[0] ?? null,
			rankings
		};
	});

	return {
		roles,
		selectedRole,
		availableMonths,
		selectedMonth,
		isLatestMonth: selectedMonth === availableMonths[0],
		previousMonth,
		totalPerformances: rows.length,
		activePlayers: new Set(rows.map((row) => row.playerId)).size
	};
};
