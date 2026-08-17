<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import PlayerStatbox from '$lib/components/stats/PlayerStatbox.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import TeamOfTheWeek from '$lib/components/otw/TeamOfTheWeek.svelte';
	import FlopOfTheWeek from '$lib/components/otw/FlopOfTheWeek.svelte';
	import WeeklyDigest from '$lib/components/digest/WeeklyDigest.svelte';
	import WeeklyDigestSkeleton from '$lib/components/digest/WeeklyDigestSkeleton.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let { data } = $props();

	let heroStats = $derived(data.heroStats);
	let playerStats = $derived(data.playerStats);
	let totw = $derived(data.totw);
	let fotw = $derived(data.fotw);
	let digest = $derived(data.digest);
	let matchBlocks: any[] = $state([]);
	let visibleMatchBlocks = $derived(Array.isArray(matchBlocks) ? matchBlocks : []);
	let refreshInProgress = false;

	const getMatchBlocks = (payload: unknown): any[] | null => {
		if (Array.isArray(payload)) return payload;
		if (
			typeof payload === 'object' &&
			payload !== null &&
			'matches' in payload &&
			Array.isArray(payload.matches)
		) {
			return payload.matches;
		}
		return null;
	};

	const refreshMatches = async (checkForNewMatch = false) => {
		if (refreshInProgress || document.hidden) return;

		refreshInProgress = true;
		try {
			if (checkForNewMatch && visibleMatchBlocks.length > 0) {
				const latestResponse = await fetch('/api/matches/latest', { cache: 'no-store' });
				if (!latestResponse.ok) return;

				const { id: latestMatchId } = await latestResponse.json();
				if (latestMatchId === visibleMatchBlocks[0]?.matchData?.id) return;
			}

			const response = await fetch('/api/matches/recent');
			if (!response.ok) return;

			const payload: unknown = await response.json();
			const nextMatchBlocks = getMatchBlocks(payload);
			if (!nextMatchBlocks) return;

			const currentLatestMatchId = visibleMatchBlocks[0]?.matchData?.id;
			const nextLatestMatchId = nextMatchBlocks[0]?.matchData?.id;

			matchBlocks = nextMatchBlocks;

			if (currentLatestMatchId && nextLatestMatchId !== currentLatestMatchId) {
				await invalidateAll();
			}
		} catch {
			// Keep the existing matches visible and try again on the next poll.
		} finally {
			refreshInProgress = false;
		}
	};

	onMount(() => {
		void refreshMatches();

		const refreshInterval = window.setInterval(() => {
			void refreshMatches(true);
		}, 60_000);
		const refreshWhenVisible = () => {
			if (!document.hidden) void refreshMatches(true);
		};

		document.addEventListener('visibilitychange', refreshWhenVisible);

		return () => {
			window.clearInterval(refreshInterval);
			document.removeEventListener('visibilitychange', refreshWhenVisible);
		};
	});

	const headers = ['totw', 'flop'];
	let header = $state('totw');
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
		<!-- Matches & Stats -->
		<section class="mt-6 mb-12">
			<div class="flex flex-col gap-6 xl:flex-row xl:gap-4">
				<!-- Recent Matches (left on large screens) -->
				<div class="min-w-0 xl:flex-1">
					{#key visibleMatchBlocks}
						<div in:fade={{ duration: 400 }}>
							{#if visibleMatchBlocks.length === 0}
								<div class="flex min-h-48 items-center justify-center">
									<Loading />
								</div>
							{:else}
								<div class="flex min-w-0 flex-col gap-2">
									{#each visibleMatchBlocks.slice(0, 10) as match}
										<Card.Root class="min-w-0 overflow-hidden">
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
					{#await digest}
						<WeeklyDigestSkeleton />
					{:then resolvedDigest}
						<WeeklyDigest digest={resolvedDigest} />
					{:catch}
						<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none">
							<Card.Header class="px-4 pt-4 pb-0">
								<Card.Title class="text-base">Weekly Timeline</Card.Title>
								<Card.Description class="text-xs text-zinc-400">Last seven days.</Card.Description>
							</Card.Header>
							<Card.Content class="px-4 pt-3 pb-4 text-xs text-zinc-400">
								Timeline unavailable. Try refreshing.
							</Card.Content>
						</Card.Root>
					{/await}
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
</style>
