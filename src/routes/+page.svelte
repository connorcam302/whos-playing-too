<script>
    export let data;

    const {matches} = data;
    console.log(matches);
</script>

<div>
    {#each matches as match}
        <div>
            {match.playerId}
            {match.matchId}
        </div>
    {/each}
</div>
