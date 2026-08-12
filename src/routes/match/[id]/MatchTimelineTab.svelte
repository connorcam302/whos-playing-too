<script lang="ts">
	import { Eye, Gem, Landmark, Shield, Skull, Swords } from 'lucide-svelte';
	import {
		formatMatchTime,
		matchChartPalette,
		type MatchOverview,
		type MatchTimelineCategory,
		type MatchTimelineSection
	} from '$lib/match-page';
	import MatchLineChart from './MatchLineChart.svelte';

	interface Props {
		match: MatchOverview;
		data: MatchTimelineSection;
	}

	let { match, data }: Props = $props();

	type TimelineMetric = 'win' | 'gold' | 'experience';
	let metric = $state<TimelineMetric>('win');
	let categories = $state<Record<MatchTimelineCategory, boolean>>({
		combat: true,
		objective: true,
		vision: false,
		resource: false
	});

	const categoryOptions: Array<{ value: MatchTimelineCategory; label: string }> = [
		{ value: 'combat', label: 'Combat' },
		{ value: 'objective', label: 'Objectives' },
		{ value: 'vision', label: 'Vision' },
		{ value: 'resource', label: 'Resources' }
	];

	const chartDatasets = $derived.by(() => {
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

	const filteredEvents = $derived(data.events.filter((event) => categories[event.category]));

	const toggleCategory = (category: MatchTimelineCategory) => {
		categories[category] = !categories[category];
	};
</script>

<div class="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.75fr)]">
	<section class="min-w-0 rounded-md border border-border bg-card" aria-labelledby="timeline-chart-heading">
		<div class="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h3 id="timeline-chart-heading" class="text-sm font-semibold text-zinc-100">Momentum timeline</h3>
				<p class="mt-0.5 text-xs text-zinc-400">Use the event feed to explain shifts in the match.</p>
			</div>
			<div class="inline-flex w-fit rounded-md border border-zinc-800 bg-zinc-950/40 p-1">
				{#each [
					{ value: 'win', label: 'Win chance' },
					{ value: 'gold', label: 'Gold' },
					{ value: 'experience', label: 'XP' }
				] as option}
					<button
						type="button"
						onclick={() => (metric = option.value as TimelineMetric)}
						class={`min-h-11 rounded-sm px-3 text-sm font-medium transition-colors sm:min-h-9 sm:text-xs ${
							metric === option.value ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
						}`}
						aria-pressed={metric === option.value}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>
		<div class="p-3 sm:p-4">
			{#if chartDatasets[0]?.data.length}
				<MatchLineChart datasets={chartDatasets} mode={metric === 'win' ? 'percent' : 'lead'} ariaLabel={`${metric} chart over match time`} />
			{:else}
				<div class="flex h-64 items-center justify-center text-sm text-zinc-400">No timeline chart is available.</div>
			{/if}
		</div>
	</section>

	<section class="min-w-0 overflow-hidden rounded-md border border-border bg-card" aria-labelledby="event-feed-heading">
		<div class="border-b border-border px-4 py-3">
			<h3 id="event-feed-heading" class="text-sm font-semibold text-zinc-100">Event feed</h3>
			<p class="mt-0.5 text-xs text-zinc-400">{filteredEvents.length} visible events</p>
		</div>
		<div class="flex flex-wrap gap-1.5 border-b border-border p-3">
			{#each categoryOptions as category}
				<button
					type="button"
					onclick={() => toggleCategory(category.value)}
					class={`min-h-11 rounded-md border px-2.5 text-sm font-medium transition-colors sm:min-h-9 sm:text-xs ${
						categories[category.value]
							? 'border-zinc-600 bg-zinc-800 text-zinc-100'
							: 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
					}`}
					aria-pressed={categories[category.value]}
				>
					{category.label} <span class="ml-1 tabular-nums text-zinc-400">{data.counts[category.value]}</span>
				</button>
			{/each}
		</div>
		<div class="max-h-[30rem] overflow-y-auto" aria-live="polite">
			{#if filteredEvents.length > 0}
				<ol class="divide-y divide-zinc-800/70">
					{#each filteredEvents as event}
						<li class="grid grid-cols-[3rem_2rem_minmax(0,1fr)] items-start gap-2 px-3 py-2.5">
						<time class="pt-0.5 text-xs tabular-nums text-zinc-400">{formatMatchTime(event.time)}</time>
							<div
								class={`flex h-7 w-7 items-center justify-center rounded-sm ${
									event.team === 'radiant'
										? 'bg-emerald-950/45 text-emerald-300'
										: event.team === 'dire'
											? 'bg-red-950/45 text-red-300'
											: 'bg-zinc-900 text-zinc-400'
								}`}
							>
								{#if event.type === 'kill'}
									<Skull class="h-3.5 w-3.5" />
								{:else if event.type === 'tower'}
									<Landmark class="h-3.5 w-3.5" />
								{:else if event.type === 'ward' || event.type === 'deward'}
									<Eye class="h-3.5 w-3.5" />
								{:else if event.type === 'rune'}
									<Gem class="h-3.5 w-3.5" />
								{:else}
									<Shield class="h-3.5 w-3.5" />
								{/if}
							</div>
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									{#if event.hero}<img src={event.hero.img} alt="" class="h-5 w-8 rounded-[2px] object-cover" />{/if}
									<p class="text-sm text-zinc-200">{event.label}</p>
								</div>
							{#if event.detail}<p class="mt-0.5 text-xs text-zinc-400">{event.detail}</p>{/if}
							</div>
						</li>
					{/each}
				</ol>
			{:else}
				<div class="flex min-h-40 flex-col items-center justify-center gap-2 px-5 text-center text-sm text-zinc-400">
					<Swords class="h-5 w-5 text-zinc-500" />
					No events match the selected categories.
				</div>
			{/if}
		</div>
	</section>
</div>
