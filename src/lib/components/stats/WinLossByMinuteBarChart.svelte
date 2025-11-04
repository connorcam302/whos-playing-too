<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	//import * as Chart from '$lib/components/ui/chart/index.js';
	import {
		Axis,
		Bar,
		BarChart,
		Bars,
		Chart,
		Layer,
		Spline,
		type ChartContextValue
	} from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import { scaleBand, scaleOrdinal, scaleTime } from 'd3-scale';

	// Shared state for the docs layout
	export const shared = $state<{
		renderContext: ComponentProps<typeof Layer>['type'];
		debug: boolean;
	}>({
		renderContext: 'svg',
		debug: false
	});

	const { data } = $props();

	const chartData = data.map((d) => {
		const total = d.wins + d.losses;
		const winRate = total > 0 ? (d.wins / total) * 100 : 0;
		let colour;
		if (winRate > 52) {
			if (winRate > 56) {
				colour = '#16a34a';
			}
			colour = '#84cc16';
		} else if (winRate < 48) {
			if (winRate < 44) {
				colour = '#dc2626';
			}
			colour = '#f97316';
		} else {
			colour = '#eab308';
		}
		return { ...d, total, winRate, colour };
	});
</script>

<Card.Root>
	<Card.Header class="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
		<div class="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
			<Card.Title>Win Rate by Duration</Card.Title>
			<Card.Description>Each bar shows win percentage for that minute group</Card.Description>
		</div>
	</Card.Header>
	<div class="h-[300px] rounded-sm border p-4">
		<Chart
			data={chartData}
			x="minutes"
			xScale={scaleBand().padding(0.4)}
			y="total"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Layer type={shared.renderContext}>
				<Axis placement="left" grid rule class="text-white" />
				<Axis placement="bottom" rule />
				<Bars>
					{#each chartData as d, i}
						<Bar data={d} strokeWidth={1} style="fill: {d.colour};" />
					{/each}
				</Bars>
			</Layer>
		</Chart>
	</div>
	<Card.Footer>
		<div class="text-muted-foreground px-6 py-4 text-sm">
			Red = low winrate, Amber = average, Green = strong performance
		</div>
	</Card.Footer>
</Card.Root>
