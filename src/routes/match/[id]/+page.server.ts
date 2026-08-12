import { getStratzMatchOverview, toMatchPageError } from '$lib/server/stratz';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const matchId = Number(params.id);
	if (!Number.isSafeInteger(matchId) || matchId <= 0) {
		return {
			match: null,
			error: {
				status: 400,
				title: 'Invalid match ID',
				message: 'Use a numeric Dota match ID to open match analysis.',
				canRetry: false
			}
		};
	}

	try {
		const match = await getStratzMatchOverview(matchId);
		setHeaders({
			'cache-control': match.status === 'ready' ? 'public, max-age=300' : 'public, max-age=30'
		});
		return { match, error: null };
	} catch (error) {
		return { match: null, error: toMatchPageError(error) };
	}
};
