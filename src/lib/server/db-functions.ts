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
	count
} from 'drizzle-orm';
import { getHeroString } from './private-functions';
import { STEAM_KEY } from '$env/static/private';
import dayjs from 'dayjs';
import { heroMap } from '$lib/data/heroMap';

export const getHeroStats = async (
	offset: number = dayjs(0).add(2, 'week').valueOf() / 1000,
	player: number = 0
) => {
	let heroMatches: any;
	let heroWinsRadiant: any;
	let heroWinsDire: any;
	let heroAvgImpact: any;

	if (player === 0) {
		heroMatches = await db
			.select({
				hero: matchData.heroId,
				matches: sql<number>`cast(count(${matchData.matchId}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.where(gte(matches.startTime, Math.floor(Date.now() / 1000) - offset))
			.groupBy(matchData.heroId)
			.orderBy(matchData.heroId);

		heroWinsRadiant = await db
			.select({
				hero: matchData.heroId,
				radiantWins: sql<number>`cast(count(${matchData.matchId}) as int)`
			})
			.from(matchData)
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.where(
				and(
					eq(matchData.team, 'radiant'),
					eq(matches.winner, 'radiant'),
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset)
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
			.where(
				and(
					eq(matchData.team, 'dire'),
					eq(matches.winner, 'dire'),
					gte(matches.startTime, Math.floor(Date.now() / 1000) - offset)
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
			.where(gte(matches.startTime, Math.floor(Date.now() / 1000) - offset))
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
	}
	const heroData: {
		hero: DotaAsset;
		matches: number;
		radiantWins: number;
		direWins: number;
		avgImpact: number;
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

		heroData.push({
			hero: heroMap.get(hero.hero)!,
			matches: hero.matches,
			radiantWins: radiantWin?.radiantWins || 0,
			direWins: direWin?.direWins || 0,
			avgImpact: avgImpact?.avgImpact || 0
		});
	});
	const sortedHeroData = heroData.sort((a, b) => b.matches - a.matches);

	return sortedHeroData;
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
		.where(gte(matches.startTime, Math.floor(Date.now() / 1000) - offset))
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
				gte(matches.startTime, Math.floor(Date.now() / 1000) - offset)
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
				gte(matches.startTime, Math.floor(Date.now() / 1000) - offset)
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
		.where(gte(matches.startTime, Math.floor(Date.now() / 1000) - offset))
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

export const getPlayers = async () => {
	const playerList = await db
		.select({
			id: players.id,
			username: players.username,
			accounts: sql<Array<{ accountId: number }>>`array_agg(${accounts.accountId})`
		})
		.from(players)
		.innerJoin(accounts, eq(players.id, accounts.owner))
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

	const ids = [
		totw[0].oneMatch,
		totw[0].twoMatch,
		totw[0].threeMatch,
		totw[0].fourMatch,
		totw[0].fiveMatch
	];

	//write a function that takes in an array of match ids and returns an array of the matching sequence id by searching the db for a match with the id

	const sequenceIds = ids.map(async (id) => {
		const sequenceId = await db.select().from(matches).where(eq(matches.id, id));
		return sequenceId[0].sequenceNumber;
	});

	const totwWithIds = {
		...totw[0],
		oneSequence: await sequenceIds[0],
		twoSequence: await sequenceIds[1],
		threeSequence: await sequenceIds[2],
		fourSequence: await sequenceIds[3],
		fiveSequence: await sequenceIds[4],
		onePlayerName: playerList.find((player) => player.id === totw[0].onePlayer)?.username,
		twoPlayerName: playerList.find((player) => player.id === totw[0].twoPlayer)?.username,
		threePlayerName: playerList.find((player) => player.id === totw[0].threePlayer)?.username,
		fourPlayerName: playerList.find((player) => player.id === totw[0].fourPlayer)?.username,
		fivePlayerName: playerList.find((player) => player.id === totw[0].fivePlayer)?.username,
		oneHeroId: heroData.find((hero) => hero.id === totw[0].oneHero)?.name,
		twoHeroId: heroData.find((hero) => hero.id === totw[0].twoHero)?.name,
		threeHeroId: heroData.find((hero) => hero.id === totw[0].threeHero)?.name,
		fourHeroId: heroData.find((hero) => hero.id === totw[0].fourHero)?.name,
		fiveHeroId: heroData.find((hero) => hero.id === totw[0].fiveHero)?.name
	};

	return totwWithIds;
};

export const getFlopOfTheWeek = async () => {
	const fotw = await db.select().from(flopOfTheWeek).orderBy(desc(flopOfTheWeek.id)).limit(1);

	const playerList = await db.select().from(players);

	const fotwWithIds = {
		...fotw[0],
		onePlayerName: playerList.find((player) => player.id === fotw[0].onePlayer)?.username,
		twoPlayerName: playerList.find((player) => player.id === fotw[0].twoPlayer)?.username,
		threePlayerName: playerList.find((player) => player.id === fotw[0].threePlayer)?.username,
		fourPlayerName: playerList.find((player) => player.id === fotw[0].fourPlayer)?.username,
		fivePlayerName: playerList.find((player) => player.id === fotw[0].fivePlayer)?.username,
		oneHeroId: heroData.find((hero) => hero.id === fotw[0].oneHero)?.name,
		twoHeroId: heroData.find((hero) => hero.id === fotw[0].twoHero)?.name,
		threeHeroId: heroData.find((hero) => hero.id === fotw[0].threeHero)?.name,
		fourHeroId: heroData.find((hero) => hero.id === fotw[0].fourHero)?.name,
		fiveHeroId: heroData.find((hero) => hero.id === fotw[0].fiveHero)?.name
	};

	return fotwWithIds;
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
			and(eq(accounts.smurf, false), gte(matches.startTime, dayjs().subtract(7, 'day').unix()))
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
			and(eq(accounts.smurf, false), gte(matches.startTime, dayjs().subtract(7, 'day').unix()))
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
			and(eq(accounts.smurf, false), gte(matches.startTime, dayjs().subtract(7, 'day').unix()))
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
			and(eq(accounts.smurf, false), gte(matches.startTime, dayjs().subtract(7, 'day').unix()))
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
			and(eq(accounts.smurf, false), gte(matches.startTime, dayjs().subtract(7, 'day').unix()))
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
			and(eq(accounts.smurf, false), gte(matches.startTime, dayjs().subtract(7, 'day').unix()))
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
			and(eq(accounts.smurf, false), gte(matches.startTime, dayjs().subtract(7, 'day').unix()))
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
			and(eq(accounts.smurf, false), gte(matches.startTime, dayjs().subtract(7, 'day').unix()))
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
			and(eq(accounts.smurf, false), gte(matches.startTime, dayjs().subtract(7, 'day').unix()))
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
			and(eq(accounts.smurf, false), gte(matches.startTime, dayjs().subtract(7, 'day').unix()))
		)
		.orderBy(matchData.heroDamage)
		.limit(3);

	const playerList = await db.select().from(players);
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
				eq(accounts.smurf, false)
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
				eq(accounts.smurf, false)
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
	const player = await db
		.select({ id: players.id, username: players.username, accountId: accounts.accountId })
		.from(players)
		.where(and(eq(players.id, id), eq(accounts.smurf, false)))
		.innerJoin(accounts, eq(accounts.owner, players.id));
	return player[0];
};

export const getAccounts = async (id: number) => {
	const accountsList = await db.select().from(accounts).where(eq(accounts.owner, id));
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

	let daysArray = new Array(offset).fill(0);

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

export const getMostKills = async (
	games: number = 10,
	smurfFilter: boolean = false,
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),

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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),
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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
				eq(matches.gameMode, 22),
				inArray(matchData.role, roleFilter),
				inArray(matches.lobby, lobbyFilter),
				inArray(matchData.heroId, heroFilter),
				inArray(accounts.smurf, [false, smurfFilter]),

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
	offset: number = 31,
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
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
				gte(matches.startTime, dayjs().subtract(offset, 'day').unix()),
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
		.from(players);

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

export const getMatchDataFromIdAndPlayer = async (ids: number[], player: number) => {
	const matchList = await db
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
		.where(and(inArray(matchData.matchId, ids), eq(players.id, player)));

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
