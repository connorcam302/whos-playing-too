import { STEAM_KEY } from '$env/static/private';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, params }) => {
	const matchData = fetch(
		`https://api.steampowered.com/IDOTA2Match_570/getMatchDetails/v1?key=${STEAM_KEY}&match_id=${params.id}`
	)
		.then((res) => res.json())
		.then((data) => data.result);

	return json(await matchData);
};
