<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import PlayerStatbox from '$lib/components/stats/PlayerStatbox.svelte';
	import FeatureBox from '$lib/components/feature/FeatureBox.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import TeamOfTheWeek from '$lib/components/otw/TeamOfTheWeek.svelte';
	import FlopOfTheWeek from '$lib/components/otw/FlopOfTheWeek.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let { data } = $props();

	const { heroStats, playerStats, totw, features, fotw } = data;
	let matchBlocks: any[] = $state([]);

	onMount(() => {
		fetch(`/api/matches/all?smurf=true`)
			.then((res) => res.json())
			.then((res) => {
				matchBlocks = res;
			});
	});

	const headers = ['totw', 'flop'];
	let header = $state('totw');

	const makeFeatureItems = (f: any) => [
		{ data: f.mostKills, title: 'Most Kills', type: 'kills' },
		{ data: f.mostDeaths, title: 'Most Deaths', type: 'deaths' },
		{ data: f.mostAssists, title: 'Most Assists', type: 'assists' },
		{ data: f.mostGPM, title: 'Most GPM', type: 'gpm' },
		{ data: f.mostXPM, title: 'Most XPM', type: 'xpm' },
		{ data: f.mostImpact, title: 'Most Impact', type: 'impact' },
		{ data: f.leastImpact, title: 'Least Impact', type: 'impact' },
		{ data: f.mostLastHits, title: 'Most Last Hits', type: 'lastHits' },
		{ data: f.mostHeroDamage, title: 'Most Hero Damage', type: 'heroDamage' },
		{ data: f.leastHeroDamage, title: 'Least Hero Damage', type: 'heroDamage' },
		{ data: f.mostGained, title: 'Most MMR Gained', type: 'winLoss' },
		{ data: f.mostLost, title: 'Most MMR Lost', type: 'winLoss' }
	];
</script>

<svelte:head>
	<title>whos-playing | Home</title>
</svelte:head>

<div class="flex w-full flex-col items-center">
	<!-- TOTW / FOTW Banner (untouched) -->
	<div class="hero-backdrop w-full">
		<div class="flex w-full flex-col items-center justify-center px-4 py-8">
			<div class="flex h-fit">
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
			<div class="mt-4 flex gap-2">
				{#each headers as h}
					<button
						class="h-2 w-2 rounded-full transition-colors duration-300"
						style={`background-color: ${header === h ? '#e4e4e7' : '#3f3f46'}`}
						onclick={() => (header = h)}
						aria-label={h}
					></button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="mx-auto w-full max-w-7xl px-4">
		<!-- 7-Day Records -->
		<section class="mt-10 mb-8">
			<div class="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
				7-Day Records
			</div>
			{#await features then resolvedFeatures}
				<div class="records-grid">
					{#each makeFeatureItems(resolvedFeatures) as item}
						{#if item.data && item.data.length >= 3}
							<FeatureBox data={item.data} title={item.title} type={item.type} />
						{/if}
					{/each}
				</div>
			{/await}
		</section>

		<!-- Matches & Stats -->
		<section class="mb-12">
			<div class="flex flex-col gap-6 xl:flex-row xl:gap-4">
				<!-- Recent Matches (left on large screens) -->
				<div class="min-w-0 xl:flex-1">
					{#key matchBlocks}
						<div in:fade={{ duration: 400 }}>
							{#if matchBlocks.length === 0}
								<div class="flex min-h-48 items-center justify-center">
									<Loading />
								</div>
							{:else}
								<div class="flex flex-col gap-2">
									{#each matchBlocks.slice(0, 10) as match}
										<Card.Root class="w-fit overflow-hidden">
											<Card.Content class="p-0">
												<MatchBlock {match} />
											</Card.Content>
										</Card.Root>
									{/each}
								</div>
							{/if}
						</div>
					{/key}
				</div>

				<!-- Stats (right on large screens) -->
				<div class="flex w-full flex-col gap-4 xl:w-[480px] xl:shrink-0">
					<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
						<Card.Header class="px-4 pt-4 pb-0">
							<Card.Title class="text-base">Hero Stats</Card.Title>
							<Card.Description class="text-xs text-zinc-400">Most played heroes, last 14 days.</Card.Description>
						</Card.Header>
						<Card.Content class="px-4 pt-3 pb-4">
							{#await heroStats then heroStats}
								<HeroStatbox {heroStats} height="h-72" />
							{/await}
						</Card.Content>
					</Card.Root>
					<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
						<Card.Header class="px-4 pt-4 pb-0">
							<Card.Title class="text-base">Player Stats</Card.Title>
							<Card.Description class="text-xs text-zinc-400">Player performance, last 14 days.</Card.Description>
						</Card.Header>
						<Card.Content class="px-4 pt-3 pb-4">
							{#await playerStats then playerStats}
								<PlayerStatbox {playerStats} />
							{/await}
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	.hero-backdrop {
		background:
			linear-gradient(180deg, rgba(15, 20, 25, 0) 0%, rgba(15, 20, 25, 0.95) 100%),
			url('/hero-background.png');
		background-size: cover;
		background-position: center;
		position: relative;
		overflow: hidden;
	}

	.hero-backdrop::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(180deg, transparent 30%, rgba(15, 20, 25, 0.95) 100%);
		z-index: 0;
	}

	.hero-backdrop > * {
		position: relative;
		z-index: 1;
	}

	.records-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.75rem;
	}
</style>
