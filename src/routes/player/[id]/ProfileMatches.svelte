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
	import tippy from 'sveltejs-tippy';
	import { blur, crossfade, draw, fade, fly, scale, slide } from 'svelte/transition';
	import MatchDropdown from '$lib/components/match/MatchDropdown.svelte';
	import { browser } from '$app/environment';
	import Bar from '$lib/components/stats/Bar.svelte';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';
	import IconamoonMenuBurgerHorizontalDuotone from '~icons/iconamoon/menu-burger-horizontal-duotone';
	import * as Select from '$lib/components/ui/select';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import * as Table from '$lib/components/ui/table';
	import dayjs from 'dayjs';
	import advancedFormat from 'dayjs/plugin/advancedFormat';
	import RoleDoughnut from '$lib/components/stats/RoleDoughnut.svelte';
	import { getRoleIcon, getRoleName, calcImpact } from '$lib/functions';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import MultiSelect from '$lib/components/MultiSelect.svelte';

	dayjs.extend(advancedFormat);

	interface Props {
		data: {
			roleCounts: { role: number; count: number }[];
			player: Player;
			mainAccount: SteamProfile;
			smurfAccounts: SteamProfile[];
			allTimeStats: Stats;
			recentStats: Stats;
			heroStats: any;
			allTimeHeroStats: any;
			winGraph: { resultsArray: number[]; daysArray: number[] };
			heroList: { id: number; name: string }[];
			impactCounts: object;
			matchesByDay: { wins: number; losses: number; date: number }[];
			averageStats: {
				avgImpact: number;
				avgKills: number;
				avgDeaths: number;
				avgAssists: number;
				avgGpm: number;
				avgXpm: number;
				avgLastHits: number;
			};
		};
	}

	let { data }: Props = $props();

	let {
		roleCounts,
		playerId,
		averageStats,
		player,
		mainAccount,
		smurfAccounts,
		allTimeStats,
		recentStats,
		heroStats,
		allTimeHeroStats,
		winGraph,
		heroList,
		matchesByDay
	} = $derived(data);

	let pageNumber = $state(1);

	let matchBlocks = $state([]);

	let pos1 = $state(true);
	let pos2 = $state(true);
	let pos3 = $state(true);
	let pos4 = $state(true);
	let pos5 = $state(true);
	let ranked = $state(true);
	let unranked = $state(true);
	let smurfs = $state(false);
	let hero = $state(-1);
	let heroSelectedMulti = $state(heroList.map((h) => true));

	const heroSelectVariant = $state('single');

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

	const toSteam32 = (accountId: string) => {
		return BigInt(accountId) - BigInt('76561197960265728');
	};

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

	let roleOptions = $derived([
		{
			label: 'Carry',
			value: 1,
			image: '/roles/pos1.svg',
			selected: pos1
		},
		{
			label: 'Mid',
			value: 2,
			image: '/roles/pos2.svg',
			selected: pos2
		},
		{
			label: 'Offlane',
			value: 3,
			image: '/roles/pos3.svg',
			selected: pos3
		},
		{
			label: 'Support',
			value: 4,
			image: '/roles/pos4.svg',
			selected: pos4
		},
		{
			label: 'Hard Support',
			value: 5,
			image: '/roles/pos5.svg',
			selected: pos5
		}
	]);

	let heroOptions = $derived(
		heroList.map((hero, i) => ({
			label: hero.localized_name,
			value: hero.id,
			image: hero.icon,
			selected: heroSelectedMulti[i]
		}))
	);

	$effect(() => {
		pos1 = roleOptions[0].selected;
		pos2 = roleOptions[1].selected;
		pos3 = roleOptions[2].selected;
		pos4 = roleOptions[3].selected;
		pos5 = roleOptions[4].selected;
	});

	$effect(() => {
		hero;
		ranked;
		unranked;
		smurfs;
		pos1;
		pos2;
		pos3;
		pos4;
		pos5;

		// Call the update function
		updateMatchesData();
	});

	console.log(data);
</script>

<svelte:head>
	<title>whos-playing | {player.username || 'Unknown'}</title>
</svelte:head>

<div class="w-full">
	{#key player}
		<div class="flex flex-col gap-2">
			<div class="flex flex-wrap gap-2">
				<div class="flex flex-col gap-1">
					<div class="text-xs text-zinc-400">Roles</div>
					<MultiSelect bind:options={roleOptions} />
				</div>
				<div class="flex flex-col gap-1">
					<div class="text-xs text-zinc-400">Heroes</div>
					<MultiSelect bind:options={heroOptions} />
				</div>
				<div class="flex flex-col gap-1">
					<div class="text-xs text-zinc-400">Heroes</div>
					<Select.Root portal={null}>
						<Select.Trigger class="w-[180px]">
							<Select.Value placeholder="Select a fruit" />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Fruits</Select.Label>
								{#each heroList as hero}
									<Select.Item value={hero.id} label={hero.localized_name}>
										<div class="flex gap-1">
											<img class="h-6 w-6" src={hero.icon} alt={hero.localized_name} />
											<span>{hero.localized_name}</span>
										</div>
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
						<Select.Input name="favoriteFruit" />
					</Select.Root>
				</div>
			</div>
			{#key matchBlocks}
				<div class="min-h-64" in:fade={{ duration: 400 }}>
					{#if matchBlocks.length == 0}
						<div class="flex h-full items-center justify-center">
							<div class="h-64">
								<Loading />
							</div>
						</div>
					{:else}
						<div class="flex flex-col gap-2">
							<div
								class="justify-centerpy-3 mx-auto flex w-fit flex-col items-center gap-2 md:px-2"
							>
								{#each matchBlocks.slice(0, 20) as match}
									<Card.Root>
										<Card.Content class="p-0 ">
											<MatchDropdown {match} />
										</Card.Content>
									</Card.Root>
								{/each}
							</div>
							<div class="flex items-center justify-center gap-4">
								<button
									class="w-fit rounded-lg bg-sky-500 p-2 transition-all duration-300 hover:bg-sky-700 disabled:bg-zinc-800"
									disabled={pageNumber == 1}
									onclick={() => decrementPage()}
								>
									<MaterialSymbolsArrowBackRounded /></button
								>
								<div>{pageNumber}</div>
								<button
									class="w-fit rounded-lg bg-sky-500 p-2 transition-all duration-300 hover:bg-sky-700 disabled:bg-zinc-800"
									disabled={matchBlocks.length < 20}
									onclick={() => incrementPage()}
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
</div>
