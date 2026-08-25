<script lang="ts">
	import { formatHeroScore } from '$lib/heroScores';
	import { getRoleIcon, getRoleName } from '$lib/functions';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		ArrowUpDown,
		Clock3,
		Gauge,
		HelpCircle,
		Search,
		ShieldCheck,
		Target,
		TrendingDown,
		TrendingUp
	} from 'lucide-svelte';

	type HeroMetadata = {
		id: number;
		name: string;
		localized_name?: string;
		img: string;
		roles?: string[];
	};

	type OwnershipPlayer = {
		playerId: number;
		username: string;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		primaryRole: number;
		scoreGroup: 'core' | 'support';
		score: number;
		confidence: string;
		lastPlayed: number;
	};

	type HeroRanking = {
		heroId: number;
		ownership: {
			rank: number | null;
			totalRankedPlayers: number;
			player: OwnershipPlayer | null;
			owner: OwnershipPlayer | null;
			challenger: OwnershipPlayer | null;
			nextPosition: OwnershipPlayer | null;
			scoreChange: number | null;
		};
	};

	type OwnershipChange = {
		hero: { id: number; name: string; img: string };
		previousOwner: OwnershipPlayer | null;
		currentOwner: OwnershipPlayer;
		changeType: 'changed' | 'new';
	};

	type OwnershipStatus = 'owned' | 'chasing' | 'calibrating';
	type OwnershipFilter = 'all' | OwnershipStatus;
	type SortKey =
		| 'hero'
		| 'position'
		| 'score'
		| 'gapFirst'
		| 'gapNext'
		| 'recent'
		| 'evidence';

	type OwnershipRow = {
		hero: HeroMetadata;
		status: OwnershipStatus;
		rank: number | null;
		totalRankedPlayers: number;
		player: OwnershipPlayer;
		owner: OwnershipPlayer | null;
		nextPosition: OwnershipPlayer | null;
		gapToFirst: number | null;
		gapToNextPosition: number | null;
		gamesToCalibrate: number;
		scoreChange: number | null;
	};

	type Props = {
		data: {
			player: { id: number; username: string };
			heroList: HeroMetadata[];
			playerHeroRankings: Promise<HeroRanking[]> | HeroRanking[];
			playerOwnershipChanges: Promise<OwnershipChange[]> | OwnershipChange[];
		};
	};

	let { data }: Props = $props();
	let searchQuery = $state('');
	let activeFilter = $state<OwnershipFilter>('all');
	let sortKey = $state<SortKey>('position');
	let sortDescending = $state(false);

	const getHeroName = (hero: HeroMetadata) => hero.localized_name ?? hero.name;
	const getSignedScore = (value: number) => `${value > 0 ? '+' : ''}${formatHeroScore(value)}`;
	const getScoreChangeClass = (value: number | null) => {
		if (!value) return 'text-zinc-500';
		return value > 0 ? 'text-emerald-300' : 'text-red-300';
	};
	const getLastPlayedLabel = (timestamp: number) => {
		if (!timestamp) return 'Never';
		const days = Math.max(0, Math.floor((Date.now() / 1000 - timestamp) / 86400));
		if (days < 1) return 'Today';
		if (days < 2) return 'Yesterday';
		if (days < 30) return `${days}d ago`;
		if (days < 365) return `${Math.floor(days / 30)}mo ago`;
		return `${Math.floor(days / 365)}y ago`;
	};

	const getOwnershipRows = (rankings: HeroRanking[]) => {
		const heroById = new Map(data.heroList.map((hero) => [hero.id, hero]));

		return rankings
			.map((ranking): OwnershipRow | null => {
				const hero = heroById.get(ranking.heroId);
				const player = ranking.ownership.player;
				if (!hero || !player) return null;

				const isOwned = ranking.ownership.owner?.playerId === data.player.id;
				const isCalibrated = ranking.ownership.rank !== null;
				const status: OwnershipStatus = isOwned
					? 'owned'
					: isCalibrated
						? 'chasing'
						: 'calibrating';
				const owner = ranking.ownership.owner;
				const nextPosition = ranking.ownership.nextPosition;

				return {
					hero,
					status,
					rank: ranking.ownership.rank,
					totalRankedPlayers: ranking.ownership.totalRankedPlayers,
					player,
					owner,
					nextPosition,
					gapToFirst: isCalibrated && owner ? Math.abs(player.score - owner.score) : null,
					gapToNextPosition:
						isCalibrated && nextPosition
							? Math.abs(player.score - nextPosition.score)
							: null,
					gamesToCalibrate: Math.max(0, 10 - player.matches),
					scoreChange: ranking.ownership.scoreChange
				};
			})
			.filter((row): row is OwnershipRow => row !== null);
	};

	const getSortValue = (row: OwnershipRow): string | number => {
		if (sortKey === 'hero') return getHeroName(row.hero);
		if (sortKey === 'position') return row.rank ?? Number.MAX_SAFE_INTEGER;
		if (sortKey === 'score') return row.player.score;
		if (sortKey === 'gapFirst') return row.gapToFirst ?? Number.MAX_SAFE_INTEGER;
		if (sortKey === 'gapNext') return row.gapToNextPosition ?? Number.MAX_SAFE_INTEGER;
		if (sortKey === 'recent') return row.player.lastPlayed;
		return row.player.matches;
	};

	const setSort = (key: SortKey) => {
		if (sortKey === key) {
			sortDescending = !sortDescending;
			return;
		}
		sortKey = key;
		sortDescending = ['score', 'recent', 'evidence'].includes(key);
	};

	const getVisibleRows = (rows: OwnershipRow[]) => {
		const query = searchQuery.trim().toLowerCase();
		return rows
			.filter((row) => activeFilter === 'all' || row.status === activeFilter)
			.filter((row) => {
				if (!query) return true;
				return [getHeroName(row.hero), getRoleName(row.player.primaryRole), ...(row.hero.roles ?? [])]
					.filter(Boolean)
					.some((value) => String(value).toLowerCase().includes(query));
			})
			.slice()
			.sort((a, b) => {
				const isMissing = (row: OwnershipRow) => {
					if (sortKey === 'position') return row.rank === null;
					if (sortKey === 'gapFirst') return row.gapToFirst === null;
					if (sortKey === 'gapNext') return row.gapToNextPosition === null;
					return false;
				};
				const missingA = isMissing(a);
				const missingB = isMissing(b);
				if (missingA !== missingB) return missingA ? 1 : -1;
				const valueA = getSortValue(a);
				const valueB = getSortValue(b);
				const comparison =
					typeof valueA === 'string' || typeof valueB === 'string'
						? String(valueA).localeCompare(String(valueB))
						: Number(valueA) - Number(valueB);
				return sortDescending ? -comparison : comparison;
			});
	};

	const getStatusClass = (status: OwnershipStatus) => {
		if (status === 'owned') return 'border-emerald-800/80 bg-emerald-950/35 text-emerald-300';
		if (status === 'chasing') return 'border-sky-800/80 bg-sky-950/35 text-sky-300';
		return 'border-zinc-700 bg-zinc-900 text-zinc-400';
	};

	const getPositionLabel = (row: OwnershipRow) =>
		row.rank === null ? 'Uncalibrated' : `#${row.rank} of ${row.totalRankedPlayers}`;
	const getGapLabel = (gap: number | null) => (gap === null ? 'N/A' : formatHeroScore(gap));

	const clearView = () => {
		searchQuery = '';
		activeFilter = 'all';
	};

	const filters: { id: OwnershipFilter; label: string }[] = [
		{ id: 'all', label: 'All' },
		{ id: 'owned', label: 'Owned' },
		{ id: 'chasing', label: 'Chasing' },
		{ id: 'calibrating', label: 'Calibrating' }
	];

</script>

<div class="flex w-full min-w-0 flex-col gap-4">
	{#await data.playerHeroRankings}
		<Card.Root class="rounded-md shadow-none" aria-label="Loading hero ownership">
			<Card.Content class="p-4">
			<Skeleton class="h-5 w-32 rounded-sm" />
			<div class="mt-4 grid gap-px overflow-hidden rounded-sm bg-zinc-800 md:grid-cols-3">
				{#each Array(3) as _}<Skeleton class="h-24 rounded-none bg-zinc-900/80" />{/each}
			</div>
			</Card.Content>
		</Card.Root>
	{:then rankingData}
		{@const rows = getOwnershipRows(rankingData ?? [])}
		{@const visibleRows = getVisibleRows(rows)}
		{@const ownedRows = rows.filter((row) => row.status === 'owned')}
		{@const chasingRows = rows.filter((row) => row.status === 'chasing')}
		{@const calibratingRows = rows.filter((row) => row.status === 'calibrating')}
		{@const ownedRowsByLead = ownedRows.slice().sort((a, b) => (a.gapToNextPosition ?? Infinity) - (b.gapToNextPosition ?? Infinity))}
		{@const closestClaim = chasingRows.slice().sort((a, b) => (a.gapToFirst ?? Infinity) - (b.gapToFirst ?? Infinity))[0]}
		{@const tightestDefence = ownedRowsByLead[0]}
		{@const nearestCalibration = calibratingRows.slice().sort((a, b) => a.gamesToCalibrate - b.gamesToCalibrate || b.player.score - a.player.score)[0]}

		<Card.Root class="overflow-hidden rounded-md shadow-none" aria-labelledby="owned-heroes-heading">
			<Card.Header class="flex-row items-center justify-between gap-3 space-y-0 border-b border-zinc-800 px-4 py-3">
				<div>
					<Card.Title id="owned-heroes-heading" level={2} class="text-base text-zinc-100">Owned heroes</Card.Title>
					<Card.Description class="mt-0.5 text-xs text-zinc-500">Heroes where {data.player.username} currently holds first position.</Card.Description>
				</div>
				<Badge variant="outline" class="rounded-sm border-emerald-800/80 bg-emerald-950/35 px-2 py-1 text-sm tabular-nums text-emerald-300">{ownedRows.length}</Badge>
			</Card.Header>
			{#if ownedRowsByLead.length > 0}
				<Card.Content class="flex gap-2 overflow-x-auto p-3">
					{#each ownedRowsByLead as row (row.hero.id)}
						<a href={`/heroes/${row.hero.id}`} class="group flex w-40 shrink-0 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/45 p-2 outline-none transition-colors hover:border-zinc-700 hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-ring">
							<img src={row.hero.img} alt="" class="h-10 w-14 shrink-0 rounded-sm border border-zinc-700 object-cover" />
							<span class="min-w-0"><span class="block truncate text-sm font-medium text-zinc-200 group-hover:text-sky-300">{getHeroName(row.hero)}</span><span class="mt-0.5 block truncate text-xs tabular-nums text-zinc-500">{row.gapToNextPosition === null ? 'No challenger' : `+${formatHeroScore(row.gapToNextPosition)} lead`}</span></span>
						</a>
					{/each}
				</Card.Content>
			{:else}
				<Card.Content class="px-4 py-6 text-sm text-zinc-500">No heroes are currently owned.</Card.Content>
			{/if}
		</Card.Root>

		<Card.Root class="overflow-hidden rounded-md shadow-none">
			<Card.Header class="flex-row items-start justify-between gap-4 space-y-0 border-b border-zinc-800 px-4 py-3">
				<div>
					<div class="flex items-center gap-2">
						<Card.Title level={2} class="text-base text-zinc-100">Next moves</Card.Title>
						<Tooltip.Root>
							<Tooltip.Trigger aria-label="How hero ownership works" class="rounded-sm text-zinc-500 outline-none hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-ring"><HelpCircle class="h-4 w-4" /></Tooltip.Trigger>
							<Tooltip.Content class="max-w-80 text-xs">Ownership goes to the highest calibrated core or support score. Ten games in that score group are required to qualify.</Tooltip.Content>
						</Tooltip.Root>
					</div>
					<Card.Description class="mt-0.5 text-xs text-zinc-500">The clearest claim, defence, and calibration available now.</Card.Description>
				</div>
			</Card.Header>

			<Card.Content class="grid divide-y divide-zinc-800 p-0 md:grid-cols-3 md:divide-x md:divide-y-0">
				{#if closestClaim}
					<a href={`/heroes/${closestClaim.hero.id}`} class="group flex min-h-24 items-center gap-3 p-3 outline-none transition-colors hover:bg-zinc-900/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
						<img src={closestClaim.hero.img} alt="" class="h-12 w-20 shrink-0 rounded-sm border border-zinc-700 object-cover" />
						<div class="min-w-0"><div class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-sky-400"><Target class="h-3.5 w-3.5" /> Claim next</div><div class="mt-1 truncate font-semibold text-zinc-100 group-hover:text-sky-300">{getHeroName(closestClaim.hero)}</div><div class="mt-0.5 truncate text-xs text-zinc-500">{formatHeroScore(closestClaim.gapToFirst ?? 0)} behind {closestClaim.owner?.username}</div></div>
					</a>
				{:else}<div class="flex min-h-24 items-center px-4 text-sm text-zinc-500">No calibrated claim yet.</div>{/if}

				{#if tightestDefence}
					<a href={`/heroes/${tightestDefence.hero.id}`} class="group flex min-h-24 items-center gap-3 p-3 outline-none transition-colors hover:bg-zinc-900/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
						<img src={tightestDefence.hero.img} alt="" class="h-12 w-20 shrink-0 rounded-sm border border-zinc-700 object-cover" />
						<div class="min-w-0"><div class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-emerald-400"><ShieldCheck class="h-3.5 w-3.5" /> Protect</div><div class="mt-1 truncate font-semibold text-zinc-100 group-hover:text-sky-300">{getHeroName(tightestDefence.hero)}</div><div class="mt-0.5 truncate text-xs text-zinc-500">+{formatHeroScore(tightestDefence.gapToNextPosition ?? 0)} over {tightestDefence.nextPosition?.username}</div></div>
					</a>
				{:else}<div class="flex min-h-24 items-center px-4 text-sm text-zinc-500">No ownership is under threat.</div>{/if}

				{#if nearestCalibration}
					<a href={`/heroes/${nearestCalibration.hero.id}`} class="group flex min-h-24 items-center gap-3 p-3 outline-none transition-colors hover:bg-zinc-900/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
						<img src={nearestCalibration.hero.img} alt="" class="h-12 w-20 shrink-0 rounded-sm border border-zinc-700 object-cover" />
						<div class="min-w-0"><div class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400"><Gauge class="h-3.5 w-3.5" /> Calibrate</div><div class="mt-1 truncate font-semibold text-zinc-100 group-hover:text-sky-300">{getHeroName(nearestCalibration.hero)}</div><div class="mt-0.5 truncate text-xs text-zinc-500">{nearestCalibration.player.matches} / 10 {nearestCalibration.player.scoreGroup} games</div></div>
					</a>
				{:else}<div class="flex min-h-24 items-center px-4 text-sm text-zinc-500">Every played hero is calibrated.</div>{/if}
			</Card.Content>
		</Card.Root>

		{#await data.playerOwnershipChanges}
			<Skeleton class="h-14 rounded-md border border-border" />
		{:then changes}
			{#if changes.length > 0}
				<Card.Root class="overflow-hidden rounded-md shadow-none">
					<Card.Header class="flex-row items-center justify-between gap-3 space-y-0 border-b border-zinc-800 px-4 py-2.5"><Card.Title level={2} class="text-sm text-zinc-100">Recent movement</Card.Title><Card.Description class="text-xs text-zinc-500">Last 20 group matches</Card.Description></Card.Header>
					<Card.Content class="divide-y divide-zinc-800 p-0 sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0">
						{#each changes.slice(0, 4) as change}
							{@const gained = change.currentOwner.playerId === data.player.id}
							<a href={`/heroes/${change.hero.id}`} class="flex min-h-16 items-center gap-3 px-3 py-2 outline-none transition-colors hover:bg-zinc-900/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
								<img src={change.hero.img} alt="" class="h-9 w-14 shrink-0 rounded-sm border border-zinc-700 object-cover" />
								{#if gained}<TrendingUp class="h-4 w-4 shrink-0 text-emerald-400" />{:else}<TrendingDown class="h-4 w-4 shrink-0 text-red-400" />{/if}
								<div class="min-w-0"><div class="truncate text-sm font-medium text-zinc-200">{gained ? 'Claimed' : 'Lost'} {change.hero.name}</div><div class="truncate text-xs text-zinc-500">{gained ? change.previousOwner ? `from ${change.previousOwner.username}` : 'First calibrated owner' : `to ${change.currentOwner.username}`}</div></div>
							</a>
						{/each}
					</Card.Content>
				</Card.Root>
			{/if}
		{/await}

		<Card.Root class="overflow-hidden rounded-md shadow-none">
			<Card.Header class="border-b border-zinc-800 p-3">
				<div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div class="flex min-w-0 flex-wrap gap-1" aria-label="Filter hero ownership">
						{#each filters as filter}
							<Button variant="ghost" size="sm" onclick={() => (activeFilter = filter.id)} aria-pressed={activeFilter === filter.id} class="min-h-11 shrink-0 px-3 text-xs {activeFilter === filter.id ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-800' : 'text-zinc-500'}">{filter.label}<span class="tabular-nums text-zinc-600">{filter.id === 'all' ? rows.length : rows.filter((row) => row.status === filter.id).length}</span></Button>
						{/each}
					</div>
					<div class="w-full sm:w-64">
						<label class="relative min-w-0 flex-1 sm:w-64"><span class="sr-only">Search ownership by hero or position</span><Search class="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-500" /><Input bind:value={searchQuery} type="search" placeholder="Search hero or position" class="h-11 bg-zinc-950 pl-9 text-zinc-100 placeholder:text-zinc-600" /></label>
					</div>
				</div>
			</Card.Header>

			<Card.Content class="p-0">
			<div class="hidden overflow-x-auto md:block">
				<Table.Root class="min-w-[1080px]">
					<Table.Header class="bg-zinc-950/60"><Table.Row class="border-zinc-800 hover:bg-transparent">
						<Table.Head class="h-9 min-w-52 px-3"><Button variant="ghost" size="sm" onclick={() => setSort('hero')} class="h-8 gap-1 px-0 text-xs uppercase tracking-wide text-zinc-400 hover:bg-transparent hover:text-zinc-100">Hero<ArrowUpDown class="h-3 w-3" /></Button></Table.Head>
						<Table.Head class="h-9 min-w-36 px-2"><Button variant="ghost" size="sm" onclick={() => setSort('position')} class="h-8 gap-1 px-0 text-xs uppercase tracking-wide text-zinc-400 hover:bg-transparent hover:text-zinc-100">Position<ArrowUpDown class="h-3 w-3" /></Button></Table.Head>
						<Table.Head class="h-9 px-2 text-right"><Button variant="ghost" size="sm" onclick={() => setSort('score')} class="ml-auto h-8 gap-1 px-0 text-xs uppercase tracking-wide text-zinc-400 hover:bg-transparent hover:text-zinc-100">Score<ArrowUpDown class="h-3 w-3" /></Button></Table.Head>
						<Table.Head class="h-9 min-w-36 px-2 text-right"><Button variant="ghost" size="sm" onclick={() => setSort('gapFirst')} class="ml-auto h-8 gap-1 px-0 text-xs uppercase tracking-wide text-zinc-400 hover:bg-transparent hover:text-zinc-100">Gap to first<ArrowUpDown class="h-3 w-3" /></Button></Table.Head>
						<Table.Head class="h-9 min-w-44 px-2 text-right"><Button variant="ghost" size="sm" onclick={() => setSort('gapNext')} class="ml-auto h-8 gap-1 px-0 text-xs uppercase tracking-wide text-zinc-400 hover:bg-transparent hover:text-zinc-100">Gap to next position<ArrowUpDown class="h-3 w-3" /></Button></Table.Head>
						<Table.Head class="h-9 px-2 text-right"><Button variant="ghost" size="sm" onclick={() => setSort('recent')} class="ml-auto h-8 gap-1 px-0 text-xs uppercase tracking-wide text-zinc-400 hover:bg-transparent hover:text-zinc-100">Last played<ArrowUpDown class="h-3 w-3" /></Button></Table.Head>
						<Table.Head class="h-9 px-3 text-right"><Button variant="ghost" size="sm" onclick={() => setSort('evidence')} class="ml-auto h-8 gap-1 px-0 text-xs uppercase tracking-wide text-zinc-400 hover:bg-transparent hover:text-zinc-100">Evidence<ArrowUpDown class="h-3 w-3" /></Button></Table.Head>
					</Table.Row></Table.Header>
					<Table.Body>
						{#each visibleRows as row (row.hero.id)}
							<Table.Row class="border-zinc-900 transition-colors hover:bg-zinc-900/70">
								<Table.Cell class="px-3 py-2"><a href={`/heroes/${row.hero.id}`} class="group flex items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><img src={row.hero.img} alt="" class="h-10 w-16 shrink-0 rounded-sm border border-zinc-700 object-cover" /><span class="min-w-0"><span class="block truncate font-medium text-zinc-100 group-hover:text-sky-300">{getHeroName(row.hero)}</span><span class="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500"><img src={getRoleIcon(row.player.primaryRole)} alt="" class="h-4 w-4" />{getRoleName(row.player.primaryRole)} · {row.player.scoreGroup}</span></span></a></Table.Cell>
								<Table.Cell class="px-2 py-2"><Badge variant="outline" class="rounded-sm px-1.5 py-0.5 tabular-nums {getStatusClass(row.status)}">{getPositionLabel(row)}</Badge>{#if row.rank === null}<Progress value={row.player.matches} max={10} class="mt-1.5 h-1.5 max-w-32 bg-zinc-800 [&>div]:bg-sky-500" /><div class="mt-1 text-xs tabular-nums text-zinc-500">{row.player.matches} / 10 games</div>{/if}</Table.Cell>
								<Table.Cell class="px-2 py-2 text-right"><div class="font-semibold tabular-nums text-zinc-100">{formatHeroScore(row.player.score)}</div><div class="mt-0.5 text-xs tabular-nums {getScoreChangeClass(row.scoreChange)}">{row.scoreChange === null ? 'No prior game' : `${getSignedScore(row.scoreChange)} last game`}</div></Table.Cell>
								<Table.Cell class="px-2 py-2 text-right"><div class="font-medium tabular-nums text-zinc-200">{getGapLabel(row.gapToFirst)}</div><div class="mt-0.5 truncate text-xs text-zinc-500">{row.rank === 1 ? 'Leader' : row.owner ? `${row.owner.username} in first` : 'Not calibrated'}</div></Table.Cell>
								<Table.Cell class="px-2 py-2 text-right"><div class="font-medium tabular-nums text-zinc-200">{getGapLabel(row.gapToNextPosition)}</div><div class="mt-0.5 truncate text-xs text-zinc-500">{row.nextPosition ? `${row.nextPosition.username} ${row.rank === 1 ? 'below' : 'above'}` : 'No adjacent player'}</div></Table.Cell>
								<Table.Cell class="px-2 py-2 text-right"><div class="inline-flex items-center gap-1.5 text-sm text-zinc-300"><Clock3 class="h-3.5 w-3.5 text-zinc-500" />{getLastPlayedLabel(row.player.lastPlayed)}</div></Table.Cell>
								<Table.Cell class="px-3 py-2 text-right"><div class="font-medium tabular-nums text-zinc-300">{row.player.matches} {row.player.matches === 1 ? 'game' : 'games'}</div><div class="mt-0.5 text-xs text-zinc-500">{row.player.confidence}</div></Table.Cell>
							</Table.Row>
						{:else}<Table.Row><Table.Cell colspan={7} class="h-32 text-center"><div class="text-sm text-zinc-500">No heroes match this view.</div><Button variant="outline" size="lg" onclick={clearView} class="mt-3">Clear search and filters</Button></Table.Cell></Table.Row>{/each}
					</Table.Body>
				</Table.Root>
			</div>

			<div class="divide-y divide-zinc-800 md:hidden">
				{#each visibleRows as row (row.hero.id)}
					<article class="p-3">
						<div class="flex items-start justify-between gap-3"><a href={`/heroes/${row.hero.id}`} class="flex min-w-0 flex-1 items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><img src={row.hero.img} alt="" class="h-12 w-20 shrink-0 rounded-sm border border-zinc-700 object-cover" /><span class="min-w-0"><span class="block truncate font-medium text-zinc-100">{getHeroName(row.hero)}</span><span class="mt-1 flex items-center gap-1.5 text-xs text-zinc-500"><img src={getRoleIcon(row.player.primaryRole)} alt="" class="h-4 w-4" />{getRoleName(row.player.primaryRole)}</span></span></a><Badge variant="outline" class="shrink-0 rounded-sm px-1.5 py-1 tabular-nums {getStatusClass(row.status)}">{getPositionLabel(row)}</Badge></div>
						<div class="mt-3 grid grid-cols-3 divide-x divide-zinc-800 rounded-sm bg-zinc-950/45 py-2 text-center"><div class="px-2"><div class="text-xs text-zinc-500">Score</div><div class="mt-1 font-semibold tabular-nums text-zinc-100">{formatHeroScore(row.player.score)}</div></div><div class="px-2"><div class="text-xs text-zinc-500">Gap to first</div><div class="mt-1 font-medium tabular-nums text-zinc-200">{getGapLabel(row.gapToFirst)}</div></div><div class="px-2"><div class="text-xs text-zinc-500">Gap to next</div><div class="mt-1 font-medium tabular-nums text-zinc-200">{getGapLabel(row.gapToNextPosition)}</div></div></div>
						<div class="mt-2 text-xs text-zinc-500">{row.nextPosition ? `${row.nextPosition.username} is ${row.rank === 1 ? 'below' : 'above'} you` : row.rank === null ? `${row.player.matches} / 10 games to calibrate` : 'No adjacent ranked player'}</div>
						{#if row.rank === null}<Progress value={row.player.matches} max={10} class="mt-2 h-1.5 bg-zinc-800 [&>div]:bg-sky-500" />{/if}
						<div class="mt-2 flex items-center justify-between gap-3 text-xs text-zinc-500"><span>{row.player.matches} games · {row.player.confidence}</span><span class="inline-flex items-center gap-1"><Clock3 class="h-3.5 w-3.5" />{getLastPlayedLabel(row.player.lastPlayed)}</span></div>
					</article>
				{:else}<div class="px-4 py-10 text-center"><div class="text-sm text-zinc-500">No heroes match this view.</div><Button variant="outline" size="lg" onclick={clearView} class="mt-3">Clear search and filters</Button></div>{/each}
			</div>
			</Card.Content>
		</Card.Root>
	{:catch}
		<Card.Root class="rounded-md text-center shadow-none"><Card.Header class="items-center"><Card.Title level={2} class="text-base text-zinc-100">Ownership could not be loaded</Card.Title><Card.Description class="text-sm text-zinc-400">The ranking data did not respond.</Card.Description></Card.Header><Card.Content class="pt-4"><Button variant="outline" size="lg" onclick={() => window.location.reload()}>Try again</Button></Card.Content></Card.Root>
	{/await}
</div>
