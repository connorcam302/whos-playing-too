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
	import * as Select from '$lib/components/ui/select/index.js';
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
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import { VenetianMask } from 'lucide-svelte';

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
		matchesByDay,
		playerList
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
	let smurfs = $state(true);
	let hero = $state(-1);
	let heroSelectedMulti = $state(heroList.map((h) => true));
	let selectedHeroSingle = $state('-1');
	let selectedHeroMulti = $state(['-1']);
	let selectedPlayers = $state(['-1']);

	let heroSelectVariant = $state('single');
	const getSelectedHero = (
		selectedHeroSingle: any,
		selectedHeroMulti: any[],
		heroSelectVariant: string
	) => {
		if (heroSelectVariant === 'single') {
			return [selectedHeroSingle];
		}
		if (heroSelectVariant === 'multi' && selectedHeroMulti.length > 0) {
			return selectedHeroMulti;
		} else {
			return ['-1'];
		}
	};
	let selectedHero = $derived(
		getSelectedHero(selectedHeroSingle, selectedHeroMulti, heroSelectVariant)
	);
	let selectedRoles = $state(['1', '2', '3', '4', '5']);

	const fetchMatches = async (pageNumber: number, playerId: number) => {
		matchBlocks = [];

		// Build parameters more carefully
		const params = new URLSearchParams();

		// Always include players
		params.append('players', `[${playerId}]`);

		// Page number (adjust for 0-based indexing)
		if (pageNumber > 0) {
			params.append('page', (pageNumber - 1).toString());
		}

		if (selectedHero.length > 0 && selectedHero[0] !== '-1') {
			params.append('heroes', `[${selectedHero.join(',')}]`);
		}

		// Game mode filter
		let gameModes: string[] = [];
		if (ranked) gameModes.push('ranked-all-pick');
		if (unranked) gameModes.push('unranked-all-pick', 'other');

		if (gameModes.length > 0) {
			params.append('gameMode', JSON.stringify(gameModes));
		}

		// Role filter - use selectedRoles
		if (selectedRoles.length > 0) {
			params.append('roles', `[${selectedRoles.join(',')}]`);
		}

		// Smurf filter
		if (smurfs) {
			params.append('smurf', 'true');
		}

		const url = `/api/matches/all/profile/${playerId}?${params.toString()}`;

		const controller = new AbortController();

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			signal: controller.signal
		});

		const data = await response.json();

		return data;
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
		matchBlocks = [];
		const data = await fetchMatches(pageNumber, Number($page.params.id));
		matchBlocks = data;
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

	const makeSelectedHeroTrigger = () => {
		if (selectedHero.length === 0 || selectedHero[0] === '-1') {
			return 'All Heroes';
		}
		if (selectedHero.length <= 1) {
			return heroList.find((hero) => hero.id.toString() === selectedHero[0]).localized_name;
		} else {
			return `${selectedHeroMulti.length} Heroes Selected`;
		}
	};

	const makeSelectedRolesTrigger = () => {
		if (selectedRoles.length === 0 || selectedRoles.length === 5) {
			return 'All Roles';
		}
		if (selectedRoles.length <= 1) {
			return getRoleName(selectedRoles[0]);
		} else {
			return `${selectedRoles.length} Roles Selected`;
		}
	};

	const makePlayersTrigger = () => {
		if (selectedPlayers.length === 0 || selectedPlayers[0] === '-1') {
			return 'All Players';
		}
		if (selectedPlayers.length <= 1) {
			return playerList.find((player) => player.id.toString() === selectedPlayers[0]).name;
		} else {
			return `${selectedPlayers.length} Players Selected`;
		}
	};

	onMount(() => {
		if ($page.params.id && data && matchBlocks.length === 0) {
			updateMatchesData();
		}
	});

	$effect(() => {
		selectedRoles;
		selectedHero;

		updateMatchesData();
	});

	console.log(data);

	$effect(() => {
		console.log(selectedRoles, selectedHero, selectedPlayers);
	});
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
					<Select.Root type="multiple" bind:value={selectedRoles} class="">
						<Select.Trigger class="w-[180px]">{makeSelectedRolesTrigger()}</Select.Trigger>
						<Select.Content>
							<Select.Item value={'1'} label={getRoleName(1)}>
								<div class="flex items-center gap-2">
									<img class="h-6 w-6" src="/roles/pos1.svg" alt="" />
									<span>{getRoleName(1)}</span>
								</div>
							</Select.Item>
							<Select.Item value={'2'} label={getRoleName(2)}>
								<div class="flex items-center gap-2">
									<img class="h-6 w-6" src="/roles/pos2.svg" alt="" />
									<span>{getRoleName(2)}</span>
								</div>
							</Select.Item>
							<Select.Item value={'3'} label={getRoleName(3)}>
								<div class="flex items-center gap-2">
									<img class="h-6 w-6" src="/roles/pos3.svg" alt="" />
									<span>{getRoleName(3)}</span>
								</div>
							</Select.Item>
							<Select.Item value={'4'} label={getRoleName(4)}>
								<div class="flex items-center gap-2">
									<img class="h-6 w-6" src="/roles/pos4.svg" alt="" />
									<span>{getRoleName(4)}</span>
								</div>
							</Select.Item>
							<Select.Item value={'5'} label={getRoleName(5)}>
								<div class="flex items-center gap-2">
									<img class="h-6 w-6" src="/roles/pos5.svg" alt="" />
									<span>{getRoleName(5)}</span>
								</div>
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex flex-col gap-1">
					<div class="flex justify-between text-xs text-zinc-400">
						<div>Heroes</div>
						<button
							onclick={() =>
								(heroSelectVariant = heroSelectVariant == 'single' ? 'multi' : 'single')}
							>{heroSelectVariant == 'single' ? 'Single' : 'Multi'}</button
						>
					</div>
					{#key heroSelectVariant}
						{#if heroSelectVariant == 'multi'}
							<Select.Root type="multiple" bind:value={selectedHeroMulti} class="">
								{#key selectedHero}
									<Select.Trigger class="w-[180px]">{makeSelectedHeroTrigger()}</Select.Trigger>
								{/key}
								<Select.Content>
									<Select.Item value={'-1'} label={'All Heroes'}>
										<span>All Heroes</span>
									</Select.Item>
									{#each heroList
										.slice()
										.sort((a, b) => a.localized_name.localeCompare(b.localized_name)) as hero}
										<Select.Item value={hero.id.toString()} label={hero.localized_name}>
											<div class="flex items-center gap-2">
												<img class="h-6 w-6" src={hero.icon} alt="" />
												<span>{hero.localized_name}</span>
											</div>
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{:else}
							<Select.Root type="multiple" bind:value={selectedHeroMulti} class="">
								{#key selectedHero}
									<Select.Trigger class="w-[180px]">{makeSelectedHeroTrigger()}</Select.Trigger>
								{/key}
								<Select.Content>
									<Select.Item value={'-1'} label={'All Heroes'}>
										<span>All Players</span>
									</Select.Item>
									{#each heroList
										.slice()
										.sort((a, b) => a.localized_name.localeCompare(b.localized_name)) as hero}
										<Select.Item value={hero.id.toString()} label={hero.localized_name}>
											<div class="flex items-center gap-2">
												<img class="h-6 w-6" src={hero.icon} alt="" />
												<span>{hero.localized_name}</span>
											</div>
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/if}
					{/key}
				</div>
				<div class="flex flex-col gap-1">
					<div class="text-xs text-zinc-400">Roles</div>
					<Select.Root type="multiple" bind:value={selectedPlayers} class="">
						<Select.Trigger class="w-[180px]">{makePlayersTrigger()}</Select.Trigger>
						<Select.Content>
							<Select.Item value={'-1'} label={'all players'}>All Players</Select.Item>
							{#each playerList.filter((p) => p.id != playerId) as player}
								<Select.Item value={player.id.toString()} label={player.name}>
									{player.username}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex flex-col gap-1">
					<div class="text-xs text-zinc-400">Smurf</div>
					<Toggle class="w-32 w-full gap-0 p-0">
						<div class="text-xl">
							<VenetianMask class="w-8 text-xl" />
						</div>
					</Toggle>
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
							<div class="justify-centerpy-3 mx-auto flex w-fit flex-col items-center gap-2">
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
