import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '$lib/server/schema';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

const ITEMS_URL =
	'https://raw.githubusercontent.com/odota/dotaconstants/refs/heads/master/build/items.json';

const ITEM_MAP_PATH = './src/lib/data/itemMap.ts';

const fetchItems = async () => {
	const response = await fetch(ITEMS_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch items: ${response.statusText}`);
	}
	return await response.json();
};

const buildItemMap = (dotaItems) => {
	const items = Object.entries(dotaItems)
		.filter(([_, value]) => value.id)
		.map(([key, value]) => {
			const imgPath = value.img?.startsWith('/apps/dota2/images/dota_react/items/')
				? value.img.split('?')[0]
				: `/apps/dota2/images/dota_react/items/${value.img || key}.png`;

			const name = (value.dname || key).replace(/(?<!\\)'/g, "\\'");

			return `	{
		id: ${value.id},
		name: '${name}',
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
        img: "https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp?t=2024-01-05T22%3A27%3A45.243Z"
    }
];

items.forEach((item) => itemMap.set(item.id, item));

export { itemMap };
`;
};

const addItemsToDatabase = async (items) => {
	const existingItems = await db.select().from(schema.items);
	const existingIds = new Set(existingItems.map((item) => item.id));

	const missingItems = items.filter((item) => !existingIds.has(item.id));

	if (missingItems.length === 0) {
		console.log('No new items to add to database');
		return;
	}

	console.log(`Adding ${missingItems.length} new items to database...`);

	for (const item of missingItems) {
		try {
			await db.insert(schema.items).values({
				id: item.id,
				name: item.name,
				img: item.img
			});
			console.log(`Added item ${item.id} (${item.name}) to database`);
		} catch (error) {
			console.error(`Error adding item ${item.id} (${item.name}):`, error.message);
		}
	}
};

const main = async () => {
	console.log('Fetching items from odota/dotaconstants...');
	const dotaItems = await fetchItems();

	console.log(`Found ${Object.keys(dotaItems).length} items`);

	console.log('\nBuilding itemMap.ts...');
	const itemMapContent = buildItemMap(dotaItems);
	Bun.write(ITEM_MAP_PATH, itemMapContent);
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

main().catch((error) => {
	console.error('Error:', error);
	process.exit(1);
});
