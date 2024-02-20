<script lang="ts">
	export let playerStats: {
		id: number;
		username: string;
		matches: number;
		radiantWins: number;
		direWins: number;
		avgImpact: number;
	}[];

	import BiSortDown from '~icons/bi/sort-down';
	import BiSortDownAlt from '~icons/bi/sort-down-alt';
	import tippy from 'sveltejs-tippy';
	import { calcImpact } from '../../functions';
	import Bar from './Bar.svelte';
	import { goto } from '$app/navigation';
	let order = { col: 'matches', direction: 'desc' };

	let playerSortState = 0;
	const handlePlayerSort = () => {
		matchesSortState = 0;
		winRateSortState = 0;
		impactSortState = 0;
		if (playerSortState == 0) {
			playerSortState = 1;
			order = { col: 'player', direction: 'desc' };
		} else if (playerSortState == 1) {
			playerSortState = 2;
			order = { col: 'player', direction: 'asc' };
		} else {
			playerSortState = 0;
			order = { col: 'matches', direction: 'desc' };
		}
	};
	let matchesSortState = 0;
	const handleMachesSort = () => {
		playerSortState = 0;
		winRateSortState = 0;
		impactSortState = 0;
		if (matchesSortState == 0) {
			matchesSortState = 1;

			order = { col: 'matches', direction: 'desc' };
		} else if (matchesSortState == 1) {
			matchesSortState = 2;
			order = { col: 'matches', direction: 'asc' };
		} else {
			matchesSortState = 0;
			order = { col: 'matches', direction: 'desc' };
		}
	};

	let winRateSortState = 0;
	const handleWinRateSort = () => {
		playerSortState = 0;
		matchesSortState = 0;
		impactSortState = 0;
		if (winRateSortState == 0) {
			winRateSortState = 1;
			order = { col: 'winrate', direction: 'desc' };
		} else if (winRateSortState == 1) {
			winRateSortState = 2;
			order = { col: 'winrate', direction: 'asc' };
		} else {
			winRateSortState = 0;
			order = { col: 'matches', direction: 'desc' };
		}
	};

	let impactSortState = 0;
	const handleImpactSort = () => {
		playerSortState = 0;
		matchesSortState = 0;
		winRateSortState = 0;
		if (impactSortState == 0) {
			impactSortState = 1;
			order = { col: 'impact', direction: 'desc' };
		} else if (impactSortState == 1) {
			impactSortState = 2;
			order = { col: 'impact', direction: 'asc' };
		} else {
			impactSortState = 0;
			order = { col: 'matches', direction: 'desc' };
		}
	};

	const sortStats = (order: { col: string; direction: string }) => {
		if (order.col == 'player') {
			if (order.direction == 'desc') {
				return playerStats.slice().sort((a, b) => {
					if (a.username < b.username) {
						return -1;
					}
					if (a.username > b.username) {
						return 1;
					}
					return 0;
				});
			} else {
				return playerStats.slice().sort((a, b) => {
					if (a.username > b.username) {
						return -1;
					}
					if (a.username < b.username) {
						return 1;
					}
					return 0;
				});
			}
		} else if (order.col == 'matches') {
			if (order.direction == 'desc') {
				return playerStats.slice().sort((a, b) => {
					if (a.matches > b.matches) {
						return -1;
					}
					if (a.matches < b.matches) {
						return 1;
					}
					return 0;
				});
			} else {
				return playerStats.slice().sort((a, b) => {
					if (a.matches < b.matches) {
						return -1;
					}
					if (a.matches > b.matches) {
						return 1;
					}
					return 0;
				});
			}
		} else if (order.col == 'winrate') {
			if (order.direction == 'desc') {
				return playerStats.slice().sort((a, b) => {
					if ((a.radiantWins + a.direWins) / a.matches > (b.radiantWins + b.direWins) / b.matches) {
						return -1;
					}
					if ((a.radiantWins + a.direWins) / a.matches < (b.radiantWins + b.direWins) / b.matches) {
						return 1;
					}
					return 0;
				});
			} else {
				return playerStats.slice().sort((a, b) => {
					if ((a.radiantWins + a.direWins) / a.matches < (b.radiantWins + b.direWins) / b.matches) {
						return -1;
					}
					if ((a.radiantWins + a.direWins) / a.matches > (b.radiantWins + b.direWins) / b.matches) {
						return 1;
					}
					return 0;
				});
			}
		} else if (order.col == 'impact') {
			if (order.direction == 'desc') {
				return playerStats.slice().sort((a, b) => {
					if (a.avgImpact > b.avgImpact) {
						return -1;
					}
					if (a.avgImpact < b.avgImpact) {
						return 1;
					}
					return 0;
				});
			} else {
				return playerStats.slice().sort((a, b) => {
					if (a.avgImpact < b.avgImpact) {
						return -1;
					}
					if (a.avgImpact > b.avgImpact) {
						return 1;
					}
					return 0;
				});
			}
		} else {
			return playerStats;
		}
	};

	order = { col: 'matches', direction: 'desc' };
	$: sortedStats = sortStats(order);
</script>

<div class="rounded-xl bg-zinc-800 px-4 py-2">
	<div class="my-1 flex gap-2 border-b-[1px] border-zinc-500 pb-1 pr-2">
		<div class="flex w-20 items-center justify-center">
			<button on:click={() => handlePlayerSort()}>PLAYER</button>
			<div class="grow" />
			<div class="w-6">
				{#if playerSortState == 1}
					<BiSortDown />
				{:else if playerSortState == 2}
					<BiSortDownAlt />
				{/if}
			</div>
		</div>
		<div class="flex grow gap-2">
			<div class="flex basis-1/3 items-center justify-center">
				<button on:click={() => handleMachesSort()}>MATCHES</button>
				<div class="grow" />
				<div class="w-6">
					{#if matchesSortState == 1}
						<BiSortDown />
					{:else if matchesSortState == 2}
						<BiSortDownAlt />
					{/if}
				</div>
			</div>
			<div class="flex basis-1/3 items-center justify-center">
				<button on:click={() => handleWinRateSort()}>WINRATE</button>
				<div class="grow" />
				<div class="w-6">
					{#if winRateSortState == 1}
						<BiSortDown />
					{:else if winRateSortState == 2}
						<BiSortDownAlt />
					{/if}
				</div>
			</div>
			<div class="flex basis-1/3 items-center justify-center">
				<button on:click={() => handleImpactSort()}>IMPACT</button>
				<div class="grow" />
				<div class="w-6">
					{#if impactSortState == 1}
						<BiSortDown />
					{:else if impactSortState == 2}
						<BiSortDownAlt />
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div id="scrollbox" class="h-96 overflow-y-auto">
		{#each sortedStats as player}
			<div class="flex gap-2 py-1 pr-2 transition-all hover:bg-zinc-700 hover:bg-opacity-20">
				<div class="w-20">
					<button
						on:click={() => goto(`/player/${player.id}`)}
						class="duration-300 hover:text-zinc-400">{player.username}</button
					>
				</div>
				{#key order}
					<div class="flex grow items-center gap-4">
						<div class="basis-1/3">
							<div class="pb-1 text-sm opacity-85">{player.matches}</div>
							<Bar colour="#38bdf8" percentage={(player.matches / playerStats[0].matches) * 100} />
						</div>
						<div class="basis-1/3">
							<div class="pb-1 text-sm opacity-85">
								{Math.round(((player.radiantWins + player.direWins) / player.matches) * 1000) / 10}%
							</div>
							<Bar percentage={((player.radiantWins + player.direWins) / player.matches) * 100} />
						</div>
						<div
							class="basis-1/3"
							use:tippy={{
								content: `Impact: ${player.avgImpact}`,
								placement: 'bottom',
								theme: 'light'
							}}
						>
							<div class="pb-1 text-sm opacity-85">{calcImpact(player.avgImpact)}</div>
							<Bar percentage={(player.avgImpact / 140) * 100} colour="#9333ea" />
						</div>
					</div>
				{/key}
			</div>
		{/each}
	</div>
</div>

<style>
	#scrollbox::-webkit-scrollbar {
		width: 4px;
		background-color: #404040;
		margin-left: 4px;
	}

	#scrollbox::-webkit-scrollbar-thumb {
		background-color: #e7e5e4;
		border-radius: 64px;
	}
</style>
