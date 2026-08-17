import { env } from '$env/dynamic/private';
import { abilityNames } from '$lib/data/abilityNames';
import { heroMap } from '$lib/data/heroMap';
import { itemMap } from '$lib/data/itemMap';
import { getDotaPatchForTimestamp } from '$lib/data/dotaPatchRanges';
import type {
	MatchAsset,
	MatchCombatPlayer,
	MatchCombatSection,
	MatchDamageSource,
	MatchDamageTotals,
	MatchEconomyPlayer,
	MatchEconomySection,
	MatchFarmCategory,
	MatchLaneOutcome,
	MatchOverview,
	MatchPageError,
	MatchPlayerOverview,
	MatchSectionData,
	MatchSectionName,
	MatchTeam,
	MatchTimelineCategory,
	MatchTimelineEvent,
	MatchTimelineSection,
	TrackedMatchUser
} from '$lib/match-page';
import { formatEnumLabel } from '$lib/match-page';
import { getImpactDetails } from '$lib/functions';
import { accounts, players } from '$lib/server/schema';
import { db } from '$lib/server/database';
import { eq, inArray } from 'drizzle-orm';

const STRATZ_GRAPHQL_URL = 'https://api.stratz.com/graphql';
const READY_CACHE_TTL = 24 * 60 * 60 * 1000;
const PROCESSING_CACHE_TTL = 60 * 1000;
const SECTION_CACHE_TTL = 24 * 60 * 60 * 1000;

type StratzError = Error & {
	status: number;
	code:
		| 'configuration'
		| 'authentication'
		| 'not-found'
		| 'rate-limit'
		| 'unavailable'
		| 'invalid-response';
};

type GraphqlResponse<T> = {
	data?: T;
	errors?: Array<{ message?: string }>;
};

type CacheEntry = {
	expiresAt: number;
	value: Promise<unknown>;
};

type RawSteamAccount = {
	avatar?: string | null;
	seasonRank?: number | null;
};

type RawMatchPlayer = {
	playerSlot?: number | null;
	steamAccountId?: number | null;
	steamAccount?: RawSteamAccount | null;
	isRadiant?: boolean | null;
	isVictory?: boolean | null;
	heroId?: number | null;
	kills?: number | null;
	deaths?: number | null;
	assists?: number | null;
	numLastHits?: number | null;
	numDenies?: number | null;
	goldPerMinute?: number | null;
	networth?: number | null;
	experiencePerMinute?: number | null;
	level?: number | null;
	heroDamage?: number | null;
	towerDamage?: number | null;
	heroHealing?: number | null;
	lane?: string | null;
	role?: string | null;
	imp?: number | null;
	award?: string | null;
	item0Id?: number | null;
	item1Id?: number | null;
	item2Id?: number | null;
	item3Id?: number | null;
	item4Id?: number | null;
	item5Id?: number | null;
	backpack0Id?: number | null;
	backpack1Id?: number | null;
	backpack2Id?: number | null;
	neutral0Id?: number | null;
	variant?: number | null;
	stats?: RawPlayerStats | null;
};

type RawFarmObject = {
	id?: number | null;
	count?: number | null;
	gold?: number | null;
	xp?: number | null;
};

type RawFarmReport = {
	creepLocation?: RawFarmObject[] | null;
	neutralLocation?: RawFarmObject[] | null;
	ancientLocation?: RawFarmObject[] | null;
	buildings?: RawFarmObject[] | null;
	buyBackGold?: number | null;
	bountyGold?: RawFarmObject | null;
	other?: RawFarmObject[] | null;
};

type RawDamageTotals = {
	physicalDamage?: number | null;
	magicalDamage?: number | null;
	pureDamage?: number | null;
	selfHeal?: number | null;
	allyHeal?: number | null;
	heal?: number | null;
	stunDuration?: number | null;
	disableDuration?: number | null;
	slowDuration?: number | null;
};

type RawDamageTarget = {
	target?: number | null;
	amount?: number | null;
};

type RawDamageAbilitySource = {
	abilityId?: number | null;
	count?: number | null;
	amount?: number | null;
};

type RawDamageItemSource = {
	itemId?: number | null;
	count?: number | null;
	amount?: number | null;
};

type RawDamageReport = {
	dealtTotal?: RawDamageTotals | null;
	receivedTotal?: RawDamageTotals | null;
	dealtTargets?: RawDamageTarget[] | null;
	receivedTargets?: RawDamageTarget[] | null;
	dealtSourceAbility?: RawDamageAbilitySource[] | null;
	dealtSourceItem?: RawDamageItemSource[] | null;
};

type RawKillEvent = {
	time?: number | null;
	target?: number | null;
	byAbility?: number | null;
	byItem?: number | null;
	assist?: number[] | null;
	isSolo?: boolean | null;
	isGank?: boolean | null;
	isInvisible?: boolean | null;
	isSmoke?: boolean | null;
	isTpRecently?: boolean | null;
};

type RawDeathEvent = {
	time?: number | null;
	attacker?: number | null;
	target?: number | null;
	goldLost?: number | null;
	timeDead?: number | null;
	isDieBack?: boolean | null;
	isBurst?: boolean | null;
};

type RawAssistEvent = {
	time?: number | null;
};

type RawWardEvent = {
	time?: number | null;
	type?: number | null;
};

type RawRuneEvent = {
	time?: number | null;
	rune?: string | null;
	action?: string | null;
};

type RawItemPurchase = {
	time?: number | null;
	itemId?: number | null;
};

type RawWardDestruction = {
	time?: number | null;
	isWard?: boolean | null;
};

type RawPlayerStats = {
	networthPerMinute?: number[] | null;
	goldPerMinute?: number[] | null;
	experiencePerMinute?: number[] | null;
	lastHitsPerMinute?: number[] | null;
	farmDistributionReport?: RawFarmReport | null;
	itemPurchases?: RawItemPurchase[] | null;
	heroDamageReport?: RawDamageReport | null;
	killEvents?: RawKillEvent[] | null;
	deathEvents?: RawDeathEvent[] | null;
	assistEvents?: RawAssistEvent[] | null;
	wards?: RawWardEvent[] | null;
	runes?: RawRuneEvent[] | null;
	wardDestruction?: RawWardDestruction[] | null;
};

type RawMatch = {
	id?: number | null;
	didRadiantWin?: boolean | null;
	durationSeconds?: number | null;
	startDateTime?: number | null;
	endDateTime?: number | null;
	averageRank?: number | null;
	sequenceNum?: number | null;
	lobbyType?: string | null;
	gameMode?: string | null;
	parsedDateTime?: number | null;
	statsDateTime?: number | null;
	didRequestDownload?: boolean | null;
	radiantNetworthLeads?: number[] | null;
	radiantExperienceLeads?: number[] | null;
	winRates?: number[] | null;
	predictedWinRates?: number[] | null;
	topLaneOutcome?: string | null;
	midLaneOutcome?: string | null;
	bottomLaneOutcome?: string | null;
	pickBans?: Array<{
		isPick?: boolean | null;
		heroId?: number | null;
		bannedHeroId?: number | null;
		order?: number | null;
		isRadiant?: boolean | null;
		wasBannedSuccessfully?: boolean | null;
	}> | null;
	towerDeaths?: Array<{
		time?: number | null;
		npcId?: number | null;
		isRadiant?: boolean | null;
		attacker?: number | null;
	}> | null;
	players?: RawMatchPlayer[] | null;
};

const cache = new Map<string, CacheEntry>();

const createStratzError = (message: string, status: number, code: StratzError['code']) => {
	return Object.assign(new Error(message), { status, code }) as StratzError;
};

const isStratzError = (error: unknown): error is StratzError => {
	return error instanceof Error && 'status' in error && 'code' in error;
};

const getCached = async <T>(key: string, ttl: number, loader: () => Promise<T>) => {
	const cached = cache.get(key);
	if (cached && cached.expiresAt > Date.now()) return (await cached.value) as T;

	const value = loader();
	cache.set(key, { expiresAt: Date.now() + ttl, value });

	try {
		return await value;
	} catch (error) {
		cache.delete(key);
		throw error;
	}
};

const requestStratz = async <T>(query: string, variables: Record<string, unknown>) => {
	if (!env.STRATZ_KEY) {
		throw createStratzError(
			'STRATZ access is not configured for this deployment.',
			503,
			'configuration'
		);
	}

	let response: Response;
	try {
		response = await fetch(STRATZ_GRAPHQL_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.STRATZ_KEY}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'User-Agent': 'STRATZ_API'
			},
			body: JSON.stringify({ query, variables })
		});
	} catch {
		throw createStratzError('STRATZ could not be reached.', 503, 'unavailable');
	}

	if (response.status === 429) {
		throw createStratzError('STRATZ is receiving too many requests.', 429, 'rate-limit');
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (response.headers.get('cf-mitigated') === 'challenge') {
		throw createStratzError('Cloudflare challenged the STRATZ API request.', 503, 'unavailable');
	}

	if (response.status === 401 || response.status === 403) {
		throw createStratzError(
			'STRATZ rejected the configured API token.',
			response.status,
			'authentication'
		);
	}

	if (!response.ok || !contentType.includes('application/json')) {
		throw createStratzError('STRATZ returned an unavailable response.', 503, 'unavailable');
	}

	let payload: GraphqlResponse<T>;
	try {
		payload = (await response.json()) as GraphqlResponse<T>;
	} catch {
		throw createStratzError(
			'STRATZ returned data that could not be read.',
			502,
			'invalid-response'
		);
	}

	if (!payload.data) {
		const message = payload.errors?.[0]?.message ?? 'STRATZ did not return match data.';
		throw createStratzError(message, 502, 'invalid-response');
	}

	return payload.data;
};

const getHeroAsset = (heroId: number | null | undefined): MatchAsset => {
	const id = Number(heroId ?? 0);
	const asset = heroMap.get(id);
	return asset ?? { id, name: id ? `Hero ${id}` : 'Unknown hero', img: '/empty-slot.webp' };
};

const getItemAsset = (itemId: number | null | undefined): MatchAsset => {
	const id = Number(itemId ?? 0);
	const asset = itemMap.get(id);
	return asset ?? { id, name: id ? `Item ${id}` : 'Empty', img: '/empty-slot.webp' };
};

const toTeam = (isRadiant: boolean | null | undefined): MatchTeam => {
	return isRadiant ? 'radiant' : 'dire';
};

const getPosition = (lane: string | null | undefined, role: string | null | undefined) => {
	if (role === 'HARD_SUPPORT') return 'Hard Support';
	if (role === 'LIGHT_SUPPORT') return 'Soft Support';
	if (lane === 'MID_LANE') return 'Mid';
	if (lane === 'OFF_LANE') return 'Offlane';
	if (lane === 'SAFE_LANE') return 'Carry';
	return formatEnumLabel(role ?? lane);
};

const getPositionNumber = (
	lane: string | null | undefined,
	role: string | null | undefined
): number | null => {
	if (role === 'HARD_SUPPORT') return 5;
	if (role === 'LIGHT_SUPPORT') return 4;
	if (lane === 'MID_LANE') return 2;
	if (lane === 'OFF_LANE') return 3;
	if (lane === 'SAFE_LANE') return 1;
	return null;
};

const getTrackedUsers = async (accountIds: number[]) => {
	const uniqueIds = [...new Set(accountIds.filter((id) => Number.isFinite(id) && id > 0))];
	if (uniqueIds.length === 0) return new Map<number, TrackedMatchUser>();

	const rows = await db
		.select({
			accountId: accounts.accountId,
			id: players.id,
			username: players.username,
			smurf: accounts.smurf
		})
		.from(accounts)
		.innerJoin(players, eq(accounts.owner, players.id))
		.where(inArray(accounts.accountId, uniqueIds));

	return new Map(
		rows.map((row) => [
			row.accountId,
			{ id: row.id, username: row.username, smurf: row.smurf } satisfies TrackedMatchUser
		])
	);
};

const buildWhosPlayingImpactTimeline = (
	player: RawMatchPlayer,
	positionNumber: number | null,
	durationSeconds: number
) => {
	if (!positionNumber || durationSeconds <= 0) return [];

	const firstStableMinute = Math.min(5, Math.max(1, Math.floor(durationSeconds / 60)));
	const minuteMarkers = Array.from(
		{ length: Math.max(0, Math.floor(durationSeconds / 60) - firstStableMinute + 1) },
		(_, index) => (index + firstStableMinute) * 60
	);
	if (minuteMarkers.at(-1) !== durationSeconds) minuteMarkers.push(durationSeconds);

	const lastHitsPerMinute = player.stats?.lastHitsPerMinute ?? [];
	const killEvents = player.stats?.killEvents ?? [];
	const deathEvents = player.stats?.deathEvents ?? [];
	const assistEvents = player.stats?.assistEvents ?? [];

	return minuteMarkers.map((time, index) => {
		const isFinalPoint = index === minuteMarkers.length - 1;
		const lastHitMinute = Math.max(0, Math.ceil(time / 60) - 1);
		const cumulativeLastHits = lastHitsPerMinute
			.slice(0, lastHitMinute + 1)
			.reduce((total, value) => total + Number(value ?? 0), 0);
		const matchStats = isFinalPoint
			? {
					hero_id: Number(player.heroId ?? 0),
					kills: Number(player.kills ?? 0),
					deaths: Number(player.deaths ?? 0),
					assists: Number(player.assists ?? 0),
					lastHits: Number(player.numLastHits ?? 0)
				}
			: {
					hero_id: Number(player.heroId ?? 0),
					kills: killEvents.filter((event) => Number(event.time ?? 0) <= time).length,
					deaths: deathEvents.filter((event) => Number(event.time ?? 0) <= time).length,
					assists: assistEvents.filter((event) => Number(event.time ?? 0) <= time).length,
					lastHits: cumulativeLastHits
				};

		return {
			time,
			impact: getImpactDetails(matchStats, positionNumber, time).impact
		};
	});
};

const normalisePlayer = (
	player: RawMatchPlayer,
	trackedUsers: Map<number, TrackedMatchUser>,
	durationSeconds: number
): MatchPlayerOverview => {
	const accountId =
		player.steamAccountId && player.steamAccountId > 0 ? player.steamAccountId : null;
	const user = accountId ? (trackedUsers.get(accountId) ?? null) : null;
	const itemIds = [
		player.item0Id,
		player.item1Id,
		player.item2Id,
		player.item3Id,
		player.item4Id,
		player.item5Id
	];
	const backpackIds = [player.backpack0Id, player.backpack1Id, player.backpack2Id];
	const positionNumber = getPositionNumber(player.lane, player.role);
	const whosPlayingImpact =
		positionNumber && durationSeconds > 0
			? getImpactDetails(
					{
						hero_id: Number(player.heroId ?? 0),
						kills: Number(player.kills ?? 0),
						deaths: Number(player.deaths ?? 0),
						assists: Number(player.assists ?? 0),
						lastHits: Number(player.numLastHits ?? 0)
					},
					positionNumber,
					durationSeconds
				).impact
			: null;

	return {
		playerSlot: Number(player.playerSlot ?? 0),
		steamAccountId: user ? accountId : null,
		isRadiant: Boolean(player.isRadiant),
		isVictory: Boolean(player.isVictory),
		hero: getHeroAsset(player.heroId),
		name: user?.username ?? 'Anonymous',
		avatar: user ? (player.steamAccount?.avatar ?? null) : null,
		rankTier: player.steamAccount?.seasonRank ?? null,
		isAnonymous: !user,
		user,
		role: formatEnumLabel(player.role),
		position: getPosition(player.lane, player.role),
		positionNumber,
		lane: formatEnumLabel(player.lane),
		kills: Number(player.kills ?? 0),
		deaths: Number(player.deaths ?? 0),
		assists: Number(player.assists ?? 0),
		lastHits: Number(player.numLastHits ?? 0),
		denies: Number(player.numDenies ?? 0),
		goldPerMinute: Number(player.goldPerMinute ?? 0),
		experiencePerMinute: Number(player.experiencePerMinute ?? 0),
		level: Number(player.level ?? 0),
		networth: Number(player.networth ?? 0),
		networthPerMinute: player.stats?.networthPerMinute ?? [],
		heroDamage: Number(player.heroDamage ?? 0),
		towerDamage: Number(player.towerDamage ?? 0),
		heroHealing: Number(player.heroHealing ?? 0),
		whosPlayingImpact,
		whosPlayingImpactTimeline: buildWhosPlayingImpactTimeline(
			player,
			positionNumber,
			durationSeconds
		),
		stratzImpact: player.imp ?? null,
		award: player.award && player.award !== 'NONE' ? formatEnumLabel(player.award) : null,
		items: itemIds.map(getItemAsset).filter((item) => item.id > 0),
		backpack: backpackIds.map(getItemAsset).filter((item) => item.id > 0),
		neutralItem: player.neutral0Id ? getItemAsset(player.neutral0Id) : null,
		variant: player.variant ?? null
	};
};

const normaliseLaneOutcome = (
	lane: MatchLaneOutcome['lane'],
	value: string | null | undefined
): MatchLaneOutcome => {
	if (value?.includes('RADIANT')) return { lane, result: 'radiant', label: 'Radiant won' };
	if (value?.includes('DIRE')) return { lane, result: 'dire', label: 'Dire won' };
	if (value?.includes('TIE') || value?.includes('DRAW'))
		return { lane, result: 'draw', label: 'Draw' };
	return { lane, result: 'unknown', label: 'Not available' };
};

const MATCH_OVERVIEW_QUERY = `
	query MatchOverview($id: Long!) {
		match(id: $id) {
			id
			didRadiantWin
			durationSeconds
			startDateTime
			endDateTime
			averageRank
			sequenceNum
			lobbyType
			gameMode
			parsedDateTime
			statsDateTime
			didRequestDownload
			radiantNetworthLeads
			radiantExperienceLeads
			winRates
			predictedWinRates
			topLaneOutcome
			midLaneOutcome
			bottomLaneOutcome
			pickBans {
				isPick
				heroId
				bannedHeroId
				order
				isRadiant
				wasBannedSuccessfully
			}
			players {
				playerSlot
				steamAccountId
				steamAccount {
					avatar
					seasonRank
				}
				isRadiant
				isVictory
				heroId
				kills
				deaths
				assists
				numLastHits
				numDenies
				goldPerMinute
				networth
				experiencePerMinute
				level
				heroDamage
				towerDamage
				heroHealing
				lane
				role
				imp
				award
				item0Id
				item1Id
				item2Id
				item3Id
				item4Id
				item5Id
				backpack0Id
				backpack1Id
				backpack2Id
				neutral0Id
				variant
				stats {
					networthPerMinute
					lastHitsPerMinute
					killEvents { time }
					deathEvents { time }
					assistEvents { time }
				}
			}
		}
	}
`;

const loadOverview = async (matchId: number) => {
	const payload = await requestStratz<{ match?: RawMatch | null }>(MATCH_OVERVIEW_QUERY, {
		id: matchId
	});
	const rawMatch = payload.match;
	if (!rawMatch?.id) throw createStratzError('STRATZ could not find this match.', 404, 'not-found');

	const rawPlayers = rawMatch.players ?? [];
	const trackedUsers = await getTrackedUsers(
		rawPlayers.map((player) => Number(player.steamAccountId ?? 0))
	);
	const durationSeconds = Number(rawMatch.durationSeconds ?? 0);
	const normalisedPlayers = rawPlayers.map((player) =>
		normalisePlayer(player, trackedUsers, durationSeconds)
	);
	const patch = getDotaPatchForTimestamp(Number(rawMatch.startDateTime ?? 0));
	const ready = Boolean(rawMatch.statsDateTime);

	const overview: MatchOverview = {
		id: rawMatch.id,
		didRadiantWin: Boolean(rawMatch.didRadiantWin),
		winner: rawMatch.didRadiantWin ? 'radiant' : 'dire',
		durationSeconds,
		startDateTime: Number(rawMatch.startDateTime ?? 0),
		endDateTime: rawMatch.endDateTime ?? null,
		patch: patch?.label ?? null,
		gameMode: formatEnumLabel(rawMatch.gameMode),
		lobbyType: formatEnumLabel(rawMatch.lobbyType),
		averageRank: rawMatch.averageRank ?? null,
		sequenceNum: rawMatch.sequenceNum ?? null,
		status: ready ? 'ready' : rawMatch.didRequestDownload ? 'processing' : 'partial',
		radiantScore: normalisedPlayers
			.filter((player) => player.isRadiant)
			.reduce((total, player) => total + player.kills, 0),
		direScore: normalisedPlayers
			.filter((player) => !player.isRadiant)
			.reduce((total, player) => total + player.kills, 0),
		players: normalisedPlayers.sort((a, b) => a.playerSlot - b.playerSlot),
		draft: (rawMatch.pickBans ?? [])
			.filter((entry) => entry.wasBannedSuccessfully !== false)
			.map((entry) => ({
				order: Number(entry.order ?? 0),
				isPick: Boolean(entry.isPick),
				team: typeof entry.isRadiant === 'boolean' ? toTeam(entry.isRadiant) : null,
				hero: getHeroAsset(entry.isPick ? entry.heroId : (entry.bannedHeroId ?? entry.heroId))
			}))
			.filter((entry) => entry.hero.id > 0)
			.sort((a, b) => a.order - b.order),
		laneOutcomes: [
			normaliseLaneOutcome('Top', rawMatch.topLaneOutcome),
			normaliseLaneOutcome('Middle', rawMatch.midLaneOutcome),
			normaliseLaneOutcome('Bottom', rawMatch.bottomLaneOutcome)
		],
		series: {
			radiantNetworthLeads: rawMatch.radiantNetworthLeads ?? [],
			radiantExperienceLeads: rawMatch.radiantExperienceLeads ?? [],
			winRates: rawMatch.winRates ?? [],
			predictedWinRates: rawMatch.predictedWinRates ?? []
		}
	};

	cache.set(`overview:${matchId}`, {
		expiresAt: Date.now() + (ready ? READY_CACHE_TTL : PROCESSING_CACHE_TTL),
		value: Promise.resolve(overview)
	});

	return overview;
};

export const getStratzMatchOverview = async (matchId: number) => {
	return getCached(`overview:${matchId}`, PROCESSING_CACHE_TTL, () => loadOverview(matchId));
};

const MATCH_TIMELINE_QUERY = `
	query MatchTimeline($id: Long!) {
		match(id: $id) {
			id
			towerDeaths { time npcId isRadiant attacker }
			players {
				playerSlot
				heroId
				isRadiant
				stats {
					killEvents { time target byAbility byItem assist isSolo isGank isInvisible isSmoke isTpRecently }
					wards { time type }
					runes { time rune action }
					itemPurchases { time itemId }
					wardDestruction { time isWard }
				}
			}
		}
	}
`;

const makeTimelineEvent = (
	event: Omit<MatchTimelineEvent, 'id'>,
	index: number
): MatchTimelineEvent => ({
	...event,
	id: `${event.type}-${event.time}-${event.hero?.id ?? 0}-${index}`
});

const loadTimeline = async (matchId: number): Promise<MatchTimelineSection> => {
	const payload = await requestStratz<{ match?: RawMatch | null }>(MATCH_TIMELINE_QUERY, {
		id: matchId
	});
	const rawMatch = payload.match;
	if (!rawMatch?.id) throw createStratzError('STRATZ could not find this match.', 404, 'not-found');

	const events: MatchTimelineEvent[] = [];
	for (const player of rawMatch.players ?? []) {
		const hero = getHeroAsset(player.heroId);
		const team = toTeam(player.isRadiant);

		for (const kill of player.stats?.killEvents ?? []) {
			const targetHero = getHeroAsset(kill.target);
			const details = [
				kill.isSolo ? 'Solo kill' : null,
				kill.isGank ? 'Gank' : null,
				kill.isSmoke ? 'Smoke' : null,
				kill.isInvisible ? 'Invisible' : null,
				kill.isTpRecently ? 'Recent teleport' : null
			].filter(Boolean);
			events.push(
				makeTimelineEvent(
					{
						time: Number(kill.time ?? 0),
						category: 'combat',
						type: 'kill',
						team,
						label: `${hero.name} killed ${targetHero.name}`,
						detail: details.length > 0 ? details.join(', ') : null,
						hero,
						targetHero,
						item: kill.byItem ? getItemAsset(kill.byItem) : null
					},
					events.length
				)
			);
		}

		for (const ward of player.stats?.wards ?? []) {
			events.push(
				makeTimelineEvent(
					{
						time: Number(ward.time ?? 0),
						category: 'vision',
						type: 'ward',
						team,
						label: `${hero.name} placed a ward`,
						detail: ward.type === 1 ? 'Sentry ward' : ward.type === 0 ? 'Observer ward' : null,
						hero,
						targetHero: null,
						item: null
					},
					events.length
				)
			);
		}

		for (const deward of player.stats?.wardDestruction ?? []) {
			events.push(
				makeTimelineEvent(
					{
						time: Number(deward.time ?? 0),
						category: 'vision',
						type: 'deward',
						team,
						label: `${hero.name} destroyed a ward`,
						detail: deward.isWard === false ? 'Non-ward vision unit' : null,
						hero,
						targetHero: null,
						item: null
					},
					events.length
				)
			);
		}

		for (const rune of player.stats?.runes ?? []) {
			events.push(
				makeTimelineEvent(
					{
						time: Number(rune.time ?? 0),
						category: 'resource',
						type: 'rune',
						team,
						label: `${hero.name}: ${formatEnumLabel(rune.rune)} rune`,
						detail: formatEnumLabel(rune.action),
						hero,
						targetHero: null,
						item: null
					},
					events.length
				)
			);
		}

		for (const purchase of player.stats?.itemPurchases ?? []) {
			const item = getItemAsset(purchase.itemId);
			if (item.id <= 0) continue;
			events.push(
				makeTimelineEvent(
					{
						time: Number(purchase.time ?? 0),
						category: 'resource',
						type: 'item',
						team,
						label: `${hero.name} purchased ${item.name}`,
						detail: null,
						hero,
						targetHero: null,
						item
					},
					events.length
				)
			);
		}
	}

	for (const tower of rawMatch.towerDeaths ?? []) {
		const towerTeam = toTeam(tower.isRadiant);
		const attackerTeam: MatchTeam = towerTeam === 'radiant' ? 'dire' : 'radiant';
		const attacker = getHeroAsset(tower.attacker);
		events.push(
			makeTimelineEvent(
				{
					time: Number(tower.time ?? 0),
					category: 'objective',
					type: 'tower',
					team: attackerTeam,
					label: `${formatEnumLabel(towerTeam)} tower destroyed`,
					detail: tower.npcId ? `Building ${tower.npcId}` : null,
					hero: attacker.id > 0 ? attacker : null,
					targetHero: null,
					item: null
				},
				events.length
			)
		);
	}

	events.sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
	const categories: MatchTimelineCategory[] = ['combat', 'objective', 'vision', 'resource'];
	const counts = Object.fromEntries(
		categories.map((category) => [
			category,
			events.filter((event) => event.category === category).length
		])
	) as Record<MatchTimelineCategory, number>;

	return { events, counts };
};

const MATCH_ECONOMY_QUERY = `
	query MatchEconomy($id: Long!) {
		match(id: $id) {
			id
			players {
				playerSlot
				heroId
				stats {
					networthPerMinute
					goldPerMinute
					experiencePerMinute
					lastHitsPerMinute
					farmDistributionReport {
						creepLocation { id count gold xp }
						neutralLocation { id count gold xp }
						ancientLocation { id count gold xp }
						buildings { id count gold xp }
						buyBackGold
						bountyGold { id count gold xp }
						other { id count gold xp }
					}
					itemPurchases { time itemId }
				}
			}
		}
	}
`;

const sumFarmObjects = (objects: RawFarmObject[] | null | undefined) => {
	return (objects ?? []).reduce<{ count: number; gold: number; experience: number }>(
		(total, object) => ({
			count: total.count + Number(object.count ?? 0),
			gold: total.gold + Number(object.gold ?? 0),
			experience: total.experience + Number(object.xp ?? 0)
		}),
		{ count: 0, gold: 0, experience: 0 }
	);
};

const makeFarmCategory = (
	label: string,
	objects: RawFarmObject[] | RawFarmObject | null | undefined
): MatchFarmCategory => {
	const values = sumFarmObjects(Array.isArray(objects) ? objects : objects ? [objects] : []);
	return { label, ...values };
};

const loadEconomy = async (matchId: number): Promise<MatchEconomySection> => {
	const payload = await requestStratz<{ match?: RawMatch | null }>(MATCH_ECONOMY_QUERY, {
		id: matchId
	});
	const rawMatch = payload.match;
	if (!rawMatch?.id) throw createStratzError('STRATZ could not find this match.', 404, 'not-found');

	const normalisedPlayers: MatchEconomyPlayer[] = (rawMatch.players ?? []).map((player) => {
		const farm = player.stats?.farmDistributionReport;
		return {
			playerSlot: Number(player.playerSlot ?? 0),
			hero: getHeroAsset(player.heroId),
			networthPerMinute: player.stats?.networthPerMinute ?? [],
			goldPerMinute: player.stats?.goldPerMinute ?? [],
			experiencePerMinute: player.stats?.experiencePerMinute ?? [],
			lastHitsPerMinute: player.stats?.lastHitsPerMinute ?? [],
			farm: [
				makeFarmCategory('Lane and creeps', farm?.creepLocation),
				makeFarmCategory('Neutral camps', farm?.neutralLocation),
				makeFarmCategory('Ancients', farm?.ancientLocation),
				makeFarmCategory('Buildings', farm?.buildings),
				makeFarmCategory('Bounties', farm?.bountyGold),
				makeFarmCategory('Other', farm?.other)
			],
			buyBackGold: Number(farm?.buyBackGold ?? 0),
			itemPurchases: (player.stats?.itemPurchases ?? [])
				.map((purchase) => ({
					time: Number(purchase.time ?? 0),
					item: getItemAsset(purchase.itemId)
				}))
				.filter((purchase) => purchase.item.id > 0)
				.sort((a, b) => a.time - b.time)
		};
	});

	return { players: normalisedPlayers.sort((a, b) => a.playerSlot - b.playerSlot) };
};

const MATCH_COMBAT_QUERY = `
	query MatchCombat($id: Long!) {
		match(id: $id) {
			id
			players {
				playerSlot
				heroId
				kills
				deaths
				assists
				stats {
					heroDamageReport {
						dealtTotal { physicalDamage magicalDamage pureDamage selfHeal allyHeal stunDuration disableDuration slowDuration }
						receivedTotal { physicalDamage magicalDamage pureDamage heal stunDuration disableDuration slowDuration }
						dealtTargets { target amount }
						receivedTargets { target amount }
						dealtSourceAbility { abilityId count amount }
						dealtSourceItem { itemId count amount }
					}
					killEvents { time isSolo isGank isSmoke }
					deathEvents { time goldLost timeDead isDieBack isBurst }
					wards { time type }
					wardDestruction { time isWard }
					runes { time rune action }
				}
			}
		}
	}
`;

const normaliseDamageTotals = (
	totals: RawDamageTotals | null | undefined,
	direction: 'dealt' | 'received'
): MatchDamageTotals => ({
	physicalDamage: Number(totals?.physicalDamage ?? 0),
	magicalDamage: Number(totals?.magicalDamage ?? 0),
	pureDamage: Number(totals?.pureDamage ?? 0),
	healing:
		direction === 'dealt'
			? Number(totals?.selfHeal ?? 0) + Number(totals?.allyHeal ?? 0)
			: Number(totals?.heal ?? 0),
	stunDuration: Number(totals?.stunDuration ?? 0) / 1000,
	disableDuration: Number(totals?.disableDuration ?? 0) / 1000,
	slowDuration: Number(totals?.slowDuration ?? 0) / 1000
});

const normaliseDamageSources = (
	report: RawDamageReport | null | undefined
): MatchDamageSource[] => {
	const abilitySources: MatchDamageSource[] = (report?.dealtSourceAbility ?? [])
		.filter((source) => Boolean(source.abilityId))
		.map((source) => ({
			kind: 'ability',
			id: Number(source.abilityId ?? 0),
			name: abilityNames[Number(source.abilityId)] ?? `Ability ${source.abilityId}`,
			count: Number(source.count ?? 0),
			amount: Number(source.amount ?? 0)
		}));
	const itemSources: MatchDamageSource[] = (report?.dealtSourceItem ?? [])
		.filter((source) => Boolean(source.itemId))
		.map((source) => {
			const item = getItemAsset(source.itemId);
			return {
				kind: 'item',
				id: item.id,
				name: item.name,
				count: Number(source.count ?? 0),
				amount: Number(source.amount ?? 0)
			};
		});

	return [...abilitySources, ...itemSources].sort((a, b) => b.amount - a.amount).slice(0, 6);
};

const loadCombat = async (matchId: number): Promise<MatchCombatSection> => {
	const payload = await requestStratz<{ match?: RawMatch | null }>(MATCH_COMBAT_QUERY, {
		id: matchId
	});
	const rawMatch = payload.match;
	if (!rawMatch?.id) throw createStratzError('STRATZ could not find this match.', 404, 'not-found');

	const normalisedPlayers: MatchCombatPlayer[] = (rawMatch.players ?? []).map((player) => {
		const report = player.stats?.heroDamageReport;
		const deaths = player.stats?.deathEvents ?? [];
		const kills = player.stats?.killEvents ?? [];
		return {
			playerSlot: Number(player.playerSlot ?? 0),
			hero: getHeroAsset(player.heroId),
			dealt: normaliseDamageTotals(report?.dealtTotal, 'dealt'),
			received: normaliseDamageTotals(report?.receivedTotal, 'received'),
			dealtTargets: (report?.dealtTargets ?? [])
				.map((target) => ({
					targetHero: getHeroAsset(target.target),
					amount: Number(target.amount ?? 0)
				}))
				.filter((target) => target.targetHero.id > 0)
				.sort((a, b) => b.amount - a.amount),
			receivedTargets: (report?.receivedTargets ?? [])
				.map((target) => ({
					targetHero: getHeroAsset(target.target),
					amount: Number(target.amount ?? 0)
				}))
				.filter((target) => target.targetHero.id > 0)
				.sort((a, b) => b.amount - a.amount),
			topSources: normaliseDamageSources(report),
			kills: Number(player.kills ?? 0),
			deaths: Number(player.deaths ?? 0),
			assists: Number(player.assists ?? 0),
			wardsPlaced: player.stats?.wards?.length ?? 0,
			wardsDestroyed:
				player.stats?.wardDestruction?.filter((event) => event.isWard !== false).length ?? 0,
			runes: player.stats?.runes?.length ?? 0,
			soloKills: kills.filter((event) => event.isSolo).length,
			gankKills: kills.filter((event) => event.isGank).length,
			smokeKills: kills.filter((event) => event.isSmoke).length,
			burstDeaths: deaths.filter((event) => event.isBurst).length,
			dieBacks: deaths.filter((event) => event.isDieBack).length,
			goldLostToDeaths: deaths.reduce((total, death) => total + Number(death.goldLost ?? 0), 0),
			timeDead: deaths.reduce((total, death) => total + Number(death.timeDead ?? 0), 0)
		};
	});

	return { players: normalisedPlayers.sort((a, b) => a.playerSlot - b.playerSlot) };
};

const sectionLoaders: {
	[Section in MatchSectionName]: (matchId: number) => Promise<MatchSectionData[Section]>;
} = {
	timeline: loadTimeline,
	economy: loadEconomy,
	combat: loadCombat
};

export const getStratzMatchSection = async <Section extends MatchSectionName>(
	matchId: number,
	section: Section
) => {
	return getCached(`section:${section}:${matchId}`, SECTION_CACHE_TTL, () =>
		sectionLoaders[section](matchId)
	) as Promise<MatchSectionData[Section]>;
};

export const toMatchPageError = (error: unknown): MatchPageError => {
	if (isStratzError(error)) {
		if (error.code === 'not-found') {
			return {
				status: 404,
				title: 'Match not found',
				message: 'STRATZ does not have a public record for this match yet.',
				canRetry: false
			};
		}
		if (error.code === 'rate-limit') {
			return {
				status: 429,
				title: 'Match analysis is busy',
				message: 'STRATZ is receiving too many requests. Wait a moment, then retry this match.',
				canRetry: true
			};
		}
		if (error.code === 'configuration') {
			return {
				status: 503,
				title: 'Match analysis is not configured',
				message: 'This deployment does not have access to the STRATZ match API.',
				canRetry: false
			};
		}
		if (error.code === 'authentication') {
			return {
				status: 503,
				title: 'Match analysis is not authorized',
				message: 'The configured STRATZ API token is expired, invalid, or no longer active.',
				canRetry: false
			};
		}
	}

	return {
		status: 503,
		title: 'Match analysis is unavailable',
		message: 'We could not reach STRATZ. The match may still be processing, so try again shortly.',
		canRetry: true
	};
};
