<script lang="ts">
	import Bar from '../Bar.svelte';

	interface Props {
		matches: number;
		maxMatches: number;
	}

	let { matches, maxMatches }: Props = $props();
</script>

<div>
	<div class="pb-1 text-sm opacity-85">{matches}</div>
	<Bar colour="#38bdf8" percentage={(matches / maxMatches) * 100} />
</div>
