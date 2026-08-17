<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import { DATE_RANGE_PRESETS, DOTA_MAJOR_PATCHES } from '$lib/data/dotaPatchRanges';
	import { getRoleName, toTime } from '$lib/functions';
	import Loading from '$lib/components/Loading.svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import {
		Activity,
		ArrowLeft,
		ArrowRight,
		Clock,
		Gauge,
		ListFilter,
		RotateCcw,
		Swords,
		VenetianMask
	} from 'lucide-svelte';
	import { onMount, tick, untrack } from 'svelte';
	import { fade } from 'svelte/transition';

	type MatchStats = {
		matchCount: number;
		appearances: number;
		wins: number;
		losses: number;
		winRate: number;
		rankedMatches: number;
		rankedRate: number;
		averages: {
			kills: number;
			deaths: number;
			assists: number;
			impact: number;
			duration: number;
		};
	};

	let { data } = $props();
	let playerList = $derived(data.playerList);
	let heroList = $derived(data.heroList);

	const emptyStats = (): MatchStats => ({
		matchCount: 0,
		appearances: 0,
		wins: 0,
		losses: 0,
		winRate: 0,
		rankedMatches: 0,
		rankedRate: 0,
		averages: { kills: 0, deaths: 0, assists: 0, impact: 0, duration: 0 }
	});

	let selectedPlayers = $state<string[]>([]);
	let selectedHeroes = $state<string[]>([]);
	let selectedRoles = $state(['1', '2', '3', '4', '5']);
	let selectedDateRange = $state('all');
	let ranked = $state(true);
	let unranked = $state(true);
	let other = $state(true);
	let wins = $state(true);
	let losses = $state(true);
	let smurfs = $state(false);
	let versus = $state(false);
	let matchBlocks: any[] = $state([]);
	let stats: MatchStats = $state(emptyStats());
	let totalMatches = $state(0);
	let pageNumber = $state(1);
	let mounted = $state(false);
	let loading = $state(false);
	let matchesError = $state('');
	let fetchId = 0;

	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value || 0);

	let filteredKda = $derived(
		(stats.averages.kills + stats.averages.assists) / Math.max(stats.averages.deaths, 1)
	);
	let totalPages = $derived(Math.max(1, Math.ceil(totalMatches / 10)));
	let selectedPlayerIds = $derived(selectedPlayers.filter((id) => id !== '-1'));
	let hasActiveFilters = $derived(
		selectedPlayers.length > 0 ||
		selectedHeroes.length > 0 ||
		selectedRoles.length < 5 ||
		selectedDateRange !== 'all' ||
		!ranked ||
		!unranked ||
		!other ||
		!wins ||
		!losses ||
		smurfs ||
		versus
	);

	const makePlayerTrigger = () => {
		if (selectedPlayers.length === 0 || selectedPlayers.includes('-1')) return 'All Players';
		if (selectedPlayers.length === 1) {
			return playerList.find((player: any) => player.id.toString() === selectedPlayers[0])
				?.username;
		}
		return `${selectedPlayers.length} Players`;
	};

	const makeHeroTrigger = () => {
		if (selectedHeroes.length === 0 || selectedHeroes.includes('-1')) return 'All Heroes';
		if (selectedHeroes.length === 1) {
			return heroList.find((hero: any) => hero.id.toString() === selectedHeroes[0])?.name;
		}
		return `${selectedHeroes.length} Heroes`;
	};

	const makeRolesTrigger = () => {
		if (selectedRoles.length === 0 || selectedRoles.length === 5) return 'All Roles';
		if (selectedRoles.length === 1) return getRoleName(Number(selectedRoles[0]));
		return `${selectedRoles.length} Roles`;
	};

	const makeDateRangeTrigger = () => {
		return (
			DATE_RANGE_PRESETS.find((range) => range.value === selectedDateRange)?.label ??
			DOTA_MAJOR_PATCHES.find((patch) => `patch-${patch.version}` === selectedDateRange)?.label ??
			'All Time'
		);
	};

	const buildParams = () => {
		const params = new URLSearchParams();
		const players = selectedPlayerIds;
		const heroes = selectedHeroes.filter((id) => id !== '-1');

		if (players.length > 0) params.set('players', JSON.stringify(players.map(Number)));
		if (heroes.length > 0) params.set('heroes', JSON.stringify(heroes.map(Number)));
		if (selectedRoles.length < 5) params.set('roles', JSON.stringify(selectedRoles.map(Number)));

		const gameModes: string[] = [];
		if (ranked) gameModes.push('ranked-all-pick');
		if (unranked) gameModes.push('unranked-all-pick');
		if (other) gameModes.push('other');
		params.set('gameMode', JSON.stringify(gameModes));
		params.set('results', JSON.stringify([...(wins ? ['wins'] : []), ...(losses ? ['losses'] : [])]));
		params.set('dateRange', selectedDateRange);
		params.set('page', (pageNumber - 1).toString());
		params.set('smurf', smurfs.toString());
		params.set('versus', versus.toString());
		return params;
	};

	const fetchMatches = async () => {
		const id = ++fetchId;
		loading = true;
		matchesError = '';
		await tick();
		const params = buildParams();

		try {
			const response = await fetch(`/api/matches/all?${params.toString()}`);
			if (!response.ok) throw new Error(`Failed to load matches (${response.status})`);
			const responseData = await response.json();
			if (id !== fetchId) return;

			matchBlocks = Array.isArray(responseData) ? responseData : (responseData.matches ?? []);
			stats = Array.isArray(responseData) ? emptyStats() : (responseData.stats ?? emptyStats());
			totalMatches = Array.isArray(responseData) ? responseData.length : (responseData.totalMatches ?? 0);
		} catch (error) {
			if (id !== fetchId) return;
			matchBlocks = [];
			stats = emptyStats();
			totalMatches = 0;
			matchesError = error instanceof Error ? error.message : 'Failed to load matches';
		} finally {
			if (id === fetchId) loading = false;
		}

		const url = new URL($page.url);
		url.search = params.toString();
		replaceState(`${url.pathname}${url.search}`, $page.state);
	};

	const handleLobbyChange = (lobby: 'ranked' | 'unranked' | 'other') => {
		const current = lobby === 'ranked' ? ranked : lobby === 'unranked' ? unranked : other;
		if (Number(ranked) + Number(unranked) + Number(other) > 1 || !current) {
			if (lobby === 'ranked') ranked = !ranked;
			if (lobby === 'unranked') unranked = !unranked;
			if (lobby === 'other') other = !other;
		}
	};

	const handleResultChange = (result: 'wins' | 'losses') => {
		const current = result === 'wins' ? wins : losses;
		if (Number(wins) + Number(losses) > 1 || !current) {
			if (result === 'wins') wins = !wins;
			if (result === 'losses') losses = !losses;
		}
	};

	const clearFilters = () => {
		selectedPlayers = [];
		selectedHeroes = [];
		selectedRoles = ['1', '2', '3', '4', '5'];
		selectedDateRange = 'all';
		ranked = true;
		unranked = true;
		other = true;
		wins = true;
		losses = true;
		smurfs = false;
		versus = false;
	};

	const readArrayParam = (name: string) => {
		try {
			return JSON.parse($page.url.searchParams.get(name) ?? '[]').map(String);
		} catch {
			return [];
		}
	};

	onMount(() => {
		selectedPlayers = readArrayParam('players');
		selectedHeroes = readArrayParam('heroes');
		const rolesFromUrl = readArrayParam('roles');
		if (rolesFromUrl.length > 0) selectedRoles = rolesFromUrl;
		selectedDateRange = $page.url.searchParams.get('dateRange') ?? 'all';
		pageNumber = Math.max(1, Number($page.url.searchParams.get('page') ?? 0) + 1);
		smurfs = $page.url.searchParams.get('smurf') === 'true';
		versus = $page.url.searchParams.get('versus') === 'true';

		const gameModes = readArrayParam('gameMode');
		if (gameModes.length > 0) {
			ranked = gameModes.includes('ranked-all-pick');
			unranked = gameModes.includes('unranked-all-pick');
			other = gameModes.includes('other');
		}
		const results = readArrayParam('results');
		if (results.length > 0) {
			wins = results.includes('wins');
			losses = results.includes('losses');
		}
		mounted = true;
	});

	$effect(() => {
		if (!mounted) return;
		selectedPlayers;
		selectedHeroes;
		selectedRoles;
		selectedDateRange;
		ranked;
		unranked;
		other;
		wins;
		losses;
		smurfs;
		versus;

		untrack(() => {
			pageNumber = 1;
			fetchMatches();
		});
	});
</script>

<svelte:head>
	<title>whos-playing | Matches</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 sm:px-4">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-zinc-100">Matches</h1>
		<p class="mt-1 text-sm text-zinc-400">Filter the group history and compare the resulting form.</p>
	</div>

	<section class="rounded-lg border border-border bg-card p-3" aria-label="Match filters">
		<div class="mb-3 flex items-center justify-between gap-3 border-b border-zinc-800 pb-2">
			<div class="flex items-center gap-2 text-sm font-medium text-zinc-200">
				<ListFilter class="h-4 w-4 text-zinc-400" /> Filters
				{#if hasActiveFilters}
					<span class="rounded bg-sky-950 px-1.5 py-0.5 text-[11px] font-medium text-sky-200">Active</span>
				{/if}
			</div>
			<button
				type="button"
				class="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-950/70 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:text-zinc-600"
				disabled={!hasActiveFilters}
				onclick={clearFilters}
			>
				<RotateCcw class="h-3.5 w-3.5" /> Reset
			</button>
		</div>

		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<div class="flex min-w-0 flex-col gap-1">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Players</div>
				<Select.Root type="multiple" bind:value={selectedPlayers}>
					<Select.Trigger class="w-full">{makePlayerTrigger()}</Select.Trigger>
					<Select.Content>
						<Select.Item value="-1" label="All Players">All Players</Select.Item>
						{#each playerList as player}
							<Select.Item value={player.id.toString()} label={player.username}>{player.username}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex min-w-0 flex-col gap-1">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Heroes</div>
				<Select.Root type="multiple" bind:value={selectedHeroes}>
					<Select.Trigger class="w-full">{makeHeroTrigger()}</Select.Trigger>
					<Select.Content>
						<Select.Item value="-1" label="All Heroes">All Heroes</Select.Item>
						{#each heroList as hero}
							<Select.Item value={hero.id.toString()} label={hero.name}>
								<div class="flex items-center gap-2">
									<img src={hero.img} alt="" class="h-6 w-8 rounded-sm object-cover" />
									<span>{hero.name}</span>
								</div>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex min-w-0 flex-col gap-1">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Roles</div>
				<Select.Root type="multiple" bind:value={selectedRoles}>
					<Select.Trigger class="w-full">{makeRolesTrigger()}</Select.Trigger>
					<Select.Content>
						{#each [1, 2, 3, 4, 5] as role}
							<Select.Item value={role.toString()} label={getRoleName(role)}>
								<div class="flex items-center gap-2">
									<img class="h-6 w-6" src={`/roles/pos${role}.svg`} alt="" />
									<span>{getRoleName(role)}</span>
								</div>
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
							<Select.Item value={`patch-${patch.version}`} label={patch.label}>{patch.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex flex-col gap-1 lg:col-span-2">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Lobby</div>
				<div class="flex flex-wrap gap-1">
					{#each [
						{ value: 'ranked', label: 'Ranked', pressed: ranked },
						{ value: 'unranked', label: 'Unranked', pressed: unranked },
						{ value: 'other', label: 'Other', pressed: other }
					] as lobby}
						<button
							type="button"
							aria-pressed={lobby.pressed}
							class="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {lobby.pressed ? 'bg-sky-600 text-white' : 'bg-transparent text-zinc-300'}"
							onclick={() => handleLobbyChange(lobby.value as 'ranked' | 'unranked' | 'other')}
						>{lobby.label}</button
						>
					{/each}
				</div>
			</div>
			<div class="flex flex-col gap-1">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Result</div>
				<div class="flex gap-1">
					<button type="button" aria-pressed={wins} class="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {wins ? 'bg-green-700 text-white' : 'bg-transparent text-zinc-300'}" onclick={() => handleResultChange('wins')}>Wins</button>
					<button type="button" aria-pressed={losses} class="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {losses ? 'bg-red-700 text-white' : 'bg-transparent text-zinc-300'}" onclick={() => handleResultChange('losses')}>Losses</button>
				</div>
			</div>
			<div class="flex flex-col gap-1">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Accounts</div>
				<Toggle bind:pressed={smurfs} class="h-10 w-fit gap-2 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white">
					<VenetianMask class="h-4 w-4" /> Include smurfs
				</Toggle>
			</div>
			<div class="flex flex-col gap-1">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Matchup</div>
				<button
					type="button"
					aria-pressed={versus}
					title="Only show matches where tracked players opposed each other"
					class="inline-flex h-10 w-fit items-center justify-center rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {versus ? 'bg-sky-600 text-white' : 'bg-transparent text-zinc-300'}"
					onclick={() => (versus = !versus)}
				>
					Versus
				</button>
			</div>
		</div>
	</section>

	<section class="rounded-lg border border-border bg-card p-3 sm:p-4" aria-label="Filtered match summary" aria-busy={loading}>
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
			<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
				<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400"><Activity class="h-3.5 w-3.5 text-zinc-500" /> Matches</div>
				<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">{totalMatches}</div>
				<div class="text-xs text-zinc-400">filtered games</div>
			</div>
			<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
				<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400"><Swords class="h-3.5 w-3.5 text-zinc-500" /> Tracked Record</div>
				<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">{stats.wins}-{stats.losses}</div>
				<Tooltip.Root>
					<Tooltip.Trigger class="text-left text-xs tabular-nums text-zinc-400">{formatNumber(stats.winRate, 1)}% WR</Tooltip.Trigger>
					<Tooltip.Content class="max-w-64 text-xs">Based on {stats.appearances} tracked player appearances in these matches.</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
				<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400"><Gauge class="h-3.5 w-3.5 text-zinc-500" /> Impact</div>
				<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">{formatNumber(stats.averages.impact)}</div>
				<div class="text-xs text-zinc-400">average score</div>
			</div>
			<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
				<div class="text-[11px] font-medium uppercase tracking-wide text-zinc-400">K / D / A</div>
				<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">{formatNumber(stats.averages.kills, 1)} / {formatNumber(stats.averages.deaths, 1)} / {formatNumber(stats.averages.assists, 1)}</div>
				<div class="text-xs text-zinc-400">{formatNumber(filteredKda, 2)} KDA</div>
			</div>
			<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
				<div class="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Ranked Share</div>
				<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">{formatNumber(stats.rankedRate, 1)}%</div>
				<div class="text-xs text-zinc-400">{stats.rankedMatches} matches</div>
			</div>
			<div class="rounded-md border border-zinc-800/70 bg-zinc-900/45 p-3">
				<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400"><Clock class="h-3.5 w-3.5 text-zinc-500" /> Duration</div>
				<div class="mt-1 text-xl font-semibold tabular-nums text-zinc-100">{toTime(Math.round(stats.averages.duration))}</div>
				<div class="text-xs text-zinc-400">average length</div>
			</div>
		</div>
		<div class="mt-3 flex h-2 overflow-hidden rounded-full bg-zinc-950" aria-label={`${formatNumber(stats.winRate, 1)}% tracked win rate`}>
			<div class="bg-green-500/80" style={`width: ${stats.winRate}%`}></div>
			<div class="bg-red-500/80" style={`width: ${100 - stats.winRate}%`}></div>
		</div>
	</section>

	<div class="min-h-64">
		{#if loading}
			<div class="flex min-h-64 items-center justify-center"><Loading /></div>
		{:else if matchesError}
			<div class="flex min-h-64 items-center justify-center rounded-md border border-red-900/60 bg-red-950/30 px-4 text-center">
				<div>
					<div class="text-sm font-medium text-red-100">Matches could not load</div>
					<div class="mt-1 text-xs text-red-200/80">{matchesError}</div>
					<button type="button" class="mt-4 rounded-md border border-red-800/80 px-3 py-2 text-sm text-red-100 hover:bg-red-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onclick={fetchMatches}>Try again</button>
				</div>
			</div>
		{:else if matchBlocks.length === 0}
			<div class="flex min-h-64 items-center justify-center rounded-md border border-dashed border-zinc-700 bg-card px-4 text-center">
				<div>
					<div class="text-sm font-medium text-zinc-200">No matches fit these filters</div>
					<div class="mt-1 text-xs text-zinc-400">Try a wider date range or reset the filters.</div>
					<button type="button" class="mt-4 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onclick={clearFilters}>Reset filters</button>
				</div>
			</div>
		{:else}
			<div class="flex flex-col gap-2" in:fade={{ duration: 200 }}>
				{#each matchBlocks as match}
					<Card.Root class="max-w-105 overflow-hidden lg:max-w-190">
						<Card.Content class="p-0"><MatchBlock {match} /></Card.Content>
					</Card.Root>
				{/each}
				<div class="flex items-center justify-center gap-3 py-2">
					<button type="button" aria-label="Previous page" class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-600" disabled={pageNumber === 1} onclick={() => { pageNumber -= 1; fetchMatches(); }}><ArrowLeft class="h-4 w-4" /></button>
					<div class="min-w-20 text-center text-sm tabular-nums text-zinc-300">{pageNumber} of {totalPages}</div>
					<button type="button" aria-label="Next page" class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-600" disabled={pageNumber >= totalPages} onclick={() => { pageNumber += 1; fetchMatches(); }}><ArrowRight class="h-4 w-4" /></button>
				</div>
			</div>
		{/if}
	</div>
</div>
