<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import PlayerStatbox from '$lib/components/stats/PlayerStatbox.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';
	import IcOutlineCheck from '~icons/ic/outline-check';
	import MaterialSymbolsKeyboardBackspaceRounded from '~icons/material-symbols/keyboard-backspace-rounded';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';
	import MaterialSymbolsArrowBackRounded from '~icons/material-symbols/arrow-back-rounded';
	import MaterialSymbolsArrowForwardRounded from '~icons/material-symbols/arrow-forward-rounded';
	import IconamoonMenuBurgerHorizontalDuotone from '~icons/iconamoon/menu-burger-horizontal-duotone';

	import { onMount } from 'svelte';
	export let data;

	const { playerList, heroList } = data;
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

	let gameModes: string[] = ['ranked-all-pick', 'unranked-all-pick', 'other'];
	let gameModeCheckboxes: string[] = ['ranked-all-pick', 'unranked-all-pick', 'other'];

	let playerFilter = 0;
	let heroFilter = 0;
	$: pageNumber = 1;
	$: incrementDisabled = false;
	$: decrementDisabled = false;

	const fetchMatches = (
		players: number[],
		heroes: number[],
		gameModes: string[],
		pageNumber: number
	) => {
		matchBlocks = [];
		let playerFilter = '';
		if (players.length > 0) {
			playerFilter = `players=[${players.join(',')}]`;
		}
		let heroFilter = '';
		if (heroes.length > 0) {
			heroFilter = `heroes=[${heroes.join(',')}]`;
		}
		let gameModeFilter = '';
		if (gameModes.length > 0) {
			gameModeFilter = `gameMode=["${gameModes.join('","')}"]`;
		}
		pageNumber = pageNumber - 1;
		let pageNumberFilter = '';
		if (pageNumber > -1) {
			pageNumberFilter = `page=${pageNumber}`;
		}
		fetch(`/api/matches/all?${playerFilter}&${heroFilter}&${gameModeFilter}&${pageNumberFilter}`)
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
		let gameModes: string[] = [];
		if ($page.url.searchParams.has('gameMode')) {
			gameModes = JSON.parse($page.url.searchParams.get('gameMode'));
		}
		console.log('gameModeCheckboxes', gameModeCheckboxes);
		if (gameModes.length > 0) {
			gameModeCheckboxes = gameModeCheckboxes.filter((obj) => gameModes.includes(obj));
		}
		let pageNumberFilter = 1;
		if ($page.url.searchParams.has('page')) {
			pageNumberFilter = JSON.parse($page.url.searchParams.get('page'));
		}
		pageNumber = pageNumberFilter;

		console.log('players', players);
		console.log('heroes', heroes);
		console.log('gameModes', gameModes);
		console.log('pageNumberFilter', pageNumberFilter);
		fetchMatches(players, heroes, gameModes, pageNumberFilter);
	});

	const clearPlayerSearch = () => {
		searchPlayers = '';
		filterPlayerList = playerList;
	};

	const clearPlayerFilter = () => {
		playerCheckboxes = [];
	};

	const selectAllPlayersFilter = () => {
		playerCheckboxes = playerList;
	};

	const clearHeskyarch = () => {
		searchHeroes = '';
		filterHeroList = heroList;
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
		let gameMode = gameModeCheckboxes;

		goto(
			`${$page.url.pathname}?players=[${playerList.join(',')}]&heroes=[${heroList.join(
				','
			)}]&gameMode=["${gameMode.join('","')}"]&page=${pageNumber}`
		);
	};

	const incrementPage = () => {
		pageNumber = pageNumber + 1;
		applyFilters();
		if (matchBlocks.length > 10) {
			incrementDisabled = true;
		}
	};

	const decrementPage = () => {
		pageNumber = pageNumber - 1;
		applyFilters();
		if (pageNumber == 1) {
			decrementDisabled = true;
		}
	};

	let advancedFilters = false;
</script>

<svelte:head>
	<title>whos-playing | Matches</title>
</svelte:head>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap justify-center gap-4">
		<div class="flex h-fit w-64 flex-col gap-4 rounded-xl bg-zinc-800 px-4 py-2">
			<div class="">
				<div class="text-md">Search Players</div>
				<select
					name="players"
					class="w-full rounded-lg bg-zinc-700 py-1 text-sm"
					bind:value={playerFilter}
					on:change={() =>
						playerFilter === 0
							? (playerCheckboxes = playerList)
							: (playerCheckboxes = playerList.filter((obj) => obj.id == playerFilter))}
				>
					<option selected value={0}>All Players</option>
					{#each playerList as player}
						<option value={player.id}>{player.username}</option>
					{/each}
				</select>
			</div>
			<div class="">
				<div class="text-md">Search Heroes</div>
				<select
					name="heroes"
					class="w-full rounded-lg bg-zinc-700 py-1 text-sm"
					bind:value={heroFilter}
					on:change={() =>
						heroFilter === 0
							? (heroCheckboxes = heroList)
							: (heroCheckboxes = heroList.filter((obj) => obj.id == heroFilter))}
				>
					<option selected value={0}>All Heroes</option>
					{#each heroList as hero}
						<option value={hero.id}>{hero.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<div class="text-md">Game Mode</div>
				<div class="text-sm">
					<div>
						<input
							type="checkbox"
							bind:group={gameModeCheckboxes}
							value={'ranked-all-pick'}
							id="ranked-all-pick"
							class="cursor-pointer accent-white"
						/>
						<label for="ranked-all-pick" class="cursor-pointer">Ranked All Pick</label>
					</div>
					<div>
						<input
							type="checkbox"
							bind:group={gameModeCheckboxes}
							value={'unranked-all-pick'}
							id="unranked-all-pick"
							class="cursor-pointer accent-white"
						/>
						<label for="unranked-all-pick" class="cursor-pointer">Unranked All Pick</label>
					</div>
					<div>
						<input
							type="checkbox"
							bind:group={gameModeCheckboxes}
							value={'other'}
							id="other"
							class="cursor-pointer accent-white"
						/>
						<label for="other" class="cursor-pointer">Other</label>
					</div>
				</div>
			</div>
			<button
				on:click={() => (advancedFilters = !advancedFilters)}
				class="flex items-center justify-center text-lg"
			>
				<div>Advanced Filters</div>
				<div class="grow" />
				<div>
					{#if advancedFilters}
						<MaterialSymbolsCloseRounded />
					{:else}
						<IconamoonMenuBurgerHorizontalDuotone />
					{/if}
				</div>
			</button>
			{#if advancedFilters}
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
								class="w-full bg-zinc-800 px-1 py-0.5 text-zinc-100"
							/>
							<button on:click={() => clearPlayerSearch()}>
								<MaterialSymbolsCloseRounded />
							</button>
						</div>
						<div class="mx-2 h-[1px] bg-white opacity-30"></div>
						<div id="scrollbox" class="h-64 overflow-y-auto px-1">
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
											class="cursor-pointer accent-white"
										/>
										<label for={player.username} class="cursor-pointer">{player.username}</label>
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
											class="cursor-pointer accent-white"
										/>
										<label for={player.username}>{player.username}</label>
									</div>
								{/if}
							{/each}
						</div>
						<div class="mt-4 flex text-sm">
							<button
								class="w-fit rounded-lg bg-sky-500 px-3 py-[1px] transition-all duration-300 hover:bg-sky-700"
								on:click={() => clearPlayerFilter()}>Clear</button
							>
							<div class="grow" />
							<button
								class="w-fit rounded-lg bg-sky-500 px-3 py-[1px] transition-all duration-300 hover:bg-sky-700"
								on:click={() => selectAllPlayersFilter()}>Select All</button
							>
						</div>
					</div>
				</div>
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
								class="w-full bg-zinc-800 px-1 py-0.5 text-zinc-100"
							/>
							<button on:click={() => clearHeskyarch()}>
								<MaterialSymbolsCloseRounded />
							</button>
						</div>
						<div class="mx-2 h-[1px] bg-white opacity-30"></div>
						<div id="scrollbox" class="h-64 overflow-y-auto px-1">
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
											class="cursor-pointer accent-white"
										/>
										<label for={hero.name} class="cursor-pointer">{hero.name}</label>
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
											class="cursor-pointer accent-white"
										/>
										<label for={hero.name} class="cursor-pointer">{hero.name}</label>
									</div>
								{/if}
							{/each}
						</div>
						<div class="mt-4 flex text-sm">
							<button
								class="w-fit rounded-lg bg-sky-500 px-3 py-[1px] transition-all duration-300 hover:bg-sky-700"
								on:click={() => clearHeroFilter()}>Clear</button
							>
							<div class="grow" />
							<button
								class="w-fit rounded-lg bg-sky-500 px-3 py-[1px] transition-all duration-300 hover:bg-sky-700"
								on:click={() => selectAllHeroFilter()}>Select All</button
							>
						</div>
					</div>
				</div>
			{/if}
			<div class="mb-2 flex justify-center">
				<button
					class="w-fit rounded-lg bg-sky-500 px-4 py-1 transition-all duration-300 hover:bg-sky-700"
					on:click={() => applyFilters()}
				>
					<div class="flex items-center gap-2">
						<IcOutlineCheck />
						<div>Apply Filters</div>
					</div>
				</button>
			</div>
		</div>
		{#key (matchBlocks, pageNumber)}
			<div class="min-h-64" in:fade={{ duration: 400 }}>
				{#if matchBlocks.length == 0}
					<div class="flex h-full items-center justify-center">
						<div class="absolute">
							<Loading />
						</div>
					</div>
				{:else}
					<div>
						{#each matchBlocks.slice(0, 10) as match}
							<div class="mb-2">
								<MatchBlock {match} />
							</div>
						{/each}
						<div class="flex items-center justify-center gap-4">
							<button
								class="w-fit rounded-lg bg-sky-500 p-2 transition-all duration-300 hover:bg-sky-700 disabled:bg-zinc-800"
								disabled={pageNumber == 1}
								on:click={() => decrementPage()}
							>
								<MaterialSymbolsArrowBackRounded /></button
							>
							<div>{pageNumber}</div>
							<button
								class="w-fit rounded-lg bg-sky-500 p-2 transition-all duration-300 hover:bg-sky-700 disabled:bg-zinc-800"
								disabled={matchBlocks.length < 10}
								on:click={() => incrementPage()}
							>
								<MaterialSymbolsArrowForwardRounded />
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/key}
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
