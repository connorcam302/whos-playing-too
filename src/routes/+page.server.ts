import { db } from '$lib/server/database';
import { accounts, matchData, matches, players } from '$lib/server/schema';
import { desc, eq, sql, type InferSelectModel, and, inArray } from 'drizzle-orm';
import {
	getHeroStats,
	getPlayerStats,
	getPlayers,
	getTeamOfTheWeek
} from '$lib/server/db-functions';

export const load = async ({ url, params }) => {
	const heroStats = await getHeroStats();
	const playerStats = await getPlayerStats();
	const playerList = await getPlayers();
	const heroJson = await fetch(
		`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`
	);
	const heroList: DotaAsset[] = await heroJson.json();
	heroList.sort((a, b) => a.name.localeCompare(b.name));
	const totw = await getTeamOfTheWeek();

	return { heroStats, playerStats, playerList, heroList, totw };
};
