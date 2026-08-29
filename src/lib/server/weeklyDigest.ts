import dayjs from 'dayjs';
import { and, desc, eq, gt, gte, inArray, lt, not, sql } from 'drizzle-orm';
import { db } from '$lib/server/database';
import { accounts, heroes, matchData, matches, players } from '$lib/server/schema';
import { hiddenFromAggregatePlayerIds } from '$lib/server/visibility-config';
import {
	getHeroPlayerRankings,
	getHeroScoreGroupRankings,
	type HeroStatsRow
} from '$lib/server/heroStats';
import { getHeroScoreGroup, getHeroScoreGroupName } from '$lib/heroScores';
import { getRoleIcon, getRoleName } from '$lib/functions';
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

const weekSeconds = 7 * 24 * 60 * 60;
const roleIds = [1, 2, 3, 4, 5];
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

const getAccountLabel = (row: DigestRow) => row.username;

const recordDefinitions: RecordDefinition[] = [
	{
		key: 'impact-high',
		badge: 'Record',
		label: 'impact',
		title: (row) => `${getAccountLabel(row)}: top impact`,
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
		title: (row) => `${getAccountLabel(row)}: most kills`,
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
		title: (row) => `${getAccountLabel(row)}: most assists`,
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
		title: (row) => `${getAccountLabel(row)}: top GPM`,
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
		title: (row) => `${getAccountLabel(row)}: most hero damage`,
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
		title: (row) => `${getAccountLabel(row)}: most deaths`,
		tone: 'negative',
		direction: 'high',
		scale: 5,
		basePriority: 53,
		getValue: (row) => row.deaths
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
		const improvement =
			previousValue === null
				? 0
				: definition.direction === 'high'
					? currentValue - previousValue
					: previousValue - currentValue;
		const comparisonUnit = definition.key.startsWith('impact')
			? 'impact points'
			: Math.abs(improvement) === 1 && ['kills', 'assists', 'deaths'].includes(definition.label)
				? definition.label.slice(0, -1)
				: definition.label;
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

const makeStreakItems = (currentRows: DigestRow[]) => {
	const rowsByPlayer = currentRows.reduce((map, row) => {
		const rows = map.get(row.playerId) ?? [];
		rows.push(row);
		map.set(row.playerId, rows);
		return map;
	}, new Map<number, DigestRow[]>());

	return Array.from(rowsByPlayer.values()).flatMap((rows): WeeklyDigestItem[] => {
		const ordered = rows.slice().sort((a, b) => a.startTime - b.startTime);
		const player = ordered[ordered.length - 1];
		const streakWon = player.team === player.winner;
		let streakLength = 0;

		for (let index = ordered.length - 1; index >= 0; index -= 1) {
			const won = ordered[index].team === ordered[index].winner;
			if (won !== streakWon) break;
			streakLength += 1;
		}

		if (streakLength < 4) return [];
		return [
			{
				id: `streak-${player.playerId}-${streakWon ? 'wins' : 'losses'}`,
				category: 'streak',
				tone: streakWon ? 'positive' : 'negative',
				badge: streakWon ? 'Win streak' : 'Losing streak',
				title: `${getAccountLabel(player)} ${streakWon ? 'won' : 'lost'} ${streakLength} straight`,
				summary: `The current ${streakWon ? 'winning' : 'losing'} run through their latest game.`,
				href: `/player/${player.playerId}?tab=matches`,
				image: player.playerImage,
				imageAlt: player.username,
				primaryMetric: { label: 'Streak', value: `${streakLength} games` },
				secondaryMetric: { label: 'Weekly matches', value: formatNumber(rows.length) },
				sampleSize: rows.length,
				occurredAt: player.startTime,
				priority: 60 + clamp(streakLength / 8, 0, 1) * 24,
				evidenceKey: `streak:${player.playerId}:${streakWon}`,
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
	const names = bestSide.side.map(getAccountLabel);
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

const makePooItems = (currentRows: DigestRow[]) =>
	currentRows
		.filter((row) => row.impact <= 25)
		.map(
			(row): WeeklyDigestItem => ({
				id: `poo-${row.matchId}-${row.playerId}`,
				category: 'poo',
				tone: 'negative',
				badge: 'Poo rating',
				title: `${getAccountLabel(row)} earned a poo on ${row.heroName}`,
				summary: `${row.kills}/${row.deaths}/${row.assists} with ${formatNumber(row.impact)} impact.`,
				href: `/match/${row.matchId}`,
				image: row.heroImg,
				imageAlt: row.heroName,
				primaryMetric: { label: 'Rating', value: 'F-' },
				secondaryMetric: { label: 'Impact', value: formatNumber(row.impact) },
				sampleSize: 1,
				occurredAt: row.startTime,
				priority: 100,
				evidenceKey: `poo:${row.matchId}:player:${row.playerId}`,
				entityKey: `player:${row.playerId}`
			})
		);

const makeHeroItems = (historyRows: DigestRow[], periodStart: number) => {
	const rowsByHero = historyRows.reduce((map, row) => {
		const rows = map.get(row.heroId) ?? [];
		rows.push(row);
		map.set(row.heroId, rows);
		return map;
	}, new Map<number, DigestRow[]>());
	const items: WeeklyDigestItem[] = [];

	for (const [heroId, rows] of rowsByHero) {
		const hero = rows[0];
		const precedingRows = rows.filter((row) => row.startTime < periodStart);
		const matchRows = Array.from(
			rows
				.filter((row) => row.startTime >= periodStart)
				.slice()
				.sort((a, b) => a.startTime - b.startTime || a.matchId - b.matchId)
				.reduce((map, row) => {
					const groupedRows = map.get(row.matchId) ?? [];
					groupedRows.push(row);
					map.set(row.matchId, groupedRows);
					return map;
				}, new Map<number, DigestRow[]>())
				.values()
		);

		for (const playedRows of matchRows) {
			const getRankings = (rankingRows: DigestRow[]) =>
				Object.values(getHeroScoreGroupRankings(rankingRows))
					.flat()
					.sort((a, b) => b.score - a.score || b.matches - a.matches);
			const getRankingIdentity = (playerId: number, scoreGroup: string) =>
				`${playerId}:${scoreGroup}`;
			const beforeRankings = getRankings(precedingRows);
			precedingRows.push(...playedRows);
			const afterRankings = getRankings(precedingRows);
			const occurredAt = playedRows[0].startTime;
			const beforePositions = new Map(
				beforeRankings.map((ranking, index) => [
					getRankingIdentity(ranking.playerId, ranking.scoreGroup),
					index + 1
				])
			);
			const afterPositions = new Map(
				afterRankings.map((ranking, index) => [
					getRankingIdentity(ranking.playerId, ranking.scoreGroup),
					index + 1
				])
			);
			const seenPlayers = new Set<string>();

			for (const playedRow of playedRows) {
				const scoreGroup = getHeroScoreGroup(playedRow.role);
				const playedIdentity = getRankingIdentity(playedRow.playerId, scoreGroup);
				if (seenPlayers.has(playedIdentity)) continue;
				seenPlayers.add(playedIdentity);
				const previousPosition = beforePositions.get(playedIdentity);
				const currentPosition = afterPositions.get(playedIdentity);
				const currentRanking = afterRankings.find(
					(ranking) => ranking.playerId === playedRow.playerId && ranking.scoreGroup === scoreGroup
				);
				if (!currentRanking || currentPosition === undefined) continue;

				if (previousPosition === undefined && currentRanking.matches === 10) {
					items.push({
						id: `calibration-${heroId}-${playedRow.playerId}-${scoreGroup}-${playedRow.matchId}`,
						category: 'calibration',
						tone: 'neutral',
						badge: 'Calibrated',
						title: `${getAccountLabel(playedRow)} calibrated ${getHeroScoreGroupName(scoreGroup)} on ${hero.heroName}`,
						summary: `Entered the calibrated table at #${currentPosition} after match 10, with a ${formatNumber(currentRanking.score)} hero score.`,
						href: `/heroes/${heroId}`,
						image: hero.heroImg,
						imageAlt: hero.heroName,
						primaryMetric: { label: 'Position', value: `#${currentPosition}` },
						secondaryMetric: { label: 'Hero score', value: formatNumber(currentRanking.score) },
						sampleSize: currentRanking.matches,
						occurredAt,
						priority: 90,
						evidenceKey: `calibration:${heroId}:player:${playedRow.playerId}:${scoreGroup}`,
						entityKey: `player:${playedRow.playerId}`
					});
					continue;
				}

				if (previousPosition === undefined || currentPosition >= previousPosition) continue;
				const overtaken = beforeRankings
					.slice(currentPosition - 1, previousPosition - 1)
					.filter((ranking) => {
						const rankingIdentity = getRankingIdentity(ranking.playerId, ranking.scoreGroup);
						const nextPosition = afterPositions.get(rankingIdentity);
						const oldPosition = beforePositions.get(rankingIdentity);
						return (
							rankingIdentity !== playedIdentity &&
							nextPosition !== undefined &&
							oldPosition !== undefined &&
							nextPosition > oldPosition
						);
					});
				if (overtaken.length === 0) continue;
				const overtakenNames = overtaken.map((ranking) => ranking.username);
				const overtakenPositions = overtaken
					.map((ranking) => {
						const rankingIdentity = getRankingIdentity(ranking.playerId, ranking.scoreGroup);
						const oldPosition = beforePositions.get(rankingIdentity);
						const nextPosition = afterPositions.get(rankingIdentity);
						return `${ranking.username} #${oldPosition} → #${nextPosition}`;
					})
					.join(', ');
				const overtakenLabel =
					overtakenNames.length === 1
						? overtakenNames[0]
						: `${overtakenNames[0]} +${overtakenNames.length - 1}`;
				const previousOwner = beforeRankings[0];
				const claimedHero = currentPosition === 1 && previousOwner !== undefined;
				const previousOwnerLabel = previousOwner?.username ?? '';

				items.push({
					id: `overtake-${heroId}-${playedRow.playerId}-${scoreGroup}-${playedRow.matchId}`,
					category: 'overtake',
					tone: 'positive',
					highlight: claimedHero ? 'hero-claimed' : undefined,
					badge: claimedHero ? 'Hero claimed' : 'Hero overtake',
					title: claimedHero
						? `${getAccountLabel(playedRow)} claimed ${hero.heroName} from ${previousOwnerLabel}`
						: `${getAccountLabel(playedRow)} overtook ${overtakenLabel} on ${hero.heroName}`,
					summary: `${getAccountLabel(playedRow)} #${previousPosition} → #${currentPosition}; ${overtakenPositions}.`,
					href: `/heroes/${heroId}`,
					image: hero.heroImg,
					imageAlt: hero.heroName,
					primaryMetric: { label: 'Position', value: `#${currentPosition}` },
					secondaryMetric: { label: 'Previous position', value: `#${previousPosition}` },
					sampleSize: currentRanking.matches,
					occurredAt,
					priority: 94 + Math.min(overtaken.length, 5),
					evidenceKey: `overtake:${heroId}:player:${playedRow.playerId}:${scoreGroup}:match:${playedRow.matchId}`,
					entityKey: `player:${playedRow.playerId}`
				});
			}
		}
	}

	return items;
};

const getUtcMonthKey = (timestamp: number) => {
	const date = new Date(timestamp * 1000);
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

const makeRoleItems = (historyRows: DigestRow[], periodStart: number) => {
	const relevantMonthKeys = new Set(
		historyRows
			.filter((row) => row.startTime >= periodStart && roleIds.includes(row.role))
			.map((row) => getUtcMonthKey(row.startTime))
	);
	const items: WeeklyDigestItem[] = [];

	for (const monthKey of relevantMonthKeys) {
		const monthRows = historyRows
			.filter((row) => roleIds.includes(row.role) && getUtcMonthKey(row.startTime) === monthKey)
			.sort((a, b) => a.startTime - b.startTime || a.matchId - b.matchId);
		const matchRows = Array.from(
			monthRows
				.reduce((map, row) => {
					const groupedRows = map.get(row.matchId) ?? [];
					groupedRows.push(row);
					map.set(row.matchId, groupedRows);
					return map;
				}, new Map<number, DigestRow[]>())
				.values()
		);
		const precedingRows: DigestRow[] = [];

		for (const playedRows of matchRows) {
			const occurredAt = playedRows[0].startTime;
			if (occurredAt < periodStart) {
				precedingRows.push(...playedRows);
				continue;
			}

			const playedRoles = Array.from(new Set(playedRows.map((row) => row.role)));
			const beforeRankings = new Map(
				playedRoles.map((role) => [
					role,
					getHeroPlayerRankings(
						precedingRows.filter((row) => row.role === role),
						true
					)
				])
			);
			precedingRows.push(...playedRows);

			for (const role of playedRoles) {
				const before = beforeRankings.get(role) ?? [];
				const after = getHeroPlayerRankings(
					precedingRows.filter((row) => row.role === role),
					true
				);
				const previousLeader = before[0];
				const currentLeader = after[0];
				if (
					!previousLeader ||
					!currentLeader ||
					previousLeader.playerId === currentLeader.playerId
				) {
					continue;
				}

				const leaderRow = playedRows.find(
					(row) => row.role === role && row.playerId === currentLeader.playerId
				);
				if (!leaderRow) continue;
				const previousRank = before.findIndex(
					(ranking) => ranking.playerId === currentLeader.playerId
				);
				const roleName = getRoleName(role) ?? `Position ${role}`;
				const roleIcon = getRoleIcon(role);

				items.push({
					id: `role-claim-${role}-${currentLeader.playerId}-${leaderRow.matchId}`,
					category: 'role',
					tone: 'positive',
					highlight: 'role-claimed',
					badge: 'Role leader',
					title: `${currentLeader.username} claimed ${roleName} #1 from ${previousLeader.username}`,
					summary: `${currentLeader.username} took the lead in the current month's ${roleName} rankings after this match.`,
					href: `/roles?role=${role}&month=${monthKey}`,
					image: roleIcon,
					imageAlt: `${roleName} role`,
					primaryMetric: { label: 'Position', value: '#1' },
					secondaryMetric: {
						label: 'Previous position',
						value: previousRank === -1 ? 'New' : `#${previousRank + 1}`
					},
					sampleSize: currentLeader.matches,
					occurredAt,
					priority: 99,
					evidenceKey: `role-claim:${role}:match:${leaderRow.matchId}`,
					entityKey: `player:${currentLeader.playerId}`
				});
			}
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
			...makePooItems(currentRows),
			...makeRecordItems(currentRows, previousRows),
			...makeStreakItems(currentRows),
			...makeMatchItems(currentRows)
		);
	} else {
		sourceErrors.push('Match and player changes could not be loaded.');
	}

	if (historyResult.status === 'fulfilled') {
		candidates.push(
			...makeHeroItems(historyResult.value, periodStart),
			...makeRoleItems(historyResult.value, periodStart)
		);
	} else {
		sourceErrors.push('Hero and role ranking changes could not be loaded.');
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
