import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '$lib/server/schema';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

const HEROES_URL =
	'https://raw.githubusercontent.com/odota/dotaconstants/refs/heads/master/build/heroes.json';
const ABILITIES_URL =
	'https://raw.githubusercontent.com/odota/dotaconstants/refs/heads/master/build/hero_abilities.json';

const HERO_MAP_PATH = './src/lib/data/heroMap.ts';
const HERO_DATA_PATH = './src/lib/data/heroData.ts';
const HERO_ABILITIES_PATH = './src/lib/data/heroAbilities.ts';

const fetchHeroes = async () => {
	const response = await fetch(HEROES_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch heroes: ${response.statusText}`);
	}
	return await response.json();
};

const fetchAbilities = async () => {
	const response = await fetch(ABILITIES_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch hero abilities: ${response.statusText}`);
	}
	return await response.json();
};

const buildHeroMap = (dotaHeroes) => {
	const entries = Object.entries(dotaHeroes)
		.filter(([_, value]) => value.id)
		.map(([key, value]) => {
			const imgPath = value.img?.startsWith('/apps/dota2/images/dota_react/heroes/')
				? value.img.split('?')[0]
				: `/apps/dota2/images/dota_react/heroes/${value.img || key}.png`;

			const name = (value.localized_name || key).replace(/(?<!\\)'/g, "\\'");

			return `heroMap.set(${value.id}, {
	id: ${value.id},
	name: '${name}',
	img: 'https://cdn.cloudflare.steamstatic.com${imgPath}'
});`;
		})
		.join('\n');

	return `const heroMap = new Map<number, HeroMapData>();

${entries}

export { heroMap };
`;
};

const buildHeroData = (dotaHeroes) => {
	const heroes = Object.entries(dotaHeroes)
		.filter(([_, value]) => value.id)
		.map(([key, value]) => ({
			id: value.id,
			name: value.name,
			primary_attr: value.primary_attr || 'all',
			attack_type: value.attack_type || 'Melee',
			roles: value.roles || [],
			img: value.img ? `https://cdn.cloudflare.steamstatic.com${value.img}` : '',
			icon: value.icon ? `https://cdn.cloudflare.steamstatic.com${value.icon}` : '',
			base_health: value.base_health || 200,
			base_health_regen: value.base_health_regen || 0,
			base_mana: value.base_mana || 75,
			base_mana_regen: value.base_mana_regen || 0,
			base_armor: value.base_armor || 0,
			base_mr: 25,
			base_attack_min: value.base_attack_min || 20,
			base_attack_max: value.base_attack_max || 25,
			base_str: value.base_str || 20,
			base_agi: value.base_agi || 20,
			base_int: value.base_int || 20,
			str_gain: value.str_gain || 2,
			agi_gain: value.agi_gain || 2,
			int_gain: value.int_gain || 2,
			attack_range: value.attack_range || 150,
			projectile_speed: value.projectile_speed || 0,
			attack_rate: value.attack_rate || 1.7,
			base_attack_time: value.base_attack_time || 100,
			attack_point: value.attack_point || 0.5,
			move_speed: value.move_speed || 300,
			turn_rate: value.turn_rate || 0.6,
			cm_enabled: value.cm_enabled !== false,
			legs: value.legs || 2,
			day_vision: value.day_vision || 1800,
			night_vision: value.night_vision || 800,
			localized_name: value.localized_name || key,
			'1_pick': 0,
			'1_win': 0,
			'2_pick': 0,
			'2_win': 0,
			'3_pick': 0,
			'3_win': 0,
			'4_pick': 0,
			'4_win': 0,
			'5_pick': 0,
			'5_win': 0,
			'6_pick': 0,
			'6_win': 0,
			'7_pick': 0,
			'7_win': 0,
			'8_pick': 0,
			'8_win': 0,
			turbo_picks: 0,
			turbo_picks_trend: [],
			turbo_wins: 0,
			turbo_wins_trend: [],
			pro_pick: 0,
			pro_win: 0,
			pro_ban: 0,
			pub_pick: 0,
			pub_pick_trend: [],
			pub_win: 0,
			pub_win_trend: []
		}))
		.sort((a, b) => a.id - b.id);

	const heroesString = heroes
		.map((hero) => {
			const heroStr = JSON.stringify(hero, null, 8);
			return heroStr
				.split('\n')
				.map((line) => '\t\t' + line)
				.join('\n');
		})
		.join(',\n');

	return `export const heroData: Hero[] = [
${heroesString}
];`;
};

const buildHeroAbilities = (dotaAbilities, dotaHeroes) => {
	const escapeSingleQuotes = (obj) => {
		if (typeof obj === 'string') {
			return obj.replace(/(?<!\\)'/g, "\\'");
		} else if (Array.isArray(obj)) {
			return obj.map(escapeSingleQuotes);
		} else if (typeof obj === 'object' && obj !== null) {
			const escaped = {};
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					escaped[key] = escapeSingleQuotes(obj[key]);
				}
			}
			return escaped;
		}
		return obj;
	};

	const abilities = Object.entries(dotaAbilities)
		.map(([heroId, data]) => {
			const abilities = data.abilities.map((a) => `'${a.replace(/(?<!\\)'/g, "\\'")}'`).join(',\n\t\t\t');
			const talents = data.talents
				.map((t) => {
					const escaped = escapeSingleQuotes(t);
					const talent = JSON.stringify(escaped, null, 8).replace(/"/g, "'");
					return talent
						.split('\n')
						.map((line) => '\t\t\t' + line)
						.join('\n');
				})
				.join(',\n');
			const facets = data.facets
				.map((f) => {
					const escaped = escapeSingleQuotes(f);
					const facet = JSON.stringify(escaped, null, 8).replace(/"/g, "'");
					return facet
						.split('\n')
						.map((line) => '\t\t\t' + line)
						.join('\n');
				})
				.join(',\n');

			return `	"${heroId}": {
		abilities: [
			${abilities}
		],
		talents: [
${talents}
		],
		facets: [
${facets}
		]
	}`;
		})
		.filter(Boolean)
		.join(',\n');

	return `export const heroAbilities = {
${abilities}
};`;
};

const addHeroesToDatabase = async (heroes) => {
	const existingHeroes = await db.select().from(schema.heroes);
	const existingIds = new Set(existingHeroes.map((h) => h.id));

	const missingHeroes = heroes.filter((hero) => !existingIds.has(hero.id));

	if (missingHeroes.length === 0) {
		console.log('No new heroes to add to database');
		return;
	}

	console.log(`Adding ${missingHeroes.length} new heroes to database...`);

	for (const hero of missingHeroes) {
		try {
			await db.insert(schema.heroes).values({
				id: hero.id,
				name: hero.name,
				img: hero.img
			});
			console.log(`Added hero ${hero.id} (${hero.name}) to database`);
		} catch (error) {
			console.error(`Error adding hero ${hero.id} (${hero.name}):`, error.message);
		}
	}
};

const main = async () => {
	console.log('Fetching heroes from odota/dotaconstants...');
	const dotaHeroes = await fetchHeroes();

	console.log('Fetching hero abilities from odota/dotaconstants...');
	const dotaAbilities = await fetchAbilities();

	console.log(`Found ${Object.keys(dotaHeroes).length} heroes`);
	console.log(`Found ${Object.keys(dotaAbilities).length} hero abilities`);

	console.log('\nBuilding heroMap.ts...');
	const heroMapContent = buildHeroMap(dotaHeroes);
	Bun.write(HERO_MAP_PATH, heroMapContent);
	console.log('Built heroMap.ts');

	console.log('\nBuilding heroData.ts...');
	const heroDataContent = buildHeroData(dotaHeroes);
	Bun.write(HERO_DATA_PATH, heroDataContent);
	console.log('Built heroData.ts');

	console.log('\nBuilding heroAbilities.ts...');
	const heroAbilitiesContent = buildHeroAbilities(dotaAbilities, dotaHeroes);
	Bun.write(HERO_ABILITIES_PATH, heroAbilitiesContent);
	console.log('Built heroAbilities.ts');

	console.log('\nAdding heroes to database...');
	const heroesForDb = Object.entries(dotaHeroes)
		.filter(([_, value]) => value.id)
		.map(([key, value]) => {
			const imgPath = value.img?.startsWith('/apps/dota2/images/dota_react/heroes/')
				? value.img.split('?')[0]
				: `/apps/dota2/images/dota_react/heroes/${value.img || key}.png`;

			return {
				id: value.id,
				name: value.localized_name || key,
				img: `https://cdn.cloudflare.steamstatic.com${imgPath}`
			};
		})
		.sort((a, b) => a.id - b.id);

	await addHeroesToDatabase(heroesForDb);

	console.log('\nDone!');
};

main().catch((error) => {
	console.error('Error:', error);
	process.exit(1);
});
