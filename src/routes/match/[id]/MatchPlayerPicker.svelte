<script lang="ts">
	import { getRoleIcon } from '$lib/functions';
	import type { MatchPlayerOverview } from '$lib/match-page';

	interface Props {
		players: MatchPlayerOverview[];
		selectedSlot: number;
		onSelect: (playerSlot: number) => void;
	}

	let { players, selectedSlot, onSelect }: Props = $props();

	const teamPlayers = (isRadiant: boolean) => players.filter((player) => player.isRadiant === isRadiant);
	const getPlayerLabel = (player: MatchPlayerOverview) =>
		player.user || !player.isAnonymous ? player.name : player.hero.name;
</script>

<div class="max-w-full snap-x snap-mandatory overflow-x-auto rounded-md border border-border bg-zinc-950/35 p-2">
	<div class="flex min-w-max items-center gap-3">
		{#each [true, false] as isRadiant}
			<div class="flex items-center gap-1.5">
				<span class="w-14 text-xs font-medium text-zinc-400">{isRadiant ? 'Radiant' : 'Dire'}</span>
				{#each teamPlayers(isRadiant) as player}
					<button
						type="button"
						onclick={() => onSelect(player.playerSlot)}
						class={`group flex min-h-11 snap-start items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
							selectedSlot === player.playerSlot
								? 'border-zinc-500 bg-zinc-800 text-zinc-100'
								: 'border-transparent text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200'
						}`}
						aria-pressed={selectedSlot === player.playerSlot}
						aria-label={`Focus ${getPlayerLabel(player)} on ${player.hero.name}`}
						title={`${getPlayerLabel(player)}, ${player.hero.name}`}
					>
						<img src={player.hero.img} alt="" class="h-8 w-11 rounded-sm object-cover" />
						<span class="flex max-w-24 items-center gap-1.5 truncate text-xs font-medium">
							{#if player.positionNumber}
								<img
									src={getRoleIcon(player.positionNumber)}
									alt=""
									title={player.position || player.role}
									class="h-4 w-4 shrink-0"
								/>
							{/if}
							<span class="truncate">{getPlayerLabel(player)}</span>
						</span>
					</button>
				{/each}
			</div>
			{#if isRadiant}<div class="h-8 w-px bg-zinc-800"></div>{/if}
		{/each}
	</div>
</div>
