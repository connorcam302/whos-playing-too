<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import { ArrowLeft, ArrowRight, VenetianMask } from 'lucide-svelte';
	import { onMount, tick } from 'svelte';

	let { data } = $props();
	const { playerList, heroList } = data;

	let selectedPlayers = $state<string[]>([]);
	let selectedHeroes = $state<string[]>([]);
	let ranked = $state(true);
	let unranked = $state(true);
	let other = $state(true);
	let smurfs = $state(false);
	let matchBlocks: any[] = $state([]);
	let pageNumber = $state(1);
	let mounted = $state(false);
	let loading = $state(false);

	const makePlayerTrigger = () => {
		if (selectedPlayers.length === 0 || selectedPlayers.includes('-1')) return 'All Players';
		if (selectedPlayers.length === 1) {
			return playerList.find((p: any) => p.id.toString() === selectedPlayers[0])?.username;
		}
		return `${selectedPlayers.length} Players`;
	};

	const makeHeroTrigger = () => {
		if (selectedHeroes.length === 0 || selectedHeroes.includes('-1')) return 'All Heroes';
		if (selectedHeroes.length === 1) {
			return heroList.find((h: any) => h.id.toString() === selectedHeroes[0])?.name;
		}
		return `${selectedHeroes.length} Heroes`;
	};

	const buildParams = () => {
		const params = new URLSearchParams();

		const players = selectedPlayers.filter((id) => id !== '-1');
		if (players.length > 0) {
			params.set('players', `[${players.join(',')}]`);
		}

		const heroes = selectedHeroes.filter((id) => id !== '-1');
		if (heroes.length > 0) {
			params.set('heroes', `[${heroes.join(',')}]`);
		}

		const gameModes: string[] = [];
		if (ranked) gameModes.push('ranked-all-pick');
		if (unranked) gameModes.push('unranked-all-pick');
		if (other) gameModes.push('other');
		if (gameModes.length > 0) {
			params.set('gameMode', `["${gameModes.join('","')}"]`);
		}

		params.set('page', (pageNumber - 1).toString());
		params.set('smurf', smurfs.toString());

		return params;
	};

	let fetchId = 0;

	const fetchMatches = async () => {
		const id = ++fetchId;
		loading = true;

		await tick();
		const params = buildParams();

		try {
			const res = await fetch(`/api/matches/all?${params.toString()}`);
			const data = await res.json();
			if (id === fetchId) {
				matchBlocks = data;
				loading = false;
			}
		} catch {
			if (id === fetchId) {
				loading = false;
			}
		}

		const url = new URL($page.url);
		url.search = params.toString();
		replaceState(`${url.pathname}${url.search}`, $page.state);
	};

	onMount(() => {
		const url = $page.url;

		if (url.searchParams.has('players')) {
			try {
				const ids: number[] = JSON.parse(url.searchParams.get('players')!);
				selectedPlayers = ids.map(String);
			} catch {}
		}
		if (url.searchParams.has('heroes')) {
			try {
				const ids: number[] = JSON.parse(url.searchParams.get('heroes')!);
				selectedHeroes = ids.map(String);
			} catch {}
		}
		if (url.searchParams.has('page')) {
			pageNumber = Number(url.searchParams.get('page')) || 1;
		}

		fetchMatches();
		mounted = true;
	});

	$effect(() => {
		if (!mounted) return;
		// Track all filter values to re-fetch when they change
		selectedPlayers;
		selectedHeroes;
		ranked;
		unranked;
		other;
		smurfs;
		// Reset to page 1 and fetch
		pageNumber = 1;
		fetchMatches();
	});

	const incrementPage = () => {
		pageNumber += 1;
		fetchMatches();
	};

	const decrementPage = () => {
		pageNumber -= 1;
		fetchMatches();
	};

	const clearFilters = () => {
		selectedPlayers = [];
		selectedHeroes = [];
		ranked = true;
		unranked = true;
		other = true;
		smurfs = false;
	};
</script>

<svelte:head>
	<title>whos-playing | Matches</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 sm:px-4">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-zinc-100">Matches</h1>
		<p class="mt-1 text-sm text-zinc-400">Browse all tracked matches with filters.</p>
	</div>

	<div class="grid gap-3 rounded-md border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1fr_1fr_auto_auto_auto]">
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
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Lobby</div>
			<div class="flex flex-wrap gap-1">
				<Toggle bind:pressed={ranked} class="h-10 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white">Ranked</Toggle>
				<Toggle bind:pressed={unranked} class="h-10 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white">Unranked</Toggle>
				<Toggle bind:pressed={other} class="h-10 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white">Other</Toggle>
			</div>
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Smurfs</div>
			<Toggle bind:pressed={smurfs} class="h-10 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white">
				<VenetianMask class="h-5 w-5" />
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

	<div class="min-h-64">
		{#if loading || matchBlocks.length === 0}
			<div class="flex min-h-64 items-center justify-center">
				<Loading />
			</div>
		{:else}
			<div class="flex flex-col gap-2" in:fade={{ duration: 400 }}>
				{#each matchBlocks.slice(0, 10) as match}
					<Card.Root class="max-w-105 lg:max-w-190 overflow-hidden">
						<Card.Content class="p-0">
							<MatchBlock {match} />
						</Card.Content>
					</Card.Root>
				{/each}
				<div class="flex items-center justify-center gap-3 py-2">
					<button
						class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 transition-colors duration-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-600"
						disabled={pageNumber === 1}
						onclick={decrementPage}
					>
						<ArrowLeft class="h-4 w-4" />
					</button>
					<div class="min-w-10 text-center text-sm tabular-nums text-zinc-300">{pageNumber}</div>
					<button
						class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 transition-colors duration-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-600"
						disabled={matchBlocks.length < 10}
						onclick={incrementPage}
					>
						<ArrowRight class="h-4 w-4" />
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
