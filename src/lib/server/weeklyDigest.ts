import dayjs from 'dayjs';
import { and, desc, eq, gt, gte, inArray, lt, not, sql } from 'drizzle-orm';
import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';
import { getHeroPlayerRankings, type HeroStatsRow } from '$lib/server/heroStats';
import {
	rankWeeklyDigestItems,
	type WeeklyDigest,
	type WeeklyDigestItem,
	type WeeklyDigestTone
} from '$lib/weeklyDigest';

type DigestRow = HeroStatsRow & {
	playerImage: string;
	matchId: number;
	heroId: number;
	heroName: string;
	heroImg: string;
};

type RecordDefinition = {
	key: string;
	badge: string;
	label: string;
	title: (row: DigestRow) => string;
	tone: WeeklyDigestTone;
	direction: 'high' | 'low';
	scale: number;
	basePriority: number;
	getValue: (row: DigestRow) => number;
	isValid?: (value: number) => boolean;
};

type PlayerPeriod = {
	id: number;
	username: string;
	image: string;
	matches: number;
	wins: number;
};

const weekSeconds = 7 * 24 * 60 * 60;
const cacheDuration = 5 * 60 * 1000;
let digestCache: { expiresAt: number; value: WeeklyDigest } | undefined;
let digestRequest: Promise<WeeklyDigest> | undefined;

const visiblePlayerFilter = () =>
	hiddenFromAggregatePlayerIds.length > 0
		? not(inArray(players.id, hiddenFromAggregatePlayerIds))
		: sql`true`;

const selectDigestRows = () =>
	db
		.select({
			playerId: players.id,
			username: players.username,
			playerImage: accounts.image,
			smurf: accounts.smurf,
			matchId: matches.id,
			startTime: matches.startTime,
			duration: matches.duration,
			winner: matches.winner,
			team: matchData.team,
			role: matchData.role,
			heroId: heroes.id,
			heroName: heroes.name,
			heroImg: heroes.img,
			kills: matchData.kills,
			deaths: matchData.deaths,
			assists: matchData.assists,
			impact: matchData.impact,
			gpm: matchData.goldPerMin,
			xpm: matchData.xpPerMin,
			lastHits: matchData.lastHits,
			heroDamage: matchData.heroDamage,
			towerDamage: matchData.towerDamage
		})
		.from(matchData)
		.innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
		.innerJoin(players, eq(players.id, accounts.owner))
		.innerJoin(matches, eq(matches.id, matchData.matchId))
		.innerJoin(heroes, eq(heroes.id, matchData.heroId));

const loadRecentRows = async (previousStart: number, end: number): Promise<DigestRow[]> =>
	await selectDigestRows()
		.where(
			and(
				gte(matches.startTime, previousStart),
				lt(matches.startTime, end),
				gt(matches.duration, 900),
				eq(accounts.smurf, false),
				visiblePlayerFilter()
			)
		)
		.orderBy(desc(matches.startTime));

const loadHeroHistoryRows = async (): Promise<DigestRow[]> =>
	await selectDigestRows()
		.where(and(gt(matches.duration, 900), visiblePlayerFilter()))
		.orderBy(desc(matches.startTime));

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const formatNumber = (value: number, decimals = 0) =>
	new Intl.NumberFormat('en-GB', {
		maximumFractionDigits: decimals,
		minimumFractionDigits: decimals
	}).format(value);

const formatPeriod = (start: number, end: number) => {
	const startDate = dayjs.unix(start);
	const endDate = dayjs.unix(end);
	return startDate.month() === endDate.month()
		? `${startDate.format('D')}–${endDate.format('D MMM')}`
		: `${startDate.format('D MMM')}–${endDate.format('D MMM')}`;
};

const getWinRate = (period: PlayerPeriod) =>
	period.matches > 0 ? (period.wins / period.matches) * 100 : 0;

const aggregatePlayers = (rows: DigestRow[]) => {
	const periods = new Map<number, PlayerPeriod>();

	for (const row of rows) {
		const period = periods.get(row.playerId) ?? {
			id: row.playerId,
			username: row.username,
			image: row.playerImage,
			matches: 0,
			wins: 0
		};
		period.matches += 1;
		period.wins += row.team === row.winner ? 1 : 0;
		periods.set(row.playerId, period);
	}

	return periods;
};

const recordDefinitions: RecordDefinition[] = [
	{
		key: 'impact-high',
		badge: 'Record',
		label: 'impact',
		title: (row) => `${row.username}: top impact`,
		tone: 'positive',
		direction: 'high',
		scale: 25,
		basePriority: 70,
		getValue: (row) => row.impact
	},
	{
		key: 'kills',
		badge: 'Record',
		label: 'kills',
		title: (row) => `${row.username}: most kills`,
		tone: 'positive',
		direction: 'high',
		scale: 5,
		basePriority: 65,
		getValue: (row) => row.kills
	},
	{
		key: 'assists',
		badge: 'Record',
		label: 'assists',
		title: (row) => `${row.username}: most assists`,
		tone: 'positive',
		direction: 'high',
		scale: 10,
		basePriority: 61,
		getValue: (row) => row.assists
	},
	{
		key: 'gpm',
		badge: 'Record',
		label: 'GPM',
		title: (row) => `${row.username}: top GPM`,
		tone: 'positive',
		direction: 'high',
		scale: 100,
		basePriority: 59,
		getValue: (row) => Number(row.gpm ?? 0),
		isValid: (value) => value > 0
	},
	{
		key: 'hero-damage',
		badge: 'Record',
		label: 'hero damage',
		title: (row) => `${row.username}: most hero damage`,
		tone: 'positive',
		direction: 'high',
		scale: 10000,
		basePriority: 58,
		getValue: (row) => Number(row.heroDamage ?? 0),
		isValid: (value) => value > 0
	},
	{
		key: 'deaths',
		badge: 'Most deaths',
		label: 'deaths',
		title: (row) => `${row.username}: most deaths`,
		tone: 'negative',
		direction: 'high',
		scale: 5,
		basePriority: 53,
		getValue: (row) => row.deaths
	},
	{
		key: 'impact-low',
		badge: 'Low impact',
		label: 'impact',
		title: (row) => `${row.username}: lowest impact`,
		tone: 'negative',
		direction: 'low',
		scale: 15,
		basePriority: 51,
		getValue: (row) => row.impact
	}
];

const getExtremeRow = (rows: DigestRow[], definition: RecordDefinition) =>
	rows
		.filter((row) => definition.isValid?.(definition.getValue(row)) ?? true)
		.slice()
		.sort((a, b) => {
			const difference = definition.getValue(b) - definition.getValue(a);
			return definition.direction === 'high' ? difference : -difference;
		})[0];

const makeRecordItems = (currentRows: DigestRow[], previousRows: DigestRow[]) =>
	recordDefinitions.flatMap((definition): WeeklyDigestItem[] => {
		const current = getExtremeRow(currentRows, definition);
		if (!current) return [];
		const previous = getExtremeRow(previousRows, definition);
		const currentValue = definition.getValue(current);
		const previousValue = previous ? definition.getValue(previous) : null;
		const comparisonUnit = definition.key.startsWith('impact') ? 'impact points' : definition.label;
		const improvement =
			previousValue === null
				? 0
				: definition.direction === 'high'
					? currentValue - previousValue
					: previousValue - currentValue;
		const comparison =
			previousValue === null
				? `The strongest ${definition.label} mark in the current seven-day window.`
				: improvement > 0
					? `${formatNumber(Math.abs(improvement))} ${comparisonUnit} ${definition.direction === 'high' ? 'above' : 'below'} the previous week's mark.`
					: `The leading ${definition.label} mark from this week's matches.`;

		return [
			{
				id: `record-${definition.key}-${current.matchId}`,
				category: 'record',
				tone: definition.tone,
				badge: definition.badge,
				title: definition.title(current),
				summary: `${formatNumber(currentValue)} ${definition.label} on ${current.heroName}. ${comparison}`,
				href: `/match/${current.matchId}`,
				image: current.heroImg,
				imageAlt: current.heroName,
				primaryMetric: { label: definition.label, value: formatNumber(currentValue) },
				secondaryMetric:
					previousValue === null
						? undefined
						: { label: 'Previous week', value: formatNumber(previousValue) },
				sampleSize: 1,
				occurredAt: current.startTime,
				priority:
					definition.basePriority + clamp(Math.max(0, improvement) / definition.scale, 0, 1) * 20,
				evidenceKey: `match:${current.matchId}`,
				entityKey: `player:${current.playerId}`
			}
		];
	});

const makeFormItems = (currentRows: DigestRow[], previousRows: DigestRow[]) => {
	const currentPlayers = aggregatePlayers(currentRows);
	const previousPlayers = aggregatePlayers(previousRows);

	return Array.from(currentPlayers.values()).flatMap((current): WeeklyDigestItem[] => {
		const previous = previousPlayers.get(current.id);
		if (!previous || current.matches < 5 || previous.matches < 5) return [];
		const currentWinRate = getWinRate(current);
		const previousWinRate = getWinRate(previous);
		const delta = currentWinRate - previousWinRate;
		if (Math.abs(delta) < 7) return [];
		const improved = delta > 0;

		return [
			{
				id: `form-${current.id}`,
				category: 'form',
				tone: improved ? 'positive' : 'negative',
				badge: 'Form',
				title: `${current.username}: win rate ${improved ? 'up' : 'down'}`,
				summary: `${formatNumber(currentWinRate, 1)}% win rate across ${current.matches} matches, ${improved ? 'up' : 'down'} ${formatNumber(Math.abs(delta), 1)} points week over week.`,
				href: `/player/${current.id}?tab=matches`,
				image: current.image,
				imageAlt: current.username,
				primaryMetric: { label: 'Win rate', value: `${formatNumber(currentWinRate, 1)}%` },
				secondaryMetric: {
					label: 'Win rate change',
					value: `${improved ? '+' : '−'}${formatNumber(Math.abs(delta), 1)}%`
				},
				sampleSize: current.matches,
				lowSample: current.matches < 8 || previous.matches < 8,
				occurredAt: currentRows.find((row) => row.playerId === current.id)?.startTime ?? 0,
				priority:
					58 + clamp(Math.abs(delta) / 25, 0, 1) * 24 + clamp(current.matches / 20, 0, 1) * 6,
				evidenceKey: `form:${current.id}`,
				entityKey: `player:${current.id}`
			}
		];
	});
};

const makeStreakItems = (currentRows: DigestRow[]) => {
	const rowsByPlayer = currentRows.reduce((map, row) => {
		const rows = map.get(row.playerId) ?? [];
		rows.push(row);
		map.set(row.playerId, rows);
		return map;
	}, new Map<number, DigestRow[]>());

	return Array.from(rowsByPlayer.values()).flatMap((rows): WeeklyDigestItem[] => {
		const ordered = rows.slice().sort((a, b) => a.startTime - b.startTime);
		let bestLength = 0;
		let bestWon = false;
		let runLength = 0;
		let runWon: boolean | null = null;

		for (const row of ordered) {
			const won = row.team === row.winner;
			if (won === runWon) runLength += 1;
			else {
				runWon = won;
				runLength = 1;
			}
			if (runLength > bestLength) {
				bestLength = runLength;
				bestWon = won;
			}
		}

		if (bestLength < 4) return [];
		const player = ordered[ordered.length - 1];
		return [
			{
				id: `streak-${player.playerId}-${bestWon ? 'wins' : 'losses'}`,
				category: 'streak',
				tone: bestWon ? 'positive' : 'negative',
				badge: bestWon ? 'Win streak' : 'Losing streak',
				title: `${player.username} ${bestWon ? 'won' : 'lost'} ${bestLength} straight`,
				summary: `The longest ${bestWon ? 'winning' : 'losing'} run recorded during the current seven-day window.`,
				href: `/player/${player.playerId}?tab=matches`,
				image: player.playerImage,
				imageAlt: player.username,
				primaryMetric: { label: 'Streak', value: `${bestLength} games` },
				secondaryMetric: { label: 'Weekly matches', value: formatNumber(rows.length) },
				sampleSize: rows.length,
				occurredAt: player.startTime,
				priority: 60 + clamp(bestLength / 8, 0, 1) * 24,
				evidenceKey: `streak:${player.playerId}:${bestWon}`,
				entityKey: `player:${player.playerId}`
			}
		];
	});
};

const makeMatchItems = (currentRows: DigestRow[]) => {
	const sides = currentRows.reduce((map, row) => {
		const key = `${row.matchId}:${row.team}`;
		const side = map.get(key) ?? [];
		side.push(row);
		map.set(key, side);
		return map;
	}, new Map<string, DigestRow[]>());
	const bestSide = Array.from(sides.values())
		.filter((side) => side.length >= 2 && side[0].team === side[0].winner)
		.map((side) => ({
			side,
			averageImpact: side.reduce((total, row) => total + row.impact, 0) / side.length
		}))
		.sort((a, b) => b.averageImpact - a.averageImpact || b.side.length - a.side.length)[0];

	if (!bestSide) return [];
	const representative = bestSide.side.slice().sort((a, b) => b.impact - a.impact)[0];
	const names = bestSide.side.map((row) => row.username);
	const stackName =
		names.length > 2 ? `${names[0]}, ${names[1]} +${names.length - 2}` : names.join(' + ');

	return [
		{
			id: `match-stack-${representative.matchId}`,
			category: 'match' as const,
			tone: 'positive' as const,
			badge: 'Top stack',
			title: `${stackName}: top stack`,
			summary: `${bestSide.side.length} tracked players averaged ${formatNumber(bestSide.averageImpact)} impact in a ${formatNumber(representative.duration / 60)}-minute win.`,
			href: `/match/${representative.matchId}`,
			image: representative.heroImg,
			imageAlt: representative.heroName,
			primaryMetric: { label: 'Average impact', value: formatNumber(bestSide.averageImpact) },
			secondaryMetric: { label: 'Tracked players', value: formatNumber(bestSide.side.length) },
			sampleSize: bestSide.side.length,
			occurredAt: representative.startTime,
			priority: 60 + clamp(bestSide.averageImpact / 150, 0, 1) * 18 + bestSide.side.length * 2,
			evidenceKey: `match:${representative.matchId}`,
			entityKey: `match:${representative.matchId}`
		}
	];
};

const makeHeroItems = (historyRows: DigestRow[], periodStart: number) => {
	const rowsByHero = historyRows.reduce((map, row) => {
		const rows = map.get(row.heroId) ?? [];
		rows.push(row);
		map.set(row.heroId, rows);
		return map;
	}, new Map<number, DigestRow[]>());
	const items: WeeklyDigestItem[] = [];

	for (const [heroId, rows] of rowsByHero) {
		const recentRows = rows.filter((row) => row.startTime >= periodStart);
		if (recentRows.length === 0) continue;
		const currentRankings = getHeroPlayerRankings(rows);
		const previousRankings = getHeroPlayerRankings(
			rows.filter((row) => row.startTime < periodStart)
		);
		if (currentRankings.length === 0) continue;
		const hero = rows[0];
		const currentOwner = currentRankings[0];
		const previousOwner = previousRankings[0] ?? null;

		if (currentOwner.playerId !== previousOwner?.playerId) {
			items.push({
				id: `ownership-best-${heroId}-${currentOwner.playerId}`,
				category: 'ownership',
				tone: 'positive',
				badge: previousOwner ? 'New owner' : 'Newly claimed',
				title: `${currentOwner.username} claimed ${hero.heroName}`,
				summary: previousOwner
					? `${currentOwner.username} moved ahead of ${previousOwner.username} with a ${formatNumber(currentOwner.score)} hero score.`
					: `${currentOwner.username} is the first calibrated owner with ${currentOwner.matches} recorded matches.`,
				href: `/heroes/${heroId}`,
				image: hero.heroImg,
				imageAlt: hero.heroName,
				primaryMetric: { label: 'Hero score', value: formatNumber(currentOwner.score) },
				secondaryMetric: { label: 'Win rate', value: `${formatNumber(currentOwner.winRate, 1)}%` },
				sampleSize: currentOwner.matches,
				lowSample: currentOwner.matches < 15,
				occurredAt:
					recentRows.find((row) => row.playerId === currentOwner.playerId)?.startTime ??
					recentRows[0].startTime,
				priority: previousOwner ? 78 : 66,
				evidenceKey: `hero:${heroId}:player:${currentOwner.playerId}`,
				entityKey: `player:${currentOwner.playerId}`
			});
		}

		if (currentRankings.length > 1 && previousRankings.length > 1) {
			const currentWorst = currentRankings[currentRankings.length - 1];
			const previousWorst = previousRankings[previousRankings.length - 1];
			if (currentWorst.playerId !== previousWorst.playerId) {
				items.push({
					id: `ownership-worst-${heroId}-${currentWorst.playerId}`,
					category: 'ownership',
					tone: 'negative',
					badge: 'Hero score',
					title: `${currentWorst.username}: lowest ${hero.heroName} score`,
					summary: `${formatNumber(currentWorst.score)} hero score across ${currentWorst.matches} matches, replacing ${previousWorst.username} at the bottom of the calibrated table.`,
					href: `/heroes/${heroId}`,
					image: hero.heroImg,
					imageAlt: hero.heroName,
					primaryMetric: { label: 'Hero score', value: formatNumber(currentWorst.score) },
					secondaryMetric: {
						label: 'Win rate',
						value: `${formatNumber(currentWorst.winRate, 1)}%`
					},
					sampleSize: currentWorst.matches,
					lowSample: currentWorst.matches < 15,
					occurredAt:
						recentRows.find((row) => row.playerId === currentWorst.playerId)?.startTime ??
						recentRows[0].startTime,
					priority: 65,
					evidenceKey: `hero:${heroId}:player:${currentWorst.playerId}`,
					entityKey: `player:${currentWorst.playerId}`
				});
			}
		}

		const previousByPlayer = new Map(
			previousRankings.map((ranking) => [ranking.playerId, ranking])
		);
		const recentPlayerIds = new Set(recentRows.map((row) => row.playerId));
		for (const ranking of currentRankings) {
			const previous = previousByPlayer.get(ranking.playerId);
			if (!previous || !recentPlayerIds.has(ranking.playerId)) continue;
			const delta = ranking.score - previous.score;
			if (Math.abs(delta) < 8) continue;
			const improved = delta > 0;
			const rank = currentRankings.findIndex((entry) => entry.playerId === ranking.playerId) + 1;
			items.push({
				id: `hero-score-${heroId}-${ranking.playerId}`,
				category: 'hero-score',
				tone: improved ? 'positive' : 'negative',
				badge: 'Hero score',
				title: `${ranking.username}: ${hero.heroName} score ${improved ? 'up' : 'down'}`,
				summary: `Now ranked #${rank} with a ${formatNumber(ranking.score)} score across ${ranking.matches} matches.`,
				href: `/heroes/${heroId}`,
				image: hero.heroImg,
				imageAlt: hero.heroName,
				primaryMetric: { label: 'Hero score', value: formatNumber(ranking.score) },
				secondaryMetric: {
					label: 'Score change',
					value: `${improved ? '+' : '−'}${formatNumber(Math.abs(delta))}`
				},
				sampleSize: ranking.matches,
				lowSample: ranking.matches < 15,
				occurredAt:
					recentRows.find((row) => row.playerId === ranking.playerId)?.startTime ??
					recentRows[0].startTime,
				priority: 57 + clamp(Math.abs(delta) / 30, 0, 1) * 25,
				evidenceKey: `hero:${heroId}:player:${ranking.playerId}`,
				entityKey: `player:${ranking.playerId}`
			});
		}
	}

	return items;
};

const buildWeeklyDigest = async (): Promise<WeeklyDigest> => {
	const updatedAt = Math.floor(Date.now() / 1000);
	const periodEnd = updatedAt;
	const periodStart = periodEnd - weekSeconds;
	const previousStart = periodStart - weekSeconds;
	const [recentResult, historyResult] = await Promise.allSettled([
		loadRecentRows(previousStart, periodEnd),
		loadHeroHistoryRows()
	]);
	const sourceErrors: string[] = [];
	const candidates: WeeklyDigestItem[] = [];
	let matchCount = 0;

	if (recentResult.status === 'fulfilled') {
		const currentRows = recentResult.value.filter((row) => row.startTime >= periodStart);
		const previousRows = recentResult.value.filter((row) => row.startTime < periodStart);
		matchCount = new Set(currentRows.map((row) => row.matchId)).size;
		candidates.push(
			...makeRecordItems(currentRows, previousRows),
			...makeFormItems(currentRows, previousRows),
			...makeStreakItems(currentRows),
			...makeMatchItems(currentRows)
		);
	} else {
		sourceErrors.push('Match and player changes could not be loaded.');
	}

	if (historyResult.status === 'fulfilled') {
		candidates.push(...makeHeroItems(historyResult.value, periodStart));
	} else {
		sourceErrors.push('Hero score and ownership changes could not be loaded.');
	}

	const items = rankWeeklyDigestItems(candidates);
	const bothSourcesFailed =
		recentResult.status === 'rejected' && historyResult.status === 'rejected';

	return {
		status: bothSourcesFailed
			? 'error'
			: sourceErrors.length > 0
				? 'partial'
				: items.length > 0
					? 'ready'
					: 'empty',
		items,
		period: {
			start: periodStart,
			end: periodEnd,
			label: formatPeriod(periodStart, periodEnd),
			comparisonLabel: `${formatPeriod(previousStart, periodStart)} comparison`
		},
		matchCount,
		updatedAt,
		sourceErrors
	};
};

export const getWeeklyDigest = async () => {
	if (digestCache && digestCache.expiresAt > Date.now()) return digestCache.value;
	if (digestRequest) return digestRequest;

	digestRequest = buildWeeklyDigest()
		.then((value) => {
			digestCache = { expiresAt: Date.now() + cacheDuration, value };
			return value;
		})
		.finally(() => {
			digestRequest = undefined;
		});

	return digestRequest;
};
