<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { Toggle } from '$lib/components/ui/toggle';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { DATE_RANGE_PRESETS, DOTA_MAJOR_PATCHES } from '$lib/data/dotaPatchRanges';
	import {
		buildRecordsSearchParams,
		type RecordCategory,
		type RecordEntry,
		type RecordSet,
		type RecordsFilters,
		type RecordsResponse
	} from '$lib/records';
	import {
		calcImpact,
		getImpactDetails,
		getRoleIcon,
		getRoleName,
		roleDistribution,
		toTime
	} from '$lib/functions';
	import {
		ChevronDown,
		ChevronUp,
		Maximize2,
		Minimize2,
		RefreshCw,
		RotateCcw,
		VenetianMask
	} from 'lucide-svelte';
	import RecordHeroPicker from './RecordHeroPicker.svelte';

	dayjs.extend(relativeTime);

	type CategoryDefinition = {
		id: RecordCategory;
		label: string;
		description: string;
	};

	type Props = {
		data: {
			records: RecordSet[];
			playerMatchCount: number;
			filters: RecordsFilters;
			heroList: DotaAsset[];
		};
	};

	const RECORD_CATEGORIES: CategoryDefinition[] = [
		{
			id: 'highlights',
			label: 'Highlights',
			description: 'The standout combat and impact performances.'
		},
		{
			id: 'economy',
			label: 'Economy',
			description: 'Farm, progression, and objective pressure.'
		},
		{
			id: 'damage',
			label: 'Damage',
			description: 'The biggest single-match damage output.'
		},
		{
			id: 'notorious',
			label: 'Notorious',
			description: 'The records nobody planned to set.'
		}
	];

	let { data }: Props = $props();
	// This route intentionally hydrates its local filter and result state from the server snapshot.
	// svelte-ignore state_referenced_locally
	const {
		records: initialRecords,
		playerMatchCount: initialPlayerMatchCount,
		filters: initialFilters,
		heroList
	} = data;

	let records = $state<RecordSet[]>(initialRecords);
	let playerMatchCount = $state(initialPlayerMatchCount);
	let selectedRoles = $state(initialFilters.roles.map(String));
	let selectedLobby = $state(
		initialFilters.lobbies.map((lobby) => (lobby === 7 ? 'ranked' : 'unranked'))
	);
	let selectedHero = $state(initialFilters.hero.toString());
	let selectedDateRange = $state(initialFilters.dateRange);
	let includeSmurfs = $state(initialFilters.includeSmurfs);
	let loading = $state(false);
	let errorMessage = $state<string | null>(null);
	let expandedRecords = $state<Set<string>>(new Set());
	let effectReady = false;
	let requestId = 0;
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let abortController: AbortController | undefined;

	const hasResults = $derived(records.some((recordSet) => recordSet.records.length > 0));
	const allExpanded = $derived(
		records.filter((recordSet) => recordSet.records.length > 3).every((recordSet) => expandedRecords.has(recordSet.key))
	);

	const getPodiumClass = (position: number) => {
		if (position === 1) return 'bg-yellow-400/10';
		if (position === 2) return 'bg-zinc-300/[0.07]';
		if (position === 3) return 'bg-orange-700/10';
		return '';
	};

	const makeRolesTrigger = () => {
		if (selectedRoles.length === 0 || selectedRoles.length === 5) return 'All Roles';
		if (selectedRoles.length === 1) return getRoleName(Number(selectedRoles[0]));
		return `${selectedRoles.length} Roles`;
	};

	const makeLobbyTrigger = () => {
		if (selectedLobby.length === 0 || selectedLobby.length === 2) return 'All Lobbies';
		return selectedLobby[0] === 'ranked' ? 'Ranked' : 'Unranked';
	};

	const makeDateTrigger = () => {
		const preset = DATE_RANGE_PRESETS.find((range) => range.value === selectedDateRange);
		if (preset) return preset.label;
		return (
			DOTA_MAJOR_PATCHES.find((patch) => `patch-${patch.version}` === selectedDateRange)?.label ??
			'All Time'
		);
	};

	const getRoleFilter = () =>
		(selectedRoles.length === 0 ? ['1', '2', '3', '4', '5'] : selectedRoles).map(Number);

	const getLobbyFilter = () =>
		(selectedLobby.length === 0 ? ['ranked', 'unranked'] : selectedLobby).map((lobby) =>
			lobby === 'ranked' ? 7 : 0
		);

	const getFilters = (): RecordsFilters => ({
		roles: getRoleFilter(),
		lobbies: getLobbyFilter(),
		dateRange: selectedDateRange,
		hero: Number(selectedHero),
		includeSmurfs
	});

	const syncUrl = (filters: RecordsFilters) => {
		const url = new URL(page.url);
		url.search = buildRecordsSearchParams(filters).toString();
		replaceState(`${url.pathname}${url.search}${url.hash}`, page.state);
	};

	const fetchRecordData = async (filters: RecordsFilters, signal: AbortSignal) => {
		const params = buildRecordsSearchParams(filters);
		const response = await fetch(`/api/records?${params.toString()}`, { signal });

		if (!response.ok) {
			const error = await response.json().catch(() => null);
			throw new Error(error?.message ?? 'Records could not be loaded.');
		}

		return (await response.json()) as RecordsResponse;
	};

	const updateRecordData = async (filters: RecordsFilters) => {
		const currentRequest = ++requestId;
		abortController?.abort();
		abortController = new AbortController();
		loading = true;
		errorMessage = null;

		try {
			const response = await fetchRecordData(filters, abortController.signal);
			if (currentRequest === requestId) {
				records = response.records;
				playerMatchCount = response.playerMatchCount;
			}
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			if (currentRequest === requestId) {
				errorMessage = error instanceof Error ? error.message : 'Records could not be loaded.';
			}
		} finally {
			if (currentRequest === requestId) loading = false;
		}
	};

	const queueRecordUpdate = () => {
		const filters = getFilters();
		syncUrl(filters);
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => void updateRecordData(filters), 180);
	};

	const resetFilters = () => {
		selectedRoles = ['1', '2', '3', '4', '5'];
		selectedLobby = ['ranked', 'unranked'];
		selectedHero = '-1';
		selectedDateRange = 'last-365-days';
		includeSmurfs = false;
	};

	const retry = () => void updateRecordData(getFilters());

	const isExpanded = (recordKey: string) => expandedRecords.has(recordKey);

	const toggleExpanded = (recordKey: string) => {
		const next = new Set(expandedRecords);
		if (next.has(recordKey)) next.delete(recordKey);
		else next.add(recordKey);
		expandedRecords = next;
	};

	const toggleAllExpanded = () => {
		expandedRecords = allExpanded
			? new Set()
			: new Set(records.filter((recordSet) => recordSet.records.length > 3).map((recordSet) => recordSet.key));
	};

	const getImpactClass = (impact: number) => {
		const grade = calcImpact(impact).charAt(0);
		return (
			{
				S: 'bg-yellow-400/30 text-yellow-300',
				A: 'bg-green-500/30 text-green-400',
				B: 'bg-blue-500/30 text-blue-400',
				C: 'bg-purple-500/30 text-purple-400',
				D: 'bg-orange-500/30 text-orange-400',
				F: 'bg-red-500/30 text-red-400'
			}[grade] ?? 'bg-zinc-700 text-zinc-200'
		);
	};

	const getRecordColumnTitle = (recordTitle: string) =>
		recordTitle === 'Impact' ? 'Score' : recordTitle;

	const getRateLabel = (recordSet: RecordSet, record: RecordEntry) => {
		if (['Impact', 'GPM', 'XPM'].includes(recordSet.recordTitle)) return null;
		const minutes = record.data.duration / 60;
		if (minutes <= 0) return null;

		const rate = record.record / minutes;
		const digits = rate >= 100 ? 0 : rate >= 10 ? 1 : 2;
		return `${rate.toFixed(digits)}/min`;
	};

	const formatNumber = (value: number) => new Intl.NumberFormat('en-GB').format(value);

	const getExactDate = (record: RecordEntry) =>
		new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date((record.data.startTime + record.data.duration) * 1000));

	const getFilterSummary = () => {
		const parts = [makeDateTrigger(), makeRolesTrigger(), makeLobbyTrigger()];
		const selectedHeroName = heroList.find((hero) => hero.id.toString() === selectedHero)?.name;
		if (selectedHeroName) parts.push(selectedHeroName);
		if (includeSmurfs) parts.push('Smurfs included');
		return parts.join(' · ');
	};

	$effect(() => {
		const filterSignature = JSON.stringify([
			selectedRoles,
			selectedLobby,
			selectedHero,
			selectedDateRange,
			includeSmurfs
		]);

		if (!effectReady) {
			effectReady = true;
			return;
		}

		filterSignature;
		queueRecordUpdate();
	});

	onDestroy(() => {
		if (debounceTimer) clearTimeout(debounceTimer);
		abortController?.abort();
	});
</script>

<svelte:head>
	<title>whos-playing | Records</title>
</svelte:head>

<div id="top" class="mx-auto flex w-full max-w-7xl flex-col gap-4 overflow-hidden px-3 py-4 sm:px-4">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight text-zinc-100">Records</h1>
		<p class="text-sm text-zinc-400">Best and worst single-match marks across the tracked group.</p>
	</header>

	<section class="grid gap-3 rounded-md border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]" aria-label="Record filters">
			<div class="flex min-w-0 flex-col gap-1">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Roles</div>
				<Select.Root type="multiple" bind:value={selectedRoles}>
					<Select.Trigger class="w-full">{makeRolesTrigger()}</Select.Trigger>
					<Select.Content>
						{#each [1, 2, 3, 4, 5] as role}
							<Select.Item value={role.toString()} label={getRoleName(role)}>
								<div class="flex items-center gap-2">
									<img src={getRoleIcon(role)} alt="" class="h-6 w-6" />
									<span>{getRoleName(role)}</span>
								</div>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="flex min-w-0 flex-col gap-1">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Hero</div>
				<RecordHeroPicker heroes={heroList} bind:value={selectedHero} />
			</div>

			<div class="flex min-w-0 flex-col gap-1">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Date Range</div>
				<Select.Root type="single" bind:value={selectedDateRange}>
					<Select.Trigger class="w-full">{makeDateTrigger()}</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading class="pl-2 text-xs uppercase tracking-wide text-zinc-400">Recent</Select.GroupHeading>
							{#each DATE_RANGE_PRESETS as range}
								<Select.Item value={range.value} label={range.label}>{range.label}</Select.Item>
							{/each}
						</Select.Group>
						<Select.Separator />
						<Select.Group>
							<Select.GroupHeading class="pl-2 text-xs uppercase tracking-wide text-zinc-400">Major patches</Select.GroupHeading>
							{#each DOTA_MAJOR_PATCHES.slice().reverse() as patch}
								<Select.Item value={`patch-${patch.version}`} label={patch.label}>{patch.label}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="flex min-w-0 flex-col gap-1">
				<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Lobby</div>
				<Select.Root type="multiple" bind:value={selectedLobby}>
					<Select.Trigger class="w-full">{makeLobbyTrigger()}</Select.Trigger>
					<Select.Content>
						<Select.Item value="ranked" label="Ranked">Ranked</Select.Item>
						<Select.Item value="unranked" label="Unranked">Unranked</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

		<div class="flex min-w-0 flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Smurfs</div>
			<Toggle
				bind:pressed={includeSmurfs}
				class="h-10 w-full border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white"
				aria-label="Include smurf accounts"
			>
				<VenetianMask class="h-5 w-5" />
			</Toggle>
		</div>
		<div class="flex items-end">
			<button
				type="button"
				class="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-sky-600 px-3 text-sm font-medium text-white transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:w-auto"
				onclick={resetFilters}
			>
				<RotateCcw class="h-3.5 w-3.5" /> Reset
			</button>
		</div>
	</section>

	<div class="flex flex-col gap-2 rounded-md border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="min-w-0">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Current scope</div>
			<div class="mt-1 text-sm text-zinc-200">{getFilterSummary()}</div>
			<div class="text-xs text-zinc-400">
				{formatNumber(playerMatchCount)} player-{playerMatchCount === 1 ? 'match' : 'matches'} in scope
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="ghost"
				size="sm"
				class="h-9 gap-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
				onclick={toggleAllExpanded}
			>
				{#if allExpanded}
					<Minimize2 class="h-4 w-4" /> Collapse all
				{:else}
					<Maximize2 class="h-4 w-4" /> Expand all
				{/if}
			</Button>
		</div>
	</div>

	{#if loading}
		<div class="flex items-center gap-2 text-xs text-zinc-400" aria-live="polite" aria-atomic="true">
			<RefreshCw class="h-3.5 w-3.5 animate-spin text-sky-400" aria-hidden="true" />
			Updating records…
		</div>
	{/if}

	{#if errorMessage}
		<div class="flex flex-col gap-3 rounded-md border border-red-900/60 bg-red-950/30 p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
			<div>
				<div class="font-medium text-red-100">Records did not update</div>
				<p class="mt-1 text-sm text-red-200/80">{errorMessage} Your previous results are still shown.</p>
			</div>
			<Button variant="outline" class="min-h-11 shrink-0 border-red-800 text-red-100 hover:bg-red-950 sm:min-h-10" onclick={retry}>
				Try again
			</Button>
		</div>
	{/if}

	{#if loading && records.length === 0}
		<div class="flex min-h-80 items-center justify-center rounded-md border border-border bg-card">
			<Loading />
		</div>
	{:else if !hasResults}
		<div class="rounded-md border border-border bg-card px-4 py-10 text-center">
			<h2 class="text-base font-semibold text-zinc-100">No qualifying records</h2>
			<p class="mx-auto mt-1 max-w-md text-sm text-zinc-400">No matches meet this combination of hero, role, lobby, and date filters.</p>
			<Button variant="outline" class="mt-4 min-h-11 gap-1.5 sm:min-h-10" onclick={resetFilters}>
				<RotateCcw class="h-4 w-4" /> Reset filters
			</Button>
		</div>
	{:else}
		<main class="flex w-full flex-col gap-4" in:fade={{ duration: 180 }}>
			{#each RECORD_CATEGORIES as category}
				{@const categoryRecords = records.filter(
					(recordSet) => recordSet.category === category.id && recordSet.records.length > 0
				)}
				{#if categoryRecords.length > 0}
					<section id={category.id} class="scroll-mt-4" aria-labelledby={`${category.id}-heading`}>
						<div class="mb-2 flex items-end justify-between gap-4 px-1">
							<div>
								<h2 id={`${category.id}-heading`} class="text-base font-semibold text-zinc-100">{category.label}</h2>
								<p class="text-xs text-zinc-400">{category.description}</p>
							</div>
						</div>

						<div class="flex flex-col gap-2">
							{#each categoryRecords as recordSet}
								<Card.Root class="rounded-md border-border bg-card shadow-none" id={recordSet.key}>
									<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 pt-3 pb-2">
										<Card.Title class="text-base">{recordSet.title}</Card.Title>
										{#if recordSet.records.length > 3}
											<Button
												variant="ghost"
												size="icon"
												class="h-11 w-11 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 sm:h-8 sm:w-8"
												onclick={() => toggleExpanded(recordSet.key)}
												aria-expanded={isExpanded(recordSet.key)}
												aria-label={isExpanded(recordSet.key) ? `Show top 3 ${recordSet.title}` : `Show top 10 ${recordSet.title}`}
											>
												{#if isExpanded(recordSet.key)}
													<ChevronUp class="h-4 w-4" />
												{:else}
													<ChevronDown class="h-4 w-4" />
												{/if}
											</Button>
										{/if}
									</Card.Header>

									<Card.Content class="px-4 pb-4">
										<div class="hidden overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35 md:block">
											<Table.Root>
												<Table.Header class="bg-zinc-950/70">
													<Table.Row class="border-zinc-800 hover:bg-transparent">
														<Table.Head class="h-9 w-10 px-2 text-center text-xs uppercase tracking-wide text-zinc-400">#</Table.Head>
														<Table.Head class="h-9 min-w-28 px-2 text-xs uppercase tracking-wide text-zinc-400">Player</Table.Head>
														<Table.Head class="h-9 px-2 text-right text-xs uppercase tracking-wide text-zinc-400">{getRecordColumnTitle(recordSet.recordTitle)}</Table.Head>
														<Table.Head class="h-9 px-2 text-right text-xs uppercase tracking-wide text-zinc-400">Time</Table.Head>
														<Table.Head class="h-9 min-w-24 px-2 text-xs uppercase tracking-wide text-zinc-400">Hero</Table.Head>
														<Table.Head class="h-9 px-2 text-center text-xs uppercase tracking-wide text-zinc-400">Role</Table.Head>
														<Table.Head class="h-9 px-2 text-right text-xs uppercase tracking-wide text-zinc-400">K</Table.Head>
														<Table.Head class="h-9 px-2 text-right text-xs uppercase tracking-wide text-zinc-400">D</Table.Head>
														<Table.Head class="h-9 px-2 text-right text-xs uppercase tracking-wide text-zinc-400">A</Table.Head>
														<Table.Head class="h-9 px-2 text-center text-xs uppercase tracking-wide text-zinc-400">Grade</Table.Head>
														<Table.Head class="h-9 px-2 text-right text-xs uppercase tracking-wide text-zinc-400">Date</Table.Head>
													</Table.Row>
												</Table.Header>
												<Table.Body>
													{#each recordSet.records.slice(0, isExpanded(recordSet.key) ? 10 : 3) as record, index}
														{@const impactDetails = getImpactDetails(
															{ ...record.data, hero_id: record.data.hero.id },
															record.data.role,
															record.data.duration
														)}
														{@const distribution = roleDistribution(record.data.role, record.data.hero.id)}
														<Table.Row class={`group relative border-zinc-900 text-sm transition-colors hover:bg-zinc-900/70 ${getPodiumClass(index + 1)}`}>
															<Table.Cell class="px-2 py-2 text-center font-medium text-zinc-100">
																<MatchModal
																	matchId={record.data.matchId}
																	sequenceNum={record.data.sequenceNumber ?? undefined}
																	buttonTrigger
																	triggerLabel={`Open match ${record.data.matchId}`}
																	triggerClass="absolute inset-0 z-10 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
																>
																	<span class="sr-only">Open match {record.data.matchId}</span>
																</MatchModal>
																<span class="pointer-events-none relative z-20">{index + 1}</span>
															</Table.Cell>
															<Table.Cell class="px-2 py-2">
																<button onclick={() => goto(`/player/${record.data.id}`)} class="relative z-20 max-w-28 truncate text-left font-medium text-zinc-100 transition-colors hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
																	{record.data.username}
																</button>
																{#if record.data.smurf}
																	<span class="pointer-events-none relative z-20 ml-1 inline-flex align-middle">
																		<VenetianMask class="h-5 w-5" aria-hidden="true" />
																		<span class="sr-only">Smurf account</span>
																	</span>
																{/if}
															</Table.Cell>
															<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-zinc-200">
																<div class="text-lg">{formatNumber(record.record)}</div>
																{#if getRateLabel(recordSet, record)}
																	<div class="text-xs text-zinc-400">{getRateLabel(recordSet, record)}</div>
																{/if}
															</Table.Cell>
															<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-zinc-300">{toTime(record.data.duration)}</Table.Cell>
															<Table.Cell class="px-2 py-2">
																<div class="pointer-events-none relative z-20 flex min-w-0 items-center gap-2">
																	<img src={record.data.hero.img} alt="" class="h-7 w-10 rounded-sm object-cover" loading="lazy" />
																	<span class="max-w-24 truncate font-medium text-zinc-100">{record.data.hero.name}</span>
																</div>
															</Table.Cell>
															<Table.Cell class="px-2 py-2 text-center">
																<Tooltip.Root>
																	<Tooltip.Trigger aria-label={`Role: ${getRoleName(record.data.role)}`} class="relative z-20 inline-flex rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
																		<img src={getRoleIcon(record.data.role)} alt="" class="h-7 w-7" />
																	</Tooltip.Trigger>
																	<Tooltip.Content class="text-xs">{getRoleName(record.data.role)}</Tooltip.Content>
																</Tooltip.Root>
															</Table.Cell>
															<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-green-400">{record.data.kills}</Table.Cell>
															<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-red-400">{record.data.deaths}</Table.Cell>
															<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-cyan-300">{record.data.assists}</Table.Cell>
															<Table.Cell class="px-2 py-2 text-center">
																<Tooltip.Root>
																	<Tooltip.Trigger aria-label={`Impact grade ${calcImpact(record.data.impact)}`} class={`relative z-20 inline-flex min-w-10 justify-center rounded-md px-2 py-0.5 font-display text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring ${getImpactClass(record.data.impact)}`}>
																		{calcImpact(record.data.impact)}
																	</Tooltip.Trigger>
																	<Tooltip.Content class="w-72 text-xs">
																		<div class="mb-2 text-center font-medium">Impact score: {record.data.impact}</div>
																		<Table.Root>
																			<Table.Header>
																				<Table.Row>
																					<Table.Head class="h-7 px-2">Stat</Table.Head>
																					<Table.Head class="h-7 px-2 text-center">Weight</Table.Head>
																					<Table.Head class="h-7 px-2 text-right">Rating</Table.Head>
																				</Table.Row>
																			</Table.Header>
																			<Table.Body>
																				<Table.Row>
																					<Table.Cell class="px-2 py-1">K/A</Table.Cell>
																					<Table.Cell class="px-2 py-1 text-center">{distribution?.kapm}%</Table.Cell>
																					<Table.Cell class="px-2 py-1 text-right">{impactDetails.kapmRating}</Table.Cell>
																				</Table.Row>
																				<Table.Row>
																					<Table.Cell class="px-2 py-1">Deaths</Table.Cell>
																					<Table.Cell class="px-2 py-1 text-center">{distribution?.death}%</Table.Cell>
																					<Table.Cell class="px-2 py-1 text-right">{impactDetails.deathRating}</Table.Cell>
																				</Table.Row>
																				{#if distribution?.csMin}
																					<Table.Row>
																						<Table.Cell class="px-2 py-1">CS</Table.Cell>
																						<Table.Cell class="px-2 py-1 text-center">{distribution.csMin}%</Table.Cell>
																						<Table.Cell class="px-2 py-1 text-right">{impactDetails.csMinRating}</Table.Cell>
																					</Table.Row>
																				{/if}
																			</Table.Body>
																		</Table.Root>
																	</Tooltip.Content>
																</Tooltip.Root>
															</Table.Cell>
															<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right text-xs text-zinc-400">
																<time datetime={new Date((record.data.startTime + record.data.duration) * 1000).toISOString()} title={getExactDate(record)}>
																	{dayjs((record.data.startTime + record.data.duration) * 1000).from(dayjs())}
																</time>
															</Table.Cell>
														</Table.Row>
													{/each}
												</Table.Body>
											</Table.Root>
										</div>

										<ol class="overflow-hidden rounded-md border border-zinc-800/80 bg-zinc-950/35 md:hidden">
											{#each recordSet.records.slice(0, isExpanded(recordSet.key) ? 10 : 3) as record, index}
												<li class={`relative border-b border-zinc-800/80 p-3 last:border-b-0 ${getPodiumClass(index + 1)}`}>
													<MatchModal
														matchId={record.data.matchId}
														sequenceNum={record.data.sequenceNumber ?? undefined}
														buttonTrigger
														triggerLabel={`Open match ${record.data.matchId}`}
														triggerClass="absolute inset-0 z-10 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
													>
														<span class="sr-only">Open match {record.data.matchId}</span>
													</MatchModal>

													<div class="pointer-events-none relative z-20 flex items-start gap-3">
														<div class="flex h-9 w-7 shrink-0 items-center justify-center text-sm font-semibold text-zinc-300">{index + 1}</div>
														<div class="min-w-0 flex-1">
															<div class="flex items-start justify-between gap-3">
																<div class="min-w-0">
																	<button onclick={() => goto(`/player/${record.data.id}`)} class="pointer-events-auto relative z-30 min-h-11 max-w-full truncate text-left text-base font-semibold text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
																		{record.data.username}
																	</button>
																	{#if record.data.smurf}
																		<VenetianMask class="ml-1 inline h-4 w-4 text-zinc-400" aria-label="Smurf account" />
																	{/if}
																</div>
																<div class="shrink-0 text-right">
																	<div class="text-xl font-semibold tabular-nums text-zinc-100">{formatNumber(record.record)}</div>
																	<div class="text-sm text-zinc-400">{getRecordColumnTitle(recordSet.recordTitle)}</div>
																</div>
															</div>

															<div class="mt-1 flex min-w-0 items-center gap-2 text-sm text-zinc-300">
																<img src={record.data.hero.img} alt="" class="h-7 w-10 shrink-0 rounded-sm object-cover" loading="lazy" />
																<span class="truncate font-medium text-zinc-100">{record.data.hero.name}</span>
																<img src={getRoleIcon(record.data.role)} alt={getRoleName(record.data.role)} class="h-6 w-6 shrink-0" />
															</div>

															<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
																<span class="tabular-nums"><span class="text-green-400">{record.data.kills}</span><span class="text-zinc-600"> / </span><span class="text-red-400">{record.data.deaths}</span><span class="text-zinc-600"> / </span><span class="text-cyan-300">{record.data.assists}</span></span>
																<span class={`rounded-md px-2 py-1 font-display text-xs font-semibold ${getImpactClass(record.data.impact)}`}>{calcImpact(record.data.impact)} grade</span>
																<span class="text-zinc-400">{toTime(record.data.duration)}</span>
																{#if getRateLabel(recordSet, record)}
																	<span class="text-zinc-400">{getRateLabel(recordSet, record)}</span>
																{/if}
															</div>

															<div class="mt-2 text-sm text-zinc-400">
																<time datetime={new Date((record.data.startTime + record.data.duration) * 1000).toISOString()} title={getExactDate(record)}>
																	{dayjs((record.data.startTime + record.data.duration) * 1000).from(dayjs())}
																</time>
																<span aria-hidden="true"> · </span>Tap for match details
															</div>
														</div>
													</div>
												</li>
											{/each}
										</ol>
									</Card.Content>
								</Card.Root>
							{/each}
						</div>
					</section>
				{/if}
			{/each}
		</main>
	{/if}
</div>
