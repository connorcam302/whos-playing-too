export type MatchDetails = {
	id: number;
	didRadiantWin: boolean;
	durationSeconds: number;
	startDateTime: number;
	clusterId: number;
	firstBloodTime: number;
	lobbyType: number;
	numHumanPlayers: number;
	gameMode: number;
	isStats: boolean;
	avgImp: number;
	parsedDateTime: number;
	statsDateTime: number;
	gameVersionId: number;
	regionId: number;
	sequenceNum: number;
	rank: number;
	bracket: number;
	endDateTime: number;
	pickBans: PickBan[];
	players: Player[];
	analysisOutcome: number;
	predictedOutcomeWeight: number;
	bottomLaneOutcome: number;
	midLaneOutcome: number;
	topLaneOutcome: number;
	radiantNetworthLead: number[];
	radiantExperienceLead: number[];
	radiantKills: number[];
	direKills: number[];
	towerStatus: TowerStatus[];
	laneReport: LaneReport;
	winRates: number[];
	predictedWinRates: number[];
	towerDeaths: TowerDeath[];
	chatEvents: ChatEvent[];
	didRequestDownload: boolean;
};

export interface ChatEvent {
	time: number;
	type: number;
	fromHeroId?: number;
	value: number;
	pausedTick: number;
	isRadiant: boolean;
	toHeroId?: number;
}

export interface LaneReport {
	radiant: Dire[];
	dire: Dire[];
}

export interface Dire {
	midLane: Lane;
	offLane: Lane;
	safeLane: Lane;
}

export interface Lane {
	meleeCount: number;
	rangeCount: number;
	siegeCount: number;
	denyCount: number;
	zincCount: number;
}

export interface PickBan {
	isPick: boolean;
	heroId?: number;
	bannedHeroId?: number;
	isRadiant?: boolean;
	playerIndex?: number;
	wasBannedSuccessfully?: boolean;
	order?: number;
	baseWinRate?: number;
	adjustedWinRate?: number;
}

export interface Player {
	matchId: number;
	playerSlot: number;
	heroId: number;
	steamAccountId: number;
	isRadiant: boolean;
	numKills: number;
	numDeaths: number;
	numAssists: number;
	leaverStatus: number;
	numLastHits: number;
	numDenies: number;
	goldPerMinute: number;
	experiencePerMinute: number;
	level: number;
	gold: number;
	goldSpent: number;
	heroDamage: number;
	towerDamage: number;
	partyId: number;
	isRandom: boolean;
	lane: number;
	intentionalFeeding: boolean;
	role: number;
	imp: number;
	award: number;
	item0Id: number;
	item1Id: number;
	item2Id: number;
	item3Id?: number;
	item4Id: number;
	item5Id: number;
	backpack0Id?: number;
	behavior: number;
	heroHealing: number;
	roamLane: number;
	abilities: Ability[];
	isVictory: boolean;
	networth: number;
	zinc0Id: number;
	dotaPlusHeroXp: number;
	invisibleSeconds: number;
	stats: Stats;
	steamAccount: SteamAccount;
	backpack1Id?: number;
	streakPrediction?: number;
}

export interface Ability {
	abilityId: number;
	time: number;
	level: number;
}

export interface Stats {
	steamAccountId: number;
	matchId: number;
	gameVersionId: number;
	abilityCastReport: AbilityCastReport[];
	actionReport: { [key: string]: number };
	actionsPerMin: number[];
	allTalk: AllTalk[];
	assistEvents: AssistEvent[];
	buffEvents: BuffEvent[];
	campStackPerMin: number[];
	chatWheels: ChatWheel[];
	courierKills: CourierKill[];
	deathEvents: DeathEvent[];
	denyPerMin: number[];
	experiencePerMinMin: number[];
	farmDistributionReport: FarmDistributionReport;
	goldPerMinMin: number[];
	healPerMin: number[];
	heroDamagePerMin: number[];
	heroDamageReceivedPerMin: number[];
	heroDamageReport: HeroDamageReport;
	impPerMin: number[];
	inventoryReport: InventoryReport[];
	itemPurchases: ItemPurchase[];
	itemUsed: ItemUsed[];
	killEvents: KillEvent[];
	lastHitPerMin: number[];
	levelsPerMin: number[];
	locationReport: LocationReport[];
	networthPerMin: number[];
	runeEvents: RuneEvent[];
	towerDamagePerMin: number[];
	towerDamageReport: TowerDamageReport[];
	tripsFountainPerMin: number[];
	wardPlaced: CourierKill[];
	wardDestruction: WardDestruction[];
}

export interface AbilityCastReport {
	abilityId: number;
	count: number;
	targets: Target[];
}

export interface Target {
	target: number;
	count: number;
	damage: number;
}

export interface AllTalk {
	time: number;
	message: string;
	pausedTick: number;
}

export interface AssistEvent {
	time: number;
	target: number;
	gold: number;
	xp: number;
	X?: number;
	Y?: number;
}

export interface BuffEvent {
	time: number;
	itemId?: number;
	abilityId?: number;
	stackCount?: number;
}

export interface ChatWheel {
	time: number;
	chatWheelId: number;
	pauseTick: number;
}

export interface CourierKill {
	time: number;
	X: number;
	Y: number;
	type?: number;
}

export interface DeathEvent {
	time: number;
	target: number;
	goldFed: number;
	xp: number;
	timeDead: number;
	x: number;
	y: number;
	goldLost: number;
	assist: number[];
	isWardWalkThrough: boolean;
	isAttemptTpOut: boolean;
	isDieBack: boolean;
	isBurst: boolean;
	isEngagedOnDeath: boolean;
	hasHealAvailable: boolean;
	isTracked: boolean;
	attacker?: number;
	abilityId?: number;
	itemId?: number;
}

export interface FarmDistributionReport {
	creepType: BountyGold[];
	creepLocation: BountyGold[];
	zincLocation: BountyGold[];
	ancientLocation: BountyGold[];
	buildings: BountyGold[];
	buyBackGold: number;
	abandonGold: number;
	bountyGold: BountyGold;
	other: BountyGold[];
}

export interface BountyGold {
	id: number;
	count: number;
	gold: number;
	xp?: number;
}

export interface HeroDamageReport {
	dealtTotal: { [key: string]: number };
	receivedTotal: { [key: string]: number };
	dealtTargets: DealtTargetElement[];
	receivedTargets: DealtTargetElement[];
	dealtSourceAbility: SourceAbility[];
	receivedSourceAbility: SourceAbility[];
	dealtSourceItem: SourceItem[];
	receivedSourceItem: SourceItem[];
}

export interface SourceAbility {
	abilityId: number;
	count: number;
	amount: number;
}

export interface SourceItem {
	itemId: number;
	count: number;
	amount: number;
}

export interface DealtTargetElement {
	target: number;
	amount: number;
}

export interface InventoryReport {
	item0?: BackPack0;
	item1?: BackPack0;
	item2?: BackPack0;
	item3?: BackPack0;
	item4?: BackPack0;
	item5?: BackPack0;
	backPack0?: BackPack0;
	backPack1?: BackPack0;
	backPack2?: BackPack2;
	zinc0?: zinc0;
}

export interface BackPack0 {
	itemId: number;
	charges?: number;
	secondaryCharges?: number;
}

export interface BackPack2 {
	itemId: number;
	charges?: number;
}

export interface zinc0 {
	itemId: number;
}

export interface ItemPurchase {
	time: number;
	itemId: number;
}

export interface ItemUsed {
	itemId: number;
	count: number;
}

export interface KillEvent {
	time: number;
	target: number;
	itemId?: number;
	gold: number;
	xp: number;
	X: number;
	Y: number;
	isSolo: boolean;
	isGank: boolean;
	isInvisible: boolean;
	isSmoke: boolean;
	isTpRecently: boolean;
	abilityId?: number;
}

export interface LocationReport {
	X: number;
	Y: number;
}

export interface RuneEvent {
	time: number;
	type: number;
	action: number;
	x: number;
	y: number;
}

export interface TowerDamageReport {
	npcId: number;
	damage: number;
	damageFromAbility: number;
	damageCreeps: number;
}

export interface WardDestruction {
	time: number;
	experience?: number;
	isWard: boolean;
	gold?: number;
}

export interface SteamAccount {
	id: number;
	lastActiveTime?: Date;
	profileUri: string;
	timeCreated?: number;
	cityId?: number;
	communityVisibleState?: number;
	name: string;
	avatar: string;
	primaryClanId?: number;
	soloRank?: number;
	partyRank?: number;
	isDotaPlusSubscriber: boolean;
	dotaPlusOriginalStartDate: number;
	isAnonymous: boolean;
	isStratzPublic: boolean;
	seasonRank: number;
	smurfFlag: number;
	smurfCheckDate: number;
	lastMatchDateTime?: number;
	lastMatchRegionId?: number;
	dotaAccountLevel: number;
	realName?: string;
	countryCode?: string;
	seasonLeaderboardDivisionId?: number;
	stateCode?: string;
}

export interface TowerDeath {
	time: number;
	npcId: number;
	isRadiant: boolean;
	attacker?: number;
}

export interface TowerStatus {
	towers: Tower[];
	outposts: Outpost[];
}

export interface Outpost {
	npcId: number;
	isRadiantSide: boolean;
	isControlledByRadiant: boolean;
}

export interface Tower {
	npcId: number;
	hp: number;
}
