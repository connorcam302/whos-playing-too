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

	import Loading from '$lib/components/Loading.svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import MatchDropdown from '$lib/components/match/MatchDropdown.svelte';
	import { browser } from '$app/environment';
	import Bar from '$lib/components/stats/Bar.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import dayjs from 'dayjs';
	import advancedFormat from 'dayjs/plugin/advancedFormat';
	import RoleDoughnut from '$lib/components/stats/RoleDoughnut.svelte';
	import { calcImpact, getHeroIdSting } from '$lib/functions';
	import RoleStats from '$lib/components/stats/RoleStats.svelte';
	import { ArrowLeft, ArrowRight } from 'lucide-svelte';

	dayjs.extend(advancedFormat);

	interface Props {
		data: {
			roleCounts: any[];
			player: Player;
			mainAccount: SteamProfile;
			smurfAccounts: SteamProfile[];
			allTimeStats: Stats;
			recentStats: Stats;
			heroStats: any;
			featuredHero: any;
			allTimeHeroStats: any;
			winGraph: { resultsArray: number[]; daysArray: number[] };
			heroList: { id: number; name: string }[];
			impactCounts: object;
			matchesByDay: { wins: number; losses: number; date: number }[];
			averageStats: {
				avgImpact: number;
				avgKills: number;
				avgDeaths: number;
				avgAssists: number;
				avgGpm: number;
				avgXpm: number;
				avgLastHits: number;
			};
		};
	}

	let { data }: Props = $props();

	let pageNumber = $state(1);

	let matchBlocks: any[] = $state([]);

	onMount(() => {
		if ($page.url.searchParams.get('page')) {
			pageNumber = Number($page.url.searchParams.get('page'));
		}
		fetchMatches(pageNumber, Number($page.params.id));
	});

	const fetchMatches = async (pageNumber: number, playerId: number) => {
		matchBlocks = [];
		let pageNumberFilter = '';
		if (pageNumber > -1) {
			pageNumberFilter = `page=${pageNumber - 1}`;
		}
		pageNumber = pageNumber - 1;
		return await fetch(
			`/api/matches/all/profile/${playerId}?players=[${playerId}]&${pageNumberFilter}`
		).then((res) => res.json());
	};

	onMount(() => updateMatchesData());

	const updateMatchesData = async () => {
		if (browser) {
			matchBlocks = [];
			const response = await fetchMatches(pageNumber, Number($page.params.id));
			matchBlocks = Array.isArray(response) ? response : (response.matches ?? []);
		}
	};

	const incrementPage = () => {
		pageNumber++;
		updateMatchesData();
	};

	const decrementPage = () => {
		pageNumber--;
		updateMatchesData();
	};

	let {
		roleCounts,
		averageStats: loadedAverageStats,
		player,
		mainAccount,
		smurfAccounts,
		allTimeStats,
		recentStats,
		heroStats,
		allTimeHeroStats,
		winGraph,
		heroList,
		matchesByDay,
		featuredHero
	} = $derived(data);

	let averageStats = $derived(
		loadedAverageStats ?? {
			avgImpact: 0,
			avgKills: 0,
			avgDeaths: 0,
			avgAssists: 0,
			avgGpm: 0,
			avgXpm: 0,
			avgLastHits: 0
		}
	);

	let hero = $state('');

	$effect(() => {
		heroStats
			.then((stats: any[]) => {
				if (stats[0]?.hero?.id) {
					hero = getHeroIdSting(stats[0].hero.id).replace('npc_dota_hero_', '');
				}
			})
			.catch(() => {
				hero = '';
			});
	});
</script>

<svelte:head>
	<title>whos-playing | {player.username || 'Unknown'}</title>
</svelte:head>

<div class="w-full min-w-0">
	{#key player}
		<div class="flex min-w-0 flex-col gap-4">
			<div class="grid w-full gap-4 md:grid-cols-3">
				<Card.Root class="min-w-0">
					<Card.Header>
						<Card.Title>Overall Performance</Card.Title>
						<Card.Description>All-time match record.</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex w-full items-baseline gap-2 tabular-nums">
							<div class="text-2xl font-semibold text-green-400">{allTimeStats.wins}</div>
							<div class="text-zinc-500">-</div>
							<div class="text-red-500">{allTimeStats.losses}</div>
						</div>
					</Card.Content>
					<Card.Footer>
						<div class="flex h-3 w-full items-center gap-1">
							{#each matchBlocks.slice(0, 12) as match}
								{#if match.matchData.winner === match.player.team}
									<HoverCard.Root>
										<HoverCard.Trigger>
											<div class="h-3 w-3 rounded-sm bg-green-400 hover:bg-green-600"></div>
										</HoverCard.Trigger>
										<HoverCard.Content class="w-fit"
											><div class="w-full"><MatchBlock {match} /></div></HoverCard.Content
										>
									</HoverCard.Root>
								{:else}
									<HoverCard.Root>
										<HoverCard.Trigger>
											<div class="h-3 w-3 rounded-sm bg-red-500 hover:bg-red-600"></div>
										</HoverCard.Trigger>
										<HoverCard.Content class="w-fit p-0"
											><div class="object-fit w-full">
												<MatchBlock {match} />
											</div></HoverCard.Content
										>
									</HoverCard.Root>
								{/if}
							{/each}
						</div>
					</Card.Footer>
				</Card.Root>
				<Card.Root class="min-w-0">
					<Card.Header>
						<Card.Title>Recent Form</Card.Title>
						<Card.Description>Last 31 days.</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex w-full items-baseline gap-2 tabular-nums">
							<div class="text-2xl font-semibold text-green-400">{recentStats.wins}</div>
							<div class="text-zinc-500">-</div>
							<div class="text-red-500">{recentStats.losses}</div>
						</div>
					</Card.Content>
					<Card.Footer>
						<div class="flex h-3 w-full items-center gap-1 overflow-hidden">
							{#each matchesByDay as day}
								<HoverCard.Root>
									<HoverCard.Trigger>
										{#if day.wins === 0 && day.losses === 0}
											<div class="h-3 w-3 rounded-sm bg-zinc-400 hover:bg-zinc-600"></div>
										{:else if day.wins === day.losses}
											<div class="h-3 w-3 rounded-sm bg-amber-400 hover:bg-amber-600"></div>
										{:else if day.wins > day.losses}
											{#if day.wins > day.losses + 3}
												<div
													class="h-3 w-3 animate-pulse rounded-sm bg-green-300 hover:bg-green-300/70"
												></div>
											{:else}
												<div class="h-3 w-3 rounded-sm bg-green-600 hover:bg-green-600/70"></div>
											{/if}
										{:else if day.wins < day.losses}
											{#if day.wins + 3 > day.losses}
												<div class="h-3 w-3 rounded-sm bg-red-500 hover:bg-red-500/70"></div>
											{:else}
												<div
													class=" h-3 w-3 animate-pulse rounded-sm bg-red-600 hover:bg-red-600/70"
												></div>
											{/if}
										{/if}
									</HoverCard.Trigger>
									<HoverCard.Content class="p-0">
										<Card.Root class="flex-1 border-0">
											<Card.Header>
												<Card.Title class="text-sm"
													>{dayjs.unix(day.date).format('dddd Do [of] MMMM')}</Card.Title
												>
											</Card.Header>
											<Card.Content>
												<div class="flex w-full items-center gap-1">
													<div class=" text-green-400">{day.wins}</div>
													<div class="">-</div>
													<div class="text-red-500">{day.losses}</div>
												</div>
											</Card.Content>
										</Card.Root>
									</HoverCard.Content>
								</HoverCard.Root>
							{/each}
						</div>
					</Card.Footer>
				</Card.Root>
				<Card.Root class="min-w-0">
					<Card.Header>
						<Card.Title>Stats</Card.Title>
						<Card.Description>Average of last 31 days.</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-col gap-2">
							<div class="grid grid-cols-2 gap-3">
								<div class="flex flex-col gap-0 rounded-md bg-zinc-900/70 px-3 py-2">
									<div class="text-xl text-green-300">{averageStats.avgKills}</div>
									<div class="text-xs text-zinc-400">Kills</div>
								</div>
								<div class="flex flex-col gap-0 rounded-md bg-zinc-900/70 px-3 py-2">
									<div class="text-xl text-red-400">{averageStats.avgDeaths}</div>
									<div class="text-xs text-zinc-400">Deaths</div>
								</div>
								<div class="flex flex-col gap-0 rounded-md bg-zinc-900/70 px-3 py-2">
									<div class="text-xl text-cyan-300">{averageStats.avgAssists}</div>
									<div class="text-xs text-zinc-400">Assists</div>
								</div>
								<div class="flex flex-col gap-0 rounded-md bg-zinc-900/70 px-3 py-2">
									<div class="text-impact text-xl">{averageStats.avgImpact}</div>
									<div class="text-xs text-zinc-400">Impact</div>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			{#if featuredHero}
				<Card.Root class="min-w-0 overflow-hidden">
					<Card.Header>
						<Card.Title>Featured Hero</Card.Title>
						<Card.Description>Biggest standout hero of the last 31 days.</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
							<div class="flex w-full flex-col items-start gap-4">
								{#await featuredHero then featuredHeroData}
									{#if featuredHeroData}
									<div class="text-2xl font-semibold text-zinc-100">{featuredHeroData.hero.name}</div>
									<div class="grid w-full gap-3 sm:grid-cols-3">
										<div class="rounded-md bg-zinc-900/70 px-3 py-2">
											<div class="text-xs uppercase tracking-wide text-zinc-500">KDA</div>
											<div class="mt-1 flex gap-1 text-lg tabular-nums">
											<div class=" text-green-300">{featuredHeroData.avgKills}</div>
											<div class="">/</div>
											<div class=" text-red-400">{featuredHeroData.avgDeaths}</div>
											<div class="">/</div>
											<div class=" text-cyan-300">{featuredHeroData.avgAssists}</div>
										</div>
									</div>
										<div class="rounded-md bg-zinc-900/70 px-3 py-2">
											<div class="text-xs uppercase tracking-wide text-zinc-500">Matches</div>
											<div class="mt-1 text-lg tabular-nums text-zinc-100">{featuredHeroData.matches}</div>
										</div>
										<div class="rounded-md bg-zinc-900/70 px-3 py-2">
											<div class="text-xs uppercase tracking-wide text-zinc-500">Grade</div>
											<div class="mt-1 text-lg text-zinc-100">{calcImpact(featuredHeroData.avgImpact)}</div>
										</div>
									</div>
									<div class="flex w-full max-w-xl grow flex-col gap-2">
										<div class="flex justify-between">
											<div>
												<div class="text-sm font-medium text-zinc-200">Impact</div>
												<div class="text-sm text-zinc-400">
													{featuredHeroData.avgImpact}
												</div>
											</div>
										</div>
										<Bar colour="#9333EA" percentage={(featuredHeroData.avgImpact / 140) * 100} />
									</div>
									<div class="flex w-full max-w-xl grow flex-col gap-2">
										<div class="flex justify-between">
											<div>
												<div class="text-sm font-medium text-zinc-200">Win Rate</div>
												<div class="flex gap-1 text-sm text-zinc-400">
													<div class="text-green-400">
														{featuredHeroData.radiantWins + featuredHeroData.direWins}
													</div>
													<div>-</div>
													<div class="text-red-400">
														{featuredHeroData.matches -
															featuredHeroData.radiantWins -
															featuredHeroData.direWins}
													</div>
												</div>
											</div>
											<div class="text-xl font-semibold tabular-nums text-zinc-100">{featuredHeroData.winRate.toFixed(2)}%</div>
										</div>
										<Bar percentage={featuredHeroData.winRate} />
									</div>
									{:else}
										<div class="text-sm text-zinc-400">No featured hero yet.</div>
									{/if}
								{/await}
							</div>
							<div class="hidden max-h-80 overflow-hidden rounded-md bg-zinc-950 bg-no-repeat lg:block">
								<!---
								<video
									autoplay
									muted
									loop
									playsinline
									class="h-full w-full object-cover object-center opacity-100"
								>
									<source
										type="video/webm"
										src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero}.webm`}
										class="h-full w-full"
									/>
								</video>
								--->
								<img
									src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero}.png`}
										alt="Featured hero render"
									class="h-full w-full object-cover object-center"
								/>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
			<div class="grid gap-4 lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.25fr)]">
			<Card.Root class="min-w-0">
				<Card.Header>
					<Card.Title>Roles</Card.Title>
					<Card.Description>All time role stats.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col items-center gap-4">
						<div class="mx-auto h-32 w-32">
							<RoleDoughnut data={roleCounts} cutout={50} />
						</div>

							<div class="w-full overflow-x-auto">
								<RoleStats {roleCounts} />
							</div>
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root class="min-w-0">
				<Card.Header>
					<Card.Title>Stats</Card.Title>
					<Card.Description>Average of all time stats.</Card.Description>
				</Card.Header>
				<Card.Content>
						<div class="overflow-x-auto">
							{#await allTimeHeroStats then allTimeHeroStats}
								<HeroStatbox heroStats={allTimeHeroStats} height="h-[380px]" />
							{/await}
					</div>
				</Card.Content>
			</Card.Root>

			</div>

			<div class="w-full min-w-0">
				{#key matchBlocks}
					<div class="min-h-64" in:fade={{ duration: 400 }}>
						{#if matchBlocks.length == 0}
							<div class="flex h-full items-center justify-center">
								<div class="h-64">
									<Loading />
								</div>
							</div>
						{:else}
							<div class="flex flex-col gap-3">
								<div class="mx-auto flex w-full max-w-5xl flex-col items-stretch gap-3 py-2">
									{#each matchBlocks.slice(0, 20) as match}
										<Card.Root>
											<Card.Content class="p-0 ">
												<MatchDropdown {match} />
											</Card.Content>
										</Card.Root>
									{/each}
								</div>
								<div class="flex items-center justify-center gap-3">
									<button
										class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 transition-colors duration-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-600"
										disabled={pageNumber == 1}
										onclick={() => decrementPage()}
									>
										<ArrowLeft class="h-4 w-4" /></button
									>
									<div class="min-w-10 text-center text-sm tabular-nums text-zinc-300">{pageNumber}</div>
									<button
										class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 transition-colors duration-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-600"
										disabled={matchBlocks.length < 20}
										onclick={() => incrementPage()}
									>
										<ArrowRight class="h-4 w-4" />
									</button>
								</div>
							</div>
						{/if}
					</div>
				{/key}
			</div>
		</div>
	{/key}
</div>
