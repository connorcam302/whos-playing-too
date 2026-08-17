import { parseRecordsSearchParams } from '$lib/records';
import { db } from '$lib/server/database';
import { getRecordSets } from '$lib/server/records';
import { heroes } from '$lib/server/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const filters = parseRecordsSearchParams(url.searchParams);
	const [recordsResponse, heroList] = await Promise.all([
		getRecordSets(filters),
		db
			.select({
				id: heroes.id,
				name: heroes.name,
				img: heroes.img
			})
			.from(heroes)
	]);

	heroList.sort((a, b) => a.name.localeCompare(b.name));

	return { ...recordsResponse, filters, heroList };
};
