import {
	getFeatures,
	getHeroStats,
	getAllPlayerStats,
	getPlayers,
	getTeamOfTheWeek
} from '$lib/server/db-functions';

function measurePromise(fn: () => Promise<any>): Promise<number> {
	let onPromiseDone = () => performance.now() - start;

	let start = performance.now();
	return fn().then(onPromiseDone, onPromiseDone);
}

function longPromise(delay: number) {
	return new Promise<string>((resolve) => {
		setTimeout(() => {
			resolve('Done');
		}, delay);
	});
}

export const load = async ({ url, params }) => {
	const heroStats = await getHeroStats();
	const playerStats = await getAllPlayerStats();
	const totw = await getTeamOfTheWeek();
	const features = await getFeatures();

	const timings = [
		{ name: 'getHeroStats', time: await measurePromise(() => getHeroStats()) },
		{ name: 'getAllPlayerStats', time: await measurePromise(() => getAllPlayerStats()) },
		{ name: 'getTeamOfTheWeek', time: await measurePromise(() => getTeamOfTheWeek()) },
		{ name: 'getFeatures', time: await measurePromise(() => getFeatures()) }
	];

	return { heroStats, playerStats, totw, features, timings };
};
