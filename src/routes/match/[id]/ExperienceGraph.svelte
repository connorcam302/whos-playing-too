<script lang="ts">
	import chartjs from 'chart.js/auto';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	export let data: number[];

	let chartLabels = Array.from({ length: data.length }, (_, i) => (i + 1).toString());

	let ctx;
	let chartCanvas: any;

	const boundary = () => {
		let min = Math.min(...data);
		let max = Math.max(...data);

		return Math.ceil(Math.max(Math.abs(min), Math.abs(max)) / 5000) * 5000;
	};

	let boundaryValue = boundary();

	onMount(() => {
		ctx = chartCanvas.getContext('2d');
		let chart = new chartjs(ctx, {
			plugins: [
				{
					afterDraw: (chart) => {
						//@ts-expect-error tooltip._active exists
						if (chart.tooltip?._active?.length) {
							//@ts-expect-error tooltip._active exists
							let x = chart.tooltip._active[0].element.x;
							let yAxis = chart.scales.y;
							let ctx = chart.ctx;
							ctx.save();
							ctx.beginPath();
							ctx.moveTo(x, yAxis.top);
							ctx.lineTo(x, yAxis.bottom);
							ctx.lineWidth = 1;
							ctx.strokeStyle = '#e5e5e5';
							ctx.stroke();
							ctx.restore();
						}
					},
					id: 'customLine'
				},
				{
					afterLayout: (chart) => {
						let ctx = chart.ctx;
						ctx.save();
						let yAxis = chart.scales.y;
						let yThreshold = yAxis.getPixelForValue(440);
						let gradient = ctx.createLinearGradient(0, yAxis.top, 0, yAxis.bottom);
						gradient.addColorStop(0, 'green');
						let offset = (1 / yAxis.bottom) * yThreshold;
						gradient.addColorStop(offset, 'green');
						gradient.addColorStop(offset, 'red');
						gradient.addColorStop(1, 'red');
						chart.data.datasets[0].borderColor = gradient;
						ctx.restore();
					}
				}
			],
			type: 'line',
			data: {
				labels: chartLabels,
				datasets: [
					{
						label: 'Experience Lead',
						data: data,
						borderColor: '#f43f5e',
						backgroundColor: '#f43a5e',
						pointRadius: 0,
						fill: {
							above: 'rgba(34, 197, 94, 0.2)',
							below: 'rgba(220, 38, 38, 0.2)',
							target: { value: 0 }
						}
					}
				]
			},
			options: {
				plugins: {
					legend: {
						labels: {
							color: '#e5e5e5',
							boxHeight: 8,
							boxWidth: 8,
							usePointStyle: true,
							textAlign: 'left',
							font: { size: 16 }
						},
						display: false,
						position: 'right',
						align: 'center',
						onHover: (event, legendItem, legend) => {
							const chart = legend.chart;
							chart.config.data.datasets.forEach((d) => {
								if (legendItem.text !== d.label) {
									d.backgroundColor = 'rgba(200,200,200,0.2)';
									d.borderColor = 'rgba(200,200,200,0.2)';
								}
							});
							chart.update();
						},
						onLeave: (event, legendItem, legend) => {
							const chart = legend.chart;
							chart.config.data.datasets.forEach((d, index) => {
								d.backgroundColor =
									data.length > 1 ? `hsl(${(d.id * 18) % 360}, 70%, 50%)` : '#f43f5e';
								d.borderColor = data.length > 1 ? `hsl(${(d.id * 18) % 360}, 70%, 50%)` : '#f43f5e';
							});
							chart.update();
						}
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						itemSort: function (a: any, b: any) {
							return b.raw - a.raw;
						},
						displayColors: false,
						bodyFont: {
							size: 16
						},

						callbacks: {
							title: () => {
								return '';
							},
							label: (value) => {
								if (value.raw > 0) {
									return `Radiant XP Lead: ${value.raw}`;
								}
								if (value.raw < 0) {
									return `Dire XP Lead: ${value.raw * -1}`;
								}
								return 'Even';
							}
						}
					}
				},
				scales: {
					y: {
						suggestedMin: boundaryValue * -1,
						suggestedMax: boundaryValue,
						ticks: {
							color: '#e5e5e5'
						},
						grid: {
							color: '#404040'
						}
					},
					x: {
						display: true,
						ticks: {
							color: '#e5e5e5'
						},
						grid: {
							display: true,
							color: '#404040'
						}
					}
				}
			}
		});
	});
</script>

<canvas bind:this={chartCanvas} id="myChart" class="w-full"></canvas>
