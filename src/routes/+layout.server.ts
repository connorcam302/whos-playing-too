import { getPlayers } from '$lib/server/db-functions';

export const load = async ({ url }) => {
	const playerList = await getPlayers();

	return { playerList, url: url.pathname };
};
