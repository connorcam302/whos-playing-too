<script lang="ts">
	import dayjs from 'dayjs';
	import {
		ArrowRight,
		ChevronDown,
		ChevronUp,
		Flame,
		Gauge,
		Shuffle,
		Swords,
		TrendingUp,
		TriangleAlert,
		Trophy
	} from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import type {
		WeeklyDigest,
		WeeklyDigestCategory,
		WeeklyDigestItem,
		WeeklyDigestMetric,
		WeeklyDigestTone
	} from '$lib/weeklyDigest';

	type Props = {
		digest: WeeklyDigest;
	};

	let { digest }: Props = $props();
	let expanded = $state(false);
	const initialItemCount = 5;
	let visibleItems = $derived(expanded ? digest.items : digest.items.slice(0, initialItemCount));
	let leadItem = $derived(visibleItems[0]);
	let secondaryItems = $derived(visibleItems.slice(1));

	const getToneClasses = (tone: WeeklyDigestTone) => {
		if (tone === 'positive') return 'text-emerald-300';
		if (tone === 'negative') return 'text-rose-300';
		return 'text-sky-300';
	};

	const getCompactMetric = (item: WeeklyDigestItem): WeeklyDigestMetric =>
		item.secondaryMetric?.label.toLowerCase().includes('change')
			? item.secondaryMetric
			: item.primaryMetric;

	const getMetricUnit = (metric: WeeklyDigestMetric) => {
		if (metric.value.includes('%')) return '';
		if (metric.label.toLowerCase().includes('change')) return 'pts';
		if (metric.label === 'Hero score') return 'score';
		if (metric.label === 'Average impact') return 'impact';
		if (metric.label === 'Streak') return 'games';
		if (metric.label === 'hero damage') return 'damage';
		if (metric.label === 'Win rate') return 'WR';
		return metric.label;
	};

	const hasHeroThumbnail = (item: WeeklyDigestItem) =>
		Boolean(item.image) && ['record', 'ownership', 'hero-score'].includes(item.category);

	const getDateValue = (timestamp: number) => dayjs.unix(timestamp).format('YYYY-MM-DD');
	const getRelativeAge = (timestamp: number) => {
		const elapsedSeconds = Math.max(0, digest.updatedAt - timestamp);
		const elapsedMinutes = Math.max(1, Math.floor(elapsedSeconds / 60));
		if (elapsedMinutes < 60) {
			return `${elapsedMinutes} ${elapsedMinutes === 1 ? 'minute' : 'minutes'} ago`;
		}
		const elapsedHours = Math.floor(elapsedMinutes / 60);
		if (elapsedHours < 24) return `${elapsedHours} ${elapsedHours === 1 ? 'hour' : 'hours'} ago`;
		const elapsedDays = Math.floor(elapsedHours / 24);
		return `${elapsedDays} ${elapsedDays === 1 ? 'day' : 'days'} ago`;
	};
</script>

{#snippet categoryIcon(category: WeeklyDigestCategory)}
	{#if category === 'record'}
		<Trophy class="h-3.5 w-3.5" aria-hidden="true" />
	{:else if category === 'ownership'}
		<Shuffle class="h-3.5 w-3.5" aria-hidden="true" />
	{:else if category === 'form'}
		<TrendingUp class="h-3.5 w-3.5" aria-hidden="true" />
	{:else if category === 'hero-score'}
		<Gauge class="h-3.5 w-3.5" aria-hidden="true" />
	{:else if category === 'streak'}
		<Flame class="h-3.5 w-3.5" aria-hidden="true" />
	{:else}
		<Swords class="h-3.5 w-3.5" aria-hidden="true" />
	{/if}
{/snippet}

<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none" aria-labelledby="weekly-digest-heading">
	<Card.Header class="px-4 pt-4 pb-0">
		<Card.Title id="weekly-digest-heading" class="text-base">Weekly Digest</Card.Title>
		<Card.Description class="text-xs text-zinc-400">
			{digest.period.label} vs prior week · {digest.matchCount} {digest.matchCount === 1 ? 'match' : 'matches'}
		</Card.Description>
	</Card.Header>

	<Card.Content class="px-4 pt-3 pb-4">
		{#if digest.status === 'error'}
			<div class="flex min-h-20 items-center justify-center gap-2 text-xs text-zinc-400">
				<TriangleAlert class="h-4 w-4 text-rose-300" aria-hidden="true" />
				Digest unavailable. Try refreshing.
			</div>
		{:else if digest.status === 'empty' || digest.items.length === 0}
			<div class="flex min-h-20 items-center justify-between gap-3 text-xs text-zinc-400">
				<span>No notable changes this week.</span>
				<a href="/matches" class="inline-flex items-center gap-1 font-medium text-sky-300 hover:text-sky-200">
					Recent matches
					<ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
				</a>
			</div>
		{:else}
			{#if digest.status === 'partial'}
				<div class="mb-2 flex items-center gap-2 rounded-sm bg-amber-950/20 px-2 py-1.5 text-[11px] text-amber-200/80" role="status">
					<TriangleAlert class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
					Some stats are unavailable.
				</div>
			{/if}

			{#if leadItem}
				{@const leadTone = getToneClasses(leadItem.tone)}
				<a
					href={leadItem.href}
					class="group relative flex h-20 overflow-hidden rounded-sm bg-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					{#if leadItem.image}
						<img
							src={leadItem.image}
							alt={leadItem.imageAlt ?? ''}
							class="absolute inset-y-0 right-0 h-full w-[58%] object-cover object-center opacity-50 saturate-[0.85] transition duration-200 group-hover:scale-[1.025] group-hover:opacity-65"
						/>
						<div class="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/10"></div>
					{/if}

					<div class="relative z-10 flex w-full max-w-[76%] flex-col justify-between gap-1 p-2.5">
						<div class="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wide">
							<span class={`inline-flex items-center gap-1 ${leadTone}`}>
								{@render categoryIcon(leadItem.category)}
								{leadItem.badge}
							</span>
							<time datetime={getDateValue(leadItem.occurredAt)} class="text-zinc-500">
								{getRelativeAge(leadItem.occurredAt)}
							</time>
						</div>
						<div class="truncate text-sm font-bold text-zinc-100 group-hover:text-sky-200">{leadItem.title}</div>
						<div class="flex items-baseline gap-1.5">
							<span class={`text-xl font-black leading-none tabular-nums ${leadTone}`}>{leadItem.primaryMetric.value}</span>
							<span class="text-[9px] font-medium uppercase tracking-wide text-zinc-500">{leadItem.primaryMetric.label}</span>
							{#if leadItem.secondaryMetric}
								<span class="ml-2 text-[10px] tabular-nums text-zinc-500">
									{leadItem.secondaryMetric.label === 'Previous week' ? 'Last week' : leadItem.secondaryMetric.label}
									<span class="font-semibold text-zinc-300">{leadItem.secondaryMetric.value}</span>
								</span>
							{/if}
						</div>
					</div>
					<ArrowRight class="absolute right-2.5 bottom-2.5 z-10 h-4 w-4 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-300" aria-hidden="true" />
				</a>
			{/if}

			<div class="mt-2 divide-y divide-zinc-800/80 border-y border-zinc-800/80">
				{#each secondaryItems as item}
					{@const tone = getToneClasses(item.tone)}
					{@const metric = getCompactMetric(item)}
					{@const metricUnit = getMetricUnit(metric)}
					<a
						href={item.href}
						class="group grid h-11 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 outline-none transition-colors hover:bg-zinc-900/45 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
					>
						{#if hasHeroThumbnail(item)}
							<img src={item.image} alt={item.imageAlt ?? ''} class="h-7 w-10 rounded-sm object-cover" />
						{:else}
							<span class={`flex h-7 w-10 items-center justify-center rounded-sm bg-zinc-900/70 ${tone}`}>
								{@render categoryIcon(item.category)}
							</span>
						{/if}
						<span class="min-w-0">
							<span class="block truncate text-xs font-semibold text-zinc-200 group-hover:text-sky-200">{item.title}</span>
							<span class="mt-0.5 flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-zinc-600">
								<span>{item.badge}</span>
								<span aria-hidden="true">·</span>
								<time datetime={getDateValue(item.occurredAt)} class="normal-case tracking-normal text-zinc-500">
									{getRelativeAge(item.occurredAt)}
								</time>
							</span>
						</span>
						<span class="flex min-w-14 flex-col items-end whitespace-nowrap">
							<span class={`text-sm font-black leading-none tabular-nums ${tone}`}>{metric.value}</span>
							{#if metricUnit}
								<span class="mt-0.5 text-[9px] uppercase tracking-wide text-zinc-600">{metricUnit}</span>
							{/if}
						</span>
					</a>
				{/each}
			</div>

			{#if digest.items.length > initialItemCount}
				<div class="text-center">
					<button
						type="button"
						class="inline-flex h-8 items-center gap-1.5 px-3 text-[11px] font-semibold text-sky-300 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						onclick={() => (expanded = !expanded)}
						aria-expanded={expanded}
					>
						{expanded ? 'Less' : `${digest.items.length - initialItemCount} more`}
						{#if expanded}
							<ChevronUp class="h-3.5 w-3.5" aria-hidden="true" />
						{:else}
							<ChevronDown class="h-3.5 w-3.5" aria-hidden="true" />
						{/if}
					</button>
				</div>
			{/if}
		{/if}
	</Card.Content>
</Card.Root>
