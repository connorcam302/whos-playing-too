export type PlayerOverviewData = {
	wins: number;
	losses: number;
	roles: { role: number; matches: number; wins: number }[];
	average: {
		avgImpact: number;
		avgKills: number;
		avgDeaths: number;
		avgAssists: number;
		avgGpm: number;
		avgXpm: number;
		avgLastHits: number;
		avgHeroDamage: number | null;
		avgTowerDamage: number | null;
	} | null;
	latestMatch: {
		id: number;
		startTime: number;
		duration: number;
		won: boolean;
		kills: number;
		deaths: number;
		assists: number;
		lastHits: number;
		heroDamage?: number | null;
		towerDamage?: number | null;
		gpm: number | null;
		xpm: number | null;
		impact: number;
		role: number;
		items: { id: number; name: string; img: string }[];
		neutralItem: { id: number; name: string; img: string } | null;
		hero: { id: number; name: string; img: string };
	} | null;
};
