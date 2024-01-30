<script lang="ts">
	export let data: number[][];
	console.log(data);

	import WinChart from '$lib/components/profile/WinChart.svelte';
</script>

<div class="w-full">
	<WinChart data={data.graph} type="collective" />
</div>
