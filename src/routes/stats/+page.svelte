<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import DashboardSortableTable from '$lib/components/stats/DashboardSortableTable.svelte';
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
	let filteredRows = $derived(
		data.rows.filter((row) => {
			const rowWon = row.team === row.winner;
			const matchesPlayer =
				selectedPlayerIds.length === 0 || selectedPlayerIds.includes(row.playerId.toString());
			const matchesHero = selectedHeroIds.length === 0 || selectedHeroIds.includes(row.heroId.toString());
			const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(row.role.toString());
			const matchesLobby =
				(ranked && row.lobby === 7 && row.gameMode === 22) ||
				(unranked && row.lobby === 0 && row.gameMode === 22) ||
				(other && !(row.lobby === 7 && row.gameMode === 22) && !(row.lobby === 0 && row.gameMode === 22));
			const matchesResult = (wins && rowWon) || (losses && !rowWon);
			const matchesSmurf = smurfs || !row.smurf;
			const matchesDate = selectedPatchVersion
				? getDotaPatchForTimestamp(row.startTime)?.version === selectedPatchVersion
				: dateStart === null || row.startTime >= dateStart;
			return (
				matchesPlayer &&
				matchesHero &&
				matchesRole &&
				matchesLobby &&
				matchesResult &&
				matchesSmurf &&
				matchesDate
			);
		})
	);
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
	const byHero = $derived(
		Array.from(
			filteredRows
				.reduce((map, row) => {
					const current = map.get(row.heroId) ?? {
						id: row.heroId,
						name: row.heroName,
						img: row.heroImg,
						rows: [] as StatRow[]
					};
					current.rows.push(row);
					map.set(row.heroId, current);
					return map;
				}, new Map<number, { id: number; name: string; img: string; rows: StatRow[] }>())
				.values()
		)
			.map((hero) => {
				const wins = hero.rows.filter((row) => row.team === row.winner).length;
				return {
					...hero,
					matches: hero.rows.length,
					wins,
					losses: hero.rows.length - wins,
					winRate: hero.rows.length > 0 ? (wins / hero.rows.length) * 100 : 0,
					impact: average(hero.rows, (row) => row.impact),
					kda:
						(average(hero.rows, (row) => row.kills) + average(hero.rows, (row) => row.assists)) /
						Math.max(average(hero.rows, (row) => row.deaths), 1)
				};
			})
			.sort((a, b) => b.matches - a.matches || b.winRate - a.winRate)
	);
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
	const patchBreakdown = $derived(
		Array.from(
			filteredRows
				.reduce((map, row) => {
					const patch = getDotaPatchForTimestamp(row.startTime);
					const key = patch?.version ?? 'Unknown';
					const current = map.get(key) ?? {
						patch: key,
						label: patch?.label ?? 'Unknown Patch',
						rows: [] as StatRow[]
					};
					current.rows.push(row);
					map.set(key, current);
					return map;
				}, new Map<string, { patch: string; label: string; rows: StatRow[] }>())
				.values()
		)
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
			.sort((a, b) => b.matches - a.matches || b.patch.localeCompare(a.patch))
	);
	const durationBuckets = $derived(
		[
			{ label: '< 30m', min: 0, max: 30 * 60 },
			{ label: '30-40m', min: 30 * 60, max: 40 * 60 },
			{ label: '40-50m', min: 40 * 60, max: 50 * 60 },
			{ label: '50-60m', min: 50 * 60, max: 60 * 60 },
			{ label: '60m+', min: 60 * 60, max: Number.POSITIVE_INFINITY }
		].map((bucket) => {
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
		})
	);
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

<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 sm:px-4">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-zinc-100">Stats Dashboard</h1>
		<p class="mt-1 text-sm text-zinc-400">Collective performance across all tracked players.</p>
	</div>

	<div class="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3 lg:grid-cols-4 xl:grid-cols-[1fr_1fr_1fr_1fr_auto_auto_auto_auto]">
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
			<div class="flex gap-1">
				<Toggle bind:pressed={ranked} class="h-10 border px-3 data-[state=on]:bg-sky-600">Ranked</Toggle>
				<Toggle bind:pressed={unranked} class="h-10 border px-3 data-[state=on]:bg-sky-600">Unranked</Toggle>
				<Toggle bind:pressed={other} class="h-10 border px-3 data-[state=on]:bg-sky-600">Other</Toggle>
			</div>
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Result</div>
			<div class="flex gap-1">
				<Toggle pressed={wins} onclick={() => toggleResult('wins')} class="h-10 border px-3 data-[state=on]:bg-sky-600">Wins</Toggle>
				<Toggle pressed={losses} onclick={() => toggleResult('losses')} class="h-10 border px-3 data-[state=on]:bg-sky-600">Losses</Toggle>
			</div>
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Smurfs</div>
			<Toggle bind:pressed={smurfs} class="h-10 border px-3 data-[state=on]:bg-sky-600">
				<VenetianMask class="h-5 w-5" />
			</Toggle>
		</div>
	</div>

	<div class="grid gap-3 md:grid-cols-4">
		<Card.Root>
			<Card.Content class="p-4">
				<div class="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
					<Swords class="h-4 w-4" /> Matches
				</div>
				<div class="mt-2 text-3xl font-semibold">{formatNumber(matchCount)}</div>
				<div class="text-sm text-zinc-400">{formatNumber(filteredRows.length)} player performances</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="p-4">
				<div class="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
					<Trophy class="h-4 w-4" /> Win Rate
				</div>
				<div class="mt-2 text-3xl font-semibold">{formatNumber(playerWinRate, 1)}%</div>
				<div class="text-sm text-zinc-400">Across filtered player rows</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="p-4">
				<div class="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
					<BarChart3 class="h-4 w-4" /> Impact
				</div>
				<div class="mt-2 text-3xl font-semibold">{formatNumber(average(filteredRows, (row) => row.impact))}</div>
				<div class="text-sm text-zinc-400">Average impact</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="p-4">
				<div class="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
					<Crosshair class="h-4 w-4" /> KDA
				</div>
				<div class="mt-2 text-3xl font-semibold">
					{formatNumber(
						(average(filteredRows, (row) => row.kills) + average(filteredRows, (row) => row.assists)) /
							Math.max(average(filteredRows, (row) => row.deaths), 1),
						2
					)}
				</div>
				<div class="text-sm text-zinc-400">Average K+A/D</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-3 xl:grid-cols-[1fr_1fr]">
		<Card.Root>
			<Card.Header>
				<Card.Title>Trend</Card.Title>
				<Card.Description>Filtered win/loss volume by active day.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex h-56 items-end gap-1">
					{#each trend as day}
						<div class="flex min-w-0 flex-1 flex-col items-center gap-1">
							<Tooltip.Root>
								<Tooltip.Trigger
									class="flex w-full flex-col justify-end overflow-hidden rounded-sm bg-zinc-900"
									style={`height: ${Math.max(8, ((day.wins + day.losses) / trendMax) * 184)}px`}
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
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Role Split</Card.Title>
				<Card.Description>Volume, results, and average performance by role.</Card.Description>
			</Card.Header>
			<Card.Content class="overflow-x-auto">
				<DashboardSortableTable
					rows={byRole}
					initialSort={[{ id: 'role', desc: false }]}
					columns={[
						{ id: 'role', label: 'Role', minWidth: '11rem' },
						{ id: 'matches', label: 'Matches', align: 'right' },
						{ id: 'wl', label: 'W/L', minWidth: '10rem' },
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

	<div class="grid gap-3 xl:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Players</Card.Title>
				<Card.Description>Top filtered players by match volume.</Card.Description>
			</Card.Header>
			<Card.Content class="overflow-x-auto">
				<DashboardSortableTable
					rows={byPlayer.slice(0, 24)}
					columns={[
						{ id: 'player', label: 'Player', minWidth: '12rem' },
						{ id: 'matches', label: 'Matches', align: 'right' },
						{ id: 'winRate', label: 'WR', align: 'right' },
						{ id: 'impact', label: 'Impact', align: 'right' },
						{ id: 'kda', label: 'KDA', align: 'right' },
						{ id: 'gpm', label: 'GPM', align: 'right' }
					]}
				/>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Heroes</Card.Title>
				<Card.Description>Most played heroes in the filtered set.</Card.Description>
			</Card.Header>
			<Card.Content class="overflow-x-auto">
				<DashboardSortableTable
					rows={byHero.slice(0, 24)}
					columns={[
						{ id: 'hero', label: 'Hero', minWidth: '14rem' },
						{ id: 'matches', label: 'Matches', align: 'right' },
						{ id: 'winRate', label: 'WR', align: 'right' },
						{ id: 'impact', label: 'Impact', align: 'right' },
						{ id: 'kda', label: 'KDA', align: 'right' }
					]}
				/>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-3 xl:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Patch Breakdown</Card.Title>
				<Card.Description>Filtered volume and performance by Dota patch.</Card.Description>
			</Card.Header>
			<Card.Content class="overflow-x-auto">
				<DashboardSortableTable
					rows={patchBreakdown.slice(0, 18)}
					columns={[
						{ id: 'label', label: 'Patch', minWidth: '9rem' },
						{ id: 'matches', label: 'Matches', align: 'right' },
						{ id: 'wl', label: 'W/L', minWidth: '10rem' },
						{ id: 'winRate', label: 'WR', align: 'right' },
						{ id: 'impact', label: 'Impact', align: 'right' },
						{ id: 'kda', label: 'KDA', align: 'right' }
					]}
				/>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Duration Bands</Card.Title>
				<Card.Description>How match length changes volume, winrate, and impact.</Card.Description>
			</Card.Header>
			<Card.Content class="overflow-x-auto">
				<DashboardSortableTable
					rows={durationBuckets}
					columns={[
						{ id: 'label', label: 'Duration', minWidth: '9rem' },
						{ id: 'matches', label: 'Matches', align: 'right' },
						{ id: 'wl', label: 'W/L', minWidth: '10rem' },
						{ id: 'winRate', label: 'WR', align: 'right' },
						{ id: 'impact', label: 'Impact', align: 'right' },
						{ id: 'avgDuration', label: 'Avg', align: 'right' }
					]}
				/>
			</Card.Content>
		</Card.Root>
	</div>
</div>
