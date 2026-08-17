import { parseRecordsSearchParams } from '$lib/records';
import { getRecordSets } from '$lib/server/records';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const filters = parseRecordsSearchParams(url.searchParams);
		return json(await getRecordSets(filters));
	} catch (error) {
		console.error('Failed to load records', error);
		return json({ message: 'Records could not be loaded. Please try again.' }, { status: 500 });
	}
};
