<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { getRoleIcon, getRoleName } from '$lib/functions';
	import type { PlayerWeightGroup } from '$lib/stack-analysis';

	type Props = {
		groups: PlayerWeightGroup[];
	};

	let { groups }: Props = $props();

	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value || 0);

	const contributionWidth = (delta: number) => `${(Math.min(Math.abs(delta), 20) / 20) * 50}%`;
	const contributionLeft = (delta: number) => {
		const width = (Math.min(Math.abs(delta), 20) / 20) * 50;
		return delta < 0 ? `${50 - width}%` : '50%';
	};
</script>

<Card.Root class="rounded-md border-border bg-card shadow-none">
	<Card.Header class="px-4 pt-4 pb-0">
		<Card.Title class="text-base">Player Weight</Card.Title>
		<Card.Description class="text-xs text-zinc-400">
			How each selected slot moves the estimate against the current baseline.
		</Card.Description>
	</Card.Header>
	<Card.Content class="px-4 pt-3 pb-4">
		<div class="flex flex-col gap-4">
			{#each groups as group}
				<div class="flex flex-col gap-2">
					{#if group.label}
						<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">{group.label}</div>
					{/if}
					<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
						{#each group.contributions as contribution}
							<div class="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
								<div class="flex items-center gap-2">
									<img src={getRoleIcon(contribution.slot.role)} alt="" class="h-6 w-6" />
									<div class="min-w-0">
										<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">
											{getRoleName(contribution.slot.role)}
										</div>
										<div class="truncate text-sm font-semibold text-zinc-100">
											{contribution.slot.playerName}
										</div>
									</div>
								</div>
								<div class="mt-3 flex items-center gap-2">
									{#if contribution.slot.heroIcon}
										<img src={contribution.slot.heroIcon} alt="" class="h-10 w-10 rounded-sm object-contain" />
									{:else}
										<div class="h-10 w-10 rounded-sm bg-zinc-900"></div>
									{/if}
									<div class="min-w-0 text-sm text-zinc-300">{contribution.slot.heroName}</div>
								</div>
								<div class="mt-3">
									<div class="flex items-center justify-between text-xs">
										<span class="text-zinc-400">Net weight</span>
										<span
											class={contribution.delta > 0
												? 'tabular-nums text-green-300'
												: contribution.delta < 0
													? 'tabular-nums text-red-300'
													: 'tabular-nums text-zinc-400'}
										>
											{contribution.delta > 0 ? '+' : ''}{formatNumber(contribution.delta, 1)} pts
										</span>
									</div>
									<div class="relative mt-2 h-2 rounded-full bg-zinc-900">
										<div class="absolute top-[-3px] left-1/2 h-4 w-px bg-zinc-600"></div>
										<div
											class={contribution.delta >= 0
												? 'absolute top-0 h-full rounded-full bg-green-500'
												: 'absolute top-0 h-full rounded-full bg-red-500'}
											style:left={contributionLeft(contribution.delta)}
											style:width={contributionWidth(contribution.delta)}
										></div>
									</div>
								</div>
								<div class="mt-3 flex flex-col gap-1.5">
									{#each contribution.components as component}
										<div class="grid grid-cols-[42px_1fr_54px] items-center gap-2 text-[11px]">
											<div class={component.enabled ? 'text-zinc-400' : 'text-zinc-600'}>{component.label}</div>
											<div class="h-1 overflow-hidden rounded-full bg-zinc-900">
												<div
													class={component.delta >= 0 ? 'h-full bg-green-500/70' : 'h-full bg-red-500/70'}
													style:width={contributionWidth(component.delta)}
												></div>
											</div>
											<div
												class={component.enabled
													? component.delta > 0
														? 'text-right tabular-nums text-green-300'
														: component.delta < 0
															? 'text-right tabular-nums text-red-300'
															: 'text-right tabular-nums text-zinc-400'
													: 'text-right tabular-nums text-zinc-600'}
											>
												{component.enabled
													? `${component.delta > 0 ? '+' : ''}${formatNumber(component.delta, 1)}`
													: '-'}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
