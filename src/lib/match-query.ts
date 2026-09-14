export type QueryField = {
	key: string;
	label: string;
	group: string;
	type: 'number' | 'date' | 'choice' | 'item' | 'player' | 'hero';
	options?: { value: string; label: string }[];
};

export const QUERY_FIELDS: QueryField[] = [
	...[
		['matchId', 'Match ID'],
		['duration', 'Duration (minutes)'],
		['gameMode', 'Game mode ID'],
		['lobby', 'Lobby ID']
	].map(([key, label]): QueryField => ({ key, label, group: 'Match', type: 'number' })),
	{ key: 'hero', label: 'Hero', group: 'Player performance', type: 'hero' },
	{ key: 'player', label: 'Player', group: 'Player performance', type: 'player' },
	{ key: 'date', label: 'Match date (UTC)', group: 'Match', type: 'date' },
	...[
		['kills', 'Kills'],
		['deaths', 'Deaths'],
		['assists', 'Assists'],
		['kda', 'KDA'],
		['impact', 'Impact score'],
		['heroDamage', 'Hero damage'],
		['towerDamage', 'Tower damage'],
		['goldPerMin', 'Gold per minute'],
		['xpPerMin', 'XP per minute'],
		['lastHits', 'Last hits'],
		['level', 'Level'],
		['facet', 'Facet number'],
		['playerId', 'Account ID']
	].map(
		([key, label]): QueryField => ({ key, label, group: 'Player performance', type: 'number' })
	),
	{
		key: 'team',
		label: 'Side',
		group: 'Player performance',
		type: 'choice',
		options: [
			{ value: 'radiant', label: 'Radiant' },
			{ value: 'dire', label: 'Dire' }
		]
	},
	{ key: 'item', label: 'Item at match end', group: 'Items', type: 'item' },
	...[
		['aghanimsScepter', 'Aghanim’s Scepter upgrade'],
		['aghanimsShard', 'Aghanim’s Shard upgrade']
	].map(
		([key, label]): QueryField => ({
			key,
			label,
			group: 'Items',
			type: 'choice',
			options: [
				{ value: '1', label: 'Yes' },
				{ value: '0', label: 'No' }
			]
		})
	)
];

export const QUERY_OPERATORS = [
	{ value: 'eq', label: 'is' },
	{ value: 'ne', label: 'is not' },
	{ value: 'gte', label: 'at least' },
	{ value: 'lte', label: 'at most' },
	{ value: 'gt', label: 'greater than' },
	{ value: 'lt', label: 'less than' },
	{ value: 'missing', label: 'is missing' },
	{ value: 'present', label: 'is recorded' }
];
export type QueryJoin = 'and' | 'or';
export type QueryCondition = { field: string; operator: string; value: string; join?: QueryJoin };
export type QueryGroup = { mode: 'all' | 'any'; conditions: QueryCondition[]; join?: QueryJoin };
export type MatchQuery = QueryGroup & { groups?: QueryGroup[] };
export const queryConditionCount = (query: MatchQuery) =>
	query.conditions.length +
	(query.groups ?? []).reduce((count, group) => count + group.conditions.length, 0);
export const emptyMatchQuery = (): MatchQuery => ({ mode: 'all', conditions: [] });
export const operatorsFor = (field: QueryField) =>
	QUERY_OPERATORS.filter((operator) =>
		field.type === 'player' || field.type === 'hero'
			? ['eq', 'ne'].includes(operator.value)
			: field.type === 'choice' || field.type === 'item'
				? ['eq', 'ne', 'missing', 'present'].includes(operator.value)
				: true
	);

// Shared validation keeps URL input and the editor subject to the same rules.
export const parseMatchQuery = (raw: string | null): MatchQuery => {
	if (!raw) return emptyMatchQuery();
	let query: MatchQuery;
	try {
		query = JSON.parse(raw);
	} catch {
		throw new Error('The query is not valid JSON.');
	}
	if (!query || !['all', 'any'].includes(query.mode) || !Array.isArray(query.conditions)) {
		throw new Error('Choose whether all or any conditions must match.');
	}
	if (query.groups !== undefined && (!Array.isArray(query.groups) || query.groups.length > 7))
		throw new Error('Use at most 8 player groups.');
	for (const group of query.groups ?? []) {
		if (
			!group ||
			!['all', 'any'].includes(group.mode) ||
			!Array.isArray(group.conditions) ||
			group.conditions.length === 0 ||
			!['and', 'or'].includes(group.join ?? 'and')
		)
			throw new Error('Each player group needs a condition and an AND or OR connector.');
	}
	if (query.groups?.length && !query.conditions.length)
		throw new Error('The first player group needs a condition.');
	if (queryConditionCount(query) > 20) throw new Error('Use at most 20 conditions.');
	for (const condition of [query, ...(query.groups ?? [])].flatMap((group) => group.conditions)) {
		if (condition?.join !== undefined && !['and', 'or'].includes(condition.join))
			throw new Error('Choose AND or OR between conditions.');
		const field = QUERY_FIELDS.find((field) => field.key === condition?.field);
		if (!field || !operatorsFor(field).some((op) => op.value === condition.operator)) {
			throw new Error('The query contains an unsupported field or comparison.');
		}
		if (['missing', 'present'].includes(condition.operator)) continue;
		if (typeof condition.value !== 'string' || !condition.value.trim()) {
			throw new Error(`Enter a value for ${field.label}.`);
		}
		if (field.type === 'date') {
			if (
				!/^\d{4}-\d{2}-\d{2}$/.test(condition.value) ||
				!Number.isFinite(Date.parse(condition.value)) ||
				new Date(condition.value).toISOString().slice(0, 10) !== condition.value
			) {
				throw new Error('Enter a valid match date.');
			}
		} else if (field.type === 'player' || field.type === 'hero') {
			if (!Number.isSafeInteger(Number(condition.value)) || Number(condition.value) <= 0) {
				throw new Error(`Choose a valid ${field.label.toLowerCase()}.`);
			}
		} else if (field.type === 'choice') {
			if (!field.options?.some((option) => option.value === condition.value)) {
				throw new Error(`Choose a value for ${field.label}.`);
			}
		} else if (
			!Number.isFinite(Number(condition.value)) ||
			Math.abs(Number(condition.value)) > Number.MAX_SAFE_INTEGER ||
			(field.type === 'item' &&
				(!Number.isInteger(Number(condition.value)) || Number(condition.value) <= 0))
		) {
			throw new Error(`Enter a valid number for ${field.label}.`);
		}
		if (
			field.type === 'number' &&
			!['duration', 'kda'].includes(field.key) &&
			!Number.isSafeInteger(Number(condition.value))
		) {
			throw new Error(`Enter a whole number for ${field.label}.`);
		}
	}
	return query;
};

// AND binds more tightly than OR; each player group supplies explicit parentheses.
export const combineQueryChain = <T>(
	values: T[],
	joins: QueryJoin[],
	combineAnd: (values: T[]) => T,
	combineOr: (values: T[]) => T
): T | undefined => {
	if (!values.length) return undefined;
	const branches: T[][] = [[values[0]]];
	for (let index = 1; index < values.length; index++) {
		if (joins[index - 1] === 'or') branches.push([values[index]]);
		else branches[branches.length - 1].push(values[index]);
	}
	return combineOr(branches.map(combineAnd));
};
