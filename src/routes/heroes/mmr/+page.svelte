<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState
	} from '@tanstack/table-core';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table';
	import { getRoleIcon, getRoleName } from '$lib/functions';
	import {
		ArrowLeft,
		ArrowUpDown,
		ChevronDown,
		ChevronRight,
		FlaskConical,
		Search
	} from 'lucide-svelte';

	type MmrPlayer = {
		playerId: number;
		username: string;
		smurf: boolean;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		recentForm: string;
		avgImpact: number;
		primaryRole: number;
		mmr: number;
		initialMmr: number;
		mmrChange: number;
		totalChange: number;
		peakMmr: number;
		lastPlayed: number;
	};

	type HeroSummary = {
		id: number;
		name: string;
		img: string;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		roleRankings: Record<number, MmrPlayer[]>;
	};

	type RankedHero = HeroSummary & {
		topPlayers: MmrPlayer[];
	};

	type Props = {
		data: {
			heroes: HeroSummary[];
			totalMatches: number;
			trackedHeroes: number;
			ratedCombinations: number;
		};
	};

	let { data }: Props = $props();

	let searchValue = $state('');
	let expandedHeroes = $state<Record<number, boolean>>({});
	let sorting = $state<SortingState>([{ id: 'mmr', desc: true }]);

	const formatNumber = (value: number | null | undefined, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value ?? 0);

	const formatPercent = (value: number | null | undefined) => `${formatNumber(value, 1)}%`;

	const formatChange = (value: number) => (value > 0 ? `+${formatNumber(value)}` : formatNumber(value));

	const getChangeClass = (value: number) => {
		if (value === 0) return 'text-zinc-500';
		return value > 0 ? 'text-green-400' : 'text-red-400';
	};

	const toggleHero = (heroId: number) => {
		expandedHeroes = {
			...expandedHeroes,
			[heroId]: !expandedHeroes[heroId]
		};
	};

	const activeHeroes = $derived.by(() =>
		data.heroes.map((hero) => ({
			...hero,
			topPlayers: Object.values(hero.roleRankings)
				.flat()
				.sort((a, b) => b.mmr - a.mmr || b.matches - a.matches)
		}))
	);

	const filteredHeroes = $derived(
		activeHeroes.filter((hero) => hero.name.toLowerCase().includes(searchValue.toLowerCase()))
	);

	const topHero = $derived(activeHeroes.find((hero) => hero.topPlayers.length > 0));

	const getHeroSortValue = (hero: RankedHero, columnId: string) => {
		const bestPlayer = hero.topPlayers[0];

		if (columnId === 'hero') return hero.name;
		if (columnId === 'player') return bestPlayer?.username ?? '';
		if (columnId === 'role') return bestPlayer?.primaryRole ?? -1;
		if (columnId === 'mmr') return bestPlayer?.mmr ?? -1;
		if (columnId === 'initialMmr') return bestPlayer?.initialMmr ?? -1;
		if (columnId === 'mmrChange') return bestPlayer?.mmrChange ?? -999;
		if (columnId === 'wl') return bestPlayer?.winRate ?? -1;
		if (columnId === 'winRate') return bestPlayer?.winRate ?? -1;
		if (columnId === 'impact') return bestPlayer?.avgImpact ?? -1;
		if (columnId === 'matches') return bestPlayer?.matches ?? -1;
		if (columnId === 'players') return hero.topPlayers.length;
		return '';
	};

	const tableColumns = $derived<ColumnDef<RankedHero>[]>(
		[
			{ id: 'hero', header: 'Hero' },
			{ id: 'player', header: 'MMR Leader' },
			{ id: 'role', header: 'Role' },
			{ id: 'mmr', header: 'MMR' },
			{ id: 'initialMmr', header: 'Placement' },
			{ id: 'mmrChange', header: 'Last Δ' },
			{ id: 'wl', header: 'W/L' },
			{ id: 'winRate', header: 'WR' },
			{ id: 'impact', header: 'Impact' },
			{ id: 'matches', header: 'Matches' },
			{ id: 'players', header: 'Ratings', enableSorting: false }
		].map((column) => ({
			id: column.id,
			header: column.header,
			enableSorting: column.enableSorting ?? true,
			accessorFn: (hero) => getHeroSortValue(hero, column.id),
			sortingFn: (rowA, rowB) => {
				const valueA = getHeroSortValue(rowA.original, column.id);
				const valueB = getHeroSortValue(rowB.original, column.id);
				if (typeof valueA === 'string' || typeof valueB === 'string') {
					return String(valueA).localeCompare(String(valueB));
				}
				return Number(valueA) - Number(valueB);
			}
		}))
	);

	const table = $derived(
		createSvelteTable({
			data: filteredHeroes,
			columns: tableColumns,
			state: {
				get sorting() {
					return sorting;
				}
			},
			onSortingChange: (updater) => {
				sorting = updater instanceof Function ? updater(sorting) : updater;
			},
			getCoreRowModel: getCoreRowModel(),
			getSortedRowModel: getSortedRowModel()
		})
	);

	const rightAlignedColumns = [
		'role',
		'mmr',
		'initialMmr',
		'mmrChange',
		'wl',
		'winRate',
		'impact',
		'matches',
		'players'
	];
	const getHeaderClass = (columnId: string) =>
		rightAlignedColumns.includes(columnId) ? 'text-right' : '';
	const getHeaderButtonClass = (columnId: string) =>
		rightAlignedColumns.includes(columnId) ? 'ml-auto' : '';
	const getHiddenPlayers = (hero: RankedHero) => hero.topPlayers.slice(1);
</script>

<svelte:head>
	<title>whos-playing | Hero MMR Lab</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 pb-4 pt-16 sm:px-4">
	<section class="rounded-md border border-border bg-card p-4">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<div class="flex items-center gap-2 text-sm text-violet-300">
					<FlaskConical class="h-4 w-4" />
					Temporary rating experiment
				</div>
				<h1 class="mt-1 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
					Hero MMR Lab
				</h1>
				<p class="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
					The first 20 games set a placement rating. Wins, losses, and impact determine the
					landing point; normal MMR changes begin with game 21. Nothing on this page is saved.
				</p>
				<div class="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
					<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
						{data.trackedHeroes} tracked heroes
					</span>
					<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
						{data.totalMatches} hero picks
					</span>
					<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
						{data.ratedCombinations} calibrated player-role ratings
					</span>
					{#if topHero?.topPlayers[0]}
						<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
							Highest: {topHero.topPlayers[0].username} on {topHero.name}, {formatNumber(topHero.topPlayers[0].mmr)}
						</span>
					{/if}
				</div>
			</div>
			<a
				href="/heroes"
				class="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<ArrowLeft class="h-3.5 w-3.5" />
				Standard hero scores
			</a>
		</div>
	</section>

	<section class="rounded-md border border-border bg-card p-4">
		<div class="grid gap-3 text-xs sm:grid-cols-3">
			<div class="rounded-md border border-zinc-800 bg-zinc-950/45 p-3">
				<div class="font-medium text-zinc-200">Placement phase</div>
				<div class="mt-1 text-zinc-500">First <span class="text-zinc-300">20 games</span></div>
			</div>
			<div class="rounded-md border border-zinc-800 bg-zinc-950/45 p-3">
				<div class="font-medium text-zinc-200">Initial rating</div>
				<div class="mt-1 text-zinc-500">Centered at 1,000 with <span class="text-zinc-300">no placement cap</span></div>
			</div>
			<div class="rounded-md border border-zinc-800 bg-zinc-950/45 p-3">
				<div class="font-medium text-zinc-200">After placement</div>
				<div class="mt-1 text-zinc-500">Results move <span class="text-zinc-300">15 to 35 MMR</span></div>
			</div>
		</div>
	</section>

	<section class="rounded-md border border-border bg-card p-4">
		<div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 class="text-base font-semibold text-zinc-100">MMR Leaders By Hero</h2>
				<p class="mt-1 text-xs text-zinc-500">Each role has its own rating history.</p>
			</div>
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
				<label class="relative block w-full sm:w-64">
					<span class="sr-only">Search heroes</span>
					<Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
					<input
						bind:value={searchValue}
						placeholder="Search heroes..."
						class="h-9 w-full rounded-md border border-zinc-700/50 bg-zinc-950 pl-8 pr-3 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-600 focus:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-ring"
					/>
				</label>
				<div class="text-xs text-zinc-500">{filteredHeroes.length} shown</div>
			</div>
		</div>

		<div class="overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
			<Table.Root>
				<Table.Header class="bg-zinc-950/70">
					{#each table.getHeaderGroups() as headerGroup}
						<Table.Row class="border-zinc-800 hover:bg-transparent">
							{#each headerGroup.headers as header}
								<Table.Head
									class="{getHeaderClass(header.column.id)} h-9 px-2 text-[11px] uppercase tracking-wide text-zinc-400"
								>
									{#if !header.isPlaceholder}
										{#if header.column.getCanSort()}
											<button
												class="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {getHeaderButtonClass(header.column.id)}"
												onclick={header.column.getToggleSortingHandler()}
											>
												<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
												<ArrowUpDown class="h-2.5 w-2.5" />
											</button>
										{:else}
											<span class="block text-[11px] font-medium uppercase tracking-wide text-zinc-400">
												<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
											</span>
										{/if}
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body>
					{#each table.getRowModel().rows as row}
						{@const hero = row.original}
						{@const bestPlayer = hero.topPlayers[0]}
						{@const hiddenPlayers = getHiddenPlayers(hero)}
						<Table.Row class="border-zinc-900 transition-colors hover:bg-zinc-900/70">
							<Table.Cell class="px-2 py-2">
								<a href={`/heroes/${hero.id}`} class="flex min-w-0 items-center gap-3 text-zinc-100 transition-colors hover:text-sky-300">
									<img src={hero.img} alt={hero.name} class="h-10 w-16 shrink-0 rounded-sm border border-zinc-800 object-cover" />
									<span class="truncate font-medium">{hero.name}</span>
								</a>
							</Table.Cell>
							<Table.Cell class="px-2 py-2">
								{#if bestPlayer}
									<button onclick={() => goto(`/player/${bestPlayer.playerId}`)} class="inline-flex max-w-40 truncate text-left font-medium text-zinc-100 transition-colors hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
										<span class="truncate">{bestPlayer.username}</span>
									</button>
								{:else}
									<span class="text-sm text-zinc-500">Not calibrated</span>
								{/if}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right">
								{#if bestPlayer}
									<img src={getRoleIcon(bestPlayer.primaryRole)} alt={getRoleName(bestPlayer.primaryRole)} title={getRoleName(bestPlayer.primaryRole)} class="ml-auto h-5 w-5" />
								{:else}<span class="text-zinc-600">-</span>{/if}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right text-lg font-semibold tabular-nums text-zinc-100">
								{bestPlayer ? formatNumber(bestPlayer.mmr) : '-'}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-400">
								{bestPlayer ? formatNumber(bestPlayer.initialMmr) : '-'}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right text-sm font-medium tabular-nums {bestPlayer ? getChangeClass(bestPlayer.mmrChange) : 'text-zinc-600'}">
								{bestPlayer ? formatChange(bestPlayer.mmrChange) : '-'}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right tabular-nums">
								{#if bestPlayer}<span class="text-green-400">{bestPlayer.wins}</span><span class="text-zinc-600">/</span><span class="text-red-400">{bestPlayer.losses}</span>{:else}<span class="text-zinc-600">-</span>{/if}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{bestPlayer ? formatPercent(bestPlayer.winRate) : '-'}</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{bestPlayer ? formatNumber(bestPlayer.avgImpact, 1) : '-'}</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{bestPlayer?.matches ?? '-'}</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right">
								{#if hiddenPlayers.length > 0}
									<button class="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onclick={() => toggleHero(hero.id)} aria-label={expandedHeroes[hero.id] ? `Hide remaining ratings for ${hero.name}` : `Show remaining ratings for ${hero.name}`} aria-expanded={expandedHeroes[hero.id]}>
										<span>{hiddenPlayers.length} more</span>
										{#if expandedHeroes[hero.id]}<ChevronDown class="h-3.5 w-3.5" />{:else}<ChevronRight class="h-3.5 w-3.5" />{/if}
									</button>
								{:else}<span class="text-zinc-600">-</span>{/if}
							</Table.Cell>
						</Table.Row>

						{#if expandedHeroes[hero.id] && hiddenPlayers.length > 0}
							{#each hiddenPlayers as player, index}
								<Table.Row class="border-zinc-900 bg-zinc-950/45 transition-colors hover:bg-zinc-900/60">
									<Table.Cell class="px-2 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">#{index + 2}</Table.Cell>
									<Table.Cell class="px-2 py-2"><button onclick={() => goto(`/player/${player.playerId}`)} class="inline-flex max-w-40 truncate text-left font-medium text-zinc-200 transition-colors hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span class="truncate">{player.username}</span></button></Table.Cell>
									<Table.Cell class="px-2 py-2 text-right"><img src={getRoleIcon(player.primaryRole)} alt={getRoleName(player.primaryRole)} title={getRoleName(player.primaryRole)} class="ml-auto h-5 w-5" /></Table.Cell>
									<Table.Cell class="px-2 py-2 text-right text-lg font-semibold tabular-nums text-zinc-100">{formatNumber(player.mmr)}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-400">{formatNumber(player.initialMmr)}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right text-sm font-medium tabular-nums {getChangeClass(player.mmrChange)}">{formatChange(player.mmrChange)}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums"><span class="text-green-400">{player.wins}</span><span class="text-zinc-600">/</span><span class="text-red-400">{player.losses}</span></Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{formatPercent(player.winRate)}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{formatNumber(player.avgImpact, 1)}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{player.matches}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right text-zinc-600">-</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					{:else}
						<Table.Row class="border-zinc-900">
							<Table.Cell colspan={11} class="h-40 text-center text-sm text-zinc-500">No calibrated heroes match that search.</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</section>
</div>
