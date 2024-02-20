import { STEAM_KEY } from '$env/static/private';
import {
	getFeatures,
	getHeroStats,
	getAllPlayerStats,
	getPlayers,
	getTeamOfTheWeek,
	getPlayer
} from '$lib/server/db-functions';

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

const toSteam32 = (steam64: string) => {
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
};

export const load = async ({ url, params }) => {
	const heroStats = getHeroStats();
	const playerStats = getAllPlayerStats();
	const totw = await getTeamOfTheWeek();
	const features = getFeatures();
	const players = await getPlayers();
	const allAccounts: { id: number; accountId: number; username: string }[] = [];
	players.forEach((user) => {
		user.accounts.forEach((account) => {
			allAccounts.push({
				id: user.id,
				accountId: Number(account),
				username: user.username
			});
		});
	});

	const allSteamData = await getSteamData(allAccounts.map((account) => account.accountId));
	const allPlayerSteamData = allAccounts
		.map((player) => {
			const accountData = allSteamData.find(
				(account) => account.steamid === toSteam64(player.accountId.toString())
			);
			return {
				...player,
				...accountData
			};
		})
		.sort((a, b) => b.lastlogoff - a.lastlogoff)
		.sort((a, b) => (b.gameextrainfo === 'Dota 2') - (a.gameextrainfo === 'Dota 2'));

	return { heroStats, playerStats, totw, features, allPlayerSteamData };
};
