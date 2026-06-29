<script lang="ts">
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState
	} from '@tanstack/table-core';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import {
		DATE_RANGE_PRESETS,
		DOTA_MAJOR_PATCHES,
		getDotaPatchForTimestamp,
		getDotaPatchRangeBounds
	} from '$lib/data/dotaPatchRanges';
	import { getRoleName } from '$lib/functions';
	import Bar from '$lib/components/stats/Bar.svelte';
	import { ArrowUpDown } from 'lucide-svelte';
	import dayjs from 'dayjs';

	type SharedMatch = {
		matchId: number;
		startTime: number;
		role: number;
		hero: {
			id: number;
			name: string;
			img: string;
		};
		won: boolean;
	};

	type TeammateStat = {
		id: number;
		username: string;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		longestWinStreak: number;
		matchesData: SharedMatch[];
	};

	type AggregatedTeammateStat = Omit<TeammateStat, 'matchesData'> & {
		matchesData: SharedMatch[];
	};

	type ResultFilter = 'wins' | 'losses';

	interface Props {
		data: {
			teammateStats: TeammateStat[];
		};
	}

	let { data }: Props = $props();
	let teammateStats = $derived(data.teammateStats);
	let selectedTeammates = $state(['-1']);
	let selectedRoles = $state(['1', '2', '3', '4', '5']);
	let selectedHeroSingle = $state('-1');
	let selectedHeroMulti = $state(['-1']);
	let selectedDateRange = $state('all');
	let heroSelectVariant = $state('single');
	let wins = $state(true);
	let losses = $state(true);
	let sorting = $state<SortingState>([{ id: 'matches', desc: true }]);

	let teammateOptions = $derived(
		teammateStats
			.map((teammate) => ({
				id: teammate.id,
				username: teammate.username
			}))
			.sort((a, b) => a.username.localeCompare(b.username))
	);
	let heroOptions = $derived(
		Array.from(
			new Map(
				teammateStats
					.flatMap((teammate) => teammate.matchesData)
					.map((match) => [
						match.hero.id,
						{
							id: match.hero.id,
							name: match.hero.name,
							img: match.hero.img
						}
					])
			).values()
		).sort((a, b) => a.name.localeCompare(b.name))
	);
	const getSelectedHero = (
		selectedHeroSingle: string,
		selectedHeroMulti: string[],
		heroSelectVariant: string
	) => {
		if (heroSelectVariant === 'single') {
			return [selectedHeroSingle];
		}
		if (heroSelectVariant === 'multi' && selectedHeroMulti.length > 0) {
			return selectedHeroMulti;
		}
		return ['-1'];
	};
	let selectedHero = $derived(
		getSelectedHero(selectedHeroSingle, selectedHeroMulti, heroSelectVariant)
	);
	let dateRangeBounds = $derived.by(() => {
		const preset = DATE_RANGE_PRESETS.find((range) => range.value === selectedDateRange);
		if (preset?.amount && preset.unit) {
			return {
				start: dayjs().subtract(preset.amount, preset.unit).startOf('day').unix(),
				end: null
			};
		}

		if (selectedDateRange.startsWith('patch-')) {
			const version = selectedDateRange.replace('patch-', '');
			return getDotaPatchRangeBounds(version);
		}

		return {
			start: null,
			end: null
		};
	});
	let selectedPatchVersion = $derived(
		selectedDateRange.startsWith('patch-') ? selectedDateRange.replace('patch-', '') : null
	);

	const makeTeammatesTrigger = () => {
		const selectedTeammateIds = selectedTeammates.filter((teammateId) => teammateId !== '-1');
		if (selectedTeammateIds.length === 0) {
			return 'All Teammates';
		}
		if (selectedTeammateIds.length <= 1) {
			return teammateOptions.find(
				(teammate) => teammate.id.toString() === selectedTeammateIds[0]
			)?.username;
		}
		return `${selectedTeammateIds.length} Teammates Selected`;
	};

	const makeSelectedHeroTrigger = () => {
		if (selectedHero.length === 0 || selectedHero[0] === '-1') {
			return 'All Heroes';
		}
		if (selectedHero.length <= 1) {
			return heroOptions.find((hero) => hero.id.toString() === selectedHero[0])?.name;
		}
		return `${selectedHeroMulti.length} Heroes Selected`;
	};

	const makeSelectedRolesTrigger = () => {
		if (selectedRoles.length === 0 || selectedRoles.length === 5) {
			return 'All Roles';
		}
		if (selectedRoles.length <= 1) {
			return getRoleName(selectedRoles[0]);
		}
		return `${selectedRoles.length} Roles Selected`;
	};

	const makeDateRangeTrigger = () => {
		const preset = DATE_RANGE_PRESETS.find((range) => range.value === selectedDateRange);
		if (preset) return preset.label;

		return (
			DOTA_MAJOR_PATCHES.find((patch) => `patch-${patch.version}` === selectedDateRange)?.label ??
			'All Time'
		);
	};

	const clearFilters = () => {
		selectedTeammates = ['-1'];
		selectedRoles = ['1', '2', '3', '4', '5'];
		selectedHeroSingle = '-1';
		selectedHeroMulti = ['-1'];
		selectedDateRange = 'all';
		wins = true;
		losses = true;
	};

	const handleResultChange = (result: ResultFilter) => {
		const currentResult = result === 'wins' ? wins : losses;
		if (Number(wins) + Number(losses) > 1 || currentResult === false) {
			if (result === 'wins') wins = !wins;
			if (result === 'losses') losses = !losses;
		}
	};

	const getLongestWinStreak = (matches: SharedMatch[]) => {
		let currentWinStreak = 0;
		let longestWinStreak = 0;

		for (const match of matches.slice().sort((a, b) => a.startTime - b.startTime)) {
			if (match.won) {
				currentWinStreak += 1;
				longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
			} else {
				currentWinStreak = 0;
			}
		}

		return longestWinStreak;
	};

	let filteredTeammates: AggregatedTeammateStat[] = $derived(
		teammateStats
			.map((teammate) => {
				const selectedTeammateIds = selectedTeammates.filter((teammateId) => teammateId !== '-1');
				const matchesTeammate =
					selectedTeammateIds.length === 0 ||
					selectedTeammateIds.includes(teammate.id.toString());
				if (!matchesTeammate) return null;

				const filteredMatches = teammate.matchesData.filter((match) => {
					const matchesRole =
						selectedRoles.length === 0 || selectedRoles.includes(match.role.toString());
					const matchesHero =
						selectedHero.length === 0 ||
						selectedHero[0] === '-1' ||
						selectedHero.includes(match.hero.id.toString());
					const matchesResult = (wins && match.won) || (losses && !match.won);
					const matchStartTime = Number(match.startTime);
					const matchesDateRange = selectedPatchVersion
						? getDotaPatchForTimestamp(matchStartTime)?.version === selectedPatchVersion
						: (dateRangeBounds.start === null || matchStartTime >= dateRangeBounds.start) &&
							(dateRangeBounds.end === null || matchStartTime <= dateRangeBounds.end);

					return matchesRole && matchesHero && matchesResult && matchesDateRange;
				});

				const matchCount = filteredMatches.length;
				const filteredWins = filteredMatches.filter((match) => match.won).length;
				const filteredLosses = matchCount - filteredWins;

				return {
					id: teammate.id,
					username: teammate.username,
					matches: matchCount,
					wins: filteredWins,
					losses: filteredLosses,
					winRate: matchCount > 0 ? (filteredWins / matchCount) * 100 : 0,
					longestWinStreak: getLongestWinStreak(filteredMatches),
					matchesData: filteredMatches
				};
			})
			.filter((teammate): teammate is AggregatedTeammateStat =>
				Boolean(teammate && teammate.matches > 0)
			)
	);

	const columns: ColumnDef<AggregatedTeammateStat>[] = [
		{
			id: 'player',
			accessorFn: (teammate) => teammate.username,
			header: 'Player'
		},
		{
			id: 'matches',
			accessorFn: (teammate) => teammate.matches,
			header: 'Matches'
		},
		{
			id: 'record',
			accessorFn: (teammate) => teammate.wins - teammate.losses,
			header: 'W-L'
		},
		{
			id: 'winRate',
			accessorFn: (teammate) => teammate.winRate,
			header: 'Win Rate'
		},
		{
			id: 'longestWinStreak',
			accessorFn: (teammate) => teammate.longestWinStreak,
			header: 'Best Streak'
		}
	];

	const table = $derived(
		createSvelteTable({
			data: filteredTeammates,
			columns,
			state: {
				get sorting() {
					return sorting;
				}
			},
			onSortingChange: (updater) => {
				if (updater instanceof Function) {
					sorting = updater(sorting);
				} else {
					sorting = updater;
				}
			},
			getCoreRowModel: getCoreRowModel(),
			getSortedRowModel: getSortedRowModel()
		})
	);

	const getHeaderClass = (columnId: string) => {
		const baseClass = 'px-3 text-zinc-400';
		if (columnId === 'player') return `${baseClass} min-w-44 text-left`;
		if (columnId === 'matches') return `${baseClass} w-28 text-right`;
		if (columnId === 'record') return `${baseClass} w-32 text-right`;
		if (columnId === 'winRate') return `${baseClass} w-44 text-right`;
		return `${baseClass} w-28 text-right`;
	};

	const getCellClass = (columnId: string) => {
		const baseClass = 'px-3 py-2.5 align-middle';
		if (columnId === 'player') return `${baseClass} min-w-44`;
		if (columnId === 'matches') return `${baseClass} w-28 text-right tabular-nums`;
		if (columnId === 'record') return `${baseClass} w-32 text-right tabular-nums`;
		if (columnId === 'winRate') return `${baseClass} w-44 text-right tabular-nums`;
		return `${baseClass} w-28 text-right tabular-nums`;
	};

	const getHeaderButtonClass = (columnId: string) => {
		const baseClass = 'h-8 w-full gap-1 px-0 text-xs text-zinc-400 hover:bg-transparent';
		if (columnId === 'player') return `${baseClass} justify-start text-left`;
		return `${baseClass} justify-end text-right`;
	};
</script>

<div class="flex w-full min-w-0 flex-col gap-4">
	<Card.Root class="min-w-0">
		<Card.Header class="space-y-1 pb-4">
			<Card.Title>Filters</Card.Title>
			<Card.Description>Limit teammates by role, hero, teammate, date, and result.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(4,minmax(10rem,1fr))_auto_auto]">
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
									{#each heroOptions as hero}
										<Select.Item value={hero.id.toString()} label={hero.name}>
											<div class="flex items-center gap-2">
												<img class="h-6 w-8 rounded-sm object-cover" src={hero.img} alt="" />
												<span>{hero.name}</span>
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
									{#each heroOptions as hero}
										<Select.Item value={hero.id.toString()} label={hero.name}>
											<div class="flex items-center gap-2">
												<img class="h-6 w-8 rounded-sm object-cover" src={hero.img} alt="" />
												<span>{hero.name}</span>
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
					<Select.Root type="multiple" bind:value={selectedTeammates}>
						<Select.Trigger class="w-full">{makeTeammatesTrigger()}</Select.Trigger>
						<Select.Content>
							<Select.Item value={'-1'} label={'All Teammates'}>All Teammates</Select.Item>
							{#each teammateOptions as teammate}
								<Select.Item value={teammate.id.toString()} label={teammate.username}>
									{teammate.username}
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
		</Card.Content>
	</Card.Root>

	<Card.Root class="min-w-0">
		<Card.Header class="space-y-1 pb-4">
			<Card.Title>Teammates</Card.Title>
			<Card.Description>Win rates when playing on the same team.</Card.Description>
		</Card.Header>
		<Card.Content class="min-w-0 space-y-4">
			{#if teammateStats.length === 0}
				<div class="rounded-md border border-zinc-800 px-4 py-8 text-sm text-zinc-400">No teammate matches found.</div>
			{:else if filteredTeammates.length === 0}
				<div class="rounded-md border border-zinc-800 px-4 py-8 text-sm text-zinc-400">
					No teammates match those filters.
					<button
						type="button"
						class="ml-2 rounded-sm text-sky-300 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						onclick={clearFilters}>Clear filters</button
					>
				</div>
			{:else}
				<div class="w-full max-w-[100vw] overflow-x-auto rounded-md border border-zinc-800">
				<Table.Root class="min-w-[680px]">
					<Table.Header>
						{#each table.getHeaderGroups() as headerGroup}
							<Table.Row>
								{#each headerGroup.headers as header}
									<Table.Head class={getHeaderClass(header.column.id)}>
										{#if !header.isPlaceholder}
											<Button
												variant="ghost"
												class={getHeaderButtonClass(header.column.id)}
												onclick={header.column.getToggleSortingHandler()}
											>
												<FlexRender
													content={header.column.columnDef.header}
													context={header.getContext()}
												/>
												<ArrowUpDown class="h-3 w-3" />
											</Button>
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
					<Table.Body>
						{#each table.getRowModel().rows as row}
							{@const teammate = row.original}
							<Table.Row class="hover:bg-zinc-700/20">
								{#each row.getVisibleCells() as cell}
									<Table.Cell class={getCellClass(cell.column.id)}>
										{#if cell.column.id === 'player'}
											<a class="rounded-sm font-medium text-zinc-100 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/player/${teammate.id}`}>
												{teammate.username}
											</a>
										{:else if cell.column.id === 'matches'}
											{teammate.matches}
										{:else if cell.column.id === 'record'}
											<span class="text-green-400">{teammate.wins}</span>
											<span class="px-1 text-zinc-500">-</span>
											<span class="text-red-400">{teammate.losses}</span>
										{:else if cell.column.id === 'winRate'}
											<div class="ml-auto flex w-36 max-w-full flex-col items-end gap-1 tabular-nums">
												<div class="w-full text-right">{teammate.winRate.toFixed(1)}%</div>
												<Bar percentage={teammate.winRate} />
											</div>
										{:else if cell.column.id === 'longestWinStreak'}
											{teammate.longestWinStreak}
										{:else}
											<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
										{/if}
									</Table.Cell>
								{/each}
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
