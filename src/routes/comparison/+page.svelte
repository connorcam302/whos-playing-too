<script lang="ts">
	interface Stats {
		rankedWins: number;
		rankedLosses: number;
		wins: number;
		losses: number;
		id: number;
		username: string;
		kills: number;
		deaths: number;
		assists: number;
		lastHits: number;
		heroDamage: number;
		towerDamage: number;
		gpm: number;
		xpm: number;
		impact: number;
		duration: number;
		roleDistribution: RoleDistribution[];
	}

	interface RoleDistribution {
		role: number;
		count: number;
	}

	import RoleDoughnut from '$lib/components/stats/RoleDoughnut.svelte';
	import { toTime } from '$lib/functions.js';
	import tippy from 'sveltejs-tippy';
	import { fade } from 'svelte/transition';

	export let data;

	const { playerList } = data;

	const fetchPlayerData: Promise<Stats> = async (player: number) => {
		const data = await fetch(`/api/stats/${player}`);
		const json = await data.json();
		return await json;
	};

	const getColour = (position: number) => {
		if (position === 1) return '#FFD70020';
		if (position === 2) return '#C0C0C020';
		if (position === 3) return '#CD7F3220';
		return '#FFFFFF00';
	};

	const getRank = (id, stat, data) => {
		// Sort the data array based on the given stat
		let sortedData;
		if (['duration', 'deaths'].includes(stat)) {
			sortedData = [...data].sort((a, b) => a[stat] - b[stat]);
		} else {
			sortedData = [...data].sort((a, b) => b[stat] - a[stat]);
		}

		// Find the index of the object with the given ID in the sorted array
		const index = sortedData.findIndex((obj) => obj.id === id);

		// Return the rank (add 1 because ranks start from 1, not 0)
		return index + 1;
	};

	$: playerMenu = false;
	const togglePlayerMenu = () => {
		playerMenu = !playerMenu;
	};

	const addToPlayerStats = (player) => {
		const index = playerStats.findIndex((obj) => obj.id === player.id);
		if (index === -1) {
			playerStats = [...playerStats, player];
			togglePlayerMenu();
		}
	};

	const getUpdatedPlayerList = () => {
		return playerList.filter((player) => !playerStats.some((obj) => obj.id === player.id));
	};
</script>

<svelte:head>
	<title>whos-playing | Comparison</title>
</svelte:head>

<div>
	<div class="flex flex-wrap items-center justify-center gap-4">
		{#each playerStats as player}
			<div class="flex w-48 flex-col gap-2 rounded-xl bg-zinc-800 p-2">
				<div class="text-center text-2xl">{player.username}</div>
				<div class="mx-auto h-24 w-24">
					<RoleDoughnut data={player.roleDistribution} cutout={40} />
				</div>
				<div>
					<div class="flex w-full">
						<div>Ranked WR</div>
						<div class="grow" />
						<div>
							{Math.floor((player.rankedWins / (player.rankedWins + player.rankedLosses)) * 100)}%
						</div>
					</div>
					<div class="flex h-2 w-full items-end">
						<div
							class="h-1 bg-green-500 duration-200 hover:h-1.5 hover:bg-green-600"
							style="width: {Math.floor(
								(player.rankedWins / (player.rankedWins + player.rankedLosses)) * 100
							)}%"
							use:tippy={{
								content: `Wins: ${player.rankedWins}`,
								placement: 'bottom',
								theme: 'light'
							}}
						/>
						<div
							class="h-1 grow bg-red-500 duration-200 hover:h-1.5 hover:bg-red-600"
							use:tippy={{
								content: `Losses: ${player.rankedLosses}`,
								placement: 'bottom',
								theme: 'light'
							}}
						/>
					</div>
				</div>
				<div>
					<div class="flex w-full">
						<div>Unranked WR</div>
						<div class="grow" />
						<div>
							{Math.floor((player.wins / (player.wins + player.losses)) * 100)}%
						</div>
					</div>
					<div class="flex h-2 w-full items-end">
						<div
							class="h-1 bg-green-500 duration-200 hover:h-1.5 hover:bg-green-600"
							style="width: {Math.floor((player.wins / (player.wins + player.losses)) * 100)}%"
							use:tippy={{
								content: `Wins: ${player.wins}`,
								placement: 'bottom',
								theme: 'light'
							}}
						/>
						<div
							class="h-1 grow bg-red-500 duration-200 hover:h-1.5 hover:bg-red-600"
							use:tippy={{
								content: `Losses: ${player.losses}`,
								placement: 'bottom',
								theme: 'light'
							}}
						/>
					</div>
				</div>
				<table>
					<tr
						class="border-y-[1px] border-white border-opacity-10"
						style="background-color: {getColour(getRank(player.id, 'kills', playerStats))};"
					>
						<td class="pl-1">Kills</td>
						<td class="pr-1 text-right">{Math.round(player.kills * 100) / 100}</td>
					</tr>
					<tr
						class="border-y-[1px] border-white border-opacity-10"
						style="background-color: {getColour(getRank(player.id, 'deaths', playerStats))}"
					>
						<td class="pl-1">Deaths</td>
						<td class="pr-1 text-right">{Math.round(player.deaths * 100) / 100}</td>
					</tr>
					<tr
						class="border-y-[1px] border-white border-opacity-10"
						style="background-color: {getColour(getRank(player.id, 'assists', playerStats))}"
					>
						<td class="pl-1">Assists</td>
						<td class="pr-1 text-right">{Math.round(player.assists * 100) / 100}</td>
					</tr>
					<tr
						class="border-y-[1px] border-white border-opacity-10"
						style="background-color: {getColour(getRank(player.id, 'impact', playerStats))}"
					>
						<td class="pl-1">Impact</td>
						<td class="pr-1 text-right">{Math.round(player.impact)}</td>
					</tr>

					<tr
						class="border-y-[1px] border-white border-opacity-10"
						style="background-color: {getColour(getRank(player.id, 'heroDamage', playerStats))}"
					>
						<td class="pl-1">Hero DMG</td>
						<td class="pr-1 text-right">{Math.round(player.heroDamage)}</td>
					</tr>
					<tr
						class="border-y-[1px] border-white border-opacity-10"
						style="background-color: {getColour(getRank(player.id, 'towerDamage', playerStats))}"
					>
						<td class="pl-1">Tower DMG</td>
						<td class="pr-1 text-right">{Math.round(player.towerDamage)}</td>
					</tr>
					<tr
						class="border-y-[1px] border-white border-opacity-10"
						style="background-color: {getColour(getRank(player.id, 'gpm', playerStats))}"
					>
						<td class="pl-1">GPM</td>
						<td class="pr-1 text-right">{Math.round(player.gpm)}</td>
					</tr>
					<tr
						class="border-y-[1px] border-white border-opacity-10"
						style="background-color: {getColour(getRank(player.id, 'xpm', playerStats))}"
					>
						<td class="pl-1">XPM</td>
						<td class="pr-1 text-right">{Math.round(player.xpm)}</td>
					</tr>
					<tr
						class="border-y-[1px] border-white border-opacity-10"
						style="background-color: {getColour(getRank(player.id, 'duration', playerStats))}"
					>
						<td class="pl-1">Duration</td>
						<td class="pr-1 text-right">{toTime(Math.round(player.duration))}</td>
					</tr>
				</table>
			</div>
		{/each}
		<button class="rounded-xl bg-zinc-800 px-2 py-1 text-lg" on:click={() => (playerMenu = true)}
			>Add Player</button
		>
	</div>
</div>

{#if playerMenu}
	<div
		transition:fade={{ duration: 200 }}
		id="backdrop"
		class="fixed top-0 flex h-screen w-screen cursor-default items-center justify-center"
		on:click|self={() => togglePlayerMenu()}
		on:keypress={(e) => e.key === 'Escape' && togglePlayerMenu()}
		tabindex="0"
		role="button"
	>
		<div class="absolute w-64 rounded-xl bg-zinc-900 p-4 opacity-100">
			<div class="flex flex-col gap-2">
				{#each getUpdatedPlayerList() as player}
					<button
						class="rounded-xl bg-zinc-800 px-2 py-1"
						on:click={async () => addToPlayerStats(await fetchPlayerData(player.id))}
					>
						{player.username}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	#backdrop {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.5);
	}
</style>
