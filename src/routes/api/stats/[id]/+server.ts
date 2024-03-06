import { getPlayerStats } from '$lib/server/db-functions';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, params }) => {
	console.log(url.pathname, 'requested.');
	console.log(params.id, 'requested.');

	const userData = await getPlayerStats(Number(params.id), 999);

	return json(userData);
};
