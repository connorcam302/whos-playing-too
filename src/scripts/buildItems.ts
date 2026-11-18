import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../lib/server/schema';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { format, resolveConfig } from 'prettier';
import { writeFile } from 'node:fs/promises';

const writeReference = async (path: string, content: string) => {
	await writeFile(path, await format(content, { ...(await resolveConfig(path)), filepath: path }));
};

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

const ITEMS_URL =
	'https://raw.githubusercontent.com/odota/dotaconstants/refs/heads/master/build/items.json';

const VALVE_ITEMS_URL = 'https://www.dota2.com/datafeed/itemlist?language=english';

type SourceItem = { id: number; dname?: string; img?: string };

const ITEM_MAP_PATH = './src/lib/data/itemMap.ts';

const fetchItems = async () => {
	const response = await fetch(ITEMS_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch items: ${response.statusText}`);
	}
	const items = (await response.json()) as Record<string, SourceItem>;
	const valveResponse = await fetch(VALVE_ITEMS_URL);
	if (!valveResponse.ok)
		throw new Error(`Failed to fetch Valve items: ${valveResponse.statusText}`);
	const liveItems = (await valveResponse.json()).result?.data?.itemabilities;
	if (!Array.isArray(liveItems) || liveItems.length === 0)
		throw new Error('Valve returned no items');
	// Overlay current names and new IDs, keeping retired items for historical matches.
	for (const item of liveItems) {
		const key = item.name.replace(/^item_/, '');
		for (const [oldKey, oldItem] of Object.entries(items)) {
			if (oldItem.id === item.id && oldKey !== key) delete items[oldKey];
		}
		items[key] = {
			...items[key],
			id: item.id,
			dname: (item.name_loc || items[key]?.dname || key).replace(/\s+/g, ' ').trim(),
			img: `/apps/dota2/images/dota_react/items/${key.startsWith('recipe_') ? 'recipe' : key}.png`
		};
	}
	return items;
};

const buildItemMap = (dotaItems: Record<string, SourceItem>) => {
	const items = Object.entries(dotaItems)
		.filter(([_, value]) => value.id)
		.map(([key, value]) => {
			const imgPath = value.img?.startsWith('/apps/dota2/images/dota_react/items/')
				? value.img.split('?')[0]
				: `/apps/dota2/images/dota_react/items/${value.img || key}.png`;

			const name = JSON.stringify(value.dname || key);

			return `	{
		id: ${value.id},
		name: ${name},
		img: 'https://cdn.cloudflare.steamstatic.com${imgPath}'
	}`;
		})
		.join(',\n');

	return `const itemMap = new Map();

const items = [
${items},
    {
        id: 0,
        name: "Empty",
        img: "/empty-slot.webp"
    }
];

items.forEach((item) => itemMap.set(item.id, item));

export { itemMap };
`;
};

const addItemsToDatabase = async (entries: { id: number; name: string; img: string }[]) => {
	await db
		.insert(schema.items)
		.values(entries)
		.onConflictDoUpdate({
			target: schema.items.id,
			set: { name: sql`excluded.name`, img: sql`excluded.img` }
		});
	console.log(`Synchronized ${entries.length} items; historical IDs retained`);
};

const main = async () => {
	console.log('Fetching items from odota/dotaconstants...');
	const dotaItems = await fetchItems();

	console.log(`Found ${Object.keys(dotaItems).length} items`);

	console.log('\nBuilding itemMap.ts...');
	const itemMapContent = buildItemMap(dotaItems);
	await writeReference(ITEM_MAP_PATH, itemMapContent);
	console.log('Built itemMap.ts');

	console.log('\nAdding items to database...');
	const itemsForDb = Object.entries(dotaItems)
		.filter(([_, value]) => value.id)
		.map(([key, value]) => {
			const imgPath = value.img?.startsWith('/apps/dota2/images/dota_react/items/')
				? value.img.split('?')[0]
				: `/apps/dota2/images/dota_react/items/${value.img || key}.png`;

			return {
				id: value.id,
				name: value.dname || key,
				img: `https://cdn.cloudflare.steamstatic.com${imgPath}`
			};
		})
		.sort((a, b) => a.id - b.id);

	await addItemsToDatabase(itemsForDb);

	console.log('\nDone!');
};

main()
	.catch(() => {
		console.error('Item refresh failed; check upstream availability and database connectivity.');
		process.exitCode = 1;
	})
	.finally(async () => {
		await client.end();
	});
