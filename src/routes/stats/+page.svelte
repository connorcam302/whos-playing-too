<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import DashboardSortableTable from '$lib/components/stats/DashboardSortableTable.svelte';
	import StackChemistryMatrix from './StackChemistryMatrix.svelte';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import { getRoleIcon, getRoleName } from '$lib/functions';
	import {
		DATE_RANGE_PRESETS,
		DOTA_MAJOR_PATCHES,
		getDotaPatchForTimestamp
	} from '$lib/data/dotaPatchRanges';
	import { BarChart3, Crosshair, Swords, Trophy, VenetianMask } from 'lucide-svelte';
	import dayjs from 'dayjs';

	type StatRow = {
		playerId: number;
		username: string;
		smurf: boolean;
		matchId: number;
		sequenceNumber: number | null;
		startTime: number;
		duration: number;
		lobby: number;
		gameMode: number;
		winner: string;
		team: string;
		role: number;
		heroId: number;
		heroName: string;
		heroImg: string;
		kills: number;
		deaths: number;
		assists: number;
		impact: number;
		gpm: number | null;
		xpm: number | null;
		lastHits: number | null;
		heroDamage: number | null;
		towerDamage: number | null;
	};

	type Props = {
		data: {
			rows: StatRow[];
			playerList: { id: number; username: string }[];
			heroList: { id: number; name: string; img: string }[];
		};
	};

	let { data }: Props = $props();
	let selectedPlayers = $state(['-1']);
	let selectedHeroes = $state(['-1']);
	let selectedRoles = $state(['1', '2', '3', '4', '5']);
	let selectedDateRange = $state('all');
	let ranked = $state(true);
	let unranked = $state(true);
	let other = $state(true);
	let smurfs = $state(false);
	let wins = $state(true);
	let losses = $state(true);

	const clearFilters = () => {
		selectedPlayers = ['-1'];
		selectedHeroes = ['-1'];
		selectedRoles = ['1', '2', '3', '4', '5'];
		selectedDateRange = 'all';
		ranked = true;
		unranked = true;
		other = true;
		smurfs = false;
		wins = true;
		losses = true;
	};
	const DURATION_BUCKET_SECONDS = 5 * 60;

	const toggleResult = (result: 'wins' | 'losses') => {
		const current = result === 'wins' ? wins : losses;
		if (Number(wins) + Number(losses) > 1 || current === false) {
			if (result === 'wins') wins = !wins;
			if (result === 'losses') losses = !losses;
		}
	};

	const selectedPlayerIds = $derived(selectedPlayers.filter((id) => id !== '-1'));
	const selectedHeroIds = $derived(selectedHeroes.filter((id) => id !== '-1'));
	const selectedPatchVersion = $derived(
		selectedDateRange.startsWith('patch-') ? selectedDateRange.replace('patch-', '') : null
	);
	const dateStart = $derived.by(() => {
		const preset = DATE_RANGE_PRESETS.find((range) => range.value === selectedDateRange);
		if (!preset?.amount || !preset.unit) return null;
		return dayjs().subtract(preset.amount, preset.unit).startOf('day').unix();
	});
	const matchesSelectedPlayers = (row: StatRow) =>
		selectedPlayerIds.length === 0 || selectedPlayerIds.includes(row.playerId.toString());
	const matchesSelectedHeroes = (row: StatRow) =>
		selectedHeroIds.length === 0 || selectedHeroIds.includes(row.heroId.toString());
	const matchesSelectedRoles = (row: StatRow) =>
		selectedRoles.length === 0 || selectedRoles.includes(row.role.toString());
	const matchesContextFilters = (row: StatRow) => {
		const rowWon = row.team === row.winner;
		const matchesLobby =
			(ranked && row.lobby === 7 && row.gameMode === 22) ||
			(unranked && row.lobby === 0 && row.gameMode === 22) ||
			(other && !(row.lobby === 7 && row.gameMode === 22) && !(row.lobby === 0 && row.gameMode === 22));
		const matchesResult = (wins && rowWon) || (losses && !rowWon);
		const matchesSmurf = smurfs || !row.smurf;
		const matchesDate = selectedPatchVersion
			? getDotaPatchForTimestamp(row.startTime)?.version === selectedPatchVersion
			: dateStart === null || row.startTime >= dateStart;
		return matchesLobby && matchesResult && matchesSmurf && matchesDate;
	};
	const matchesAllFilters = (row: StatRow) =>
		matchesSelectedPlayers(row) &&
		matchesSelectedHeroes(row) &&
		matchesSelectedRoles(row) &&
		matchesContextFilters(row);
	const getSideKey = (row: StatRow) => `${row.matchId}:${row.team}`;
	let filteredRows = $derived(data.rows.filter(matchesAllFilters));
	const chemistryRows = $derived.by(() => {
		const contextRows = data.rows.filter(matchesContextFilters);
		const hasAnchorFilters =
			selectedPlayerIds.length > 0 || selectedHeroIds.length > 0 || selectedRoles.length < 5;
		if (!hasAnchorFilters) return contextRows;

		const eligibleSides = new Set(
			contextRows
				.filter(
					(row) =>
						matchesSelectedPlayers(row) && matchesSelectedHeroes(row) && matchesSelectedRoles(row)
				)
				.map(getSideKey)
		);

		return contextRows.filter((row) => eligibleSides.has(getSideKey(row)));
	});
	const average = (rows: StatRow[], getter: (row: StatRow) => number | null) => {
		const values = rows.map(getter).filter((value): value is number => value !== null);
		return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
	};
	const uniqueMatchCount = (rows: StatRow[]) => new Set(rows.map((row) => row.matchId)).size;
	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value || 0);
	const makePlayerTrigger = () => {
		if (selectedPlayerIds.length === 0) return 'All Players';
		if (selectedPlayerIds.length === 1) {
			return data.playerList.find((player) => player.id.toString() === selectedPlayerIds[0])?.username;
		}
		return `${selectedPlayerIds.length} Players`;
	};
	const makeHeroTrigger = () => {
		if (selectedHeroIds.length === 0) return 'All Heroes';
		if (selectedHeroIds.length === 1) {
			return data.heroList.find((hero) => hero.id.toString() === selectedHeroIds[0])?.name;
		}
		return `${selectedHeroIds.length} Heroes`;
	};
	const makeRolesTrigger = () => {
		if (selectedRoles.length === 0 || selectedRoles.length === 5) return 'All Roles';
		if (selectedRoles.length === 1) return getRoleName(selectedRoles[0]);
		return `${selectedRoles.length} Roles`;
	};
	const makeDateTrigger = () => {
		const preset = DATE_RANGE_PRESETS.find((range) => range.value === selectedDateRange);
		if (preset) return preset.label;
		return (
			DOTA_MAJOR_PATCHES.find((patch) => `patch-${patch.version}` === selectedDateRange)?.label ??
			'All Time'
		);
	};
	const byPlayer = $derived(
		Array.from(
			filteredRows
				.reduce((map, row) => {
					const current = map.get(row.playerId) ?? {
						id: row.playerId,
						username: row.username,
						rows: [] as StatRow[]
					};
					current.rows.push(row);
					map.set(row.playerId, current);
					return map;
				}, new Map<number, { id: number; username: string; rows: StatRow[] }>())
				.values()
		)
			.map((player) => {
				const wins = player.rows.filter((row) => row.team === row.winner).length;
				return {
					...player,
					matches: player.rows.length,
					wins,
					losses: player.rows.length - wins,
					winRate: player.rows.length > 0 ? (wins / player.rows.length) * 100 : 0,
					impact: average(player.rows, (row) => row.impact),
					kda:
						(average(player.rows, (row) => row.kills) + average(player.rows, (row) => row.assists)) /
						Math.max(average(player.rows, (row) => row.deaths), 1),
					gpm: average(player.rows, (row) => row.gpm),
					heroDamage: average(player.rows, (row) => row.heroDamage)
				};
			})
			.sort((a, b) => b.matches - a.matches || b.winRate - a.winRate)
	);
	const byHero = $derived.by(() => {
		const rowsByHero = filteredRows.reduce((map, row) => {
			const rows = map.get(row.heroId) ?? [];
			rows.push(row);
			map.set(row.heroId, rows);
			return map;
		}, new Map<number, StatRow[]>());

		return data.heroList
			.map((hero) => {
				const rows = rowsByHero.get(hero.id) ?? [];
				const wins = rows.filter((row) => row.team === row.winner).length;
				return {
					...hero,
					rows,
					matches: rows.length,
					wins,
					losses: rows.length - wins,
					winRate: rows.length > 0 ? (wins / rows.length) * 100 : 0,
					impact: average(rows, (row) => row.impact),
					kda:
						(average(rows, (row) => row.kills) + average(rows, (row) => row.assists)) /
						Math.max(average(rows, (row) => row.deaths), 1)
				};
			})
			.sort((a, b) => b.matches - a.matches || b.winRate - a.winRate);
	});
	const byRole = $derived(
		[1, 2, 3, 4, 5].map((role) => {
			const rows = filteredRows.filter((row) => row.role === role);
			const wins = rows.filter((row) => row.team === row.winner).length;
			const losses = rows.length - wins;
			return {
				role,
				matches: rows.length,
				wins,
				losses,
				winRate: rows.length > 0 ? (wins / rows.length) * 100 : 0,
				impact: average(rows, (row) => row.impact),
				kda:
					(average(rows, (row) => row.kills) + average(rows, (row) => row.assists)) /
					Math.max(average(rows, (row) => row.deaths), 1),
				gpm: average(rows, (row) => row.gpm),
				xpm: average(rows, (row) => row.xpm),
				heroDamage: average(rows, (row) => row.heroDamage),
				avgDuration: average(rows, (row) => row.duration)
			};
		})
	);
	const patchBreakdown = $derived.by(() => {
		const rowsByPatch = filteredRows.reduce((map, row) => {
			const patch = getDotaPatchForTimestamp(row.startTime);
			if (!patch) return map;
			const rows = map.get(patch.version) ?? [];
			rows.push(row);
			map.set(patch.version, rows);
			return map;
		}, new Map<string, StatRow[]>());

		return DOTA_MAJOR_PATCHES.map((patch, index) => {
			const rows = rowsByPatch.get(patch.version) ?? [];
			return {
				patch: patch.version,
				label: patch.label,
				sortValue: index,
				rows
			};
		})
			.map((patch) => {
				const wins = patch.rows.filter((row) => row.team === row.winner).length;
				const losses = patch.rows.length - wins;
				return {
					...patch,
					matches: patch.rows.length,
					wins,
					losses,
					winRate: patch.rows.length ? (wins / patch.rows.length) * 100 : 0,
					impact: average(patch.rows, (row) => row.impact),
					kda:
						(average(patch.rows, (row) => row.kills) + average(patch.rows, (row) => row.assists)) /
						Math.max(average(patch.rows, (row) => row.deaths), 1)
				};
			})
			.sort((a, b) => b.sortValue - a.sortValue);
	});
	const durationBuckets = $derived.by(() => {
		if (filteredRows.length === 0) return [];

		const shortestDuration = Math.min(...filteredRows.map((row) => row.duration));
		const longestDuration = Math.max(...filteredRows.map((row) => row.duration));
		const firstBucketStart =
			Math.floor(shortestDuration / DURATION_BUCKET_SECONDS) * DURATION_BUCKET_SECONDS;
		const lastBucketStart =
			Math.floor(longestDuration / DURATION_BUCKET_SECONDS) * DURATION_BUCKET_SECONDS;
		const buckets = Array.from(
			{ length: (lastBucketStart - firstBucketStart) / DURATION_BUCKET_SECONDS + 1 },
			(_, index) => {
				const min = firstBucketStart + index * DURATION_BUCKET_SECONDS;
				const max = min + DURATION_BUCKET_SECONDS;
				return {
					label: `${Math.floor(min / 60)}m-${Math.floor(max / 60)}m`,
					sortValue: min,
					min,
					max
				};
			}
		);

		return buckets.map((bucket) => {
			const rows = filteredRows.filter((row) => row.duration >= bucket.min && row.duration < bucket.max);
			const wins = rows.filter((row) => row.team === row.winner).length;
			const losses = rows.length - wins;
			return {
				...bucket,
				wins,
				losses,
				matches: rows.length,
				winRate: rows.length ? (wins / rows.length) * 100 : 0,
				impact: average(rows, (row) => row.impact),
				avgDuration: average(rows, (row) => row.duration)
			};
		});
	});
	const trend = $derived(
		Array.from(
			filteredRows
				.reduce((map, row) => {
					const key = dayjs.unix(row.startTime).format('YYYY-MM-DD');
					const current = map.get(key) ?? { date: key, wins: 0, losses: 0 };
					if (row.team === row.winner) current.wins += 1;
					else current.losses += 1;
					map.set(key, current);
					return map;
				}, new Map<string, { date: string; wins: number; losses: number }>())
				.values()
		)
			.sort((a, b) => a.date.localeCompare(b.date))
			.slice(-20)
	);
	const trendMax = $derived(Math.max(1, ...trend.map((day) => day.wins + day.losses)));
	const matchCount = $derived(uniqueMatchCount(filteredRows));
	const playerWinRate = $derived(
		filteredRows.length > 0
			? (filteredRows.filter((row) => row.team === row.winner).length / filteredRows.length) * 100
			: 0
	);
</script>

<svelte:head>
	<title>whos-playing | Stats</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 overflow-hidden px-3 py-4 sm:px-4">
	<div class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight text-zinc-100">Stats Dashboard</h1>
		<p class="text-sm text-zinc-400">Collective performance across all tracked players.</p>
	</div>

	<div class="grid gap-3 rounded-md border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[repeat(7,auto)_auto]">
		<div class="flex min-w-0 flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Players</div>
			<Select.Root type="multiple" bind:value={selectedPlayers}>
				<Select.Trigger class="w-full">{makePlayerTrigger()}</Select.Trigger>
				<Select.Content>
					<Select.Item value="-1" label="All Players">All Players</Select.Item>
					{#each data.playerList as player}
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
					{#each data.heroList as hero}
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
			<div class="flex flex-wrap gap-1">
				<Toggle bind:pressed={ranked} class="h-10 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white">Ranked</Toggle>
				<Toggle bind:pressed={unranked} class="h-10 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white">Unranked</Toggle>
				<Toggle bind:pressed={other} class="h-10 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white">Other</Toggle>
			</div>
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Result</div>
			<div class="flex gap-1">
				<Toggle pressed={wins} onclick={() => toggleResult('wins')} class="h-10 border px-3 data-[state=on]:bg-green-600 data-[state=on]:text-white">Wins</Toggle>
				<Toggle pressed={losses} onclick={() => toggleResult('losses')} class="h-10 border px-3 data-[state=on]:bg-red-600 data-[state=on]:text-white">Losses</Toggle>
			</div>
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Smurfs</div>
			<Toggle bind:pressed={smurfs} class="h-10 w-full border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white">
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

	<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
		<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
			<Card.Content class="p-4">
				<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
					<Swords class="h-3.5 w-3.5 text-zinc-500" /> Matches
				</div>
				<div class="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">{formatNumber(matchCount)}</div>
				<div class="text-xs text-zinc-400">{formatNumber(filteredRows.length)} player performances</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
			<Card.Content class="p-4">
				<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
					<Trophy class="h-3.5 w-3.5 text-zinc-500" /> Win Rate
				</div>
				<div class="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">{formatNumber(playerWinRate, 1)}%</div>
				<div class="text-xs text-zinc-400">Across filtered player rows</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
			<Card.Content class="p-4">
				<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
					<BarChart3 class="h-3.5 w-3.5 text-zinc-500" /> Impact
				</div>
				<div class="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">{formatNumber(average(filteredRows, (row) => row.impact))}</div>
				<div class="text-xs text-zinc-400">Average impact</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
			<Card.Content class="p-4">
				<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
					<Crosshair class="h-3.5 w-3.5 text-zinc-500" /> KDA
				</div>
				<div class="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">
					{formatNumber(
						(average(filteredRows, (row) => row.kills) + average(filteredRows, (row) => row.assists)) /
							Math.max(average(filteredRows, (row) => row.deaths), 1),
						2
					)}
				</div>
				<div class="text-xs text-zinc-400">Average K+A/D</div>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
		<Card.Header class="px-4 pt-4 pb-0">
			<Card.Title class="text-base">Stack Chemistry</Card.Title>
			<Card.Description class="text-xs text-zinc-400">Pairwise teammate results across the current filters.</Card.Description>
		</Card.Header>
		<Card.Content class="min-w-0 px-4 pt-3 pb-4">
			<StackChemistryMatrix rows={chemistryRows} playerList={data.playerList} />
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 xl:grid-cols-2">
		<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
			<Card.Header class="px-4 pt-4 pb-0">
				<Card.Title class="text-base">Trend</Card.Title>
				<Card.Description class="text-xs text-zinc-400">Filtered win/loss volume by active day.</Card.Description>
			</Card.Header>
			<Card.Content class="min-w-0 overflow-x-auto px-4 pt-3 pb-4">
				<div class="mb-3 flex items-center justify-between gap-3">
					<div class="text-xs text-zinc-300">{formatNumber(filteredRows.length)} filtered performances</div>
					<div class="flex items-center gap-2 text-[11px] text-zinc-400">
						<span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-green-500/80"></span>Wins</span>
						<span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-red-500/80"></span>Losses</span>
					</div>
				</div>
				{#if trend.length > 0}
					<div class="flex h-48 items-end gap-1">
						{#each trend as day}
							<div class="flex min-w-0 flex-1 flex-col items-center gap-1">
								<Tooltip.Root>
									<Tooltip.Trigger
										class="flex w-full flex-col justify-end overflow-hidden rounded-sm bg-zinc-950 outline-none transition-colors hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-ring"
										style={`height: ${Math.max(8, ((day.wins + day.losses) / trendMax) * 152)}px`}
									>
										<div
											class="bg-green-500/80"
											style={`height: ${day.wins + day.losses ? (day.wins / (day.wins + day.losses)) * 100 : 0}%`}
										></div>
										<div
											class="bg-red-500/80"
											style={`height: ${day.wins + day.losses ? (day.losses / (day.wins + day.losses)) * 100 : 0}%`}
										></div>
									</Tooltip.Trigger>
									<Tooltip.Content class="text-xs">
										<div class="font-medium">{dayjs(day.date).format('DD MMM YYYY')}</div>
										<div class="tabular-nums">{day.wins} wins, {day.losses} losses</div>
									</Tooltip.Content>
								</Tooltip.Root>
								<div class="w-full truncate text-center text-[10px] text-zinc-500">{dayjs(day.date).format('DD MMM')}</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="flex h-48 items-center justify-center rounded-md border border-dashed border-zinc-800 text-sm text-zinc-400">
						No trend data for these filters
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
			<Card.Header class="px-4 pt-4 pb-0">
				<Card.Title class="text-base">Role Split</Card.Title>
				<Card.Description class="text-xs text-zinc-400">Volume, results, and average performance by role.</Card.Description>
			</Card.Header>
			<Card.Content class="px-4 pt-3 pb-4">
				<DashboardSortableTable
					rows={byRole}
					initialSort={[{ id: 'role', desc: false }]}
					columns={[
						{ id: 'role', label: 'Role', minWidth: '8rem' },
						{ id: 'matches', label: 'Matches', align: 'right' },
						{ id: 'wl', label: 'W/L', minWidth: '7rem' },
						{ id: 'winRate', label: 'WR', align: 'right' },
						{ id: 'impact', label: 'Impact', align: 'right' },
						{ id: 'kda', label: 'KDA', align: 'right' },
						{ id: 'gpm', label: 'GPM', align: 'right' },
						{ id: 'xpm', label: 'XPM', align: 'right' }
					]}
				/>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 xl:grid-cols-2">
		<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
			<Card.Header class="px-4 pt-4 pb-0">
				<Card.Title class="text-base">Players</Card.Title>
				<Card.Description class="text-xs text-zinc-400">Top filtered players by match volume.</Card.Description>
			</Card.Header>
			<Card.Content class="px-4 pt-3 pb-4">
				<DashboardSortableTable
					rows={byPlayer.slice(0, 24)}
					columns={[
						{ id: 'player', label: 'Player', width: '9rem', minWidth: '7rem' },
						{ id: 'matches', label: 'Matches', align: 'right' },
						{ id: 'winRate', label: 'WR', align: 'right' },
						{ id: 'impact', label: 'Impact', align: 'right' },
						{ id: 'kda', label: 'KDA', align: 'right' },
						{ id: 'gpm', label: 'GPM', align: 'right' }
					]}
				/>
			</Card.Content>
		</Card.Root>
		<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
			<Card.Header class="px-4 pt-4 pb-0">
				<Card.Title class="text-base">Heroes</Card.Title>
				<Card.Description class="text-xs text-zinc-400">All heroes with filtered performance totals.</Card.Description>
			</Card.Header>
			<Card.Content class="px-4 pt-3 pb-4">
				<div class="max-h-[30rem] overflow-y-auto pr-1">
					<DashboardSortableTable
						rows={byHero}
						columns={[
							{ id: 'hero', label: 'Hero', minWidth: '8rem' },
							{ id: 'matches', label: 'Matches', align: 'right' },
							{ id: 'winRate', label: 'WR', align: 'right' },
							{ id: 'impact', label: 'Impact', align: 'right' },
							{ id: 'kda', label: 'KDA', align: 'right' }
						]}
					/>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 xl:grid-cols-2">
		<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
			<Card.Header class="px-4 pt-4 pb-0">
				<Card.Title class="text-base">Patch Breakdown</Card.Title>
				<Card.Description class="text-xs text-zinc-400">Filtered volume and performance by Dota patch.</Card.Description>
			</Card.Header>
			<Card.Content class="px-4 pt-3 pb-4">
				<div class="max-h-[30rem] overflow-y-auto pr-1">
					<DashboardSortableTable
						rows={patchBreakdown}
						initialSort={[{ id: 'label', desc: true }]}
						columns={[
							{ id: 'label', label: 'Patch' },
							{ id: 'matches', label: 'Matches', align: 'right' },
							{ id: 'wl', label: 'W/L', minWidth: '7rem' },
							{ id: 'winRate', label: 'WR', align: 'right' },
							{ id: 'impact', label: 'Impact', align: 'right' },
							{ id: 'kda', label: 'KDA', align: 'right' }
						]}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
			<Card.Header class="px-4 pt-4 pb-0">
				<Card.Title class="text-base">Duration Bands</Card.Title>
				<Card.Description class="text-xs text-zinc-400">How match length changes volume, winrate, and impact.</Card.Description>
			</Card.Header>
			<Card.Content class="px-4 pt-3 pb-4">
				<DashboardSortableTable
					rows={durationBuckets}
					initialSort={[{ id: 'label', desc: false }]}
					columns={[
						{ id: 'label', label: 'Duration' },
						{ id: 'matches', label: 'Matches', align: 'right' },
						{ id: 'wl', label: 'W/L', minWidth: '7rem' },
						{ id: 'winRate', label: 'WR', align: 'right' },
						{ id: 'impact', label: 'Impact', align: 'right' },
						{ id: 'avgDuration', label: 'Avg', align: 'right' }
					]}
				/>
			</Card.Content>
		</Card.Root>
	</div>
</div>
