<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import PlayerStatbox from '$lib/components/stats/PlayerStatbox.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';
	import IcOutlineCheck from '~icons/ic/outline-check';
	import MaterialSymbolsKeyboardBackspaceRounded from '~icons/material-symbols/keyboard-backspace-rounded';

	import { onMount } from 'svelte';
	export let data;

	const { heroStats, playerStats, playerList, heroList } = data;
	//console.log(matchBlocks, heroStats, playerStats, playerList);
	let filterPlayerList = playerList;
	let filterHeroList = heroList;
	let matchBlocks: any[] = [];
	let playerCheckboxes: any[] = playerList;
	let heroCheckboxes: any[] = heroList;

	let searchPlayers = '';
	const searchPlayersByName = (
		allPlayers: { id: number; username: string; accounts: { accountId: number }[] }[],
		searchString: string
	) => {
		const lowerSearchString = searchString.toLowerCase();

		return allPlayers.filter((player) => player.username.toLowerCase().includes(lowerSearchString));
	};

	let searchHeroes = '';
	const searchHeroesByName = (allHeroes: DotaAsset[], searchString: string) => {
		const lowerSearchString = searchString.toLowerCase();

		return allHeroes.filter((hero) => hero.name.toLowerCase().includes(lowerSearchString));
	};

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
		goto(`${$page.url.pathname}?players=[${playerList.join(',')}]&heroes=[${heroList.join(',')}]`);
	};
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap gap-4 items-center justify-center">
		<div class="grow">
			<HeroStatbox {heroStats} />
		</div>
		<div class="grow">
			<PlayerStatbox {playerStats} />
		</div>
	</div>

	<div class="flex flex-wrap gap-4">
		<div class="flex flex-col gap-4 bg-neutral-800 h-fit py-2 px-4 rounded-xl">
			<div class="flex text-lg">
				<div>Advanced Filters</div>
				<div class="grow" />
				<button>
					<MaterialSymbolsKeyboardBackspaceRounded />
				</button>
			</div>
			<div>
				<div class="text-md">Included Players</div>
				<div class="flex flex-col text-sm">
					<div class="flex items-center">
						<MaterialSymbolsSearchRounded />
						<input
							type="text"
							bind:value={searchPlayers}
							on:input={() => (filterPlayerList = searchPlayersByName(playerList, searchPlayers))}
							placeholder="Search Players"
							class="w-full px-1 py-0.5 bg-neutral-800 text-neutral-100"
						/>
					</div>
					<div class="bg-white h-[1px] opacity-30 mx-2"></div>
					<div id="scrollbox" class="overflow-y-auto h-64 px-1">
						{#each playerList as player}
							{#if filterPlayerList.includes(player)}
								<div>
									<input
										bind:group={playerCheckboxes}
										type="checkbox"
										id={player.username}
										name={player.username}
										value={player}
										checked={true}
										class="accent-white"
									/>
									<label for={player.username}>{player.username}</label>
								</div>
							{:else}
								<div class="invisible h-0">
									<input
										bind:group={playerCheckboxes}
										type="checkbox"
										id={player.username}
										name={player.username}
										value={player}
										checked={true}
										class="accent-white"
									/>
									<label for={player.username}>{player.username}</label>
								</div>
							{/if}
						{/each}
					</div>
					<div class="flex text-sm mt-4">
						<button
							class="bg-rose-500 rounded-lg w-fit px-3 py-[1px] hover:bg-rose-700 transition-all duration-300"
							on:click={() => clearPlayerFilter()}>Clear</button
						>
						<div class="grow" />
						<button
							class="bg-rose-500 rounded-lg w-fit px-3 py-[1px] hover:bg-rose-700 transition-all duration-300"
							on:click={() => selectAllPlayersFilter()}>Select All</button
						>
					</div>
				</div>
			</div>
			<div class="bg-white h-[1px] opacity-50 mt-2"></div>
			<div>
				<div>Included Heroes</div>

				<div class="flex flex-col text-sm">
					<div class="flex items-center">
						<MaterialSymbolsSearchRounded />
						<input
							type="text"
							bind:value={searchHeroes}
							on:input={() => (filterHeroList = searchHeroesByName(heroList, searchHeroes))}
							placeholder="Search Heroes"
							class="w-full px-1 py-0.5 bg-neutral-800 text-neutral-100"
						/>
					</div>
					<div class="bg-white h-[1px] opacity-30 mx-2"></div>

					<div id="scrollbox" class="overflow-y-auto h-64 px-1">
						{#each heroList as hero}
							{#if filterHeroList.includes(hero)}
								<div>
									<input
										bind:group={heroCheckboxes}
										type="checkbox"
										id={hero.name}
										name={hero.name}
										value={hero}
										checked={true}
										class="accent-white"
									/>
									<label for={hero.name}>{hero.name}</label>
								</div>
							{:else}
								<div class="invisible h-0">
									<input
										bind:group={heroCheckboxes}
										type="checkbox"
										id={hero.name}
										name={hero.name}
										value={hero}
										checked={true}
										class="accent-white"
									/>
									<label for={hero.name}>{hero.name}</label>
								</div>
							{/if}
						{/each}
					</div>
					<div class="flex text-sm mt-4">
						<button
							class="bg-rose-500 rounded-lg w-fit px-3 py-[1px] hover:bg-rose-700 transition-all duration-300"
							on:click={() => clearHeroFilter()}>Clear</button
						>
						<div class="grow" />
						<button
							class="bg-rose-500 rounded-lg w-fit px-3 py-[1px] hover:bg-rose-700 transition-all duration-300"
							on:click={() => selectAllHeroFilter()}>Select All</button
						>
					</div>
				</div>
			</div>

			<div class="bg-white h-[1px] opacity-50 my-2"></div>
			<div class="flex justify-center mb-2">
				<button
					class="bg-rose-500 rounded-lg w-fit px-4 py-1 hover:bg-rose-700 transition-all duration-300"
					on:click={() => applyFilters()}
				>
					<div class="flex items-center gap-2">
						<IcOutlineCheck />
						<div>Apply Filters</div>
					</div>
				</button>
			</div>
		</div>

		<div class="w-[812px] min-h-64">
			{#if matchBlocks.length == 0}
				<div class="flex justify-center items-center h-full">
					<Loading />
				</div>
			{:else}
				{#key matchBlocks}
					<div>
						{#each matchBlocks as match}
							<div class="mb-2">
								<MatchBlock {match} />
							</div>
						{/each}
					</div>
				{/key}
			{/if}
		</div>
	</div>
</div>

<style>
	#scrollbox::-webkit-scrollbar {
		width: 4px;
		background-color: #404040;
	}

	#scrollbox::-webkit-scrollbar-thumb {
		background-color: #e7e5e4;
		border-radius: 64px;
	}
</style>
