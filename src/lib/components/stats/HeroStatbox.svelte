<script lang="ts">
	const heroStatsOriginal = heroStats;

	import BiSortDown from '~icons/bi/sort-down';
	import BiSortDownAlt from '~icons/bi/sort-down-alt';
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import tippy from 'sveltejs-tippy';
	import { calcImpact } from '../../functions';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import Bar from './Bar.svelte';
	interface Props {
		heroStats: {
			hero: DotaAsset;
			matches: number;
			radiantWins: number;
			direWins: number;
			avgImpact: number;
		}[];
	}

	let { heroStats }: Props = $props();

	let order = $state({ col: 'matches', direction: 'desc' });

	let heroSortState = $state(0);
	const handleHeroSort = () => {
		matchesSortState = 0;
		winRateSortState = 0;
		impactSortState = 0;
		if (heroSortState == 0) {
			heroSortState = 1;
			order = { col: 'hero', direction: 'desc' };
		} else if (heroSortState == 1) {
			heroSortState = 2;
			order = { col: 'hero', direction: 'asc' };
		} else {
			heroSortState = 0;
			order = { col: 'matches', direction: 'desc' };
		}
	};
	let matchesSortState = $state(0);
	const handleMachesSort = () => {
		heroSortState = 0;
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

	let winRateSortState = $state(0);
	const handleWinRateSort = () => {
		heroSortState = 0;
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

	let impactSortState = $state(0);
	const handleImpactSort = () => {
		heroSortState = 0;
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
		if (order.col == 'hero') {
			if (order.direction == 'desc') {
				return heroStats.slice().sort((a, b) => {
					if (a.hero.name < b.hero.name) {
						return -1;
					}
					if (a.hero.name > b.hero.name) {
						return 1;
					}
					return 0;
				});
			} else {
				return heroStats.slice().sort((a, b) => {
					if (a.hero.name > b.hero.name) {
						return -1;
					}
					if (a.hero.name < b.hero.name) {
						return 1;
					}
					return 0;
				});
			}
		} else if (order.col == 'matches') {
			if (order.direction == 'desc') {
				return heroStats.slice().sort((a, b) => {
					if (a.matches > b.matches) {
						return -1;
					}
					if (a.matches < b.matches) {
						return 1;
					}
					return 0;
				});
			} else {
				return heroStats.slice().sort((a, b) => {
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
				return heroStats.slice().sort((a, b) => {
					if ((a.radiantWins + a.direWins) / a.matches > (b.radiantWins + b.direWins) / b.matches) {
						return -1;
					}
					if ((a.radiantWins + a.direWins) / a.matches < (b.radiantWins + b.direWins) / b.matches) {
						return 1;
					}
					return 0;
				});
			} else {
				return heroStats.slice().sort((a, b) => {
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
				return heroStats.slice().sort((a, b) => {
					if (a.avgImpact > b.avgImpact) {
						return -1;
					}
					if (a.avgImpact < b.avgImpact) {
						return 1;
					}
					return 0;
				});
			} else {
				return heroStats.slice().sort((a, b) => {
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
			return heroStats;
		}
	};

	order = { col: 'matches', direction: 'desc' };
	let sortedStats = $derived(sortStats(order));
</script>

<div class="w-full max-w-[100vw]">
	<div class="border-b-2 border-zinc-800 pb-1 pt-2">
		<div class=" flex gap-2 px-2">
			<div class="flex w-16 items-center justify-center text-zinc-400">
				<button onclick={() => handleHeroSort()}>Hero</button>
				<div class="grow"></div>
				<div class="w-6">
					{#if heroSortState == 1}
						<BiSortDown />
					{:else if heroSortState == 2}
						<BiSortDownAlt />
					{/if}
				</div>
			</div>
			<div class="flex grow gap-2">
				<div class="flex basis-1/3 items-center justify-center text-zinc-400">
					<button onclick={() => handleMachesSort()}>Matches</button>
					<div class="grow"></div>
					<div class="w-6">
						{#if matchesSortState == 1}
							<BiSortDown />
						{:else if matchesSortState == 2}
							<BiSortDownAlt />
						{/if}
					</div>
				</div>
				<div class="flex basis-1/3 items-center justify-center text-zinc-400">
					<button onclick={() => handleWinRateSort()}>Winrate</button>
					<div class="grow"></div>
					<div class="w-6">
						{#if winRateSortState == 1}
							<BiSortDown />
						{:else if winRateSortState == 2}
							<BiSortDownAlt />
						{/if}
					</div>
				</div>
				<div class="flex basis-1/3 items-center justify-center text-zinc-400">
					<button onclick={() => handleImpactSort()}>Impact</button>
					<div class="grow"></div>
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
	</div>
	<div id="scrollbox" class="max-h-96 overflow-y-auto">
		<div class="flex flex-col px-2 py-1">
			{#each sortedStats as hero}
				<div class="flex gap-2 py-1 pr-2 transition-all hover:bg-zinc-700 hover:bg-opacity-20">
					<div class="w-16">
						<HoverCard.Root>
							<HoverCard.Trigger class="w-full">
								<img src={hero.hero.img} alt={`${hero.hero.id}-${hero.hero.name}`} class="w-14" />
							</HoverCard.Trigger>
							<HoverCard.Content class="w-fit text-sm">
								{hero.hero.name}
							</HoverCard.Content>
						</HoverCard.Root>
					</div>
					{#key order}
						<div class="flex grow items-center gap-4">
							<div class="basis-1/3">
								<div class="pb-1 text-sm opacity-85">{hero.matches}</div>
								<Bar
									colour="#38bdf8"
									percentage={(hero.matches / heroStatsOriginal[0].matches) * 100}
								/>
							</div>
							<div class="basis-1/3">
								<div class="pb-1 text-sm opacity-85">
									{Math.round(((hero.radiantWins + hero.direWins) / hero.matches) * 1000) / 10}%
								</div>
								<Bar percentage={((hero.radiantWins + hero.direWins) / hero.matches) * 100} />
							</div>
							<div class="basis-1/3">
								<HoverCard.Root>
									<HoverCard.Trigger class="w-full">
										<div class="pb-1 text-sm opacity-85">{calcImpact(hero.avgImpact)}</div>
										<Bar percentage={(hero.avgImpact / 140) * 100} colour="#9333ea" />
									</HoverCard.Trigger>
									<HoverCard.Content class="w-fit text-sm">
										Impact: {hero.avgImpact}
									</HoverCard.Content>
								</HoverCard.Root>
							</div>
						</div>
					{/key}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	#scrollbox::-webkit-scrollbar {
		width: 4px;
		background-color: #404040;
	}

	#scrollbox::-webkit-scrollbar-thumb {
		background-color: #e7e5e4;
		border-radius: 64px;
	}
</style>
