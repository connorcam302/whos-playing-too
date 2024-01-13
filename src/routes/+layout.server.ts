import { getPlayers } from '$lib/server/db-functions';

export const load = async () => {
	const playerList = await getPlayers();

	return { playerList };
};
