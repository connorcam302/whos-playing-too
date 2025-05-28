<script lang="ts">
	import { run } from 'svelte/legacy';

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
		smurf: boolean;
		gameextrainfo?: string;
	};
	type Player = {
		accountId: number;
		username: string;
		id: number;
		image: string;
	};
	type Stats = {
		wins: number;
		losses: number;
		rankedWins: number;
		rankedLosses: number;
	};
	import * as Card from '$lib/components/ui/card';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import UilExchange from '~icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import MaterialSymbolsArrowBackRounded from '~icons/material-symbols/arrow-back-rounded';
	import MaterialSymbolsArrowForwardRounded from '~icons/material-symbols/arrow-forward-rounded';
	import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded';
	import IonLogoGameControllerB from '~icons/ion/logo-game-controller-b';
	import MaterialSymbolsCalendarMonth from '~icons/material-symbols/calendar-month';
	import SimpleIconsRedhat from '~icons/simple-icons/redhat';
	import Loading from '$lib/components/Loading.svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import WinChart from '$lib/components/profile/WinChart.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import tippy from 'sveltejs-tippy';
	import MatchDropdown from '$lib/components/match/MatchDropdown.svelte';
	import { browser } from '$app/environment';
	import Bar from '$lib/components/stats/Bar.svelte';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';
	import IconamoonMenuBurgerHorizontalDuotone from '~icons/iconamoon/menu-burger-horizontal-duotone';
	import * as Select from '$lib/components/ui/select';

	interface Props {
		data: {
			player: Player;
			mainAccount: SteamProfile;
			smurfAccounts: SteamProfile[];
			allTimeStats: Stats;
			weeklyStats: Stats;
			heroStats: any;
			allTimeHeroStats: any;
			winGraph: { resultsArray: number[]; daysArray: number[] };
			heroList: { id: number; name: string }[];
			impactCounts: object;
		};
	}

	let { data }: Props = $props();

	let pageNumber = $state(1);

	let matchBlocks = $derived([]);

	let pos1 = $state(true);

	let pos2 = $state(true);

	let pos3 = $state(true);

	let pos4 = $state(true);

	let pos5 = $state(true);

	let ranked = $state(true);

	let unranked = $state(true);

	let smurfs = $state(false);

	let hero = $state(-1);

	onMount(() => {
		if ($page.url.searchParams.get('page')) {
			pageNumber = Number($page.url.searchParams.get('page'));
		}
		fetchMatches(pageNumber, Number($page.params.id));
	});

	const fetchMatches = async (pageNumber: number, playerId: number) => {
		matchBlocks = [];
		let pageNumberFilter = '';
		if (pageNumber > -1) {
			pageNumberFilter = `page=${pageNumber - 1}`;
		}
		let heroFilter = '';
		if (hero > 0) {
			heroFilter = `heroes=[${hero}]`;
		}
		let gameModes: string[] = ['ranked-all-pick', 'unranked-all-pick', 'other'];
		let gameModeFilter = '';
		if (ranked && unranked) {
			gameModeFilter = `gameMode=["${gameModes.join('","')}"]`;
		} else if (ranked) {
			gameModeFilter = `gameMode=["${gameModes[0]}"]`;
		} else if (unranked) {
			gameModeFilter = `gameMode=["${gameModes[1]}","${gameModes[2]}"]`;
		}
		let smurfFilter = 'false';
		if (smurfs) {
			smurfFilter = `smurf=true`;
		}

		pageNumber = pageNumber - 1;
		let roleFilter = 'roles=[';
		if (pos1) {
			roleFilter += '1,';
		}
		if (pos2) {
			roleFilter += '2,';
		}
		if (pos3) {
			roleFilter += '3,';
		}
		if (pos4) {
			roleFilter += '4,';
		}
		if (pos5) {
			roleFilter += '5,';
		}
		roleFilter = roleFilter.slice(0, -1) + ']';
		return await fetch(
			`/api/matches/all/profile/${playerId}?players=[${playerId}]&${heroFilter}&${gameModeFilter}&${pageNumberFilter}&${roleFilter}&${smurfFilter}`
		).then((res) => res.json());
	};

	onMount(() => updateMatchesData());

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

			updateMatchesData();
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

			updateMatchesData();
		}
	};

	const handleSmurfChange = () => {
		smurfs = !smurfs;
	};
	const updateMatchesData = async () => {
		if (browser) {
			matchBlocks = [];
			const data = await fetchMatches(pageNumber, Number($page.params.id));
			matchBlocks = data;
		}
	};

	const incrementPage = () => {
		pageNumber++;
		updateMatchesData();
	};

	const decrementPage = () => {
		pageNumber--;
		updateMatchesData();
	};

	let advancedFilters = $state(false);

	const toggleAdvancedFilters = () => {
		advancedFilters = !advancedFilters;
	};

	let chartType = $state('days');

	let {
		player,
		mainAccount,
		smurfAccounts,
		allTimeStats,
		weeklyStats,
		heroStats,
		allTimeHeroStats,
		winGraph,
		heroList
	} = $derived(data);

	const toSteam32 = (accountId: string) => {
		return BigInt(accountId) - BigInt('76561197960265728');
	};

	$effect(() => {
		hero, ranked, unranked, smurfs, pos1, pos2, pos3, pos4, pos5 && updateMatchesData();
	});

	const mostCommonImpact = Object.keys(data.impactCounts).reduce(
		(maxRating, ratingName) => {
			// Sum the counts for the current rating
			const total = data.impactCounts[ratingName].reduce(
				(sum, item) => sum + Number(item.count),
				0
			);

			// Compare with the current maxRating
			if (total > maxRating.total) {
				return { rating: ratingName, total };
			}

			return maxRating;
		},
		{ rating: null, total: 0 }
	);
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap gap-4">
		<Card.Root class="grow">
			<Card.Header>
				<Card.Title>All Time</Card.Title>
			</Card.Header>
			<Card.Content class="p-2">
				{#await allTimeHeroStats then allTimeHeroStats}
					<HeroStatbox heroStats={allTimeHeroStats} />
				{/await}
			</Card.Content>
		</Card.Root>

		<Card.Root class="grow">
			<Card.Header>
				<Card.Title>This Month</Card.Title>
			</Card.Header>
			<Card.Content class="p-2">
				{#await heroStats then heroStats}
					<HeroStatbox {heroStats} />
				{/await}
			</Card.Content>
		</Card.Root>
	</div>
	<div>
		{#if matchBlocks.length > 0}
			<Card.Root>
				<div class="flex flex-col">
					{#if chartType == 'days'}
						<Card.Header>
							<Card.Title class="flex justify-between">
								<div>Wins By Game</div>
								<button
									class="flex basis-1/6 items-center justify-end"
									onclick={() => (chartType = 'games')}><MaterialSymbolsCalendarMonth /></button
								>
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<WinChart
								data={[
									{
										data: winGraph.resultsArray,
										player: {
											username: player.username,
											id: player.id,
											accounts: [player.accountId]
										}
									}
								]}
								type="results"
							/>
						</Card.Content>
					{:else}
						<Card.Header>
							<Card.Title class="flex justify-between">
								<div>Wins Per Day</div>
								<button
									class="flex basis-1/6 items-center justify-end"
									onclick={() => (chartType = 'days')}><MaterialSymbolsCalendarMonth /></button
								>
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<WinChart
								data={[
									{
										data: winGraph.daysArray,
										player: {
											username: player.username,
											id: player.id,
											accounts: [player.accountId]
										}
									}
								]}
								type="days"
							/>
						</Card.Content>
					{/if}
				</div>
			</Card.Root>
		{/if}
	</div>
	<div
		class="mx-auto flex w-full flex-col justify-center rounded-xl bg-zinc-800 bg-opacity-95 px-2"
	>
		<div class="my-1 flex gap-4 border-b-[1px] border-zinc-500 pb-1 pr-2">
			<div class="flex w-8 items-center justify-center text-sm lg:w-16"></div>
			<div class="flex w-8 items-center justify-center lg:w-28">
				<div>TOTAL</div>
			</div>
			<div class="flex w-8 items-center justify-center text-sm lg:w-28">
				<img src="/roles/pos1.svg" alt="pos1" class="h-8" />
			</div>
			<div class="flex w-8 items-center justify-center text-sm lg:w-28">
				<img src="/roles/pos2.svg" alt="pos2" class="h-8" />
			</div>
			<div class="flex w-8 items-center justify-center text-sm lg:w-28">
				<img src="/roles/pos3.svg" alt="pos3" class="h-8" />
			</div>
			<div class="flex w-8 items-center justify-center text-sm lg:w-28">
				<img src="/roles/pos4.svg" alt="pos4" class="h-8" />
			</div>
			<div class="flex w-8 items-center justify-center text-sm lg:w-28">
				<img src="/roles/pos5.svg" alt="pos5" class="h-8" />
			</div>
		</div>
		<div class="flex max-h-72 flex-col gap-2 overflow-auto" id="scrollbox">
			{#each ['S++', 'S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F+', 'F', 'F-'] as ratingName}
				<div class="flex gap-4">
					<div class="flex h-8 w-12 items-center justify-center text-center lg:w-16">
						{#if ratingName === 'S++'}
							<div id="splusplusrating" class="font-display lg:text-xl">
								{ratingName}
							</div>
						{:else if ratingName === 'S+'}
							<div id="srating" class="font-display lg:text-xl">
								{ratingName}
							</div>
						{:else if ratingName !== 'F-'}
							<div class="font-display lg:text-xl">
								{ratingName}
							</div>
						{:else}
							<div id="frating" class="flex justify-center font-display lg:text-xl">
								<FxemojiPoo />
							</div>
						{/if}
					</div>
					<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
						{data.impactCounts[ratingName].reduce((sum, item) => sum + Number(item.count), 0)}
						<Bar
							percentage={(data.impactCounts[ratingName].reduce(
								(sum, item) => sum + Number(item.count),
								0
							) /
								mostCommonImpact.total) *
								100}
							colour="#9234ea"
						/>
					</div>
					<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
						{data.impactCounts[ratingName].find((item) => item.role === 1)?.count || 0}
						<Bar
							percentage={((data.impactCounts[ratingName].find((item) => item.role === 1)?.count ||
								0) /
								data.impactCounts[ratingName].reduce((sum, item) => sum + Number(item.count), 0)) *
								100}
							colour="#4753a5"
						/>
					</div>
					<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
						{data.impactCounts[ratingName].find((item) => item.role === 2)?.count || 0}
						<Bar
							percentage={((data.impactCounts[ratingName].find((item) => item.role === 2)?.count ||
								0) /
								data.impactCounts[ratingName].reduce((sum, item) => sum + Number(item.count), 0)) *
								100}
							colour="#2f8c94"
						/>
					</div>
					<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
						{data.impactCounts[ratingName].find((item) => item.role === 3)?.count || 0}
						<Bar
							percentage={((data.impactCounts[ratingName].find((item) => item.role === 3)?.count ||
								0) /
								data.impactCounts[ratingName].reduce((sum, item) => sum + Number(item.count), 0)) *
								100}
							colour="#bc7412"
						/>
					</div>
					<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
						{data.impactCounts[ratingName].find((item) => item.role === 4)?.count || 0}
						<Bar
							percentage={((data.impactCounts[ratingName].find((item) => item.role === 4)?.count ||
								0) /
								data.impactCounts[ratingName].reduce((sum, item) => sum + Number(item.count), 0)) *
								100}
							colour="#c24958"
						/>
					</div>
					<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
						{data.impactCounts[ratingName].find((item) => item.role === 5)?.count || 0}
						<Bar
							percentage={((data.impactCounts[ratingName].find((item) => item.role === 5)?.count ||
								0) /
								data.impactCounts[ratingName].reduce((sum, item) => sum + Number(item.count), 0)) *
								100}
							colour="#37a075"
						/>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
