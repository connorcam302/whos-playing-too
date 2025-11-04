<script lang="ts">
	import Bar from '../Bar.svelte';

	interface Props {
		winrate: number;
	}

	let { winrate }: Props = $props();
</script>

<div>
	<div class="pb-1 text-sm opacity-85">{Math.round(winrate * 1000) / 10}%</div>
	<Bar percentage={winrate * 100} />
</div>
