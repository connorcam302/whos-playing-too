<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import {
		HERO_SCORE_MAX,
		HERO_SCORE_BAYESIAN_PRIOR_MATCHES,
		HERO_SCORE_CENTERING_OFFSET,
		HERO_SCORE_CONFIDENCE_PRIOR_MATCHES,
		HERO_SCORE_HISTORICAL_PERFORMANCE_WEIGHT,
		HERO_SCORE_HISTORICAL_EVIDENCE_CAP,
		HERO_SCORE_IMPACT_WEIGHT,
		HERO_SCORE_KDA_WEIGHT,
		HERO_SCORE_NEUTRAL,
		HERO_SCORE_PERFORMANCE_PULSE_HALF_LIFE_MATCHES,
		HERO_SCORE_PERFORMANCE_PULSE_MAX,
		HERO_SCORE_RECENT_HALF_LIFE_MATCHES,
		HERO_SCORE_RECENT_INACTIVITY_HALF_LIFE_DAYS,
		HERO_SCORE_RECENT_FORM_WEIGHT,
		HERO_SCORE_RECENT_FORM_REGRESSION_FACTOR,
		HERO_SCORE_RECENT_PERFORMANCE_WEIGHT,
		HERO_SCORE_RECENCY_HALF_LIFE_DAYS,
		HERO_SCORE_SPREAD_FACTOR,
		HERO_SCORE_UNCERTAINTY_PENALTY_MAX,
		HERO_SCORE_VOLUME_WEIGHT,
		HERO_SCORE_VOLUME_FULL_MATCHES,
		HERO_SCORE_WIN_RATE_WEIGHT,
		formatHeroScore,
		getHeroScoreBreakdown,
		getHeroScoreGroupName,
		getHeroScoreGroupPrior,
		type HeroScoreBreakdown,
		type HeroScoreGroup
	} from '$lib/heroScores';
	import { ArrowLeftRight, ChevronDown } from 'lucide-svelte';

	type PlayerRanking = {
		playerId: number;
		username: string;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		recentForm: string;
		kda: number;
		avgImpact: number;
		scoreWinRate: number;
		scoreRecentRate: number;
		scoreKda: number;
		scoreAvgImpact: number;
		performancePulse: number;
		volumeScore: number;
		sampleWeight: number;
		effectiveMatches: number;
		score: number;
		confidence: string;
		primaryRole: number;
		scoreGroup: HeroScoreGroup;
	};

	type Props = {
		heroName: string;
		heroImg: string;
		players: PlayerRanking[];
		scopeLabel?: string;
		subjectLabel?: string;
		selectedPlayerId?: number | null;
		selectedScoreGroup?: HeroScoreGroup | null;
		open?: boolean;
	};

	type MetricComparison = {
		key: string;
		label: string;
		weight: string;
		description: string;
		selectedValue: string;
		comparisonValue: string;
		selectedPercent: number;
		comparisonPercent: number;
		selectedPoints: number;
		comparisonPoints: number;
		barClass: string;
	};

	type ContributionSegment = {
		key: string;
		label: string;
		selectedPoints: number;
		comparisonPoints: number;
		max: number;
		barClass: string;
	};

	let {
		heroName,
		heroImg,
		players,
		scopeLabel = 'Overall',
		subjectLabel = 'hero',
		selectedPlayerId = null,
		selectedScoreGroup = null,
		open = $bindable(false)
	}: Props = $props();
	let primaryPlayerId = $state('');
	let comparisonPlayerId = $state('');
	let highlightedMetricKey = $state<string | null>(null);
	const subjectLabelTitle = $derived(
		`${subjectLabel.charAt(0).toUpperCase()}${subjectLabel.slice(1)}`
	);

	const formatNumber = (value: number | null | undefined, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value ?? 0);

	const formatPercent = (value: number | null | undefined) => `${formatNumber(value, 1)}%`;
	const historicalPerformancePercent = Math.round(HERO_SCORE_HISTORICAL_PERFORMANCE_WEIGHT * 100);
	const recentPerformancePercent = Math.round(HERO_SCORE_RECENT_PERFORMANCE_WEIGHT * 100);
	const winRateWeightPercent = HERO_SCORE_WIN_RATE_WEIGHT * 100;
	const recentFormWeightPercent = HERO_SCORE_RECENT_FORM_WEIGHT * 100;
	const impactWeightPercent = HERO_SCORE_IMPACT_WEIGHT * 100;
	const kdaWeightPercent = HERO_SCORE_KDA_WEIGHT * 100;
	const volumeWeightPercent = HERO_SCORE_VOLUME_WEIGHT * 100;
	const winRateMaxPoints = HERO_SCORE_WIN_RATE_WEIGHT * HERO_SCORE_MAX;
	const recentFormMaxPoints = HERO_SCORE_RECENT_FORM_WEIGHT * HERO_SCORE_MAX;
	const impactMaxPoints = HERO_SCORE_IMPACT_WEIGHT * HERO_SCORE_MAX;
	const kdaMaxPoints = HERO_SCORE_KDA_WEIGHT * HERO_SCORE_MAX;
	const volumeMaxPoints = HERO_SCORE_VOLUME_WEIGHT * HERO_SCORE_MAX;
	const recencyHalfLifeYears = HERO_SCORE_RECENCY_HALF_LIFE_DAYS / 365;
	const recentInactivityHalfLifeYears = HERO_SCORE_RECENT_INACTIVITY_HALF_LIFE_DAYS / 365;
	const recencyExamples = [
		{ label: 'Now', years: 0 },
		{ label: '1 year', years: 1 },
		{ label: '2 years', years: 2 },
		{ label: '4 years', years: 4 },
		{ label: '8 years', years: 8 }
	].map((example) => ({
		...example,
		weight: 0.5 ** (example.years / recencyHalfLifeYears) * 100
	}));

	const getRecentWinRate = (player: PlayerRanking) => player.scoreRecentRate;

	const getBestValue = (accessor: (player: PlayerRanking) => number) =>
		Math.max(0, ...players.map(accessor));

	const getMetricClass = (value: number, bestValue: number) =>
		value === bestValue ? 'font-semibold text-zinc-100' : 'text-zinc-400';

	const getPlayerBreakdown = (player: PlayerRanking): HeroScoreBreakdown =>
		getHeroScoreBreakdown({
			winRate: player.scoreWinRate,
			recentRate: getRecentWinRate(player),
			avgImpact: player.scoreAvgImpact,
			kda: player.scoreKda,
			matches: player.matches,
			effectiveMatches: player.effectiveMatches,
			performancePulse: player.performancePulse,
			prior: getHeroScoreGroupPrior(player.scoreGroup)
		});
	const getRatedRecentWinRate = (player: PlayerRanking) =>
		getPlayerBreakdown(player).adjustedMetrics.recentRate;

	const capPercent = (value: number) => Math.min(100, Math.max(0, value));

	const formatPointDelta = (selectedPoints: number, comparisonPoints: number) => {
		const delta = selectedPoints - comparisonPoints;
		if (Math.abs(delta) < 0.05) return 'Even';
		return `${delta > 0 ? '+' : '−'}${formatNumber(Math.abs(delta), 1)} pts`;
	};
	const formatSignedPoints = (value: number) =>
		`${value > 0 ? '+' : value < 0 ? '−' : '±'}${formatNumber(Math.abs(value), 1)}`;

	const getPlayerKey = (player: PlayerRanking) => `${player.playerId}:${player.scoreGroup}`;
	const getPlayerByKey = (playerKey: string) =>
		players.find((player) => getPlayerKey(player) === playerKey);

	const getPlayerSelectLabel = (playerKey: string) => {
		const index = players.findIndex((player) => getPlayerKey(player) === playerKey);
		const player = players[index];
		return player
			? `#${index + 1} ${player.username} · ${getHeroScoreGroupName(player.scoreGroup)}`
			: 'Select player';
	};

	const swapPlayers = () => {
		const previousPrimaryPlayerId = primaryPlayerId;
		primaryPlayerId = comparisonPlayerId;
		comparisonPlayerId = previousPrimaryPlayerId;
	};

	const changePrimaryPlayer = (nextPlayerId: string) => {
		if (nextPlayerId === comparisonPlayerId) {
			swapPlayers();
			return;
		}
		primaryPlayerId = nextPlayerId;
	};

	const changeComparisonPlayer = (nextPlayerId: string) => {
		if (nextPlayerId === primaryPlayerId) {
			swapPlayers();
			return;
		}
		comparisonPlayerId = nextPlayerId;
	};

	const getDefaultComparisonPlayer = (playerKey: string) =>
		players.find((player) => getPlayerKey(player) !== playerKey);

	const selectPrimaryPlayer = (playerKey: string) => {
		const selectedPlayer = getPlayerByKey(playerKey);
		const defaultComparisonPlayer = getDefaultComparisonPlayer(playerKey);

		primaryPlayerId = selectedPlayer ? getPlayerKey(selectedPlayer) : '';
		comparisonPlayerId = defaultComparisonPlayer
			? getPlayerKey(defaultComparisonPlayer)
			: primaryPlayerId;
		highlightedMetricKey = null;
	};

	$effect(() => {
		if (open) {
			const initialPrimaryPlayer =
				players.find(
					(player) =>
						player.playerId === selectedPlayerId &&
						(selectedScoreGroup === null || player.scoreGroup === selectedScoreGroup)
				) ?? players[0];
			selectPrimaryPlayer(initialPrimaryPlayer ? getPlayerKey(initialPrimaryPlayer) : '');
		}
	});

	const leader = $derived(players[0] ?? null);
	const selectedPlayer = $derived(
		getPlayerByKey(primaryPlayerId) ?? leader
	);
	const comparisonPlayer = $derived(
		getPlayerByKey(comparisonPlayerId) ?? (players[1] ?? leader)
	);
	const selectedRank = $derived(
		selectedPlayer
			? players.findIndex((player) => getPlayerKey(player) === getPlayerKey(selectedPlayer)) + 1
			: 0
	);
	const comparisonRank = $derived(
		comparisonPlayer
			? players.findIndex((player) => getPlayerKey(player) === getPlayerKey(comparisonPlayer)) + 1
			: 0
	);
	const scoreDifference = $derived(
		selectedPlayer && comparisonPlayer ? selectedPlayer.score - comparisonPlayer.score : 0
	);
	const selectedBreakdown = $derived(
		selectedPlayer ? getPlayerBreakdown(selectedPlayer) : null
	);
	const comparisonBreakdown = $derived(
		comparisonPlayer ? getPlayerBreakdown(comparisonPlayer) : null
	);
	const contributionSegments = $derived.by((): ContributionSegment[] => {
		if (!selectedBreakdown || !comparisonBreakdown) return [];
		return [
			{ key: 'winRate', label: 'Win rate', selectedPoints: selectedBreakdown.contributions.winRate, comparisonPoints: comparisonBreakdown.contributions.winRate, max: winRateMaxPoints, barClass: 'bg-chart-1' },
			{ key: 'recentForm', label: 'Recent form', selectedPoints: selectedBreakdown.contributions.recentForm, comparisonPoints: comparisonBreakdown.contributions.recentForm, max: recentFormMaxPoints, barClass: 'bg-chart-5' },
			{ key: 'impact', label: 'Impact', selectedPoints: selectedBreakdown.contributions.impact, comparisonPoints: comparisonBreakdown.contributions.impact, max: impactMaxPoints, barClass: 'bg-purple-600' },
			{ key: 'kda', label: 'KDA', selectedPoints: selectedBreakdown.contributions.kda, comparisonPoints: comparisonBreakdown.contributions.kda, max: kdaMaxPoints, barClass: 'bg-chart-2' },
			{ key: 'volume', label: 'Match volume', selectedPoints: selectedBreakdown.contributions.volume, comparisonPoints: comparisonBreakdown.contributions.volume, max: volumeMaxPoints, barClass: 'bg-chart-4' }
		].filter(({ max }) => max > 0);
	});

	const getSegmentHighlightClass = (metricKey: string) => {
		if (!highlightedMetricKey) return 'opacity-100';
		return highlightedMetricKey === metricKey ? 'brightness-125 opacity-100' : 'opacity-25';
	};

	const getMetricHighlightClass = (metricKey: string) => {
		if (!highlightedMetricKey) return 'opacity-100';
		return highlightedMetricKey === metricKey
			? 'bg-zinc-900/70 opacity-100'
			: 'opacity-35';
	};
	const metricComparisons = $derived.by((): MetricComparison[] => {
		if (!selectedPlayer || !comparisonPlayer || !selectedBreakdown || !comparisonBreakdown) {
			return [];
		}

		const selectedRecentRate = selectedBreakdown.adjustedMetrics.recentRate;
		const comparisonRecentRate = comparisonBreakdown.adjustedMetrics.recentRate;

		return [
			{
				key: 'winRate',
				label: 'Scoring win rate',
				weight: `${formatNumber(winRateWeightPercent, 1)}% · ${formatNumber(winRateMaxPoints)} max points`,
				description: `${historicalPerformancePercent}% time-weighted history plus ${recentPerformancePercent}% from the latest 20 games.`,
				selectedValue: formatPercent(selectedPlayer.scoreWinRate),
				comparisonValue: formatPercent(comparisonPlayer.scoreWinRate),
				selectedPercent: selectedPlayer.scoreWinRate,
				comparisonPercent: comparisonPlayer.scoreWinRate,
				selectedPoints: selectedBreakdown.contributions.winRate,
				comparisonPoints: comparisonBreakdown.contributions.winRate,
				barClass: 'bg-chart-1'
			},
			{
				key: 'recentForm',
				label: 'Rated recent form',
				weight: `${formatNumber(recentFormWeightPercent, 1)}% · ${formatNumber(recentFormMaxPoints)} max points`,
				description: `Latest-10 win rate, with ${formatNumber((1 - HERO_SCORE_RECENT_FORM_REGRESSION_FACTOR) * 100)}% of its deviation regressed toward 50% to reduce small-window noise.`,
				selectedValue: formatPercent(selectedRecentRate),
				comparisonValue: formatPercent(comparisonRecentRate),
				selectedPercent: selectedRecentRate,
				comparisonPercent: comparisonRecentRate,
				selectedPoints: selectedBreakdown.contributions.recentForm,
				comparisonPoints: comparisonBreakdown.contributions.recentForm,
				barClass: 'bg-chart-5'
			},
			{
				key: 'impact',
				label: 'Average impact',
				weight: `${formatNumber(impactWeightPercent, 1)}% · ${formatNumber(impactMaxPoints)} max points`,
				description: `${historicalPerformancePercent}% time-weighted history plus ${recentPerformancePercent}% from the latest 20 games, then adjusted against the Core or Support baseline.`,
				selectedValue: `${formatNumber(selectedPlayer.scoreAvgImpact)} raw · ${formatNumber(selectedBreakdown.adjustedMetrics.normalizedImpact)} rated`,
				comparisonValue: `${formatNumber(comparisonPlayer.scoreAvgImpact)} raw · ${formatNumber(comparisonBreakdown.adjustedMetrics.normalizedImpact)} rated`,
				selectedPercent: selectedBreakdown.impactScore,
				comparisonPercent: comparisonBreakdown.impactScore,
				selectedPoints: selectedBreakdown.contributions.impact,
				comparisonPoints: comparisonBreakdown.contributions.impact,
				barClass: 'bg-purple-600'
			},
			{
				key: 'kda',
				label: 'KDA',
				weight: `${formatNumber(kdaWeightPercent, 1)}% · ${formatNumber(kdaMaxPoints)} max points`,
				description: `${historicalPerformancePercent}% time-weighted history plus ${recentPerformancePercent}% recent KDA, then adjusted against the Core or Support baseline.`,
				selectedValue: `${formatNumber(selectedPlayer.scoreKda, 2)} raw · ${formatNumber(selectedBreakdown.adjustedMetrics.kda, 2)} rated`,
				comparisonValue: `${formatNumber(comparisonPlayer.scoreKda, 2)} raw · ${formatNumber(comparisonBreakdown.adjustedMetrics.kda, 2)} rated`,
				selectedPercent: selectedBreakdown.kdaScore,
				comparisonPercent: comparisonBreakdown.kdaScore,
				selectedPoints: selectedBreakdown.contributions.kda,
				comparisonPoints: comparisonBreakdown.contributions.kda,
				barClass: 'bg-chart-2'
			},
			{
				key: 'volume',
				label: 'Match volume',
				weight: `${formatNumber(volumeWeightPercent, 1)}% · ${formatNumber(volumeMaxPoints)} max points`,
				description: `A logarithmic experience curve reaches its maximum at ${HERO_SCORE_VOLUME_FULL_MATCHES} matches.`,
				selectedValue: `${selectedPlayer.matches} matches`,
				comparisonValue: `${comparisonPlayer.matches} matches`,
				selectedPercent: selectedBreakdown.volumeScore,
				comparisonPercent: comparisonBreakdown.volumeScore,
				selectedPoints: selectedBreakdown.contributions.volume,
				comparisonPoints: comparisonBreakdown.contributions.volume,
				barClass: 'bg-chart-4'
			}
		];
	});
	const bestWinRate = $derived(getBestValue((player) => player.scoreWinRate));
	const bestRecentWinRate = $derived(getBestValue(getRatedRecentWinRate));
	const bestImpact = $derived(getBestValue((player) => player.scoreAvgImpact));
	const bestKda = $derived(getBestValue((player) => player.scoreKda));
	const mostMatches = $derived(getBestValue((player) => player.matches));
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex max-h-[min(92vh,900px)] w-[min(96vw,1120px)] max-w-none grid-rows-none flex-col gap-0 overflow-hidden rounded-md border-border bg-card p-0 shadow-2xl shadow-black/60"
	>
		<Dialog.Header class="shrink-0 border-b border-border px-4 py-3 pr-12 text-left sm:px-5">
			<div class="flex min-w-0 items-center gap-3">
				<img
					src={heroImg}
					alt=""
					class="h-10 w-16 shrink-0 rounded-sm border border-zinc-700 object-cover"
				/>
				<div class="min-w-0">
					<Dialog.Title class="truncate text-base font-semibold text-zinc-100">
						{heroName} {scopeLabel === 'Overall' ? '' : `${scopeLabel} `}{subjectLabel} scores
					</Dialog.Title>
					<Dialog.Description class="mt-0.5 text-xs text-zinc-400">
						Compare players and see where each score comes from.
					</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>

		<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
			{#if selectedPlayer && comparisonPlayer}
				<section class="border-b border-zinc-800 bg-zinc-950/45 px-4 py-3 sm:px-5 sm:py-4">
					{#if players.length > 1}
						<div class="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-end gap-2 sm:gap-3">
							<label class="min-w-0">
								<span class="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">Focus player</span>
								<Select.Root type="single" value={primaryPlayerId} onValueChange={changePrimaryPlayer}>
									<Select.Trigger aria-label="Focus player" class="h-9 border-zinc-700 bg-zinc-950 px-2.5 text-xs text-zinc-100 sm:text-sm">
										{getPlayerSelectLabel(primaryPlayerId)}
									</Select.Trigger>
									<Select.Content class="border-zinc-700 bg-popover">
									{#each players as player, index (getPlayerKey(player))}
										<Select.Item value={getPlayerKey(player)} label={`${player.username} ${getHeroScoreGroupName(player.scoreGroup)}`}>
											<div class="flex w-full items-center justify-between gap-5">
												<span>#{index + 1} {player.username} <span class="text-zinc-500">· {getHeroScoreGroupName(player.scoreGroup)}</span></span>
													<span class="tabular-nums text-zinc-500">{formatHeroScore(player.score)}</span>
												</div>
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</label>

							<button
								type="button"
								onclick={swapPlayers}
								class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 text-zinc-400 outline-none transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-ring"
								aria-label="Swap compared players"
								title="Swap players"
							>
								<ArrowLeftRight class="h-3.5 w-3.5" />
							</button>

							<label class="min-w-0">
								<span class="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">Compare with</span>
								<Select.Root type="single" value={comparisonPlayerId} onValueChange={changeComparisonPlayer}>
									<Select.Trigger aria-label="Compare with" class="h-9 border-zinc-700 bg-zinc-950 px-2.5 text-xs text-zinc-100 sm:text-sm">
										{getPlayerSelectLabel(comparisonPlayerId)}
									</Select.Trigger>
									<Select.Content class="border-zinc-700 bg-popover">
									{#each players as player, index (getPlayerKey(player))}
										<Select.Item value={getPlayerKey(player)} label={`${player.username} ${getHeroScoreGroupName(player.scoreGroup)}`}>
											<div class="flex w-full items-center justify-between gap-5">
												<span>#{index + 1} {player.username} <span class="text-zinc-500">· {getHeroScoreGroupName(player.scoreGroup)}</span></span>
													<span class="tabular-nums text-zinc-500">{formatHeroScore(player.score)}</span>
												</div>
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</label>
						</div>
					{/if}

					<div class="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-t border-zinc-800 pt-3 sm:mt-4 sm:gap-6 sm:pt-4">
						<div class="min-w-0">
							<div class="truncate text-xs font-medium text-zinc-300">{selectedPlayer.username} · {getHeroScoreGroupName(selectedPlayer.scoreGroup)}</div>
							<div class="mt-0.5 text-2xl font-semibold tabular-nums text-zinc-100">{formatHeroScore(selectedPlayer.score)}</div>
							<div class="text-[11px] text-zinc-500">Rank #{selectedRank} · {selectedPlayer.matches} matches</div>
						</div>
						<div class="text-center">
							<div class="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium tabular-nums text-zinc-300 sm:px-3">
								{scoreDifference === 0 ? 'Scores level' : `${formatHeroScore(Math.abs(scoreDifference))} point gap`}
							</div>
							{#if scoreDifference !== 0}
								<div class="mt-1 text-[10px] text-zinc-500">{scoreDifference > 0 ? 'Focus leads' : 'Comparison leads'}</div>
							{/if}
						</div>
						<div class="min-w-0 text-right">
							<div class="truncate text-xs font-medium text-zinc-400">{comparisonPlayer.username} · {getHeroScoreGroupName(comparisonPlayer.scoreGroup)}</div>
							<div class="mt-0.5 text-2xl font-semibold tabular-nums text-zinc-300">{formatHeroScore(comparisonPlayer.score)}</div>
							<div class="text-[11px] text-zinc-500">Rank #{comparisonRank} · {comparisonPlayer.matches} matches</div>
						</div>
					</div>
				</section>
			{/if}

			{#if selectedPlayer && comparisonPlayer && selectedBreakdown && comparisonBreakdown}
				<section class="grid border-b border-zinc-800 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
					<div class="px-4 py-4 sm:px-5 lg:border-r lg:border-zinc-800">
						<div>
							<h3 class="text-sm font-semibold text-zinc-100">Score composition</h3>
							<p class="mt-0.5 text-xs text-zinc-500">Each component’s contribution to the 1,000-point score.</p>
						</div>

						<div class="mt-4 grid gap-3">
							<div>
								<div class="mb-1.5 flex items-baseline justify-between gap-3">
									<span class="truncate text-xs font-medium text-zinc-200">{selectedPlayer.username} · {getHeroScoreGroupName(selectedPlayer.scoreGroup)}</span>
									<span class="shrink-0 text-sm font-semibold tabular-nums text-zinc-100">{formatHeroScore(selectedBreakdown.score)} <span class="text-[10px] font-normal text-zinc-600">/ 1,000</span></span>
								</div>
								<div
									class="flex h-3 overflow-hidden rounded-sm bg-zinc-900"
									role="group"
									aria-label={`${selectedPlayer.username} ${getHeroScoreGroupName(selectedPlayer.scoreGroup)} score composition`}
								>
									{#each contributionSegments as segment}
										<button
											type="button"
											class="h-full {segment.barClass} {getSegmentHighlightClass(segment.key)} outline-none transition-[filter,opacity] duration-150 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-100"
											style:width={`${(segment.selectedPoints / HERO_SCORE_MAX) * 100}%`}
											onmouseenter={() => (highlightedMetricKey = segment.key)}
											onmouseleave={() => (highlightedMetricKey = null)}
											onfocus={() => (highlightedMetricKey = segment.key)}
											onblur={() => (highlightedMetricKey = null)}
											aria-label={`${segment.label}: ${formatNumber(segment.selectedPoints, 1)} points for ${selectedPlayer.username} ${getHeroScoreGroupName(selectedPlayer.scoreGroup)}`}
											title={`${segment.label}: ${formatNumber(segment.selectedPoints, 1)} points`}
										></button>
									{/each}
								</div>
							</div>

							<div>
								<div class="mb-1.5 flex items-baseline justify-between gap-3">
									<span class="truncate text-xs font-medium text-zinc-400">{comparisonPlayer.username} · {getHeroScoreGroupName(comparisonPlayer.scoreGroup)}</span>
									<span class="shrink-0 text-sm font-semibold tabular-nums text-zinc-300">{formatHeroScore(comparisonBreakdown.score)} <span class="text-[10px] font-normal text-zinc-600">/ 1,000</span></span>
								</div>
								<div
									class="flex h-3 overflow-hidden rounded-sm bg-zinc-900"
									role="group"
									aria-label={`${comparisonPlayer.username} ${getHeroScoreGroupName(comparisonPlayer.scoreGroup)} score composition`}
								>
									{#each contributionSegments as segment}
										<button
											type="button"
											class="h-full {segment.barClass} {getSegmentHighlightClass(segment.key)} outline-none transition-[filter,opacity] duration-150 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-100"
											style:width={`${(segment.comparisonPoints / HERO_SCORE_MAX) * 100}%`}
											onmouseenter={() => (highlightedMetricKey = segment.key)}
											onmouseleave={() => (highlightedMetricKey = null)}
											onfocus={() => (highlightedMetricKey = segment.key)}
											onblur={() => (highlightedMetricKey = null)}
											aria-label={`${segment.label}: ${formatNumber(segment.comparisonPoints, 1)} points for ${comparisonPlayer.username} ${getHeroScoreGroupName(comparisonPlayer.scoreGroup)}`}
											title={`${segment.label}: ${formatNumber(segment.comparisonPoints, 1)} points`}
										></button>
									{/each}
								</div>
							</div>
						</div>

						<div class="mt-4 grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] border-y border-zinc-800 text-xs">
							<div class="py-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600">Metric</div>
							<div class="truncate px-1 py-1.5 text-right text-[10px] font-medium uppercase tracking-wide text-zinc-600" title={`${selectedPlayer.username} · ${getHeroScoreGroupName(selectedPlayer.scoreGroup)}`}>{selectedPlayer.username} · {getHeroScoreGroupName(selectedPlayer.scoreGroup)}</div>
							<div class="truncate py-1.5 text-right text-[10px] font-medium uppercase tracking-wide text-zinc-600" title={`${comparisonPlayer.username} · ${getHeroScoreGroupName(comparisonPlayer.scoreGroup)}`}>{comparisonPlayer.username} · {getHeroScoreGroupName(comparisonPlayer.scoreGroup)}</div>
							{#each contributionSegments as segment}
								<div class="flex min-w-0 items-center gap-2 border-t border-zinc-800 py-1.5 text-zinc-400 {highlightedMetricKey === segment.key ? 'font-medium text-zinc-100' : ''}">
									<span class="h-2 w-2 shrink-0 rounded-sm {segment.barClass}"></span>
									<span class="truncate">{segment.label}</span>
									<span class="text-[10px] text-zinc-600">/ {segment.max}</span>
								</div>
								<div class="border-t border-zinc-800 px-1 py-1.5 text-right font-medium tabular-nums {highlightedMetricKey === segment.key ? 'text-zinc-100' : 'text-zinc-300'}">{formatNumber(segment.selectedPoints, 1)}</div>
								<div class="border-t border-zinc-800 py-1.5 text-right font-medium tabular-nums {highlightedMetricKey === segment.key ? 'text-zinc-100' : 'text-zinc-400'}">{formatNumber(segment.comparisonPoints, 1)}</div>
							{/each}
							<div class="border-t border-zinc-700 py-2 text-xs font-semibold text-zinc-200">{subjectLabelTitle} score</div>
							<div class="border-t border-zinc-700 px-1 py-2 text-right text-sm font-semibold tabular-nums text-zinc-100">{formatHeroScore(selectedBreakdown.score)}</div>
							<div class="border-t border-zinc-700 py-2 text-right text-sm font-semibold tabular-nums text-zinc-300">{formatHeroScore(comparisonBreakdown.score)}</div>
						</div>

					</div>

					<div class="border-t border-zinc-800 px-4 py-4 sm:px-5 lg:border-t-0">
						<div>
							<h3 class="text-sm font-semibold text-zinc-100">Metric comparison</h3>
							<p class="mt-0.5 text-xs text-zinc-500">Performance is confidence-weighted; match volume uses its own logarithmic curve.</p>
						</div>

						<div class="mt-2 border-y border-zinc-800">
							{#each metricComparisons as metric}
								<div class="border-b border-zinc-800 px-2 py-2.5 transition-[background-color,opacity] duration-150 last:border-b-0 {getMetricHighlightClass(metric.key)}">
									<div class="flex items-baseline justify-between gap-3">
										<div class="min-w-0">
											<h4 class="truncate text-xs font-semibold text-zinc-200">{metric.label}</h4>
											<div class="text-[10px] text-zinc-600">{metric.weight}</div>
										</div>
										<div class="shrink-0 text-[11px] font-medium tabular-nums {metric.selectedPoints >= metric.comparisonPoints ? 'text-zinc-300' : 'text-zinc-500'}">
											{formatPointDelta(metric.selectedPoints, metric.comparisonPoints)}
										</div>
									</div>
									<div class="mt-1.5 grid gap-1.5">
										<div class="grid grid-cols-[minmax(5.5rem,1fr)_minmax(4rem,1.25fr)_4rem] items-center gap-2 text-[11px]">
											<span class="truncate {metric.selectedPoints >= metric.comparisonPoints ? 'font-medium text-zinc-200' : 'text-zinc-500'}">{selectedPlayer.username} · {getHeroScoreGroupName(selectedPlayer.scoreGroup)} · {metric.selectedValue}</span>
											<div class="h-2 overflow-hidden rounded-full bg-zinc-900"><div class="h-full rounded-full {metric.selectedPoints >= metric.comparisonPoints ? metric.barClass : 'bg-zinc-600'}" style:width={`${capPercent(metric.selectedPercent)}%`}></div></div>
											<span class="text-right tabular-nums {metric.selectedPoints >= metric.comparisonPoints ? 'font-medium text-zinc-200' : 'text-zinc-500'}">{formatNumber(metric.selectedPoints, 1)}</span>
										</div>
										<div class="grid grid-cols-[minmax(5.5rem,1fr)_minmax(4rem,1.25fr)_4rem] items-center gap-2 text-[11px]">
											<span class="truncate {metric.comparisonPoints >= metric.selectedPoints ? 'font-medium text-zinc-200' : 'text-zinc-500'}">{comparisonPlayer.username} · {getHeroScoreGroupName(comparisonPlayer.scoreGroup)} · {metric.comparisonValue}</span>
											<div class="h-2 overflow-hidden rounded-full bg-zinc-900"><div class="h-full rounded-full {metric.comparisonPoints >= metric.selectedPoints ? metric.barClass : 'bg-zinc-600'}" style:width={`${capPercent(metric.comparisonPercent)}%`}></div></div>
											<span class="text-right tabular-nums {metric.comparisonPoints >= metric.selectedPoints ? 'font-medium text-zinc-200' : 'text-zinc-500'}">{formatNumber(metric.comparisonPoints, 1)}</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</section>

				<details class="group border-b border-zinc-800 bg-zinc-950/25">
					<summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 outline-none transition-colors hover:bg-zinc-900/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 [&::-webkit-details-marker]:hidden">
						<div>
							<div class="text-xs font-semibold text-zinc-200">How {subjectLabel} scores are calculated</div>
							<div class="mt-0.5 text-[11px] text-zinc-500">Formula, performance blend, and recency weighting</div>
						</div>
						<ChevronDown class="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-180" />
					</summary>
					<div class="grid gap-4 border-t border-zinc-800 px-4 py-4 sm:px-5 lg:grid-cols-2">
						<div>
							<div class="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Exact formula</div>
							<p class="mt-1.5 font-mono text-[11px] leading-5 text-zinc-300">
								<span class="block">Performance = confidence × (30% win rate + 10% form + 25% impact + 15% KDA)</span>
								<span class="block">{subjectLabelTitle} score = performance + 20% match volume</span>
							</p>
							<p class="mt-2 text-[11px] leading-4 text-zinc-500">Confidence reaches 100% at 24 matches. Volume reaches its 200-point maximum at {HERO_SCORE_VOLUME_FULL_MATCHES} matches. Latest-10 form is regressed halfway toward 50%, while impact and KDA are normalised for Core and Support.</p>
						</div>
						<div>
							<div class="flex items-baseline justify-between gap-2">
							<div class="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Performance blend</div>
								<div class="text-[10px] tabular-nums text-zinc-500">Latest 20 matches</div>
							</div>
							<div class="mt-2 flex h-2 overflow-hidden rounded-full bg-zinc-900" role="img" aria-label={`${historicalPerformancePercent}% time-weighted history and ${recentPerformancePercent}% latest-20 performance`}>
								<div class="h-full bg-zinc-500" style:width={`${historicalPerformancePercent}%`}></div>
								<div class="h-full bg-chart-3" style:width={`${recentPerformancePercent}%`}></div>
							</div>
							<div class="mt-1.5 flex justify-between gap-3 text-[10px]">
								<span class="text-zinc-500">{historicalPerformancePercent}% time-weighted history</span>
								<span class="text-right text-zinc-400">{recentPerformancePercent}% recent performance</span>
							</div>
							<div class="mt-4 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Recency curve</div>
							<p class="mt-1 text-[11px] leading-4 text-zinc-500">Performance influence halves every {recencyHalfLifeYears} years. Once history reaches {HERO_SCORE_HISTORICAL_EVIDENCE_CAP} effective games, each new match gradually replaces the oldest accumulated influence.</p>
							<div class="mt-2.5 grid grid-cols-5 gap-2" aria-label="Example game weights by age">
								{#each recencyExamples as example}
									<div class="min-w-0">
										<div class="flex items-baseline justify-between gap-1 text-[10px]"><span class="truncate text-zinc-500">{example.label}</span><span class="font-medium tabular-nums text-zinc-300">{formatNumber(example.weight)}%</span></div>
										<div class="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-900"><div class="h-full rounded-full bg-chart-3" style:width={`${example.weight}%`}></div></div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</details>
			{/if}

			<div class="flex flex-col gap-1 border-b border-zinc-800 px-4 py-3 sm:flex-row sm:items-end sm:justify-between sm:px-5">
				<div>
					<h3 class="text-sm font-semibold text-zinc-100">All calibrated players</h3>
					<p class="mt-0.5 text-xs text-zinc-500">Select a name to make that player the focus.</p>
				</div>
				<div class="text-[11px] text-zinc-500">Best values are bold</div>
			</div>
			<div class="overflow-x-auto">
				<Table.Root class="min-w-[820px]">
					<Table.Header class="bg-zinc-950/70">
						<Table.Row class="border-zinc-800 hover:bg-transparent">
							<Table.Head class="h-9 w-10 px-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">#</Table.Head>
							<Table.Head class="h-9 min-w-36 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Player</Table.Head>
							<Table.Head class="h-9 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Group</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Score</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Gap</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Matches</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">W/L</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Scoring WR</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Recent</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Impact</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">KDA</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
					{#each players as player, index (getPlayerKey(player))}
							{@const recentWinRate = getRatedRecentWinRate(player)}
							<Table.Row class="border-zinc-900 transition-colors hover:bg-zinc-900/70 {getPlayerKey(player) === (selectedPlayer ? getPlayerKey(selectedPlayer) : '') ? 'bg-zinc-800/60' : getPlayerKey(player) === (comparisonPlayer ? getPlayerKey(comparisonPlayer) : '') ? 'bg-zinc-900/80' : ''}">
								<Table.Cell class="px-2 py-2.5 text-center text-xs font-medium tabular-nums text-zinc-500">{index + 1}</Table.Cell>
								<Table.Cell class="px-2 py-2.5 font-medium text-zinc-100">
									<button type="button" onclick={() => selectPrimaryPlayer(getPlayerKey(player))} class="rounded-sm text-left outline-none transition-colors hover:text-zinc-300 focus-visible:ring-2 focus-visible:ring-ring" aria-pressed={getPlayerKey(player) === (selectedPlayer ? getPlayerKey(selectedPlayer) : '')}>
										{player.username}
										{#if getPlayerKey(player) === (selectedPlayer ? getPlayerKey(selectedPlayer) : '')}<span class="ml-1 rounded-sm bg-zinc-700 px-1 py-0.5 text-[9px] font-semibold text-zinc-200">Focus</span>{:else if getPlayerKey(player) === (comparisonPlayer ? getPlayerKey(comparisonPlayer) : '')}<span class="ml-1 rounded-sm border border-zinc-700 px-1 py-0.5 text-[9px] font-semibold text-zinc-500">Compare</span>{/if}
									</button>
								</Table.Cell>
								<Table.Cell class="px-2 py-2.5 text-xs font-medium text-zinc-400">{getHeroScoreGroupName(player.scoreGroup)}</Table.Cell>
								<Table.Cell class="px-2 py-2.5 text-right tabular-nums">
									<button
										type="button"
									onclick={() => selectPrimaryPlayer(getPlayerKey(player))}
										class="ml-auto block rounded-sm text-base font-semibold text-zinc-100 underline decoration-zinc-700 decoration-dotted underline-offset-4 outline-none transition-colors hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-ring"
									aria-label={`Compare ${player.username}'s ${getHeroScoreGroupName(player.scoreGroup)} score with ${getDefaultComparisonPlayer(getPlayerKey(player))?.username ?? player.username}`}
									>
										{formatHeroScore(player.score)}
									</button>
								</Table.Cell>
								<Table.Cell class="px-2 py-2.5 text-right text-xs tabular-nums text-zinc-500">{index === 0 ? 'Leader' : `−${formatHeroScore(leader ? leader.score - player.score : 0)}`}</Table.Cell>
								<Table.Cell class="px-2 py-2.5 text-right tabular-nums {getMetricClass(player.matches, mostMatches)}">{player.matches}</Table.Cell>
								<Table.Cell class="px-2 py-2.5 text-right tabular-nums"><span class="text-green-400">{player.wins}</span><span class="text-zinc-600">/</span><span class="text-red-400">{player.losses}</span></Table.Cell>
								<Table.Cell class="px-2 py-2.5 text-right tabular-nums {getMetricClass(player.scoreWinRate, bestWinRate)}">{formatPercent(player.scoreWinRate)}</Table.Cell>
								<Table.Cell class="px-2 py-2.5 text-right tabular-nums {getMetricClass(recentWinRate, bestRecentWinRate)}">{formatPercent(recentWinRate)}</Table.Cell>
								<Table.Cell class="px-2 py-2.5 text-right tabular-nums {getMetricClass(player.scoreAvgImpact, bestImpact)}">{formatNumber(player.scoreAvgImpact)}</Table.Cell>
								<Table.Cell class="px-2 py-2.5 text-right tabular-nums {getMetricClass(player.scoreKda, bestKda)}">{formatNumber(player.scoreKda, 2)}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>

			<div class="border-t border-zinc-800 px-4 py-3 text-[11px] leading-4 text-zinc-500 sm:px-5">
				Players calibrate after 10 matches. Scores begin near neutral, confidence grows continuously, and mastery never decreases.
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
