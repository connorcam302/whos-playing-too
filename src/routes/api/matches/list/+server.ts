import { STEAM_KEY } from '$env/static/private';
import { json, type RequestHandler } from '@sveltejs/kit';
import { laneRates } from '$lib/server/laneRates';
import { heroMap } from '$lib/data/heroMap';
import { itemMap } from '$lib/data/itemMap';
import { accounts, matchData, players } from '$lib/server/schema';
import { db } from '$lib/server/database';
import { and, eq, inArray } from 'drizzle-orm';
import { getMatchDataFromIdAndPlayer } from '$lib/server/db-functions';

export const POST: RequestHandler = async ({ request }) => {
	const { matches, player } = await request.json();

	const totwData = matches.map((str) => {
		const [week, matchId] = str.split(',');
		return { week: week, matchId: matchId === 'NULL' ? null : matchId };
	});

	const matchIds = totwData.map((data) => Number(data.matchId)).filter((id) => id !== 0);

	let matchData = [];
	if (matchIds.length > 0) {
		matchData = await getMatchDataFromIdAndPlayer(matchIds, player.id);
	}

	const result = totwData
		.map((data) => {
			const match = matchData.find((match) => match.matchId === Number(data.matchId));
			return {
				week: data.week,
				matchId: data.matchId,
				match: match
			};
		})
		.sort((a, b) => Number(a.week) - Number(b.week));

	return json(result);
};
