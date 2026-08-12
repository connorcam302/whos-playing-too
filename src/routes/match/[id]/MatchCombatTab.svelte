<script lang="ts">
	import { Clock3, Crosshair, Eye, HeartPulse, Skull, Swords } from 'lucide-svelte';
	import {
		formatCompactNumber,
		formatMatchTime,
		type MatchCombatSection,
		type MatchOverview
	} from '$lib/match-page';
	import MatchPlayerPicker from './MatchPlayerPicker.svelte';

	interface Props {
		match: MatchOverview;
		data: MatchCombatSection;
		selectedSlot: number;
		onSelect: (playerSlot: number) => void;
	}

	let { match, data, selectedSlot, onSelect }: Props = $props();

	const focusedPlayer = $derived(match.players.find((player) => player.playerSlot === selectedSlot));
	const focusedCombat = $derived(data.players.find((player) => player.playerSlot === selectedSlot));
	const focusedPlayerLabel = $derived(
		focusedPlayer?.user || !focusedPlayer?.isAnonymous ? focusedPlayer?.name : focusedPlayer?.hero.name
	);

	const dealtDamage = $derived(
		focusedCombat
			? focusedCombat.dealt.physicalDamage + focusedCombat.dealt.magicalDamage + focusedCombat.dealt.pureDamage
			: 0
	);
	const receivedDamage = $derived(
		focusedCombat
			? focusedCombat.received.physicalDamage + focusedCombat.received.magicalDamage + focusedCombat.received.pureDamage
			: 0
	);
	const damageMaximum = $derived(
		Math.max(
			1,
			focusedCombat?.dealt.physicalDamage ?? 0,
			focusedCombat?.dealt.magicalDamage ?? 0,
			focusedCombat?.dealt.pureDamage ?? 0
		)
	);
	const targetMaximum = $derived(Math.max(1, ...(focusedCombat?.dealtTargets.map((target) => target.amount) ?? [])));
	const sourceMaximum = $derived(Math.max(1, ...(focusedCombat?.topSources.map((source) => source.amount) ?? [])));
</script>

<MatchPlayerPicker players={match.players} {selectedSlot} {onSelect} />

{#if focusedCombat && focusedPlayer}
	<div class="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(21rem,0.9fr)]">
		<section class="rounded-md border border-border bg-card" aria-labelledby="combat-summary-heading">
			<div class="border-b border-border px-4 py-3">
				<h3 id="combat-summary-heading" class="text-sm font-semibold text-zinc-100">
					<span class="text-zinc-100">{focusedPlayerLabel}</span>'s combat report
				</h3>
				<p class="mt-0.5 text-xs text-zinc-400">Engagement, damage, deaths, and vision.</p>
			</div>
			<div class="grid grid-cols-2 divide-x divide-y divide-zinc-800/80 sm:grid-cols-3">
				<div class="p-4">
					<div class="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-400"><Swords class="h-3.5 w-3.5" /> Damage dealt</div>
					<p class="mt-1 text-lg font-semibold tabular-nums text-zinc-100">{formatCompactNumber(dealtDamage)}</p>
				</div>
				<div class="p-4">
					<div class="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-400"><HeartPulse class="h-3.5 w-3.5" /> Damage received</div>
					<p class="mt-1 text-lg font-semibold tabular-nums text-zinc-100">{formatCompactNumber(receivedDamage)}</p>
				</div>
				<div class="p-4">
					<div class="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-400"><Crosshair class="h-3.5 w-3.5" /> K / D / A</div>
					<p class="mt-1 text-lg font-semibold tabular-nums text-zinc-100">{focusedCombat.kills} / {focusedCombat.deaths} / {focusedCombat.assists}</p>
				</div>
				<div class="p-4">
					<div class="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-400"><Clock3 class="h-3.5 w-3.5" /> Time dead</div>
					<p class="mt-1 text-lg font-semibold tabular-nums text-zinc-100">{formatMatchTime(focusedCombat.timeDead)}</p>
				</div>
				<div class="p-4">
					<div class="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-400"><Skull class="h-3.5 w-3.5" /> Gold lost</div>
					<p class="mt-1 text-lg font-semibold tabular-nums text-amber-300">{formatCompactNumber(focusedCombat.goldLostToDeaths)}</p>
				</div>
				<div class="p-4">
					<div class="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-400"><Eye class="h-3.5 w-3.5" /> Vision</div>
					<p class="mt-1 text-sm font-semibold tabular-nums text-zinc-100">{focusedCombat.wardsPlaced} placed · {focusedCombat.wardsDestroyed} destroyed</p>
				</div>
			</div>

			<div class="border-t border-border p-4">
				<h4 class="text-xs font-semibold uppercase tracking-wide text-zinc-400">Damage dealt by type</h4>
				<div class="mt-4 space-y-4">
					{#each [
						{ label: 'Physical', value: focusedCombat.dealt.physicalDamage, color: 'bg-red-400' },
						{ label: 'Magical', value: focusedCombat.dealt.magicalDamage, color: 'bg-sky-400' },
						{ label: 'Pure', value: focusedCombat.dealt.pureDamage, color: 'bg-zinc-300' }
					] as damage}
						<div>
							<div class="mb-1.5 flex items-center justify-between text-xs">
								<span class="text-zinc-400">{damage.label}</span>
								<span class="tabular-nums text-zinc-200">{formatCompactNumber(damage.value)}</span>
							</div>
							<div class="h-1.5 overflow-hidden rounded-full bg-zinc-900">
								<div class={`h-full rounded-full ${damage.color}`} style={`width: ${Math.max(2, (damage.value / damageMaximum) * 100)}%`}></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<div class="grid content-start gap-4">
			<section class="rounded-md border border-border bg-card" aria-labelledby="engagement-heading">
				<div class="border-b border-border px-4 py-3">
					<h3 id="engagement-heading" class="text-sm font-semibold text-zinc-100">Engagement details</h3>
				</div>
				<div class="grid grid-cols-2 divide-x divide-y divide-zinc-800/80 text-sm">
					<div class="flex items-center justify-between gap-3 p-3"><span class="text-zinc-400">Solo kills</span><span class="tabular-nums text-zinc-200">{focusedCombat.soloKills}</span></div>
					<div class="flex items-center justify-between gap-3 p-3"><span class="text-zinc-400">Gank kills</span><span class="tabular-nums text-zinc-200">{focusedCombat.gankKills}</span></div>
					<div class="flex items-center justify-between gap-3 p-3"><span class="text-zinc-400">Smoke kills</span><span class="tabular-nums text-zinc-200">{focusedCombat.smokeKills}</span></div>
					<div class="flex items-center justify-between gap-3 p-3"><span class="text-zinc-400">Burst deaths</span><span class="tabular-nums text-zinc-200">{focusedCombat.burstDeaths}</span></div>
					<div class="flex items-center justify-between gap-3 p-3"><span class="text-zinc-400">Diebacks</span><span class="tabular-nums text-zinc-200">{focusedCombat.dieBacks}</span></div>
					<div class="flex items-center justify-between gap-3 p-3"><span class="text-zinc-400">Runes</span><span class="tabular-nums text-zinc-200">{focusedCombat.runes}</span></div>
				</div>
			</section>

			<section class="rounded-md border border-border bg-card" aria-labelledby="targets-heading">
				<div class="border-b border-border px-4 py-3">
					<h3 id="targets-heading" class="text-sm font-semibold text-zinc-100">Damage targets</h3>
				</div>
				{#if focusedCombat.dealtTargets.length > 0}
					<div class="space-y-3 p-4">
						{#each focusedCombat.dealtTargets.slice(0, 5) as target}
							<div class="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2">
								<img src={target.targetHero.img} alt="" class="h-6 w-8 rounded-[2px] object-cover" />
								<div class="min-w-0">
									<p class="truncate text-xs text-zinc-400">{target.targetHero.name}</p>
									<div class="mt-1 h-1 overflow-hidden rounded-full bg-zinc-900">
										<div class="h-full rounded-full bg-red-400" style={`width: ${Math.max(2, (target.amount / targetMaximum) * 100)}%`}></div>
									</div>
								</div>
								<span class="text-xs tabular-nums text-zinc-300">{formatCompactNumber(target.amount)}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="p-4 text-sm text-zinc-400">No target breakdown is available.</p>
				{/if}
			</section>
		</div>
	</div>

	<section class="mt-4 rounded-md border border-border bg-card" aria-labelledby="sources-heading">
		<div class="border-b border-border px-4 py-3">
			<h3 id="sources-heading" class="text-sm font-semibold text-zinc-100">Top damage sources</h3>
		</div>
		{#if focusedCombat.topSources.length > 0}
			<div class="grid gap-x-6 gap-y-4 p-4 md:grid-cols-2 xl:grid-cols-3">
				{#each focusedCombat.topSources.slice(0, 9) as source}
					<div>
						<div class="mb-1.5 grid grid-cols-[1fr_auto_auto] gap-3 text-xs">
							<span class="truncate text-zinc-300">{source.name}</span>
							<span class="text-zinc-400">{source.count} hits</span>
							<span class="tabular-nums text-zinc-200">{formatCompactNumber(source.amount)}</span>
						</div>
						<div class="h-1.5 overflow-hidden rounded-full bg-zinc-900">
							<div class="h-full rounded-full bg-violet-400" style={`width: ${Math.max(2, (source.amount / sourceMaximum) * 100)}%`}></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="p-4 text-sm text-zinc-400">No ability or item damage breakdown is available.</p>
		{/if}
	</section>
{:else}
	<div class="mt-4 flex min-h-48 items-center justify-center rounded-md border border-border bg-card px-5 text-center text-sm text-zinc-400">
		Combat detail is not available for this player.
	</div>
{/if}
