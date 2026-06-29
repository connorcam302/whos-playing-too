import { getPlayerStats } from '$lib/server/db-functions';
import {
	DATE_RANGE_PRESETS,
	getDotaPatchRangeBounds,
	type DateRangeBounds
} from '$lib/data/dotaPatchRanges';
import { json, type RequestHandler } from '@sveltejs/kit';
import dayjs from 'dayjs';

const getDateFilter = (dateRange: string | null, fallbackTime: number): number | DateRangeBounds => {
	if (!dateRange) return fallbackTime;

	if (dateRange.startsWith('patch-')) {
		return getDotaPatchRangeBounds(dateRange.replace('patch-', ''));
	}

	const preset = DATE_RANGE_PRESETS.find((range) => range.value === dateRange);
	if (!preset) return fallbackTime;
	if (preset.value === 'all') return { start: null, end: null };

	return {
		start: dayjs().subtract(preset.amount ?? fallbackTime, preset.unit ?? 'day').unix(),
		end: null
	};
};

export const GET: RequestHandler = async ({ url, params }) => {
	console.log(url.pathname, 'requested.');

	const rolesFilter = JSON.parse(url.searchParams.get('roles')!);

	const lobbyFilter = JSON.parse(url.searchParams.get('lobby')!);

	const timeFilter = JSON.parse(url.searchParams.get('time')!);
	const dateFilter = getDateFilter(url.searchParams.get('dateRange'), timeFilter);

	const heroFilter = JSON.parse(url.searchParams.get('hero')!);

	const smurfFilter = JSON.parse(url.searchParams.get('smurf')!);

	const userData = await getPlayerStats(
		Number(params.id),
		dateFilter,
		rolesFilter,
		lobbyFilter,
		heroFilter,
		smurfFilter
	);

	return json(userData);
};
