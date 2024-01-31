import { STEAM_KEY } from '$env/static/private';

type HeroResponse = {
	result: {
		heroes: {
			name: string;
			id: number;
		}[];
	};
};

export const getHeroString = async (id: number) => {
	const heroListData: HeroResponse = await fetch(
		`https://api.steampowered.com/IEconDOTA2_570/GetHeroes/v0001?key=${STEAM_KEY}`
	).then((res) => res.json());

	const heroList = heroListData.result.heroes;

	const hero = heroList.find((hero) => hero.id === id)!;

	return hero.name.slice('npc_dota_hero_'.length);
};
