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
		mostPlayedHeroes: { count: number; hero: Hero }[];
		versatility: number;
	}

	interface RoleDistribution {
		role: number;
		count: number;
	}

	interface Hero {
		id: number;
		name: string;
		img: string;
	}

	import RoleDoughnut from '$lib/components/stats/RoleDoughnut.svelte';
	import HeroiconsXMark from '~icons/heroicons/x-mark';
	import UilExchange from '~icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import IcOutlineSearch from '~icons/ic/outline-search';
	import SimpleIconsRedhat from '~icons/simple-icons/redhat';
	import { toTime } from '$lib/functions.js';
	import tippy from 'sveltejs-tippy';
	import { fade } from 'svelte/transition';
	import WinChart from '$lib/components/profile/WinChart.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { tick } from 'svelte';

	export let data;

	const { playerList, heroList } = data;

	const calculateWinRate = (wins: number, losses: number) => {
		return Math.floor((wins / (wins + losses)) * 100);
	};

	$: pos1 = true;
	$: pos2 = true;
	$: pos3 = true;
	$: pos4 = true;
	$: pos5 = true;

	$: ranked = true;
	$: unranked = true;

	$: smurfs = false;

	$: hero = -1;

	$: time = 9999;

	$: searchPlayer = '';
	const searchPlayersByName = (allPlayers, searchString) => {
		const lowerSearchString = searchString.toLowerCase();

		return allPlayers.filter((player) => player.username.toLowerCase().includes(lowerSearchString));
	};

	const fetchPlayerData: Promise<Stats> = async (player: number) => {
		const data = await fetch(
			`/api/stats/${player}?roles=[${pos1 ? 1 : -1},${pos2 ? 2 : -1},${pos3 ? 3 : -1},${
				pos4 ? 4 : -1
			},${pos5 ? 5 : -1}]&lobby=[${ranked ? 7 : -1},${
				unranked ? 0 : -1
			}]&time=${time}&hero=${hero}&smurf=${smurfs}`
		);
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

	$: playerStats = [];

	const addToPlayerStats = (player) => {
		const index = playerStats.findIndex((obj) => obj.id === player.id);
		searchPlayer = '';
		if (index === -1) {
			playerStats = [...playerStats, player];
			togglePlayerMenu();
		}
	};

	const getUpdatedPlayerList = () => {
		return playerList.filter((player) => !playerStats.some((obj) => obj.id === player.id));
	};

	const removeFromPlayerStats = (id) => {
		playerStats = playerStats.filter((player) => player.id !== id);
	};

	const handleRoleChange = (role: number) => {
		let currentRole;
		switch (role) {
			case 1:
				currentRole = pos1;
				break;
			case 2:
				currentRole = pos2;
				break;
			case 3:
				currentRole = pos3;
				break;
			case 4:
				currentRole = pos4;
				break;
			case 5:
				currentRole = pos5;
				break;
		}
		if (
			Number(pos1) + Number(pos2) + Number(pos3) + Number(pos4) + Number(pos5) > 1 ||
			currentRole === false
		) {
			switch (role) {
				case 1:
					pos1 = !pos1;
					break;
				case 2:
					pos2 = !pos2;
					break;
				case 3:
					pos3 = !pos3;
					break;
				case 4:
					pos4 = !pos4;
					break;
				case 5:
					pos5 = !pos5;
					break;
			}

			updatePlayerData();
		}
	};

	const handleLobbyChange = (lobby: number) => {
		let currentLobby;
		switch (lobby) {
			case 0:
				currentLobby = unranked;
				break;
			case 7:
				currentLobby = ranked;
				break;
		}
		if (Number(ranked) + Number(unranked) > 1 || currentLobby === false) {
			switch (lobby) {
				case 0:
					unranked = !unranked;
					break;
				case 7:
					ranked = !ranked;
					break;
			}

			updatePlayerData();
		}
	};

	const handleTimeChange = () => {
		updatePlayerData();
	};

	const handleSmurfChange = () => {
		smurfs = !smurfs;
		updatePlayerData();
	};

	const handleHeroChange = () => {
		updatePlayerData();
	};

	const updatePlayerData = async () => {
		const playerData = playerStats.map((player) => fetchPlayerData(player.id));
		playerStats = await Promise.all(playerData);
	};

	let searchInput: HTMLInputElement;
	const openPlayerMenu = async () => {
		togglePlayerMenu();
		await tick();
		searchInput?.focus();
	};
</script>

<svelte:head>
	<title>whos-playing | Comparison</title>
</svelte:head>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap justify-center gap-6">
		<div class="flex flex-col gap-1 text-sm">
			Roles
			<div class="flex gap-1">
				<button
					on:click={() => handleRoleChange(1)}
					class="h-10 w-10 rounded-xl bg-zinc-800 p-1 transition duration-100"
					style="background-color: {pos1 ? '#27272a' : '#18181b'};"
					use:tippy={{
						content: `Carry`,
						placement: 'bottom',
						theme: 'light'
					}}
				>
					<img src="/roles/pos1.svg" alt="pos1" />
				</button>
				<button
					on:click={() => handleRoleChange(2)}
					class="h-10 w-10 rounded-xl bg-zinc-800 p-1 transition duration-100"
					style="background-color: {pos2 ? '#27272a' : '#18181b'};"
					use:tippy={{
						content: `Mid`,
						placement: 'bottom',
						theme: 'light'
					}}
				>
					<img src="/roles/pos2.svg" alt="pos2" />
				</button>
				<button
					on:click={() => handleRoleChange(3)}
					class="h-10 w-10 rounded-xl bg-zinc-800 p-1 transition duration-100"
					style="background-color: {pos3 ? '#27272a' : '#18181b'};"
					use:tippy={{
						content: `Offlane`,
						placement: 'bottom',
						theme: 'light'
					}}
				>
					<img src="/roles/pos3.svg" alt="pos3" />
				</button>
				<button
					on:click={() => handleRoleChange(4)}
					class="h-10 w-10 rounded-xl bg-zinc-800 p-1 transition duration-100"
					style="background-color: {pos4 ? '#27272a' : '#18181b'};"
					use:tippy={{
						content: `Soft Support`,
						placement: 'bottom',
						theme: 'light'
					}}
				>
					<img src="/roles/pos4.svg" alt="pos4" />
				</button>
				<button
					on:click={() => handleRoleChange(5)}
					class="h-10 w-10 rounded-xl bg-zinc-800 p-1 transition duration-100"
					style="background-color: {pos5 ? '#27272a' : '#18181b'};"
					use:tippy={{
						content: `Hard Support`,
						placement: 'bottom',
						theme: 'light'
					}}
				>
					<img src="/roles/pos5.svg" alt="pos5" />
				</button>
			</div>
		</div>
		<div class="flex flex-col gap-1 text-sm">
			Lobby
			<div class="flex gap-1">
				<button
					on:click={() => handleLobbyChange(7)}
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 p-1 text-2xl transition duration-100"
					style="background-color: {ranked ? '#27272a' : '#18181b'};"
					use:tippy={{
						content: `Ranked`,
						placement: 'bottom',
						theme: 'light'
					}}
				>
					<UilExchange />
				</button>
				<button
					on:click={() => handleLobbyChange(0)}
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 p-1 text-2xl transition duration-100"
					style="background-color: {unranked ? '#27272a' : '#18181b'};"
					use:tippy={{
						content: `Unranked`,
						placement: 'bottom',
						theme: 'light'
					}}
				>
					<BiDashLg />
				</button>
			</div>
		</div>
		<div class="flex flex-col gap-1 text-sm">
			Smurf
			<div class="flex gap-1">
				<button
					on:click={() => handleSmurfChange()}
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 p-1 text-2xl transition duration-100"
					style="background-color: {smurfs ? '#27272a' : '#18181b'};"
					use:tippy={{
						content: `Smurf`,
						placement: 'bottom',
						theme: 'light'
					}}
				>
					<SimpleIconsRedhat />
				</button>
			</div>
		</div>
		<div class="flex flex-col gap-1 text-sm">
			Heroes
			<div>
				<select
					bind:value={hero}
					class="rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
					on:change={() => handleHeroChange()}
				>
					<option value={-1}>All Heroes</option>
					{#each heroList as hero}
						<option value={hero.id}>{hero.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="flex flex-col gap-1 text-sm">
			Date
			<div>
				<select
					bind:value={time}
					class="rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
					on:change={() => handleTimeChange()}
				>
					<option value={7}>Last 7 Days</option>
					<option value={30}>Last 30 Days</option>
					<option value={90}>Last 90 Days</option>
					<option value={180}>Last 180 Days</option>
					<option value={365}>Last 365 Days</option>
					<option value={9999}>All Time</option>
				</select>
			</div>
		</div>
	</div>
	<div class="flex flex-wrap items-center justify-center gap-4">
		{#each playerStats as player}
			<div class="relative flex w-48 flex-col gap-2 rounded-xl bg-zinc-800 p-2">
				<button
					class="absolute right-2 top-2 flex"
					on:click={() => removeFromPlayerStats(player.id)}
				>
					<HeroiconsXMark />
				</button>
				<div class="text-center text-2xl">{player.username}</div>
				<div class="mx-auto h-24 w-24">
					{#key player}
						<RoleDoughnut data={player.roleDistribution} cutout={40} />
					{/key}
				</div>

				<div>
					<div class="flex w-full">
						<div>Win Rate</div>
						<div class="grow" />
						<div>
							{Math.round(calculateWinRate(player.wins, player.losses)) || 0}%
						</div>
					</div>
					<div class="flex h-2 w-full items-end">
						{#key player}
							<div
								class="h-1 bg-green-500 duration-200 hover:h-1.5 hover:bg-green-600"
								style="width: {Math.floor(calculateWinRate(player.wins, player.losses))}%"
								use:tippy={{
									content: `Wins: ${player.wins}`,
									placement: 'bottom',
									theme: 'light'
								}}
							/>
							<div
								class="h-1 grow bg-red-500 duration-200 hover:h-1.5 hover:bg-red-600"
								style="background-color: {player.wins === 0 && player.losses === 0
									? '#71717a'
									: ''};"
								use:tippy={{
									content: `${
										player.wins === 0 && player.losses === 0
											? 'No Matches'
											: 'Losses: ' + player.losses
									}`,
									placement: 'bottom',
									theme: 'light'
								}}
							/>
						{/key}
					</div>
				</div>
				<div>
					<div class="flex w-full">
						<div>Ranked WR</div>
						<div class="grow" />
						<div>
							{Math.round(calculateWinRate(player.rankedWins, player.rankedLosses)) || 0}%
						</div>
					</div>
					<div class="flex h-2 w-full items-end">
						{#key player}
							<div
								class="h-1 bg-green-500 duration-200 hover:h-1.5 hover:bg-green-600"
								style="width: {Math.floor(
									calculateWinRate(player.rankedWins, player.rankedLosses)
								)}%; background-color: {player.rankedWins === 0 && player.rankedLosses === 0
									? '#18181b'
									: ''}"
								use:tippy={{
									content: `Wins: ${player.rankedWins}`,
									placement: 'bottom',
									theme: 'light'
								}}
							/>
							<div
								class="h-1 grow bg-red-500 duration-200 hover:h-1.5 hover:bg-red-600"
								style="background-color: {player.rankedWins === 0 && player.rankedLosses === 0
									? '#71717a'
									: ''};"
								use:tippy={{
									content: `${
										player.rankedWins === 0 && player.rankedLosses === 0
											? 'No Matches'
											: 'Losses: ' + player.rankedLosses
									}`,
									placement: 'bottom',
									theme: 'light'
								}}
							/>
						{/key}
					</div>
				</div>
				<div class="flex h-8 w-full items-center justify-center">
					{#each player.mostPlayedHeroes as hero}
						{#if hero === null}
							<div class="grow basis-1/3 bg-zinc-900">
								<img
									src="/empty-slot.webp"
									class="h-8 w-full"
									alt="No Hero"
									use:tippy={{
										content: `No Hero`,
										placement: 'bottom',
										theme: 'light'
									}}
								/>
							</div>
						{:else}
							<div class="h-8 grow basis-1/3">
								<img
									src={hero.hero.img}
									alt={hero.hero.name}
									use:tippy={{
										content: `<b>${hero.hero.name}</b> - ${hero.count} games`,
										placement: 'bottom',
										theme: 'light',
										allowHTML: true
									}}
								/>
							</div>
						{/if}
					{/each}
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
						style="background-color: {getColour(getRank(player.id, 'versatility', playerStats))};"
					>
						<td class="pl-1">Versatility</td>
						<td class="pr-1 text-right">{player.versatility}</td>
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
						<td class="pr-1 text-right"
							>{player.duration === '99999999999999'
								? 'N/A'
								: toTime(Math.round(player.duration))}</td
						>
					</tr>
				</table>
			</div>
		{/each}
		<div class="flex min-h-64 items-center">
			<button class="rounded-xl bg-zinc-800 px-4 py-1 text-lg" on:click={() => openPlayerMenu()}
				>Add Player</button
			>
		</div>
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
				<div class="flex w-full items-center justify-center gap-1 rounded-xl bg-zinc-800 pr-2">
					<IcOutlineSearch />
					<input
						type="text"
						placeholder="Seach players..."
						bind:value={searchPlayer}
						class="border-transparent bg-transparent !outline-none focus:border-transparent"
						bind:this={searchInput}
					/>
				</div>
				<div class="h-96 overflow-y-auto">
					<div class="flex flex-col gap-2">
						{#each searchPlayersByName(getUpdatedPlayerList(), searchPlayer) as player}
							<button
								class="mx-2 rounded-xl bg-zinc-800 px-2 py-1"
								on:click={async () => addToPlayerStats(await fetchPlayerData(player.id))}
							>
								{player.username}
							</button>
						{/each}
					</div>
				</div>
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
