<script lang="ts">
	import { ArrowRight, BadgeCheck, Shuffle } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';

	type Owner = {
		playerId: number;
		username: string;
		matches: number;
		score: number;
		winRate: number;
	};

	type OwnershipChange = {
		hero: {
			id: number;
			name: string;
			img: string;
		};
		previousOwner: Owner | null;
		currentOwner: Owner | null;
		changeType: 'changed' | 'new';
	};

	type Props = {
		changes: OwnershipChange[];
	};

	const { changes }: Props = $props();

	const formatNumber = (value: number | null | undefined, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value ?? 0);

	const formatPercent = (value: number | null | undefined) => `${formatNumber(value, 1)}%`;
</script>

{#if changes.length > 0}
	<Card.Root>
		<Card.Header class="p-4 pb-0">
			<div class="flex items-center justify-between gap-3">
				<div class="flex min-w-0 items-center gap-2">
					<div
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/50"
					>
						<Shuffle class="h-3.5 w-3.5 text-sky-300" />
					</div>
					<div class="min-w-0">
						<h2 class="text-sm font-semibold leading-tight tracking-normal text-zinc-100">
							Hero Ownership Changes
						</h2>
						<div class="mt-0.5 text-[11px] leading-none text-zinc-500">
							Last 5 matches
						</div>
					</div>
				</div>
				<div class="shrink-0 text-xs tabular-nums text-zinc-500">{changes.length} changed</div>
			</div>
		</Card.Header>

		<Card.Content class="p-4 pt-3">
			<div class="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5">
				{#each changes as change}
					<div
						class="flex min-w-[260px] items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/35 px-2 py-1.5"
					>
						<a href={`/heroes/${change.hero.id}`} class="shrink-0">
							<img
								src={change.hero.img}
								alt={change.hero.name}
								class="h-8 w-12 rounded-sm border border-zinc-800 object-cover"
							/>
						</a>
						<div class="min-w-0 flex-1">
							<a
								href={`/heroes/${change.hero.id}`}
								class="block truncate text-xs font-medium text-zinc-100 transition-colors hover:text-sky-300"
							>
								{change.hero.name}
							</a>
							<div class="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-zinc-500">
								{#if change.previousOwner}
									<a
										href={`/player/${change.previousOwner.playerId}`}
										class="truncate transition-colors hover:text-sky-300"
									>
										{change.previousOwner.username}
									</a>
								{:else}
									<span class="truncate">Unclaimed</span>
								{/if}
								<ArrowRight class="h-3 w-3 shrink-0 text-zinc-600" />
								{#if change.currentOwner}
									<a
										href={`/player/${change.currentOwner.playerId}`}
										class="truncate font-medium text-zinc-300 transition-colors hover:text-sky-300"
									>
										{change.currentOwner.username}
									</a>
								{/if}
							</div>
						</div>
						<span class="inline-flex shrink-0 items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-medium {change.changeType === 'new'
							? 'border-sky-500/30 bg-sky-500/10 text-sky-200'
							: 'border-zinc-700 bg-zinc-900/80 text-zinc-300'}">
							{#if change.changeType === 'new'}
								<BadgeCheck class="h-2.5 w-2.5" />
								New
							{:else}
								{formatPercent(change.currentOwner?.winRate)}
							{/if}
						</span>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
{/if}
