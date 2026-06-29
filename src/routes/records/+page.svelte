<script lang="ts">
	import { goto } from '$app/navigation';
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
		calcImpact,
		getImpactDetails,
		getRoleIcon,
		getRoleName,
		roleDistribution,
		toTime
	} from '$lib/functions';
	import { ChevronDown, ChevronUp, VenetianMask } from 'lucide-svelte';

	dayjs.extend(relativeTime);

	interface Record {
		title: string;
		recordTitle: string;
		records: RecordData[];
		length: number;
	}

	interface RecordData {
		record: number;
		data: Data;
	}

	interface Data {
		id: number;
		username: string;
		smurf: boolean;
		kills: number;
		deaths: number;
		assists: number;
		matchId: number;
		sequenceNumber: number;
		hero: Hero;
		impact: number;
		role: number;
		duration: number;
		startTime: number;
	}

	interface Hero {
		id: number;
		name: string;
		img: string;
	}

	interface Props {
		data: { playerList: any[]; url: string; records: Record[]; heroList: DotaAsset[] };
	}

	let { data }: Props = $props();

	const getColour = (position: number) => {
		if (position === 1) return 'rgba(234, 179, 8, 0.14)';
		if (position === 2) return 'rgba(161, 161, 170, 0.14)';
		if (position === 3) return 'rgba(180, 83, 9, 0.14)';
		return 'transparent';
	};

	let heroList = $derived(data.heroList);
	let records = $state<Record[]>([]);
	let selectedRoles = $state(['1', '2', '3', '4', '5']);
	let selectedLobby = $state(['ranked', 'unranked']);
	let selectedHero = $state('-1');
	let smurfs = $state(false);
	let loading = $state(false);
	let time = $state(365);
	let selectedDateRange = $state('last-365-days');
	let requestId = 0;

	const expandList = (length: number) => (length === 3 ? 10 : 3);

	const makeRolesTrigger = () => {
		if (selectedRoles.length === 0 || selectedRoles.length === 5) return 'All Roles';
		if (selectedRoles.length === 1) return getRoleName(Number(selectedRoles[0]));
		return `${selectedRoles.length} Roles`;
	};

	const makeLobbyTrigger = () => {
		if (selectedLobby.length === 2) return 'All Lobbies';
		if (selectedLobby[0] === 'ranked') return 'Ranked';
		if (selectedLobby[0] === 'unranked') return 'Unranked';
		return 'No Lobby';
	};

	const makeHeroTrigger = () => {
		if (selectedHero === '-1') return 'All Heroes';
		return heroList.find((hero) => hero.id.toString() === selectedHero)?.name ?? 'All Heroes';
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

	const fetchRecordData = async (): Promise<Record[]> => {
		const params = new URLSearchParams({
			roles: JSON.stringify(getRoleFilter()),
			lobby: JSON.stringify(getLobbyFilter()),
			time: time.toString(),
			dateRange: selectedDateRange,
			hero: Number(selectedHero).toString(),
			smurf: smurfs.toString()
		});
		const response = await fetch(`/api/records?${params.toString()}`);
		return await response.json();
	};

	const getImpactClass = (impact: number) => {
		const rating = calcImpact(impact);
		const grade = rating.charAt(0);
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

	const updateRecordData = async () => {
		const currentRequest = ++requestId;
		loading = true;
		const data = await fetchRecordData();
		if (currentRequest === requestId) {
			records = data;
			loading = false;
		}
	};

	$effect(() => {
		selectedRoles;
		selectedLobby;
		selectedHero;
		selectedDateRange;
		smurfs;
		void updateRecordData();
	});
</script>

<svelte:head>
	<title>whos-playing | Records</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-3 py-4 sm:px-4">
	<div class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight text-zinc-100">Records</h1>
		<p class="text-sm text-zinc-400">Best and worst single-match marks across the tracked group.</p>
	</div>

	<div class="grid gap-3 rounded-md border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-5">
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
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Heroes</div>
			<Select.Root type="single" bind:value={selectedHero}>
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
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Date Range</div>
			<Select.Root type="single" bind:value={selectedDateRange}>
				<Select.Trigger class="w-full">{makeDateTrigger()}</Select.Trigger>
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
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Lobby</div>
			<Select.Root type="multiple" bind:value={selectedLobby}>
				<Select.Trigger class="w-full">{makeLobbyTrigger()}</Select.Trigger>
				<Select.Content>
					<Select.Item value="ranked" label="Ranked">Ranked</Select.Item>
					<Select.Item value="unranked" label="Unranked">Unranked</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Smurfs</div>
			<Toggle
				bind:pressed={smurfs}
				class="h-10 w-full border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white"
			>
				<VenetianMask class="h-5 w-5" />
			</Toggle>
		</div>
	</div>

	{#if loading && records.length === 0}
		<div class="flex min-h-80 items-center justify-center rounded-md border border-border bg-card">
			<Loading />
		</div>
	{:else}
		<div class="mx-auto flex w-full max-w-3xl flex-col gap-4" in:fade={{ duration: 200 }}>
			{#each records as recordSet}
				<Card.Root class="rounded-md border-border bg-card shadow-none" id={recordSet.recordTitle}>
					<Card.Header class="flex flex-row items-start justify-between gap-3 p-4 pb-0">
						<div>
							<Card.Title class="text-base">{recordSet.title}</Card.Title>
						</div>
						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
							onclick={() => (recordSet.length = expandList(recordSet.length))}
							aria-label={recordSet.length === 10 ? 'Show top 3' : 'Show top 10'}
						>
							{#if recordSet.length === 10}
								<ChevronUp class="h-4 w-4" />
							{:else}
								<ChevronDown class="h-4 w-4" />
							{/if}
						</Button>
					</Card.Header>
					<Card.Content class="p-4">
						<div class="overflow-hidden rounded-md border border-zinc-800/80 bg-zinc-950/35">
							<Table.Root>
								<Table.Header class="bg-zinc-950/70">
									<Table.Row class="border-zinc-800 hover:bg-transparent">
										<Table.Head class="h-9 w-10 px-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">#</Table.Head>
										<Table.Head class="h-9 min-w-28 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Player</Table.Head>
										<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">{recordSet.recordTitle}</Table.Head>
										<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Time</Table.Head>
										<Table.Head class="h-9 min-w-24 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Hero</Table.Head>
										<Table.Head class="h-9 px-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">Role</Table.Head>
										<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">K</Table.Head>
										<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">D</Table.Head>
										<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">A</Table.Head>
										<Table.Head class="h-9 px-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">Impact</Table.Head>
										<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Date</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each recordSet.records.slice(0, recordSet.length) as record, i}
										{@const impactDetails = getImpactDetails(
											{ ...record.data, hero_id: record.data.hero.id },
											record.data.role,
											record.data.duration
										)}
										{@const distribution = roleDistribution(record.data.role, record.data.hero.id)}
										<Table.Row
											class="relative border-zinc-900 text-sm transition-colors hover:bg-zinc-900/70"
											style={`background-color: ${getColour(i + 1)}`}
										>
											<Table.Cell class="px-2 py-2 text-center font-medium text-zinc-100">
												<MatchModal matchId={record.data.matchId} sequenceNum={record.data.sequenceNumber}>
													<span class="absolute inset-0 z-10" aria-label={`Open match ${record.data.matchId}`}></span>
												</MatchModal>
												<span class="relative z-20 pointer-events-none">{i + 1}</span>
											</Table.Cell>
											<Table.Cell class="px-2 py-2">
												<button
													onclick={() => goto(`/player/${record.data.id}`)}
													class="relative z-20 max-w-28 truncate text-left font-medium text-zinc-100 transition-colors hover:text-sky-300"
												>
													{record.data.username}
												</button>
												{#if record.data.smurf}
													<span class="pointer-events-none relative z-20 ml-1 inline-flex align-middle">
														<VenetianMask class="h-5 w-5" aria-hidden="true" />
														<span class="sr-only">Smurf account</span>
													</span>
												{/if}
											</Table.Cell>
											<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-zinc-200 text-lg">
												{record.record}
											</Table.Cell>
											<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-zinc-300">
												{toTime(record.data.duration)}
											</Table.Cell>
											<Table.Cell class="px-2 py-2">
												<div class="pointer-events-none relative z-20 flex min-w-0 items-center gap-2">
													<img
														src={record.data.hero.img}
														alt=""
														class="h-7 w-10 rounded-sm object-cover"
													/>
													<span class="max-w-24 truncate font-medium text-zinc-100">
														{record.data.hero.name}
													</span>
												</div>
											</Table.Cell>
											<Table.Cell class="px-2 py-2 text-center">
												<Tooltip.Root>
													<Tooltip.Trigger class="relative z-20 inline-flex rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
														<img
															src={getRoleIcon(record.data.role)}
															alt=""
															class="h-7 w-7"
														/>
													</Tooltip.Trigger>
													<Tooltip.Content class="text-xs">{getRoleName(record.data.role)}</Tooltip.Content>
												</Tooltip.Root>
											</Table.Cell>
											<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-green-400">
												{record.data.kills}
											</Table.Cell>
											<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-red-400">
												{record.data.deaths}
											</Table.Cell>
											<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-cyan-300">
												{record.data.assists}
											</Table.Cell>
											<Table.Cell class="px-2 py-2 text-center">
												<Tooltip.Root>
													<Tooltip.Trigger
														class={`relative z-20 inline-flex min-w-10 justify-center rounded-md px-2 py-0.5 font-display text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring ${getImpactClass(record.data.impact)}`}
													>
														{calcImpact(record.data.impact)}
													</Tooltip.Trigger>
													<Tooltip.Content class="w-72 text-xs">
														<div class="mb-2 text-center font-medium">
															Impact Rating: {record.data.impact}
														</div>
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
																	<Table.Cell class="px-2 py-1">Death</Table.Cell>
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
												{dayjs(record.data.startTime * 1000 + record.data.duration * 1000).from(dayjs())}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
