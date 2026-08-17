<script lang="ts">
	import dayjs from 'dayjs';
	import {
		ArrowRight,
		ArrowUpRight,
		BadgeCheck,
		Flame,
		Swords,
		TrendingUp,
		TriangleAlert,
		Trophy
	} from 'lucide-svelte';
	import PooIcon from '$lib/components/PooIcon.svelte';
	import * as Card from '$lib/components/ui/card';
	import type {
		WeeklyDigest,
		WeeklyDigestCategory,
		WeeklyDigestItem,
		WeeklyDigestTone
	} from '$lib/weeklyDigest';

	type Props = {
		digest: WeeklyDigest;
	};

	let { digest }: Props = $props();

	const getToneClasses = (tone: WeeklyDigestTone) => {
		if (tone === 'positive') return 'text-emerald-300 bg-emerald-950/45';
		if (tone === 'negative') return 'text-rose-300 bg-rose-950/45';
		return 'text-sky-300 bg-sky-950/45';
	};

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

	const hasHeroThumbnail = (category: WeeklyDigestCategory) =>
		['record', 'calibration', 'overtake'].includes(category);

	const getMetricValue = (item: WeeklyDigestItem) =>
		item.category === 'overtake' && item.secondaryMetric
			? `${item.secondaryMetric.value} → ${item.primaryMetric.value}`
			: item.primaryMetric.value;
</script>

{#snippet categoryIcon(category: WeeklyDigestCategory)}
	{#if category === 'record'}
		<Trophy class="h-3.5 w-3.5" aria-hidden="true" />
	{:else if category === 'form'}
		<TrendingUp class="h-3.5 w-3.5" aria-hidden="true" />
	{:else if category === 'streak'}
		<Flame class="h-3.5 w-3.5" aria-hidden="true" />
	{:else if category === 'match'}
		<Swords class="h-3.5 w-3.5" aria-hidden="true" />
	{:else if category === 'poo'}
		<PooIcon class="h-4 w-4" aria-hidden="true" />
	{:else if category === 'calibration'}
		<BadgeCheck class="h-3.5 w-3.5" aria-hidden="true" />
	{:else}
		<ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
	{/if}
{/snippet}

<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none" aria-labelledby="weekly-timeline-heading">
	<Card.Header class="px-4 pt-4 pb-0">
		<Card.Title id="weekly-timeline-heading" class="text-base">Weekly Timeline</Card.Title>
		<Card.Description class="text-xs text-zinc-400">
			{digest.period.label} · {digest.matchCount} {digest.matchCount === 1 ? 'match' : 'matches'}
		</Card.Description>
	</Card.Header>

	<Card.Content class="px-4 pt-3 pb-4">
		{#if digest.status === 'error'}
			<div class="flex min-h-20 items-center justify-center gap-2 text-xs text-zinc-400">
				<TriangleAlert class="h-4 w-4 text-rose-300" aria-hidden="true" />
				Timeline unavailable. Try refreshing.
			</div>
		{:else if digest.status === 'empty' || digest.items.length === 0}
			<div class="flex min-h-20 items-center justify-between gap-3 text-xs text-zinc-400">
				<span>No notable events this week.</span>
				<a href="/matches" class="inline-flex items-center gap-1 font-medium text-sky-300 hover:text-sky-200">
					Recent matches
					<ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
				</a>
			</div>
		{:else}
			{#if digest.status === 'partial'}
				<div class="mb-2 flex items-center gap-2 rounded-sm bg-amber-950/20 px-2 py-1.5 text-[11px] text-amber-200/80" role="status">
					<TriangleAlert class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
					Some events are unavailable.
				</div>
			{/if}

			<!-- svelte-ignore a11y_no_noninteractive_tabindex (the scrollable timeline needs a keyboard focus target) -->
			<div
				class="relative max-h-[34rem] overflow-y-auto pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				role="region"
				tabindex="0"
				aria-label={`${digest.items.length} events from ${digest.period.label}`}
			>
				<div class="pointer-events-none absolute top-4 bottom-4 left-[1.05rem] w-px bg-zinc-800" aria-hidden="true"></div>
				{#each digest.items as item}
					{@const toneClasses = getToneClasses(item.tone)}
					<a
						href={item.href}
						title={`${item.title}. ${item.summary}`}
						aria-label={`${item.title}. ${item.summary}`}
						class="group relative grid h-11 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-1.5 rounded-sm px-0.5 outline-none transition-colors hover:bg-zinc-900/45 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
					>
						<span class="relative z-10 flex h-7 w-9 items-center justify-center">
							{#if item.image && hasHeroThumbnail(item.category)}
								<img src={item.image} alt={item.imageAlt ?? ''} class="h-6 w-9 rounded-sm object-cover ring-1 ring-zinc-800" />
							{:else}
								<span class={`flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-zinc-800 ${toneClasses}`}>
									{@render categoryIcon(item.category)}
								</span>
							{/if}
						</span>

						<span class="min-w-0">
							<span class="block truncate text-xs font-semibold text-zinc-200 group-hover:text-sky-200">{item.title}</span>
							<span class="mt-0.5 flex items-center gap-1 text-[9px] font-medium leading-none uppercase tracking-wide text-zinc-600">
								<span>{item.badge}</span>
								<span aria-hidden="true">·</span>
								<time datetime={getDateValue(item.occurredAt)} class="normal-case tracking-normal text-zinc-500">
									{getRelativeAge(item.occurredAt)}
								</time>
							</span>
						</span>

						<span class="min-w-14 whitespace-nowrap pl-1 text-right">
							<span class={`text-[13px] font-black leading-none tabular-nums ${item.tone === 'positive' ? 'text-emerald-300' : item.tone === 'negative' ? 'text-rose-300' : 'text-sky-300'}`}>
								{getMetricValue(item)}
							</span>
						</span>
					</a>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
