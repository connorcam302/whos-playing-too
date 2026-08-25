<script lang="ts">
	import { getRoleIcon, getRoleName } from '$lib/functions';
	import { formatHeroScore } from '$lib/heroScores';
	import type { HeroPlayerRanking } from '$lib/server/heroStats';
	import HeroScoreComparisonDialog from '$lib/components/heroes/HeroScoreComparisonDialog.svelte';
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState
	} from '@tanstack/table-core';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table';
	import { flushSync } from 'svelte';
	import {
		ArrowUpDown,
		ChevronLeft,
		ChevronRight,
		Crown,
		Search,
		TrendingDown,
		TrendingUp
	} from 'lucide-svelte';

	type TopHero = {
		id: number;
		name: string;
		img: string;
		matches: number;
	};

	type RoleRanking = HeroPlayerRanking & {
		previousRank: number | null;
		rankChange: number | null;
		topHero: TopHero | null;
	};

	type RoleSummary = {
		role: number;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		players: number;
		leader: RoleRanking | null;
		rankings: RoleRanking[];
	};

	type TableRanking = RoleRanking & {
		rank: number;
	};

	type Props = {
		data: {
			roles: RoleSummary[];
			selectedRole: number;
			availableMonths: string[];
			selectedMonth: string;
			isLatestMonth: boolean;
			previousMonth: string | null;
			totalPerformances: number;
			activePlayers: number;
		};
	};

	let { data }: Props = $props();
	let selectedRole = $state(1);
	let searchValue = $state('');
	let sorting = $state<SortingState>([{ id: 'score', desc: true }]);
	let scoreComparisonRole = $state<RoleSummary | null>(null);
	let scoreComparisonPlayerId = $state<number | null>(null);
	let scoreComparisonOpen = $state(false);

	$effect(() => {
		selectedRole = data.selectedRole;
	});

	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value);
	const formatPercent = (value: number) => `${formatNumber(value, 1)}%`;
	const formatMonth = (monthKey: string) =>
		new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
			new Date(`${monthKey}-01T00:00:00Z`)
		);
	const selectedMonthIndex = $derived(data.availableMonths.indexOf(data.selectedMonth));
	const newerMonth = $derived(
		selectedMonthIndex > 0 ? data.availableMonths[selectedMonthIndex - 1] : null
	);
	const olderMonth = $derived(data.availableMonths[selectedMonthIndex + 1] ?? null);
	const activeRole = $derived(
		data.roles.find((role) => role.role === selectedRole) ?? data.roles[0]
	);
	const filteredRankings = $derived(
		(activeRole?.rankings ?? [])
			.map((ranking, index) => ({ ...ranking, rank: index + 1 }))
			.filter((ranking) => ranking.username.toLowerCase().includes(searchValue.toLowerCase()))
	);
	const highestScore = $derived(
		Math.max(0, ...data.roles.map((role) => role.leader?.score ?? 0))
	);
	const activeLeader = $derived(activeRole?.leader ?? null);
	const challengerRoles = $derived(data.roles.filter((role) => role.role !== selectedRole));
	const leaderBenchmarks = $derived({
		winRate: Math.max(1, ...data.roles.map((role) => role.leader?.winRate ?? 0)),
		kda: Math.max(1, ...data.roles.map((role) => role.leader?.kda ?? 0)),
		impact: Math.max(1, ...data.roles.map((role) => role.leader?.avgImpact ?? 0))
	});

	const selectRole = (role: number) => {
		if (role === selectedRole) return;
		const viewTransitionDocument = document as Document & {
			startViewTransition?: (update: () => void) => void;
		};
		if (
			!viewTransitionDocument.startViewTransition ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			selectedRole = role;
			return;
		}
		viewTransitionDocument.startViewTransition(() => {
			flushSync(() => {
				selectedRole = role;
			});
		});
	};

	const getMetricScale = (value: number, maximum: number) =>
		Math.min(1, Math.max(0.08, value / maximum));

	const openScoreComparison = (role: RoleSummary, player: RoleRanking) => {
		scoreComparisonRole = role;
		scoreComparisonPlayerId = player.playerId;
		scoreComparisonOpen = true;
	};

	const getRankChangeLabel = (ranking: RoleRanking) => {
		if (ranking.previousRank === null) return 'New';
		const rankChange = ranking.rankChange ?? 0;
		if (rankChange === 0) return 'Held';
		return `${rankChange > 0 ? '+' : ''}${rankChange}`;
	};

	const getRankChangeClass = (ranking: RoleRanking) => {
		if (ranking.previousRank === null) return 'text-sky-300';
		if (ranking.rankChange === 0) return 'text-zinc-500';
		return ranking.rankChange && ranking.rankChange > 0 ? 'text-green-400' : 'text-red-400';
	};

	const getSortValue = (ranking: TableRanking, columnId: string) => {
		if (columnId === 'rank') return ranking.rank;
		if (columnId === 'player') return ranking.username;
		if (columnId === 'hero') return ranking.topHero?.name ?? '';
		if (columnId === 'score') return ranking.score;
		if (columnId === 'rankChange') return ranking.rankChange ?? Number.NEGATIVE_INFINITY;
		if (columnId === 'wl') return ranking.wins - ranking.losses;
		if (columnId === 'winRate') return ranking.winRate;
		if (columnId === 'kda') return ranking.kda;
		if (columnId === 'impact') return ranking.avgImpact;
		if (columnId === 'matches') return ranking.matches;
		return '';
	};

	const tableColumns: ColumnDef<TableRanking>[] = [
		{ id: 'rank', header: 'Rank' },
		{ id: 'player', header: 'Player' },
		{ id: 'hero', header: 'Most played' },
		{ id: 'score', header: 'Score' },
		{ id: 'rankChange', header: 'Month Δ' },
		{ id: 'wl', header: 'W/L' },
		{ id: 'winRate', header: 'WR' },
		{ id: 'kda', header: 'KDA' },
		{ id: 'impact', header: 'Impact' },
		{ id: 'matches', header: 'Matches' }
	].map((column) => ({
		id: column.id,
		header: column.header,
		accessorFn: (ranking) => getSortValue(ranking, column.id),
		sortingFn: (rowA, rowB) => {
			const valueA = getSortValue(rowA.original, column.id);
			const valueB = getSortValue(rowB.original, column.id);
			if (typeof valueA === 'string' || typeof valueB === 'string') {
				return String(valueA).localeCompare(String(valueB));
			}
			return Number(valueA) - Number(valueB);
		}
	}));

	const table = $derived(
		createSvelteTable({
			data: filteredRankings,
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
		columnId === 'rank'
			? 'text-center'
			: ['score', 'rankChange', 'wl', 'winRate', 'kda', 'impact', 'matches'].includes(columnId)
				? 'text-right'
				: '';

	const getHeaderButtonClass = (columnId: string) =>
		columnId === 'rank'
			? 'mx-auto'
			: ['score', 'rankChange', 'wl', 'winRate', 'kda', 'impact', 'matches'].includes(columnId)
				? 'ml-auto'
				: '';
</script>

<svelte:head>
	<title>whos-playing | Roles</title>
	<meta
		name="description"
		content="Monthly player rankings for all five Dota 2 roles."
	/>
</svelte:head>

{#if scoreComparisonRole}
	<HeroScoreComparisonDialog
		heroName={getRoleName(scoreComparisonRole.role) ?? `Position ${scoreComparisonRole.role}`}
		heroImg={getRoleIcon(scoreComparisonRole.role) ?? ''}
		players={scoreComparisonRole.rankings}
		scopeLabel={formatMonth(data.selectedMonth)}
		subjectLabel="role"
		selectedPlayerId={scoreComparisonPlayerId}
		bind:open={scoreComparisonOpen}
	/>
{/if}

<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 pb-5 pt-16 sm:px-4">
	<section class="rounded-md border border-border bg-card">
		<div class="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<div class="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
					<span>Role Rankings</span>
					{#if data.isLatestMonth}
						<span class="rounded-sm border border-sky-900/70 bg-sky-950/40 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-sky-300">
							Latest month
						</span>
					{/if}
				</div>
				<h1 class="mt-1 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
					Best Players By Role
				</h1>
				<div class="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
					<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
						{data.activePlayers} active players
					</span>
					<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
						{data.totalPerformances} player performances
					</span>
					<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
						{data.previousMonth ? `Compared with ${formatMonth(data.previousMonth)}` : 'First tracked month'}
					</span>
				</div>
			</div>

			<div class="flex items-center gap-2 self-start lg:self-auto">
				{#if olderMonth}
					<a
						href={`/roles?month=${olderMonth}`}
						aria-label={`View ${formatMonth(olderMonth)}`}
						class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<ChevronLeft class="h-4 w-4" />
					</a>
				{:else}
					<span class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 text-zinc-700">
						<ChevronLeft class="h-4 w-4" />
					</span>
				{/if}
				<div class="min-w-44 text-center">
					<div class="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Performance month</div>
					<div class="mt-0.5 font-semibold text-zinc-100">{formatMonth(data.selectedMonth)}</div>
				</div>
				{#if newerMonth}
					<a
						href={`/roles?month=${newerMonth}`}
						aria-label={`View ${formatMonth(newerMonth)}`}
						class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-sky-900 bg-sky-950/40 text-sky-300 transition-colors hover:border-sky-800 hover:bg-sky-950/70 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<ChevronRight class="h-4 w-4" />
					</a>
				{:else}
					<span class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 text-zinc-700">
						<ChevronRight class="h-4 w-4" />
					</span>
				{/if}
			</div>
		</div>

		<div class="draft-board role-surface" data-role={selectedRole}>
			<article class="draft-feature">
				{#if activeLeader?.topHero}
					<img src={activeLeader.topHero.img} alt="" class="draft-hero-art" />
				{/if}
				<div class="draft-grid" aria-hidden="true"></div>
				<div class="relative z-10 flex h-full flex-col justify-between gap-8 p-5 sm:p-6">
					<div class="flex items-start justify-between gap-4">
						<div class="flex items-center gap-3">
							<div class="role-mark">
								<img src={getRoleIcon(selectedRole)} alt="" class="h-8 w-8" />
							</div>
							<div>
								<div class="draft-kicker">Position {selectedRole} · Monthly pace setter</div>
								<h2 class="mt-1 text-lg font-semibold text-zinc-100 sm:text-xl">{getRoleName(selectedRole)}</h2>
							</div>
						</div>
						{#if activeLeader?.score === highestScore}
							<div class="top-score-stamp"><Crown class="h-3.5 w-3.5" /> Board leader</div>
						{/if}
					</div>

					{#if activeLeader}
						<div class="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)]">
							<div class="min-w-0">
								<div class="flex flex-wrap items-end gap-x-4 gap-y-2">
									<a
										href={`/player/${activeLeader.playerId}`}
										class="draft-player truncate text-3xl font-semibold tracking-tight text-zinc-100 outline-none transition-colors hover:text-[var(--role-accent-soft)] focus-visible:ring-2 focus-visible:ring-ring sm:text-4xl"
									>
										{activeLeader.username}
									</a>
									<button
										type="button"
										onclick={() => openScoreComparison(activeRole, activeLeader)}
										class="draft-score rounded-sm tabular-nums outline-none transition-colors hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-ring"
										aria-label={`Compare ${activeLeader.username}'s ${getRoleName(selectedRole)} score`}
									>
										{formatHeroScore(activeLeader.score)}
									</button>
								</div>
								<div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
									<span class="draft-chip">{activeLeader.confidence}</span>
									<span class="draft-chip">{activeLeader.wins}W · {activeLeader.losses}L</span>
									<span class="draft-chip {getRankChangeClass(activeLeader)}">
										{#if activeLeader.rankChange && activeLeader.rankChange > 0}<TrendingUp class="h-3 w-3" />{:else if activeLeader.rankChange && activeLeader.rankChange < 0}<TrendingDown class="h-3 w-3" />{/if}
										{getRankChangeLabel(activeLeader)} from {data.previousMonth ? 'last month' : 'debut'}
									</span>
								</div>

								<div class="mt-5 flex flex-wrap items-center gap-3">
									{#if activeLeader.topHero}
										<a href={`/heroes/${activeLeader.topHero.id}`} class="signature-hero group/hero">
											<img src={activeLeader.topHero.img} alt="" class="h-10 w-16 rounded-sm object-cover" />
											<span>
												<span class="block text-[10px] uppercase tracking-wider text-zinc-500">Signature hero</span>
												<span class="block text-sm font-medium text-zinc-200 group-hover/hero:text-[var(--role-accent-soft)]">{activeLeader.topHero.name}</span>
											</span>
										</a>
									{/if}
									<div class="form-run" aria-label={`Recent form: ${activeLeader.recentForm}`}>
										{#each activeLeader.recentForm.slice(-10) as result}
											<span class:form-win={result === 'W'} class:form-loss={result === 'L'}>{result}</span>
										{/each}
									</div>
								</div>
							</div>

							<div class="benchmark-stack">
								<div class="benchmark-row">
									<div><span>Win rate</span><strong>{formatPercent(activeLeader.winRate)}</strong></div>
									<div class="benchmark-track"><span style={`--metric-scale:${getMetricScale(activeLeader.winRate, leaderBenchmarks.winRate)}`}></span></div>
								</div>
								<div class="benchmark-row">
									<div><span>KDA</span><strong>{formatNumber(activeLeader.kda, 2)}</strong></div>
									<div class="benchmark-track"><span style={`--metric-scale:${getMetricScale(activeLeader.kda, leaderBenchmarks.kda)}`}></span></div>
								</div>
								<div class="benchmark-row">
									<div><span>Impact</span><strong>{formatNumber(activeLeader.avgImpact, 1)}</strong></div>
									<div class="benchmark-track"><span style={`--metric-scale:${getMetricScale(activeLeader.avgImpact, leaderBenchmarks.impact)}`}></span></div>
								</div>
								<div class="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">Compared with this month's role leaders</div>
							</div>
						</div>
					{:else}
						<div class="flex min-h-48 items-center text-sm text-zinc-500">No performances recorded for this role.</div>
					{/if}
				</div>
			</article>

			<div class="challenger-rail" aria-label="Choose another role">
				<div class="challenger-list">
					{#each challengerRoles as role}
						<button
							type="button"
							onclick={() => selectRole(role.role)}
							class="challenger role-surface"
							data-role={role.role}
						>
							<span class="challenger-number">0{role.role}</span>
							<span class="role-mark role-mark-small"><img src={getRoleIcon(role.role)} alt="" class="h-6 w-6" /></span>
							<span class="min-w-0 grow">
								<span class="block text-[10px] uppercase tracking-wider text-zinc-500">{getRoleName(role.role)}</span>
								<span class="mt-0.5 block truncate text-sm font-semibold text-zinc-100">{role.leader?.username ?? 'Unclaimed'}</span>
							</span>
							<span class="text-right">
								<span class="block text-base font-semibold tabular-nums text-zinc-200">{role.leader ? formatHeroScore(role.leader.score) : '–'}</span>
								<span class="block text-[10px] text-zinc-600">{role.leader?.matches ?? 0} matches</span>
							</span>
						</button>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section class="rounded-md border border-border bg-card p-4">
		<div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<div class="flex items-center gap-2">
					<img src={getRoleIcon(selectedRole)} alt="" class="h-7 w-7" />
					<h2 class="text-base font-semibold text-zinc-100">{getRoleName(selectedRole)} standings</h2>
				</div>
				<p class="mt-1 text-xs text-zinc-500">Ranked on monthly form, with low-volume results pulled towards the role baseline.</p>
			</div>
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
				<label class="relative block w-full sm:w-64">
					<span class="sr-only">Search players</span>
					<Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
					<input
						bind:value={searchValue}
						placeholder="Search players..."
						class="h-9 w-full rounded-md border border-zinc-700/50 bg-zinc-950 pl-8 pr-3 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-600 focus:bg-zinc-900 focus:ring-2 focus:ring-ring"
					/>
				</label>
				<div class="text-xs text-zinc-500">{filteredRankings.length} shown</div>
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
										<button
											type="button"
											class="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {getHeaderButtonClass(header.column.id)}"
											onclick={header.column.getToggleSortingHandler()}
										>
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
											<ArrowUpDown class="h-2.5 w-2.5" />
										</button>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body>
					{#each table.getRowModel().rows as row}
						{@const ranking = row.original}
						{@const rank = ranking.rank}
						<Table.Row class="border-zinc-900 transition-colors hover:bg-zinc-900/70">
							<Table.Cell class="px-2 py-2 text-center font-semibold tabular-nums {rank <= 3 ? 'text-zinc-100' : 'text-zinc-500'}">{rank}</Table.Cell>
							<Table.Cell class="px-2 py-2">
								<a href={`/player/${ranking.playerId}`} class="font-medium text-zinc-100 transition-colors hover:text-sky-300">{ranking.username}</a>
								<div class="mt-0.5 text-[11px] text-zinc-500">{ranking.confidence}</div>
							</Table.Cell>
							<Table.Cell class="px-2 py-2">
								{#if ranking.topHero}
									<a href={`/heroes/${ranking.topHero.id}`} class="flex min-w-36 items-center gap-2 text-zinc-300 transition-colors hover:text-sky-300">
										<img src={ranking.topHero.img} alt="" class="h-8 w-12 rounded-sm border border-zinc-800 object-cover" />
										<span class="max-w-28 truncate text-sm">{ranking.topHero.name}</span>
									</a>
								{:else}
									<span class="text-zinc-600">-</span>
								{/if}
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right text-lg font-semibold tabular-nums text-zinc-100">
								<button
									type="button"
									onclick={() => openScoreComparison(activeRole, ranking)}
									class="ml-auto block rounded-sm underline decoration-zinc-700 decoration-dotted underline-offset-4 outline-none transition-colors hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-ring"
									aria-label={`Compare ${ranking.username}'s ${getRoleName(selectedRole)} score`}
								>
									{formatHeroScore(ranking.score)}
								</button>
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right text-xs font-medium tabular-nums {getRankChangeClass(ranking)}">
								<span class="inline-flex items-center justify-end gap-1">
									{#if ranking.rankChange && ranking.rankChange > 0}<TrendingUp class="h-3 w-3" />{:else if ranking.rankChange && ranking.rankChange < 0}<TrendingDown class="h-3 w-3" />{/if}
									{getRankChangeLabel(ranking)}
								</span>
							</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right text-sm tabular-nums"><span class="text-green-400">{ranking.wins}</span><span class="text-zinc-600"> / </span><span class="text-red-400">{ranking.losses}</span></Table.Cell>
							<Table.Cell class="px-2 py-2 text-right text-sm tabular-nums text-zinc-300">{formatPercent(ranking.winRate)}</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right text-sm tabular-nums text-zinc-300">{formatNumber(ranking.kda, 2)}</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right text-sm tabular-nums text-zinc-300">{formatNumber(ranking.avgImpact, 1)}</Table.Cell>
							<Table.Cell class="px-2 py-2 text-right text-sm tabular-nums text-zinc-300">{ranking.matches}</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row class="border-0 hover:bg-transparent">
							<Table.Cell colspan={10} class="h-28 text-center text-sm text-zinc-500">No player performances found for this role and month.</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</section>
</div>

<style>
	.role-surface[data-role='1'] { --role-accent: oklch(0.4811 0.135 272.27); --role-accent-soft: oklch(0.76 0.1 272.27); }
	.role-surface[data-role='2'] { --role-accent: oklch(0.5774 0.0832 209.05); --role-accent-soft: oklch(0.78 0.075 209.05); }
	.role-surface[data-role='3'] { --role-accent: oklch(0.6386 0.1376 64.45); --role-accent-soft: oklch(0.8 0.105 64.45); }
	.role-surface[data-role='4'] { --role-accent: oklch(0.5679 0.1561 16.84); --role-accent-soft: oklch(0.78 0.105 16.84); }
	.role-surface[data-role='5'] { --role-accent: oklch(0.6248 0.109 163.43); --role-accent-soft: oklch(0.8 0.085 163.43); }

	.draft-board {
		display: grid;
		grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.72fr);
		min-height: 390px;
		border-top: 1px solid oklch(0.3 0.01 260);
		background: oklch(0.145 0.012 260);
	}

	.draft-feature {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		min-width: 0;
		background: radial-gradient(circle at 18% 110%, color-mix(in oklch, var(--role-accent) 24%, transparent), transparent 46%), oklch(0.17 0.014 260);
		view-transition-name: role-draft-feature;
	}

	.draft-feature::after {
		position: absolute;
		z-index: 3;
		inset: 0;
		content: '';
		pointer-events: none;
		background: linear-gradient(110deg, transparent 34%, color-mix(in oklch, var(--role-accent-soft) 10%, transparent) 49%, transparent 64%);
		transform: translate3d(-120%, 0, 0);
		animation: board-scan 7s 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
	}

	.draft-hero-art {
		position: absolute;
		z-index: -2;
		top: 0;
		right: 0;
		height: 100%;
		width: 64%;
		object-fit: cover;
		opacity: 0.42;
		filter: saturate(0.82) contrast(1.08);
		transform: scale(1.035);
		-webkit-mask-image: linear-gradient(to right, transparent, oklch(0.2 0 0) 38%, oklch(0.2 0 0));
		mask-image: linear-gradient(to right, transparent, oklch(0.2 0 0) 38%, oklch(0.2 0 0));
	}

	.draft-grid {
		position: absolute;
		z-index: -1;
		inset: 0;
		background-image: linear-gradient(color-mix(in oklch, var(--role-accent) 8%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--role-accent) 8%, transparent) 1px, transparent 1px);
		background-size: 38px 38px;
		-webkit-mask-image: linear-gradient(to bottom right, oklch(0.2 0 0), transparent 74%);
		mask-image: linear-gradient(to bottom right, oklch(0.2 0 0), transparent 74%);
	}

	.draft-kicker { font-size: 0.625rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--role-accent-soft); }

	.role-mark {
		display: inline-flex;
		height: 3rem;
		width: 3rem;
		flex: none;
		align-items: center;
		justify-content: center;
		border: 1px solid color-mix(in oklch, var(--role-accent) 50%, oklch(0.3 0.01 260));
		border-radius: 0.5rem;
		background: color-mix(in oklch, var(--role-accent) 14%, oklch(0.14 0.01 260));
		box-shadow: inset 0 0 18px color-mix(in oklch, var(--role-accent) 12%, transparent);
	}

	.role-mark-small { height: 2.25rem; width: 2.25rem; border-radius: 0.375rem; }

	.top-score-stamp {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border: 1px solid color-mix(in oklch, var(--role-accent) 45%, oklch(0.3 0.01 260));
		border-radius: 999px;
		background: color-mix(in oklch, var(--role-accent) 12%, oklch(0.15 0.01 260));
		padding: 0.35rem 0.6rem;
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--role-accent-soft);
	}

	.draft-player, .draft-score { text-shadow: 0 2px 18px oklch(0.08 0.01 260 / 0.82); }
	.draft-score { border-bottom: 2px solid var(--role-accent); padding-bottom: 0.15rem; font-size: 1.5rem; font-weight: 700; line-height: 1; color: var(--role-accent-soft); }

	.draft-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		border: 1px solid oklch(0.32 0.012 260 / 0.75);
		border-radius: 0.25rem;
		background: oklch(0.13 0.012 260 / 0.78);
		padding: 0.3rem 0.5rem;
		color: oklch(0.72 0.01 260);
	}

	.signature-hero { display: inline-flex; align-items: center; gap: 0.65rem; border-radius: 0.375rem; outline: none; }
	.signature-hero img { border: 1px solid color-mix(in oklch, var(--role-accent) 35%, oklch(0.3 0.01 260)); }
	.signature-hero:focus-visible { box-shadow: 0 0 0 2px var(--role-accent); }

	.form-run { display: flex; gap: 0.2rem; }
	.form-run span { display: inline-flex; height: 1.25rem; width: 1.25rem; align-items: center; justify-content: center; border: 1px solid oklch(0.32 0.01 260); border-radius: 0.2rem; background: oklch(0.15 0.01 260 / 0.82); font-size: 0.55rem; font-weight: 700; color: oklch(0.62 0.01 260); }
	.form-run .form-win { border-color: oklch(0.48 0.1 150); color: oklch(0.76 0.14 150); }
	.form-run .form-loss { border-color: oklch(0.45 0.12 25); color: oklch(0.72 0.16 25); }

	.benchmark-stack { display: grid; gap: 0.85rem; border: 1px solid oklch(0.3 0.012 260 / 0.75); border-radius: 0.5rem; background: oklch(0.13 0.012 260 / 0.78); padding: 0.9rem; }
	.benchmark-row > div:first-child { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; font-size: 0.7rem; color: oklch(0.64 0.01 260); }
	.benchmark-row strong { font-size: 0.75rem; font-variant-numeric: tabular-nums; color: oklch(0.88 0.01 260); }
	.benchmark-track { overflow: hidden; height: 0.25rem; margin-top: 0.35rem; border-radius: 999px; background: oklch(0.24 0.012 260); }
	.benchmark-track span { display: block; height: 100%; border-radius: inherit; background: var(--role-accent); transform: scaleX(var(--metric-scale)); transform-origin: left; transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1), background-color 300ms ease; }

	.challenger-rail { display: flex; min-width: 0; flex-direction: column; border-left: 1px solid oklch(0.3 0.01 260); background: oklch(0.135 0.01 260); }
	.challenger-list { display: grid; min-height: 0; flex: 1; grid-template-rows: repeat(4, minmax(0, 1fr)); }

	.challenger { position: relative; display: flex; min-width: 0; align-items: center; gap: 0.7rem; border-bottom: 1px solid oklch(0.235 0.01 260); padding: 0.65rem 0.75rem; text-align: left; outline: none; transition: background-color 220ms ease, color 220ms ease; }
	.challenger:last-child { border-bottom: 0; }
	.challenger::after { position: absolute; inset: 0; content: ''; pointer-events: none; background: radial-gradient(circle at 20% 50%, color-mix(in oklch, var(--role-accent) 18%, transparent), transparent 48%); opacity: 0; transition: opacity 250ms ease; }
	.challenger:hover, .challenger:focus-visible { background: oklch(0.18 0.014 260); }
	.challenger:hover::after, .challenger:focus-visible::after { opacity: 1; }
	.challenger:focus-visible { box-shadow: inset 0 0 0 2px var(--role-accent); }
	.challenger > * { position: relative; z-index: 1; }
	.challenger-number { font-size: 0.6rem; font-variant-numeric: tabular-nums; color: oklch(0.4 0.01 260); }

	@keyframes board-scan {
		0%, 72% { transform: translate3d(-120%, 0, 0); }
		100% { transform: translate3d(120%, 0, 0); }
	}

	:global(::view-transition-old(role-draft-feature)), :global(::view-transition-new(role-draft-feature)) { animation-duration: 420ms; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }

	@media (max-width: 900px) {
		.draft-board { grid-template-columns: 1fr; }
		.challenger-rail { border-top: 1px solid oklch(0.3 0.01 260); border-left: 0; }
		.challenger-list { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(76px, auto)); }
		.challenger:nth-child(odd) { border-right: 1px solid oklch(0.235 0.01 260); }
	}

	@media (max-width: 560px) {
		.draft-board { min-height: 0; }
		.draft-feature { min-height: 500px; }
		.draft-hero-art { width: 100%; height: 55%; opacity: 0.3; -webkit-mask-image: linear-gradient(to bottom, oklch(0.2 0 0), transparent); mask-image: linear-gradient(to bottom, oklch(0.2 0 0), transparent); }
		.challenger-list { grid-template-columns: 1fr; grid-template-rows: none; }
		.challenger:nth-child(odd) { border-right: 0; }
	}

	@media (prefers-reduced-motion: reduce) {
		.draft-feature::after { animation: none; }
		.benchmark-track span { transition: none; }
		:global(::view-transition-old(role-draft-feature)), :global(::view-transition-new(role-draft-feature)) { animation: none; }
	}
</style>
