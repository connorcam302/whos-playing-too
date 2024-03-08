import { getPlayerStats } from '$lib/server/db-functions';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, params }) => {
	console.log(url.pathname, 'requested.');

	const rolesFilter = JSON.parse(url.searchParams.get('roles')!);

	const lobbyFilter = JSON.parse(url.searchParams.get('lobby')!);

	const timeFilter = JSON.parse(url.searchParams.get('time')!);

	const heroFilter = JSON.parse(url.searchParams.get('hero')!);

	const smurfFilter = JSON.parse(url.searchParams.get('smurf')!);

	const userData = await getPlayerStats(
		Number(params.id),
		timeFilter,
		rolesFilter,
		lobbyFilter,
		heroFilter,
		smurfFilter
	);

	return json(userData);
};
