import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../lib/server/schema';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { format, resolveConfig } from 'prettier';
import { writeFile } from 'node:fs/promises';

const writeReference = async (path: string, content: string) => {
	await writeFile(path, await format(content, { ...(await resolveConfig(path)), filepath: path }));
};
import type { Hero } from '../lib/data/heroData';

type SourceHero = Partial<Hero> & { id: number; name: string };
type HeroAbilities = {
	abilities: string[];
	talents: { name: string; level: number }[];
	facets: unknown[];
};

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

const HEROES_URL =
	'https://raw.githubusercontent.com/odota/dotaconstants/refs/heads/master/build/heroes.json';
const ABILITIES_URL =
	'https://raw.githubusercontent.com/odota/dotaconstants/refs/heads/master/build/hero_abilities.json';

const ABILITY_IDS_URL =
	'https://raw.githubusercontent.com/odota/dotaconstants/master/build/ability_ids.json';
const ABILITY_NAMES_URL =
	'https://raw.githubusercontent.com/odota/dotaconstants/master/build/abilities.json';
const ABILITY_NAMES_PATH = './src/lib/data/abilityNames.ts';

const fetchJson = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Reference data request failed: ${response.status}`);
	return response.json();
};

const HERO_MAP_PATH = './src/lib/data/heroMap.ts';
const HERO_DATA_PATH = './src/lib/data/heroData.ts';
const HERO_ABILITIES_PATH = './src/lib/data/heroAbilities.ts';

const fetchHeroes = async () => {
	const response = await fetch(HEROES_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch heroes: ${response.statusText}`);
	}
	return (await response.json()) as Record<string, SourceHero>;
};

const fetchAbilities = async () => {
	const response = await fetch(ABILITIES_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch hero abilities: ${response.statusText}`);
	}
	return (await response.json()) as Record<string, HeroAbilities>;
};

const buildHeroMap = (dotaHeroes: Record<string, SourceHero>) => {
	const entries = Object.entries(dotaHeroes)
		.filter(([_, value]) => value.id)
		.map(([key, value]) => {
			const imgPath = value.img?.startsWith('/apps/dota2/images/dota_react/heroes/')
				? value.img.split('?')[0]
				: `/apps/dota2/images/dota_react/heroes/${value.img ?? key}.png`;

			const name = JSON.stringify(value.localized_name ?? key);

			return `heroMap.set(${value.id}, {
	id: ${value.id},
	name: ${name},
	img: 'https://cdn.cloudflare.steamstatic.com${imgPath}'
});`;
		})
		.join('\n');

	return `const heroMap = new Map<number, { id: number; name: string; img: string }>();

${entries}

export { heroMap };
`;
};

const buildHeroData = (dotaHeroes: Record<string, SourceHero>) => {
	const heroes = Object.entries(dotaHeroes)
		.filter(([_, value]) => value.id)
		.map(([key, value]) => ({
			id: value.id,
			name: value.name,
			primary_attr: value.primary_attr ?? 'all',
			attack_type: value.attack_type ?? 'Melee',
			roles: value.roles ?? [],
			img: value.img ? `https://cdn.cloudflare.steamstatic.com${value.img}` : '',
			icon: value.icon ? `https://cdn.cloudflare.steamstatic.com${value.icon}` : '',
			base_health: value.base_health ?? 200,
			base_health_regen: value.base_health_regen ?? 0,
			base_mana: value.base_mana ?? 75,
			base_mana_regen: value.base_mana_regen ?? 0,
			base_armor: value.base_armor ?? 0,
			base_mr: value.base_mr ?? 25,
			base_attack_min: value.base_attack_min ?? 20,
			base_attack_max: value.base_attack_max ?? 25,
			base_str: value.base_str ?? 20,
			base_agi: value.base_agi ?? 20,
			base_int: value.base_int ?? 20,
			str_gain: value.str_gain ?? 2,
			agi_gain: value.agi_gain ?? 2,
			int_gain: value.int_gain ?? 2,
			attack_range: value.attack_range ?? 150,
			projectile_speed: value.projectile_speed ?? 0,
			attack_rate: value.attack_rate ?? 1.7,
			base_attack_time: value.base_attack_time ?? 100,
			attack_point: value.attack_point ?? 0.5,
			move_speed: value.move_speed ?? 300,
			turn_rate: value.turn_rate ?? 0.6,
			cm_enabled: value.cm_enabled !== false,
			legs: value.legs ?? 2,
			day_vision: value.day_vision ?? 1800,
			night_vision: value.night_vision ?? 800,
			localized_name: value.localized_name ?? key,
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

	return `export const heroData = [
${heroesString}
];

export type Hero = (typeof heroData)[number];`;
};

const buildHeroAbilities = (dotaAbilities: Record<string, unknown>) => {
	return `export const heroAbilities = ${JSON.stringify(dotaAbilities, null, 2)};\n`;
};

const addHeroesToDatabase = async (entries: { id: number; name: string; img: string }[]) => {
	await db
		.insert(schema.heroes)
		.values(entries)
		.onConflictDoUpdate({
			target: schema.heroes.id,
			set: { name: sql`excluded.name`, img: sql`excluded.img` }
		});
	console.log(`Synchronized ${entries.length} heroes; historical IDs retained`);
};

const main = async () => {
	console.log('Fetching heroes from odota/dotaconstants...');
	const dotaHeroes = await fetchHeroes();

	console.log('Fetching hero abilities from odota/dotaconstants...');
	const dotaAbilities = await fetchAbilities();

	const abilityIds = await fetchJson(ABILITY_IDS_URL);
	const abilityDetails = await fetchJson(ABILITY_NAMES_URL);
	const abilityNames: Record<number, string> = {};
	for (const [id, name] of Object.entries(abilityIds)) {
		const label = abilityDetails[String(name)]?.dname;
		if (label) abilityNames[Number(id)] = label;
	}
	// Valve's feed is available on patch day before dotaconstants catches up.
	const heroIds = Object.keys(dotaHeroes);
	for (let offset = 0; offset < heroIds.length; offset += 8) {
		await Promise.all(
			heroIds.slice(offset, offset + 8).map(async (id) => {
				const response = await fetchJson(
					`https://www.dota2.com/datafeed/herodata?language=english&hero_id=${id}`
				);
				const live = response.result?.data?.heroes?.[0];
				if (live?.id !== Number(id)) throw new Error(`Missing Valve hero ${id}`);
				const hero = dotaHeroes[id];
				Object.assign(hero, {
					localized_name: live.name_loc,
					primary_attr: ['str', 'agi', 'int', 'all'][live.primary_attr],
					base_str: live.str_base,
					base_agi: live.agi_base,
					base_int: live.int_base,
					str_gain: live.str_gain,
					agi_gain: live.agi_gain,
					int_gain: live.int_gain,
					attack_range: live.attack_range,
					attack_rate: live.attack_rate,
					projectile_speed: live.projectile_speed,
					move_speed: live.movement_speed,
					turn_rate: live.turn_rate,
					day_vision: live.sight_range_day,
					night_vision: live.sight_range_night,
					base_health: live.max_health - live.str_base * 20,
					base_mana: live.max_mana - live.int_base * 12,
					base_health_regen: Math.round((live.health_regen - live.str_base * 0.1) * 100) / 100,
					base_mana_regen: Math.round((live.mana_regen - live.int_base * 0.05) * 100) / 100,
					base_armor: Math.round((live.armor - live.agi_base / 6) * 100) / 100
				});
				for (const ability of [...live.abilities, ...live.talents]) {
					if (ability.name_loc) abilityNames[ability.id] = ability.name_loc;
				}
				// Keep legacy facet metadata for the historical match UI.
				dotaAbilities[hero.name].abilities = live.abilities
					.filter((a: { type: number }) => a.type !== 2)
					.map((a: { name: string }) => a.name);
				dotaAbilities[hero.name].talents = live.talents.map(
					(a: { name: string }, index: number) => ({
						name: a.name,
						level: Math.floor(index / 2) + 1
					})
				);
			})
		);
	}
	await writeReference(
		ABILITY_NAMES_PATH,
		`// Generated from odota/dotaconstants and Valve's live hero data.\nexport const abilityNames: Record<number, string> = ${JSON.stringify(abilityNames, null, 2)};\n`
	);
	console.log(`Found ${Object.keys(dotaHeroes).length} heroes`);
	console.log(`Found ${Object.keys(dotaAbilities).length} hero abilities`);

	console.log('\nBuilding heroMap.ts...');
	const heroMapContent = buildHeroMap(dotaHeroes);
	await writeReference(HERO_MAP_PATH, heroMapContent);
	console.log('Built heroMap.ts');

	console.log('\nBuilding heroData.ts...');
	const heroDataContent = buildHeroData(dotaHeroes);
	await writeReference(HERO_DATA_PATH, heroDataContent);
	console.log('Built heroData.ts');

	console.log('\nBuilding heroAbilities.ts...');
	const heroAbilitiesContent = buildHeroAbilities(dotaAbilities);
	await writeReference(HERO_ABILITIES_PATH, heroAbilitiesContent);
	console.log('Built heroAbilities.ts');

	console.log('\nAdding heroes to database...');
	const heroesForDb = Object.entries(dotaHeroes)
		.filter(([_, value]) => value.id)
		.map(([key, value]) => {
			const imgPath = value.img?.startsWith('/apps/dota2/images/dota_react/heroes/')
				? value.img.split('?')[0]
				: `/apps/dota2/images/dota_react/heroes/${value.img ?? key}.png`;

			return {
				id: value.id,
				name: value.localized_name ?? key,
				img: `https://cdn.cloudflare.steamstatic.com${imgPath}`
			};
		})
		.sort((a, b) => a.id - b.id);

	await addHeroesToDatabase(heroesForDb);

	console.log('\nDone!');
};

main()
	.catch(() => {
		console.error('Hero refresh failed; check upstream availability and database connectivity.');
		process.exitCode = 1;
	})
	.finally(async () => {
		await client.end();
	});
