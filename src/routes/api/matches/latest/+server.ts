import { json, type RequestHandler } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { db } from '$lib/server/database';
import { matches } from '$lib/server/schema';

export const GET: RequestHandler = async () => {
	const [latestMatch] = await db
		.select({ id: matches.id })
		.from(matches)
		.orderBy(desc(matches.id))
		.limit(1);

	return json(
		{ id: latestMatch?.id ?? null },
		{ headers: { 'cache-control': 'no-store, max-age=0' } }
	);
};
