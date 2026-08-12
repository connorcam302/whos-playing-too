<script lang="ts">
	import { Coins, ShoppingBag } from 'lucide-svelte';
	import {
		formatCompactNumber,
		formatMatchTime,
		matchChartPalette,
		type MatchEconomyPlayer,
		type MatchEconomySection,
		type MatchOverview
	} from '$lib/match-page';
	import MatchLineChart from './MatchLineChart.svelte';
	import MatchPlayerPicker from './MatchPlayerPicker.svelte';

	interface Props {
		match: MatchOverview;
		data: MatchEconomySection;
		selectedSlot: number;
		onSelect: (playerSlot: number) => void;
	}

	let { match, data, selectedSlot, onSelect }: Props = $props();

	type EconomyMetric = 'networth' | 'gpm' | 'xpm' | 'lastHits';
	let metric = $state<EconomyMetric>('networth');

	const focusedPlayer = $derived(match.players.find((player) => player.playerSlot === selectedSlot));
	const focusedEconomy = $derived(data.players.find((player) => player.playerSlot === selectedSlot));
	const focusedPlayerLabel = $derived(
		focusedPlayer?.user || !focusedPlayer?.isAnonymous ? focusedPlayer?.name : focusedPlayer?.hero.name
	);

	const getSeries = (player: MatchEconomyPlayer | undefined) => {
		if (!player) return [];
		if (metric === 'gpm') return player.goldPerMinute;
		if (metric === 'xpm') return player.experiencePerMinute;
		if (metric === 'lastHits') return player.lastHitsPerMinute;
		return player.networthPerMinute;
	};

	const metricLabel = $derived(
		metric === 'networth'
			? 'Net worth'
			: metric === 'gpm'
				? 'Gold per minute'
				: metric === 'xpm'
					? 'Experience per minute'
					: 'Last hits'
	);

	const farmMaximum = $derived(Math.max(1, ...(focusedEconomy?.farm.map((category) => category.gold) ?? [])));
</script>

<MatchPlayerPicker players={match.players} {selectedSlot} {onSelect} />

{#if focusedEconomy && focusedPlayer}
	<div class="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
		<section class="min-w-0 rounded-md border border-border bg-card" aria-labelledby="economy-chart-heading">
			<div class="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 id="economy-chart-heading" class="text-sm font-semibold text-zinc-100">
						<span class="text-zinc-100">{focusedPlayerLabel}</span>'s economy
					</h3>
					<p class="mt-0.5 text-xs text-zinc-400">Minute-by-minute resource progression.</p>
				</div>
				<div class="flex w-fit flex-wrap rounded-md border border-zinc-800 bg-zinc-950/40 p-1">
					{#each [
						{ value: 'networth', label: 'Net worth' },
						{ value: 'gpm', label: 'GPM' },
						{ value: 'xpm', label: 'XPM' },
						{ value: 'lastHits', label: 'Last hits' }
					] as option}
						<button
							type="button"
							onclick={() => (metric = option.value as EconomyMetric)}
							class={`min-h-11 rounded-sm px-2.5 text-sm font-medium transition-colors sm:min-h-9 sm:text-xs ${
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
				{#if getSeries(focusedEconomy).length > 0}
					<MatchLineChart
						datasets={[{ label: metricLabel, data: getSeries(focusedEconomy), color: matchChartPalette.primary }]}
						mode="number"
						ariaLabel={`${focusedPlayer.name} ${metricLabel} over match time`}
					/>
				{:else}
					<div class="flex h-64 items-center justify-center text-sm text-zinc-400">No {metricLabel.toLowerCase()} series is available.</div>
				{/if}
			</div>
		</section>

		<section class="rounded-md border border-border bg-card" aria-labelledby="farm-heading">
			<div class="border-b border-border px-4 py-3">
				<h3 id="farm-heading" class="text-sm font-semibold text-zinc-100">Farm sources</h3>
				<p class="mt-0.5 text-xs text-zinc-400">Gold gained by source category.</p>
			</div>
			{#if focusedEconomy.farm.length > 0}
				<div class="space-y-4 p-4">
					{#each focusedEconomy.farm as category}
						<div>
							<div class="mb-1.5 grid grid-cols-[1fr_auto_auto] gap-3 text-xs">
								<span class="truncate text-zinc-400">{category.label}</span>
								<span class="tabular-nums text-zinc-400">{category.count} units</span>
								<span class="tabular-nums text-amber-300">{formatCompactNumber(category.gold)}</span>
							</div>
							<div class="h-1.5 overflow-hidden rounded-full bg-zinc-900">
								<div class="h-full rounded-full bg-amber-500" style={`width: ${Math.max(2, (category.gold / farmMaximum) * 100)}%`}></div>
							</div>
						</div>
					{/each}
					<div class="flex items-center justify-between border-t border-zinc-800 pt-4 text-xs">
						<span class="text-zinc-400">Buyback gold spent</span>
						<span class="tabular-nums text-zinc-200">{formatCompactNumber(focusedEconomy.buyBackGold)}</span>
					</div>
				</div>
			{:else}
				<div class="flex min-h-48 flex-col items-center justify-center gap-2 px-5 text-center text-sm text-zinc-400">
					<Coins class="h-5 w-5 text-zinc-600" /> Farm distribution is not available.
				</div>
			{/if}
		</section>
	</div>

	<section class="mt-4 rounded-md border border-border bg-card" aria-labelledby="purchases-heading">
		<div class="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
			<div>
				<h3 id="purchases-heading" class="text-sm font-semibold text-zinc-100">Purchase history</h3>
				<p class="mt-0.5 text-xs text-zinc-400">{focusedEconomy.itemPurchases.length} recorded purchases</p>
			</div>
			<ShoppingBag class="h-4 w-4 text-zinc-600" />
		</div>
		{#if focusedEconomy.itemPurchases.length > 0}
			<div class="flex max-h-72 flex-wrap content-start gap-2 overflow-y-auto p-4">
				{#each focusedEconomy.itemPurchases as purchase}
					<div class="flex items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-950/35 px-2 py-1.5" title={`${formatMatchTime(purchase.time)} ${purchase.item.name}`}>
						<time class="w-10 text-xs tabular-nums text-zinc-400">{formatMatchTime(purchase.time)}</time>
						<img src={purchase.item.img} alt={purchase.item.name} class="h-7 w-10 rounded-[2px] object-cover" />
						<span class="max-w-32 truncate text-xs text-zinc-300">{purchase.item.name}</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="p-5 text-sm text-zinc-400">No purchase history was recorded for this player.</div>
		{/if}
	</section>
{:else}
	<div class="mt-4 flex min-h-48 items-center justify-center rounded-md border border-border bg-card px-5 text-center text-sm text-zinc-400">
		Economy detail is not available for this player.
	</div>
{/if}
