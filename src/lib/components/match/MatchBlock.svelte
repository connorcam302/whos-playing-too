<script lang='ts'>
import { getLobbyType, getGameMode } from '$lib/functions';
import UilExchange from 'virtual:icons/uil/exchange'
import UilLineAlt from 'virtual:icons/uil/line-alt'
import UilQuestion from '~icons/uil/question'
import PlayerData from '$lib/components/match/PlayerData.svelte';
    export let match: any;
    const { matchData, radiant, dire } = match;
    console.log(matchData);

</script>

<div>
    <div class='my-2'>
    <div class='flex items-center gap-4'>
    <div>
    {matchData.id}
    </div>
    <div>
    {matchData.winner[0].toUpperCase() + matchData.winner.slice(1)} 
    </div>
    <div class='flex items-center gap-2'>
    {#if matchData.lobby === 7}
        <UilExchange />
    {:else if matchData.lobby === 0}
        <UilLineAlt />
    {:else}
        <UilQuestion />
    {/if}
    {getGameMode(matchData.gameMode)}
    </div>
    </div>
    {#each radiant as player}
       <PlayerData player={player}/>
    {/each}
    {#each dire as player}
       <PlayerData player={player}/>
    {/each}
    </div>
</div>

