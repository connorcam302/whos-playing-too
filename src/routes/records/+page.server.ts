import {
	getHighestImpact,
	getLeastHeroDamage,
	getLowestImpact,
	getMostAssists,
	getMostDeaths,
	getMostHeroDamage,
	getMostKills,
	getMostLastHits,
	getMostBuildingDamage,
	getMostGPM,
	getMostXPM
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
	const mostKills = createRecord('Most Kills', 'Kills', await getMostKills());
	const mostDeaths = createRecord('Most Deaths', 'Deaths', await getMostDeaths());
	const mostAssists = createRecord('Most Assists', 'Assists', await getMostAssists());
	const highestImpact = createRecord('Highest Impact', 'Impact', await getHighestImpact());
	const lowestImpact = createRecord('Lowest Impact', 'Impact', await getLowestImpact());
	const mostLastHits = createRecord('Most Last Hits', 'Last Hits', await getMostLastHits());
	const highestGPM = createRecord('Highest GPM', 'GPM', await getMostGPM());
	const highestXPM = createRecord('Highest XPM', 'XPM', await getMostXPM());
	const mostHeroDamage = createRecord('Most Hero Damage', 'Hero Damage', await getMostHeroDamage());
	const leastHeroDamage = createRecord(
		'Least Hero Damage',
		'Hero Damage',
		await getLeastHeroDamage()
	);
	const mostBuildingDamage = createRecord(
		'Most Building Damage',
		'Building Damage',
		await getMostBuildingDamage()
	);

	return {
		records: [
			mostKills,
			mostDeaths,
			mostAssists,
			highestImpact,
			lowestImpact,
			mostLastHits,
			highestGPM,
			highestXPM,
			mostHeroDamage,
			leastHeroDamage,
			mostBuildingDamage
		]
	};
};
