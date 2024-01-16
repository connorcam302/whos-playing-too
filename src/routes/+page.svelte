<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import PlayerStatbox from '$lib/components/stats/PlayerStatbox.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import TeamOfTheWeek from '$lib/components/totw/TeamOfTheWeek.svelte';
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';
	import IcOutlineCheck from '~icons/ic/outline-check';
	import MaterialSymbolsKeyboardBackspaceRounded from '~icons/material-symbols/keyboard-backspace-rounded';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';

	export let data;

	const { heroStats, playerStats, playerList, heroList, totw } = data;
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

	let gameModes: string[] = ['ranked-all-pick', 'unranked-all-pick', 'other'];
	let gameModeCheckboxes: string[] = ['ranked-all-pick', 'unranked-all-pick', 'other'];

	let playerFilter = 0;
	let heroFilter = 0;

	const fetchMatches = (players: number[], heroes: number[], gameModes: string[]) => {
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
		console.log(`/api/matches/all?${playerFilter}&${heroFilter}&${gameModeFilter}`);
		console.log(playerFilter);
		fetch(`/api/matches/all?${playerFilter}&${heroFilter}&${gameModeFilter}`)
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
			gameModeCheckboxes = JSON.parse($page.url.searchParams.get('gameMode'));
		}
		if (gameModes.length > 0) {
			gameModeCheckboxes = gameModeCheckboxes.filter((obj) => gameModes.includes(obj));
		}
		fetchMatches(players, heroes, gameModes);
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

	const clearHeroSearch = () => {
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

		fetchMatches(playerList, heroList, gameMode);
		goto(
			`${$page.url.pathname}?players=[${playerList.join(',')}]&heroes=[${heroList.join(
				','
			)}]&gameMode=["${gameMode.join('","')}"]`
		);
	};
</script>

<div class="flex flex-col gap-4">
	<div>
		<TeamOfTheWeek {totw} />
	</div>
	<div class="flex flex-wrap gap-4 items-center justify-center min-w-[1000px]">
		<div class="grow">
			<HeroStatbox {heroStats} />
		</div>
		<div class="grow">
			<PlayerStatbox {playerStats} />
		</div>
	</div>

	<div class="flex flex-wrap gap-4 justify-center">
		{#key matchBlocks}
			<div class="w-[812px] min-h-64" in:fade={{ duration: 500 }}>
				{#if matchBlocks.length == 0}
					<div class="flex justify-center items-center h-full">
						<div class="absolute">
							<Loading />
						</div>
					</div>
				{:else}
					<div>
						{#each matchBlocks as match}
							<div class="mb-2">
								<MatchBlock {match} />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/key}
	</div>
</div>
