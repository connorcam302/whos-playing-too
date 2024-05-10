import {
	getAccounts,
	getHeroStats,
	getPlayer,
	getPlayerChart,
	getPlayerWinLoss,
	getPlayers,
	getTOTWCounts
} from '$lib/server/db-functions';

export const load = async ({ url, params }) => {
	const players = await getPlayers();

	const promises = players.map(async (player) => {
		return {
			data: await getPlayerChart(player.id, 31),
			player: player
		};
	});

	const chartData = await Promise.all(promises).then((data) => {
		return data;
	});
	const graph = chartData
		.map((data) => {
			if (data.data.matchCount > 5) {
				return {
					player: data.player,
					data: data.data.daysArray
				};
			}
		})
		.filter((data) => data !== undefined);

	const totwCounts = await getTOTWCounts();
	totwCounts.sort((a, b) => b.total.length - a.total.length);

	const heroJson = await fetch(
		`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`
	);
	const heroList: DotaAsset[] = await heroJson.json();
	heroList.sort((a, b) => a.name.localeCompare(b.name));

	return { graph, totwCounts, heroList };
};
