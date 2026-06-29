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
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import RatingChip from '$lib/components/RatingChip.svelte';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import { getRoleIcon, getRoleName, toTime } from '$lib/functions';
	import {
		DATE_RANGE_PRESETS,
		DOTA_MAJOR_PATCHES,
		getDotaPatchForTimestamp,
		getDotaPatchRangeBounds
	} from '$lib/data/dotaPatchRanges';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import { ArrowUpDown } from 'lucide-svelte';
	import dayjs from 'dayjs';

	type PlayerRecordMatch = {
		matchId: number;
		sequenceNumber: number | null;
		kills: number;
		deaths: number;
		assists: number;
		impact: number;
		lastHits: number | null;
		gpm: number | null;
		xpm: number | null;
		heroDamage: number | null;
		towerDamage: number | null;
		duration: number;
		startTime: number;
		role: number;
		team: string;
		winner: string;
		lobbyPlayerIds: number[];
		hero: {
			id: number;
			name: string;
			img: string;
		};
	};

	type PlayerRecord = {
		title: string;
		recordTitle: string;
		record: number;
		data: PlayerRecordMatch;
	};

	type PlayerRecordsPayload = PlayerRecord[] | { matches: PlayerRecordMatch[] };
	type PlayerRecordStatKey =
		| 'kills'
		| 'deaths'
		| 'assists'
		| 'impact'
		| 'lastHits'
		| 'gpm'
		| 'xpm'
		| 'heroDamage'
		| 'towerDamage';

	type RecordCategory = 'all' | 'combat' | 'impact' | 'economy' | 'damage';
	type ResultFilter = 'wins' | 'losses';

	const categoryOptions: Array<{ value: RecordCategory; label: string }> = [
		{ value: 'all', label: 'All' },
		{ value: 'combat', label: 'Combat' },
		{ value: 'impact', label: 'Impact' },
		{ value: 'economy', label: 'Economy' },
		{ value: 'damage', label: 'Damage' }
	];

	interface Props {
		data: {
			player: {
				id: number;
				username: string;
			};
			playerList: {
				id: number;
				username: string;
			}[];
			playerRecords: PlayerRecordsPayload;
		};
	}

	let { data }: Props = $props();
	let sourceMatches = $derived(
		Array.isArray(data.playerRecords)
			? data.playerRecords.map((record) => record.data)
			: (data.playerRecords.matches ?? [])
	);
	let player = $derived(data.player);
	let playerList = $derived(data.playerList);
	let categoryFilter: RecordCategory = $state('all');
	let wins = $state(true);
	let losses = $state(true);
	let selectedRoles = $state(['1', '2', '3', '4', '5']);
	let selectedHeroSingle = $state('-1');
	let selectedHeroMulti = $state(['-1']);
	let selectedTeammates = $state(['-1']);
	let selectedDateRange = $state('all');
	let heroSelectVariant = $state('single');

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

	let heroOptions = $derived(
		Array.from(
			new Map(
				sourceMatches.map((match) => [
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

	const getCategory = (record: PlayerRecord): RecordCategory => {
		if (record.recordTitle === 'Impact') return 'impact';
		if (['Kills', 'Deaths', 'Assists'].includes(record.recordTitle)) return 'combat';
		if (['Last Hits', 'GPM', 'XPM'].includes(record.recordTitle)) return 'economy';
		if (record.recordTitle.includes('Damage')) return 'damage';
		return 'all';
	};

	let teammateOptions = $derived(
		playerList
			.filter((listedPlayer) => listedPlayer.id !== player.id)
			.sort((a, b) => a.username.localeCompare(b.username))
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

	let filteredMatches = $derived(
		sourceMatches.filter((match) => {
			const matchesRole =
				selectedRoles.length === 0 || selectedRoles.includes(match.role.toString());
			const matchesHero =
				selectedHero.length === 0 ||
				selectedHero[0] === '-1' ||
				selectedHero.includes(match.hero.id.toString());
			const matchesResult =
				(wins && match.team === match.winner) || (losses && match.team !== match.winner);
			const selectedTeammateIds = selectedTeammates.filter((teammateId) => teammateId !== '-1');
			const matchesTeammate =
				selectedTeammateIds.length === 0 ||
				selectedTeammateIds.some((playerId) =>
					match.lobbyPlayerIds?.map(String).includes(playerId)
				);
			const matchStartTime = Number(match.startTime);
			const matchesDateRange = selectedPatchVersion
				? getDotaPatchForTimestamp(matchStartTime)?.version === selectedPatchVersion
				: (dateRangeBounds.start === null || matchStartTime >= dateRangeBounds.start) &&
					(dateRangeBounds.end === null || matchStartTime <= dateRangeBounds.end);

			return matchesRole && matchesHero && matchesResult && matchesTeammate && matchesDateRange;
		})
	);

	const makePlayerRecord = (
		title: string,
		recordTitle: string,
		statKey: PlayerRecordStatKey,
		match: PlayerRecordMatch | undefined
	) => {
		return {
			title,
			recordTitle,
			record: Number(match?.[statKey] ?? 0),
			data: match
		};
	};

	const getRecordsFromMatches = (matches: PlayerRecordMatch[]) => {
		const byHighest = (statKey: PlayerRecordStatKey) => {
			return matches
				.filter((match) => match[statKey] !== null && match[statKey] !== undefined)
				.sort((a, b) => Number(b[statKey]) - Number(a[statKey]))[0];
		};

		const byLowest = (statKey: PlayerRecordStatKey) => {
			return matches
				.filter((match) => match[statKey] !== null && match[statKey] !== undefined)
				.sort((a, b) => Number(a[statKey]) - Number(b[statKey]))[0];
		};

		return [
			makePlayerRecord('Most Kills', 'Kills', 'kills', byHighest('kills')),
			makePlayerRecord('Most Deaths', 'Deaths', 'deaths', byHighest('deaths')),
			makePlayerRecord('Most Assists', 'Assists', 'assists', byHighest('assists')),
			makePlayerRecord('Highest Impact', 'Impact', 'impact', byHighest('impact')),
			makePlayerRecord('Lowest Impact', 'Impact', 'impact', byLowest('impact')),
			makePlayerRecord('Most Last Hits', 'Last Hits', 'lastHits', byHighest('lastHits')),
			makePlayerRecord('Highest GPM', 'GPM', 'gpm', byHighest('gpm')),
			makePlayerRecord('Highest XPM', 'XPM', 'xpm', byHighest('xpm')),
			makePlayerRecord('Most Hero Damage', 'Hero Damage', 'heroDamage', byHighest('heroDamage')),
			makePlayerRecord('Most Building Damage', 'Building Damage', 'towerDamage', byHighest('towerDamage'))
		].filter((record): record is PlayerRecord => Boolean(record.data));
	};

	let records = $derived(getRecordsFromMatches(sourceMatches));
	let filteredRecords = $derived(
		getRecordsFromMatches(filteredMatches).filter(
			(record) => categoryFilter === 'all' || getCategory(record) === categoryFilter
		)
	);

	const formatRecord = (record: PlayerRecord) => {
		if (record.recordTitle === 'Impact') return Math.round(record.record).toString();
		return Intl.NumberFormat('en-GB').format(record.record ?? 0);
	};

	const makeImpactChipData = (record: PlayerRecord) => {
		return {
			player: {
				...record.data,
				lastHits: record.data.lastHits ?? 0,
				hero_id: record.data.hero.id
			},
			matchData: {
				duration: record.data.duration
			}
		};
	};

	const columns: ColumnDef<PlayerRecord>[] = [
		{
			id: 'record',
			accessorFn: (record) => record.title,
			header: 'Record'
		},
		{
			id: 'value',
			accessorFn: (record) => record.record,
			header: 'Value'
		},
		{
			id: 'duration',
			accessorFn: (record) => record.data.duration,
			header: 'Duration'
		},
		{
			id: 'hero',
			accessorFn: (record) => record.data.hero.name,
			header: 'Hero'
		},
		{
			id: 'role',
			accessorFn: (record) => record.data.role,
			header: 'Role'
		},
		{
			id: 'kda',
			accessorFn: (record) => (record.data.kills + record.data.assists) / Math.max(record.data.deaths, 1),
			header: 'KDA'
		},
		{
			id: 'impact',
			accessorFn: (record) => record.data.impact,
			header: 'Impact'
		},
		{
			id: 'date',
			accessorFn: (record) => record.data.startTime,
			header: 'Date'
		}
	];

	let sorting = $state<SortingState>([]);

	const table = $derived(
		createSvelteTable({
			data: filteredRecords,
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
		const baseClass = 'text-zinc-400';
		if (columnId === 'record') return `${baseClass} pl-4 min-w-36 text-left`;
		if (columnId === 'date') return `${baseClass} min-w-28 text-center`;
		if (columnId === 'hero') return `${baseClass} w-16 text-center`;
		if (columnId === 'impact') return `${baseClass} w-20 text-center`;
		if (columnId === 'kda') return `${baseClass} w-24 text-center`;
		return `${baseClass} w-12 text-center`;
	};

	const getCellClass = (columnId: string) => {
		if (columnId === 'record') return 'min-w-36 text-left';
		if (columnId === 'date') return 'min-w-28 text-center text-sm text-zinc-300';
		if (columnId === 'hero') return 'w-16 text-center';
		if (columnId === 'impact') return 'w-20 text-center';
		if (columnId === 'kda') return 'w-24 text-center';
		return 'w-12 text-center';
	};

	const getHeaderButtonClass = (columnId: string) => {
		const baseClass = 'h-8 gap-1 hover:bg-transparent';
		if (columnId === 'record') return `${baseClass} justify-start px-0`;
		if (['hero', 'role'].includes(columnId)) return `${baseClass} w-full justify-center px-0 text-xs`;
		return `${baseClass} w-full justify-center px-1 text-xs`;
	};

	const clearFilters = () => {
		categoryFilter = 'all';
		wins = true;
		losses = true;
		selectedRoles = ['1', '2', '3', '4', '5'];
		selectedHeroSingle = '-1';
		selectedHeroMulti = ['-1'];
		selectedTeammates = ['-1'];
		selectedDateRange = 'all';
	};

	const handleResultChange = (result: ResultFilter) => {
		let currentResult;
		switch (result) {
			case 'wins':
				currentResult = wins;
				break;
			case 'losses':
				currentResult = losses;
				break;
		}
		if (Number(wins) + Number(losses) > 1 || currentResult === false) {
			switch (result) {
				case 'wins':
					wins = !wins;
					break;
				case 'losses':
					losses = !losses;
					break;
			}
		}
	};

	const makeCategoryTrigger = () => {
		return categoryOptions.find((option) => option.value === categoryFilter)?.label ?? 'All';
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

	const makeTeammatesTrigger = () => {
		const selectedTeammateIds = selectedTeammates.filter((teammateId) => teammateId !== '-1');
		if (selectedTeammateIds.length === 0) {
			return 'All Teammates';
		}
		if (selectedTeammateIds.length <= 1) {
			return teammateOptions.find(
				(listedPlayer) => listedPlayer.id.toString() === selectedTeammateIds[0]
			)?.username;
		}
		return `${selectedTeammateIds.length} Teammates Selected`;
	};

	const makeDateRangeTrigger = () => {
		const preset = DATE_RANGE_PRESETS.find((range) => range.value === selectedDateRange);
		if (preset) return preset.label;

		return (
			DOTA_MAJOR_PATCHES.find((patch) => `patch-${patch.version}` === selectedDateRange)?.label ??
			'All Time'
		);
	};
</script>

<div class="flex w-full min-w-0 flex-col gap-4">
	<Card.Root class="min-w-0">
		<Card.Header class="space-y-1 pb-4">
			<Card.Title>Filters</Card.Title>
			<Card.Description>Limit records by role, hero, teammate, date, and result.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(5,minmax(10rem,1fr))_auto]">
				<div class="flex min-w-0 flex-col gap-1">
					<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Records</div>
					<Select.Root type="single" bind:value={categoryFilter}>
						<Select.Trigger class="w-full">{makeCategoryTrigger()}</Select.Trigger>
						<Select.Content>
							{#each categoryOptions as option}
								<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

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
							{#each teammateOptions as listedPlayer}
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
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="min-w-0">
		<Card.Header class="space-y-1 pb-4">
			<Card.Title>Player Records</Card.Title>
			<Card.Description>Best and worst single-game marks across this player's matches.</Card.Description>
		</Card.Header>
		<Card.Content class="min-w-0 space-y-4">
			{#if records.length === 0}
				<div class="rounded-md border border-zinc-800 px-4 py-8 text-sm text-zinc-400">No records found.</div>
			{:else if filteredRecords.length === 0}
				<div class="rounded-md border border-zinc-800 px-4 py-8 text-sm text-zinc-400">
					No records match those filters.
					<button type="button" class="ml-2 rounded-sm text-sky-300 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onclick={clearFilters}>Clear filters</button>
				</div>
			{:else}
				<div class="w-full max-w-[100vw] rounded-md border border-zinc-800">
					<Table.Root class="min-w-[620px]">
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
								{@const record = row.original}
								<Table.Row class="hover:bg-zinc-700/20">
									{#each row.getVisibleCells() as cell}
										<Table.Cell class={getCellClass(cell.column.id)}>
											<MatchModal
												matchId={record.data.matchId}
												sequenceNum={record.data.sequenceNumber ?? undefined}
											>
												{#if cell.column.id === 'record'}
													<div class="truncate py-1 text-left font-medium text-zinc-100">
														{record.title}
													</div>
												{:else if cell.column.id === 'value'}
													<div class="py-1 text-center font-display text-lg text-zinc-100">
														{formatRecord(record)}
													</div>
												{:else if cell.column.id === 'duration'}
													<div class="py-1 text-center text-sm text-zinc-300">
														{toTime(record.data.duration)}
													</div>
												{:else if cell.column.id === 'hero'}
													<div class="flex justify-center py-1">
														<img
															src={record.data.hero.img}
															alt={record.data.hero.name}
															class="h-8 w-12 shrink-0 rounded-sm object-cover"
														/>
													</div>
												{:else if cell.column.id === 'role'}
													<div class="flex justify-center py-1">
														<img
															src={getRoleIcon(record.data.role)}
															alt={`Position ${record.data.role}`}
															class="h-7 w-7"
														/>
													</div>
												{:else if cell.column.id === 'kda'}
													<div class="flex justify-center gap-1 py-1 text-sm">
														<span class="text-green-400">{record.data.kills}</span>
														<span class="text-zinc-500">/</span>
														<span class="text-red-400">{record.data.deaths}</span>
														<span class="text-zinc-500">/</span>
														<span class="text-cyan-300">{record.data.assists}</span>
													</div>
												{:else if cell.column.id === 'impact'}
													<div class="flex min-h-9 items-center justify-center py-1">
														<RatingChip data={makeImpactChipData(record)} />
													</div>
												{:else if cell.column.id === 'date'}
													<div class="py-1 text-center text-sm text-zinc-300">
														{dayjs.unix(record.data.startTime).format('DD MMM YYYY')}
													</div>
												{/if}
											</MatchModal>
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
