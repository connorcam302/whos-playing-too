<script lang="ts">
	import MaterialSymbolsArrowUpward from '~icons/material-symbols/arrow-upward-rounded';
	import MaterialSymbolsArrowDownward from '~icons/material-symbols/arrow-downward-rounded';
	import TickerChart from './TickerChart.svelte';
	interface Props {
		stat: any;
		name: any;
		reverse?: boolean;
	}

	let { stat, name, reverse = false }: Props = $props();
</script>

<div
	class="flex w-64 flex-col items-center justify-center gap-1 rounded-xl bg-zinc-800 px-4 py-2 text-xl"
>
	<div class="text-center text-3xl">{name}</div>
	{#if !reverse}
		{#if stat['2024'] > stat['2023']}
			<div class="flex items-center justify-center gap-1">
				<div class="flex items-center text-4xl">
					{Math.round((stat['2024'] + Number.EPSILON) * 100) / 100}
				</div>
				<div class="flex items-center text-emerald-500"><MaterialSymbolsArrowUpward /></div>
				<div class="flex items-center text-emerald-500">
					{Math.round((stat['2024'] - stat['2023'] + Number.EPSILON) * 100) / 100}
				</div>
			</div>
		{:else}
			<div class="flex items-center justify-center gap-1">
				<div class="flex items-center text-4xl">
					{Math.round((stat['2024'] + Number.EPSILON) * 100) / 100}
				</div>
				<div class="flex items-center text-red-500"><MaterialSymbolsArrowDownward /></div>
				<div class="flex items-center text-red-500">
					{Math.round((stat['2024'] - stat['2023'] + Number.EPSILON) * 100) / 100}
				</div>
			</div>
		{/if}
	{:else if stat['2024'] < stat['2023']}
		<div class="flex items-center justify-center gap-1">
			<div class="flex items-center text-4xl">
				{Math.round((stat['2024'] + Number.EPSILON) * 100) / 100}
			</div>
			<div class="flex items-center text-emerald-500"><MaterialSymbolsArrowDownward /></div>
			<div class="flex items-center text-emerald-500">
				{Math.round((stat['2024'] - stat['2023'] + Number.EPSILON) * 100) / 100}
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center gap-2">
			<div class="flex items-center text-4xl">
				{Math.round((stat['2024'] + Number.EPSILON) * 100) / 100}
			</div>
			<div class="flex items-center text-red-500"><MaterialSymbolsArrowUpward /></div>
			<div class="flex items-center text-red-500">
				{Math.round((stat['2024'] - stat['2023'] + Number.EPSILON) * 100) / 100}
			</div>
		</div>
	{/if}
	<div class="flex w-full">
		<TickerChart stats={stat} colour={'#0e7490'} />
	</div>
</div>
