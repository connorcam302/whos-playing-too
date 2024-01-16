import { db } from '$lib/server/database';
import { accounts, matchData, matches, players, teamOfTheWeek } from '$lib/server/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { getHeroString } from './private-functions';
import { STEAM_KEY } from '$env/static/private';

export const getHeroStats = async () => {
	const heroJson = await fetch(
		`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`
	);
	const heroes: DotaAsset[] = await heroJson.json();

	const heroMatches = await db
		.select({
			hero: matchData.heroId,
			matches: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.groupBy(matchData.heroId)
		.orderBy(matchData.heroId);

	const heroWinsRadiant = await db
		.select({
			hero: matchData.heroId,
			radiantWins: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')))
		.groupBy(matchData.heroId)
		.orderBy(matchData.heroId);

	const heroWinsDire = await db
		.select({
			hero: matchData.heroId,
			direWins: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.where(and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire')))
		.groupBy(matchData.heroId)
		.orderBy(matchData.heroId);

	const heroAvgImpact = await db
		.select({
			hero: matchData.heroId,
			avgImpact: sql<number>`cast(avg(${matchData.impact}) as int)`
		})
		.from(matchData)
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.groupBy(matchData.heroId)
		.orderBy(matchData.heroId);

	const heroData: {
		hero: DotaAsset;
		matches: number;
		radiantWins: number;
		direWins: number;
		avgImpact: number;
	}[] = [];

	heroMatches.forEach((hero) => {
		const radiantWin = heroWinsRadiant.find((heroWin) => heroWin.hero === hero.hero);
		const direWin = heroWinsDire.find((heroWin) => heroWin.hero === hero.hero);
		const avgImpact = heroAvgImpact.find((heroWin) => heroWin.hero === hero.hero);

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

export const getPlayerStats = async () => {
	const playerMatches = await db
		.select({
			id: players.id,
			username: players.username,
			matches: sql<number>`cast(count(${matchData.matchId}) as int)`
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(accounts.owner, players.id))
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
		.where(and(eq(matchData.team, 'radiant'), eq(matches.winner, 'radiant')))
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
		.where(and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire')))
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

type HeroResponse = {
	result: {
		heroes: {
			name: string;
			id: number;
		}[];
	};
};

export const getTeamOfTheWeek = async () => {
	const totw = await db.select().from(teamOfTheWeek).orderBy(desc(teamOfTheWeek.id)).limit(1);

	const playerList = await db.select().from(players);

	const heroListData: HeroResponse = await fetch(
		`https://api.steampowered.com/IEconDOTA2_570/GetHeroes/v0001?key=${STEAM_KEY}`
	).then((res) => res.json());

	const heroList = heroListData.result.heroes;

	const totwWithIds = {
		...totw[0],
		onePlayerName: playerList.find((player) => player.id === totw[0].onePlayer)?.username,
		twoPlayerName: playerList.find((player) => player.id === totw[0].twoPlayer)?.username,
		threePlayerName: playerList.find((player) => player.id === totw[0].threePlayer)?.username,
		fourPlayerName: playerList.find((player) => player.id === totw[0].fourPlayer)?.username,
		fivePlayerName: playerList.find((player) => player.id === totw[0].fivePlayer)?.username,
		oneHeroId: heroList
			.find((hero) => hero.id === totw[0].oneHero)
			?.name.slice('npc_dota_hero_'.length),
		twoHeroId: heroList
			.find((hero) => hero.id === totw[0].twoHero)
			?.name.slice('npc_dota_hero_'.length),
		threeHeroId: heroList
			.find((hero) => hero.id === totw[0].threeHero)
			?.name.slice('npc_dota_hero_'.length),
		fourHeroId: heroList
			.find((hero) => hero.id === totw[0].fourHero)
			?.name.slice('npc_dota_hero_'.length),
		fiveHeroId: heroList
			.find((hero) => hero.id === totw[0].fiveHero)
			?.name.slice('npc_dota_hero_'.length)
	};

	return totwWithIds;
};
