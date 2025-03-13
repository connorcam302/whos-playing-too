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
	import { fade } from 'svelte/transition';
	import tippy from 'sveltejs-tippy';
	import MatchDropdown from '$lib/components/match/MatchDropdown.svelte';
	import { browser } from '$app/environment';
	import Bar from '$lib/components/stats/Bar.svelte';

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
		impactCounts: object;
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

	let hero = -1;

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

	$: hero, ranked, unranked, smurfs, pos1, pos2, pos3, pos4, pos5 && updateMatchesData();

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

	console.log(mostCommonImpact);

	console.log(data);
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

<div class="flex">
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
				{#if matchBlocks.length > 0}
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
				{/if}
			</div>
			<div
				class="mx-auto flex w-full flex-col justify-center rounded-xl bg-zinc-800 bg-opacity-95 px-2"
			>
				<div class="my-1 flex gap-4 border-b-[1px] border-zinc-500 pb-1 pr-2">
					<div class="flex w-8 items-center justify-center text-sm lg:w-16"></div>
					<div class="flex w-8 items-center justify-center lg:w-28">
						<div>TOTAL</div>
					</div>
					<div class="flex w-8 items-center justify-center text-sm lg:w-28">
						<img src="/roles/pos1.svg" alt="pos1" class="h-8" />
					</div>
					<div class="flex w-8 items-center justify-center text-sm lg:w-28">
						<img src="/roles/pos2.svg" alt="pos2" class="h-8" />
					</div>
					<div class="flex w-8 items-center justify-center text-sm lg:w-28">
						<img src="/roles/pos3.svg" alt="pos3" class="h-8" />
					</div>
					<div class="flex w-8 items-center justify-center text-sm lg:w-28">
						<img src="/roles/pos4.svg" alt="pos4" class="h-8" />
					</div>
					<div class="flex w-8 items-center justify-center text-sm lg:w-28">
						<img src="/roles/pos5.svg" alt="pos5" class="h-8" />
					</div>
				</div>
				<div class="flex max-h-72 flex-col gap-2 overflow-auto" id="scrollbox">
					{#each ['S++', 'S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F+', 'F', 'F-'] as ratingName}
						<div class="flex gap-4">
							<div class="flex h-8 w-12 items-center justify-center text-center lg:w-16">
								{#if ratingName === 'S++'}
									<div id="splusplusrating" class="font-display lg:text-xl">
										{ratingName}
									</div>
								{:else if ratingName === 'S+'}
									<div id="srating" class="font-display lg:text-xl">
										{ratingName}
									</div>
								{:else if ratingName !== 'F-'}
									<div class="font-display lg:text-xl">
										{ratingName}
									</div>
								{:else}
									<div id="frating" class="flex justify-center font-display lg:text-xl">
										<FxemojiPoo />
									</div>
								{/if}
							</div>
							<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
								{data.impactCounts[ratingName].reduce((sum, item) => sum + Number(item.count), 0)}
								<Bar
									percentage={(data.impactCounts[ratingName].reduce(
										(sum, item) => sum + Number(item.count),
										0
									) /
										mostCommonImpact.total) *
										100}
									colour="#9234ea"
								/>
							</div>
							<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
								{data.impactCounts[ratingName].find((item) => item.role === 1)?.count || 0}
								<Bar
									percentage={((data.impactCounts[ratingName].find((item) => item.role === 1)
										?.count || 0) /
										data.impactCounts[ratingName].reduce(
											(sum, item) => sum + Number(item.count),
											0
										)) *
										100}
									colour="#4753a5"
								/>
							</div>
							<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
								{data.impactCounts[ratingName].find((item) => item.role === 2)?.count || 0}
								<Bar
									percentage={((data.impactCounts[ratingName].find((item) => item.role === 2)
										?.count || 0) /
										data.impactCounts[ratingName].reduce(
											(sum, item) => sum + Number(item.count),
											0
										)) *
										100}
									colour="#2f8c94"
								/>
							</div>
							<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
								{data.impactCounts[ratingName].find((item) => item.role === 3)?.count || 0}
								<Bar
									percentage={((data.impactCounts[ratingName].find((item) => item.role === 3)
										?.count || 0) /
										data.impactCounts[ratingName].reduce(
											(sum, item) => sum + Number(item.count),
											0
										)) *
										100}
									colour="#bc7412"
								/>
							</div>
							<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
								{data.impactCounts[ratingName].find((item) => item.role === 4)?.count || 0}
								<Bar
									percentage={((data.impactCounts[ratingName].find((item) => item.role === 4)
										?.count || 0) /
										data.impactCounts[ratingName].reduce(
											(sum, item) => sum + Number(item.count),
											0
										)) *
										100}
									colour="#c24958"
								/>
							</div>
							<div class="flex w-8 flex-col justify-center pb-1 font-display lg:w-28 lg:text-sm">
								{data.impactCounts[ratingName].find((item) => item.role === 5)?.count || 0}
								<Bar
									percentage={((data.impactCounts[ratingName].find((item) => item.role === 5)
										?.count || 0) /
										data.impactCounts[ratingName].reduce(
											(sum, item) => sum + Number(item.count),
											0
										)) *
										100}
									colour="#37a075"
								/>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="flex flex-wrap gap-4">
				<div class="flex grow flex-col gap-2">
					<div class="px-2 text-xl">All Time</div>
					{#await allTimeHeroStats then allTimeHeroStats}
						<HeroStatbox heroStats={allTimeHeroStats} />
					{/await}
				</div>

				<div class="flex grow flex-col gap-2">
					<div class="px-2 text-xl">This Month</div>
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
				<div class="flex flex-col gap-1 text-sm">
					Heroes
					<div>
						<select
							bind:value={hero}
							class="rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
						>
							<option value={-1}>All Heroes</option>
							{#each heroList as hero}
								<option value={hero.id}>{hero.name}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
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
									class="mx-auto flex w-fit flex-col items-center justify-center rounded-lg bg-zinc-800 py-3 md:px-3"
								>
									{#each matchBlocks.slice(0, 20) as match}
										<div class="w-full">
											<MatchDropdown {match} />
										</div>
									{/each}
								</div>
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
										disabled={matchBlocks.length < 20}
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
