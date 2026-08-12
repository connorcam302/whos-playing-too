<script lang="ts">
	import { ChevronDown, Swords } from 'lucide-svelte';
	import {
		formatCompactNumber,
		matchChartPalette,
		type MatchEconomySection,
		type MatchLaneOutcome,
		type MatchOverview,
		type MatchPlayerOverview
	} from '$lib/match-page';
	import MatchLineChart from './MatchLineChart.svelte';

	interface Props {
		match: MatchOverview;
	}

	let { match }: Props = $props();

	type MomentumMetric = 'win' | 'gold' | 'experience' | 'networth';
	let metric = $state<MomentumMetric>('win');
	let fallbackNetworth = $state<Record<number, number[]> | null>(null);
	let networthLoading = $state(false);
	let networthError = $state(false);
	const radiantSeriesColors = [
		'oklch(0.78 0.17 145)',
		'oklch(0.76 0.14 170)',
		'oklch(0.74 0.12 195)',
		'oklch(0.72 0.13 220)',
		'oklch(0.70 0.14 245)'
	];
	const direSeriesColors = [
		'oklch(0.72 0.17 25)',
		'oklch(0.75 0.15 50)',
		'oklch(0.70 0.17 5)',
		'oklch(0.70 0.15 330)',
		'oklch(0.69 0.15 300)'
	];

	const getLeadSummary = (values: number[]) => {
		if (values.length === 0) return { radiant: 0, dire: 0 };
		return {
			radiant: Math.max(0, ...values),
			dire: Math.abs(Math.min(0, ...values))
		};
	};

	const networthLeads = $derived(getLeadSummary(match.series.radiantNetworthLeads));
	const experienceLeads = $derived(getLeadSummary(match.series.radiantExperienceLeads));
	const leadRows = $derived([
		{ label: 'Gold', radiant: networthLeads.radiant, dire: networthLeads.dire },
		{ label: 'Experience', radiant: experienceLeads.radiant, dire: experienceLeads.dire }
	]);
	const awardedPlayers = $derived(match.players.filter((player) => player.award));
	const pickedHeroes = $derived(match.draft.filter((entry) => entry.isPick));
	const bannedHeroes = $derived(match.draft.filter((entry) => !entry.isPick));
	const isAllPick = $derived(match.gameMode.toLowerCase().includes('all pick'));
	const radiantPicks = $derived(pickedHeroes.filter((entry) => entry.team === 'radiant'));
	const direPicks = $derived(pickedHeroes.filter((entry) => entry.team === 'dire'));
	const unassignedPicks = $derived(pickedHeroes.filter((entry) => entry.team === null));
	const allPickPhases = $derived([
		{ label: 'Phase 1', radiant: radiantPicks.slice(0, 2), dire: direPicks.slice(0, 2) },
		{ label: 'Phase 2', radiant: radiantPicks.slice(2, 4), dire: direPicks.slice(2, 4) },
		{ label: 'Phase 3', radiant: radiantPicks.slice(4, 5), dire: direPicks.slice(4, 5) }
	]);
	const playerNetworthSeries = $derived.by(() => {
		let radiantIndex = 0;
		let direIndex = 0;
		return match.players.map((player) => {
			const teamIndex = player.isRadiant ? radiantIndex++ : direIndex++;
			const colors = player.isRadiant ? radiantSeriesColors : direSeriesColors;
			return {
				player,
				label: player.user ? player.name : player.hero.name,
				data:
					player.networthPerMinute?.length > 0
						? player.networthPerMinute
						: (fallbackNetworth?.[player.playerSlot] ?? []),
				color: colors[teamIndex % colors.length]
			};
		});
	});

	const getPhysicalLane = (player: MatchPlayerOverview): MatchLaneOutcome['lane'] | null => {
		if (player.lane === 'Mid Lane' || player.positionNumber === 2) return 'Middle';
		if (player.lane === 'Safe Lane') return player.isRadiant ? 'Bottom' : 'Top';
		if (player.lane === 'Off Lane') return player.isRadiant ? 'Top' : 'Bottom';
		return null;
	};

	const laneRows = $derived(
		match.laneOutcomes.map((outcome) => ({
			...outcome,
			radiant: match.players
				.filter((player) => player.isRadiant && getPhysicalLane(player) === outcome.lane)
				.sort((a, b) => (a.positionNumber ?? 9) - (b.positionNumber ?? 9)),
			dire: match.players
				.filter((player) => !player.isRadiant && getPhysicalLane(player) === outcome.lane)
				.sort((a, b) => (a.positionNumber ?? 9) - (b.positionNumber ?? 9))
		}))
	);

	const getLaneSideClass = (
		result: MatchLaneOutcome['result'],
		side: 'radiant' | 'dire'
	) => {
		if (result === 'draw' || result === 'unknown') {
			return 'border-zinc-800/80 bg-zinc-900/40';
		}
		return result === side
			? 'border-emerald-800/60 bg-emerald-950/45'
			: 'border-red-900/60 bg-red-950/35';
	};

	const getLaneResultLabel = (result: MatchLaneOutcome['result']) => {
		if (result === 'radiant') return 'Radiant won';
		if (result === 'dire') return 'Dire won';
		if (result === 'draw') return 'Draw';
		return 'No result';
	};

	const chartDatasets = $derived.by(() => {
		if (metric === 'networth') {
			return playerNetworthSeries.map((series) => ({
				label: series.label,
				data: series.data,
				color: series.color
			}));
		}
		if (metric === 'gold') {
			return [
				{
					label: 'Net worth lead',
					data: match.series.radiantNetworthLeads,
					color: matchChartPalette.gold,
					fillAbove: matchChartPalette.positiveFill,
					fillBelow: matchChartPalette.negativeFill
				}
			];
		}
		if (metric === 'experience') {
			return [
				{
					label: 'Experience lead',
					data: match.series.radiantExperienceLeads,
					color: matchChartPalette.experience,
					fillAbove: matchChartPalette.positiveFill,
					fillBelow: matchChartPalette.negativeFill
				}
			];
		}
		return [
			{
				label: 'Radiant win chance',
				data: match.series.winRates,
				color: matchChartPalette.primary,
				fillAbove: matchChartPalette.positiveFill,
				fillBelow: matchChartPalette.negativeFill
			}
		];
	});
	const hasChartData = $derived(
		chartDatasets.some((dataset) => Array.isArray(dataset.data) && dataset.data.length > 0)
	);
	const chartDescription = $derived(
		metric === 'networth'
			? 'All ten player economies, minute by minute.'
			: 'Minute-by-minute advantage from STRATZ.'
	);

	const loadPlayerNetworth = async (force = false) => {
		const hasOverviewSeries = match.players.some(
			(player) => (player.networthPerMinute?.length ?? 0) > 0
		);
		if (networthLoading || (!force && (hasOverviewSeries || fallbackNetworth))) return;

		networthLoading = true;
		networthError = false;
		try {
			const response = await fetch(`/api/matches/${match.id}/stratz/economy`);
			const payload = (await response.json()) as { data: MatchEconomySection | null };
			if (!response.ok || !payload.data) throw new Error('Player net worth history was unavailable.');
			fallbackNetworth = Object.fromEntries(
				payload.data.players.map((player) => [player.playerSlot, player.networthPerMinute])
			);
		} catch {
			networthError = true;
		} finally {
			networthLoading = false;
		}
	};

	const selectMetric = (value: MomentumMetric) => {
		metric = value;
		if (value === 'networth') void loadPlayerNetworth();
	};
</script>

<div class="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.85fr)]">
	<section class="min-w-0 rounded-md border border-border bg-card" aria-labelledby="momentum-heading">
		<div class="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h3 id="momentum-heading" class="text-sm font-semibold text-zinc-100">Match momentum</h3>
				<p class="mt-0.5 text-xs text-zinc-400">{chartDescription}</p>
			</div>
			<div class="inline-flex w-fit flex-wrap rounded-md border border-zinc-800 bg-zinc-950/40 p-1">
				{#each [
					{ value: 'win', label: 'Win chance' },
					{ value: 'gold', label: 'Gold lead' },
					{ value: 'experience', label: 'XP lead' },
					{ value: 'networth', label: 'Net worth' }
				] as option}
					<button
						type="button"
						onclick={() => selectMetric(option.value as MomentumMetric)}
						class={`min-h-11 rounded-sm px-3 text-sm font-medium transition-colors sm:min-h-9 sm:text-xs ${
							metric === option.value
								? 'bg-zinc-800 text-zinc-100'
								: 'text-zinc-400 hover:text-zinc-200'
						}`}
						aria-pressed={metric === option.value}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>
		<div class="p-3 sm:p-4">
			{#if metric === 'networth' && networthLoading && !hasChartData}
				<div class="h-64 animate-pulse rounded-sm bg-zinc-900/70 sm:h-72" aria-label="Loading player net worth history"></div>
			{:else if metric === 'networth' && networthError && !hasChartData}
				<div class="flex h-64 flex-col items-center justify-center gap-3 text-center sm:h-72">
					<p class="text-sm text-zinc-400">Player net worth history could not be loaded.</p>
					<button
						type="button"
						onclick={() => loadPlayerNetworth(true)}
						class="min-h-11 rounded-md border border-zinc-700 px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-9 sm:text-xs"
					>
						Try again
					</button>
				</div>
			{:else if hasChartData}
				<MatchLineChart
					datasets={chartDatasets}
					mode={metric === 'win' ? 'percent' : metric === 'networth' ? 'number' : 'lead'}
					ariaLabel={`${metric} chart over match time`}
				/>
				{#if metric === 'networth'}
					<div class="mt-3 grid gap-3 border-t border-zinc-800/80 pt-3 sm:grid-cols-2">
						{#each [true, false] as isRadiant}
							<div>
								<p class={`text-xs font-medium uppercase tracking-wider ${isRadiant ? 'text-emerald-400' : 'text-red-400'}`}>
									{isRadiant ? 'Radiant' : 'Dire'}
								</p>
								<div class="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
									{#each playerNetworthSeries.filter((series) => series.player.isRadiant === isRadiant) as series}
										<div class="flex min-w-0 items-center gap-1.5" title={`${series.player.name}, ${series.player.hero.name}`}>
											<span class="h-0.5 w-4 shrink-0 rounded-full" style:background-color={series.color}></span>
											<img src={series.player.hero.img} alt="" class="h-5 w-7 shrink-0 rounded-[2px] object-cover" />
											<span class="truncate text-xs text-zinc-400">{series.label}</span>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{:else}
					<div class="flex h-64 items-center justify-center text-sm text-zinc-400">
					{metric === 'networth' ? 'No player net worth history is available.' : 'No momentum data available.'}
				</div>
			{/if}
		</div>
	</section>

	<div class="grid content-start gap-4">
		<section class="rounded-md border border-border bg-card" aria-labelledby="lead-heading">
			<div class="border-b border-border px-4 py-3">
				<h3 id="lead-heading" class="text-sm font-semibold text-zinc-100">Peak advantages</h3>
				<p class="mt-0.5 text-xs text-zinc-400">Largest lead held by each side.</p>
			</div>
			<div class="divide-y divide-zinc-800/80">
				{#each leadRows as lead}
					{@const maximum = Math.max(1, lead.radiant, lead.dire)}
					<div class="px-4 py-3">
						<p class="text-center text-xs font-medium uppercase tracking-wide text-zinc-400">{lead.label}</p>
						<div class="mt-2 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
							<div class="text-right">
								<p class="text-xs uppercase tracking-wide text-emerald-400">Radiant</p>
								<p class="mt-0.5 text-sm font-semibold tabular-nums text-emerald-300">+{formatCompactNumber(lead.radiant)}</p>
							</div>
							<div class="h-8 w-px bg-zinc-800"></div>
							<div>
								<p class="text-xs uppercase tracking-wide text-red-400">Dire</p>
								<p class="mt-0.5 text-sm font-semibold tabular-nums text-red-300">+{formatCompactNumber(lead.dire)}</p>
							</div>
						</div>
						<div class="mt-2 grid h-1.5 grid-cols-2 gap-1" aria-hidden="true">
							<div class="flex justify-end overflow-hidden rounded-l-full bg-zinc-900">
								<div class="h-full rounded-l-full bg-emerald-500" style={`width: ${(lead.radiant / maximum) * 100}%`}></div>
							</div>
							<div class="overflow-hidden rounded-r-full bg-zinc-900">
								<div class="h-full rounded-r-full bg-red-500" style={`width: ${(lead.dire / maximum) * 100}%`}></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		{#if match.laneOutcomes.length > 0}
			<section class="rounded-md border border-border bg-card" aria-labelledby="lanes-heading">
				<div class="border-b border-border px-4 py-3">
					<h3 id="lanes-heading" class="text-sm font-semibold text-zinc-100">Lane outcomes</h3>
					<div class="mt-2 grid grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] items-center text-xs font-medium uppercase tracking-wider text-zinc-400">
						<span class="text-right">Radiant</span>
						<span class="text-center">Lane</span>
						<span>Dire</span>
					</div>
				</div>
				<div class="divide-y divide-zinc-800/80">
					{#each laneRows as lane}
						<div
							class="grid min-h-16 grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)]"
							aria-label={`${lane.lane} lane: ${getLaneResultLabel(lane.result)}`}
						>
							<div class={`flex items-center justify-end border-r px-2 py-2 ${getLaneSideClass(lane.result, 'radiant')}`}>
								{#if lane.radiant.length > 0}
									<div class="flex justify-end -space-x-2">
										{#each lane.radiant as player}
											<img
												src={player.hero.img}
												alt={`${player.hero.name}, Radiant ${lane.lane} lane`}
												title={player.hero.name}
												class="h-8 w-11 rounded-sm border border-zinc-700 object-cover shadow-sm"
											/>
										{/each}
									</div>
								{:else}
									<span class="text-xs text-zinc-400">No heroes</span>
								{/if}
							</div>
							<div class="flex flex-col items-center justify-center bg-zinc-950/35 px-1 text-center">
								<span class="text-xs font-semibold text-zinc-200">{lane.lane}</span>
								<span
								class={`mt-0.5 text-xs ${
										lane.result === 'radiant' || lane.result === 'dire'
											? 'text-zinc-400'
											: 'text-zinc-400'
									}`}
								>
									{getLaneResultLabel(lane.result)}
								</span>
							</div>
							<div class={`flex items-center border-l px-2 py-2 ${getLaneSideClass(lane.result, 'dire')}`}>
								{#if lane.dire.length > 0}
									<div class="flex -space-x-2">
										{#each lane.dire as player}
											<img
												src={player.hero.img}
												alt={`${player.hero.name}, Dire ${lane.lane} lane`}
												title={player.hero.name}
												class="h-8 w-11 rounded-sm border border-zinc-700 object-cover shadow-sm"
											/>
										{/each}
									</div>
								{:else}
									<span class="text-xs text-zinc-400">No heroes</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>

<div class="mt-4 grid gap-4 xl:grid-cols-2">
	{#if awardedPlayers.length > 0}
		<section class="rounded-md border border-border bg-card" aria-labelledby="awards-heading">
			<div class="border-b border-border px-4 py-3">
				<h3 id="awards-heading" class="text-sm font-semibold text-zinc-100">STRATZ awards</h3>
			</div>
			<div class="divide-y divide-zinc-800/80">
				{#each awardedPlayers as player}
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<div class="flex min-w-0 items-center gap-2">
							<img src={player.hero.img} alt="" class="h-8 w-12 shrink-0 rounded-sm object-cover" />
							<div class="min-w-0">
								<p class="truncate text-sm font-medium text-zinc-200">{player.user ? player.name : player.hero.name}</p>
								<p class="text-xs text-zinc-400">{player.user ? player.hero.name : 'Untracked player'}</p>
							</div>
						</div>
						<span class="rounded-sm border border-amber-900/60 bg-amber-950/30 px-2 py-1 text-xs text-amber-300">
							{player.award}
						</span>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if match.draft.length > 0}
		<section class="rounded-md border border-border bg-card" aria-labelledby="draft-heading">
			<div class="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
				<h3 id="draft-heading" class="text-sm font-semibold text-zinc-100">Draft</h3>
				<p class="text-xs text-zinc-400">{pickedHeroes.length} picks · {bannedHeroes.length} bans</p>
			</div>
			<div class="p-4">
				{#if pickedHeroes.length > 0}
					{#if isAllPick && radiantPicks.length > 0 && direPicks.length > 0}
						<p class="text-xs font-medium uppercase tracking-wide text-zinc-400">Pick phases</p>
						<div class="mt-2 divide-y divide-zinc-800/80 border-y border-zinc-800/80">
							{#each allPickPhases as phase}
								<div class="py-3 first:pt-2 last:pb-2">
									<div class="mb-2 flex items-center justify-between gap-3">
										<p class="text-sm font-semibold text-zinc-200">{phase.label}</p>
										<p class="text-xs text-zinc-400">
											{phase.label === 'Phase 3' ? '1 pick per team' : '2 picks per team'}
										</p>
									</div>
									<div class="grid grid-cols-2 gap-3">
										{#each [
											{ label: 'Radiant', picks: phase.radiant, color: 'text-emerald-400' },
											{ label: 'Dire', picks: phase.dire, color: 'text-red-400' }
										] as team}
											<div class="min-w-0">
												<p class={`mb-1.5 text-xs font-medium uppercase tracking-wide ${team.color}`}>{team.label}</p>
												<div class="space-y-1.5">
													{#each team.picks as entry}
														<div class="flex min-w-0 items-center gap-2">
															<img src={entry.hero.img} alt="" class="h-8 w-11 shrink-0 rounded-sm object-cover" />
															<span class="truncate text-sm font-medium text-zinc-200">{entry.hero.name}</span>
														</div>
													{/each}
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>

						{#if unassignedPicks.length > 0}
							<div class="mt-3">
								<p class="text-xs font-medium uppercase tracking-wide text-zinc-400">Team unavailable</p>
								<div class="mt-2 flex flex-wrap gap-3">
									{#each unassignedPicks as entry}
										<div class="flex min-w-0 items-center gap-2">
											<img src={entry.hero.img} alt="" class="h-8 w-11 shrink-0 rounded-sm object-cover" />
											<span class="text-sm text-zinc-300">{entry.hero.name}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{:else}
						<p class="text-xs font-medium uppercase tracking-wide text-zinc-400">Pick order</p>
						<ol class="mt-2 grid border-y border-zinc-800/80 sm:grid-cols-2">
							{#each pickedHeroes as entry}
								<li class="grid grid-cols-[1.5rem_2.75rem_minmax(0,1fr)] items-center gap-2 border-b border-zinc-800/80 px-2 py-2 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
									<span class="text-xs tabular-nums text-zinc-400">{entry.order + 1}</span>
									<img src={entry.hero.img} alt="" class="h-8 w-11 rounded-sm object-cover" />
									<span class="min-w-0">
										<span class="block truncate text-sm font-medium text-zinc-200">{entry.hero.name}</span>
										<span class={`text-xs capitalize ${entry.team === 'radiant' ? 'text-emerald-400' : entry.team === 'dire' ? 'text-red-400' : 'text-zinc-400'}`}>{entry.team ?? 'Unknown side'}</span>
									</span>
								</li>
							{/each}
						</ol>
					{/if}
				{/if}

				{#if bannedHeroes.length > 0}
					<details class="group mt-3">
						<summary class="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md px-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
							<span>Bans ({bannedHeroes.length})</span>
							<ChevronDown class="h-4 w-4 text-zinc-400 transition-transform duration-200 group-open:rotate-180" />
						</summary>
						<div class="grid gap-x-4 gap-y-2 border-t border-zinc-800/80 px-2 pt-3 sm:grid-cols-2">
							{#each bannedHeroes as entry}
								<div class="flex min-w-0 items-center gap-2">
									<img src={entry.hero.img} alt="" class="h-7 w-10 shrink-0 rounded-sm object-cover grayscale" />
									<span class="truncate text-sm text-zinc-400">{entry.hero.name}</span>
								</div>
							{/each}
						</div>
					</details>
				{/if}
			</div>
		</section>
	{/if}
</div>

{#if awardedPlayers.length === 0 && match.draft.length === 0}
	<div class="mt-4 flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm text-zinc-400">
		<Swords class="h-4 w-4" /> Draft and award details are not available for this match.
	</div>
{/if}
