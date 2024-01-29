<script lang="ts">
	export let heroStats: {
		hero: DotaAsset;
		matches: number;
		radiantWins: number;
		direWins: number;
		avgImpact: number;
	}[];

	const heroStatsOriginal = heroStats;

	import BiSortDown from '~icons/bi/sort-down';
	import BiSortDownAlt from '~icons/bi/sort-down-alt';
	import tippy from 'sveltejs-tippy';
	import { calcImpact } from '../../functions';
	import Bar from './Bar.svelte';

	let order = { col: 'matches', direction: 'desc' };

	let heroSortState = 0;
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
	let matchesSortState = 0;
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

	let winRateSortState = 0;
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

	let impactSortState = 0;
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
	$: sortedStats = sortStats(order);
</script>

<div
	class="bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 py-2 px-4 rounded-xl"
>
	<div class="flex gap-2 my-1 pr-2 pb-1 border-white border-b-[1px] border-opacity-30">
		<div class="flex w-16 justify-center items-center">
			<button on:click={() => handleHeroSort()}>HERO</button>
			<div class="grow" />
			<div class="w-6">
				{#if heroSortState == 1}
					<BiSortDown />
				{:else if heroSortState == 2}
					<BiSortDownAlt />
				{/if}
			</div>
		</div>
		<div class="flex grow gap-2">
			<div class="flex basis-1/3 justify-center items-center">
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
			<div class="flex basis-1/3 justify-center items-center">
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
			<div class="flex basis-1/3 justify-center items-center">
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
	<div id="scrollbox" class="overflow-y-auto max-h-96">
		{#each sortedStats as hero}
			<div class="flex gap-2 py-1 pr-2 hover:bg-neutral-700 hover:bg-opacity-20 transition-all">
				<div class="w-16">
					<img src={hero.hero.img} alt={`${hero.hero.id}-${hero.hero.name}`} class="w-14" />
				</div>
				{#key order}
					<div class="flex grow gap-4 items-center">
						<div class="basis-1/3">
							<div class="text-sm opacity-85 pb-1">{hero.matches}</div>
							<Bar
								colour="#f43f5e"
								percentage={(hero.matches / heroStatsOriginal[0].matches) * 100}
							/>
						</div>
						<div class="basis-1/3">
							<div class="text-sm opacity-85 pb-1">
								{Math.round(((hero.radiantWins + hero.direWins) / hero.matches) * 1000) / 10}%
							</div>
							<Bar percentage={((hero.radiantWins + hero.direWins) / hero.matches) * 100} />
						</div>
						<div
							class="basis-1/3"
							use:tippy={{
								content: `Impact: ${hero.avgImpact}`,
								placement: 'bottom',
								theme: 'light'
							}}
						>
							<div class="text-sm opacity-85 pb-1">{calcImpact(hero.avgImpact)}</div>
							<Bar percentage={(hero.avgImpact / 140) * 100} colour="#9333ea" />
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
	}

	#scrollbox::-webkit-scrollbar-thumb {
		background-color: #e7e5e4;
		border-radius: 64px;
	}
</style>
