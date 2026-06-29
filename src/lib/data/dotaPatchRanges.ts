export type DateRangePreset = {
	value: string;
	label: string;
	amount?: number;
	unit?: 'day' | 'year';
};

export type DotaMajorPatch = {
	version: string;
	label: string;
	startDate: string;
};

export type DateRangeBounds = {
	start: number | null;
	end: number | null;
};

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
	{ value: 'last-7-days', label: '7 Days', amount: 7, unit: 'day' },
	{ value: 'last-30-days', label: '30 Days', amount: 30, unit: 'day' },
	{ value: 'last-90-days', label: '90 Days', amount: 90, unit: 'day' },
	{ value: 'last-180-days', label: '180 Days', amount: 180, unit: 'day' },
	{ value: 'last-365-days', label: '365 Days', amount: 365, unit: 'day' },
	{ value: 'last-2-years', label: '2 Years', amount: 2, unit: 'year' },
	{ value: 'last-3-years', label: '3 Years', amount: 3, unit: 'year' },
	{ value: 'last-4-years', label: '4 Years', amount: 4, unit: 'year' },
	{ value: 'last-5-years', label: '5 Years', amount: 5, unit: 'year' },
	{ value: 'all', label: 'All Time' }
];

export const DOTA_MAJOR_PATCHES: DotaMajorPatch[] = [
	{ version: '6.70', label: 'Patch 6.70', startDate: '2011-01-18' },
	{ version: '6.71', label: 'Patch 6.71', startDate: '2011-01-23' },
	{ version: '6.72', label: 'Patch 6.72', startDate: '2011-04-27' },
	{ version: '6.73', label: 'Patch 6.73', startDate: '2012-01-12' },
	{ version: '6.74', label: 'Patch 6.74', startDate: '2012-03-15' },
	{ version: '6.75', label: 'Patch 6.75', startDate: '2012-10-04' },
	{ version: '6.76', label: 'Patch 6.76', startDate: '2012-10-25' },
	{ version: '6.77', label: 'Patch 6.77', startDate: '2012-12-19' },
	{ version: '6.78', label: 'Patch 6.78', startDate: '2013-06-04' },
	{ version: '6.79', label: 'Patch 6.79', startDate: '2013-10-21' },
	{ version: '6.80', label: 'Patch 6.80', startDate: '2014-01-29' },
	{ version: '6.81', label: 'Patch 6.81', startDate: '2014-04-29' },
	{ version: '6.82', label: 'Patch 6.82', startDate: '2014-09-25' },
	{ version: '6.83', label: 'Patch 6.83', startDate: '2014-12-17' },
	{ version: '6.84', label: 'Patch 6.84', startDate: '2015-04-30' },
	{ version: '6.85', label: 'Patch 6.85', startDate: '2015-09-24' },
	{ version: '6.86', label: 'Patch 6.86', startDate: '2015-12-16' },
	{ version: '6.87', label: 'Patch 6.87', startDate: '2016-04-25' },
	{ version: '6.88', label: 'Patch 6.88', startDate: '2016-06-12' },
	{ version: '7.00', label: 'Patch 7.00', startDate: '2016-12-12' },
	{ version: '7.01', label: 'Patch 7.01', startDate: '2016-12-20' },
	{ version: '7.02', label: 'Patch 7.02', startDate: '2017-02-08' },
	{ version: '7.03', label: 'Patch 7.03', startDate: '2017-03-15' },
	{ version: '7.04', label: 'Patch 7.04', startDate: '2017-03-23' },
	{ version: '7.05', label: 'Patch 7.05', startDate: '2017-04-09' },
	{ version: '7.06', label: 'Patch 7.06', startDate: '2017-05-15' },
	{ version: '7.07', label: 'Patch 7.07', startDate: '2017-10-31' },
	{ version: '7.08', label: 'Patch 7.08', startDate: '2018-02-01' },
	{ version: '7.09', label: 'Patch 7.09', startDate: '2018-02-15' },
	{ version: '7.10', label: 'Patch 7.10', startDate: '2018-03-01' },
	{ version: '7.11', label: 'Patch 7.11', startDate: '2018-03-15' },
	{ version: '7.12', label: 'Patch 7.12', startDate: '2018-03-29' },
	{ version: '7.13', label: 'Patch 7.13', startDate: '2018-04-12' },
	{ version: '7.14', label: 'Patch 7.14', startDate: '2018-04-26' },
	{ version: '7.15', label: 'Patch 7.15', startDate: '2018-05-10' },
	{ version: '7.16', label: 'Patch 7.16', startDate: '2018-05-27' },
	{ version: '7.17', label: 'Patch 7.17', startDate: '2018-06-10' },
	{ version: '7.18', label: 'Patch 7.18', startDate: '2018-06-25' },
	{ version: '7.19', label: 'Patch 7.19', startDate: '2018-07-29' },
	{ version: '7.20', label: 'Patch 7.20', startDate: '2018-11-19' },
	{ version: '7.21', label: 'Patch 7.21', startDate: '2019-01-29' },
	{ version: '7.22', label: 'Patch 7.22', startDate: '2019-05-24' },
	{ version: '7.23', label: 'Patch 7.23', startDate: '2019-11-26' },
	{ version: '7.24', label: 'Patch 7.24', startDate: '2020-01-26' },
	{ version: '7.25', label: 'Patch 7.25', startDate: '2020-03-17' },
	{ version: '7.26', label: 'Patch 7.26', startDate: '2020-04-17' },
	{ version: '7.27', label: 'Patch 7.27', startDate: '2020-06-28' },
	{ version: '7.28', label: 'Patch 7.28', startDate: '2020-12-17' },
	{ version: '7.29', label: 'Patch 7.29', startDate: '2021-04-09' },
	{ version: '7.30', label: 'Patch 7.30', startDate: '2021-08-18' },
	{ version: '7.31', label: 'Patch 7.31', startDate: '2022-02-23' },
	{ version: '7.32', label: 'Patch 7.32', startDate: '2022-08-24' },
	{ version: '7.33', label: 'Patch 7.33', startDate: '2023-04-20' },
	{ version: '7.34', label: 'Patch 7.34', startDate: '2023-08-08' },
	{ version: '7.35', label: 'Patch 7.35', startDate: '2023-12-14' },
	{ version: '7.36', label: 'Patch 7.36', startDate: '2024-05-22' },
	{ version: '7.37', label: 'Patch 7.37', startDate: '2024-07-31' },
	{ version: '7.38', label: 'Patch 7.38', startDate: '2025-02-19' },
	{ version: '7.39', label: 'Patch 7.39', startDate: '2025-05-21' },
	{ version: '7.40', label: 'Patch 7.40', startDate: '2025-12-15' },
	{ version: '7.41', label: 'Patch 7.41', startDate: '2026-03-24' }
];

export const getPatchStartTimestamp = (patch: DotaMajorPatch) => {
	return Math.floor(Date.parse(`${patch.startDate}T00:00:00Z`) / 1000);
};

export const getDotaPatchForTimestamp = (timestamp: number) => {
	let currentPatch: DotaMajorPatch | null = null;

	for (const patch of DOTA_MAJOR_PATCHES) {
		if (timestamp >= getPatchStartTimestamp(patch)) {
			currentPatch = patch;
		} else {
			break;
		}
	}

	return currentPatch;
};

export const getDotaPatchRangeBounds = (version: string): DateRangeBounds => {
	const patchIndex = DOTA_MAJOR_PATCHES.findIndex((patch) => patch.version === version);
	const patch = DOTA_MAJOR_PATCHES[patchIndex];
	const nextPatch = DOTA_MAJOR_PATCHES[patchIndex + 1];

	if (!patch) {
		return {
			start: null,
			end: null
		};
	}

	return {
		start: getPatchStartTimestamp(patch),
		end: nextPatch ? getPatchStartTimestamp(nextPatch) - 1 : null
	};
};
