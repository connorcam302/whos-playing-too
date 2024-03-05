import {
	getHighestImpact,
	getMostAssists,
	getMostDeaths,
	getMostKills
} from '$lib/server/db-functions';

interface Record {
	id: number;
	username: string;
	smurf: boolean;
	kills: number;
	matchId: number;
	hero: {
		id: number;
		name: string;
		img: string;
	};
}

interface Record {
	title: string;
	record: Record;
}

const createRecord = (title: string, recordTitle: string, records: any) => {
	return { title, recordTitle, records };
};

export const load = async ({ url, params }) => {
	const mostKills = createRecord('Most Kills', 'Kills', await getMostKills(10, true));
	const mostDeaths = createRecord('Most Deaths', 'Deaths', await getMostDeaths(10, true));
	const mostAssists = createRecord('Most Assists', 'Assists', await getMostAssists(10, true));
	const highestImpact = createRecord('Highest Impact', 'Impact', await getHighestImpact(10, true));

	return { records: [mostKills, mostDeaths, mostAssists, highestImpact] };
};
