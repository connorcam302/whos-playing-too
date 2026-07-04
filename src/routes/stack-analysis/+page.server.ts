import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import { and, eq, gt, inArray, not, sql } from 'drizzle-orm';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';

const visiblePlayerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(players.id, hiddenFromAggregatePlayerIds))
		: sql`true`;

export const load = async () => {
	const allHeroes = await db
		.select({
			id: heroes.id,
			name: heroes.name,
			img: heroes.img
		})
		.from(heroes);

	const rows = await db
		.select({
			playerId: players.id,
			username: players.username,
			smurf: accounts.smurf,
			matchId: matches.id,
			sequenceNumber: matches.sequenceNumber,
			startTime: matches.startTime,
			duration: matches.duration,
			lobby: matches.lobby,
			gameMode: matches.gameMode,
			winner: matches.winner,
			team: matchData.team,
			role: matchData.role,
			heroId: heroes.id,
			heroName: heroes.name,
			heroImg: heroes.img,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			heroDamage: matchData.heroDamage,
			towerDamage: matchData.towerDamage
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(players.id, accounts.owner))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(and(gt(matches.duration, 900), visiblePlayerFilter()));

	const playerList = Array.from(
		new Map(
			rows.map((row) => [row.playerId, { id: row.playerId, username: row.username }])
		).values()
	).sort((a, b) => a.username.localeCompare(b.username));
	const heroList = allHeroes.sort((a, b) => a.name.localeCompare(b.name));

	return {
		rows,
		playerList,
		heroList
	};
};
