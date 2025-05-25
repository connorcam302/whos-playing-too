<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';

	let chart;
	let canvas = $state();

	let { stats = [], colour } = $props();

	onMount(() => {
		if (canvas) {
			const ctx = canvas.getContext('2d');
			chart = new Chart(ctx, {
				plugins: [
					{
						afterDraw: (chart) => {
							if (chart.tooltip?._active?.length) {
								let x = chart.tooltip._active[0].element.x;
								let yAxis = chart.scales.y;
								let ctx = chart.ctx;
								ctx.save();
								ctx.beginPath();
								ctx.moveTo(x, yAxis.top);
								ctx.lineTo(x, yAxis.bottom);
								ctx.lineWidth = 1;
								ctx.strokeStyle = 'white'; // Grid color
								ctx.stroke();
								ctx.restore();
							}
						},
						id: 'customLine'
					}
				],
				type: 'line',
				data: {
					datasets: [
						{
							label: 'Stat',
							data: stats,
							borderColor: colour, // Orange for user data
							backgroundColor: colour,
							fill: false
						}
					]
				},
				options: {
					plugins: {
						tooltip: {
							mode: 'index',
							intersect: false
						},
						legend: {
							display: false
						}
					},
					responsive: true,
					scales: {
						x: {
							ticks: {
								display: false // Hide x-axis labels
							},
							grid: {
								color: '#57534e' // Vertical line color
							}
						},
						y: {
							title: {
								display: true,
								color: '#a8a29e', // Label text color
								display: false
							},
							grid: {
								display: false,
								color: '#57534e' // Horizontal line color
							},
							ticks: {
								display: false,
								color: '#a8a29e' // Tick text backgroundColor
							}
						}
					}
				}
			});
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<canvas bind:this={canvas}></canvas>
