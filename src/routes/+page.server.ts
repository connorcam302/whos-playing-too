import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge'
};

import {
	getFeatures,
	getHeroStats,
	getAllPlayerStats,
	getPlayers,
	getTeamOfTheWeek
} from '$lib/server/db-functions';

export const load = async ({ url, params }) => {
	const heroStats = await getHeroStats();
	const playerStats = await getAllPlayerStats();
	const playerList = await getPlayers();
	const heroJson = await fetch(
		`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`
	);
	const heroList: DotaAsset[] = await heroJson.json();
	heroList.sort((a, b) => a.name.localeCompare(b.name));
	const totw = await getTeamOfTheWeek();
	const features = await getFeatures();

	return { heroStats, playerStats, playerList, heroList, totw, features };
};
