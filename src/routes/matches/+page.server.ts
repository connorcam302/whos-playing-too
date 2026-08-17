import { heroData } from '$lib/data/heroData';
import { getPlayers } from '$lib/server/db-functions';

export const load = async () => {
	const playerList = await getPlayers({ includeHiddenFromAggregates: true });
	const heroList: DotaAsset[] = heroData.map((hero) => ({
		id: hero.id,
		name: hero.localized_name,
		img: hero.img
	}));
	heroList.sort((a, b) => a.name.localeCompare(b.name));

	return { playerList, heroList };
};
