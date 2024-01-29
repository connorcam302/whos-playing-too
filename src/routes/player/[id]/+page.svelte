<script lang="ts">
	type SteamProfile = {
		avatar: string;
		avatarfull: string;
		avatarhash: string;
		avatarmedium: string;
		communityvisibilitystate: number;
		lastlogoff: number;
		loccountrycode: string;
		personaname: string;
		personastate: number;
		personastateflags: number;
		primaryclanid: string;
		profilestate: number;
		profileurl: string;
		steamid: string;
		timecreated: number;
	};
	type Player = {
		accountId: number;
		username: string;
		id: number;
	};
	type Stats = {
		wins: number;
		losses: number;
		rankedWins: number;
		rankedLosses: number;
	};

	import UilExchange from '~icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import MaterialSymbolsArrowBackRounded from '~icons/material-symbols/arrow-back-rounded';
	import MaterialSymbolsArrowForwardRounded from '~icons/material-symbols/arrow-forward-rounded';
	import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded';
	import Loading from '$lib/components/Loading.svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';

	export let data: {
		player: Player;
		steamData: SteamProfile;
		allSteamData: SteamProfile[];
		allTimeStats: Stats;
		weeklyStats: Stats;
		heroStats: any;
		winGraph: any;
	};

	$: pageNumber = 1;
	$: incrementDisabled = false;
	$: decrementDisabled = false;
	$: matchBlocks = [];

	onMount(() => {
		console.log($page.url.searchParams.get('page'));
		if ($page.url.searchParams.get('page')) {
			pageNumber = $page.url.searchParams.get('page');
		}
		console.log(pageNumber);
		fetchMatches(pageNumber, Number($page.params.id));
	});

	const fetchMatches = (pageNumber: number, playerId: number) => {
		matchBlocks = [];
		pageNumber = pageNumber - 1;
		let pageNumberFilter = '';
		if (pageNumber > -1) {
			pageNumberFilter = `page=${pageNumber}`;
		}
		console.log(`/api/matches/all?players=[${playerId}]&${pageNumberFilter}`);
		fetch(`/api/matches/all?players=[${playerId}]&${pageNumberFilter}`)
			.then((res) => res.json())
			.then((res) => {
				matchBlocks = res;
			});
	};

	const incrementPage = () => {
		pageNumber = pageNumber + 1;
		fetchMatches(pageNumber, player.id);
		goto(`/player/${player.id}?page=${pageNumber}`);
		if (matchBlocks.length > 10) {
			incrementDisabled = true;
		}
	};

	const decrementPage = () => {
		pageNumber = pageNumber - 1;
		fetchMatches(pageNumber, player.id);

		goto(`/player/${player.id}?page=${pageNumber}`);
		if (pageNumber == 1) {
			decrementDisabled = true;
		}
	};

	$: ({ player, steamData, allSteamData, allTimeStats, weeklyStats, heroStats, winGraph } = data);
	console.log(data);
</script>

<div>Loading...</div>
{#key player}
	<div class="flex flex-col gap-4">
		<div class="flex gap-2">
			<img src={steamData.avatarfull} alt="profilepicture" class="h-40" />
			<div class="flex flex-col justify-center">
				<div class="text-4xl">{player.username}</div>
				<div class="text-lg opacity-50">{steamData.personaname}</div>
			</div>
			<div class="grow" />
			<div
				class="flex flex-col w-48 px-2
		bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 rounded-xl h-fit py-2"
			>
				<div class="flex">
					<div class="flex flex-col">
						<div class="text-xl h-7 flex items-center"><UilExchange /></div>
						<div class="text-xl h-7 flex items-center"><BiDashLg /></div>
					</div>
					<div class="grow flex flex-col items-center">
						<div class="w-full flex gap-1 items-center justify-center">
							<div class="text-xl text-green-400">{allTimeStats.rankedWins}</div>
							<div class="text-xl">-</div>
							<div class="text-xl text-red-500">{allTimeStats.rankedLosses}</div>
						</div>
						<div class="w-full flex gap-1 items-center justify-center">
							<div class="text-xl text-green-400">{allTimeStats.wins}</div>
							<div class="text-xl">-</div>
							<div class="text-xl text-red-500">{allTimeStats.losses}</div>
						</div>
					</div>
				</div>

				<div class="text-sm text-center mt-2">Last 7 Days</div>
				<div class="flex w-full">
					<div class="flex flex-col">
						<div class="text-xl h-7 flex items-center"><UilExchange /></div>
						<div class="text-xl h-7 flex items-center"><BiDashLg /></div>
					</div>
					<div class="grow flex flex-col items-center">
						<div class="w-full flex gap-1 items-center justify-center">
							<div class="text-xl text-green-400">{weeklyStats.rankedWins}</div>
							<div class="text-xl">-</div>
							<div class="text-xl text-red-500">{weeklyStats.rankedLosses}</div>
						</div>
						<div class="w-full flex gap-1 items-center justify-center">
							<div class="text-xl text-green-400">{weeklyStats.wins}</div>
							<div class="text-xl">-</div>
							<div class="text-xl text-red-500">{weeklyStats.losses}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div>
			<HeroStatbox {heroStats} />
		</div>

		{#key matchBlocks}
			<div class="w-[812px] min-h-64" in:fade={{ duration: 400 }}>
				<div class="flex">
					<button class="flex items-center gap-2" on:click={() => goto('/matches?players=[4]')}>
						<div class="text-lg">Matches</div>
						<div><MaterialSymbolsArrowForwardIosRounded /></div>
					</button>
				</div>
				{#if matchBlocks.length == 0}
					<div class="flex justify-center items-center h-full">
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
								class="bg-rose-500 rounded-lg w-fit p-2 hover:bg-rose-700 transition-all duration-300 disabled:bg-neutral-800"
								disabled={pageNumber == 1}
								on:click={() => decrementPage()}
							>
								<MaterialSymbolsArrowBackRounded /></button
							>
							<div>{pageNumber}</div>
							<button
								class="bg-rose-500 rounded-lg w-fit p-2 hover:bg-rose-700 transition-all duration-300 disabled:bg-neutral-800"
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
{/key}
