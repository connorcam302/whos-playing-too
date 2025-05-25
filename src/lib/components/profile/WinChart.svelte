<script lang="ts">
	import chartjs from 'chart.js/auto';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	interface Props {
		data: {
			data: number[];
			player: { username: string; accounts: number[]; id: number };
		}[];
		type: string;
	}

	let { data, type }: Props = $props();

	const makeDataSets = (
		data: {
			data: number[];
			player: { username: string; accounts: number[]; id: number };
		}[]
	) => {
		const dataSets = [];
		for (let i = 0; i < data.length; i++) {
			dataSets.push({
				id: data[i].player.id,
				label: data[i].player.username,
				backgroundColor:
					data.length > 1 ? `hsl(${(data[i].player.id * 18) % 360}, 70%, 50%)` : '#38bdf8',
				borderColor:
					data.length > 1 ? `hsl(${(data[i].player.id * 18) % 360}, 70%, 50%)` : '#38bdf8',
				data: data[i].data,
				pointRadius: 0
			});
		}
		return dataSets;
	};

	let dataSets = makeDataSets(data);
	let chartLabels: string[];

	if (type == 'days' || type == 'collective') {
		chartLabels = Array.from({ length: dataSets[0].data.length }, (_, i) =>
			dayjs().subtract(i, 'day').format('DD/MM')
		).reverse();
	} else {
		chartLabels = Array.from({ length: dataSets[0].data.length }, (_, i) => (i + 1).toString());
	}

	let ctx;
	let chartCanvas: any = $state();

	const findHighestValue = (arrayOfArrays: number[][]) => {
		let highestValue = Number.MIN_SAFE_INTEGER;

		for (const subArray of arrayOfArrays) {
			for (const number of subArray) {
				if (number > highestValue) {
					highestValue = number;
				}
			}
		}

		return highestValue;
	};
	const findLowestValue = (arrayOfArrays: number[][]) => {
		let lowestValue = Number.MAX_SAFE_INTEGER;

		for (const subArray of arrayOfArrays) {
			for (const number of subArray) {
				if (number < lowestValue) {
					lowestValue = number;
				}
			}
		}

		return lowestValue;
	};

	const highest = findHighestValue(dataSets.map((dataSet) => dataSet.data));
	const lowest = findLowestValue(dataSets.map((dataSet) => dataSet.data));

	onMount(() => {
		ctx = chartCanvas.getContext('2d');

		const yAxis =
			Math.abs(lowest) > Math.max(highest) ? Math.abs(lowest) + 1 : Math.max(highest) + 1;

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
				}
			],
			type: 'line',
			data: {
				labels: chartLabels,
				datasets: dataSets
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
						display: type !== 'collective' ? false : true,
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
									data.length > 1 ? `hsl(${(d.id * 18) % 360}, 70%, 50%)` : '#38bdf8';
								d.borderColor = data.length > 1 ? `hsl(${(d.id * 18) % 360}, 70%, 50%)` : '#38bdf8';
							});
							chart.update();
						}
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						itemSort: function (a: any, b: any) {
							return b.raw - a.raw;
						}
					}
				},
				scales: {
					y: {
						suggestedMin: yAxis * -1,
						suggestedMax: yAxis,
						ticks: {
							color: '#e5e5e5'
						},
						grid: {
							color: '#404040'
						}
					},
					x: {
						display: type !== 'results' ? true : false,
						ticks: {
							color: '#e5e5e5'
						},
						grid: {
							display: type !== 'results' ? true : false,
							color: '#404040'
						}
					}
				}
			}
		});
	});
</script>

<canvas bind:this={chartCanvas} id="myChart"></canvas>
