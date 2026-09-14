<script lang="ts">
	import { calcImpact, getImpactDetails, roleDistribution, getRoleName } from '$lib/functions';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import * as Table from '$lib/components/ui/table';
	import PooIcon from '$lib/components/PooIcon.svelte';
	import BetaImpactChip from '$lib/components/BetaImpactChip.svelte';
	import { getBetaImpact, type BetaImpactInput, type BetaImpactContext } from '$lib/impact-beta';
	import { showBetaImpact } from '$lib/impact-preference';
	import { twMerge } from 'tailwind-merge'; // Optional: avoids class conflicts

	type RatingChipData = BetaImpactContext & {
		player: BetaImpactInput & {
			impact: number;
			role: number;
			kills: number;
			deaths: number;
			assists: number;
			lastHits: number | null;
			hero: {
				id: number;
				name: string;
			};
			hero_id?: number;
		};
		matchData: BetaImpactContext & {
			duration: number;
		};
	};

	type Props = {
		data?: RatingChipData;
		impact?: number;
		comfortable?: boolean;
		aggregate?: boolean;
	};

	let { data, impact = 0, comfortable = false, aggregate = false }: Props = $props();
	const player = $derived(data?.player);
	const originalImpact = $derived(player?.impact ?? impact);
	const betaEnabled = $derived($showBetaImpact && !aggregate && !!player && !!data);
	const betaDetails = $derived(
		betaEnabled && player && data
			? getBetaImpact(player, data.matchData.duration, { ...data, ...data.matchData })
			: null
	);
	const ratingValue = $derived(betaEnabled ? (betaDetails?.impact ?? null) : originalImpact);
	const impactDetails = $derived(
		!betaEnabled && player && data
			? getImpactDetails(player, player.role, data.matchData.duration)
			: null
	);
	const impactRating = $derived(ratingValue === null ? 'N/A' : calcImpact(ratingValue));
	const distributionDetails = $derived(
		(player ? roleDistribution(player.role, player.hero.id) : null) ?? {
			kapm: 0,
			death: 0,
			csMin: 0
		}
	);
	const baseGrade = $derived(impactRating.charAt(0));

	const isSPlus = $derived(impactRating === 'S+');
	const isSPlusPlus = $derived(impactRating === 'S++');
	const isPoo = $derived(impactRating === 'F-');

	const borderColorClass = $derived(
		{
			S: 'bg-yellow-400/30 text-yellow-400', // Gold
			A: 'bg-green-500/30 text-green-500',
			B: 'bg-blue-500/30 text-blue-500',
			C: 'bg-purple-500/30 text-purple-500',
			D: 'bg-orange-500/30 text-orange-500',
			F: 'bg-red-500/30 text-red-500'
		}[baseGrade] ?? 'bg-gray-300/20 text-gray-300'
	);
	const triggerClasses = $derived(
		twMerge(
			'bg-2 rounded-md px-1 md:px-2 w-8 md:w-12 text-bold font-display relative text-center',
			borderColorClass,
			isSPlusPlus && 'animate-pulse',
			isSPlus && ' animate-pulse'
		)
	);
</script>

<div class="inline-flex items-center gap-0.5">
	<Tooltip.Root>
		<Tooltip.Trigger
			aria-label={betaEnabled
				? `Beta rating ${impactRating}: ${ratingValue ?? 'unavailable'}`
				: undefined}
			class={comfortable
				? 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-8 md:min-w-12'
				: 'inline-flex min-h-6 min-w-8 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'}
		>
			{#if isPoo}
				<div class="flex w-8 justify-center md:w-12">
					<div class="text-xl">
						<PooIcon class="h-5 w-5 drop-shadow-[0_2px_6px_#441306] filter" />
					</div>
				</div>
			{:else}
				<div class={triggerClasses}>
					{#if isSPlusPlus}
						<div
							class="pointer-events-none absolute inset-0 animate-ping rounded-md bg-yellow-400/30"
						></div>
					{/if}
					<span class="z--10 relative text-xs md:text-base">{impactRating}</span>
				</div>
			{/if}
		</Tooltip.Trigger>
		<TooltipPrimitive.Portal>
			<Tooltip.Content
				collisionPadding={16}
				class="max-h-[min(calc(100vh-2rem),var(--bits-tooltip-content-available-height))] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto"
			>
				<div class="text-center">
					{betaEnabled
						? 'Beta rating'
						: player && !aggregate
							? 'Rating'
							: 'Original average impact'}: {ratingValue ?? 'Unavailable'}
				</div>
				{#if betaEnabled && betaDetails}
					<Table.Root>
						<Table.Caption>Beta contribution breakdown, rounded for display</Table.Caption>
						<Table.Header>
							<Table.Row>
								<Table.Head>Contribution</Table.Head>
								<Table.Head class="text-right">Weight</Table.Head>
								<Table.Head class="text-right">Points</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each betaDetails.rows.filter((row) => row.label !== 'Survival adjustment') as row}
								<Table.Row>
									<Table.Cell>{row.label}</Table.Cell>
									<Table.Cell class="text-right tabular-nums whitespace-nowrap"
										>{Number((row.weight * 100).toFixed(2))}%</Table.Cell
									>
									<Table.Cell class="text-right tabular-nums">{row.value.toFixed(1)}</Table.Cell>
								</Table.Row>
							{/each}
							<Table.Row>
								<Table.Cell>Subtotal</Table.Cell>
								<Table.Cell></Table.Cell>
								<Table.Cell class="text-right tabular-nums"
									>{betaDetails.earnedSubtotal.toFixed(1)}</Table.Cell
								>
							</Table.Row>
						</Table.Body>
					</Table.Root>
					<dl class="mt-3 space-y-1 text-sm">
						<div class="flex justify-between gap-3">
							<dt>Survival modifier</dt>
							<dd class="tabular-nums">×{betaDetails.survivalMultiplier.toFixed(3)}</dd>
						</div>
						<div class="flex justify-between gap-3">
							<dt>Effect on score</dt>
							<dd class="tabular-nums">
								{betaDetails.survival > 0 ? '+' : ''}{betaDetails.survival.toFixed(1)} points
							</dd>
						</div>
						<div class="flex justify-end gap-3 border-t pt-2 font-semibold">
							<dt class="sr-only">Final rating</dt>
							<dd class="tabular-nums">{ratingValue}</dd>
						</div>
					</dl>
				{:else if player && impactDetails}
					<Table.Root>
						<Table.Caption>
							<div class="flex flex-col gap-0">
								<div>
									{betaEnabled ? 'Beta rating' : 'Rating'} breakdown for {getRoleName(player.role)}
									{player.hero.name}
								</div>
								<div class="text-xs">(values subject to rounding differences)</div>
							</div>
						</Table.Caption>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-64">Metric</Table.Head>
								<Table.Head class="text-center">Weight</Table.Head>
								<Table.Head class="text-center">Raw Value</Table.Head>
								<Table.Head class="text-right">Value</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							<Table.Row>
								<Table.Cell>Kill Involvement</Table.Cell>
								<Table.Cell>{distributionDetails.kapm}%</Table.Cell>
								<Table.Cell>{impactDetails.kapmRating}</Table.Cell>
								<Table.Cell class="text-right">
									{Math.floor(impactDetails.kapmRating * (distributionDetails.kapm / 100))}
								</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell>Death Rating</Table.Cell>
								<Table.Cell>{distributionDetails.death}%</Table.Cell>
								<Table.Cell>{impactDetails.deathRating}</Table.Cell>
								<Table.Cell class="text-right">
									{Math.floor(impactDetails.deathRating * (distributionDetails.death / 100))}
								</Table.Cell>
							</Table.Row>
							{#if distributionDetails.csMin}
								<Table.Row>
									<Table.Cell>Farm Rating</Table.Cell>
									<Table.Cell>{distributionDetails.csMin}%</Table.Cell>
									<Table.Cell>{impactDetails.csMinRating}</Table.Cell>
									<Table.Cell class="text-right">
										{Math.round(impactDetails.csMinRating * (distributionDetails.csMin / 100))}
									</Table.Cell>
								</Table.Row>
							{/if}

							<Table.Row>
								<Table.Cell>Total</Table.Cell>
								<Table.Cell></Table.Cell>
								<Table.Cell></Table.Cell>
								<Table.Cell class="text-right">
									{ratingValue}
								</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table.Root>
				{/if}
			</Tooltip.Content>
		</TooltipPrimitive.Portal>
	</Tooltip.Root>
	{#if betaEnabled}
		<BetaImpactChip details={betaDetails} {originalImpact} />
	{/if}
</div>
