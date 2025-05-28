import {
	getAccounts,
	getHeroStats,
	getPlayer,
	getPlayerChart,
	getPlayerWinLoss,
	getPlayerImpactCountsByRole,
	getSmurfAccounts
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

	if (steamData.ok === false) {
		return [];
	}

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
	const mainAccount = await allSteamData.find(
		(account: any) =>
			account.steamid === (BigInt(mainAccountId) + BigInt('76561197960265728')).toString()
	) || null;
	let smurfAccounts = await allSteamData.filter(
		(account: any) =>
			account.steamid !== (BigInt(mainAccountId) + BigInt('76561197960265728')).toString()
	);

	if (smurfAccounts.length < 1) {
		smurfAccounts = await getSmurfAccounts(params.id);
	}
	const weeklyStats = await getPlayerWinLoss(params.id);
	const allTimeStats = await getPlayerWinLoss(params.id, 9999);

	const heroStats = getHeroStats(dayjs(0).add(1, 'month').valueOf() / 1000, params.id);
	const allTimeHeroStats = getHeroStats(dayjs(0).add(99, 'years').valueOf() / 1000, params.id);
	const winGraph = await getPlayerChart(params.id, 31);
	const impactCounts = await getPlayerImpactCountsByRole(params.id);

	const heroJson = await fetch(
		`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`
	);
	const heroList: DotaAsset[] = await heroJson.json();
	heroList.sort((a, b) => a.name.localeCompare(b.name));

	return {
		heroList,
		player,
		mainAccount,
		smurfAccounts,
		allTimeStats,
		weeklyStats,
		heroStats,
		allTimeHeroStats,
		winGraph,
		impactCounts
	};
};
