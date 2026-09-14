import { and, eq, gte, inArray, lte, notInArray, sql } from 'drizzle-orm';
import { db } from './database';
import { accounts, heroes, matchData, matches, players } from './schema';
import { hiddenFromAggregatePlayerIds } from './visibility-config';
import { calculateAdditionalRecords } from '$lib/record-calculations';
import type { DateRangeBounds } from '$lib/data/dotaPatchRanges';
import type { RecordsFilters } from '$lib/records';

export const getAdditionalRecords = async (filters: RecordsFilters, bounds: DateRangeBounds) => {
	const participantFields = {
		id: players.id,
		username: players.username,
		smurf: accounts.smurf,
		kills: matchData.kills,
		deaths: matchData.deaths,
		assists: matchData.assists,
		matchId: matches.id,
		sequenceNumber: matches.sequenceNumber,
		hero: { id: heroes.id, name: heroes.name, img: heroes.img },
		impact: matchData.impact,
		role: matchData.role,
		duration: matches.duration,
		startTime: matches.startTime
	};
	const rows = await db
		.select({
			...participantFields,
			accountId: accounts.accountId,
			team: matchData.team,
			winner: matches.winner,
			gameMode: matches.gameMode,
			lobby: matches.lobby,
			heroDamage: matchData.heroDamage
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(players.id, accounts.owner))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId))
		.where(
			and(
				bounds.start === null ? sql`true` : gte(matches.startTime, bounds.start),
				bounds.end === null ? sql`true` : lte(matches.startTime, bounds.end),
				filters.includeSmurfs ? sql`true` : eq(accounts.smurf, false),
				hiddenFromAggregatePlayerIds.length
					? notInArray(players.id, hiddenFromAggregatePlayerIds)
					: sql`true`
			)
		);
	const records = calculateAdditionalRecords(rows, filters);
	const longestGames = records.find((record) => record.key === 'longest-games')!;
	if (longestGames.records.length > 0) {
		// Filters qualify the match; its lineup includes tracked smurf participants too.
		const participants = await db
			.select(participantFields)
			.from(matchData)
			.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
			.innerJoin(players, eq(players.id, accounts.owner))
			.innerJoin(matches, eq(matches.id, matchData.matchId))
			.innerJoin(heroes, eq(heroes.id, matchData.heroId))
			.where(
				and(
					inArray(
						matches.id,
						longestGames.records.map((entry) => entry.data.matchId)
					),
					hiddenFromAggregatePlayerIds.length
						? notInArray(players.id, hiddenFromAggregatePlayerIds)
						: sql`true`
				)
			);
		for (const entry of longestGames.records) {
			entry.participants = participants.filter(
				(participant) => participant.matchId === entry.data.matchId
			);
		}
	}
	return records;
};
