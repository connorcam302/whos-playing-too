<script lang="ts">
	import { calcImpact, getImpactDetails, roleDistribution, getRoleName } from '$lib/functions';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import * as Table from '$lib/components/ui/table';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import { twMerge } from 'tailwind-merge'; // Optional: avoids class conflicts

	let { data } = $props();
	const { player, matchData } = data;

	const impactDetails = getImpactDetails(player, player.role, matchData.duration);
	const impactRating = calcImpact(player.impact);
	const distributionDetails = roleDistribution(player.role, player.hero.id);
	const baseGrade = impactRating.charAt(0);

	const isSPlus = impactRating === 'S+';
	const isSPlusPlus = impactRating === 'S++';
	const isPoo = impactRating === 'F-';

	const borderColorClass =
		{
			S: 'bg-yellow-400/20 text-yellow-400', // Gold
			A: 'bg-green-500/20 text-green-500',
			B: 'bg-blue-500/20 text-blue-500',
			C: 'bg-purple-500/20 text-purple-500',
			D: 'bg-orange-500/20 text-orange-500',
			F: 'bg-red-500/20 text-red-500'
		}[baseGrade] ?? 'bg-gray-300/20 text-gray-300';
	const triggerClasses = twMerge(
		'bg-2 rounded-md px-1 md:px-2 w-8 md:w-12 text-bold font-display relative',
		borderColorClass,
		isSPlusPlus && 'animate-pulse',
		isSPlus && ' animate-pulse'
	);
</script>

<HoverCard.Root>
	<HoverCard.Trigger>
		{#if isPoo}
			<div class="flex w-8 justify-center md:w-12">
				<div class="animate-bounce text-xl">
					<FxemojiPoo class="drop-shadow-[0_2px_6px_#441306] filter" />
				</div>
			</div>
		{:else}
			<div class={triggerClasses}>
				{#if isSPlusPlus}
					<div class="absolute inset-0 animate-ping rounded-md bg-yellow-400/30"></div>
				{/if}
				<span class="relative z--10 text-xs md:text-base">{impactRating}</span>
			</div>
		{/if}
	</HoverCard.Trigger>
	<HoverCard.Content class="w-96">
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
					<Table.Cell>{distributionDetails?.kapm}%</Table.Cell>
					<Table.Cell>{impactDetails.kapmRating}</Table.Cell>
					<Table.Cell class="text-right">
						{Math.floor(impactDetails.kapmRating * (distributionDetails?.kapm / 100))}
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>Death Rating</Table.Cell>
					<Table.Cell>{distributionDetails?.death}%</Table.Cell>
					<Table.Cell>{impactDetails.deathRating}</Table.Cell>
					<Table.Cell class="text-right">
						{Math.floor(impactDetails.deathRating * (distributionDetails?.death / 100))}
					</Table.Cell>
				</Table.Row>
				{#if distributionDetails?.csMin}
					<Table.Row>
						<Table.Cell>Farm Rating</Table.Cell>
						<Table.Cell>{distributionDetails?.csMin}%</Table.Cell>
						<Table.Cell>{impactDetails.csMinRating}</Table.Cell>
						<Table.Cell class="text-right">
							{Math.round(impactDetails.csMinRating * (distributionDetails?.csMin / 100))}
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
	</HoverCard.Content>
</HoverCard.Root>
