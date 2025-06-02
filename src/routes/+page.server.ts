import { STEAM_KEY } from '$env/static/private';
import {
	getFeatures,
	getHeroStats,
	getAllPlayerStats,
	getPlayers,
	getTeamOfTheWeek,
	getPlayer,
	getFlopOfTheWeek
} from '$lib/server/db-functions';

/*const toSteam32 = (steam64: string) => {
	return (BigInt(steam64.toString()) - BigInt('76561197960265728')).toString();
};

const toSteam64 = (steam32: string) => {
	return (BigInt(steam32) + BigInt('76561197960265728')).toString();
};

const getSteamData = async (steamIds: number[]) => {
	const steamData = await fetch(
		`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${steamIds
			.map((id) => toSteam64(id.toString()))
			.join(',')
			.toString()}`
	);
	const steamDataJson = await steamData.json();
	return steamDataJson.response.players;
};*/

export const load = async ({ url, params }) => {
	const heroStats = getHeroStats();
	const playerStats = getAllPlayerStats();
	const totw = await getTeamOfTheWeek();
	const fotw = await getFlopOfTheWeek();
	const features = getFeatures();

	return { heroStats, playerStats, totw, features, fotw };
};
