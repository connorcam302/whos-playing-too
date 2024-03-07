<script lang="ts">
	import chartjs from 'chart.js/auto';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	export let data: { role: number; count: number }[],
		cutout: number = 50;
	let blank = false;
	if (data.length === 0) {
		blank = true;
		data = [{ role: -1, count: 1 }];
	}
	console.log(data);

	const roleColour = (role: number) => {
		switch (role) {
			case 1:
				return '#4555A9';
			case 2:
				return '#308794';
			case 3:
				return '#C47716';
			case 4:
				return '#C14755';
			case 5:
				return '#3B9C75';
			default:
				return '#71717a';
		}
	};

	const roleString = (role: number) => {
		switch (role) {
			case 1:
				return 'Carry';
			case 2:
				return 'Mid';
			case 3:
				return 'Offlane';
			case 4:
				return 'Support';
			case 5:
				return 'Hard Support';
			default:
				return 'No Matches';
		}
	};

	const roleImage = (role: number) => {
		return `/roles/pos${role}-white.svg`;
	};

	data = data.sort((a, b) => b.count - a.count);

	const roles = data.map((role) => role.role);
	const counts = data.map((role) => role.count);
	const labels = roles.map((role) => roleString(role));
	const colours = roles.map((role) => roleColour(role));
	const images = roles.map((role) => roleImage(role));

	let ctx;
	let chartCanvas: any;

	onMount(() => {
		ctx = chartCanvas.getContext('2d');
		let chart = new chartjs(ctx, {
			type: 'doughnut',
			data: {
				labels,
				datasets: [
					{
						label: 'Matches',
						data: counts,
						backgroundColor: colours,
						hoverOffset: 4
					}
				]
			},
			options: {
				cutout,
				elements: {
					arc: {
						borderWidth: 0
					}
				},
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						enabled: blank === false ? true : false
					}
				}
			}
		});
	});
</script>

<div
	class="h-full w-full"
	id="container"
	style={`background-image: url("/roles/${blank === false ? 'pos' + roles[0] : 'blank'}.svg")`}
>
	<canvas bind:this={chartCanvas} id="myChart" class="h-full w-full"></canvas>
</div>

<style>
	#container {
		background-size: 50%; /* Adjust to your needs */
		background-repeat: no-repeat; /* Adjust to your needs */
		background-position: center center; /* Center the background image */
	}
</style>
