<script lang="ts">
	import Chart from 'chart.js/auto';
	import type { ChartConfiguration, ChartDataset, ChartOptions, Plugin, TooltipItem } from 'chart.js';
	import { onMount } from 'svelte';
	import { formatCompactNumber, formatMatchTime } from '$lib/match-page';

	type MatchChartDataset = {
		label: string;
		data: number[];
		color: string;
		fillAbove?: string;
		fillBelow?: string;
	};

	interface Props {
		datasets: MatchChartDataset[];
		mode?: 'lead' | 'percent' | 'number';
		ariaLabel: string;
		timestamps?: number[];
	}

	let { datasets, mode = 'number', ariaLabel, timestamps = [] }: Props = $props();
	let chartCanvas: HTMLCanvasElement;
	let chart: Chart<'line'> | null = null;
	let chartReady = $state(false);
	let selectedIndex = $state(0);
	let hasInitialSelection = false;
	let fontFamily = 'ui-sans-serif, system-ui, sans-serif';
	const pointCount = $derived(Math.max(0, ...datasets.map((dataset) => dataset.data.length)));

	const getValueLabel = (value: number) => {
		if (mode === 'percent') return `${Math.round(value * 100)}%`;
		if (mode === 'lead') {
			if (value === 0) return 'Even';
			return `${value > 0 ? 'Radiant' : 'Dire'} ${formatCompactNumber(Math.abs(value))}`;
		}
		return formatCompactNumber(value);
	};

	const getTimestamp = (index: number) => timestamps[index] ?? index * 60;
	const safeSelectedIndex = $derived(
		Math.min(Math.max(0, selectedIndex), Math.max(0, pointCount - 1))
	);
	const selectedTime = $derived(formatMatchTime(getTimestamp(safeSelectedIndex)));
	const selectedValues = $derived(
		datasets
			.filter((dataset) => Number.isFinite(dataset.data[safeSelectedIndex]))
			.map((dataset) => ({
				label: dataset.label,
				value: Number(dataset.data[safeSelectedIndex]),
				color: dataset.color
			}))
	);
	const selectedValueText = $derived(
		selectedValues.map((value) => `${value.label}: ${getValueLabel(value.value)}`).join('. ')
	);

	const getBounds = () => {
		const values = datasets.flatMap((dataset) => dataset.data).filter(Number.isFinite);
		const rawMinimum = values.length > 0 ? Math.min(...values) : 0;
		const rawMaximum = values.length > 0 ? Math.max(...values) : 1;

		if (mode === 'percent') return { minimum: 0, maximum: 1 };
		if (mode === 'lead') {
			const maximumLead = Math.max(1, Math.abs(rawMinimum), Math.abs(rawMaximum));
			return { minimum: -maximumLead, maximum: maximumLead };
		}

		return {
			minimum: Math.min(0, rawMinimum),
			maximum: Math.max(1, rawMaximum * 1.06)
		};
	};

	const getChartDatasets = (): ChartDataset<'line', number[]>[] => {
		const baselineValue = mode === 'percent' ? 0.5 : 0;

		return datasets.map((dataset) => ({
			label: dataset.label,
			data: dataset.data.map((value) => Number(value)),
			borderColor: dataset.color,
			backgroundColor: dataset.color,
			borderWidth: 2,
			pointRadius: 0,
			pointHoverRadius: 4,
			pointHoverBorderWidth: 2,
			pointHoverBackgroundColor: dataset.color,
			pointHoverBorderColor: 'oklch(0.22 0.01 285)',
			tension: 0.16,
			spanGaps: true,
			fill:
				dataset.fillAbove || dataset.fillBelow
					? {
							target: { value: baselineValue },
							above: dataset.fillAbove ?? 'transparent',
							below: dataset.fillBelow ?? 'transparent'
						}
					: false
		}));
	};

	const getChartOptions = (): ChartOptions<'line'> => {
		const { minimum, maximum } = getBounds();

		return {
			responsive: true,
			maintainAspectRatio: false,
			animation: false,
			resizeDelay: 50,
			interaction: {
				mode: 'index',
				intersect: false
			},
			layout: {
				padding: { top: 8, right: 8 }
			},
			plugins: {
				legend: { display: false },
				tooltip: {
					mode: 'index',
					intersect: false,
					backgroundColor: 'oklch(0.22 0.01 285 / 0.98)',
					borderColor: 'oklch(0.37 0.01 285)',
					borderWidth: 1,
					cornerRadius: 3,
					displayColors: true,
					boxHeight: 6,
					boxWidth: 6,
					bodyColor: 'oklch(0.90 0.006 285)',
					titleColor: 'oklch(0.72 0.008 285)',
					bodyFont: { family: fontFamily, size: 12 },
					titleFont: { family: fontFamily, size: 12, weight: 500 },
					padding: 9,
					itemSort: (a: TooltipItem<'line'>, b: TooltipItem<'line'>) =>
						Number(b.parsed.y ?? 0) - Number(a.parsed.y ?? 0),
					callbacks: {
						title: (items: TooltipItem<'line'>[]) => items[0]?.label ?? '',
						label: (item: TooltipItem<'line'>) =>
							`${item.dataset.label ?? 'Value'}: ${getValueLabel(Number(item.parsed.y ?? 0))}`
					}
				}
			},
			scales: {
				x: {
					border: { display: false },
					grid: {
						color: 'oklch(0.35 0.01 285 / 0.35)',
						drawTicks: false
					},
					ticks: {
						autoSkip: true,
						maxTicksLimit: 7,
						maxRotation: 0,
						minRotation: 0,
						color: '#a3a3a3',
						font: { family: fontFamily, size: 12 },
						padding: 8
					}
				},
				y: {
					min: minimum,
					max: maximum,
					border: { display: false },
					grid: {
						color: 'oklch(0.35 0.01 285 / 0.55)',
						drawTicks: false
					},
					ticks: {
						maxTicksLimit: 5,
						color: '#a3a3a3',
						font: { family: fontFamily, size: 12 },
						padding: 9,
						callback: (value: string | number) => getValueLabel(Number(value))
					}
				}
			}
		};
	};

	const guidePlugin: Plugin<'line'> = {
		id: 'matchLineGuides',
		beforeDatasetsDraw: (currentChart) => {
			if (mode !== 'lead' && mode !== 'percent') return;

			const yScale = currentChart.scales.y;
			if (!yScale) return;
			const chartArea = currentChart.chartArea;
			const baselineValue = mode === 'percent' ? 0.5 : 0;
			const y = yScale.getPixelForValue(baselineValue);
			const context = currentChart.ctx;

			context.save();
			context.beginPath();
			context.setLineDash([4, 5]);
			context.moveTo(chartArea.left, y);
			context.lineTo(chartArea.right, y);
			context.lineWidth = 1;
			context.strokeStyle = 'oklch(0.67 0.008 285 / 0.55)';
			context.stroke();
			context.restore();
		},
		afterDraw: (currentChart) => {
			const activeElements = currentChart.tooltip?.getActiveElements() ?? [];
			const active = activeElements[0];
			if (!active) return;

			const x = active.element.x;
			const context = currentChart.ctx;
			context.save();
			context.beginPath();
			context.setLineDash([3, 4]);
			context.moveTo(x, currentChart.chartArea.top);
			context.lineTo(x, currentChart.chartArea.bottom);
			context.lineWidth = 1;
			context.strokeStyle = 'oklch(0.70 0.008 285)';
			context.stroke();
			context.restore();
		}
	};

	const getConfiguration = (): ChartConfiguration<'line', number[], string> => ({
		type: 'line',
		data: {
			labels: Array.from(
				{ length: Math.max(0, ...datasets.map((dataset) => dataset.data.length)) },
				(_, index) => formatMatchTime(getTimestamp(index))
			),
			datasets: getChartDatasets()
		},
		options: getChartOptions(),
		plugins: [guidePlugin]
	});

	const selectChartPoint = (index: number) => {
		selectedIndex = Math.min(Math.max(0, index), Math.max(0, pointCount - 1));
	};

	const syncChartSelection = () => {
		if (!chart || pointCount === 0) return;

		const activeElements = datasets.flatMap((dataset, datasetIndex) =>
			Number.isFinite(dataset.data[safeSelectedIndex])
				? [{ datasetIndex, index: safeSelectedIndex }]
				: []
		);
		const firstActive = activeElements[0];
		if (!firstActive) return;

		chart.setActiveElements(activeElements);
		const element = chart.getDatasetMeta(firstActive.datasetIndex).data[firstActive.index];
		if (element) {
			chart.tooltip?.setActiveElements(activeElements, { x: element.x, y: element.y });
		}
		chart.update('none');
	};

	$effect(() => {
		if (pointCount === 0) {
			selectedIndex = 0;
			return;
		}
		if (!hasInitialSelection) {
			selectedIndex = pointCount - 1;
			hasInitialSelection = true;
			return;
		}
		if (selectedIndex >= pointCount) selectedIndex = pointCount - 1;
	});

	$effect(() => {
		if (!chartReady || !chart) return;

		chart.data.labels = Array.from(
			{ length: Math.max(0, ...datasets.map((dataset) => dataset.data.length)) },
			(_, index) => formatMatchTime(getTimestamp(index))
		);
		chart.data.datasets = getChartDatasets();
		chart.options = getChartOptions();
		chart.update('none');
		chart.resize();
	});

	$effect(() => {
		if (!chartReady || !chart || pointCount === 0) return;
		safeSelectedIndex;
		syncChartSelection();
	});

	onMount(() => {
		fontFamily = getComputedStyle(document.body).fontFamily || fontFamily;
		const container = chartCanvas.parentElement;
		const initialiseOrResizeChart = () => {
			if (!container || container.clientWidth <= 0 || container.clientHeight <= 0) return;
			if (chart) {
				chart.resize();
				return;
			}

			chart = new Chart(chartCanvas, getConfiguration());
			chartReady = true;
		};
		const resizeObserver = new ResizeObserver(initialiseOrResizeChart);
		if (container) resizeObserver.observe(container);
		const frameId = requestAnimationFrame(initialiseOrResizeChart);

		return () => {
			cancelAnimationFrame(frameId);
			resizeObserver.disconnect();
			chart?.destroy();
			chart = null;
		};
	});
</script>

<figure class="min-w-0">
	<div class="relative h-64 w-full min-w-0 sm:h-72" role="img" aria-label={ariaLabel}>
		<canvas bind:this={chartCanvas} aria-hidden="true"></canvas>
	</div>
	{#if pointCount > 0}
		<figcaption class="mt-3 border-t border-zinc-800/80 pt-3">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p class="text-xs uppercase tracking-wide text-zinc-400">Selected moment</p>
					<time class="text-sm font-semibold tabular-nums text-zinc-100">{selectedTime}</time>
				</div>
				<div class="flex flex-wrap gap-x-4 gap-y-1" aria-live="polite">
					{#each selectedValues as value}
						<span class="inline-flex items-center gap-1.5 text-sm text-zinc-200">
							<span class="h-2 w-2 rounded-full" style:background-color={value.color}></span>
							<span>{value.label}</span>
							<strong class="font-semibold tabular-nums text-zinc-100">{getValueLabel(value.value)}</strong>
						</span>
					{/each}
				</div>
			</div>
			<input
				type="range"
				min="0"
				max={pointCount - 1}
				value={safeSelectedIndex}
				oninput={(event) => selectChartPoint(Number(event.currentTarget.value))}
				aria-label="Inspect chart by match time"
				aria-valuetext={`${selectedTime}. ${selectedValueText}`}
				class="mt-2 h-11 w-full cursor-pointer accent-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			/>
			<p class="text-xs text-zinc-400">Drag or use the arrow keys to inspect each minute.</p>
		</figcaption>
	{/if}
</figure>
