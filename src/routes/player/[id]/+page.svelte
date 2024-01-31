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
			pageNumber = $page.url.searchParams.get('page');
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

	console.log(data);

	const toSteam32 = (accountId: string) => {
		return BigInt(accountId) - BigInt('76561197960265728');
	};
</script>

{#key player}
	<div class="flex flex-col gap-4">
		<div class="flex gap-2">
			<div class="flex items-center gap-2 px-2 py-2">
				<img src={mainAccount.avatarfull} alt="profilepicture" class="h-36" />
				<div class="flex flex-col justify-center h-full">
					<div class="flex flex-col w-80 px-2 h-full py-4 gap-1">
						<div class="text-4xl">{player.username}</div>
						<div class="grow" />
						<div class="flex items-center gap-2">
							<div class="text-xs flex gap-1">
								<div>
									{mainAccount.personaname.length > 20
										? mainAccount.personaname.substring(0, 20) + '...'
										: mainAccount.personaname}
								</div>

								<div class="opacity-45">(main)</div>
							</div>
							<div class="w-2 h-2">
								{#if mainAccount.gameextrainfo === 'Dota 2'}
									<div class="bg-green-400 w-full h-full rounded-full" />
								{/if}
							</div>
							<div class="grow" />
							<a href={mainAccount.profileurl} target="_blank" rel="noopener noreferrer">
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
							>
								<img src={'/opendota.png'} alt="profilepicture" class="h-5" />
							</a>
							<a
								href={`https://stratz.com/en-us/player/${toSteam32(
									mainAccount.steamid
								).toString()}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<img src={'/stratz.png'} alt="profilepicture" class="h-5" />
							</a>
						</div>
						{#each smurfAccounts as profile}
							<div class="flex items-center gap-2">
								<div class="text-xs flex gap-1">
									{profile.personaname.length > 25
										? profile.personaname.substring(0, 25) + '...'
										: profile.personaname}
									{#if profile.steamid === mainAccount.steamid}
										<div class="opacity-45">(main)</div>
									{/if}
								</div>
								<div class="grow" />
								<a href={profile.profileurl} target="_blank" rel="noopener noreferrer">
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
									href={`https://www.opendota.com/players/${toSteam32(profile.steamid).toString()}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<img src={'/opendota.png'} alt="profilepicture" class="h-5" />
								</a>
								<a
									href={`https://stratz.com/en-us/player/${toSteam32(profile.steamid).toString()}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<img src={'/stratz.png'} alt="profilepicture" class="h-5" />
								</a>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<div class="grow" />

			<div class="flex flex-col justify-end">
				<div
					class="flex flex-col w-48 px-2
		bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 rounded-xl h-fit py-2"
				>
					<div class="flex">
						<div class="flex flex-col">
							<div class="text-xl h-7 flex items-center"><UilExchange /></div>
							<div class="text-xl h-7 flex items-center"><BiDashLg /></div>
						</div>
						<div class="grow flex flex-col items-center">
							<div class="w-full flex gap-1 items-center justify-center">
								<div class="text-xl text-green-400">{allTimeStats.rankedWins}</div>
								<div class="text-xl">-</div>
								<div class="text-xl text-red-500">{allTimeStats.rankedLosses}</div>
							</div>
							<div class="w-full flex gap-1 items-center justify-center">
								<div class="text-xl text-green-400">{allTimeStats.wins}</div>
								<div class="text-xl">-</div>
								<div class="text-xl text-red-500">{allTimeStats.losses}</div>
							</div>
						</div>
					</div>

					<div class="text-sm text-center mt-2">Last 7 Days</div>
					<div class="flex w-full">
						<div class="flex flex-col">
							<div class="text-xl h-7 flex items-center"><UilExchange /></div>
							<div class="text-xl h-7 flex items-center"><BiDashLg /></div>
						</div>
						<div class="grow flex flex-col items-center">
							<div class="w-full flex gap-1 items-center justify-center">
								<div class="text-xl text-green-400">{weeklyStats.rankedWins}</div>
								<div class="text-xl">-</div>
								<div class="text-xl text-red-500">{weeklyStats.rankedLosses}</div>
							</div>
							<div class="w-full flex gap-1 items-center justify-center">
								<div class="text-xl text-green-400">{weeklyStats.wins}</div>
								<div class="text-xl">-</div>
								<div class="text-xl text-red-500">{weeklyStats.losses}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div
			class="flex flex-col px-2
		bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 rounded-xl py-2"
		>
			<div class="flex flex-col">
				{#if chartType == 'days'}
					<div class="flex w-full px-4 text-xl">
						<div class="basis-1/3" />
						<div class="basis-1/3 text-center">Wins by Day</div>
						<button
							class="basis-1/3 flex justify-end items-center"
							on:click={() => (chartType = 'games')}><MaterialSymbolsCalendarMonth /></button
						>
					</div>
					<div>
						<WinChart
							data={[
								{
									data: winGraph.resultsArray,
									player: { username: player.username, id: player.id, accounts: [player.accountId] }
								}
							]}
							type="results"
						/>
					</div>
				{:else}
					<div class="flex w-full px-4 text-xl">
						<div class="basis-1/3" />
						<div class="basis-1/3 text-center">Wins by Games</div>
						<button
							class="basis-1/3 flex justify-end items-center"
							on:click={() => (chartType = 'days')}><IonLogoGameControllerB /></button
						>
					</div>
					<WinChart
						data={[
							{
								data: winGraph.daysArray,
								player: { username: player.username, id: player.id, accounts: [player.accountId] }
							}
						]}
						type="days"
					/>
				{/if}
			</div>
		</div>
		<div>
			{#await heroStats then heroStats}
				<HeroStatbox {heroStats} />
			{/await}
		</div>

		{#key matchBlocks}
			<div class="w-[812px] min-h-64" in:fade={{ duration: 400 }}>
				<div class="flex">
					<button class="flex items-center gap-2" on:click={() => goto('/matches?players=[4]')}>
						<div class="text-lg">Matches</div>
						<div><MaterialSymbolsArrowForwardIosRounded /></div>
					</button>
				</div>
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
						<div class="flex items-center justify-center gap-4">
							<button
								class="bg-rose-500 rounded-lg w-fit p-2 hover:bg-rose-700 transition-all duration-300 disabled:bg-neutral-800"
								disabled={pageNumber == 1}
								on:click={() => decrementPage()}
							>
								<MaterialSymbolsArrowBackRounded /></button
							>
							<div>{pageNumber}</div>
							<button
								class="bg-rose-500 rounded-lg w-fit p-2 hover:bg-rose-700 transition-all duration-300 disabled:bg-neutral-800"
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
