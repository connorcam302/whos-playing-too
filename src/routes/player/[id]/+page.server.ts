import { getAccounts, getPlayer, getPlayerStats } from '$lib/server/db-functions';
import { STEAM_KEY } from '$env/static/private';

const getSteamData = async (steamId: number) => {
	const steamData = await fetch(
		`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${(
			BigInt(steamId) + BigInt('76561197960265728')
		).toString()}`
	);
	console.log(steamData);
	const steamDataJson = await steamData.json();
	return steamDataJson.response.players[0];
};

export const load = async ({ url, params }) => {
	const player = await getPlayer(params.id);
	const accountIds = await getAccounts(params.id);
	const allSteamData = await Promise.all(
		accountIds.map(async (account) => {
			return { ...(await getSteamData(account.accountId)), smurf: account.smurf };
		})
	);
	const steamData = await getSteamData(player.accountId);
	const weeklyStats = await getPlayerStats(params.id);
	const allTimeStats = await getPlayerStats(params.id, 9999);

	return { player, steamData, allSteamData, allTimeStats, weeklyStats };
};
