<script lang="ts">
	type SteamProfile = {
		avatar: string;
		avatarfull: string;
		avatarhash: string;
		avatarmedium: string;
		communityvisibilitystate: number;
		lastlogoff: number;
		loccountrycode: string;
		personaname: string;
		personastate: number;
		personastateflags: number;
		primaryclanid: string;
		profilestate: number;
		profileurl: string;
		steamid: string;
		timecreated: number;
		smurf: boolean;
		gameextrainfo?: string;
	};
	type Player = {
		accountId: number;
		username: string;
		id: number;
		image: string;
	};
	type Stats = {
		wins: number;
		losses: number;
		rankedWins: number;
		rankedLosses: number;
	};
	import * as Card from '$lib/components/ui/card';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import WinChart from '$lib/components/profile/WinChart.svelte';
	import Bar from '$lib/components/stats/Bar.svelte';
	import type { getPlayerWinLossByMinutes } from '$lib/server/db-functions';
	import WinLossByMinuteBarChart from '$lib/components/stats/WinLossByMinuteBarChart.svelte';
	import { CalendarDays } from 'lucide-svelte';

	interface Props {
		data: {
			player: Player;
			mainAccount: SteamProfile;
			smurfAccounts: SteamProfile[];
			allTimeStats: Stats;
			recentStats: Stats;
			heroStats: any;
			allTimeHeroStats: any;
			winGraph: { resultsArray: number[]; daysArray: number[] };
			heroList: { id: number; name: string }[];
			impactCounts: Record<string, { role: number; count: number | string }[]>;
			winLossByMinute: Awaited<ReturnType<typeof getPlayerWinLossByMinutes>>;
		};
	}

	let { data }: Props = $props();

	let chartType = $state('days');

	let {
		player,
		heroStats,
		allTimeHeroStats,
		winGraph,
		winLossByMinute
	} = $derived(data);

	const getImpactCounts = (ratingName: string) => data.impactCounts[ratingName] ?? [];

	const getImpactTotal = (ratingName: string) => {
		return getImpactCounts(ratingName).reduce((sum, item) => sum + Number(item.count), 0);
	};

	const getRoleImpactCount = (ratingName: string, role: number) => {
		return Number(getImpactCounts(ratingName).find((item) => item.role === role)?.count || 0);
	};

	const getRoleImpactPercentage = (ratingName: string, role: number) => {
		const total = getImpactTotal(ratingName);
		return total > 0 ? (getRoleImpactCount(ratingName, role) / total) * 100 : 0;
	};

	let mostCommonImpact = $derived(
		Object.keys(data.impactCounts).reduce(
			(maxRating, ratingName) => {
				const total = getImpactTotal(ratingName);

				if (total > maxRating.total) {
					return { rating: ratingName, total };
				}

				return maxRating;
			},
			{ rating: null, total: 0 } as { rating: string | null; total: number }
		)
	);
</script>

<div class="flex w-full min-w-0 flex-col gap-4">
	<div class="grid gap-4 lg:grid-cols-2">
		<Card.Root class="min-w-0">
			<Card.Header>
				<Card.Title>All Time</Card.Title>
			</Card.Header>
			<Card.Content class="overflow-x-auto p-2">
				{#await allTimeHeroStats then allTimeHeroStats}
					<HeroStatbox heroStats={allTimeHeroStats} />
				{/await}
			</Card.Content>
		</Card.Root>

		<Card.Root class="min-w-0">
			<Card.Header>
				<Card.Title>This Month</Card.Title>
			</Card.Header>
			<Card.Content class="overflow-x-auto p-2">
				{#await heroStats then heroStats}
					<HeroStatbox {heroStats} />
				{/await}
			</Card.Content>
		</Card.Root>
	</div>
	<div>
		{#if winGraph.resultsArray.length > 0 || winGraph.daysArray.length > 0}
			<Card.Root>
				<div class="flex flex-col">
					{#if chartType == 'days'}
						<Card.Header>
							<Card.Title class="flex justify-between">
								<div>Wins By Game</div>
									<button
										class="flex basis-1/6 items-center justify-end rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										aria-label="Show wins per day"
										onclick={() => (chartType = 'games')}><CalendarDays class="h-4 w-4" /></button
									>
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<WinChart
								data={[
									{
										data: winGraph.resultsArray,
										player: {
											username: player.username,
											id: player.id,
											accounts: [player.accountId]
										}
									}
								]}
								type="results"
							/>
						</Card.Content>
					{:else}
						<Card.Header>
							<Card.Title class="flex justify-between">
								<div>Wins Per Day</div>
									<button
										class="flex basis-1/6 items-center justify-end rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										aria-label="Show wins by game"
										onclick={() => (chartType = 'days')}><CalendarDays class="h-4 w-4" /></button
									>
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<WinChart
								data={[
									{
										data: winGraph.daysArray,
										player: {
											username: player.username,
											id: player.id,
											accounts: [player.accountId]
										}
									}
								]}
								type="days"
							/>
						</Card.Content>
					{/if}
				</div>
			</Card.Root>
		{/if}
	</div>
	<Card.Root class="min-w-0">
		<Card.Header class="space-y-1 pb-4">
			<Card.Title>Impact Distribution</Card.Title>
			<Card.Description>Impact grades split by role.</Card.Description>
		</Card.Header>
		<Card.Content class="p-0">
			<div class="overflow-x-auto">
				<div class="min-w-[680px]">
					<div class="grid grid-cols-[4rem_repeat(6,minmax(4.75rem,1fr))] items-center gap-3 border-b border-zinc-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
						<div>Grade</div>
						<div class="text-center">Total</div>
						<div class="flex justify-center">
							<img src="/roles/pos1.svg" alt="Position 1" class="h-7 w-7" />
						</div>
						<div class="flex justify-center">
							<img src="/roles/pos2.svg" alt="Position 2" class="h-7 w-7" />
						</div>
						<div class="flex justify-center">
							<img src="/roles/pos3.svg" alt="Position 3" class="h-7 w-7" />
						</div>
						<div class="flex justify-center">
							<img src="/roles/pos4.svg" alt="Position 4" class="h-7 w-7" />
						</div>
						<div class="flex justify-center">
							<img src="/roles/pos5.svg" alt="Position 5" class="h-7 w-7" />
						</div>
					</div>
		<div class="flex max-h-80 flex-col overflow-auto" id="scrollbox">
			{#each ['S++', 'S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F+', 'F', 'F-'] as ratingName}
				<div class="grid grid-cols-[4rem_repeat(6,minmax(4.75rem,1fr))] items-center gap-3 border-b border-zinc-900/80 px-4 py-2 last:border-b-0">
					<div class="flex h-8 items-center text-center">
						{#if ratingName === 'S++'}
							<div id="splusplusrating" class="font-display text-sm font-semibold">
								{ratingName}
							</div>
						{:else if ratingName === 'S+'}
							<div id="srating" class="font-display text-sm font-semibold">
								{ratingName}
							</div>
						{:else if ratingName !== 'F-'}
							<div class="font-display text-sm font-semibold text-zinc-100">
								{ratingName}
							</div>
						{:else}
							<div id="frating" class="font-display flex justify-center text-sm">
								F-
							</div>
						{/if}
					</div>
					<div class="font-display flex min-w-0 flex-col justify-center gap-1 text-center text-sm tabular-nums">
						{getImpactTotal(ratingName)}
						<Bar
							percentage={mostCommonImpact.total > 0
								? (getImpactTotal(ratingName) / mostCommonImpact.total) * 100
								: 0}
							colour="#9234ea"
						/>
					</div>
					<div class="font-display flex min-w-0 flex-col justify-center gap-1 text-center text-sm tabular-nums">
						{getRoleImpactCount(ratingName, 1)}
						<Bar
							percentage={getRoleImpactPercentage(ratingName, 1)}
							colour="#4753a5"
						/>
					</div>
					<div class="font-display flex min-w-0 flex-col justify-center gap-1 text-center text-sm tabular-nums">
						{getRoleImpactCount(ratingName, 2)}
						<Bar
							percentage={getRoleImpactPercentage(ratingName, 2)}
							colour="#2f8c94"
						/>
					</div>
					<div class="font-display flex min-w-0 flex-col justify-center gap-1 text-center text-sm tabular-nums">
						{getRoleImpactCount(ratingName, 3)}
						<Bar
							percentage={getRoleImpactPercentage(ratingName, 3)}
							colour="#bc7412"
						/>
					</div>
					<div class="font-display flex min-w-0 flex-col justify-center gap-1 text-center text-sm tabular-nums">
						{getRoleImpactCount(ratingName, 4)}
						<Bar
							percentage={getRoleImpactPercentage(ratingName, 4)}
							colour="#c24958"
						/>
					</div>
					<div class="font-display flex min-w-0 flex-col justify-center gap-1 text-center text-sm tabular-nums">
						{getRoleImpactCount(ratingName, 5)}
						<Bar
							percentage={getRoleImpactPercentage(ratingName, 5)}
							colour="#37a075"
						/>
					</div>
				</div>
			{/each}
					</div>
				</div>
				</div>
			</Card.Content>
	</Card.Root>
	<WinLossByMinuteBarChart data={data.winLossByMinute} />
</div>

<style>
	:root {
		--splus-base: #fef3c7;
		--splus-accent1: #fcd34d;
		--splus-accent2: #fbbf24;
		--splusplus-base: #fdba74;
		--splusplus-accent1: #f97316;
		--splusplus-accent2: #ea580c;
		--f-base: #b45309;
		--f-accent1: #9a3412;
		--f-accent2: #7c2d12;
	}

	#srating {
		animation: srating 1s ease-in-out infinite alternate;
		color: var(--splus-base);
	}

	@keyframes srating {
		from {
			text-shadow:
				0 0 2px var(--splus-base),
				0 0 4px var(--splus-base),
				0 0 6px var(--splus-accent1),
				0 0 8px var(--splus-accent1);
		}
		to {
			text-shadow:
				0 0 4px var(--splus-base),
				0 0 8px var(--splus-accent2),
				0 0 12px var(--splus-accent2);
		}
	}

	#frating {
		animation: frating 1s ease-in-out infinite alternate;
		color: var(--f-base);
	}

	@keyframes frating {
		from {
			filter: drop-shadow(0 0 8px var(--f-accent1));
		}
		to {
			filter: drop-shadow(0 0 4px var(--f-accent2));
		}
	}

	#splusplusrating {
		animation: ssrating 1s ease-in-out infinite alternate;
		color: var(--splusplus-base);
	}

	@keyframes ssrating {
		from {
			text-shadow:
				0 0 2px var(--splusplus-base),
				0 0 4px var(--splusplus-base),
				0 0 6px var(--splusplus-accent1),
				0 0 8px var(--splusplus-accent1);
		}

		to {
			text-shadow:
				0 0 4px var(--splusplus-base),
				0 0 8px var(--splusplus-accent2),
				0 0 12px var(--splusplus-accent2);
		}
	}

	#scrollbox::-webkit-scrollbar {
		width: 4px;
		background-color: #404040;
	}

	#scrollbox::-webkit-scrollbar-thumb {
		background-color: #e7e5e4;
		border-radius: 8px;
	}
</style>
