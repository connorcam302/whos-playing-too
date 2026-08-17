import {
	getDotaPatchRangeBounds,
	DATE_RANGE_PRESETS,
	type DateRangeBounds
} from '$lib/data/dotaPatchRanges';
import type {
	RecordCategory,
	RecordEntry,
	RecordMatchData,
	RecordSet,
	RecordsFilters,
	RecordsResponse
} from '$lib/records';
import {
	getHighestImpact,
	getLeastHeroDamage,
	getLowestImpact,
	getMostAssists,
	getMostBuildingDamage,
	getMostDeaths,
	getMostGPM,
	getMostHeroDamage,
	getMostKills,
	getMostLastHits,
	getMostXPM,
	getRecordsPlayerMatchCount
} from '$lib/server/db-functions';
import dayjs from 'dayjs';

type RecordsDateFilter = number | DateRangeBounds;

type RecordDefinition = {
	key: string;
	title: string;
	recordTitle: string;
	category: RecordCategory;
	query: () => Promise<Array<{ record: number | null; data: RecordMatchData }>>;
};

const getDateFilter = (dateRange: string): RecordsDateFilter => {
	if (dateRange.startsWith('patch-')) {
		return getDotaPatchRangeBounds(dateRange.replace('patch-', ''));
	}

	const preset = DATE_RANGE_PRESETS.find((range) => range.value === dateRange);
	if (!preset || preset.value === 'all') {
		return { start: null, end: null };
	}

	return {
		start: dayjs()
			.subtract(preset.amount ?? 365, preset.unit ?? 'day')
			.unix(),
		end: null
	};
};

export const getRecordSets = async (filters: RecordsFilters): Promise<RecordsResponse> => {
	const dateFilter = getDateFilter(filters.dateRange);
	const queryArgs = [
		10,
		filters.includeSmurfs,
		dateFilter,
		filters.roles,
		filters.lobbies,
		filters.hero
	] as const;

	const definitions: RecordDefinition[] = [
		{
			key: 'most-kills',
			title: 'Most Kills',
			recordTitle: 'Kills',
			category: 'highlights',
			query: () => getMostKills(...queryArgs)
		},
		{
			key: 'most-assists',
			title: 'Most Assists',
			recordTitle: 'Assists',
			category: 'highlights',
			query: () => getMostAssists(...queryArgs)
		},
		{
			key: 'highest-impact',
			title: 'Highest Impact',
			recordTitle: 'Impact',
			category: 'highlights',
			query: () => getHighestImpact(...queryArgs)
		},
		{
			key: 'most-last-hits',
			title: 'Most Last Hits',
			recordTitle: 'Last Hits',
			category: 'economy',
			query: () => getMostLastHits(...queryArgs)
		},
		{
			key: 'highest-gpm',
			title: 'Highest GPM',
			recordTitle: 'GPM',
			category: 'economy',
			query: () => getMostGPM(...queryArgs)
		},
		{
			key: 'highest-xpm',
			title: 'Highest XPM',
			recordTitle: 'XPM',
			category: 'economy',
			query: () => getMostXPM(...queryArgs)
		},
		{
			key: 'most-building-damage',
			title: 'Most Building Damage',
			recordTitle: 'Building Damage',
			category: 'economy',
			query: () => getMostBuildingDamage(...queryArgs)
		},
		{
			key: 'most-hero-damage',
			title: 'Most Hero Damage',
			recordTitle: 'Hero Damage',
			category: 'damage',
			query: () => getMostHeroDamage(...queryArgs)
		},
		{
			key: 'most-deaths',
			title: 'Most Deaths',
			recordTitle: 'Deaths',
			category: 'notorious',
			query: () => getMostDeaths(...queryArgs)
		},
		{
			key: 'lowest-impact',
			title: 'Lowest Impact',
			recordTitle: 'Impact',
			category: 'notorious',
			query: () => getLowestImpact(...queryArgs)
		},
		{
			key: 'least-hero-damage',
			title: 'Least Hero Damage',
			recordTitle: 'Hero Damage',
			category: 'notorious',
			query: () => getLeastHeroDamage(...queryArgs)
		}
	];

	const [recordResults, playerMatchCount] = await Promise.all([
		Promise.all(definitions.map((definition) => definition.query())),
		getRecordsPlayerMatchCount(
			filters.includeSmurfs,
			dateFilter,
			filters.roles,
			filters.lobbies,
			filters.hero
		)
	]);

	const records: RecordSet[] = definitions.map((definition, index) => ({
		key: definition.key,
		title: definition.title,
		recordTitle: definition.recordTitle,
		category: definition.category,
		records: recordResults[index]
			.filter((entry) => entry.record !== null)
			.map(
				(entry): RecordEntry => ({
					record: entry.record ?? 0,
					data: entry.data
				})
			)
	}));

	return { records, playerMatchCount };
};
