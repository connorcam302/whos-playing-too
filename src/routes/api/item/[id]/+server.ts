import { RequestHandler, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, params }) => {
	const rawItemData = await fetch(
		`https://www.dota2.com/datafeed/itemdata?language=english&item_id=${params.id}`,
		{
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		}
	)
		.then(async (res) => await res.json())
		.then((data) => data.result.data.items[0]);

	return json(rawItemData);
};
