declare interface DotaAsset {
	id: number;
	name: string;
	img: string;
}

declare interface Stats {
	hero?: number;
	playerId?: string;
	player: string;
	matches: number;
	radiantWins: number;
	direWins: number;
	avgImpact: number;
}

declare interface PlayerData {
	id: number;
	username: string;
	owner: number;
	accountId: number;
	smurf: boolean;
	playerId: number;
	matchId: number;
	heroId: number;
	team: 'radiant' | 'dire';
	kills: number;
	deaths: number;
	assists: number;
	item0: DotaAsset;
	item1: DotaAsset;
	item2: DotaAsset;
	item3: DotaAsset;
	item4: DotaAsset;
	item5: DotaAsset;
	backpack0: DotaAsset;
	backpack1: DotaAsset;
	backpack2: DotaAsset;
	aghanimsScepter: number;
	aghanimsShard: number;
	goldPerMin: number;
	lastHits: number;
	xpPerMin: number;
	itemzinc: DotaAsset;
	role: number;
	impact: number;
	hero: DotaAsset;
}
