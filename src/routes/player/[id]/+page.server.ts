import {
	getAccounts,
	getHeroStats,
	getPlayer,
	getPlayerChart,
	getPlayerWinLoss,
	getPlayerImpactCountsByRole,
	getSmurfAccounts,
	getMatchesByDay,
	getPlayerAverageStats,
	getRoleCounts,
	getMatchDataFromIdAndPlayer,
	getPlayerWinLossByMinutes,
	getPlayerRecords,
	getPlayerTeammateStats,
	getPlayers,
	getRecentHeroPoolStats
} from '$lib/server/db-functions';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import dayjs from 'dayjs';
import { heroData } from '$lib/data/heroData';

const getSteamData = async (steamIds: number[]) => {
	const validSteamIds = steamIds.filter((id) => Number.isFinite(id) && id > 0);

	if (validSteamIds.length === 0) {
		return [];
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 2500);

	try {
		const steamData = await fetch(
			`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${env.STEAM_KEY}&steamids=${validSteamIds
				.map((id) => BigInt(id) + BigInt('76561197960265728'))
				.join(',')
				.toString()}`,
			{ signal: controller.signal }
		);

		if (steamData.ok === false) {
			return [];
		}

		const steamDataJson = await steamData.json();
		return steamDataJson.response.players;
	} catch {
		return [];
	} finally {
		clearTimeout(timeout);
	}
};

const withTimeout = async <T>(promise: Promise<T>, fallback: T, timeoutMs = 2500) => {
	let timeout: ReturnType<typeof setTimeout>;
	const timeoutPromise = new Promise<T>((resolve) => {
		timeout = setTimeout(() => resolve(fallback), timeoutMs);
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	} catch {
		return fallback;
	} finally {
		clearTimeout(timeout!);
	}
};

const emptyImpactCounts = () => {
	return Object.fromEntries(
		['S++', 'S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F+', 'F', 'F-'].map(
			(rating) => [
				rating,
				[1, 2, 3, 4, 5].map((role) => ({
					role,
					count: 0
				}))
			]
		)
	);
};

const DEFAULT_HERO_POOL_MATCH_LIMIT = 500;
const HERO_POOL_MATCH_LIMIT_OPTIONS = [100, 200, 500, 1000];

export const load = async ({ params, url }) => {
	const requestedLimit = Number(url.searchParams.get('pool') || DEFAULT_HERO_POOL_MATCH_LIMIT);
	const RECENT_HERO_POOL_MATCH_LIMIT = HERO_POOL_MATCH_LIMIT_OPTIONS.includes(requestedLimit)
		? requestedLimit
		: DEFAULT_HERO_POOL_MATCH_LIMIT;
	const playerId = Number(params.id);
	if (!Number.isFinite(playerId)) {
		throw error(404, 'Player not found');
	}

	const [player, accountIds] = await Promise.all([getPlayer(playerId), getAccounts(playerId)]);

	if (!player) {
		throw error(404, 'Player not found');
	}

	const allSteamData = await getSteamData(accountIds.map((account) => account?.accountId));
	const mainAccountId = accountIds.find((account) => account.smurf === false)?.accountId;
	const mainSteamId = mainAccountId
		? (BigInt(mainAccountId) + BigInt('76561197960265728')).toString()
		: null;
	const mainAccount =
		(await allSteamData.find(
			(account: any) => mainSteamId !== null && account.steamid === mainSteamId
		)) || null;
	let smurfAccounts = await allSteamData.filter(
		(account: any) => mainSteamId === null || account.steamid !== mainSteamId
	);

	if (smurfAccounts.length < 1) {
		smurfAccounts = await getSmurfAccounts(playerId);
	}

	const heroStats = withTimeout(
		getHeroStats(dayjs(0).add(1, 'month').valueOf() / 1000, playerId),
		[]
	);
	const allTimeHeroStats = withTimeout(
		getHeroStats(dayjs(0).add(99, 'years').valueOf() / 1000, playerId),
		[]
	);
	const recentHeroPoolStats = withTimeout(
		getRecentHeroPoolStats(playerId, RECENT_HERO_POOL_MATCH_LIMIT),
		[]
	);
	const [
		recentStats,
		allTimeStats,
		winGraph,
		impactCounts,
		averageStats,
		roleCounts,
		winLossByMinute,
		playerRecords,
		teammateStats,
		playerList,
		matchesByDay
	] = await Promise.all([
		withTimeout(getPlayerWinLoss(playerId, 31), {
			wins: 0,
			losses: 0,
			rankedWins: 0,
			rankedLosses: 0
		}),
		withTimeout(getPlayerWinLoss(playerId, 9999), {
			wins: 0,
			losses: 0,
			rankedWins: 0,
			rankedLosses: 0
		}),
		withTimeout(getPlayerChart(playerId, 31), { resultsArray: [], daysArray: [], matchCount: 0 }),
		withTimeout(getPlayerImpactCountsByRole(playerId), emptyImpactCounts()),
		withTimeout(getPlayerAverageStats(playerId, 31), {
			avgImpact: 0,
			avgKills: 0,
			avgDeaths: 0,
			avgAssists: 0,
			avgGpm: 0,
			avgXpm: 0,
			avgLastHits: 0
		}),
		withTimeout(getRoleCounts(playerId, 9999), []),
		withTimeout(getPlayerWinLossByMinutes(playerId, 9999), []),
		getPlayerRecords(playerId).catch(() => ({ matches: [] })),
		withTimeout(getPlayerTeammateStats(playerId), []),
		withTimeout(getPlayers(), []),
		withTimeout(getMatchesByDay(playerId, 12), [])
	]);

	const heroList = heroData.sort((a, b) => a.name.localeCompare(b.name));

	const featuredHero = heroStats.then((stats) => {
		const hero = stats.sort((a, b) => b.avgImpact * b.matches - a.avgImpact * a.matches)[0];
		if (!hero) {
			return null;
		}

		return {
			...hero,
			winRate: ((hero.direWins + hero.radiantWins) / hero.matches) * 100
		};
	}).catch(() => null);

	return {
		roleCounts,
		averageStats,
		heroList,
		playerList,
		player,
		mainAccount,
		smurfAccounts,
		allTimeStats,
		recentStats,
		heroStats,
		allTimeHeroStats,
		recentHeroPoolStats,
		recentHeroPoolMatchLimit: RECENT_HERO_POOL_MATCH_LIMIT,
		heroPoolMatchLimitOptions: HERO_POOL_MATCH_LIMIT_OPTIONS,
		winGraph,
		impactCounts,
		matchesByDay,
		featuredHero,
		playerRecords,
		teammateStats,
		winLossByMinute
	};
};
