import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAdditionalRecords, type RecordSourceRow } from './record-calculations';
import type { RecordsFilters } from './records';

const filters: RecordsFilters = {
	roles: [1, 2, 3, 4, 5],
	lobbies: [0, 7],
	hero: -1,
	dateRange: 'all',
	includeSmurfs: true
};
const row = (matchId: number, extra: Partial<RecordSourceRow> = {}): RecordSourceRow => ({
	id: 1,
	username: 'Player',
	accountId: 100,
	smurf: false,
	matchId,
	startTime: matchId * 10000,
	duration: 1800,
	sequenceNumber: null,
	hero: { id: 1, name: 'Hero', img: '' },
	role: 1,
	gameMode: 22,
	lobby: 7,
	team: 'radiant',
	winner: 'radiant',
	kills: 10,
	deaths: 2,
	assists: 10,
	impact: 100,
	heroDamage: 30000,
	...extra
});
const get = (rows: RecordSourceRow[], key: string, scope = filters) =>
	calculateAdditionalRecords(rows, scope).find((record) => record.key === key)!.records;

test('DPM ranks rates rather than totals, retains zero, excludes missing damage', () => {
	const records = get(
		[
			row(1, { heroDamage: 60000, duration: 3600 }),
			row(2, { heroDamage: 40000, duration: 1200 }),
			row(3, { heroDamage: null }),
			row(4, { heroDamage: 0 }),
			row(5, { duration: 0 })
		],
		'highest-dpm'
	);
	assert.deepEqual(
		records.map((record) => [record.data.matchId, record.record]),
		[
			[2, 2000],
			[1, 1000],
			[4, 0]
		]
	);
});

test('KDA uses a divisor of one for deathless games and keeps fractional precision', () => {
	const records = get(
		[row(1, { kills: 5, assists: 8, deaths: 0 }), row(2, { kills: 1, assists: 0, deaths: 3 })],
		'highest-kda'
	);
	assert.equal(records[0].record, 13);
	assert.equal(records[1].record, 1 / 3);
});

test('longest games are unique matches with all qualifying tracked participants', () => {
	const records = get(
		[row(1), row(1, { id: 2, accountId: 200 }), row(2, { duration: 7200 })],
		'longest-games'
	);
	assert.equal(records.length, 2);
	assert.equal(records[0].record, 7200);
	assert.deepEqual(
		records[1].participants?.map((player) => player.id),
		[1, 2]
	);
});

test('streaks are maximal chronological runs, not overlapping suffixes', () => {
	const rows = [
		row(5),
		row(1),
		row(4, { winner: 'dire' }),
		row(2),
		row(3, { winner: 'dire' }),
		row(6)
	];
	const wins = get(rows, 'longest-winning-streak');
	const losses = get(rows, 'longest-losing-streak');
	assert.deepEqual(
		wins.map((entry) => [entry.record, entry.streak?.startMatchId, entry.data.matchId]),
		[
			[2, 5, 6],
			[2, 1, 2]
		]
	);
	assert.deepEqual(
		losses.map((entry) => [entry.record, entry.streak?.startMatchId, entry.data.matchId]),
		[[2, 3, 4]]
	);
});

test('excluded hero, role, lobby, short game and mode each break a streak', () => {
	for (const excluded of [
		{ hero: { id: 2, name: 'Other', img: '' } },
		{ role: 2 },
		{ lobby: 0 },
		{ duration: 900 },
		{ gameMode: 23 },
		{ winner: 'unknown' }
	]) {
		const rows = [row(1), row(2, excluded), row(3)];
		assert.equal(
			get(rows, 'longest-winning-streak', { ...filters, hero: 1, roles: [1], lobbies: [7] }).length,
			0
		);
	}
});

test('main and smurf accounts belonging to the same player never combine runs', () => {
	assert.equal(
		get([row(1), row(2, { accountId: 200, smurf: true })], 'longest-winning-streak').length,
		0
	);
});

test('empty datasets return all five record definitions with empty leaderboards', () => {
	const records = calculateAdditionalRecords([], filters);
	assert.equal(records.length, 5);
	assert.ok(records.every((record) => record.records.length === 0));
});

test('top ten is capped and equal values use deterministic latest-match ordering', () => {
	const records = get(
		Array.from({ length: 12 }, (_, index) => row(index + 1)),
		'highest-kda'
	);
	assert.equal(records.length, 10);
	assert.deepEqual(
		records.map((entry) => entry.data.matchId),
		[12, 11, 10, 9, 8, 7, 6, 5, 4, 3]
	);
});
