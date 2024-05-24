<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
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
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);

	export let data;

	const { heroStats, playerStats, totw, features, timings, allPlayerSteamData, fotw } = data;
	let matchBlocks: any[] = [];

	onMount(() => {
		fetch(`/api/matches/all?smurf=true`)
			.then((res) => res.json())
			.then((res) => {
				matchBlocks = res;
			});
	});

	$: viewport = getContext('viewport');

	$: stats = 'hero';

	const headers = ['totw', 'flop'];
	$: header = headers[0];
</script>

<svelte:head>
	<title>whos-playing | Home</title>
</svelte:head>

<div class="flex w-full flex-col items-center gap-4">
	<div class="flex w-full flex-col items-center justify-center">
		<div class="flex h-fit gap-4">
			<div>
				<TeamOfTheWeek {totw} />
				<!-- 
                    {#if header == 'totw'}
						<div in:fade={{ duration: 250 }}>
							<TeamOfTheWeek {totw} />
						</div>
					{:else if header == 'flop'}
						<div in:fade={{ duration: 250 }}>
							<FlopOfTheWeek {fotw} />
						</div>
					{/if}
                    -->
			</div>
		</div>
		<!-- 
			<div class="flex gap-2">
				{#each headers as h}
					<button
						class="h-2 w-2 rounded-full bg-white"
						style={`background-color: ${header === h ? '#e4e4e7' : '#3f3f46'}`}
						on:click={() => (header = h)}
					/>
				{/each}
			</div>
                    -->
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
			<div class="flex w-full grow flex-row items-center justify-center gap-4 bg-zinc-900">
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
									<div class="flex flex-col gap-2">
										{#each matchBlocks.slice(0, 10) as match}
											<div class="mx-1 md:mx-0">
												<MatchBlock {match} />
											</div>
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
							on:click={() => (stats = 'player')}>Player</button
						>
						<button
							class="grow rounded-xl bg-zinc-800 px-4 py-2 text-white"
							style={`background-color: ${stats === 'hero' ? '#27272a' : '#18181b'}`}
							on:click={() => (stats = 'hero')}>Hero</button
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
