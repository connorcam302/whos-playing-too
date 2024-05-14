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
	import SimpleIconsRedhat from '~icons/simple-icons/redhat';
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
		allTimeHeroStats: any;
		winGraph: { resultsArray: number[]; daysArray: number[] };
		heroList: { id: number; name: string }[];
	};

	$: pageNumber = 1;
	$: matchBlocks = [];

	$: pos1 = true;
	$: pos2 = true;
	$: pos3 = true;
	$: pos4 = true;
	$: pos5 = true;

	$: ranked = true;
	$: unranked = true;

	$: smurfs = false;

	let heroID = -1;

	onMount(() => {
		if ($page.url.searchParams.get('page')) {
			pageNumber = Number($page.url.searchParams.get('page'));
		}
		fetchMatches(pageNumber, Number($page.params.id));
	});

	const fetchMatches = (pageNumber: number, playerId: number) => {
		console.log('fetching matches');
		matchBlocks = [];
		let pageNumberFilter = '';
		if (pageNumber > -1) {
			pageNumberFilter = `page=${pageNumber}`;
		}
		let heroFilter = '';
		if (heroID > 0) {
			heroFilter = `heroes=[${heroID}]`;
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
		console.log({
			playerId,
			heroFilter,
			gameModeFilter,
			pageNumberFilter,
			roleFilter
		});
		fetch(
			`/api/matches/all?players=[${playerId}]&${heroFilter}&${gameModeFilter}&${pageNumberFilter}&${roleFilter}`
		)
			.then((res) => res.json())
			.then((res) => {
				matchBlocks = res;
			});
	};

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

			fetchMatches(pageNumber, Number($page.params.id));
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

			fetchMatches(pageNumber, Number($page.params.id));
		}
	};

	const handleSmurfChange = () => {
		smurfs = !smurfs;
		fetchMatches(pageNumber, Number($page.params.id));
	};

	const handleHeroChange = (event: any) => {
		console.log(event);
		fetchMatches(pageNumber, Number($page.params.id));
	};

	const incrementPage = () => {
		pageNumber = pageNumber + 1;
		fetchMatches(pageNumber, player.id);
		goto(`/player/${player.id}?page=${pageNumber}`);
	};

	const decrementPage = () => {
		pageNumber = pageNumber - 1;
		fetchMatches(pageNumber, player.id);

		goto(`/player/${player.id}?page=${pageNumber}`);
	};

	let chartType = 'days';

	$: ({
		player,
		mainAccount,
		smurfAccounts,
		allTimeStats,
		weeklyStats,
		heroStats,
		allTimeHeroStats,
		winGraph,
		heroList
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
			<div class="flex flex-wrap gap-4">
				<div class="flex h-full grow flex-col gap-2">
					<div class="text-xl">All Time</div>
					{#await allTimeHeroStats then allTimeHeroStats}
						<HeroStatbox heroStats={allTimeHeroStats} />
					{/await}
				</div>

				<div class="flex h-full grow flex-col gap-2">
					<div class="text-xl">This Month</div>
					{#await heroStats then heroStats}
						<HeroStatbox {heroStats} />
					{/await}
				</div>
			</div>
			<div class="flex flex-wrap justify-center gap-6">
				<div class="flex flex-col gap-1 text-sm">
					Roles
					<div class="flex gap-1">
						<button
							on:click={() => handleRoleChange(1)}
							class="h-10 w-10 rounded-xl bg-zinc-800 p-1 transition duration-100"
							style="background-color: {pos1 ? '#27272a' : '#18181b'};"
							use:tippy={{
								content: `Carry`,
								placement: 'bottom',
								theme: 'light'
							}}
						>
							<img src="/roles/pos1.svg" alt="pos1" />
						</button>
						<button
							on:click={() => handleRoleChange(2)}
							class="h-10 w-10 rounded-xl bg-zinc-800 p-1 transition duration-100"
							style="background-color: {pos2 ? '#27272a' : '#18181b'};"
							use:tippy={{
								content: `Mid`,
								placement: 'bottom',
								theme: 'light'
							}}
						>
							<img src="/roles/pos2.svg" alt="pos2" />
						</button>
						<button
							on:click={() => handleRoleChange(3)}
							class="h-10 w-10 rounded-xl bg-zinc-800 p-1 transition duration-100"
							style="background-color: {pos3 ? '#27272a' : '#18181b'};"
							use:tippy={{
								content: `Offlane`,
								placement: 'bottom',
								theme: 'light'
							}}
						>
							<img src="/roles/pos3.svg" alt="pos3" />
						</button>
						<button
							on:click={() => handleRoleChange(4)}
							class="h-10 w-10 rounded-xl bg-zinc-800 p-1 transition duration-100"
							style="background-color: {pos4 ? '#27272a' : '#18181b'};"
							use:tippy={{
								content: `Soft Support`,
								placement: 'bottom',
								theme: 'light'
							}}
						>
							<img src="/roles/pos4.svg" alt="pos4" />
						</button>
						<button
							on:click={() => handleRoleChange(5)}
							class="h-10 w-10 rounded-xl bg-zinc-800 p-1 transition duration-100"
							style="background-color: {pos5 ? '#27272a' : '#18181b'};"
							use:tippy={{
								content: `Hard Support`,
								placement: 'bottom',
								theme: 'light'
							}}
						>
							<img src="/roles/pos5.svg" alt="pos5" />
						</button>
					</div>
				</div>
				<div class="flex flex-col gap-1 text-sm">
					Lobby
					<div class="flex gap-1">
						<button
							on:click={() => handleLobbyChange(7)}
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 p-1 text-2xl transition duration-100"
							style="background-color: {ranked ? '#27272a' : '#18181b'};"
							use:tippy={{
								content: `Ranked`,
								placement: 'bottom',
								theme: 'light'
							}}
						>
							<UilExchange />
						</button>
						<button
							on:click={() => handleLobbyChange(0)}
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 p-1 text-2xl transition duration-100"
							style="background-color: {unranked ? '#27272a' : '#18181b'};"
							use:tippy={{
								content: `Unranked`,
								placement: 'bottom',
								theme: 'light'
							}}
						>
							<BiDashLg />
						</button>
					</div>
				</div>
				<div class="flex flex-col gap-1 text-sm">
					Smurf
					<div class="flex gap-1">
						<button
							on:click={() => handleSmurfChange()}
							on:change={() => handleSmurfChange()}
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 p-1 text-2xl transition duration-100"
							style="background-color: {smurfs ? '#27272a' : '#18181b'};"
							use:tippy={{
								content: `Smurf`,
								placement: 'bottom',
								theme: 'light'
							}}
						>
							<SimpleIconsRedhat />
						</button>
					</div>
				</div>
				{#await heroList then heroList}
					<div class="flex flex-col gap-1 text-sm">
						Heroes
						<div>
							<select
								bind:value={heroID}
								on:change={handleHeroChange}
								on:input={handleHeroChange}
								class="w-40 rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
							>
								<option value={-1}>Select Hero</option>
								{#each heroList as hero}
									<option value={hero.id}>{hero.name}</option>
								{/each}
							</select>
						</div>
					</div>
				{/await}
			</div>
			{#key matchBlocks}
				<div class="min-h-64" in:fade={{ duration: 400 }}>
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
