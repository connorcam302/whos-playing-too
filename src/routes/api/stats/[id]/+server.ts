import { getPlayerStats } from '$lib/server/db-functions';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, params }) => {
	console.log(url.pathname, 'requested.');
	console.log(params.id, 'requested.');

	const rolesFilter = JSON.parse(url.searchParams.get('roles')!);

	const lobbyFilter = JSON.parse(url.searchParams.get('lobby')!);

	const timeFilter = JSON.parse(url.searchParams.get('time')!);

	const userData = await getPlayerStats(Number(params.id), timeFilter, rolesFilter, lobbyFilter);

	return json(userData);
};
