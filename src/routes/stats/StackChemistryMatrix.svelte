<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { UsersRound } from 'lucide-svelte';

	type StatRow = {
		playerId: number;
		username: string;
		matchId: number;
		team: string;
		winner: string;
		impact: number;
	};

	type PlayerOption = {
		id: number;
		username: string;
	};

	type PairStats = {
		key: string;
		playerAId: number;
		playerBId: number;
		playerAName: string;
		playerBName: string;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		avgImpact: number;
	};

	type MutablePairStats = Omit<PairStats, 'winRate' | 'avgImpact'> & {
		impactTotal: number;
	};

	type Props = {
		rows: StatRow[];
		playerList: PlayerOption[];
	};

	const { rows, playerList }: Props = $props();
	const minimumStackGames = 50;

	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value || 0);

	const getPairKey = (playerAId: number, playerBId: number) =>
		[playerAId, playerBId].sort((a, b) => a - b).join(':');

	const getSideKey = (row: StatRow) => `${row.matchId}:${row.team}`;

	const pairs = $derived.by(() => {
		const rowsBySide = rows.reduce((map, row) => {
			const sideRows = map.get(getSideKey(row)) ?? [];
			sideRows.push(row);
			map.set(getSideKey(row), sideRows);
			return map;
		}, new Map<string, StatRow[]>());
		const pairMap = new Map<string, MutablePairStats>();

		for (const sideRows of rowsBySide.values()) {
			const uniqueRows = Array.from(
				sideRows
					.reduce((map, row) => {
						if (!map.has(row.playerId)) {
							map.set(row.playerId, row);
						}
						return map;
					}, new Map<number, StatRow>())
					.values()
			);

			if (uniqueRows.length < 2) continue;

			const won = uniqueRows[0].team === uniqueRows[0].winner;

			for (let index = 0; index < uniqueRows.length; index += 1) {
				for (let nextIndex = index + 1; nextIndex < uniqueRows.length; nextIndex += 1) {
					const playerA = uniqueRows[index];
					const playerB = uniqueRows[nextIndex];
					const [first, second] =
						playerA.playerId < playerB.playerId ? [playerA, playerB] : [playerB, playerA];
					const key = getPairKey(first.playerId, second.playerId);
					const current = pairMap.get(key) ?? {
						key,
						playerAId: first.playerId,
						playerBId: second.playerId,
						playerAName: first.username,
						playerBName: second.username,
						matches: 0,
						wins: 0,
						losses: 0,
						impactTotal: 0
					};

					current.matches += 1;
					current.impactTotal += (Number(first.impact) + Number(second.impact)) / 2;
					if (won) current.wins += 1;
					else current.losses += 1;
					pairMap.set(key, current);
				}
			}
		}

		return Array.from(pairMap.values()).map((pair) => ({
			key: pair.key,
			playerAId: pair.playerAId,
			playerBId: pair.playerBId,
			playerAName: pair.playerAName,
			playerBName: pair.playerBName,
			matches: pair.matches,
			wins: pair.wins,
			losses: pair.losses,
			winRate: pair.matches ? (pair.wins / pair.matches) * 100 : 0,
			avgImpact: pair.matches ? pair.impactTotal / pair.matches : 0
		}));
	});

	const pairMap = $derived(new Map(pairs.map((pair) => [pair.key, pair])));
	const activePlayers = $derived(
		playerList
			.map((player) => ({
				...player,
				pairMatches: pairs
					.filter((pair) => pair.playerAId === player.id || pair.playerBId === player.id)
					.reduce((total, pair) => total + pair.matches, 0)
			}))
			.filter((player) => player.pairMatches > 0)
			.sort((a, b) => b.pairMatches - a.pairMatches || a.username.localeCompare(b.username))
	);
	const matrixTemplate = $derived(`minmax(8rem, 10rem) repeat(${activePlayers.length}, minmax(4.25rem, 1fr))`);
	const qualifiedPairs = $derived(pairs.filter((pair) => pair.matches >= minimumStackGames));
	const bestStacks = $derived(
		qualifiedPairs
			.slice()
			.sort((a, b) => b.winRate - a.winRate || b.matches - a.matches || b.avgImpact - a.avgImpact)
			.slice(0, 4)
	);
	const dangerStacks = $derived(
		qualifiedPairs
			.slice()
			.sort((a, b) => a.winRate - b.winRate || b.matches - a.matches || a.avgImpact - b.avgImpact)
			.slice(0, 4)
	);
	const totalPairMatches = $derived(pairs.reduce((total, pair) => total + pair.matches, 0));
	const mostPlayedPair = $derived(
		pairs.slice().sort((a, b) => b.matches - a.matches || b.winRate - a.winRate)[0]
	);

	const getPair = (playerAId: number, playerBId: number) => pairMap.get(getPairKey(playerAId, playerBId));

	const getCellStyle = (pair: PairStats | undefined) => {
		if (!pair) return 'background: rgba(39, 39, 42, 0.35);';

		const weight = Math.min(pair.matches / 12, 1);
		const alpha = 0.14 + weight * 0.46;

		if (pair.winRate >= 50) {
			return `background: rgba(34, 197, 94, ${alpha});`;
		}

		return `background: rgba(239, 68, 68, ${alpha});`;
	};

	const getPlayerInitials = (name: string) =>
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('');
</script>

<div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
	<div class="min-w-0">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-2 text-xs text-zinc-300">
				<UsersRound class="h-4 w-4 text-zinc-500" />
				<span class="tabular-nums">{formatNumber(totalPairMatches)}</span>
				<span class="text-zinc-500">pair appearances</span>
			</div>
			<div class="flex items-center gap-3 text-[11px] text-zinc-400">
				<span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-sm bg-green-500/70"></span>Winning</span>
				<span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-sm bg-red-500/70"></span>Losing</span>
				<span>Stronger color means more games</span>
			</div>
		</div>

		{#if activePlayers.length > 1}
			<div class="overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
				<div class="chemistry-grid min-w-max" style={`grid-template-columns: ${matrixTemplate}`}>
					<div class="sticky left-0 z-20 border-r border-b border-zinc-800 bg-zinc-950/95 px-2 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
						Player
					</div>
					{#each activePlayers as columnPlayer}
						<a
							href={`/player/${columnPlayer.id}`}
							class="border-b border-zinc-800 px-2 py-2 text-center text-[11px] font-medium text-zinc-300 transition-colors hover:text-zinc-100"
							title={columnPlayer.username}
						>
							<span class="hidden md:inline">{columnPlayer.username}</span>
							<span class="md:hidden">{getPlayerInitials(columnPlayer.username)}</span>
						</a>
					{/each}

					{#each activePlayers as rowPlayer}
						<a
							href={`/player/${rowPlayer.id}`}
							class="sticky left-0 z-10 flex min-w-0 items-center border-r border-b border-zinc-800 bg-zinc-950/95 px-2 py-2 text-sm font-medium text-zinc-100 transition-colors hover:text-sky-300"
							title={rowPlayer.username}
						>
							<span class="truncate">{rowPlayer.username}</span>
						</a>
						{#each activePlayers as columnPlayer}
							{@const pair = getPair(rowPlayer.id, columnPlayer.id)}
							<div class="border-b border-zinc-900 p-1">
								{#if rowPlayer.id === columnPlayer.id}
									<div class="flex h-12 items-center justify-center rounded-sm bg-zinc-900/50 text-xs text-zinc-600">Self</div>
								{:else if pair}
									<Tooltip.Root>
										<Tooltip.Trigger
											class="flex h-12 w-full flex-col items-center justify-center rounded-sm text-xs text-zinc-100 outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring"
											style={getCellStyle(pair)}
										>
											<span class="font-semibold tabular-nums">{formatNumber(pair.winRate, 0)}%</span>
											<span class="text-[10px] text-zinc-300">{pair.matches}g</span>
										</Tooltip.Trigger>
										<Tooltip.Content class="text-xs">
											<div class="font-medium">{pair.playerAName} + {pair.playerBName}</div>
											<div class="tabular-nums">{pair.wins} wins, {pair.losses} losses</div>
											<div class="tabular-nums">{formatNumber(pair.avgImpact)} avg impact</div>
										</Tooltip.Content>
									</Tooltip.Root>
								{:else}
									<div class="flex h-12 items-center justify-center rounded-sm bg-zinc-900/30 text-xs text-zinc-700">-</div>
								{/if}
							</div>
						{/each}
					{/each}
				</div>
			</div>
		{:else}
			<div class="flex h-48 items-center justify-center rounded-md border border-dashed border-zinc-800 text-sm text-zinc-400">
				No teammate pairings match the current filters.
			</div>
		{/if}
	</div>

	<div class="grid content-start gap-3">
		<div class="rounded-md border border-zinc-800 bg-zinc-950/35 p-3">
			<div class="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Most Played</div>
			{#if mostPlayedPair}
				<div class="mt-1 text-sm font-medium text-zinc-100">{mostPlayedPair.playerAName} + {mostPlayedPair.playerBName}</div>
				<div class="mt-1 text-xs tabular-nums text-zinc-400">
					{mostPlayedPair.matches} games, {formatNumber(mostPlayedPair.winRate, 1)}% win rate
				</div>
			{:else}
				<div class="mt-1 text-sm text-zinc-500">No pair data</div>
			{/if}
		</div>

		<div class="rounded-md border border-zinc-800 bg-zinc-950/35 p-3">
			<div class="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
				Best Stacks ({minimumStackGames}+ games)
			</div>
			<div class="space-y-2">
				{#if bestStacks.length > 0}
					{#each bestStacks as pair}
						<div class="flex items-center justify-between gap-3 text-sm">
							<div class="min-w-0">
								<div class="truncate font-medium text-zinc-100">{pair.playerAName} + {pair.playerBName}</div>
								<div class="text-xs tabular-nums text-zinc-500">{pair.matches} games</div>
							</div>
							<div class="text-right text-green-300 tabular-nums">{formatNumber(pair.winRate, 1)}%</div>
						</div>
					{/each}
				{:else}
					<div class="text-sm text-zinc-500">No stacks meet this minimum.</div>
				{/if}
			</div>
		</div>

		<div class="rounded-md border border-zinc-800 bg-zinc-950/35 p-3">
			<div class="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
				Danger Stacks ({minimumStackGames}+ games)
			</div>
			<div class="space-y-2">
				{#if dangerStacks.length > 0}
					{#each dangerStacks as pair}
						<div class="flex items-center justify-between gap-3 text-sm">
							<div class="min-w-0">
								<div class="truncate font-medium text-zinc-100">{pair.playerAName} + {pair.playerBName}</div>
								<div class="text-xs tabular-nums text-zinc-500">{pair.matches} games</div>
							</div>
							<div class="text-right text-red-300 tabular-nums">{formatNumber(pair.winRate, 1)}%</div>
						</div>
					{/each}
				{:else}
					<div class="text-sm text-zinc-500">No stacks meet this minimum.</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.chemistry-grid {
		display: grid;
	}
</style>
