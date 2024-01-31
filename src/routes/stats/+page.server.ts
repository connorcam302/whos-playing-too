import {
	getAccounts,
	getHeroStats,
	getPlayer,
	getPlayerChart,
	getPlayerStats,
	getPlayers
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

	return { graph };
};
