import {
	getAccounts,
	getHeroStats,
	getPlayer,
	getPlayerChart,
	getPlayerStats
} from '$lib/server/db-functions';
import { STEAM_KEY } from '$env/static/private';
import dayjs from 'dayjs';

const getSteamData = async (steamId: number) => {
	const steamData = await fetch(
		`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${(
			BigInt(steamId) + BigInt('76561197960265728')
		).toString()}`
	);
	const steamDataJson = await steamData.json();
	return steamDataJson.response.players[0];
};

function measurePromise(fn: () => Promise<any>): Promise<number> {
	let onPromiseDone = () => performance.now() - start;

	let start = performance.now();
	return fn().then(onPromiseDone, onPromiseDone);
}

function longPromise(delay: number) {
	return new Promise<string>((resolve) => {
		setTimeout(() => {
			resolve('Done');
		}, delay);
	});
}

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

	const heroStats = await getHeroStats(dayjs(0).add(2, 'week').valueOf() / 1000, params.id);
	const winGraph = await getPlayerChart(params.id, 31);

	const timings = [
		{ name: 'getPlayer', time: await measurePromise(() => getPlayer(params.id)) },
		{ name: 'getAccounts', time: await measurePromise(() => getAccounts(params.id)) },
		{ name: 'getSteamData', time: await measurePromise(() => getSteamData(player.accountId)) },
		{
			name: 'allSteamData',
			time: await measurePromise(() =>
				Promise.all(
					accountIds.map(async (account) => {
						return { ...(await getSteamData(account.accountId)), smurf: account.smurf };
					})
				)
			)
		},
		{ name: 'getPlayerStats', time: await measurePromise(() => getPlayerStats(params.id)) },
		{
			name: 'getHeroStats',
			time: await measurePromise(() =>
				getHeroStats(dayjs(0).add(2, 'week').valueOf() / 1000, params.id)
			)
		},
		{
			name: 'getPlayerChart',
			time: await measurePromise(() => getPlayerChart(params.id, 31))
		}
	];

	return {
		player,
		steamData,
		allSteamData,
		allTimeStats,
		weeklyStats,
		heroStats,
		winGraph,
		timings
	};
};
