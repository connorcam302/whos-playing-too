import { getHeroStats, getPlayerStats, getPlayers } from '$lib/server/db-functions';

export const load = async ({ url, params }) => {
	const playerList = await getPlayers();
	const heroJson = await fetch(
		`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`
	);
	const heroList: DotaAsset[] = await heroJson.json();
	heroList.sort((a, b) => a.name.localeCompare(b.name));

	return { playerList, heroList };
};
