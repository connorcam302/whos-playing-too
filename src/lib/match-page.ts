export type MatchTeam = 'radiant' | 'dire';

export type MatchAsset = {
	id: number;
	name: string;
	img: string;
};

export type TrackedMatchUser = {
	id: number;
	username: string;
	smurf: boolean;
};

export type MatchImpactPoint = {
	time: number;
	impact: number;
};

export type MatchPlayerOverview = {
	playerSlot: number;
	steamAccountId: number | null;
	isRadiant: boolean;
	isVictory: boolean;
	hero: MatchAsset;
	name: string;
	avatar: string | null;
	isAnonymous: boolean;
	user: TrackedMatchUser | null;
	role: string;
	position: string;
	positionNumber: number | null;
	lane: string;
	kills: number;
	deaths: number;
	assists: number;
	lastHits: number;
	denies: number;
	goldPerMinute: number;
	experiencePerMinute: number;
	level: number;
	networth: number;
	networthPerMinute: number[];
	heroDamage: number;
	towerDamage: number;
	heroHealing: number;
	whosPlayingImpact: number | null;
	whosPlayingImpactTimeline: MatchImpactPoint[];
	stratzImpact: number | null;
	award: string | null;
	items: MatchAsset[];
	backpack: MatchAsset[];
	neutralItem: MatchAsset | null;
	variant: number | null;
};

export type MatchDraftEntry = {
	order: number;
	isPick: boolean;
	team: MatchTeam | null;
	hero: MatchAsset;
};

export type MatchLaneOutcome = {
	lane: 'Top' | 'Middle' | 'Bottom';
	result: 'radiant' | 'dire' | 'draw' | 'unknown';
	label: string;
};

export type MatchOverview = {
	id: number;
	didRadiantWin: boolean;
	winner: MatchTeam;
	durationSeconds: number;
	startDateTime: number;
	endDateTime: number | null;
	patch: string | null;
	gameMode: string;
	lobbyType: string;
	averageRank: number | null;
	sequenceNum: number | null;
	status: 'ready' | 'processing' | 'partial';
	radiantScore: number;
	direScore: number;
	players: MatchPlayerOverview[];
	draft: MatchDraftEntry[];
	laneOutcomes: MatchLaneOutcome[];
	series: {
		radiantNetworthLeads: number[];
		radiantExperienceLeads: number[];
		winRates: number[];
		predictedWinRates: number[];
	};
};

export type MatchSectionName = 'timeline' | 'economy' | 'combat';

export type MatchTimelineCategory = 'combat' | 'objective' | 'vision' | 'resource';

export type MatchTimelineEvent = {
	id: string;
	time: number;
	category: MatchTimelineCategory;
	type: 'kill' | 'tower' | 'ward' | 'deward' | 'rune' | 'item';
	team: MatchTeam | null;
	label: string;
	detail: string | null;
	hero: MatchAsset | null;
	targetHero: MatchAsset | null;
	item: MatchAsset | null;
};

export type MatchTimelineSection = {
	events: MatchTimelineEvent[];
	counts: Record<MatchTimelineCategory, number>;
};

export type MatchFarmCategory = {
	label: string;
	count: number;
	gold: number;
	experience: number;
};

export type MatchItemPurchase = {
	time: number;
	item: MatchAsset;
};

export type MatchEconomyPlayer = {
	playerSlot: number;
	hero: MatchAsset;
	networthPerMinute: number[];
	goldPerMinute: number[];
	experiencePerMinute: number[];
	lastHitsPerMinute: number[];
	farm: MatchFarmCategory[];
	buyBackGold: number;
	itemPurchases: MatchItemPurchase[];
};

export type MatchEconomySection = {
	players: MatchEconomyPlayer[];
};

export type MatchDamageTotals = {
	physicalDamage: number;
	magicalDamage: number;
	pureDamage: number;
	healing: number;
	stunDuration: number;
	disableDuration: number;
	slowDuration: number;
};

export type MatchDamageTarget = {
	targetHero: MatchAsset;
	amount: number;
};

export type MatchDamageSource = {
	kind: 'ability' | 'item';
	id: number;
	name: string;
	count: number;
	amount: number;
};

export type MatchCombatPlayer = {
	playerSlot: number;
	hero: MatchAsset;
	dealt: MatchDamageTotals;
	received: MatchDamageTotals;
	dealtTargets: MatchDamageTarget[];
	receivedTargets: MatchDamageTarget[];
	topSources: MatchDamageSource[];
	kills: number;
	deaths: number;
	assists: number;
	wardsPlaced: number;
	wardsDestroyed: number;
	runes: number;
	soloKills: number;
	gankKills: number;
	smokeKills: number;
	burstDeaths: number;
	dieBacks: number;
	goldLostToDeaths: number;
	timeDead: number;
};

export type MatchCombatSection = {
	players: MatchCombatPlayer[];
};

export type MatchSectionData = {
	timeline: MatchTimelineSection;
	economy: MatchEconomySection;
	combat: MatchCombatSection;
};

export type MatchPageError = {
	status: number;
	title: string;
	message: string;
	canRetry: boolean;
};

export const matchChartPalette = {
	primary: 'oklch(0.72 0.13 252)',
	gold: 'oklch(0.78 0.16 75)',
	experience: 'oklch(0.8 0.11 205)',
	positiveFill: 'oklch(0.63 0.15 145 / 0.13)',
	negativeFill: 'oklch(0.63 0.18 25 / 0.13)'
} as const;

export const formatMatchTime = (seconds: number) => {
	const sign = seconds < 0 ? '-' : '';
	const absoluteSeconds = Math.abs(Math.round(seconds));
	const minutes = Math.floor(absoluteSeconds / 60);
	const remainder = absoluteSeconds % 60;
	return `${sign}${minutes}:${remainder.toString().padStart(2, '0')}`;
};

export const formatCompactNumber = (value: number) => {
	if (Math.abs(value) < 1000) return Math.round(value).toString();
	return `${(value / 1000).toFixed(Math.abs(value) >= 10000 ? 0 : 1)}k`;
};

export const formatStratzImpact = (value: number) => {
	return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
};

export const getStratzImpactColor = (value: number) => {
	if (value === 0) return 'oklch(0.68 0.02 260)';

	const strength = Math.min(1, Math.abs(value) / 50);
	const lightness = 0.7 + strength * 0.08;
	const chroma = 0.1 + strength * 0.08;
	return value > 0 ? `oklch(${lightness} ${chroma} 145)` : `oklch(${lightness} ${chroma} 25)`;
};

export const formatEnumLabel = (value: string | null | undefined) => {
	if (!value) return 'Unknown';
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
};
