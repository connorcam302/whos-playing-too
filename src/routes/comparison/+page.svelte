<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import { DATE_RANGE_PRESETS, DOTA_MAJOR_PATCHES } from '$lib/data/dotaPatchRanges';
	import { getRoleIcon, getRoleName, toTime } from '$lib/functions';
	import { goto } from '$app/navigation';
	import { Plus, VenetianMask, X } from 'lucide-svelte';

	type PlayerOption = {
		id: number;
		username: string;
	};
	type HeroOption = {
		id: number;
		name: string;
		img?: string;
	};
	type PlayerStats = {
		id: number;
		username: string;
		wins: number;
		losses: number;
		rankedWins: number;
		rankedLosses: number;
		kills: number;
		deaths: number;
		assists: number;
		lastHits: number;
		heroDamage: number;
		towerDamage: number;
		gpm: number;
		xpm: number;
		impact: number;
		duration: number;
		roleDistribution: { role: number; count: number }[];
		mostPlayedHeroes: { count: number; hero: HeroOption }[];
		versatility: number;
	};
	type Props = {
		data: {
			playerList: PlayerOption[];
			heroList: HeroOption[];
		};
	};

	let { data }: Props = $props();
	let selectedPlayers = $state<string[]>([]);
	let selectedRoles = $state(['1', '2', '3', '4', '5']);
	let selectedHero = $state('-1');
	let selectedDateRange = $state('all');
	let ranked = $state(true);
	let unranked = $state(true);
	let smurfs = $state(false);
	let playerStats = $state<PlayerStats[]>([]);
	let loading = $state(false);
	let playerPickerOpen = $state(false);
	let playerSearch = $state('');

	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value || 0);
	const calculateWinRate = (wins: number, losses: number) => {
		const total = wins + losses;
		return total > 0 ? (wins / total) * 100 : 0;
	};
	const makePlayersTrigger = () => {
		if (selectedPlayers.length === 0) return 'Select Players';
		if (selectedPlayers.length === 1) {
			return data.playerList.find((player) => player.id.toString() === selectedPlayers[0])?.username;
		}
		return `${selectedPlayers.length} Players`;
	};
	const makeRolesTrigger = () => {
		if (selectedRoles.length === 0 || selectedRoles.length === 5) return 'All Roles';
		if (selectedRoles.length === 1) return getRoleName(selectedRoles[0]);
		return `${selectedRoles.length} Roles`;
	};
	const makeHeroTrigger = () => {
		if (selectedHero === '-1') return 'All Heroes';
		return data.heroList.find((hero) => hero.id.toString() === selectedHero)?.name ?? 'All Heroes';
	};
	const makeDateTrigger = () => {
		const preset = DATE_RANGE_PRESETS.find((range) => range.value === selectedDateRange);
		if (preset) return preset.label;
		return (
			DOTA_MAJOR_PATCHES.find((patch) => `patch-${patch.version}` === selectedDateRange)?.label ??
			'All Time'
		);
	};
	const fetchPlayerData = async (playerId: string) => {
		const params = new URLSearchParams();
		params.append('roles', `[${selectedRoles.join(',')}]`);
		params.append('lobby', `[${ranked ? 7 : -1},${unranked ? 0 : -1}]`);
		params.append('time', '9999');
		params.append('dateRange', selectedDateRange);
		params.append('hero', selectedHero);
		params.append('smurf', smurfs.toString());

		const response = await fetch(`/api/stats/${playerId}?${params.toString()}`);
		return (await response.json()) as PlayerStats;
	};
	const updatePlayerData = async () => {
		loading = true;
		playerStats = await Promise.all(selectedPlayers.map((playerId) => fetchPlayerData(playerId)));
		loading = false;
	};
	const addPlayer = (playerId: number) => {
		const playerIdString = playerId.toString();
		if (!selectedPlayers.includes(playerIdString)) {
			selectedPlayers = [...selectedPlayers, playerIdString];
		}
	};
	const addPlayers = (players: PlayerOption[]) => {
		const currentPlayerIds = new Set(selectedPlayers);
		const nextPlayerIds = players.reduce((ids, player) => {
			ids.add(player.id.toString());
			return ids;
		}, currentPlayerIds);
		selectedPlayers = Array.from(nextPlayerIds);
	};
	const removePlayer = (playerId: number) => {
		selectedPlayers = selectedPlayers.filter((id) => id !== playerId.toString());
	};
	const availablePlayers = $derived(
		data.playerList.filter((player) => !selectedPlayers.includes(player.id.toString()))
	);
	const filteredAvailablePlayers = $derived(
		availablePlayers.filter((player) =>
			player.username.toLowerCase().includes(playerSearch.toLowerCase().trim())
		)
	);
	const visibleAvailablePlayers = $derived(filteredAvailablePlayers.slice(0, 50));
	const selectedPlayerOptions = $derived(
		data.playerList
			.filter((player) => selectedPlayers.includes(player.id.toString()))
			.sort((a, b) => selectedPlayers.indexOf(a.id.toString()) - selectedPlayers.indexOf(b.id.toString()))
	);
	const getRankClass = (player: PlayerStats, stat: keyof PlayerStats) => {
		const values = playerStats
			.map((item) => ({ id: item.id, value: Number(item[stat]) || 0 }))
			.sort((a, b) => (stat === 'deaths' || stat === 'duration' ? a.value - b.value : b.value - a.value));
		const rank = values.findIndex((item) => item.id === player.id);
		if (rank === 0) return 'bg-yellow-500/10 text-yellow-200';
		if (rank === 1) return 'bg-zinc-400/10 text-zinc-200';
		if (rank === 2) return 'bg-amber-700/10 text-amber-200';
		return 'text-zinc-300';
	};

	$effect(() => {
		selectedPlayers;
		selectedRoles;
		selectedHero;
		selectedDateRange;
		ranked;
		unranked;
		smurfs;
		updatePlayerData();
	});
</script>

<svelte:head>
	<title>whos-playing | Comparison</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 sm:px-4">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-zinc-100">Player Comparison</h1>
		<p class="mt-1 text-sm text-zinc-400">Compare filtered player performance side by side.</p>
	</div>

	<div class="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3 lg:grid-cols-4 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto_auto]">
		<div class="flex min-w-0 flex-col gap-1">
			<div class="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
				<span>Players</span>
				<button
					class="rounded-sm px-1.5 py-0.5 text-[11px] normal-case tracking-normal text-sky-300 hover:bg-sky-500/10 hover:text-sky-200"
					onclick={() => (playerPickerOpen = true)}
				>
					Add
				</button>
			</div>
			<Select.Root type="multiple" bind:value={selectedPlayers}>
				<Select.Trigger class="w-full">{makePlayersTrigger()}</Select.Trigger>
				<Select.Content>
					{#each data.playerList as player}
						<Select.Item value={player.id.toString()} label={player.username}>{player.username}</Select.Item>
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
					{#each data.heroList as hero}
						<Select.Item value={hero.id.toString()} label={hero.name}>{hero.name}</Select.Item>
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
			<div class="flex gap-1">
				<Toggle bind:pressed={ranked} class="h-10 border px-3 data-[state=on]:bg-sky-600">Ranked</Toggle>
				<Toggle bind:pressed={unranked} class="h-10 border px-3 data-[state=on]:bg-sky-600">Unranked</Toggle>
			</div>
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Smurfs</div>
			<Toggle bind:pressed={smurfs} class="h-10 border px-3 data-[state=on]:bg-sky-600">
				<VenetianMask class="h-5 w-5" />
			</Toggle>
		</div>
	</div>

	{#if selectedPlayers.length === 0}
		<div class="rounded-md border border-dashed border-zinc-800 px-6 py-12 text-center text-sm text-zinc-400">
			<Plus class="mx-auto mb-3 h-8 w-8 text-zinc-500" />
			<div>Select players to compare.</div>
			<button
				class="mt-4 inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
				onclick={() => (playerPickerOpen = true)}
			>
				<Plus class="h-4 w-4" />
				Add Players
			</button>
		</div>
	{:else if loading}
		<div class="rounded-md border border-zinc-800 px-6 py-12 text-center text-sm text-zinc-400">
			Loading comparison...
		</div>
	{:else}
		<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
			{#each playerStats as player}
				<Card.Root class="overflow-hidden">
					<Card.Header class="border-b border-zinc-800 pb-3">
						<div class="flex items-start justify-between gap-3">
							<button
								class="text-left text-xl font-semibold text-zinc-100 hover:text-sky-300"
								onclick={() => goto(`/player/${player.id}`)}
							>
								{player.username}
							</button>
							<button
								class="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
								onclick={() => removePlayer(player.id)}
								aria-label={`Remove ${player.username}`}
							>
								<X class="h-4 w-4" />
							</button>
						</div>
						<Card.Description>
							{player.wins + player.losses} matches, {formatNumber(calculateWinRate(player.wins, player.losses), 1)}% winrate
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4 p-4">
						<div class="grid grid-cols-3 gap-2">
							<div class="rounded-md border border-zinc-800 bg-zinc-950/60 p-2">
								<div class="text-xs text-zinc-500">Impact</div>
								<div class="text-lg font-semibold">{formatNumber(player.impact)}</div>
							</div>
							<div class="rounded-md border border-zinc-800 bg-zinc-950/60 p-2">
								<div class="text-xs text-zinc-500">KDA</div>
								<div class="text-lg font-semibold">
									{formatNumber((player.kills + player.assists) / Math.max(player.deaths, 1), 2)}
								</div>
							</div>
							<div class="rounded-md border border-zinc-800 bg-zinc-950/60 p-2">
								<div class="text-xs text-zinc-500">Duration</div>
								<div class="text-lg font-semibold">{toTime(Math.round(player.duration || 0))}</div>
							</div>
						</div>
						<div class="space-y-1">
							<div class="flex justify-between text-xs text-zinc-500">
								<span>Overall</span>
								<span>{formatNumber(calculateWinRate(player.wins, player.losses), 1)}%</span>
							</div>
							<div class="h-2 overflow-hidden rounded-full bg-red-500/60">
								<div
									class="h-full bg-green-500"
									style={`width: ${calculateWinRate(player.wins, player.losses)}%`}
								></div>
							</div>
						</div>
						<div class="grid grid-cols-5 gap-1">
							{#each [1, 2, 3, 4, 5] as role}
								{@const count = player.roleDistribution.find((item) => item.role === role)?.count ?? 0}
								<div class="rounded-md bg-zinc-900 p-2 text-center">
									<img src={getRoleIcon(role)} alt="" class="mx-auto h-6 w-6" />
									<div class="mt-1 text-xs text-zinc-400">{count}</div>
								</div>
							{/each}
						</div>
						<div class="grid grid-cols-3 overflow-hidden rounded-md border border-zinc-800">
							{#each player.mostPlayedHeroes ?? [] as hero}
								<div class="relative h-12 bg-zinc-900">
									{#if hero?.hero}
										<img src={hero.hero.img} alt={hero.hero.name} class="h-full w-full object-cover" />
										<div class="absolute right-1 bottom-1 rounded bg-zinc-950/80 px-1 text-xs">
											{hero.count}
										</div>
									{/if}
								</div>
							{/each}
						</div>
						<table class="w-full text-sm">
							<tbody>
								{#each [
									['Kills', 'kills'],
									['Deaths', 'deaths'],
									['Assists', 'assists'],
									['GPM', 'gpm'],
									['XPM', 'xpm'],
									['Hero DMG', 'heroDamage'],
									['Tower DMG', 'towerDamage'],
									['Versatility', 'versatility']
								] as [label, stat]}
									<tr class="border-t border-zinc-900">
										<td class="py-1.5 text-zinc-400">{label}</td>
										<td class={`py-1.5 text-right ${getRankClass(player, stat as keyof PlayerStats)}`}>
											{formatNumber(Number(player[stat as keyof PlayerStats]) || 0, 1)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}

	{#if playerPickerOpen}
		<div
			class="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/70 px-3 pt-24"
			onclick={() => (playerPickerOpen = false)}
			onkeydown={(event) => {
				if (event.key === 'Escape') playerPickerOpen = false;
			}}
			role="presentation"
		>
			<div
				class="w-full max-w-md rounded-md border border-zinc-800 bg-zinc-950 shadow-xl"
				onclick={(event) => event.stopPropagation()}
				onkeydown={(event) => event.stopPropagation()}
				role="presentation"
			>
				<div class="flex items-center justify-between border-b border-zinc-800 p-3">
					<div>
						<div class="font-medium text-zinc-100">Add Players</div>
						<div class="text-xs text-zinc-500">
							{selectedPlayers.length} selected, {availablePlayers.length} available.
						</div>
					</div>
					<button
						class="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
						onclick={() => (playerPickerOpen = false)}
						aria-label="Close player picker"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
				<div class="space-y-3 p-3">
					<input
						class="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-sky-500"
						placeholder="Search players"
						bind:value={playerSearch}
					/>
					{#if selectedPlayerOptions.length > 0}
						<div class="flex max-h-24 flex-wrap gap-1 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950/70 p-2">
							{#each selectedPlayerOptions as player}
								<button
									class="inline-flex max-w-full items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
									onclick={() => removePlayer(player.id)}
									aria-label={`Remove ${player.username}`}
								>
									<span class="truncate">{player.username}</span>
									<X class="h-3 w-3 text-zinc-500" />
								</button>
							{/each}
						</div>
					{/if}
					<div class="flex flex-wrap items-center gap-2">
						<button
							class="rounded-md border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={filteredAvailablePlayers.length === 0}
							onclick={() => addPlayers(filteredAvailablePlayers)}
						>
							Add Matching ({filteredAvailablePlayers.length})
						</button>
						<button
							class="rounded-md border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={availablePlayers.length === 0}
							onclick={() => addPlayers(availablePlayers)}
						>
							Add All ({availablePlayers.length})
						</button>
						{#if selectedPlayers.length > 0}
							<button
								class="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
								onclick={() => (selectedPlayers = [])}
							>
								Clear
							</button>
						{/if}
					</div>
					<div class="max-h-80 overflow-y-auto rounded-md border border-zinc-800">
						{#if filteredAvailablePlayers.length === 0}
							<div class="p-4 text-sm text-zinc-500">No available players match that search.</div>
						{:else}
							{#each visibleAvailablePlayers as player}
								<button
									class="flex w-full items-center justify-between gap-3 border-b border-zinc-900 px-3 py-2 text-left text-sm text-zinc-200 last:border-0 hover:bg-zinc-900"
									onclick={() => addPlayer(player.id)}
								>
									<span class="truncate">{player.username}</span>
									<Plus class="h-4 w-4 text-zinc-500" />
								</button>
							{/each}
							{#if filteredAvailablePlayers.length > visibleAvailablePlayers.length}
								<div class="border-t border-zinc-900 p-3 text-xs text-zinc-500">
									Showing first {visibleAvailablePlayers.length}. Use search or Add Matching to include all
									{filteredAvailablePlayers.length}.
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
