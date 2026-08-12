<script lang="ts">
	import { calcImpact, getImpactDetails, roleDistribution, getRoleName } from '$lib/functions';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Table from '$lib/components/ui/table';
	import PooIcon from '$lib/components/PooIcon.svelte';
	import { twMerge } from 'tailwind-merge'; // Optional: avoids class conflicts

	type RatingChipData = {
		player: {
			impact: number;
			role: number;
			kills: number;
			deaths: number;
			assists: number;
			lastHits: number;
			hero: {
				id: number;
				name: string;
			};
			hero_id?: number;
		};
		matchData: {
			duration: number;
		};
	};

	type Props = {
		data: RatingChipData;
		comfortable?: boolean;
	};

	let { data, comfortable = false }: Props = $props();
	const player = $derived(data.player);
	const matchData = $derived(data.matchData);
	const impactDetails = $derived(getImpactDetails(player, player.role, matchData.duration));
	const impactRating = $derived(calcImpact(player.impact));
	const distributionDetails = $derived(
		roleDistribution(player.role, player.hero.id) ?? { kapm: 0, death: 0, csMin: 0 }
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
	const triggerClasses = $derived(twMerge(
		'bg-2 rounded-md px-1 md:px-2 w-8 md:w-12 text-bold font-display relative text-center',
		borderColorClass,
		isSPlusPlus && 'animate-pulse',
		isSPlus && ' animate-pulse'
	));
</script>

<Tooltip.Root>
	<Tooltip.Trigger
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
					<div class="absolute inset-0 animate-ping rounded-md bg-yellow-400/30"></div>
				{/if}
				<span class="z--10 relative text-xs md:text-base">{impactRating}</span>
			</div>
		{/if}
	</Tooltip.Trigger>
	<Tooltip.Content class="w-[min(24rem,calc(100vw-2rem))]">
		<div class="text-center">Rating: {player.impact}</div>
		<Table.Root>
			<Table.Caption>
				<div class="flex flex-col gap-0">
					<div>
						Rating breakdown for {getRoleName(player.role)}
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
						{player.impact}
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</Tooltip.Content>
</Tooltip.Root>
