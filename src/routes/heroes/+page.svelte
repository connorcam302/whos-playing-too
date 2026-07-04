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
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { ArrowUpDown, ChevronDown, ChevronRight, Search } from 'lucide-svelte';
	import OwnershipInfographics from './OwnershipInfographics.svelte';
	import OwnershipChanges from './OwnershipChanges.svelte';

	type TopPlayer = {
		playerId: number;
		username: string;
		smurf: boolean;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		recentForm: string;
		kda: number;
		avgImpact: number;
		volumeScore: number;
		sampleWeight: number;
		primaryRole: number;
		score: number;
		confidence: string;
	};

	type HeroSummary = {
		id: number;
		name: string;
		img: string;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		topPlayers: TopPlayer[];
	};

	type OwnershipChange = {
		hero: {
			id: number;
			name: string;
			img: string;
		};
		previousOwner: TopPlayer | null;
		currentOwner: TopPlayer | null;
		changeType: 'changed' | 'new';
	};

	type Props = {
		data: {
			heroes: HeroSummary[];
			ownershipChanges: OwnershipChange[];
			totalMatches: number;
			trackedHeroes: number;
		};
	};

	let { data }: Props = $props();

	let searchValue = $state('');
	let expandedHeroes = $state<Record<number, boolean>>({});
	let sorting = $state<SortingState>([{ id: 'score', desc: true }]);

	const formatNumber = (value: number | null | undefined, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value ?? 0);

	const formatPercent = (value: number | null | undefined) => `${formatNumber(value, 1)}%`;

	const toggleHero = (heroId: number) => {
		expandedHeroes = {
			...expandedHeroes,
			[heroId]: !expandedHeroes[heroId]
		};
	};

	const filteredHeroes = $derived(
		data.heroes.filter((hero) => hero.name.toLowerCase().includes(searchValue.toLowerCase()))
	);

	const topHero = $derived(data.heroes.find((hero) => hero.topPlayers.length > 0));

	const getHeroSortValue = (hero: HeroSummary, columnId: string) => {
		const bestPlayer = hero.topPlayers[0];

		if (columnId === 'hero') return hero.name;
		if (columnId === 'player') return bestPlayer?.username ?? '';
		if (columnId === 'score') return bestPlayer?.score ?? -1;
		if (columnId === 'wl') return bestPlayer?.winRate ?? -1;
		if (columnId === 'winRate') return bestPlayer?.winRate ?? -1;
		if (columnId === 'matches') return bestPlayer?.matches ?? -1;
		if (columnId === 'top3') return hero.topPlayers.length;
		return '';
	};

	const tableColumns = $derived<ColumnDef<HeroSummary>[]>(
		[
			{ id: 'hero', header: 'Hero' },
			{ id: 'player', header: 'Best Player' },
			{ id: 'score', header: 'Score' },
			{ id: 'wl', header: 'W/L' },
			{ id: 'winRate', header: 'WR' },
			{ id: 'matches', header: 'Matches' },
			{ id: 'top3', header: 'Players', enableSorting: false }
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

	const getHeaderClass = (columnId: string) =>
		['score', 'wl', 'winRate', 'matches', 'top3'].includes(columnId) ? 'text-right' : '';

	const getHeaderButtonClass = (columnId: string) =>
		['score', 'wl', 'winRate', 'matches', 'top3'].includes(columnId) ? 'ml-auto' : '';

	const getHiddenPlayers = (hero: HeroSummary) => hero.topPlayers.slice(1);

	const getFormClass = (result: string) =>
		result === 'W' ? 'text-green-400' : 'text-red-400';
</script>

<svelte:head>
	<title>whos-playing | Heroes</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 pb-4 pt-16 sm:px-4">
	<section class="rounded-md border border-border bg-card p-4">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<div class="text-sm text-zinc-400">Hero Rankings</div>
				<h1 class="mt-1 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
					Best Players By Hero
				</h1>
				<div class="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
					<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
						{data.trackedHeroes} tracked heroes
					</span>
					<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
						{data.totalMatches} hero picks
					</span>
					{#if topHero?.topPlayers[0]}
						<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
							Top calibrated score: {topHero.topPlayers[0].username} on {topHero.name}, {topHero.topPlayers[0].score}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<OwnershipChanges changes={data.ownershipChanges} />

	<OwnershipInfographics heroes={data.heroes} ownershipChanges={data.ownershipChanges} />

	<section class="rounded-md border border-border bg-card p-4">
		<div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<h2 class="text-base font-semibold text-zinc-100">Heroes</h2>
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
				<label class="relative block w-full sm:w-64">
					<span class="sr-only">Search heroes</span>
					<Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
					<input
						bind:value={searchValue}
						placeholder="Search heroes..."
						class="h-9 w-full rounded-md border border-zinc-700/50 bg-zinc-950 pl-8 pr-3 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-600 focus:bg-zinc-900"
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
												class="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400 transition-colors hover:text-zinc-100 {getHeaderButtonClass(
													header.column.id
												)}"
												onclick={header.column.getToggleSortingHandler()}
											>
												<FlexRender
													content={header.column.columnDef.header}
													context={header.getContext()}
												/>
												<ArrowUpDown class="h-2.5 w-2.5" />
											</button>
										{:else}
											<span class="block text-[11px] font-medium uppercase tracking-wide text-zinc-400">
												<FlexRender
													content={header.column.columnDef.header}
													context={header.getContext()}
												/>
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
								<a
									href={`/heroes/${hero.id}`}
									class="flex min-w-0 items-center gap-3 text-zinc-100 transition-colors hover:text-sky-300"
								>
									<img
										src={hero.img}
										alt={hero.name}
										class="h-10 w-16 shrink-0 rounded-sm border border-zinc-800 object-cover"
									/>
									<span class="truncate font-medium">{hero.name}</span>
								</a>
							</Table.Cell>
							<Table.Cell class="px-2 py-2">
								{#if bestPlayer}
									<button
										onclick={() => goto(`/player/${bestPlayer.playerId}`)}
										class="inline-flex max-w-40 items-center gap-1 truncate text-left font-medium text-zinc-100 transition-colors hover:text-sky-300"
									>
										<span class="truncate">{bestPlayer.username}</span>
									</button>
								{:else}
									<span class="text-sm text-zinc-500">Uncalibrated</span>
								{/if}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right tabular-nums">
								{#if bestPlayer}
									<Tooltip.Root>
										<Tooltip.Trigger class="ml-auto block rounded-sm text-lg font-semibold text-zinc-100 underline decoration-zinc-700 decoration-dotted underline-offset-4 outline-none transition-colors hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-ring">
											{bestPlayer.score}
										</Tooltip.Trigger>
										<Tooltip.Content class="w-96 p-0 text-xs">
											<div class="border-b border-zinc-800 px-3 py-2">
												<div class="font-medium text-zinc-100">
													{bestPlayer.username} score: {bestPlayer.score}
												</div>
												<div class="mt-0.5 text-zinc-400">
													{bestPlayer.confidence} sample · {bestPlayer.matches} matches on {hero.name}
												</div>
											</div>
											<div class="grid gap-2 p-3">
												<div class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
													<span class="text-zinc-400">Win rate</span>
													<span class="text-right text-zinc-100">{formatPercent(bestPlayer.winRate)}</span>
													<span class="text-zinc-400">Recent form</span>
													<span class="flex justify-end gap-1 text-right text-zinc-100">
														{#each bestPlayer.recentForm.split('') as result}
															<span class={getFormClass(result)}>{result}</span>
														{:else}
															<span>No recent games</span>
														{/each}
													</span>
													<span class="text-zinc-400">KDA</span>
													<span class="text-right text-zinc-100">{formatNumber(bestPlayer.kda, 2)}</span>
													<span class="text-zinc-400">Avg impact</span>
													<span class="text-right text-zinc-100">{formatNumber(bestPlayer.avgImpact)}</span>
													<span class="text-zinc-400">Volume score</span>
													<span class="text-right text-zinc-100">{formatNumber(bestPlayer.volumeScore)}</span>
													<span class="text-zinc-400">Sample weight</span>
													<span class="text-right text-zinc-100">{formatPercent(bestPlayer.sampleWeight * 100)}</span>
												</div>
												<div class="rounded-sm border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-400">
													Performance uses win rate, recent form, impact, and KDA. That performance is
													weighted by sample size, then capped match volume adds up to 20 points.
												</div>
											</div>
										</Tooltip.Content>
									</Tooltip.Root>
								{:else}
									<span class="text-zinc-600">-</span>
								{/if}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right tabular-nums">
								{#if bestPlayer}
									<span class="text-green-400">{bestPlayer.wins}</span>
									<span class="text-zinc-600">/</span>
									<span class="text-red-400">{bestPlayer.losses}</span>
								{:else}
									<span class="text-zinc-600">-</span>
								{/if}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">
								{bestPlayer ? formatPercent(bestPlayer.winRate) : '-'}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">
								{bestPlayer?.matches ?? '-'}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right">
								{#if hiddenPlayers.length > 0}
									<button
										class="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										onclick={() => toggleHero(hero.id)}
										aria-label={expandedHeroes[hero.id]
											? `Hide remaining players for ${hero.name}`
											: `Show remaining players for ${hero.name}`}
										aria-expanded={expandedHeroes[hero.id]}
									>
										<span>{hiddenPlayers.length} more</span>
										{#if expandedHeroes[hero.id]}
											<ChevronDown class="h-3.5 w-3.5" />
										{:else}
											<ChevronRight class="h-3.5 w-3.5" />
										{/if}
									</button>
								{:else}
									<span class="text-zinc-600">-</span>
								{/if}
							</Table.Cell>
						</Table.Row>

						{#if expandedHeroes[hero.id] && hiddenPlayers.length > 0}
							{#each hiddenPlayers as player, index}
								<Table.Row class="border-zinc-900 bg-zinc-950/45 transition-colors hover:bg-zinc-900/60">
									<Table.Cell class="px-2 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
										#{index + 2}
									</Table.Cell>
									<Table.Cell class="px-2 py-2">
										<button
											onclick={() => goto(`/player/${player.playerId}`)}
											class="inline-flex max-w-40 items-center gap-1 truncate text-left font-medium text-zinc-200 transition-colors hover:text-sky-300"
										>
											<span class="truncate">{player.username}</span>
										</button>
									</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums">
										<Tooltip.Root>
											<Tooltip.Trigger class="ml-auto block rounded-sm text-lg font-semibold text-zinc-100 underline decoration-zinc-700 decoration-dotted underline-offset-4 outline-none transition-colors hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-ring">
												{player.score}
											</Tooltip.Trigger>
											<Tooltip.Content class="w-96 p-0 text-xs">
												<div class="border-b border-zinc-800 px-3 py-2">
													<div class="font-medium text-zinc-100">
														{player.username} score: {player.score}
													</div>
													<div class="mt-0.5 text-zinc-400">
														{player.confidence} sample · {player.matches} matches on {hero.name}
													</div>
												</div>
												<div class="grid gap-2 p-3">
													<div class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
														<span class="text-zinc-400">Win rate</span>
														<span class="text-right text-zinc-100">{formatPercent(player.winRate)}</span>
														<span class="text-zinc-400">Recent form</span>
														<span class="flex justify-end gap-1 text-right text-zinc-100">
															{#each player.recentForm.split('') as result}
																<span class={getFormClass(result)}>{result}</span>
															{:else}
																<span>No recent games</span>
															{/each}
														</span>
														<span class="text-zinc-400">KDA</span>
														<span class="text-right text-zinc-100">{formatNumber(player.kda, 2)}</span>
														<span class="text-zinc-400">Avg impact</span>
														<span class="text-right text-zinc-100">{formatNumber(player.avgImpact)}</span>
														<span class="text-zinc-400">Volume score</span>
														<span class="text-right text-zinc-100">{formatNumber(player.volumeScore)}</span>
														<span class="text-zinc-400">Sample weight</span>
														<span class="text-right text-zinc-100">{formatPercent(player.sampleWeight * 100)}</span>
													</div>
													<div class="rounded-sm border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-400">
														Performance uses win rate, recent form, impact, and KDA. That performance is
														weighted by sample size, then capped match volume adds up to 20 points.
													</div>
												</div>
											</Tooltip.Content>
										</Tooltip.Root>
									</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums">
										<span class="text-green-400">{player.wins}</span>
										<span class="text-zinc-600">/</span>
										<span class="text-red-400">{player.losses}</span>
									</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">
										{formatPercent(player.winRate)}
									</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">
										{player.matches}
									</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right text-zinc-600">-</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					{:else}
						<Table.Row class="border-zinc-900">
							<Table.Cell colspan={7} class="h-40 text-center text-sm text-zinc-500">
								No heroes match that search.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</section>
</div>
