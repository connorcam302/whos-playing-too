<script>
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import PlayerStatbox from '$lib/components/stats/PlayerStatbox.svelte';
	export let data;

	const { matchBlocks, heroStats, playerStats } = data;
	console.log(matchBlocks, heroStats, playerStats);
</script>

<div>
	<div class="flex flex-wrap gap-4">
		<div class="w-[480px]">
			<HeroStatbox {heroStats} />
		</div>
		<div class="w-[480px]">
			<PlayerStatbox {playerStats} />
		</div>
	</div>
	{#each matchBlocks as match}
		<MatchBlock {match} />
	{/each}
</div>
