<script>
import MatchBlock from '$lib/components/match/MatchBlock.svelte';
    export let data;

    const { matchBlocks} = data;
    console.log(matchBlocks)
</script>

<div>
    {#each matchBlocks as match}
        <MatchBlock {match} />
    {/each}
</div>


