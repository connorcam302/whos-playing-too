<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { onMount, getContext } from 'svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import PlayerStatbox from '$lib/components/stats/PlayerStatbox.svelte';
	import Features from '$lib/components/feature/Features.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import TeamOfTheWeek from '$lib/components/otw/TeamOfTheWeek.svelte';
	import FlopOfTheWeek from '$lib/components/otw/FlopOfTheWeek.svelte';
	import WhosPlaying from '$lib/components/WhosPlaying.svelte';
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';
	import IcOutlineCheck from '~icons/ic/outline-check';
	import MaterialSymbolsKeyboardBackspaceRounded from '~icons/material-symbols/keyboard-backspace-rounded';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';
	import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded';
	import * as Card from '$lib/components/ui/card/index.js';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);

	let { data } = $props();

	const { heroStats, playerStats, totw, features, timings, allPlayerSteamData, fotw } = data;
	let matchBlocks: any[] = $state([]);

	onMount(() => {
		fetch(`/api/matches/all?smurf=true`)
			.then((res) => res.json())
			.then((res) => {
				matchBlocks = res;
			});
	});

	let viewport = $derived(getContext('viewport'));

	let stats = $state('hero');

	const headers = ['totw', 'flop'];
	let header = $derived(headers[0]);
</script>

<svelte:head>
	<title>whos-playing | Home</title>
</svelte:head>

<div class="flex w-full flex-col items-center gap-4">
	<div class="flex w-full flex-col items-center justify-center">
		<div class="flex h-fit gap-4">
			<div>
				{#if header == 'totw'}
					<div in:fade={{ delay: 120, duration: 250 }}>
						<TeamOfTheWeek {totw} />
					</div>
				{:else if header == 'flop'}
					<div in:fade={{ duration: 250 }}>
						<FlopOfTheWeek {fotw} />
					</div>
				{/if}
			</div>
		</div>
		<div class="flex gap-2">
			{#each headers as h}
				<button
					class="h-2 w-2 rounded-full bg-white"
					style={`background-color: ${header === h ? '#e4e4e7' : '#3f3f46'}`}
					onclick={() => (header = h)}
				></button>
			{/each}
		</div>
	</div>

	<div class="flex w-full items-center justify-center">
		<div class="mt-2 flex max-w-[1600px] flex-col gap-2">
			<div class="my-2 flex flex-col items-center justify-center">
				<div class="flex justify-center text-3xl">RECORDS</div>
				<div class="text-sm text-zinc-400">
					Records from the past 7 days played on main accounts
				</div>
			</div>
			<div class="min-h-32">
				{#await features then features}
					<Features {features} />
				{/await}
			</div>
		</div>
	</div>
	<div>
		<div class="my-2 flex flex-col items-center justify-center">
			<div class="flex justify-center text-3xl">MATCHES & STATS</div>
			<div class="text-sm text-zinc-400">Recent matches, and stats from the past 14 days</div>
		</div>
		<div class="flex max-w-screen-2xl flex-col gap-4 md:flex-row">
			<div class="flex w-full grow flex-row items-center justify-center gap-4">
				<div class="mt-2 flex flex-col gap-2">
					<div class="flex flex-wrap justify-center gap-4">
						{#key matchBlocks}
							<div class="min-h-64" in:fade={{ duration: 500 }}>
								{#if matchBlocks.length == 0}
									<div class="flex h-full items-center justify-center">
										<div class="absolute">
											<Loading />
										</div>
									</div>
								{:else}
									<div class="flex flex-col gap-4">
										{#each matchBlocks.slice(0, 10) as match}
											<Card.Root>
												<Card.Content class="p-0 ">
													<MatchBlock {match} />
												</Card.Content>
											</Card.Root>
										{/each}
									</div>
								{/if}
							</div>
						{/key}
					</div>
				</div>
			</div>
			<div class="mt-2 flex grow-0 flex-col gap-2 md:max-w-[90vw]">
				{#if $viewport !== 'mobile'}
					<div class="flex w-full flex-col items-center justify-center gap-4">
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
				{:else}
					<div class="flex w-full">
						<button
							class="grow rounded-xl bg-zinc-800 px-4 py-2 text-white"
							style={`background-color: ${stats === 'player' ? '#27272a' : '#18181b'}`}
							onclick={() => (stats = 'player')}>Player</button
						>
						<button
							class="grow rounded-xl bg-zinc-800 px-4 py-2 text-white"
							style={`background-color: ${stats === 'hero' ? '#27272a' : '#18181b'}`}
							onclick={() => (stats = 'hero')}>Hero</button
						>
					</div>
					{#if stats === 'hero'}
						<div in:fade={{ duration: 250 }}>
							{#await heroStats then heroStats}
								<HeroStatbox {heroStats} />
							{/await}
						</div>
					{:else}
						<div in:fade={{ duration: 250 }}>
							{#await playerStats then playerStats}
								<PlayerStatbox {playerStats} />
							{/await}
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	#gradient-box {
		background: linear-gradient(45deg, #c47716, #2d6a75, #c14755, #4555a9, #3b9c75);
		background-size: 400% 400%; /* Make the gradient larger to ensure smooth transition */
		animation: rotate-gradient 5s linear infinite; /* Animation for rotating gradient */
	}

	@keyframes rotate-gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
