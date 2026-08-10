import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { accounts, heroes, matchData, players } from '$lib/server/schema';
import { getStackAnalysisRows } from '$lib/server/stack-analysis';
import { getMatchPlayerWeightGroups } from '$lib/stack-analysis';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const matchId = Number(params.id);
	const [matchPlayers, stackAnalysisRows] = await Promise.all([
		db
			.select({
				team: matchData.team,
				role: matchData.role,
				heroId: heroes.id,
				heroName: heroes.name,
				heroImg: heroes.img,
				playerId: players.id,
				username: players.username
			})
			.from(matchData)
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.innerJoin(players, eq(players.id, accounts.owner))
			.innerJoin(heroes, eq(heroes.id, matchData.heroId))
			.where(eq(matchData.matchId, matchId)),
		getStackAnalysisRows()
	]);

	const makeTeam = (team: 'radiant' | 'dire') => ({
		label: `${team === 'radiant' ? 'Radiant' : 'Dire'} stack`,
		players: matchPlayers
			.filter((player) => player.team === team)
			.map((player) => ({
				role: player.role,
				hero_id: player.heroId,
				hero: { name: player.heroName, img: player.heroImg },
				user: { id: player.playerId, username: player.username }
			}))
	});

	const playerWeightGroups = getMatchPlayerWeightGroups(stackAnalysisRows, [
		makeTeam('radiant'),
		makeTeam('dire')
	]);

	return json(
		{ playerWeightGroups },
		{
			headers: {
				'cache-control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600'
			}
		}
	);
};
