import dayjs from 'dayjs';

export type StackAnalysisRow = {
	playerId: number;
	username: string;
	matchId: number;
	startTime: number;
	winner: string;
	team: string;
	role: number;
	heroId: number;
	heroName: string;
	heroImg?: string;
	heroScore?: number;
};

export type StackSlot = {
	role: number;
	playerId: number | null;
	playerName: string;
	heroId: number | null;
	heroName: string;
	heroIcon?: string;
};

export type PlayerContribution = {
	slot: StackSlot;
	selected: boolean;
	value: number;
	delta: number;
	components: {
		label: string;
		value: number;
		delta: number;
		sample: number;
		enabled: boolean;
	}[];
};

export type StackEstimateEvidence = {
	label: string;
	value: number;
	weight: number;
	sample: number;
	note: string;
};

export type StackEstimate = {
	value: number;
	baseline: number;
	delta: number;
	confidence: number;
	stackGames: number;
	exactDrafts: number;
	entries: StackEstimateEvidence[];
};

export type HeroRecommendation = {
	heroId: number;
	heroName: string;
	heroIcon?: string;
	score: number;
	winRate: number;
	matches: number;
	roleMatches: number;
	teamMatches: number;
	alliedHeroMatches: number;
	playerRoleScore: number;
	teammateScore: number;
	alliedHeroScore: number;
	isWorstPick: boolean;
	reason: string;
};

export const HERO_RECOMMENDATION_WEIGHTS = {
	playerRole: 0.6,
	teammates: 0.2,
	alliedHeroes: 0.2
} as const;

export type PlayerWeightGroup = {
	label?: string;
	contributions: PlayerContribution[];
	estimate?: StackEstimate;
};

type Sample = {
	matches: number;
	wins: number;
	winRate: number;
};

type MatchStackPlayer = {
	role: number;
	hero_id: number;
	hero?: {
		name: string;
		img: string;
	};
	user?: {
		id: number;
		username: string;
	};
};

type MatchStackTeam = {
	label: string;
	players: MatchStackPlayer[];
};

const heroRecommendationCache = new WeakMap<
	StackAnalysisRow[],
	Map<string, HeroRecommendation[]>
>();

const sampleFromRows = (rows: StackAnalysisRow[]): Sample => {
	const matches = rows.length;
	const wins = rows.filter((row) => row.team === row.winner).length;
	return {
		matches,
		wins,
		winRate: matches > 0 ? (wins / matches) * 100 : 50
	};
};

const sampleFromSides = (sides: StackAnalysisRow[][]): Sample => {
	const wins = sides.filter((side) => side[0]?.team === side[0]?.winner).length;
	return {
		matches: sides.length,
		wins,
		winRate: sides.length > 0 ? (wins / sides.length) * 100 : 50
	};
};

const confidenceFor = (sample: number, target: number) => Math.max(0, Math.min(1, sample / target));

const weightedRate = (sample: Sample, fallback: number, target: number) => {
	const confidence = confidenceFor(sample.matches, target);
	return fallback + (sample.winRate - fallback) * confidence;
};

const average = (values: number[], fallback: number) =>
	values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const uniqueNumbers = (values: number[]) => Array.from(new Set(values));
const makeHeroIcon = (img?: string) => img?.replace('/heroes/', '/heroes/icons/');

const groupRowsBySide = (rows: StackAnalysisRow[]) => {
	const sideMap = rows.reduce((map, row) => {
		const sideKey = `${row.matchId}:${row.team}`;
		const side = map.get(sideKey) ?? [];
		side.push(row);
		map.set(sideKey, side);
		return map;
	}, new Map<string, StackAnalysisRow[]>());
	return Array.from(sideMap.values());
};

export const getHeroRecommendations = (
	rows: StackAnalysisRow[],
	playerId: number | null,
	role: number,
	teammateIds: number[],
	alliedHeroIds: number[],
	limit = 5
): HeroRecommendation[] => {
	if (playerId === null) return [];
	const sortedTeammateIds = [...teammateIds].sort((a, b) => a - b);
	const sortedAlliedHeroIds = [...alliedHeroIds].sort((a, b) => a - b);
	const cacheKey = `${playerId}:${role}:${sortedTeammateIds.join(',')}:${sortedAlliedHeroIds.join(',')}:${limit}`;
	const rowsCache = heroRecommendationCache.get(rows) ?? new Map<string, HeroRecommendation[]>();
	const cached = rowsCache.get(cacheKey);
	if (cached) return cached;
	if (!heroRecommendationCache.has(rows)) heroRecommendationCache.set(rows, rowsCache);

	const sides = groupRowsBySide(rows);
	const baseline = sampleFromSides(sides);
	const teammateSet = new Set(teammateIds.filter((id) => id !== playerId));
	const alliedHeroSet = new Set(alliedHeroIds);
	const playerRows = rows.filter((row) => row.playerId === playerId);
	const candidateIds = uniqueNumbers(
		playerRows.filter((row) => row.role === role).map((row) => row.heroId)
	);
	const fallbackCandidateIds = uniqueNumbers(playerRows.map((row) => row.heroId));
	const heroIds = (
		candidateIds.length >= limit
			? candidateIds
			: uniqueNumbers([...candidateIds, ...fallbackCandidateIds])
	).filter((heroId) => !alliedHeroSet.has(heroId));

	const recommendations = heroIds
		.map((heroId): HeroRecommendation | null => {
			const heroRows = playerRows.filter((row) => row.heroId === heroId);
			const roleRows = heroRows.filter((row) => row.role === role);
			const teamSides = sides.filter((side) => {
				const candidate = side.find(
					(row) => row.playerId === playerId && row.heroId === heroId && row.role === role
				);
				return candidate && side.some((row) => teammateSet.has(row.playerId));
			});
			const alliedHeroSamples = sortedAlliedHeroIds.map((alliedHeroId) =>
				sampleFromSides(
					sides.filter(
						(side) =>
							side.some((row) => row.heroId === heroId && row.role === role) &&
							side.some((row) => row.heroId === alliedHeroId)
					)
				)
			);
			const alliedHeroSides = sides.filter(
				(side) =>
					side.some((row) => row.heroId === heroId && row.role === role) &&
					side.some((row) => alliedHeroSet.has(row.heroId))
			);
			const heroSample = sampleFromRows(heroRows);
			const roleSample = sampleFromRows(roleRows);
			const hero = heroRows[0];
			if (!hero) return null;
			const scoredRoleRow = roleRows.find((row) => row.heroScore !== undefined);
			const playerRoleScore = clamp(
				(scoredRoleRow?.heroScore ?? weightedRate(roleSample, baseline.winRate, 8) * 10) / 10,
				0,
				100
			);
			const teammateSamples = sortedTeammateIds
				.filter((teammateId) => teammateId !== playerId)
				.map((teammateId) =>
					sampleFromSides(
						sides.filter(
							(side) =>
								side.some(
									(row) =>
										row.playerId === playerId && row.heroId === heroId && row.role === role
								) && side.some((row) => row.playerId === teammateId)
						)
					)
				);
			const teammateScore = average(
				teammateSamples.map((sample) => weightedRate(sample, baseline.winRate, 6)),
				baseline.winRate
			);
			const alliedHeroScore = average(
				alliedHeroSamples.map((sample) => weightedRate(sample, baseline.winRate, 8)),
				baseline.winRate
			);
			const score =
				playerRoleScore * HERO_RECOMMENDATION_WEIGHTS.playerRole +
				teammateScore * HERO_RECOMMENDATION_WEIGHTS.teammates +
				alliedHeroScore * HERO_RECOMMENDATION_WEIGHTS.alliedHeroes;
			const reason =
				alliedHeroSides.length > 0
					? `${alliedHeroSides.length} game${alliedHeroSides.length === 1 ? '' : 's'} alongside current picks`
					: teamSides.length >= 2
					? `${teamSides.length} games with this lobby`
					: roleRows.length >= 3
						? `${roleRows.length} games in position ${role}`
						: `${heroRows.length} comfort games`;

			return {
				heroId,
				heroName: hero.heroName,
				heroIcon: makeHeroIcon(hero.heroImg),
				score,
				winRate: roleRows.length > 0 ? roleSample.winRate : heroSample.winRate,
				matches: heroRows.length,
				roleMatches: roleRows.length,
				teamMatches: teamSides.length,
				alliedHeroMatches: alliedHeroSides.length,
				playerRoleScore,
				teammateScore,
				alliedHeroScore,
				isWorstPick: false,
				reason
			};
		})
		.filter((recommendation): recommendation is HeroRecommendation => recommendation !== null)
		.sort((a, b) => b.score - a.score || b.roleMatches - a.roleMatches || b.matches - a.matches);
	const bestPickCount = Math.min(limit, Math.max(0, recommendations.length - 1));
	const bestPicks = recommendations.slice(0, bestPickCount);
	const worstPick = recommendations.at(-1);
	const displayedRecommendations =
		worstPick && recommendations.length > 1
			? [...bestPicks, { ...worstPick, isWorstPick: true }]
			: recommendations;
	rowsCache.set(cacheKey, displayedRecommendations);
	return displayedRecommendations;
};

export const getPlayerContributions = (
	rows: StackAnalysisRow[],
	slots: StackSlot[],
	now = Date.now()
): PlayerContribution[] => {
	const baseline = sampleFromSides(groupRowsBySide(rows));
	const recentFloor = dayjs(now).subtract(60, 'day').unix();

	return slots.map((slot) => {
		const selected = slot.playerId !== null;
		const heroRows =
			selected && slot.heroId !== null
				? rows.filter((row) => row.playerId === slot.playerId && row.heroId === slot.heroId)
				: [];
		const roleRows = selected
			? rows.filter((row) => row.playerId === slot.playerId && row.role === slot.role)
			: [];
		const recentRows = selected
			? rows.filter((row) => row.playerId === slot.playerId && row.startTime >= recentFloor)
			: [];
		const heroSample = sampleFromRows(heroRows);
		const roleSample = sampleFromRows(roleRows);
		const recentSample = sampleFromRows(recentRows);
		const components = [
			{
				label: 'Hero',
				value: weightedRate(heroSample, baseline.winRate, 12),
				delta: weightedRate(heroSample, baseline.winRate, 12) - baseline.winRate,
				sample: heroSample.matches,
				enabled: selected && slot.heroId !== null
			},
			{
				label: 'Role',
				value: weightedRate(roleSample, baseline.winRate, 20),
				delta: weightedRate(roleSample, baseline.winRate, 20) - baseline.winRate,
				sample: roleSample.matches,
				enabled: selected
			},
			{
				label: 'Form',
				value: weightedRate(recentSample, baseline.winRate, 12),
				delta: weightedRate(recentSample, baseline.winRate, 12) - baseline.winRate,
				sample: recentSample.matches,
				enabled: selected
			}
		];
		const activeComponents = components.filter((component) => component.enabled);
		const value = average(
			activeComponents.map((component) => component.value),
			baseline.winRate
		);

		return {
			slot,
			selected,
			value,
			delta: selected ? value - baseline.winRate : 0,
			components
		};
	});
};

export const getStackEstimate = (
	rows: StackAnalysisRow[],
	slots: StackSlot[],
	now = Date.now()
): StackEstimate => {
	const sides = groupRowsBySide(rows);
	const baseline = sampleFromSides(sides);
	const selectedSlots = slots.filter((slot) => slot.playerId !== null);
	const selectedPlayerIds = selectedSlots.map((slot) => slot.playerId as number);
	const requiredPlayerIds = uniqueNumbers(selectedPlayerIds);
	const selectedStackSides =
		requiredPlayerIds.length >= 2
			? sides.filter((side) => {
					const sidePlayerIds = new Set(side.map((row) => row.playerId));
					return requiredPlayerIds.every((playerId) => sidePlayerIds.has(playerId));
				})
			: [];
	const exactDraftSides = selectedStackSides.filter((side) =>
		selectedSlots.every((slot) =>
			side.some(
				(row) =>
					row.playerId === slot.playerId &&
					(slot.heroId === null || row.heroId === slot.heroId) &&
					row.role === slot.role
			)
		)
	);
	const recentFloor = dayjs(now).subtract(60, 'day').unix();
	const playerHeroEvidence = selectedSlots
		.filter((slot) => slot.heroId !== null)
		.map((slot) => {
			const sample = sampleFromRows(
				rows.filter((row) => row.playerId === slot.playerId && row.heroId === slot.heroId)
			);
			return weightedRate(sample, baseline.winRate, 12);
		});
	const roleEvidence = selectedSlots.map((slot) => {
		const sample = sampleFromRows(
			rows.filter((row) => row.playerId === slot.playerId && row.role === slot.role)
		);
		return weightedRate(sample, baseline.winRate, 20);
	});
	const heroEvidence = slots
		.filter((slot) => slot.heroId !== null)
		.map((slot) => {
			const sample = sampleFromRows(
				rows.filter((row) => row.heroId === slot.heroId && row.role === slot.role)
			);
			return weightedRate(sample, baseline.winRate, 25);
		});
	const recentEvidence = selectedSlots.map((slot) => {
		const sample = sampleFromRows(
			rows.filter((row) => row.playerId === slot.playerId && row.startTime >= recentFloor)
		);
		return weightedRate(sample, baseline.winRate, 12);
	});
	const exactDraftSample = sampleFromSides(exactDraftSides);
	const stackSample = sampleFromSides(selectedStackSides);
	const entries: StackEstimateEvidence[] = [
		{
			label: 'Group baseline',
			value: baseline.winRate,
			weight: 1,
			sample: baseline.matches,
			note: 'All matching team sides'
		},
		{
			label: 'Stack history',
			value: weightedRate(stackSample, baseline.winRate, 10),
			weight: selectedPlayerIds.length >= 2 ? 1.6 : 0,
			sample: stackSample.matches,
			note: 'Same selected players together'
		},
		{
			label: 'Exact draft history',
			value: weightedRate(exactDraftSample, baseline.winRate, 4),
			weight: exactDraftSample.matches > 0 ? 1.4 : 0,
			sample: exactDraftSample.matches,
			note: 'Same players on these heroes and roles'
		},
		{
			label: 'Player hero comfort',
			value: average(playerHeroEvidence, baseline.winRate),
			weight: playerHeroEvidence.length > 0 ? 1.5 : 0,
			sample: playerHeroEvidence.length,
			note: 'Each player on their selected hero'
		},
		{
			label: 'Role fit',
			value: average(roleEvidence, baseline.winRate),
			weight: roleEvidence.length > 0 ? 1 : 0,
			sample: roleEvidence.length,
			note: 'Each player in the selected position'
		},
		{
			label: 'Hero role form',
			value: average(heroEvidence, baseline.winRate),
			weight: heroEvidence.length > 0 ? 0.8 : 0,
			sample: heroEvidence.length,
			note: 'Heroes in these positions across the group'
		},
		{
			label: 'Recent player form',
			value: average(recentEvidence, baseline.winRate),
			weight: recentEvidence.length > 0 ? 0.7 : 0,
			sample: recentEvidence.length,
			note: 'Last 60 days for selected players'
		}
	].filter((entry) => entry.weight > 0);
	const weightedTotal = entries.reduce((sum, entry) => sum + entry.value * entry.weight, 0);
	const weightTotal = entries.reduce((sum, entry) => sum + entry.weight, 0);
	const raw = weightTotal > 0 ? weightedTotal / weightTotal : baseline.winRate;
	const completedSlots = slots.filter(
		(slot) => slot.playerId !== null && slot.heroId !== null
	).length;
	const completedDraftRatio = completedSlots / 5;
	const confidence =
		(requiredPlayerIds.length >= 2 ? clamp(selectedStackSides.length / 12, 0, 0.3) : 0) +
		clamp(playerHeroEvidence.length / 5, 0, 0.2) +
		(requiredPlayerIds.length >= 2
			? clamp(exactDraftSides.length / 4, 0, 0.2) * completedDraftRatio
			: 0) +
		clamp(completedDraftRatio, 0, 0.25);
	const value = clamp(raw, 5, 95);

	return {
		value,
		baseline: baseline.winRate,
		delta: value - baseline.winRate,
		confidence: clamp(confidence, 0.1, 1),
		stackGames: selectedStackSides.length,
		exactDrafts: exactDraftSides.length,
		entries
	};
};

export const getMatchPlayerWeightGroups = (
	rows: StackAnalysisRow[],
	teams: MatchStackTeam[]
): PlayerWeightGroup[] => {
	const visiblePlayerIds = new Set(rows.map((row) => row.playerId));

	return teams
		.map((team) => {
			const players = team.players.filter(
				(player) => player.user && visiblePlayerIds.has(player.user.id)
			);
			const slots = [1, 2, 3, 4, 5].map((role): StackSlot => {
				const player = players.find((entry) => entry.role === role);
				return {
					role,
					playerId: player?.user?.id ?? null,
					playerName: player?.user?.username ?? 'Select player',
					heroId: player?.hero_id ?? null,
					heroName: player?.hero?.name ?? 'Select hero',
					heroIcon: makeHeroIcon(player?.hero?.img)
				};
			});

			return {
				label: team.label,
				playerCount: players.length,
				contributions: getPlayerContributions(rows, slots),
				estimate: getStackEstimate(rows, slots)
			};
		})
		.filter((group) => group.playerCount > 0)
		.map(({ label, contributions, estimate }) => ({ label, contributions, estimate }));
};
