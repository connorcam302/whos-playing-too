import { DATE_RANGE_PRESETS, DOTA_MAJOR_PATCHES } from '$lib/data/dotaPatchRanges';

export type RecordCategory = 'highlights' | 'economy' | 'damage' | 'notorious';

export type RecordsFilters = {
	roles: number[];
	lobbies: number[];
	dateRange: string;
	hero: number;
	includeSmurfs: boolean;
};

export type RecordMatchData = {
	id: number;
	username: string;
	smurf: boolean;
	kills: number;
	deaths: number;
	assists: number;
	matchId: number;
	sequenceNumber: number | null;
	hero: DotaAsset;
	impact: number;
	role: number;
	duration: number;
	startTime: number;
};

export type RecordEntry = {
	record: number;
	data: RecordMatchData;
};

export type RecordSet = {
	key: string;
	title: string;
	recordTitle: string;
	category: RecordCategory;
	records: RecordEntry[];
};

export type RecordsResponse = {
	records: RecordSet[];
	playerMatchCount: number;
};

export const DEFAULT_RECORDS_FILTERS: RecordsFilters = {
	roles: [1, 2, 3, 4, 5],
	lobbies: [0, 7],
	dateRange: 'last-365-days',
	hero: -1,
	includeSmurfs: false
};

const parseNumberArray = (value: string | null, allowedValues: number[], fallback: number[]) => {
	if (!value) return fallback;

	try {
		const parsed = JSON.parse(value);
		if (!Array.isArray(parsed)) return fallback;

		const validValues = parsed
			.map(Number)
			.filter((item) => Number.isInteger(item) && allowedValues.includes(item));

		return validValues.length > 0 ? [...new Set(validValues)] : fallback;
	} catch {
		return fallback;
	}
};

const isValidDateRange = (value: string) =>
	DATE_RANGE_PRESETS.some((range) => range.value === value) ||
	DOTA_MAJOR_PATCHES.some((patch) => `patch-${patch.version}` === value);

export const parseRecordsSearchParams = (searchParams: URLSearchParams): RecordsFilters => {
	const dateRange = searchParams.get('dateRange') ?? DEFAULT_RECORDS_FILTERS.dateRange;
	const hero = Number(searchParams.get('hero') ?? DEFAULT_RECORDS_FILTERS.hero);

	return {
		roles: parseNumberArray(
			searchParams.get('roles'),
			[1, 2, 3, 4, 5],
			DEFAULT_RECORDS_FILTERS.roles
		),
		lobbies: parseNumberArray(searchParams.get('lobby'), [0, 7], DEFAULT_RECORDS_FILTERS.lobbies),
		dateRange: isValidDateRange(dateRange) ? dateRange : DEFAULT_RECORDS_FILTERS.dateRange,
		hero: Number.isInteger(hero) && hero >= -1 ? hero : DEFAULT_RECORDS_FILTERS.hero,
		includeSmurfs: searchParams.get('smurf') === 'true'
	};
};

export const buildRecordsSearchParams = (filters: RecordsFilters) =>
	new URLSearchParams({
		roles: JSON.stringify(filters.roles),
		lobby: JSON.stringify(filters.lobbies),
		dateRange: filters.dateRange,
		hero: filters.hero.toString(),
		smurf: filters.includeSmurfs.toString()
	});
