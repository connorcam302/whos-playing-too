<script>
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	export let data;

	const { matchBlocks, heroStats } = data;
	console.log(matchBlocks, heroStats);
</script>

<div>
	<HeroStatbox {heroStats} />
	{#each matchBlocks as match}
		<MatchBlock {match} />
	{/each}
</div>
