import {
	getAccounts,
	getHeroStats,
	getPlayer,
	getPlayerChart,
	getPlayerStats
} from '$lib/server/db-functions';
import { STEAM_KEY } from '$env/static/private';
import dayjs from 'dayjs';

const getSteamData = async (steamIds: number[]) => {
	const steamData = await fetch(
		`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${steamIds
			.map((id) => BigInt(id) + BigInt('76561197960265728'))
			.join(',')
			.toString()}`
	);
	const steamDataJson = await steamData.json();
	return steamDataJson.response.players;
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
	const allSteamData = await getSteamData(accountIds.map((account) => account?.accountId));
	const mainAccountId = accountIds.find((account) => account.smurf === false)?.accountId;
	const mainAccount = allSteamData.find(
		(account: any) =>
			account.steamid === (BigInt(mainAccountId) + BigInt('76561197960265728')).toString()
	);
	const smurfAccounts = allSteamData.filter(
		(account: any) =>
			account.steamid !== (BigInt(mainAccountId) + BigInt('76561197960265728')).toString()
	);
	const weeklyStats = await getPlayerStats(params.id);
	const allTimeStats = await getPlayerStats(params.id, 9999);

	const heroStats = getHeroStats(dayjs(0).add(2, 'week').valueOf() / 1000, params.id);
	const winGraph = await getPlayerChart(params.id, 31);

	const timings = [
		{ name: 'getPlayer', time: await measurePromise(() => getPlayer(params.id)) },
		{ name: 'getAccounts', time: await measurePromise(() => getAccounts(params.id)) },
		{ name: 'getSteamData', time: await measurePromise(() => getSteamData([player.accountId])) },
		{
			name: 'allSteamData',
			time: await measurePromise(() =>
				getSteamData(accountIds.map((account) => account?.accountId))
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
		mainAccount,
		smurfAccounts,
		allTimeStats,
		weeklyStats,
		heroStats,
		winGraph,
		timings
	};
};
