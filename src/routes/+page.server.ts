import { db } from '$lib/server/database';
import { accounts, matchData, matches, players } from '$lib/server/schema';
import { desc, eq, sql, type InferSelectModel, and } from 'drizzle-orm';

type DotaAsset = { id: number; name: string; img: string };

type MatchDataInfer = InferSelectModel<typeof matchData>;
type MatchInfer = InferSelectModel<typeof matches>;
type AccountInfer = InferSelectModel<typeof accounts>;
type PlayerInfer = InferSelectModel<typeof players>;

type MatchData = {
	[K in keyof MatchDataInfer]: K extends
		| 'item0'
		| 'item1'
		| 'item2'
		| 'item3'
		| 'item4'
		| 'item5'
		| 'itemNeutral'
		| 'hero'
		? DotaAsset
		: MatchDataInfer[K];
};

type PlayerMatchData = MatchData & AccountInfer & PlayerInfer;

export const load = async () => {
	const matchBlocks = await getMatchBlocks();
	const heroStats = await getHeroStats();

	return { matchBlocks, heroStats };
};

const getMatchBlocks = async () => {
	const matchArray = await db.select().from(matches).limit(100).orderBy(desc(matches.id));

	const itemJson = await fetch(
		`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/ITEMS.json`
	);
	const items: DotaAsset[] = await itemJson.json();
	const heroJson = await fetch(
		`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`
	);
	const heroes: DotaAsset[] = await heroJson.json();

	const matchBlockPromises = matchArray.map(async (match) => {
		const data = await db
			.select()
			.from(matchData)
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.innerJoin(players, eq(accounts.owner, players.id))
			.where(eq(matchData.matchId, match.id));
		const block: PlayerMatchData[] = data.map((player) => {
			return {
				...player.players,
				...player.accounts,
				...player.match_data,
				item0: items.find((item) => item.id === player.match_data.item0)!,
				item1: items.find((item) => item.id === player.match_data.item1)!,
				item2: items.find((item) => item.id === player.match_data.item2)!,
				item3: items.find((item) => item.id === player.match_data.item3)!,
				item4: items.find((item) => item.id === player.match_data.item4)!,
				item5: items.find((item) => item.id === player.match_data.item5)!,
				itemNeutral: items.find((item) => item.id === player.match_data.itemNeutral)!,
				hero: heroes.find((hero) => hero.id === player.match_data.heroId)!
			};
		});

		console.log(block);

		return block;
	});

	const matchBlocksCombined = await Promise.all(matchBlockPromises);
	const splitByTeam = (players: PlayerMatchData[]) => {
		const radiant: PlayerMatchData[] = [];
		const dire: PlayerMatchData[] = [];
		players.forEach((player: PlayerMatchData) => {
			if (player.team === 'radiant') {
				radiant.push(player);
			} else {
				dire.push(player);
			}
		});
		return { radiant, dire };
	};

	const matchBlocks = matchBlocksCombined.map((match) => {
		const { radiant, dire } = splitByTeam(match);
		const matchData: MatchInfer = matchArray.find(
			(data) => data.id === radiant[0]?.matchId || data.id === dire[0]?.matchId
		)!;
		return { radiant, dire, matchData };
	});

	return matchBlocks;
};

const getHeroStats = async () => {
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
		.where(and(eq(matchData.team, 'dire'), eq(matches.winner, 'dire')))
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
