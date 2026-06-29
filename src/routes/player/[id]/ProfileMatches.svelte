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
		smurf: boolean;
		gameextrainfo?: string;
	};
	type Player = {
		accountId: number;
		username: string;
		id: number;
		image: string;
	};
	type Hero = {
		id: number;
		name: string;
		localized_name: string;
		icon: string;
	};
	type Stats = {
		wins: number;
		losses: number;
		rankedWins: number;
		rankedLosses: number;
	};
	type MatchStats = {
		matchCount: number;
		wins: number;
		losses: number;
		winRate: number;
		averages: {
			kills: number;
			deaths: number;
			assists: number;
			impact: number;
			gpm: number;
			xpm: number;
			lastHits: number;
			heroDamage: number;
			towerDamage: number;
			duration: number;
		};
		roleCounts: {
			role: number;
			count: number;
			wins: number;
			losses: number;
			winRate: number;
			impact: number;
		}[];
		heroCounts: {
			count: number;
			wins: number;
			hero?: {
				id: number;
				name: string;
				img: string;
			};
		}[];
		timeline: { date: string; wins: number; losses: number }[];
	};

	import Loading from '$lib/components/Loading.svelte';
	import { page } from '$app/stores';
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import MatchDropdown from '$lib/components/match/MatchDropdown.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import dayjs from 'dayjs';
	import advancedFormat from 'dayjs/plugin/advancedFormat';
	import { getRoleIcon, getRoleName, toTime } from '$lib/functions';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import { DATE_RANGE_PRESETS, DOTA_MAJOR_PATCHES } from '$lib/data/dotaPatchRanges';
	import { ArrowLeft, ArrowRight, BarChart3, Clock, Swords, VenetianMask } from 'lucide-svelte';

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
			heroList: Hero[];
			matchesByDay: { wins: number; losses: number; date: number }[];
			playerList: Player[];
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
		player,
		heroList,
		playerList
	} = $derived(data);

	let pageNumber = $state(1);

	let matchBlocks: any[] = $state([]);
	let isLoadingMatches = $state(false);
	let matchesError = $state('');
	let latestMatchesRequest = 0;
	const emptyStats = (): MatchStats => ({
		matchCount: 0,
		wins: 0,
		losses: 0,
		winRate: 0,
		averages: {
			kills: 0,
			deaths: 0,
			assists: 0,
			impact: 0,
			gpm: 0,
			xpm: 0,
			lastHits: 0,
			heroDamage: 0,
			towerDamage: 0,
			duration: 0
		},
		roleCounts: [],
		heroCounts: [],
		timeline: []
	});
	let filteredStats: MatchStats = $state(emptyStats());
	let totalMatches = $state(0);

	let ranked = $state(true);
	let unranked = $state(true);
	let smurfs = $state(true);
	let wins = $state(true);
	let losses = $state(true);
	let selectedDateRange = $state('all');
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
	let selectedPlayerIds = $derived(
		selectedPlayers.length === 0 || selectedPlayers[0] === '-1'
			? [player.id.toString()]
			: Array.from(new Set([player.id.toString(), ...selectedPlayers]))
	);

	const fetchMatches = async (pageNumber: number, playerId: number) => {
		const params = new URLSearchParams();

		params.append('players', `[${selectedPlayerIds.join(',')}]`);

		if (pageNumber > 0) {
			params.append('page', (pageNumber - 1).toString());
		}

		if (selectedHero.length > 0 && selectedHero[0] !== '-1') {
			params.append('heroes', `[${selectedHero.join(',')}]`);
		}

		let gameModes: string[] = [];
		if (ranked) gameModes.push('ranked-all-pick');
		if (unranked) gameModes.push('unranked-all-pick', 'other');

		if (gameModes.length > 0) {
			params.append('gameMode', JSON.stringify(gameModes));
		}

		if (selectedRoles.length > 0) {
			params.append('roles', `[${selectedRoles.join(',')}]`);
		}

		if (smurfs) {
			params.append('smurf', 'true');
		}
		params.append('dateRange', selectedDateRange);
		params.append('results', JSON.stringify([...(wins ? ['wins'] : []), ...(losses ? ['losses'] : [])]));

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

		if (!response.ok) {
			throw new Error(`Failed to load matches (${response.status})`);
		}

		const data = await response.json();

		return data;
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
		}
	};
	const handleResultChange = (result: 'wins' | 'losses') => {
		const currentResult = result === 'wins' ? wins : losses;
		if (Number(wins) + Number(losses) > 1 || currentResult === false) {
			if (result === 'wins') wins = !wins;
			if (result === 'losses') losses = !losses;
		}
	};

	const clearFilters = () => {
		selectedRoles = ['1', '2', '3', '4', '5'];
		selectedHeroSingle = '-1';
		selectedHeroMulti = ['-1'];
		selectedDateRange = 'all';
		ranked = true;
		unranked = true;
		wins = true;
		losses = true;
		smurfs = true;
		heroSelectVariant = 'single';
	};

	const updateMatchesData = async (targetPage = pageNumber) => {
		const requestId = ++latestMatchesRequest;
		pageNumber = targetPage;
		isLoadingMatches = true;
		matchesError = '';

		try {
			const response = await fetchMatches(targetPage, player.id);
			if (requestId !== latestMatchesRequest) return;

			if (Array.isArray(response)) {
				matchBlocks = response;
				filteredStats = emptyStats();
				totalMatches = response.length;
				return;
			}

			matchBlocks = response.matches ?? [];
			filteredStats = response.stats ?? emptyStats();
			totalMatches = response.totalMatches ?? matchBlocks.length;
		} catch (error) {
			if (requestId !== latestMatchesRequest) return;

			matchBlocks = [];
			filteredStats = emptyStats();
			totalMatches = 0;
			matchesError = error instanceof Error ? error.message : 'Failed to load matches';
		} finally {
			if (requestId === latestMatchesRequest) {
				isLoadingMatches = false;
			}
		}
	};

	const incrementPage = () => {
		updateMatchesData(pageNumber + 1);
	};

	const decrementPage = () => {
		updateMatchesData(pageNumber - 1);
	};

	const makeSelectedHeroTrigger = () => {
		if (selectedHero.length === 0 || selectedHero[0] === '-1') {
			return 'All Heroes';
		}
		if (selectedHero.length <= 1) {
			return heroList.find((hero) => hero.id.toString() === selectedHero[0])?.localized_name;
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
			return playerList.find((player) => player.id.toString() === selectedPlayers[0])?.username;
		} else {
			return `${selectedPlayers.length} Teammates Selected`;
		}
	};
	const makeDateRangeTrigger = () => {
		const preset = DATE_RANGE_PRESETS.find((range) => range.value === selectedDateRange);
		if (preset) return preset.label;
		return (
			DOTA_MAJOR_PATCHES.find((patch) => `patch-${patch.version}` === selectedDateRange)?.label ??
			'All Time'
		);
	};
	const formatNumber = (value: number, decimals = 0) => {
		return new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value || 0);
	};
	let timelineMax = $derived(
		Math.max(1, ...filteredStats.timeline.map((day) => day.wins + day.losses))
	);
	let filteredKda = $derived(
		(filteredStats.averages.kills + filteredStats.averages.assists) /
			Math.max(filteredStats.averages.deaths, 1)
	);

	$effect(() => {
		$page.params.id;
		selectedRoles;
		selectedHero;
		selectedPlayerIds;
		ranked;
		unranked;
		smurfs;
		wins;
		losses;
		selectedDateRange;

		untrack(() => updateMatchesData(1));
	});
</script>

<svelte:head>
	<title>whos-playing | {player.username || 'Unknown'}</title>
</svelte:head>

<div class="mx-auto w-full max-w-6xl">
	{#key player}
		<div class="flex flex-col gap-5">
			<div
				class="grid gap-3 rounded-lg border border-zinc-700  bg-card p-3 sm:grid-cols-2 xl:grid-cols-[minmax(11rem,1fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_auto_auto_auto]"
			>
				<div class="flex min-w-0 flex-col gap-1">
					<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Roles</div>
					<Select.Root type="multiple" bind:value={selectedRoles}>
						<Select.Trigger class="w-full">{makeSelectedRolesTrigger()}</Select.Trigger>
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
				<div class="flex min-w-0 flex-col gap-1">
					<div class="flex justify-between text-xs font-medium uppercase tracking-wide text-zinc-400">
						<div>Heroes</div>
						<button
							onclick={() =>
								(heroSelectVariant = heroSelectVariant == 'single' ? 'multi' : 'single')}
							class="h-5 rounded-md border border-sky-700/70 px-2 text-[11px] normal-case tracking-normal text-sky-200 transition-colors hover:bg-sky-950/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>{heroSelectVariant == 'single' ? 'Single' : 'Multi'}</button
						>
					</div>
					{#key heroSelectVariant}
							{#if heroSelectVariant == 'multi'}
								<Select.Root type="multiple" bind:value={selectedHeroMulti}>
									{#key selectedHero}
										<Select.Trigger class="w-full">{makeSelectedHeroTrigger()}</Select.Trigger>
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
								<Select.Root type="single" bind:value={selectedHeroSingle}>
									{#key selectedHero}
										<Select.Trigger class="w-full">{makeSelectedHeroTrigger()}</Select.Trigger>
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
						{/if}
					{/key}
				</div>
				<div class="flex min-w-0 flex-col gap-1">
					<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Teammates</div>
					<Select.Root type="multiple" bind:value={selectedPlayers}>
						<Select.Trigger class="w-full">{makePlayersTrigger()}</Select.Trigger>
						<Select.Content>
							<Select.Item value={'-1'} label={'All Teammates'}>All Teammates</Select.Item>
							{#each playerList.filter((listedPlayer) => listedPlayer.id !== player.id) as listedPlayer}
								<Select.Item value={listedPlayer.id.toString()} label={listedPlayer.username}>
									{listedPlayer.username}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex min-w-0 flex-col gap-1">
					<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Date Range</div>
					<Select.Root type="single" bind:value={selectedDateRange}>
						<Select.Trigger class="w-full">{makeDateRangeTrigger()}</Select.Trigger>
						<Select.Content>
							{#each DATE_RANGE_PRESETS as range}
								<Select.Item value={range.value} label={range.label}>{range.label}</Select.Item>
							{/each}
							{#each DOTA_MAJOR_PATCHES.slice().reverse() as patch}
								<Select.Item value={`patch-${patch.version}`} label={patch.label}>
									{patch.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex flex-col gap-1">
					<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Lobby</div>
					<div class="flex gap-1">
						<Toggle
							pressed={ranked}
							onclick={() => handleLobbyChange(7)}
							class="h-10 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white"
						>
							Ranked
						</Toggle>
						<Toggle
							pressed={unranked}
							onclick={() => handleLobbyChange(0)}
							class="h-10 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white"
						>
							Unranked
						</Toggle>
					</div>
				</div>
				<div class="flex flex-col gap-1">
					<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Result</div>
					<div class="flex gap-1">
						<Toggle
							pressed={wins}
							onclick={() => handleResultChange('wins')}
							class="h-10 border px-3 data-[state=on]:bg-green-600 data-[state=on]:text-white"
						>
							Wins
						</Toggle>
						<Toggle
							pressed={losses}
							onclick={() => handleResultChange('losses')}
							class="h-10 border px-3 data-[state=on]:bg-red-600 data-[state=on]:text-white"
						>
							Losses
						</Toggle>
					</div>
				</div>
				<div class="flex flex-col gap-1">
					<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Smurfs</div>
					<Toggle bind:pressed={smurfs} class="h-10 w-full gap-0 border p-0 data-[state=on]:bg-sky-600 data-[state=on]:text-white">
						<div class="text-xl">
							<VenetianMask class="w-8 text-xl" />
						</div>
					</Toggle>
				</div>
				<div class="flex items-end">
					<button
						type="button"
						class="h-10 rounded-md bg-sky-600 px-3 text-sm font-medium text-white transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						onclick={clearFilters}
					>
						Clear
					</button>
				</div>
			</div>
			<div class="rounded-lg border border-zinc-700 bg-card p-3 sm:p-4">
				<div class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_18rem]">
					<div class="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-4">
						<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3 sm:col-span-2">
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0">
									<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
										<Swords class="h-3.5 w-3.5 text-zinc-500" /> Record
									</div>
									<div class="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
										<span class="text-2xl font-semibold tabular-nums text-zinc-100">
											{filteredStats.wins}-{filteredStats.losses}
										</span>
										<span class="text-sm font-medium tabular-nums text-zinc-300">
											{formatNumber(filteredStats.winRate, 1)}% WR
										</span>
									</div>
								</div>
								<div class="shrink-0 rounded-md bg-zinc-950 px-2 py-1 text-xs tabular-nums text-zinc-300">
									{totalMatches} matches
								</div>
							</div>
							<Tooltip.Root>
								<Tooltip.Trigger class="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-zinc-950">
									<div
										class="bg-green-500/80"
										style={`width: ${filteredStats.winRate}%`}
									></div>
									<div
										class="bg-red-500/80"
										style={`width: ${100 - filteredStats.winRate}%`}
									></div>
								</Tooltip.Trigger>
								<Tooltip.Content class="text-xs">
									{formatNumber(filteredStats.winRate, 1)}% wins, {formatNumber(100 - filteredStats.winRate, 1)}% losses
								</Tooltip.Content>
							</Tooltip.Root>
						</div>
						<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
							<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
								<BarChart3 class="h-3.5 w-3.5 text-zinc-500" /> Impact
							</div>
							<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">
								{formatNumber(filteredStats.averages.impact)}
							</div>
							<div class="text-xs text-zinc-400">average score</div>
						</div>
						<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
							<div class="text-[11px] font-medium uppercase tracking-wide text-zinc-400">K / D / A</div>
							<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">
								{formatNumber(filteredStats.averages.kills, 1)} /
								{formatNumber(filteredStats.averages.deaths, 1)} /
								{formatNumber(filteredStats.averages.assists, 1)}
							</div>
							<div class="text-xs text-zinc-400">{formatNumber(filteredKda, 2)} KDA</div>
						</div>
						<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
							<div class="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Economy</div>
							<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">
								{formatNumber(filteredStats.averages.gpm)} / {formatNumber(filteredStats.averages.xpm)}
							</div>
							<div class="text-xs text-zinc-400">{formatNumber(filteredStats.averages.lastHits)} LH</div>
						</div>
						<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
							<div class="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Damage</div>
							<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">
								{formatNumber(filteredStats.averages.heroDamage)}
							</div>
							<div class="text-xs text-zinc-400">
								{formatNumber(filteredStats.averages.towerDamage)} tower
							</div>
						</div>
						<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3 sm:col-span-2">
							<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
								<Clock class="h-3.5 w-3.5 text-zinc-500" /> Duration
							</div>
							<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">
								{toTime(Math.round(filteredStats.averages.duration))}
							</div>
							<div class="text-xs text-zinc-400">average match length</div>
						</div>
					</div>
					<div class="flex min-h-32 flex-col rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<div class="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
									Match Volume
								</div>
								<div class="mt-0.5 text-xs text-zinc-300">
									{totalMatches} filtered matches by day
								</div>
							</div>
							<div class="flex shrink-0 items-center gap-2 text-[11px] text-zinc-400">
								<span class="inline-flex items-center gap-1">
									<span class="h-2 w-2 rounded-full bg-green-500/80"></span>Wins
								</span>
								<span class="inline-flex items-center gap-1">
									<span class="h-2 w-2 rounded-full bg-red-500/80"></span>Losses
								</span>
							</div>
						</div>
						<div class="mt-3 flex min-h-20 flex-1 items-end gap-1">
							{#if filteredStats.timeline.length > 0}
								{#each filteredStats.timeline as day}
									<div class="flex min-w-0 flex-1 flex-col items-center gap-1">
										<Tooltip.Root>
											<Tooltip.Trigger>
												{#snippet child({ props })}
													<button
														type="button"
														class="flex w-full flex-col justify-end overflow-hidden rounded-sm bg-zinc-950 outline-none transition-colors hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-ring"
														style={`height: ${Math.max(6, ((day.wins + day.losses) / timelineMax) * 76)}px`}
														aria-label={`${dayjs(day.date).format('DD MMM YYYY')}: ${day.wins} wins, ${day.losses} losses`}
														{...props}
													>
														<div
															class="bg-green-500/80"
															style={`height: ${
																day.wins + day.losses > 0
																	? (day.wins / (day.wins + day.losses)) * 100
																	: 0
															}%`}
														></div>
														<div
															class="bg-red-500/80"
															style={`height: ${
																day.wins + day.losses > 0
																	? (day.losses / (day.wins + day.losses)) * 100
																	: 0
															}%`}
														></div>
													</button>
												{/snippet}
											</Tooltip.Trigger>
											<Tooltip.Content side="top" align="center" class="text-xs">
												<div class="font-medium text-zinc-100">
													{dayjs(day.date).format('DD MMM YYYY')}
												</div>
												<div class="mt-1 tabular-nums text-zinc-300">
													{day.wins + day.losses} matches: {day.wins} wins, {day.losses} losses
												</div>
											</Tooltip.Content>
										</Tooltip.Root>
									</div>
								{/each}
							{:else}
								<div class="flex flex-1 items-center justify-center rounded-md border border-dashed border-zinc-800 px-3 text-center text-xs text-zinc-400">
									No match volume for this filter
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
			{#key matchBlocks}
				<div class="min-h-64" in:fade={{ duration: 400 }}>
					{#if isLoadingMatches}
						<div class="flex h-full items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/50">
							<div class="h-64 py-8">
								<Loading />
							</div>
						</div>
					{:else if matchesError}
						<div class="flex min-h-64 items-center justify-center rounded-md border border-red-900/60 bg-red-950/30 px-4 py-8 text-center">
							<div>
								<div class="text-sm font-medium text-red-100">Matches could not load</div>
								<div class="mt-1 text-xs text-red-200/80">{matchesError}</div>
								<button
									type="button"
									class="mt-4 rounded-md border border-red-800/80 px-3 py-2 text-sm text-red-100 transition-colors hover:bg-red-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									onclick={() => updateMatchesData(pageNumber)}
								>
									Try again
								</button>
							</div>
						</div>
					{:else if matchBlocks.length == 0}
						<div class="flex min-h-64 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/50 px-4 py-8 text-center">
							<div>
								<div class="text-sm font-medium text-zinc-200">No matches for these filters</div>
								<div class="mt-1 text-xs text-zinc-400">Adjust the filters above to widen the result set.</div>
							</div>
						</div>
					{:else}
						<div class="flex flex-col gap-2">
							<div class="mx-auto flex w-full max-w-4xl flex-col items-center gap-2 py-2">
								{#each matchBlocks.slice(0, 20) as match}
									<Card.Root class="overflow-hidden w-full max-w-[420px] lg:max-w-[760px]">
										<Card.Content class="p-0 ">
											<MatchDropdown {match} />
										</Card.Content>
									</Card.Root>
								{/each}
							</div>
							<div class="flex items-center justify-center gap-4">
								<button
									class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-sky-600 text-sky-950 transition-colors duration-200 hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
									disabled={pageNumber == 1}
									onclick={() => decrementPage()}
								>
									<ArrowLeft class="h-4 w-4" /></button
								>
								<div class="min-w-10 text-center text-sm tabular-nums text-zinc-300">{pageNumber}</div>
								<button
									class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-sky-600 text-sky-950 transition-colors duration-200 hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
									disabled={matchBlocks.length < 20}
									onclick={() => incrementPage()}
								>
									<ArrowRight class="h-4 w-4" />
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/key}
		</div>
	{/key}
</div>
