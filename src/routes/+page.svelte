<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import PlayerStatbox from '$lib/components/stats/PlayerStatbox.svelte';
	import { onMount } from 'svelte';
	export let data;

	const { heroStats, playerStats, playerList, heroList } = data;
	//console.log(matchBlocks, heroStats, playerStats, playerList);
	let matchBlocks: any[] = [];
	let playerCheckboxes: any[] = playerList;
	let heroCheckboxes: any[] = heroList;

	const fetchMatches = (players: number[], heroes: number[]) => {
		matchBlocks = [];
		let playerFilter = '';
		if (players.length > 0) {
			playerFilter = `players=[${players.join(',')}]`;
		}
		let heroFilter = '';
		if (heroes.length > 0) {
			heroFilter = `heroes=[${heroes.join(',')}]`;
		}
		console.log(playerFilter);
		fetch(`/api/matches/all?${playerFilter}&${heroFilter}`)
			.then((res) => res.json())
			.then((res) => {
				matchBlocks = res;
			});
	};

	onMount(() => {
		let players: number[] = [];
		if ($page.url.searchParams.has('players')) {
			players = JSON.parse($page.url.searchParams.get('players'));
		}
		if (players.length > 0) {
			playerCheckboxes = playerCheckboxes.filter((obj) => players.includes(obj.id));
		}
		let heroes: number[] = [];
		if ($page.url.searchParams.has('heroes')) {
			heroes = JSON.parse($page.url.searchParams.get('heroes'));
		}
		if (heroes.length > 0) {
			heroCheckboxes = heroCheckboxes.filter((obj) => heroes.includes(obj.id));
		}
		fetchMatches(players, heroes);
	});

	const clearPlayerFilter = () => {
		playerCheckboxes = [];
	};

	const selectAllPlayersFilter = () => {
		playerCheckboxes = playerList;
	};

	const clearHeroFilter = () => {
		heroCheckboxes = [];
	};

	const selectAllHeroFilter = () => {
		heroCheckboxes = heroList;
	};

	const applyFilters = () => {
		let playerList = playerCheckboxes.map((player) => player.id);
		let heroList = heroCheckboxes.map((hero) => hero.id);
		fetchMatches(playerList, heroList);
		goto(`${$page.url.pathname}?players=[${playerList.join(',')}]`);
	};
</script>

<div>
	<div class="flex flex-wrap gap-4">
		<div role="document" class="w-[480px]">
			<HeroStatbox {heroStats} />
		</div>
		<div class="w-[480px]">
			<PlayerStatbox {playerStats} />
		</div>
	</div>

	<div class="flex flex-wrap gap-4">
		{#key matchBlocks}
			<div>
				{#each matchBlocks as match}
					<div class="my-2">
						<MatchBlock {match} />
					</div>
				{/each}
			</div>
		{/key}
		<div class="flex flex-col">
			<div>
				{#each playerList as player}
					<div class="mt-1">
						<input
							bind:group={playerCheckboxes}
							type="checkbox"
							id={player}
							name={player}
							value={player}
							checked={true}
						/>
						<label for={player}>{player.username}</label>
					</div>
				{/each}
				<button class="bg-red-500 mx-3" on:click={() => clearPlayerFilter()}>Clear</button>
				<button class="bg-red-500 mx-3" on:click={() => selectAllPlayersFilter()}>Select All</button
				>
			</div>
			<div>
				{#each heroList as hero}
					<div class="mt-1">
						<input
							bind:group={heroCheckboxes}
							type="checkbox"
							id={hero.id}
							name={hero.name}
							value={hero}
							checked={true}
						/>
						<label for={hero}>{hero.name}</label>
					</div>
				{/each}
				<button class="bg-red-500 mx-3" on:click={() => clearHeroFilter()}>Clear</button>
				<button class="bg-red-500 mx-3" on:click={() => selectAllHeroFilter()}>Select All</button>
			</div>
			<button class="bg-red-500 mx-3" on:click={() => applyFilters()}>Apply</button>
		</div>
	</div>
</div>
