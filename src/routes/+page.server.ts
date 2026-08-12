import {
	getHeroStats,
	getAllPlayerStats,
	getTeamOfTheWeek,
	getFlopOfTheWeek
} from '$lib/server/db-functions';
import { getWeeklyDigest } from '$lib/server/weeklyDigest';

export const load = async () => {
	const heroStats = getHeroStats();
	const playerStats = getAllPlayerStats();
	const digest = getWeeklyDigest();
	const [totw, fotw] = await Promise.all([getTeamOfTheWeek(), getFlopOfTheWeek()]);

	return {
		heroStats,
		playerStats,
		totw,
		fotw,
		digest
	};
};
