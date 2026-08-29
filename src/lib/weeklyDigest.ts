export type WeeklyDigestCategory =
	| 'record'
	| 'streak'
	| 'match'
	| 'poo'
	| 'calibration'
	| 'overtake'
	| 'role';

export type WeeklyDigestTone = 'positive' | 'negative' | 'neutral';

export type WeeklyDigestHighlight = 'hero-claimed' | 'role-claimed';

export type WeeklyDigestMetric = {
	label: string;
	value: string;
};

export type WeeklyDigestItem = {
	id: string;
	category: WeeklyDigestCategory;
	tone: WeeklyDigestTone;
	highlight?: WeeklyDigestHighlight;
	badge: string;
	title: string;
	summary: string;
	href: string;
	image?: string;
	imageAlt?: string;
	primaryMetric: WeeklyDigestMetric;
	secondaryMetric?: WeeklyDigestMetric;
	sampleSize?: number;
	lowSample?: boolean;
	occurredAt: number;
	priority: number;
	evidenceKey: string;
	entityKey?: string;
};

export type WeeklyDigest = {
	status: 'ready' | 'partial' | 'empty' | 'error';
	items: WeeklyDigestItem[];
	period: {
		start: number;
		end: number;
		label: string;
		comparisonLabel: string;
	};
	matchCount: number;
	updatedAt: number;
	sourceErrors: string[];
};

export const rankWeeklyDigestItems = (items: WeeklyDigestItem[]) => {
	const ranked = items
		.slice()
		.sort(
			(a, b) => b.occurredAt - a.occurredAt || b.priority - a.priority || a.id.localeCompare(b.id)
		);
	const selected: WeeklyDigestItem[] = [];
	const evidence = new Set<string>();

	for (const item of ranked) {
		if (evidence.has(item.evidenceKey)) continue;

		selected.push(item);
		evidence.add(item.evidenceKey);
	}

	return selected;
};
