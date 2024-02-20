<script lang="ts">
	export let data: number[][];

	import WinChart from '$lib/components/profile/WinChart.svelte';
</script>

<svelte:head>
	<title>whos-playing | Stats</title>
</svelte:head>

<div class="w-full">
	<WinChart data={data.graph} type="collective" />
</div>
