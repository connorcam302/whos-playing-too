import { getPlayers } from '$lib/server/db-functions';
import { db } from '$lib/server/database';
import { heroes } from '$lib/server/schema';

export const load = async ({ url }) => {
	const playerList = await getPlayers();
	const heroList = await db
		.select({
			id: heroes.id,
			name: heroes.name,
			img: heroes.img
		})
		.from(heroes);
	heroList.sort((a, b) => a.name.localeCompare(b.name));

	return { playerList, heroList, url: url.pathname };
};
