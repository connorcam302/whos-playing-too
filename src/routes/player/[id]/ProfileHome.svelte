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

	import MaterialSymbolsArrowBackRounded from '~icons/material-symbols/arrow-back-rounded';
	import MaterialSymbolsArrowForwardRounded from '~icons/material-symbols/arrow-forward-rounded';
	import Loading from '$lib/components/Loading.svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { blur, crossfade, draw, fade, fly, scale, slide } from 'svelte/transition';
	import MatchDropdown from '$lib/components/match/MatchDropdown.svelte';
	import { browser } from '$app/environment';
	import Bar from '$lib/components/stats/Bar.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import dayjs from 'dayjs';
	import advancedFormat from 'dayjs/plugin/advancedFormat';
	import RoleDoughnut from '$lib/components/stats/RoleDoughnut.svelte';
	import { getRoleIcon, getRoleName, calcImpact, getHeroIdSting } from '$lib/functions';
	import RoleStats from '$lib/components/stats/RoleStats.svelte';

	dayjs.extend(advancedFormat);

	interface Props {
		data: {
			roleCounts: { role: number; count: number }[];
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

	let matchBlocks = $state([]);

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
			const data = await fetchMatches(pageNumber, Number($page.params.id));
			matchBlocks = data;
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
		playerId,
		averageStats,
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

	let hero = $state('');

	$effect(() => {
		heroStats.then((stats) => {
			hero = getHeroIdSting(stats[0].hero.id).replace('npc_dota_hero_', '');
		});
	});
</script>

<svelte:head>
	<title>whos-playing | {player.username || 'Unknown'}</title>
</svelte:head>

<div class="w-full">
	{#key player}
		<div class="flex w-96 flex-wrap gap-4 md:w-full">
			<div class="flex w-full flex-col items-center justify-center gap-4 md:flex-row">
				<Card.Root class="w-96 flex-1 grow md:h-full md:w-full">
					<Card.Header>
						<Card.Title>Overall Performance</Card.Title>
						<Card.Description>All time win loss ratio.</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex w-full items-center gap-1">
							<div class=" text-green-400">{allTimeStats.wins}</div>
							<div class="">-</div>
							<div class="text-red-500">{allTimeStats.losses}</div>
						</div>
					</Card.Content>
					<Card.Footer>
						<div class="flex h-3 items-center justify-center gap-1">
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
				<Card.Root class="w-96 flex-1 grow md:h-full md:w-full">
					<Card.Header>
						<Card.Title>Recent Form</Card.Title>
						<Card.Description>Last 31 days.</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex w-full items-center gap-1">
							<div class=" text-green-400">{recentStats.wins}</div>
							<div class="">-</div>
							<div class="text-red-500">{recentStats.losses}</div>
						</div>
					</Card.Content>
					<Card.Footer>
						<div class="flex h-3 items-center justify-center gap-1">
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
				<Card.Root class="w-96 flex-1 grow md:h-full md:w-full">
					<Card.Header>
						<Card.Title>Stats</Card.Title>
						<Card.Description>Average of last 31 days.</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-col gap-2">
							<div class="flex justify-between">
								<div class="flex w-12 flex-col gap-0">
									<div class="text-xl text-green-300">{averageStats.avgKills}</div>
									<div class="text-xs text-zinc-400">Kills</div>
								</div>
								<div class="flex w-12 flex-col gap-0">
									<div class="text-xl text-red-400">{averageStats.avgDeaths}</div>
									<div class="text-xs text-zinc-400">Deaths</div>
								</div>
							</div>
							<div class="flex justify-between">
								<div class="flex w-12 flex-col gap-0">
									<div class="text-xl text-cyan-300">{averageStats.avgAssists}</div>
									<div class="text-xs text-zinc-400">Assists</div>
								</div>
								<div class="flex w-12 flex-col gap-0">
									<div class="text-impact text-xl">{averageStats.avgImpact}</div>
									<div class="text-xs text-zinc-400">Impact</div>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			{#if featuredHero}
				<Card.Root class="w-96 md:w-full md:grow">
					<Card.Header>
						<Card.Title>Featured Hero</Card.Title>
						<Card.Description>Biggest standout hero of the last 31 days.</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex items-center justify-between">
							<div class="flex w-full flex-col items-start gap-4">
								{#await featuredHero then featuredHero}
									<div class="text-5xl">{featuredHero.hero.name}</div>
									<div>
										<div class="text-xl">KDA</div>
										<div class="flex gap-1 text-lg">
											<div class=" text-green-300">{featuredHero.avgKills}</div>
											<div class="">/</div>
											<div class=" text-red-400">{featuredHero.avgDeaths}</div>
											<div class="">/</div>
											<div class=" text-cyan-300">{featuredHero.avgAssists}</div>
										</div>
									</div>
									<div class="flex flex-col gap-2">
										<div class="text-xl">Matches</div>
										<div class="text-lg">{featuredHero.matches}</div>
									</div>
									<div class="flex w-full max-w-64 grow flex-col gap-2">
										<div class="flex justify-between">
											<div>
												<div class="text-xl">Impact</div>
												<div class="text-sm text-zinc-400">
													{featuredHero.avgImpact}
												</div>
											</div>
											<div class="text-3xl">{calcImpact(featuredHero.avgImpact)}</div>
										</div>
										<Bar colour="#9333EA" percentage={(featuredHero.avgImpact / 140) * 100} />
									</div>
									<div class="flex w-full max-w-64 grow flex-col gap-2">
										<div class="flex justify-between">
											<div>
												<div class="text-xl">Winrate</div>
												<div class="flex gap-1 text-sm text-zinc-400">
													<div class="text-green-400">
														{featuredHero.radiantWins + featuredHero.direWins}
													</div>
													<div>-</div>
													<div class="text-red-400">
														{featuredHero.matches -
															featuredHero.radiantWins -
															featuredHero.direWins}
													</div>
												</div>
											</div>
											<div class="text-3xl">{featuredHero.winRate.toFixed(2)}%</div>
										</div>
										<Bar percentage={featuredHero.winRate} />
									</div>
								{/await}
							</div>
							<div class="max-w-96 overflow-hidden bg-no-repeat">
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
									alt="hero background"
									class="h-full w-full object-cover object-center"
								/>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
			<Card.Root class="w-96 md:w-full md:flex-1">
				<Card.Header>
					<Card.Title>Roles</Card.Title>
					<Card.Description>All time role stats.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col items-center gap-4">
						<div class="mx-auto h-32 w-32">
							<RoleDoughnut data={roleCounts} cutout={50} />
						</div>

						<RoleStats {roleCounts} />
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root class="w-96 md:w-full md:flex-1">
				<Card.Header>
					<Card.Title>Stats</Card.Title>
					<Card.Description>Average of all time stats.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div>
						{#await allTimeHeroStats then allTimeHeroStats}
							<HeroStatbox heroStats={allTimeHeroStats} height="h-[380px]" />
						{/await}
					</div>
				</Card.Content>
			</Card.Root>

			<div class="w-auto">
				{#key matchBlocks}
					<div class="min-h-64" in:fade={{ duration: 400 }}>
						{#if matchBlocks.length == 0}
							<div class="flex h-full items-center justify-center">
								<div class="h-64">
									<Loading />
								</div>
							</div>
						{:else}
							<div class="flex flex-col gap-2">
								<div
									class="justify-centerpy-3 mx-auto flex w-fit flex-col items-center gap-2 md:px-2"
								>
									{#each matchBlocks.slice(0, 20) as match}
										<Card.Root>
											<Card.Content class="p-0 ">
												<MatchDropdown {match} />
											</Card.Content>
										</Card.Root>
									{/each}
								</div>
								<div class="flex items-center justify-center gap-4">
									<button
										class="w-fit rounded-lg bg-sky-500 p-2 transition-all duration-300 hover:bg-sky-700 disabled:bg-zinc-800"
										disabled={pageNumber == 1}
										onclick={() => decrementPage()}
									>
										<MaterialSymbolsArrowBackRounded /></button
									>
									<div>{pageNumber}</div>
									<button
										class="w-fit rounded-lg bg-sky-500 p-2 transition-all duration-300 hover:bg-sky-700 disabled:bg-zinc-800"
										disabled={matchBlocks.length < 20}
										onclick={() => incrementPage()}
									>
										<MaterialSymbolsArrowForwardRounded />
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

<style>
	meta[name='description'] {
		white-space: pre-line;
	}

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
				0 0 8px var(--splus-accent1),
				0 0 10px var(--splus-accent1),
				0 0 12px var(--splus-accent1),
				0 0 14px var(--splus-accent1);
		}
		to {
			text-shadow:
				0 0 4px var(--splus-base),
				0 0 8px var(--splus-accent2),
				0 0 12px var(--splus-accent2),
				0 0 12px var(--splus-accent2),
				0 0 15px var(--splus-accent2),
				0 0 18px var(--splus-accent2),
				0 0 21px var(--splus-accent2);
		}
	}

	#frating {
		color: var(--f-base);
		animation: frating 1s ease-in-out infinite alternate;
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
		color: var(--splusplus-base);
		animation: ssrating 1s ease-in-out infinite alternate;
	}

	@keyframes ssrating {
		from {
			text-shadow:
				0 0 2px var(--splusplus-base),
				0 0 4px var(--splusplus-base),
				0 0 6px var(--splusplus-accent1),
				0 0 8px var(--splusplus-accent1),
				0 0 10px var(--splusplus-accent1),
				0 0 12px var(--splusplus-accent1),
				0 0 14px var(--splusplus-accent1);
		}

		to {
			text-shadow:
				0 0 4px var(--splusplus-base),
				0 0 8px var(--splusplus-accent2),
				0 0 12px var(--splusplus-accent2),
				0 0 16px var(--splusplus-accent2),
				0 0 20px var(--splusplus-accent2),
				0 0 24px var(--splusplus-accent2),
				0 0 28px var(--splusplus-accent2);
		}
	}

	@keyframes shine {
		0% {
			background-position: left;
		}
		50% {
			background-position: right;
		}
		100% {
			background-position: left;
		}
	}

	#scrollbox::-webkit-scrollbar {
		width: 4px;
		background-color: #404040;
	}

	#scrollbox::-webkit-scrollbar-thumb {
		background-color: #e7e5e4;
		border-radius: 64px;
	}
</style>
