import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players, teamOfTheWeek } from '$lib/server/schema';
import { heroData, type Hero } from '$lib/data/heroData';
import { eq, sql, and, desc, or, gte, lte } from 'drizzle-orm';
import { getHeroString } from './private-functions';
import { STEAM_KEY } from '$env/static/private';
import dayjs from 'dayjs';

export const getHeroStats = async (
	offset: number = dayjs(0).add(2, 'week').valueOf() / 1000,
	player: number = 0
) => {
	const heroJson = await fetch(
		`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`
	);
	const heroes: DotaAsset[] = await heroJson.json();

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
			hero: heroes.find((heroObj) => heroObj.id === hero.hero)!,
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

	const totwWithIds = {
		...totw[0],
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

export const getFeatures = async () => {
	const mostKills = await db
		.select({
			id: players.id,
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

export const getPlayerStats = async (id: number, offset: number = 7) => {
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
