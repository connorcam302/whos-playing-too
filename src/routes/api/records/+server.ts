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
import { json, type RequestHandler } from '@sveltejs/kit';

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

export const GET: RequestHandler = async ({ url, params }) => {
	console.log(url.pathname, 'requested.');

	const rolesFilter = JSON.parse(url.searchParams.get('roles')!);

	const lobbyFilter = JSON.parse(url.searchParams.get('lobby')!);

	const timeFilter = JSON.parse(url.searchParams.get('time')!);

	const heroFilter = JSON.parse(url.searchParams.get('hero')!);

	const smurfFilter = JSON.parse(url.searchParams.get('smurf')!);

	const mostKills = createRecord(
		'Most Kills',
		'Kills',
		await getMostKills(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);
	const mostDeaths = createRecord(
		'Most Deaths',
		'Deaths',
		await getMostDeaths(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);
	const mostAssists = createRecord(
		'Most Assists',
		'Assists',
		await getMostAssists(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);
	const highestImpact = createRecord(
		'Highest Impact',
		'Impact',
		await getHighestImpact(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);
	const lowestImpact = createRecord(
		'Lowest Impact',
		'Impact',
		await getLowestImpact(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);
	const mostLastHits = createRecord(
		'Most Last Hits',
		'Last Hits',
		await getMostLastHits(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);
	const highestGPM = createRecord(
		'Highest GPM',
		'GPM',
		await getMostGPM(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);
	const highestXPM = createRecord(
		'Highest XPM',
		'XPM',
		await getMostXPM(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);
	const mostHeroDamage = createRecord(
		'Most Hero Damage',
		'Hero Damage',
		await getMostHeroDamage(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);
	const leastHeroDamage = createRecord(
		'Least Hero Damage',
		'Hero Damage',
		await getLeastHeroDamage(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);
	const mostBuildingDamage = createRecord(
		'Most Building Damage',
		'Building Damage',
		await getMostBuildingDamage(10, smurfFilter, timeFilter, rolesFilter, lobbyFilter, heroFilter)
	);

	const recordsRaw = [
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
	];

	const records = recordsRaw.map((record) => {
		return {
			...record,
			length: 3
		};
	});

	return json(records);
};
