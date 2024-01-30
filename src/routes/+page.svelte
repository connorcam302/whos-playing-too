<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import PlayerStatbox from '$lib/components/stats/PlayerStatbox.svelte';
	import Features from '$lib/components/feature/Features.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import TeamOfTheWeek from '$lib/components/totw/TeamOfTheWeek.svelte';
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';
	import IcOutlineCheck from '~icons/ic/outline-check';
	import MaterialSymbolsKeyboardBackspaceRounded from '~icons/material-symbols/keyboard-backspace-rounded';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';
	import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded';

	export let data;

	const { heroStats, playerStats, totw, features, timings } = data;
	console.log(timings);
	let matchBlocks: any[] = [];

	onMount(() => {
		fetch(`/api/matches/all`)
			.then((res) => res.json())
			.then((res) => {
				matchBlocks = res;
			});
	});
</script>

<div class="flex flex-col items-center gap-4">
	<div>
		<TeamOfTheWeek {totw} />
	</div>
	<div class="flex flex-col gap-2 mt-2 max-w-screen-xl">
		<div class="flex">
			<button class="flex items-center gap-2" on:click={() => goto('/records')}>
				<div class="text-lg">Records</div>
				<div><MaterialSymbolsArrowForwardIosRounded /></div>
			</button>
			<div class="grow" />
			<div>Last 7 Days</div>
		</div>
		<div class="min-h-32">
			{#await features then features}
				<Features {features} />
			{/await}
		</div>
	</div>
	<div class="flex flex-row gap-4">
		<div class="flex flex-col gap-2 mt-2">
			<div class="flex">
				<button class="flex items-center gap-2" on:click={() => goto('/matches')}>
					<div class="text-lg">Matches</div>
					<div><MaterialSymbolsArrowForwardIosRounded /></div>
				</button>
			</div>
			<div class="flex flex-wrap gap-4 justify-center">
				{#key matchBlocks}
					<div class="w-[812px] min-h-64" in:fade={{ duration: 500 }}>
						{#if matchBlocks.length == 0}
							<div class="flex justify-center items-center h-full">
								<div class="absolute">
									<Loading />
								</div>
							</div>
						{:else}
							<div>
								{#each matchBlocks.slice(0, 10) as match}
									<div class="mb-2">
										<MatchBlock {match} />
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/key}
			</div>
		</div>
		<div class="flex flex-col gap-2 w-full mt-2">
			<div class="flex">
				<button class="flex items-center gap-2" on:click={() => goto('/stats')}>
					<div class="text-lg">Stats</div>
					<div><MaterialSymbolsArrowForwardIosRounded /></div>
				</button>
				<div class="grow" />
				<div>Last 14 Days</div>
			</div>
			<div class="flex flex-col gap-4 items-center justify-center">
				<div class="w-full">
					{#await heroStats then heroStats}
						<HeroStatbox {heroStats} />
					{/await}
				</div>
				<div class="w-full">
					{#await playerStats then playerStats}
						<PlayerStatbox {playerStats} />
					{/await}
				</div>
			</div>
		</div>
	</div>
</div>
