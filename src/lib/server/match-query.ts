import { and, or, eq, ne, gt, gte, lt, lte, isNull, isNotNull, sql, type SQL } from 'drizzle-orm';
import { matchData, matches, players, accounts } from './schema';
import { combineQueryChain, type MatchQuery, type QueryGroup } from '../match-query';
import { alias } from 'drizzle-orm/pg-core';

const aliasData = (name: string) => alias(matchData, name);
const aliasPlayer = (name: string) => alias(players, name);
type QueryDataSource = typeof matchData | ReturnType<typeof aliasData>;
type QueryPlayerSource = typeof players | ReturnType<typeof aliasPlayer>;

const getColumns = (data: QueryDataSource = matchData, player: QueryPlayerSource = players) => ({
	player: player.id,
	hero: data.heroId,
	matchId: matches.id,
	duration: sql`${matches.duration} / 60.0`,
	date: sql`(${matches.startTime} / 86400) * 86400`,
	gameMode: matches.gameMode,
	lobby: matches.lobby,
	kills: data.kills,
	deaths: data.deaths,
	assists: data.assists,
	kda: sql`(${data.kills} + ${data.assists})::numeric / greatest(${data.deaths}, 1)`,
	impact: data.impact,
	heroDamage: data.heroDamage,
	towerDamage: data.towerDamage,
	goldPerMin: data.goldPerMin,
	xpPerMin: data.xpPerMin,
	lastHits: data.lastHits,
	level: data.level,
	facet: data.facet,
	playerId: data.playerId,
	team: data.team,
	aghanimsScepter: data.aghanimsScepter,
	aghanimsShard: data.aghanimsShard
});
const getItemColumns = (data: QueryDataSource = matchData) => [
	data.item0,
	data.item1,
	data.item2,
	data.item3,
	data.item4,
	data.item5,
	data.backpack0,
	data.backpack1,
	data.backpack2,
	data.itemNeutral
];

const buildRowQuery = (
	query: QueryGroup,
	data: QueryDataSource = matchData,
	player: QueryPlayerSource = players
): SQL | undefined => {
	const columns = getColumns(data, player);
	const itemColumns = getItemColumns(data);
	const conditions = query.conditions.map((condition) => {
		if (condition.field === 'item') {
			if (condition.operator === 'missing')
				return and(...itemColumns.map((column) => or(isNull(column), eq(column, 0))))!;
			if (condition.operator === 'present')
				return or(...itemColumns.map((column) => gt(column, 0)))!;
			const value = Number(condition.value);
			return condition.operator === 'eq'
				? or(...itemColumns.map((column) => eq(column, value)))!
				: and(...itemColumns.map((column) => or(isNull(column), ne(column, value))))!;
		}
		const source = columns[condition.field as keyof typeof columns];
		if (!source) throw new Error('Unsupported query field.');
		const column = sql`${source}`;
		if (condition.operator === 'missing') return isNull(column);
		if (condition.operator === 'present') return isNotNull(column);
		const value =
			condition.field === 'team'
				? condition.value
				: condition.field === 'date'
					? Date.parse(condition.value) / 1000
					: Number(condition.value);
		switch (condition.operator) {
			case 'eq':
				return eq(column, value);
			case 'ne':
				return ne(column, value);
			case 'gt':
				return gt(column, value);
			case 'gte':
				return gte(column, value);
			case 'lt':
				return lt(column, value);
			case 'lte':
				return lte(column, value);
			default:
				throw new Error('Unsupported query comparison.');
		}
	});
	return combineQueryChain(
		conditions,
		query.conditions
			.slice(1)
			.map((condition) => condition.join ?? (query.mode === 'any' ? 'or' : 'and')),
		(parts) => and(...parts)!,
		(parts) => or(...parts)!
	);
};

export const buildMatchQuery = (query: MatchQuery, includeSmurfs = false): SQL | undefined => {
	if (!query.groups?.length) return buildRowQuery(query);
	const groups = [query, ...query.groups];
	const conditions = groups.map((group, index) => {
		const data = alias(matchData, `query_data_${index}`);
		const account = alias(accounts, `query_account_${index}`);
		const player = alias(players, `query_player_${index}`);
		return sql`exists (select 1 from ${matchData} as ${sql.identifier(`query_data_${index}`)}
			inner join ${accounts} as ${sql.identifier(`query_account_${index}`)} on ${account.accountId} = ${data.playerId}
			inner join ${players} as ${sql.identifier(`query_player_${index}`)} on ${player.id} = ${account.owner}
			where ${data.matchId} = ${matches.id}
			and ${includeSmurfs ? sql`true` : eq(account.smurf, false)}
			and ${buildRowQuery(group, data, player)})`;
	});
	return combineQueryChain(
		conditions,
		query.groups.map((group) => group.join ?? 'and'),
		(parts) => and(...parts)!,
		(parts) => or(...parts)!
	);
};
