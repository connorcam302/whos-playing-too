import { db } from '$lib/server/database';
import {
	accounts,
	flopOfTheWeek,
	heroes,
	matchData,
	matches,
	players,
	teamOfTheWeek
} from '$lib/server/schema';
import { heroData, type Hero } from '$lib/data/heroData';
import {
	eq,
	sql,
	and,
	desc,
	or,
	gte,
	lte,
	ne,
	gt,
	avg,
	inArray,
	countDistinct,
	count,
	not
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { getHeroString } from './private-functions';
import { env } from '$env/dynamic/private';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { heroMap } from '$lib/data/heroMap';
import type { DateRangeBounds } from '$lib/data/dotaPatchRanges';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';

dayjs.extend(utc);
dayjs.extend(timezone);

type RecordsDateFilter = number | DateRangeBounds;

type GetPlayersOptions = {
	includeHiddenFromAggregates?: boolean;
};

const visiblePlayerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(players.id, hiddenFromAggregatePlayerIds))
		: sql`true`;

const visibleAccountOwnerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(accounts.owner, hiddenFromAggregatePlayerIds))
		: sql`true`;

const getRecordsDateFilter = (dateFilter: RecordsDateFilter = 31) => {
	if (typeof dateFilter === 'number') {
		return gte(matches.startTime, dayjs().subtract(dateFilter, 'day').unix());
	}

	const filters = [];
	if (dateFilter.start !== null) {
		filters.push(gte(matches.startTime, dateFilter.start));
	}
	if (dateFilter.end !== null) {
		filters.push(lte(matches.startTime, dateFilter.end));
	}

	return filters.length > 0 ? and(...filters) : sql`true`;
};

export const getHeroStats = async (
	offset: number = dayjs(0).add(2, 'week').valueOf() / 1000,
	player: number = 0
) => {
	let heroMatches: any;
	let heroWinsRadiant: any;
	let heroWinsDire: any;
	let heroAvgImpact: any;
	let heroAvgKills: any;
	let heroAvgDeaths: any;
	let heroAvgAssists: any;

	if (player === 0) {
		heroMatches = await db
			.select({
				hero: matchData.heroId,
				matches: sql<number>`cast(count(${matchData.matchId}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					visibleAccountOwnerFilter()
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroWinsRadiant = await db
			.select({
				hero: matchData.heroId,
				radiantWins: sql<number>`cast(count(${matchData.matchId}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					eq(matchData.team, 'radiant'),
					eq(matches.winner, 'radiant'),
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					visibleAccountOwnerFilter()
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroWinsDire = await db
			.select({
				hero: matchData.heroId,
				direWins: sql<number>`cast(count(${matchData.matchId}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					eq(matchData.team, 'dire'),
					eq(matches.winner, 'dire'),
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					visibleAccountOwnerFilter()
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroAvgImpact = await db
			.select({
				hero: matchData.heroId,
				avgImpact: sql<number>`cast(avg(${matchData.impact}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					visibleAccountOwnerFilter()
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroAvgKills = await db
			.select({
				hero: matchData.heroId,
				avgKills: sql<number>`cast(avg(${matchData.kills}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					visibleAccountOwnerFilter()
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroAvgDeaths = await db
			.select({
				hero: matchData.heroId,
				avgDeaths: sql<number>`cast(avg(${matchData.deaths}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					visibleAccountOwnerFilter()
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroAvgAssists = await db
			.select({
				hero: matchData.heroId,
				avgAssists: sql<number>`cast(avg(${matchData.assists}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					visibleAccountOwnerFilter()
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);
	} else {
		heroMatches = await db
			.select({
				hero: matchData.heroId,
				matches: sql<number>`cast(count(${matchData.matchId}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					eq(accounts.owner, player)
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroWinsRadiant = await db
			.select({
				hero: matchData.heroId,
				radiantWins: sql<number>`cast(count(${matchData.matchId}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					eq(matchData.team, 'radiant'),
					eq(matches.winner, 'radiant'),
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					eq(accounts.owner, player)
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroWinsDire = await db
			.select({
				hero: matchData.heroId,
				direWins: sql<number>`cast(count(${matchData.matchId}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					eq(matchData.team, 'dire'),
					eq(matches.winner, 'dire'),
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					eq(accounts.owner, player)
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroAvgImpact = await db
			.select({
				hero: matchData.heroId,
				avgImpact: sql<number>`cast(avg(${matchData.impact}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					eq(accounts.owner, player)
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroAvgKills = await db
			.select({
				hero: matchData.heroId,
				avgKills: sql<number>`cast(avg(${matchData.kills}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					eq(accounts.owner, player)
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroAvgDeaths = await db
			.select({
				hero: matchData.heroId,
				avgDeaths: sql<number>`cast(avg(${matchData.deaths}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					eq(accounts.owner, player)
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroAvgAssists = await db
			.select({
				hero: matchData.heroId,
				avgAssists: sql<number>`cast(avg(${matchData.assists}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.where(
				and(
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
					eq(accounts.owner, player)
				)
			)
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);
	}
	const heroData: {
		hero: DotaAsset;
		matches: number;
		radiantWins: number;
		direWins: number;
		avgImpact: number;
		avgKills: number;
		avgDeaths: number;
		avgAssists: number;
	}[] = [];
	heroMatches.forEach((hero: { hero: number; matches: number }) => {
		const radiantWin = heroWinsRadiant.find(
			(heroWin: { hero: number; matches: number }) => heroWin.hero === hero.hero
		);
		const direWin = heroWinsDire.find(
			(heroWin: { hero: number; matches: number }) => heroWin.hero === hero.hero
		);
		const avgImpact = heroAvgImpact.find(
			(heroWin: { hero: number; matches: number }) => heroWin.hero === hero.hero
		);
		const avgKills = heroAvgKills.find(
			(heroWin: { hero: number; matches: number }) => heroWin.hero === hero.hero
		);
		const avgDeaths = heroAvgDeaths.find(
			(heroWin: { hero: number; matches: number }) => heroWin.hero === hero.hero
		);
		const avgAssists = heroAvgAssists.find(
			(heroWin: { hero: number; matches: number }) => heroWin.hero === hero.hero
		);

		heroData.push({
			hero: heroMap.get(hero.hero),
			matches: hero.matches,
			radiantWins: radiantWin?.radiantWins || 0,
			direWins: direWin?.direWins || 0,
			avgImpact: avgImpact?.avgImpact || 0,
			avgKills: avgKills?.avgKills || 0,
			avgDeaths: avgDeaths?.avgDeaths || 0,
			avgAssists: avgAssists?.avgAssists || 0
		});
	});
	const sortedHeroData = heroData.sort((a, b) => b.matches - a.matches);

	return sortedHeroData;
};

export const getRecentHeroPoolStats = async (player: number, limit: number = 50) => {
	const recentRows = await db
		.select({
			hero: matchData.heroId,
			matchId: matchData.matchId,
			team: matchData.team,
			winner: matches.winner,
			avgImpact: matchData.impact,
			avgKills: matchData.kills,
			avgDeaths: matchData.deaths,
			avgAssists: matchData.assists,
			startTime: matches.startTime,
			role: matchData.role
		})
		.from(matchData)
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.where(eq(accounts.owner, player))
		.orderBy(desc(matches.startTime))
		.limit(limit);

	const heroBuckets = new Map<
		number,
		{
			hero: DotaAsset;
			matches: number;
			radiantWins: number;
			direWins: number;
			impactTotal: number;
			killsTotal: number;
			deathsTotal: number;
			assistsTotal: number;
			latestStartTime: number;
			roleCounts: Map<number, number>;
		}
	>();

	for (const row of recentRows) {
		const bucket = heroBuckets.get(row.hero) ?? {
			hero: heroMap.get(row.hero),
			matches: 0,
			radiantWins: 0,
			direWins: 0,
			impactTotal: 0,
			killsTotal: 0,
			deathsTotal: 0,
			assistsTotal: 0,
			latestStartTime: 0,
			roleCounts: new Map<number, number>()
		};

		bucket.matches += 1;
		if (row.role) bucket.roleCounts.set(row.role, (bucket.roleCounts.get(row.role) ?? 0) + 1);
		bucket.impactTotal += row.avgImpact ?? 0;
		bucket.killsTotal += row.avgKills ?? 0;
		bucket.deathsTotal += row.avgDeaths ?? 0;
		bucket.assistsTotal += row.avgAssists ?? 0;
		bucket.latestStartTime = Math.max(bucket.latestStartTime, row.startTime ?? 0);

		if (row.team === 'radiant' && row.winner === 'radiant') {
			bucket.radiantWins += 1;
		}
		if (row.team === 'dire' && row.winner === 'dire') {
			bucket.direWins += 1;
		}

		heroBuckets.set(row.hero, bucket);
	}

	return Array.from(heroBuckets.values())
		.map((bucket) => ({
			hero: bucket.hero,
			matches: bucket.matches,
			radiantWins: bucket.radiantWins,
			direWins: bucket.direWins,
			avgImpact: Math.round(bucket.impactTotal / bucket.matches),
			avgKills: Math.round(bucket.killsTotal / bucket.matches),
			avgDeaths: Math.round(bucket.deathsTotal / bucket.matches),
			avgAssists: Math.round(bucket.assistsTotal / bucket.matches),
			latestStartTime: bucket.latestStartTime,
			role:
				bucket.roleCounts.size > 0
					? [...bucket.roleCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
					: 0
		}))
		.sort((a, b) => b.matches - a.matches);
};

export const getAllPlayerStats = async (
	offset: number = dayjs(0).add(2, 'week').valueOf() / 1000
) => {
	const playerMatches = await db
		.select({
			id: players.id,
			username: players.username,
			matches: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(gte(matches.startTime, Math.floor(Date.now() / 1000) - offset), visiblePlayerFilter())
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const playerWinsRadiant = await db
		.select({
			id: players.id,
			username: players.username,
			radiantWins: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				eq(matchData.team, 'radiant'),
				eq(matches.winner, 'radiant'),
				gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
				visiblePlayerFilter()
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const playerWinsDire = await db
		.select({
			id: players.id,
			username: players.username,
			direWins: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				eq(matchData.team, 'dire'),
				eq(matches.winner, 'dire'),
				gte(matches.startTime, Math.floor(Date.now() / 1000) - offset),
				visiblePlayerFilter()
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const playerAvgImpact = await db
		.select({
			id: players.id,
			username: players.username,
			avgImpact: sql<number>`cast(avg(${matchData.impact}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(gte(matches.startTime, Math.floor(Date.now() / 1000) - offset), visiblePlayerFilter())
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const playerData: {
		id: number;
		username: string;
		matches: number;
		radiantWins: number;
		direWins: number;
		avgImpact: number;
	}[] = [];

	playerMatches.forEach((player) => {
		const radiantWin = playerWinsRadiant.find((playerWin) => playerWin.id === player.id);
		const direWin = playerWinsDire.find((playerWin) => playerWin.id === player.id);
		const avgImpact = playerAvgImpact.find((playerWin) => playerWin.id === player.id);

		playerData.push({
			id: player.id,
			username: player.username,
			matches: player.matches,
			radiantWins: radiantWin?.radiantWins || 0,
			direWins: direWin?.direWins || 0,
			avgImpact: avgImpact?.avgImpact || 0
		});
	});
	const sortedHeroData = playerData.sort((a, b) => b.matches - a.matches);

	return sortedHeroData;
};

export const getPlayers = async (options: GetPlayersOptions = {}) => {
	const playerList = await db
		.select({
			id: players.id,
			username: players.username,
			accounts: sql<Array<{ accountId: number }>>`array_agg(${accounts.accountId})`
		})
		.from(players)
		.innerJoin(accounts, eq(players.id, accounts.owner))
		.where(options.includeHiddenFromAggregates ? sql`true` : visiblePlayerFilter())
		.orderBy(players.username)
		.groupBy(players.id);

	return playerList;
};

export const getAllAccounts = async () => {
	const accountsList = await db.select().from(accounts);
	return accountsList;
};

export const getTeamOfTheWeek = async () => {
	const totw = await db.select().from(teamOfTheWeek).orderBy(desc(teamOfTheWeek.id)).limit(1);

	const playerList = await db.select().from(players);

	const totwPlayers = [
		totw[0].onePlayer,
		totw[0].twoPlayer,
		totw[0].threePlayer,
		totw[0].fourPlayer,
		totw[0].fivePlayer
	];

	const ids = [
		totw[0].oneMatch,
		totw[0].twoMatch,
		totw[0].threeMatch,
		totw[0].fourMatch,
		totw[0].fiveMatch
	];

	const sequenceIds = ids.map(async (id) => {
		const sequenceId = await db.select().from(matches).where(eq(matches.id, id));
		return sequenceId[0].sequenceNumber;
	});

	const gameData = await Promise.all(
		ids.map(async (id, i) => {
			const data = await db
				.select()
				.from(matchData)
				.where(and(eq(matchData.matchId, id), eq(players.id, totwPlayers[i])))
				.fullJoin(accounts, eq(accounts.accountId, matchData.playerId))
				.fullJoin(players, eq(players.id, accounts.owner))
				.fullJoin(matches, eq(matches.id, matchData.matchId));
			return {
				playerData: {
					...data[0].match_data,
					hero: {
						id: data[0].match_data?.heroId
					}
				},
				matchData: data[0].matches
			};
		})
	);

	const totwWithIds = [
		{
			id: ids[0],
			sequence: await sequenceIds[0],
			player: {
				name: playerList.find((player) => player.id === totw[0].onePlayer)?.username,
				id: totw[0].onePlayer
			},
			hero: heroData.find((hero) => hero.id === totw[0].oneHero)?.name,
			role: 1,
			gameData: await gameData[0]
		},
		{
			id: ids[1],
			sequence: await sequenceIds[1],
			player: {
				name: playerList.find((player) => player.id === totw[0].twoPlayer)?.username,
				id: totw[0].twoPlayer
			},
			hero: heroData.find((hero) => hero.id === totw[0].twoHero)?.name,
			role: 2,
			gameData: await gameData[1]
		},
		{
			id: ids[2],
			sequence: await sequenceIds[2],
			player: {
				name: playerList.find((player) => player.id === totw[0].threePlayer)?.username,
				id: totw[0].threePlayer
			},
			hero: heroData.find((hero) => hero.id === totw[0].threeHero)?.name,
			role: 3,
			gameData: await gameData[2]
		},
		{
			id: ids[3],
			sequence: await sequenceIds[3],
			player: {
				name: playerList.find((player) => player.id === totw[0].fourPlayer)?.username,
				id: totw[0].fourPlayer
			},
			hero: heroData.find((hero) => hero.id === totw[0].fourHero)?.name,
			role: 4,
			gameData: await gameData[3]
		},
		{
			id: ids[4],
			sequence: await sequenceIds[4],
			player: {
				name: playerList.find((player) => player.id === totw[0].fivePlayer)?.username,
				id: totw[0].fivePlayer
			},
			hero: heroData.find((hero) => hero.id === totw[0].fiveHero)?.name,
			role: 5,
			gameData: await gameData[4]
		}
	];

	return totwWithIds.filter(
		(feature) => !hiddenFromAggregatePlayerIds.includes(Number(feature.player.id))
	);
};

export const getFlopOfTheWeek = async () => {
	const fotw = await db.select().from(flopOfTheWeek).orderBy(desc(flopOfTheWeek.id)).limit(1);

	const playerList = await db.select().from(players);

	const fotwPlayers = [
		fotw[0].onePlayer,
		fotw[0].twoPlayer,
		fotw[0].threePlayer,
		fotw[0].fourPlayer,
		fotw[0].fivePlayer
	];

	const ids = [
		fotw[0].oneMatch,
		fotw[0].twoMatch,
		fotw[0].threeMatch,
		fotw[0].fourMatch,
		fotw[0].fiveMatch
	];

	const sequenceIds = ids.map(async (id) => {
		const sequenceId = await db.select().from(matches).where(eq(matches.id, id));
		return sequenceId[0].sequenceNumber;
	});

	const gameData = await Promise.all(
		ids.map(async (id, i) => {
			const data = await db
				.select()
				.from(matchData)
				.where(and(eq(matchData.matchId, id), eq(players.id, fotwPlayers[i])))
				.fullJoin(accounts, eq(accounts.accountId, matchData.playerId))
				.fullJoin(players, eq(players.id, accounts.owner))
				.fullJoin(matches, eq(matches.id, matchData.matchId));
			return {
				playerData: {
					...data[0].match_data,
					hero: {
						id: data[0].match_data?.heroId
					}
				},
				matchData: data[0].matches
			};
		})
	);

	const fotwWithIds = [
		{
			id: ids[0],
			sequence: await sequenceIds[0],
			player: {
				name: playerList.find((player) => player.id === fotw[0].onePlayer)?.username,
				id: fotw[0].onePlayer
			},
			hero: heroData.find((hero) => hero.id === fotw[0].oneHero)?.name,
			role: 1,
			gameData: await gameData[0]
		},
		{
			id: ids[1],
			sequence: await sequenceIds[1],
			player: {
				name: playerList.find((player) => player.id === fotw[0].twoPlayer)?.username,
				id: fotw[0].twoPlayer
			},
			hero: heroData.find((hero) => hero.id === fotw[0].twoHero)?.name,
			role: 2,
			gameData: await gameData[1]
		},
		{
			id: ids[2],
			sequence: await sequenceIds[2],
			player: {
				name: playerList.find((player) => player.id === fotw[0].threePlayer)?.username,
				id: fotw[0].threePlayer
			},
			hero: heroData.find((hero) => hero.id === fotw[0].threeHero)?.name,
			role: 3,
			gameData: await gameData[2]
		},
		{
			id: ids[3],
			sequence: await sequenceIds[3],
			player: {
				name: playerList.find((player) => player.id === fotw[0].fourPlayer)?.username,
				id: fotw[0].fourPlayer
			},
			hero: heroData.find((hero) => hero.id === fotw[0].fourHero)?.name,
			role: 4,
			gameData: await gameData[3]
		},
		{
			id: ids[4],
			sequence: await sequenceIds[4],
			player: {
				name: playerList.find((player) => player.id === fotw[0].fivePlayer)?.username,
				id: fotw[0].fivePlayer
			},
			hero: heroData.find((hero) => hero.id === fotw[0].fiveHero)?.name,
			role: 5,
			gameData: await gameData[4]
		}
	];

	return fotwWithIds.filter(
		(feature) => !hiddenFromAggregatePlayerIds.includes(Number(feature.player.id))
	);
};

export const getFeatures = async () => {
	const mostKills = await db
		.select({
			id: players.id,
			sequenceNumber: matches.sequenceNumber,
			username: players.username,
			kills: matchData.kills,
			matchId: matchData.matchId,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(accounts.smurf, false),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				visiblePlayerFilter()
			)
		)
		.orderBy(desc(matchData.kills))
		.limit(3);
	const mostDeaths = await db
		.select({
			id: players.id,
			sequenceNumber: matches.sequenceNumber,
			username: players.username,
			deaths: matchData.deaths,
			matchId: matchData.matchId,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(accounts.smurf, false),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				visiblePlayerFilter()
			)
		)
		.orderBy(desc(matchData.deaths))
		.limit(3);
	const mostAssists = await db
		.select({
			id: players.id,
			sequenceNumber: matches.sequenceNumber,
			username: players.username,
			assists: matchData.assists,
			matchId: matchData.matchId,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(accounts.smurf, false),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				visiblePlayerFilter()
			)
		)
		.orderBy(desc(matchData.assists))
		.limit(3);
	const mostGPM = await db
		.select({
			id: players.id,
			sequenceNumber: matches.sequenceNumber,
			username: players.username,
			gpm: matchData.goldPerMin,
			matchId: matchData.matchId,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(accounts.smurf, false),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				visiblePlayerFilter()
			)
		)
		.orderBy(desc(matchData.goldPerMin))
		.limit(3);
	const mostXPM = await db
		.select({
			id: players.id,
			sequenceNumber: matches.sequenceNumber,
			username: players.username,
			xpm: matchData.xpPerMin,
			matchId: matchData.matchId,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(accounts.smurf, false),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				visiblePlayerFilter()
			)
		)
		.orderBy(desc(matchData.xpPerMin))
		.limit(3);
	const mostImpact = await db
		.select({
			id: players.id,
			sequenceNumber: matches.sequenceNumber,
			username: players.username,
			impact: matchData.impact,
			matchId: matchData.matchId,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(accounts.smurf, false),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				visiblePlayerFilter()
			)
		)
		.orderBy(desc(matchData.impact))
		.limit(3);
	const leastImpact = await db
		.select({
			id: players.id,
			sequenceNumber: matches.sequenceNumber,
			username: players.username,
			impact: matchData.impact,
			matchId: matchData.matchId,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(accounts.smurf, false),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				visiblePlayerFilter()
			)
		)
		.orderBy(matchData.impact)
		.limit(3);

	const mostLastHits = await db
		.select({
			id: players.id,
			sequenceNumber: matches.sequenceNumber,
			username: players.username,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(accounts.smurf, false),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				visiblePlayerFilter()
			)
		)
		.orderBy(desc(matchData.lastHits))
		.limit(3);
	const mostHeroDamage = await db
		.select({
			id: players.id,
			sequenceNumber: matches.sequenceNumber,
			username: players.username,
			heroDamage: matchData.heroDamage,
			matchId: matchData.matchId,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(accounts.smurf, false),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				visiblePlayerFilter()
			)
		)
		.orderBy(desc(matchData.heroDamage))
		.limit(3);

	const leastHeroDamage = await db
		.select({
			id: players.id,
			sequenceNumber: matches.sequenceNumber,
			username: players.username,
			heroDamage: matchData.heroDamage,
			matchId: matchData.matchId,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(accounts.smurf, false),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				visiblePlayerFilter()
			)
		)
		.orderBy(matchData.heroDamage)
		.limit(3);

	const playerList = await db.select().from(players).where(visiblePlayerFilter());
	const playerWins = await db
		.select({
			id: players.id,
			username: players.username,
			wins: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire'))
				),
				eq(matches.lobby, 7),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				eq(accounts.smurf, false),
				visiblePlayerFilter()
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const playerLosses = await db
		.select({
			id: players.id,
			username: players.username,
			losses: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'dire')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'radiant'))
				),
				gte(matches.startTime, dayjs().subtract(7, 'day').unix()),
				eq(matches.lobby, 7),
				eq(accounts.smurf, false),
				visiblePlayerFilter()
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const playersChange = playerList.map((player) => {
		const wins = playerWins.find((playerWin) => playerWin.id === player.id)?.wins || 0;
		const losses = playerLosses.find((playerWin) => playerWin.id === player.id)?.losses || 0;

		return {
			...player,
			winLoss: wins - losses
		};
	});

	const mostGained = playersChange.sort((a, b) => b.winLoss - a.winLoss).slice(0, 3);
	const mostLost = playersChange.sort((a, b) => a.winLoss - b.winLoss).slice(0, 3);

	return {
		mostKills,
		mostDeaths,
		mostAssists,
		mostGPM,
		mostXPM,
		mostImpact,
		leastImpact,
		mostLastHits,
		mostHeroDamage,
		leastHeroDamage,
		mostGained,
		mostLost
	};
};

export const getPlayer = async (id: number) => {
	const mainAccountPlayer = await db
		.select({
			id: players.id,
			username: players.username,
			accountId: accounts.accountId,
			image: accounts.image
		})
		.from(players)
		.where(and(eq(players.id, id), eq(accounts.smurf, false)))
		.innerJoin(accounts, eq(accounts.owner, players.id));

	if (mainAccountPlayer[0]) {
		return mainAccountPlayer[0];
	}

	const anyAccountPlayer = await db
		.select({
			id: players.id,
			username: players.username,
			accountId: accounts.accountId,
			image: accounts.image
		})
		.from(players)
		.where(eq(players.id, id))
		.innerJoin(accounts, eq(accounts.owner, players.id));

	if (anyAccountPlayer[0]) {
		return anyAccountPlayer[0];
	}

	const player = await db
		.select({
			id: players.id,
			username: players.username
		})
		.from(players)
		.where(eq(players.id, id));

	return player[0]
		? {
				...player[0],
				accountId: 0,
				image: ''
			}
		: undefined;
};

export const getAccounts = async (id: number) => {
	const accountsList = await db.select().from(accounts).where(eq(accounts.owner, id));
	return accountsList;
};

export const getSmurfAccounts = async (id: number) => {
	const accountsList = await db
		.select()
		.from(accounts)
		.where(and(eq(accounts.owner, id), eq(accounts.smurf, true)));
	return accountsList;
};

export const getPlayerWinLoss = async (id: number, offset: number = 7) => {
	const rankedWins = await db
		.select({
			wins: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire'))
				),
				eq(matches.lobby, 7),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(accounts.smurf, false),
				eq(players.id, id)
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const rankedLosses = await db
		.select({
			losses: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'dire')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'radiant'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.lobby, 7),
				eq(accounts.smurf, false),
				eq(players.id, id)
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const wins = await db
		.select({
			wins: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(players.id, id)
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);
	const losses = await db
		.select({
			losses: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'dire')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'radiant'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(players.id, id)
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);

	return {
		rankedWins: rankedWins[0]?.wins || 0,
		rankedLosses: rankedLosses[0]?.losses || 0,
		wins: wins[0]?.wins || 0,
		losses: losses[0]?.losses || 0
	};
};

export const getPlayerChart = async (id: number, offset: number = 7) => {
	const wins = await db
		.select({
			startTime: matches.startTime,
			match: matches.id
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(players.id, id),
				eq(matches.lobby, 7)
			)
		);

	const losses = await db
		.select({
			startTime: matches.startTime,
			match: matches.id
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'dire')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'radiant'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(players.id, id),
				eq(matches.lobby, 7)
			)
		);

	const daysArray = new Array(offset).fill(0);

	daysArray.forEach((day, index) => {
		const dayWins = wins.filter(
			(match) =>
				match.startTime >
					dayjs()
						.subtract(offset - index, 'day')
						.unix() &&
				match.startTime <
					dayjs()
						.subtract(offset - (index + 1), 'day')
						.unix()
		).length;

		const dayLosses = losses.filter(
			(match) =>
				match.startTime >
					dayjs()
						.subtract(offset - index, 'day')
						.unix() &&
				match.startTime <
					dayjs()
						.subtract(offset - (index + 1), 'day')
						.unix()
		).length;
		if (index === 0) {
			daysArray[index] = dayWins - dayLosses;
		} else {
			daysArray[index] = dayWins - dayLosses + daysArray[index - 1];
		}
	});

	const winsResult = wins.map((win) => ({ ...win, result: 'win' }));
	const lossesResult = losses.map((loss) => ({ ...loss, result: 'loss' }));

	const matchCount = wins.length + losses.length;

	const gamesArray = [...winsResult, ...lossesResult].sort((a, b) => a.startTime - b.startTime);
	let resultsArray: number[] = [];

	gamesArray.forEach((game, index) => {
		if (index === 0) {
			resultsArray = [game.result === 'win' ? 1 : -1];
		} else {
			resultsArray = [...resultsArray, resultsArray[index - 1] + (game.result === 'win' ? 1 : -1)];
		}
	});

	return { daysArray, resultsArray, matchCount };
};

export const getMatchesByDay = async (id: number, offset: number = 12) => {
	// Get all matches for the player in the specified time range
	const wins = await db
		.select({
			startTime: matches.startTime,
			match: matches.id
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(players.id, id)
			)
		);

	const losses = await db
		.select({
			startTime: matches.startTime,
			match: matches.id
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'dire')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'radiant'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(players.id, id)
			)
		);

	const daysArray = new Array(offset).fill(0);

	const days = Array.from({ length: offset }, (_, i) => {
		const date = dayjs().subtract(i, 'day');
		return {
			minDate: date.startOf('day').unix(),
			maxDate: date.endOf('day').unix()
		};
	});

	days.forEach((day, index) => {
		const dayWins = wins.filter(
			(match) => match.startTime > day.minDate && match.startTime < day.maxDate
		).length;
		const dayLosses = losses.filter(
			(match) => match.startTime > day.minDate && match.startTime < day.maxDate
		).length;

		daysArray[index] = { wins: dayWins, losses: dayLosses, date: day.minDate };
	});

	return daysArray;
};

export const getMostKills = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}
	const mostKills = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),
				gt(matches.duration, 900)
			)
		)
		.orderBy(desc(matchData.kills))
		.limit(games);

	const data = mostKills.map((match) => {
		return {
			record: match.kills,
			data: match
		};
	});
	return data;
};

export const getMostDeaths = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}
	const mostDeaths = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),

				gt(matches.duration, 900)
			)
		)
		.orderBy(desc(matchData.deaths))
		.limit(games);

	const data = mostDeaths.map((match) => {
		return {
			record: match.deaths,
			data: match
		};
	});
	return data;
};

export const getMostAssists = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}
	const mostAssists = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),
				gt(matches.duration, 900)
			)
		)
		.orderBy(desc(matchData.assists))
		.limit(games);

	const data = mostAssists.map((match) => {
		return {
			record: match.assists,
			data: match
		};
	});

	return data;
};

export const getHighestImpact = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}
	const highestImpact = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),
				gt(matches.duration, 900)
			)
		)
		.orderBy(desc(matchData.impact))
		.limit(games);

	const data = highestImpact.map((match) => {
		return {
			record: match.impact,
			data: match
		};
	});

	return data;
};

export const getLowestImpact = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}
	const lowestImpact = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),
				gt(matches.duration, 900)
			)
		)
		.orderBy(matchData.impact)
		.limit(games);

	const data = lowestImpact.map((match) => {
		return {
			record: match.impact,
			data: match
		};
	});

	return data;
};

export const getMostGPM = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}
	const mostGPM = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),
				gt(matches.duration, 900)
			)
		)
		.orderBy(desc(matchData.goldPerMin))
		.limit(games);

	const data = mostGPM.map((match) => {
		return {
			record: match.gpm,
			data: match
		};
	});
	return data;
};

export const getMostXPM = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}
	const mostXPM = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),
				gt(matches.duration, 900)
			)
		)
		.orderBy(desc(matchData.xpPerMin))
		.limit(games);

	const data = mostXPM.map((match) => {
		return {
			record: match.xpm,
			data: match
		};
	});

	return data;
};

export const getMostLastHits = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}
	const mostLastHits = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),
				gt(matches.duration, 900)
			)
		)
		.orderBy(desc(matchData.lastHits))
		.limit(games);

	const data = mostLastHits.map((match) => {
		return {
			record: match.lastHits,
			data: match
		};
	});
	return data;
};

export const getMostHeroDamage = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}
	const mostHeroDamage = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			heroDamage: matchData.heroDamage,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),
				gt(matches.duration, 900),
				gt(matchData.heroDamage, 0)
			)
		)
		.orderBy(desc(matchData.heroDamage))
		.limit(games);

	const data = mostHeroDamage.map((match) => {
		return {
			record: match.heroDamage,
			data: match
		};
	});
	return data;
};

export const getLeastHeroDamage = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}
	const leastHeroDamage = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			heroDamage: matchData.heroDamage,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),
				gt(matches.duration, 900)
			)
		)
		.orderBy(matchData.heroDamage)
		.limit(games);

	const data = leastHeroDamage.map((match) => {
		return {
			record: match.heroDamage,
			data: match
		};
	});
	return data;
};

export const getMostBuildingDamage = async (
	games: number = 10,
	smurfFilter: boolean = false,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}

	const mostBuildingDamage = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			towerDamage: matchData.towerDamage,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
				visiblePlayerFilter(),

				gt(matches.duration, 900),
				gt(matchData.towerDamage, 0)
			)
		)
		.orderBy(desc(matchData.towerDamage))
		.limit(games);

	const data = mostBuildingDamage.map((match) => {
		return {
			record: match.towerDamage,
			data: match
		};
	});

	return data;
};

export const getPlayerStats = async (
	id: number,
	dateFilter: RecordsDateFilter = 31,
	roleFilter: number[] = [1, 2, 3, 4, 5],
	lobbyFilter: number[] = [0, 7],
	hero: number = -1,
	smurfFilter: boolean = false
) => {
	let heroFilter;
	if (hero === -1) {
		heroFilter = Array.from(Array(138).keys(), (x) => x + 1);
	} else {
		heroFilter = [hero];
	}

	const playerData = await db
		.select({
			id: players.id,
			username: players.username
		})
		.from(players)
		.where(eq(players.id, id));

	const rankedWins = await db
		.select({
			wins: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire'))
				),
				getRecordsDateFilter(dateFilter),
				eq(matches.lobby, 7),
				eq(players.id, id),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter])
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const rankedLosses = await db
		.select({
			losses: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'dire')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'radiant'))
				),
				getRecordsDateFilter(dateFilter),
				eq(matches.lobby, 7),
				eq(players.id, id),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter])
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const wins = await db
		.select({
			wins: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire'))
				),
				eq(matches.gameMode, 22),
				getRecordsDateFilter(dateFilter),
				eq(players.id, id),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter])
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);
	const losses = await db
		.select({
			losses: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(players)
		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'dire')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'radiant'))
				),
				eq(matches.gameMode, 22),
				getRecordsDateFilter(dateFilter),
				eq(players.id, id),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter])
			)
		)
		.groupBy(players.id)
		.orderBy(players.id);

	const playerStats = await db
		.select({
			id: players.id,
			kills: avg(matchData.kills),
			deaths: avg(matchData.deaths),
			assists: avg(matchData.assists),
			lastHits: avg(matchData.lastHits),
			heroDamage: avg(matchData.heroDamage),
			towerDamage: avg(matchData.towerDamage),
			gpm: avg(matchData.goldPerMin),
			xpm: avg(matchData.xpPerMin),
			impact: avg(matchData.impact),
			duration: avg(matches.duration),
			versatility: countDistinct(matchData.heroId)
		})
		.from(players)
		.where(
			and(
				eq(players.id, id),
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter])
			)
		)

		.innerJoin(accounts, eq(accounts.owner, players.id))
		.innerJoin(matchData, eq(accounts.accountId, matchData.playerId))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.groupBy(players.id);

	const roles = await db
		.select({
			role: matchData.role,
			count: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				eq(players.id, id),
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter])
			)
		)
		.groupBy(matchData.role);

	const mostPlayedHeroesRaw = await db
		.select({
			count: sql<number>`cast(count(${matchData.matchId}) as int)`,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				eq(players.id, id),
				getRecordsDateFilter(dateFilter),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter])
			)
		)
		.groupBy(heroes.id)
		.orderBy(desc(sql<number>`count(${matchData.matchId})`))
		.limit(3);

	const mostPlayedHeroes = [
		...mostPlayedHeroesRaw,
		...new Array(Math.max(0, 3 - mostPlayedHeroesRaw.length)).fill(null)
	];

	return {
		mostPlayedHeroes,
		rankedWins: rankedWins[0]?.wins || 0,
		rankedLosses: rankedLosses[0]?.losses || 0,
		wins: wins[0]?.wins || 0,
		losses: losses[0]?.losses || 0,
		...playerData[0],
		kills: playerStats[0]?.kills || 0,
		deaths: playerStats[0]?.deaths || 0,
		assists: playerStats[0]?.assists || 0,
		lastHits: playerStats[0]?.lastHits || 0,
		heroDamage: playerStats[0]?.heroDamage || 0,
		towerDamage: playerStats[0]?.towerDamage || 0,
		versatility: playerStats[0]?.versatility || 0,
		gpm: playerStats[0]?.gpm || 0,
		xpm: playerStats[0]?.xpm || 0,
		impact: playerStats[0]?.impact || 0,
		duration: playerStats[0]?.duration || '99999999999999',
		roleDistribution: roles
	};
};

export const getTOTWCounts = async () => {
	const oneCount = await db
		.select({
			player: {
				id: players.id,
				username: players.username
			},
			matches: sql<
				Array<{ row_id: number; matchId: number | null }>
			>`array_agg(CASE WHEN ${teamOfTheWeek.oneMatch} IS NULL THEN ${teamOfTheWeek.id}::text || ',NULL' ELSE ${teamOfTheWeek.id}|| ',' || ${teamOfTheWeek.oneMatch} END)`
		})
		.from(teamOfTheWeek)
		.innerJoin(players, eq(players.id, teamOfTheWeek.onePlayer))
		.groupBy(players.id);
	const twoCount = await db
		.select({
			player: {
				id: players.id,
				username: players.username
			},
			matches: sql<
				Array<{ row_id: number; matchId: number | null }>
			>`array_agg(CASE WHEN ${teamOfTheWeek.twoMatch} IS NULL THEN ${teamOfTheWeek.id}::text || ',NULL' ELSE ${teamOfTheWeek.id}|| ',' || ${teamOfTheWeek.twoMatch} END)`
		})
		.from(teamOfTheWeek)
		.innerJoin(players, eq(players.id, teamOfTheWeek.twoPlayer))
		.groupBy(players.id);

	const threeCount = await db
		.select({
			player: {
				id: players.id,
				username: players.username
			},
			matches: sql<
				Array<{ row_id: number; matchId: number | null }>
			>`array_agg(CASE WHEN ${teamOfTheWeek.threeMatch} IS NULL THEN ${teamOfTheWeek.id}::text || ',NULL' ELSE ${teamOfTheWeek.id}|| ',' || ${teamOfTheWeek.threeMatch} END)`
		})
		.from(teamOfTheWeek)
		.innerJoin(players, eq(players.id, teamOfTheWeek.threePlayer))
		.groupBy(players.id);

	const fourCount = await db
		.select({
			player: {
				id: players.id,
				username: players.username
			},
			matches: sql<
				Array<{ row_id: number; matchId: number | null }>
			>`array_agg(CASE WHEN ${teamOfTheWeek.fourMatch} IS NULL THEN ${teamOfTheWeek.id}::text || ',NULL' ELSE ${teamOfTheWeek.id}|| ',' || ${teamOfTheWeek.fourMatch} END)`
		})
		.from(teamOfTheWeek)
		.innerJoin(players, eq(players.id, teamOfTheWeek.fourPlayer))
		.groupBy(players.id);

	const fiveCount = await db
		.select({
			player: {
				id: players.id,
				username: players.username
			},
			matches: sql<
				Array<{ row_id: number; matchId: number | null }>
			>`array_agg(CASE WHEN ${teamOfTheWeek.fiveMatch} IS NULL THEN ${teamOfTheWeek.id}::text || ',NULL' ELSE ${teamOfTheWeek.id}|| ',' || ${teamOfTheWeek.fiveMatch}  END)`
		})
		.from(teamOfTheWeek)
		.innerJoin(players, eq(players.id, teamOfTheWeek.fivePlayer))
		.groupBy(players.id);

	const playerList = await db
		.select({
			id: players.id,
			username: players.username
		})
		.from(players)
		.where(visiblePlayerFilter());

	const totwCounts = playerList.map((player) => {
		const one = oneCount.find((p) => p.player.id === player.id);
		const two = twoCount.find((p) => p.player.id === player.id);
		const three = threeCount.find((p) => p.player.id === player.id);
		const four = fourCount.find((p) => p.player.id === player.id);
		const five = fiveCount.find((p) => p.player.id === player.id);
		const totalMatches = [one?.matches, two?.matches, three?.matches, four?.matches, five?.matches]
			.filter((matches) => matches !== undefined)
			.flat();

		return {
			player,
			one: one?.matches || [],
			two: two?.matches || [],
			three: three?.matches || [],
			four: four?.matches || [],
			five: five?.matches || [],
			total: totalMatches || []
		};
	});

	return totwCounts;
};

export const getMatchDataFromIdAndPlayer = async (
	ids: number[],
	player: number,
	options?: {
		heroId?: number;
		limit?: number;
	}
) => {
	const conditions = [inArray(matchData.matchId, ids), eq(players.id, player)];

	if (options?.heroId) {
		conditions.push(eq(matchData.heroId, options.heroId));
	}

	const query = db
		.select({
			id: players.id,
			username: players.username,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			duration: matches.duration,
			startTime: matches.startTime,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(and(...conditions))
		.orderBy(desc(matchData.matchId))
		.$dynamic();

	const matchList = await (options?.limit ? query.limit(options.limit) : query);
	return matchList;
};

export const getMatchData = async (id: number) => {
	return await db
		.select({
			id: players.id,
			username: players.username,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			matchId: matchData.matchId,
			heroDamage: matchData.heroDamage,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			item0: matchData.item0,
			item1: matchData.item1,
			item2: matchData.item2,
			item3: matchData.item3,
			item4: matchData.item4,
			item5: matchData.item5,
			itemNeutral: matchData.itemNeutral,
			backpack0: matchData.backpack0,
			backpack1: matchData.backpack1,
			backpack2: matchData.backpack2,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(eq(matches.id, id));
};

export const getPlayerAverageStats = async (id: number, offset: number) => {
	const stats = await db
		.select({
			avgImpact: sql<number>`cast(avg(${matchData.impact}) as int)`,
			avgKills: sql<number>`cast(avg(${matchData.kills}) as int)`,
			avgDeaths: sql<number>`cast(avg(${matchData.deaths}) as int)`,
			avgAssists: sql<number>`cast(avg(${matchData.assists}) as int)`,
			avgGpm: sql<number>`cast(avg(${matchData.goldPerMin}) as int)`,
			avgXpm: sql<number>`cast(avg(${matchData.xpPerMin}) as int)`,
			avgLastHits: sql<number>`cast(avg(${matchData.lastHits}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(and(eq(players.id, id), gte(matches.startTime, dayjs().subtract(offset, 'day').unix())))
		.groupBy(players.id)
		.orderBy(players.id);

	return stats[0];
};

export const getRoleCounts = async (id: number, offset: number) => {
	const roleCounts = await db
		.select({
			role: matchData.role,
			count: sql<number>`cast(count(${matchData.matchId}) as int)`,
			avgImpact: sql<number>`cast(avg(${matchData.impact}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(and(eq(players.id, id), gte(matches.startTime, dayjs().subtract(offset, 'day').unix())))
		.groupBy(matchData.role)
		.orderBy(matchData.role);

	const wins = await db
		.select({
			role: matchData.role,
			count: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				eq(players.id, id),
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix())
			)
		)
		.groupBy(matchData.role)
		.orderBy(matchData.role);

	const losses = await db
		.select({
			role: matchData.role,
			count: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				eq(players.id, id),
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'dire')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'radiant'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix())
			)
		)
		.groupBy(matchData.role)
		.orderBy(matchData.role);

	for (const roleCount of roleCounts) {
		roleCount.wins = wins.find((win) => win.role === roleCount.role)?.count;
		roleCount.losses = losses.find((loss) => loss.role === roleCount.role)?.count;
	}

	return roleCounts;
};

export const getPlayerWinLossByMinutes = async (id: number, offset: number) => {
	const wins = await db
		.select({
			minutes: sql<number>`floor(${matches.duration} / 300)`,
			count: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				eq(players.id, id),
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix())
			)
		)
		.groupBy(sql`floor(${matches.duration} / 300)`)
		.orderBy(sql`floor(${matches.duration} / 300)`);

	const losses = await db
		.select({
			minutes: sql<number>`floor(${matches.duration} / 300)`,
			count: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(
			and(
				eq(players.id, id),
				or(
					and(eq(matchData.team, 'radiant'), eq(matches.winner, 'dire')),
					and(eq(matchData.team, 'dire'), eq(matches.winner, 'radiant'))
				),
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix())
			)
		)
		.groupBy(sql`floor(${matches.duration} / 300)`)
		.orderBy(sql`floor(${matches.duration} / 300)`);

	const summary = {};

	for (const w of wins) {
		summary[w.minutes] = { minutes: w.minutes * 5, wins: w.count, losses: 0 };
	}

	for (const l of losses) {
		if (!summary[l.minutes]) summary[l.minutes] = { minutes: l.minutes * 5, wins: 0, losses: 0 };
		summary[l.minutes].losses = l.count;
	}

	return Object.values(summary).sort((a, b) => a.minutes - b.minutes);
};

export const getPlayerImpactCountsByRole = async (playerId: number) => {
	const impacts = await db
		.select({
			playerId: players.id,
			role: matchData.role,
			rating: sql`
                CASE
                    WHEN ${matchData.impact} > 200 THEN 'S++'
                    WHEN ${matchData.impact} > 140 THEN 'S+'
                    WHEN ${matchData.impact} > 130 THEN 'S'
                    WHEN ${matchData.impact} > 123 THEN 'S-'
                    WHEN ${matchData.impact} > 116 THEN 'A+'
                    WHEN ${matchData.impact} > 109 THEN 'A'
                    WHEN ${matchData.impact} > 102 THEN 'A-'
                    WHEN ${matchData.impact} > 95 THEN 'B+'
                    WHEN ${matchData.impact} > 88 THEN 'B'
                    WHEN ${matchData.impact} > 81 THEN 'B-'
                    WHEN ${matchData.impact} > 74 THEN 'C+'
                    WHEN ${matchData.impact} > 67 THEN 'C'
                    WHEN ${matchData.impact} > 60 THEN 'C-'
                    WHEN ${matchData.impact} > 53 THEN 'D+'
                    WHEN ${matchData.impact} > 46 THEN 'D'
                    WHEN ${matchData.impact} > 39 THEN 'D-'
                    WHEN ${matchData.impact} > 32 THEN 'F+'
                    WHEN ${matchData.impact} > 25 THEN 'F'
                    ELSE 'F-'
                END
            `.as('rating'),
			count: sql`COUNT(*)`.as('count')
		})
		.from(matchData)
		.innerJoin(accounts, eq(matchData.playerId, accounts.accountId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.where(eq(players.id, playerId))
		.groupBy(players.id, matchData.role, sql`rating`)
		.orderBy(matchData.role, sql`count DESC`);

	const groupedByRating = impacts.reduce((acc, item) => {
		acc[item.rating] = acc[item.rating] || [];
		acc[item.rating].push(item);
		return acc;
	}, {});

	return groupedByRating;
};

export const getPlayerRecords = async (playerId: number) => {
	const playerMatches = await db
		.select({
			id: players.id,
			username: players.username,
			smurf: accounts.smurf,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			role: matchData.role,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			heroDamage: matchData.heroDamage,
			towerDamage: matchData.towerDamage,
			matchId: matchData.matchId,
			sequenceNumber: matches.sequenceNumber,
			duration: matches.duration,
			startTime: matches.startTime,
			team: matchData.team,
			winner: matches.winner,
			hero: {
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			}
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(and(eq(players.id, playerId), gt(matches.duration, 900)));

	const matchIds = Array.from(new Set(playerMatches.map((match) => match.matchId)));
	const lobbyPlayers =
		matchIds.length > 0
			? await db
					.select({
						matchId: matchData.matchId,
						playerId: accounts.owner
					})
					.from(matchData)
					.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
					.where(inArray(matchData.matchId, matchIds))
			: [];
	const lobbyPlayersByMatch = new Map<number, Set<number>>();

	for (const lobbyPlayer of lobbyPlayers) {
		if (!lobbyPlayersByMatch.has(lobbyPlayer.matchId)) {
			lobbyPlayersByMatch.set(lobbyPlayer.matchId, new Set());
		}
		lobbyPlayersByMatch.get(lobbyPlayer.matchId)?.add(lobbyPlayer.playerId);
	}

	const matchesWithLobbyPlayers = playerMatches.map((match) => ({
		...match,
		lobbyPlayerIds: Array.from(lobbyPlayersByMatch.get(match.matchId) ?? [])
	}));

	return {
		matches: matchesWithLobbyPlayers
	};
};

export const getPlayerTeammateStats = async (playerId: number) => {
	const playerMatchData = alias(matchData, 'player_match_data');
	const teammateMatchData = alias(matchData, 'teammate_match_data');
	const teammateAccounts = alias(accounts, 'teammate_accounts');
	const teammatePlayers = alias(players, 'teammate_players');
	const playerHeroes = alias(heroes, 'player_heroes');

	const rows = await db
		.select({
			teammateId: teammatePlayers.id,
			username: teammatePlayers.username,
			matchId: matches.id,
			startTime: matches.startTime,
			role: playerMatchData.role,
			heroId: playerHeroes.id,
			heroName: playerHeroes.name,
			heroImg: playerHeroes.img,
			team: playerMatchData.team,
			winner: matches.winner
		})
		.from(playerMatchData)
		.innerJoin(accounts, eq(accounts.accountId, playerMatchData.playerId))
		.innerJoin(matches, eq(matches.id, playerMatchData.matchId))
		.innerJoin(playerHeroes, eq(playerHeroes.id, playerMatchData.heroId))
		.innerJoin(
			teammateMatchData,
			and(
				eq(teammateMatchData.matchId, playerMatchData.matchId),
				eq(teammateMatchData.team, playerMatchData.team),
				ne(teammateMatchData.playerId, playerMatchData.playerId)
			)
		)
		.innerJoin(teammateAccounts, eq(teammateAccounts.accountId, teammateMatchData.playerId))
		.innerJoin(teammatePlayers, eq(teammateAccounts.owner, teammatePlayers.id))
		.where(and(eq(accounts.owner, playerId), ne(teammatePlayers.id, playerId)));

	const teammateMap = new Map<
		number,
		{
			id: number;
			username: string;
			matches: Set<number>;
			wins: Set<number>;
			losses: Set<number>;
			results: {
				matchId: number;
				startTime: number;
				role: number;
				hero: {
					id: number;
					name: string;
					img: string;
				};
				won: boolean;
			}[];
		}
	>();

	for (const row of rows) {
		if (!teammateMap.has(row.teammateId)) {
			teammateMap.set(row.teammateId, {
				id: row.teammateId,
				username: row.username,
				matches: new Set(),
				wins: new Set(),
				losses: new Set(),
				results: []
			});
		}

		const teammate = teammateMap.get(row.teammateId)!;
		teammate.matches.add(row.matchId);
		const won = row.team === row.winner;

		if (won) {
			teammate.wins.add(row.matchId);
		} else {
			teammate.losses.add(row.matchId);
		}

		teammate.results.push({
			matchId: row.matchId,
			startTime: row.startTime,
			role: row.role,
			hero: {
				id: row.heroId,
				name: row.heroName,
				img: row.heroImg
			},
			won
		});
	}

	return Array.from(teammateMap.values())
		.map((teammate) => {
			const matchCount = teammate.matches.size;
			const wins = teammate.wins.size;
			const losses = teammate.losses.size;
			const uniqueResults = Array.from(
				new Map(teammate.results.map((result) => [result.matchId, result])).values()
			).sort((a, b) => a.startTime - b.startTime);
			let currentWinStreak = 0;
			let longestWinStreak = 0;

			for (const result of uniqueResults) {
				if (result.won) {
					currentWinStreak += 1;
					longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
				} else {
					currentWinStreak = 0;
				}
			}

			return {
				id: teammate.id,
				username: teammate.username,
				matches: matchCount,
				wins,
				losses,
				winRate: matchCount > 0 ? (wins / matchCount) * 100 : 0,
				longestWinStreak,
				matchesData: uniqueResults
			};
		})
		.sort((a, b) => b.matches - a.matches || b.winRate - a.winRate);
};
