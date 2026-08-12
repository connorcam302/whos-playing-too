export type WeeklyDigestCategory =
	| 'record'
	| 'ownership'
	| 'form'
	| 'hero-score'
	| 'streak'
	| 'match';

export type WeeklyDigestTone = 'positive' | 'negative' | 'neutral';

export type WeeklyDigestMetric = {
	label: string;
	value: string;
};

export type WeeklyDigestItem = {
	id: string;
	category: WeeklyDigestCategory;
	tone: WeeklyDigestTone;
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

const categoryLimits: Record<WeeklyDigestCategory, number> = {
	record: 2,
	ownership: 2,
	form: 2,
	'hero-score': 2,
	streak: 1,
	match: 1
};

export const rankWeeklyDigestItems = (items: WeeklyDigestItem[], limit = 8) => {
	const ranked = items
		.slice()
		.sort(
			(a, b) => b.priority - a.priority || b.occurredAt - a.occurredAt || a.id.localeCompare(b.id)
		);
	const selected: WeeklyDigestItem[] = [];
	const evidence = new Set<string>();
	const categoryCounts = new Map<WeeklyDigestCategory, number>();
	const entityCounts = new Map<string, number>();

	for (const item of ranked) {
		if (selected.length >= limit) break;
		if (evidence.has(item.evidenceKey)) continue;
		if ((categoryCounts.get(item.category) ?? 0) >= categoryLimits[item.category]) continue;
		if (item.entityKey && (entityCounts.get(item.entityKey) ?? 0) >= 2) continue;

		selected.push(item);
		evidence.add(item.evidenceKey);
		categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
		if (item.entityKey) {
			entityCounts.set(item.entityKey, (entityCounts.get(item.entityKey) ?? 0) + 1);
		}
	}

	return selected.sort(
		(a, b) => b.occurredAt - a.occurredAt || b.priority - a.priority || a.id.localeCompare(b.id)
	);
};
