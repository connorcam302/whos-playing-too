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
	};
	type Stats = {
		wins: number;
		losses: number;
		rankedWins: number;
		rankedLosses: number;
	};

	import UilExchange from '~icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import MaterialSymbolsArrowBackRounded from '~icons/material-symbols/arrow-back-rounded';
	import MaterialSymbolsArrowForwardRounded from '~icons/material-symbols/arrow-forward-rounded';
	import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded';
	import IonLogoGameControllerB from '~icons/ion/logo-game-controller-b';
	import MaterialSymbolsCalendarMonth from '~icons/material-symbols/calendar-month';
	import Loading from '$lib/components/Loading.svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import WinChart from '$lib/components/profile/WinChart.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import tippy from 'sveltejs-tippy';

	export let data: {
		player: Player;
		mainAccount: SteamProfile;
		smurfAccounts: SteamProfile[];
		allTimeStats: Stats;
		weeklyStats: Stats;
		heroStats: any;
		winGraph: { resultsArray: number[]; daysArray: number[] };
	};

	$: pageNumber = 1;
	$: incrementDisabled = false;
	$: decrementDisabled = false;
	$: matchBlocks = [];

	onMount(() => {
		if ($page.url.searchParams.get('page')) {
			pageNumber = Number($page.url.searchParams.get('page'));
		}
		fetchMatches(pageNumber, Number($page.params.id));
	});

	const fetchMatches = (pageNumber: number, playerId: number) => {
		matchBlocks = [];
		pageNumber = pageNumber - 1;
		let pageNumberFilter = '';
		if (pageNumber > -1) {
			pageNumberFilter = `page=${pageNumber}`;
		}
		fetch(`/api/matches/all?players=[${playerId}]&${pageNumberFilter}`)
			.then((res) => res.json())
			.then((res) => {
				matchBlocks = res;
			});
	};

	const incrementPage = () => {
		pageNumber = pageNumber + 1;
		fetchMatches(pageNumber, player.id);
		goto(`/player/${player.id}?page=${pageNumber}`);
		if (matchBlocks.length > 10) {
			incrementDisabled = true;
		}
	};

	const decrementPage = () => {
		pageNumber = pageNumber - 1;
		fetchMatches(pageNumber, player.id);

		goto(`/player/${player.id}?page=${pageNumber}`);
		if (pageNumber == 1) {
			decrementDisabled = true;
		}
	};

	let chartType = 'days';

	$: ({
		player,
		mainAccount,
		smurfAccounts,
		allTimeStats,
		weeklyStats,
		heroStats,
		winGraph,
		timings
	} = data);

	const toSteam32 = (accountId: string) => {
		return BigInt(accountId) - BigInt('76561197960265728');
	};
</script>

<svelte:head>
	<title>whos-playing | {player.username || 'Unknown'}</title>
</svelte:head>

<meta property="og:title" content={`whos-playing | ${player.username}`} />
<meta
	property="og:description"
	content={`All Time Ranked: ${allTimeStats.rankedWins} - ${allTimeStats.rankedLosses}
This Week Ranked: ${weeklyStats.rankedWins} - ${weeklyStats.rankedLosses}
All Time: ${allTimeStats.wins} - ${allTimeStats.losses}
This Week: ${weeklyStats.wins} - ${weeklyStats.losses}`}
/>
<meta property="og:image" content={mainAccount.avatarfull} />
<meta property="og:url" content={`https://whos-playing.com/player/${player.id}`} />

<div class="flex px-2">
	{#key player}
		<div class="flex flex-col gap-4">
			<div class="flex flex-wrap items-center justify-center">
				<div class="flex items-center gap-2 px-2 py-2">
					<img src={mainAccount.avatarfull} alt="profilepicture" class="h-28 lg:h-36" />
					<div class="flex h-full flex-col justify-center">
						<div class="flex h-full flex-col gap-1 px-2 py-4 lg:w-80">
							<div class="text-4xl">{player.username}</div>
							<div class="grow" />
							<div class="flex items-center gap-2">
								<div class="flex gap-1 text-xs">
									<div>
										{mainAccount.personaname.length > 20
											? mainAccount.personaname.substring(0, 20) + '...'
											: mainAccount.personaname}
									</div>

									<div class="opacity-45">(main)</div>
								</div>
								<div class="h-2 w-2">
									{#if mainAccount.gameextrainfo === 'Dota 2'}
										<div class="h-full w-full rounded-full bg-sky-500" />
									{/if}
								</div>
								<div class="grow" />
								<a
									href={mainAccount.profileurl}
									target="_blank"
									rel="noopener noreferrer"
									class="hidden lg:inline"
								>
									<img src={'/steam.png'} alt="profilepicture" class="h-5" />
								</a>
								<a
									href={`https://dotabuff.com/players/${toSteam32(mainAccount.steamid).toString()}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<img src={'/dotabuff.png'} alt="profilepicture" class="h-5" />
								</a>
								<a
									href={`https://www.opendota.com/players/${toSteam32(
										mainAccount.steamid
									).toString()}`}
									target="_blank"
									rel="noopener noreferrer"
									class="hidden lg:inline"
								>
									<img src={'/opendota.png'} alt="profilepicture" class="h-5" />
								</a>
								<a
									href={`https://stratz.com/en-us/player/${toSteam32(
										mainAccount.steamid
									).toString()}`}
									target="_blank"
									rel="noopener noreferrer"
									class="hidden lg:inline"
								>
									<img src={'/stratz.png'} alt="profilepicture" class="h-5" />
								</a>
							</div>
							{#each smurfAccounts as profile}
								<div class="flex items-center gap-2">
									<div class="flex gap-1 text-xs">
										{profile.personaname.length > 25
											? profile.personaname.substring(0, 25) + '...'
											: profile.personaname}
										{#if profile.steamid === mainAccount.steamid}
											<div class="opacity-45">(main)</div>
										{/if}
									</div>
									<div class="grow" />
									<a
										href={profile.profileurl}
										target="_blank"
										rel="noopener noreferrer"
										class="hidden lg:inline"
									>
										<img src={'/steam.png'} alt="profilepicture" class="h-5" />
									</a>
									<a
										href={`https://dotabuff.com/players/${toSteam32(profile.steamid).toString()}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<img src={'/dotabuff.png'} alt="profilepicture" class="h-5" />
									</a>
									<a
										href={`https://www.opendota.com/players/${toSteam32(
											profile.steamid
										).toString()}`}
										target="_blank"
										rel="noopener noreferrer"
										class="hidden lg:inline"
									>
										<img src={'/opendota.png'} alt="profilepicture" class="h-5" />
									</a>
									<a
										href={`https://stratz.com/en-us/player/${toSteam32(
											profile.steamid
										).toString()}`}
										target="_blank"
										rel="noopener noreferrer"
										class="hidden lg:inline"
									>
										<img src={'/stratz.png'} alt="profilepicture" class="h-5" />
									</a>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div class="flex flex-col justify-end">
					<div class="flex h-fit w-48 flex-col rounded-xl bg-zinc-800 bg-opacity-95 px-2 py-2">
						<div class="flex">
							<div class="flex flex-col">
								<div class="flex h-7 items-center text-xl"><UilExchange /></div>
								<div class="flex h-7 items-center text-xl"><BiDashLg /></div>
							</div>
							<div class="flex grow flex-col items-center">
								<div class="flex w-full items-center justify-center gap-1">
									<div class="text-xl text-green-400">{allTimeStats.rankedWins}</div>
									<div class="text-xl">-</div>
									<div class="text-xl text-red-500">{allTimeStats.rankedLosses}</div>
								</div>
								<div class="flex w-full items-center justify-center gap-1">
									<div class="text-xl text-green-400">{allTimeStats.wins}</div>
									<div class="text-xl">-</div>
									<div class="text-xl text-red-500">{allTimeStats.losses}</div>
								</div>
							</div>
						</div>

						<div class="mt-2 text-center text-sm">Last 7 Days</div>
						<div class="flex w-full">
							<div class="flex flex-col">
								<div class="flex h-7 items-center text-xl"><UilExchange /></div>
								<div class="flex h-7 items-center text-xl"><BiDashLg /></div>
							</div>
							<div class="flex grow flex-col items-center">
								<div class="flex w-full items-center justify-center gap-1">
									<div class="text-xl text-green-400">{weeklyStats.rankedWins}</div>
									<div class="text-xl">-</div>
									<div class="text-xl text-red-500">{weeklyStats.rankedLosses}</div>
								</div>
								<div class="flex w-full items-center justify-center gap-1">
									<div class="text-xl text-green-400">{weeklyStats.wins}</div>
									<div class="text-xl">-</div>
									<div class="text-xl text-red-500">{weeklyStats.losses}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div>
				<div class="flex flex-col rounded-xl bg-zinc-800 bg-opacity-95 px-2 py-2">
					<div class="flex flex-col">
						{#if chartType == 'days'}
							<div class="flex w-full px-4 text-xl">
								<div class="basis-1/6" />
								<div class="basis-4/6 text-center">Wins by Games</div>
								<button
									class="flex basis-1/6 items-center justify-end"
									on:click={() => (chartType = 'games')}><MaterialSymbolsCalendarMonth /></button
								>
							</div>
							<div>
								<WinChart
									data={[
										{
											data: winGraph.resultsArray,
											player: {
												username: player.username,
												id: player.id,
												accounts: [player.accountId]
											}
										}
									]}
									type="results"
								/>
							</div>
						{:else}
							<div class="flex w-full px-4 text-xl">
								<div class="basis-1/6" />
								<div class="basis-4/6 text-center">Wins by Day</div>
								<button
									class="flex basis-1/6 items-center justify-end"
									on:click={() => (chartType = 'days')}><IonLogoGameControllerB /></button
								>
							</div>
							<WinChart
								data={[
									{
										data: winGraph.daysArray,
										player: {
											username: player.username,
											id: player.id,
											accounts: [player.accountId]
										}
									}
								]}
								type="days"
							/>
						{/if}
					</div>
				</div>
			</div>
			<div class="">
				{#await heroStats then heroStats}
					<HeroStatbox {heroStats} />
				{/await}
			</div>

			{#key matchBlocks}
				<div class="min-h-64" in:fade={{ duration: 400 }}>
					<div class="flex">
						<button class="flex items-center gap-2" on:click={() => goto('/matches?players=[4]')}>
							<div class="text-lg">Matches</div>
							<div><MaterialSymbolsArrowForwardIosRounded /></div>
						</button>
					</div>
					{#if matchBlocks.length == 0}
						<div class="flex h-full items-center justify-center">
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
							<div class="flex items-center justify-center gap-4">
								<button
									class="w-fit rounded-lg bg-sky-500 p-2 transition-all duration-300 hover:bg-sky-700 disabled:bg-zinc-800"
									disabled={pageNumber == 1}
									on:click={() => decrementPage()}
								>
									<MaterialSymbolsArrowBackRounded /></button
								>
								<div>{pageNumber}</div>
								<button
									class="w-fit rounded-lg bg-sky-500 p-2 transition-all duration-300 hover:bg-sky-700 disabled:bg-zinc-800"
									disabled={matchBlocks.length < 10}
									on:click={() => incrementPage()}
								>
									<MaterialSymbolsArrowForwardRounded />
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/key}
		</div>
	{/key}
</div>

<style>
	meta[name='description'] {
		white-space: pre-line;
	}
</style>
