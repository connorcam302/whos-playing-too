<script lang="ts">
	import { run } from 'svelte/legacy';

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

	import FxemojiPoo from '~icons/fxemoji/poo';
	import UilExchange from '~icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import MaterialSymbolsArrowBackRounded from '~icons/material-symbols/arrow-back-rounded';
	import MaterialSymbolsArrowForwardRounded from '~icons/material-symbols/arrow-forward-rounded';
	import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded';
	import IonLogoGameControllerB from '~icons/ion/logo-game-controller-b';
	import MaterialSymbolsCalendarMonth from '~icons/material-symbols/calendar-month';
	import SimpleIconsRedhat from '~icons/simple-icons/redhat';
	import Loading from '$lib/components/Loading.svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import WinChart from '$lib/components/profile/WinChart.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import tippy from 'sveltejs-tippy';
	import { blur, crossfade, draw, fade, fly, scale, slide } from 'svelte/transition';
	import MatchDropdown from '$lib/components/match/MatchDropdown.svelte';
	import { browser } from '$app/environment';
	import Bar from '$lib/components/stats/Bar.svelte';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';
	import IconamoonMenuBurgerHorizontalDuotone from '~icons/iconamoon/menu-burger-horizontal-duotone';
	import * as Select from '$lib/components/ui/select';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import * as Table from '$lib/components/ui/table';
	import dayjs from 'dayjs';
	import advancedFormat from 'dayjs/plugin/advancedFormat';
	import RoleDoughnut from '$lib/components/stats/RoleDoughnut.svelte';
	import { getRoleIcon, getRoleName, calcImpact } from '$lib/functions';

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

	let pos1 = $state(true);

	let pos2 = $state(true);

	let pos3 = $state(true);

	let pos4 = $state(true);

	let pos5 = $state(true);

	let ranked = $state(true);

	let unranked = $state(true);

	let smurfs = $state(false);

	let hero = $state(-1);

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
		let heroFilter = '';
		if (hero > 0) {
			heroFilter = `heroes=[${hero}]`;
		}
		let gameModes: string[] = ['ranked-all-pick', 'unranked-all-pick', 'other'];
		let gameModeFilter = '';
		if (ranked && unranked) {
			gameModeFilter = `gameMode=["${gameModes.join('","')}"]`;
		} else if (ranked) {
			gameModeFilter = `gameMode=["${gameModes[0]}"]`;
		} else if (unranked) {
			gameModeFilter = `gameMode=["${gameModes[1]}","${gameModes[2]}"]`;
		}
		let smurfFilter = 'false';
		if (smurfs) {
			smurfFilter = `smurf=true`;
		}

		pageNumber = pageNumber - 1;
		let roleFilter = 'roles=[';
		if (pos1) {
			roleFilter += '1,';
		}
		if (pos2) {
			roleFilter += '2,';
		}
		if (pos3) {
			roleFilter += '3,';
		}
		if (pos4) {
			roleFilter += '4,';
		}
		if (pos5) {
			roleFilter += '5,';
		}
		roleFilter = roleFilter.slice(0, -1) + ']';
		return await fetch(
			`/api/matches/all/profile/${playerId}?players=[${playerId}]&${heroFilter}&${gameModeFilter}&${pageNumberFilter}&${roleFilter}&${smurfFilter}`
		).then((res) => res.json());
	};

	onMount(() => updateMatchesData());

	const handleRoleChange = (role: number) => {
		let currentRole;
		switch (role) {
			case 1:
				currentRole = pos1;
				break;
			case 2:
				currentRole = pos2;
				break;
			case 3:
				currentRole = pos3;
				break;
			case 4:
				currentRole = pos4;
				break;
			case 5:
				currentRole = pos5;
				break;
		}
		if (
			Number(pos1) + Number(pos2) + Number(pos3) + Number(pos4) + Number(pos5) > 1 ||
			currentRole === false
		) {
			switch (role) {
				case 1:
					pos1 = !pos1;
					break;
				case 2:
					pos2 = !pos2;
					break;
				case 3:
					pos3 = !pos3;
					break;
				case 4:
					pos4 = !pos4;
					break;
				case 5:
					pos5 = !pos5;
					break;
			}

			updateMatchesData();
		}
	};

	const handleLobbyChange = (lobby: number) => {
		let currentLobby;
		switch (lobby) {
			case 0:
				currentLobby = unranked;
				break;
			case 7:
				currentLobby = ranked;
				break;
		}
		if (Number(ranked) + Number(unranked) > 1 || currentLobby === false) {
			switch (lobby) {
				case 0:
					unranked = !unranked;
					break;
				case 7:
					ranked = !ranked;
					break;
			}

			updateMatchesData();
		}
	};

	const handleSmurfChange = () => {
		smurfs = !smurfs;
	};
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

	let advancedFilters = $state(false);

	const toggleAdvancedFilters = () => {
		advancedFilters = !advancedFilters;
	};

	let chartType = $state('days');

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
		matchesByDay
	} = $derived(data);

	const toSteam32 = (accountId: string) => {
		return BigInt(accountId) - BigInt('76561197960265728');
	};

	$effect(() => {
		hero, ranked, unranked, smurfs, pos1, pos2, pos3, pos4, pos5 && updateMatchesData();
	});

	const mostCommonImpact = Object.keys(data.impactCounts).reduce(
		(maxRating, ratingName) => {
			// Sum the counts for the current rating
			const total = data.impactCounts[ratingName].reduce(
				(sum, item) => sum + Number(item.count),
				0
			);

			// Compare with the current maxRating
			if (total > maxRating.total) {
				return { rating: ratingName, total };
			}

			return maxRating;
		},
		{ rating: null, total: 0 }
	);
</script>

<svelte:head>
	<title>whos-playing | {player.username || 'Unknown'}</title>
</svelte:head>

<div class="w-full">
	{#key player}
		<div class="flex flex-wrap gap-4">
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
									<div class="text-xl text-impact">{averageStats.avgImpact}</div>
									<div class="text-xs text-zinc-400">Impact</div>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<Card.Root class="flex-1">
				<Card.Header>
					<Card.Title>Roles</Card.Title>
					<Card.Description>All time role stats.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col items-center gap-4">
						<div class="mx-auto h-32 w-32">
							<RoleDoughnut data={roleCounts} cutout={50} />
						</div>
						<div class="flex w-full flex-col">
							<div class="flex gap-4 border-b-2 border-zinc-800 pb-1 pt-2">
								<div class="w-8 text-zinc-400">Role</div>

								<div class="flex grow gap-4">
									<div class="basis-1/3 text-zinc-400">Matches</div>
									<div class="basis-1/3 text-zinc-400">Winrate</div>
									<div class="basis-1/3 text-zinc-400">Impact</div>
								</div>
							</div>
							<div class="flex flex-col gap-2">
								{#each roleCounts.slice().sort((a, b) => a.role - b.role) as role}
									<div class="flex gap-4">
										<div class="flex w-8 flex-col gap-0">
											<img
												class="h-8 w-8"
												src={getRoleIcon(role.role)}
												alt={getRoleName(role.role)}
											/>
										</div>
										<div class="flex grow gap-4">
											<div class="my-auto flex basis-1/3 flex-col gap-0">
												<div class="pb-1 text-sm opacity-85">{role.count}</div>
												<Bar
													colour="#38bdf8"
													percentage={(role.count /
														roleCounts.slice().sort((a, b) => b.count - a.count)[0].count) *
														100}
												/>
											</div>
											<div class="my-auto flex basis-1/3 flex-col gap-0">
												<div class="pb-1 text-sm opacity-85">
													{Math.round((role.wins / (role.wins + role.losses)) * 1000) / 10} %
												</div>
												<Bar percentage={(role.wins / (role.wins + role.losses)) * 100} />
											</div>
											<div class="my-auto flex basis-1/3 flex-col gap-0">
												<div class="pb-1 text-sm opacity-85">{calcImpact(role.avgImpact)}</div>
												<HoverCard.Root>
													<HoverCard.Trigger>
														<Bar colour="#9333EA" percentage={(role.avgImpact / 200) * 100} />
													</HoverCard.Trigger>
													<HoverCard.Content>
														Impact: {role.avgImpact}
													</HoverCard.Content>
												</HoverCard.Root>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root class="flex-1 grow">
				<Card.Header>
					<Card.Title>Stats</Card.Title>
					<Card.Description>Average of last 31 days.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div>
						{#await allTimeHeroStats then allTimeHeroStats}
							<HeroStatbox heroStats={allTimeHeroStats} height="h-[336px]" />
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
