<script lang="ts">
	import { getRoleIcon, getRoleName } from '$lib/functions';
	import type { PlayerContribution, PlayerWeightGroup } from '$lib/stack-analysis';

	type Props = {
		groups: PlayerWeightGroup[];
	};

	let { groups }: Props = $props();

	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value || 0);

	const formatDelta = (delta: number) => `${delta > 0 ? '+' : ''}${formatNumber(delta, 1)}`;
	const deltaClass = (delta: number) =>
		delta > 0 ? 'text-green-300' : delta < 0 ? 'text-red-300' : 'text-zinc-400';
	const selectedContributions = (contributions: PlayerContribution[]) =>
		contributions.filter((contribution) => contribution.selected);
</script>

<section class="overflow-hidden rounded-md border border-border bg-card" aria-label="Match stack analysis">
	<div class="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2">
		<div>
			<h2 class="text-sm font-semibold text-zinc-100">Match Analysis</h2>
			<p class="text-[11px] text-zinc-500">Estimated win chance and player weight</p>
		</div>
	</div>
	{#each groups as group}
		{#if group.estimate}
			<div class="grid border-b border-zinc-800 last:border-b-0 lg:grid-cols-[210px_minmax(0,1fr)]">
				<div class="bg-zinc-950/45 px-3 py-3">
					<div class="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
						{group.label ?? 'Selected stack'}
					</div>
					<div class="mt-1 flex items-baseline justify-between gap-3">
						<div>
							<div class="text-[11px] text-zinc-500">Estimated win chance</div>
							<div class="text-2xl font-semibold tabular-nums text-zinc-100">
								{formatNumber(group.estimate.value, 1)}%
							</div>
						</div>
						<div class={`text-right text-xs tabular-nums ${deltaClass(group.estimate.delta)}`}>
							{formatDelta(group.estimate.delta)} pts
							<div class="text-[10px] text-zinc-500">vs baseline</div>
						</div>
					</div>
					<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-900">
						<div class="h-full rounded-full bg-sky-500" style:width={`${group.estimate.value}%`}></div>
					</div>
					<div class="mt-2 text-[10px] tabular-nums text-zinc-500">
						Confidence {formatNumber(group.estimate.confidence * 100)}% · {group.estimate.stackGames} stack games · {group.estimate.exactDrafts} exact
					</div>
				</div>

				<div class="min-w-0">
					<div class="border-b border-zinc-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
						Player weight
					</div>
					<div class="overflow-x-auto">
						<div class="flex w-full min-w-max">
							{#each selectedContributions(group.contributions) as contribution}
								<div class="w-44 flex-1 border-r border-zinc-900 px-3 py-2.5 last:border-r-0 lg:min-w-0">
									<div class="flex items-center gap-2">
										{#if contribution.slot.heroIcon}
											<img
												src={contribution.slot.heroIcon}
												alt=""
												class="h-9 w-9 shrink-0 rounded-sm object-contain"
											/>
										{/if}
										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-1.5">
												<img src={getRoleIcon(contribution.slot.role)} alt="" class="h-4 w-4" />
												<span class="truncate text-xs font-semibold text-zinc-100">
													{contribution.slot.playerName}
												</span>
											</div>
											<div class="truncate text-[10px] text-zinc-500">
												{getRoleName(contribution.slot.role)} · {contribution.slot.heroName}
											</div>
										</div>
										<div class={`text-xs font-semibold tabular-nums ${deltaClass(contribution.delta)}`}>
											{formatDelta(contribution.delta)}
										</div>
									</div>
									<div class="mt-2 grid grid-cols-3 gap-1 text-[10px]">
										{#each contribution.components as component}
											<div class="rounded-sm bg-zinc-950/65 px-1.5 py-1 text-center">
												<div class="text-zinc-500">{component.label}</div>
												<div class={`tabular-nums ${deltaClass(component.delta)}`}>
													{component.enabled ? formatDelta(component.delta) : '–'}
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/each}
</section>
