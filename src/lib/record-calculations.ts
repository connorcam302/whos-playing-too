import type { RecordEntry, RecordMatchData, RecordsFilters, RecordSet } from './records';

export type RecordSourceRow = RecordMatchData & {
	accountId: number;
	team: string;
	winner: string;
	gameMode: number;
	lobby: number;
	heroDamage: number | null;
};

// Rows include every logged game within the date/account scope. Excluded games
// must break streaks rather than silently joining runs on either side of them.
export const calculateAdditionalRecords = (
	rows: RecordSourceRow[],
	filters: RecordsFilters
): RecordSet[] => {
	const eligible = (row: RecordSourceRow) =>
		row.gameMode === 22 &&
		row.duration > 900 &&
		filters.roles.includes(row.role) &&
		filters.lobbies.includes(row.lobby) &&
		(filters.hero === -1 || row.hero.id === filters.hero);
	const dataFor = (row: RecordSourceRow): RecordMatchData => ({
		id: row.id,
		username: row.username,
		smurf: row.smurf,
		kills: row.kills,
		deaths: row.deaths,
		assists: row.assists,
		matchId: row.matchId,
		sequenceNumber: row.sequenceNumber,
		hero: row.hero,
		impact: row.impact,
		role: row.role,
		duration: row.duration,
		startTime: row.startTime
	});
	const top = (entries: RecordEntry[]) =>
		entries
			.sort(
				(a, b) =>
					b.record - a.record ||
					b.data.startTime - a.data.startTime ||
					b.data.matchId - a.data.matchId ||
					a.data.id - b.data.id
			)
			.slice(0, 10);
	const performances = rows.filter(eligible);
	const games = new Map<number, RecordEntry>();
	for (const row of performances) {
		const existing = games.get(row.matchId);
		if (existing) existing.participants!.push(dataFor(row));
		else
			games.set(row.matchId, {
				record: row.duration,
				data: dataFor(row),
				participants: [dataFor(row)]
			});
	}

	const wins: RecordEntry[] = [];
	const losses: RecordEntry[] = [];
	let run: { accountId: number; won: boolean; entry: RecordEntry } | undefined;
	const finishRun = () => {
		if (run && run.entry.record >= 2) (run.won ? wins : losses).push(run.entry);
		run = undefined;
	};
	const chronological = [...rows].sort(
		(a, b) => a.accountId - b.accountId || a.startTime - b.startTime || a.matchId - b.matchId
	);
	for (const row of chronological) {
		if (
			!eligible(row) ||
			!['radiant', 'dire'].includes(row.team) ||
			!['radiant', 'dire'].includes(row.winner)
		) {
			finishRun();
			continue;
		}
		const won = row.team === row.winner;
		if (run && run.accountId === row.accountId && run.won === won) {
			run.entry.record++;
			run.entry.data = dataFor(row);
			run.entry.streak!.endTime = row.startTime;
		} else {
			finishRun();
			run = {
				accountId: row.accountId,
				won,
				entry: {
					record: 1,
					data: dataFor(row),
					streak: { startTime: row.startTime, startMatchId: row.matchId, endTime: row.startTime }
				}
			};
		}
	}
	finishRun();

	return [
		{
			key: 'highest-dpm',
			title: 'Highest Damage per Minute',
			recordTitle: 'Damage/min',
			category: 'damage',
			format: 'rate',
			records: top(
				performances
					.filter((row) => row.heroDamage !== null)
					.map((row) => ({ record: (row.heroDamage! * 60) / row.duration, data: dataFor(row) }))
			)
		},
		{
			key: 'highest-kda',
			title: 'Highest KDA',
			recordTitle: 'KDA',
			category: 'highlights',
			format: 'ratio',
			records: top(
				performances.map((row) => ({
					record: (row.kills + row.assists) / Math.max(row.deaths, 1),
					data: dataFor(row)
				}))
			)
		},
		{
			key: 'longest-games',
			title: 'Longest Games',
			recordTitle: 'Duration',
			category: 'runs',
			kind: 'match',
			format: 'duration',
			records: top([...games.values()])
		},
		{
			key: 'longest-winning-streak',
			title: 'Longest Winning Streak',
			recordTitle: 'Wins',
			category: 'runs',
			kind: 'streak',
			format: 'count',
			records: top(wins)
		},
		{
			key: 'longest-losing-streak',
			title: 'Longest Losing Streak',
			recordTitle: 'Losses',
			category: 'runs',
			kind: 'streak',
			format: 'count',
			records: top(losses)
		}
	];
};
