import { json, type RequestHandler } from '@sveltejs/kit';
import { getStratzMatchSection, toMatchPageError } from '$lib/server/stratz';
import type { MatchSectionName } from '$lib/match-page';

const sectionNames: MatchSectionName[] = ['timeline', 'economy', 'combat'];

const isMatchSection = (value: string | undefined): value is MatchSectionName => {
	return Boolean(value && sectionNames.includes(value as MatchSectionName));
};

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const matchId = Number(params.id);
	if (!Number.isSafeInteger(matchId) || matchId <= 0) {
		return json(
			{
				error: {
					status: 400,
					title: 'Invalid match ID',
					message: 'Use a numeric Dota match ID to load match analysis.',
					canRetry: false
				}
			},
			{ status: 400 }
		);
	}

	if (!isMatchSection(params.section)) {
		return json(
			{
				error: {
					status: 404,
					title: 'Analysis section not found',
					message: 'This match analysis section does not exist.',
					canRetry: false
				}
			},
			{ status: 404 }
		);
	}

	try {
		const data = await getStratzMatchSection(matchId, params.section);
		setHeaders({ 'cache-control': 'public, max-age=300' });
		return json({ data, error: null });
	} catch (error) {
		const pageError = toMatchPageError(error);
		return json({ data: null, error: pageError }, { status: pageError.status });
	}
};
