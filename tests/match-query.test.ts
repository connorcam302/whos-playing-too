import { describe, it as test } from 'node:test';
import assert from 'node:assert/strict';
import { PgDialect } from 'drizzle-orm/pg-core';
import { parseMatchQuery, combineQueryChain } from '../src/lib/match-query';
import { buildMatchQuery } from '../src/lib/server/match-query';

const compile = (
	conditions: { field: string; operator: string; value: string }[],
	mode = 'all'
) => {
	const query = parseMatchQuery(JSON.stringify({ mode, conditions }));
	return new PgDialect().sqlToQuery(buildMatchQuery(query)!);
};

describe('match explorer queries', () => {
	test('rejects malformed, unsupported and unbounded queries', () => {
		for (const value of [
			'null',
			'{}',
			'bad json',
			JSON.stringify({
				mode: 'all',
				conditions: [{ field: 'kills; drop table matches', operator: 'eq', value: '1' }]
			}),
			JSON.stringify({
				mode: 'all',
				conditions: Array(21).fill({ field: 'kills', operator: 'eq', value: '1' })
			})
		]) {
			assert.throws(() => parseMatchQuery(value));
		}
	});
	test('rejects invalid values and impossible calendar dates', () => {
		for (const [field, value] of [
			['kills', ''],
			['kills', 'Infinity'],
			['kills', '20.5'],
			['kills', '1 OR 1=1'],
			['date', '2026-02-30'],
			['team', 'unknown'],
			['item', '0']
		]) {
			assert.throws(() => compile([{ field, operator: 'eq', value }]));
		}
	});
	test('combines conditions with bound parameters and correct boolean logic', () => {
		const conditions = [
			{ field: 'kills', operator: 'gte', value: '20' },
			{ field: 'goldPerMin', operator: 'gte', value: '800' }
		];
		const all = compile(conditions);
		assert.ok(all.sql.includes(' and '));
		assert.deepEqual(all.params, [20, 800]);
		assert.ok(compile(conditions, 'any').sql.includes(' or '));
	});
	test('converts minutes and dates, and guards deathless KDA', () => {
		assert.ok(
			compile([{ field: 'duration', operator: 'gte', value: '60' }]).sql.includes('/ 60.0')
		);
		assert.deepEqual(compile([{ field: 'date', operator: 'eq', value: '2026-09-14' }]).params, [
			Date.parse('2026-09-14') / 1000
		]);
		assert.ok(compile([{ field: 'kda', operator: 'gt', value: '10' }]).sql.includes('greatest('));
	});
	test('item exclusion tolerates missing slots and covers backpacks and neutral items', () => {
		const { sql, params } = compile([{ field: 'item', operator: 'ne', value: '1' }]);
		assert.ok(sql.includes('"backpack_2"'));
		assert.ok(sql.includes('"item_neutral"'));
		assert.ok(sql.includes('is null'));
		assert.deepEqual(params, Array(10).fill(1));
	});
	test('player conditions match the account owner while account ID remains separate', () => {
		for (const operator of ['eq', 'ne']) {
			const player = compile([{ field: 'player', operator, value: '4' }]);
			assert.ok(player.sql.includes('"players"."id"'));
			assert.deepEqual(player.params, [4]);
		}
		assert.ok(
			compile([{ field: 'playerId', operator: 'eq', value: '1234' }]).sql.includes(
				'"match_data"."player_id"'
			)
		);
		for (const value of ['', 'Colfox', '0', '1.5']) {
			assert.throws(() => compile([{ field: 'player', operator: 'eq', value }]));
		}
		assert.throws(() => compile([{ field: 'player', operator: 'gte', value: '4' }]));
	});
	test('missing stats use NULL checks without requiring a value', () => {
		const { sql, params } = compile([{ field: 'heroDamage', operator: 'missing', value: '' }]);
		assert.ok(sql.includes('is null'));
		assert.deepEqual(params, []);
	});
});

describe('chained player groups', () => {
	const condition = (field: string, value: string, join?: 'and' | 'or') => ({
		field,
		value,
		operator: 'eq',
		join
	});
	test('keeps player and hero on the same row and uses separate correlated groups', () => {
		const query = parseMatchQuery(
			JSON.stringify({
				mode: 'all',
				conditions: [condition('player', '4'), condition('hero', '2')],
				groups: [{ mode: 'all', join: 'and', conditions: [condition('player', '9')] }]
			})
		);
		const compiled = new PgDialect().sqlToQuery(buildMatchQuery(query)!);
		assert.ok(compiled.sql.includes('from "match_data" as "query_data_0"'));
		assert.ok(compiled.sql.includes('"query_data_0"."match_id" = "matches"."id"'));
		assert.ok(compiled.sql.includes('"query_data_1"."match_id" = "matches"."id"'));
		assert.ok(compiled.sql.includes('"query_player_0"."id" ='));
		assert.ok(compiled.sql.includes('"query_data_0"."hero_id" ='));
		assert.deepEqual(compiled.params, [false, 4, 2, false, 9]);
		assert.deepEqual(new PgDialect().sqlToQuery(buildMatchQuery(query, true)!).params, [4, 2, 9]);
	});
	test('rejects empty groups, unknown connectors and excess total conditions', () => {
		for (const group of [
			{ mode: 'all', conditions: [] },
			{ mode: 'all', join: 'xor', conditions: [condition('player', '4')] },
			{ mode: 'all', conditions: Array(20).fill(condition('player', '4')) }
		]) {
			assert.throws(() =>
				parseMatchQuery(
					JSON.stringify({ mode: 'all', conditions: [condition('player', '9')], groups: [group] })
				)
			);
		}
		assert.throws(() =>
			parseMatchQuery(
				JSON.stringify({ mode: 'all', conditions: [{ ...condition('player', '4'), join: 'xor' }] })
			)
		);
	});
});

test('AND precedence works for both mixed connector orders', () => {
	for (const a of [false, true])
		for (const b of [false, true])
			for (const c of [false, true]) {
				assert.equal(
					combineQueryChain(
						[a, b, c],
						['or', 'and'],
						(parts) => parts.every(Boolean),
						(parts) => parts.some(Boolean)
					),
					a || (b && c)
				);
				assert.equal(
					combineQueryChain(
						[a, b, c],
						['and', 'or'],
						(parts) => parts.every(Boolean),
						(parts) => parts.some(Boolean)
					),
					(a && b) || c
				);
			}
});
