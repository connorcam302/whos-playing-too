<script lang="ts">
	import { self } from 'svelte/legacy';


	const { graph, playerList, heroList } = data;

	import { getRoleIcon, toTime, calcImpact } from '$lib/functions';
	import WinChart from '$lib/components/profile/WinChart.svelte';
	import BiSortDown from '~icons/bi/sort-down';
	import BiSortDownAlt from '~icons/bi/sort-down-alt';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import { fade } from 'svelte/transition';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import tippy from 'tippy.js';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	interface Props {
		data: any;
	}

	let { data }: Props = $props();
	dayjs.extend(relativeTime);
	const getImpactDetails = (match: any, role: any, duration: any) => {
		let impact = 0;
		const csMin = match.lastHits / (duration / 60);
		const deathsPerMin = match.deaths / (duration / 60);

		let csMinRating: number = 0;
		let deathRating: number = 0;
		let kapmRating: number = 0;

		// Carry
		if (role === 1) {
			// Heroes with lower returns for high CS/min
			// Anti-mage, Naga Siren, Medusa, Luna, Terrorblade
			if ([1, 89, 94, 48, 109].includes(match.hero_id)) {
				csMinRating = csMin ** 1.3 / 25;
			} else {
				csMinRating = csMin ** 1.3 / 20;
			}
			deathRating = 3 / (20 * deathsPerMin + 1);
			kapmRating = ((match.kills * 2.4 + match.assists * 1.2) / (duration / 60)) ** 2;
			impact = kapmRating * 0.45 + deathRating * 0.4 + csMinRating * 0.1;

			// Mid
		} else if (role === 2) {
			// Heroes with lower returns for high CS/min
			// Templar Assassin, Arc Warden, Shadow Fiend
			if ([46, 113, 11].includes(match.hero_id)) {
				csMinRating = csMin ** 1.3 / 23;
			} else {
				csMinRating = csMin ** 1.3 / 18;
			}
			deathRating = 4 / (24 * deathsPerMin + 1);
			kapmRating = ((match.kills * 1.6 + match.assists * 1.4) / (duration / 60)) ** 2;
			impact = kapmRating * 0.65 + deathRating * 0.3 + csMinRating * 0.05;

			// Offlane
		} else if (role === 3) {
			csMinRating = csMin ** 1.3 / 18;
			deathRating = 4.5 / (23 * deathsPerMin + 1);
			// Lower returns on kills for Axe
			kapmRating = ((match.kills * 1.35 + match.assists * 1.35) / (duration / 60)) ** 2;
			impact = kapmRating * 0.65 + deathRating * 0.3 + csMinRating * 0.05;

			// Support
		} else if (role === 4 || role === 5) {
			deathRating = 5 / (24 * deathsPerMin + 1);
			kapmRating = ((match.kills * 0.65 + match.assists * 1.35) / (duration / 60)) ** 2;
			if ([20, 105].includes(match.hero_id)) {
				impact = kapmRating * 0.7 + deathRating * 0.3;
			} else {
				impact = kapmRating * 0.55 + deathRating * 0.45;
			}
		}

		csMinRating = Math.round(csMinRating * 100);
		deathRating = Math.round(deathRating * 100);
		kapmRating = Math.round(kapmRating * 100);
		impact = Math.round(impact * 100);

		return { csMinRating, deathRating, kapmRating, impact };
	};

	const distribution = (role: number, heroId: number) => {
		if (role === 1) {
			return {
				kapm: 47.5,
				death: 42.5,
				csMin: 10
			};
		}
		if (role === 2) {
			return {
				kapm: 65,
				death: 30,
				csMin: 5
			};
		}
		if (role === 3) {
			return {
				kapm: 65,
				death: 30,
				csMin: 5
			};
		}
		if (role === 4 || role === 5) {
			if ([20, 105].includes(heroId)) {
				return {
					kapm: 70,
					death: 30,
					csMin: 0
				};
			} else {
				return {
					kapm: 55,
					death: 45,
					csMin: 0
				};
			}
		}
	};
	let highlightRow = $state(-1);
	let highlightColumn = $state(-1);

	function highlight(row, column) {
		highlightRow = row;
		highlightColumn = column;
	}

	function clearHighlight() {
		highlightRow = -1;
		highlightColumn = -1;
	}

	let sortedBy = $state('total');
	const orderBy = (key) => {
		if (key === 'player') {
			if (sortedBy === 'player') {
				sortedBy = 'player-reverse';
				return totwCounts.reverse();
			}
			sortedBy = key;
			return totwCounts.sort((a, b) => {
				if (a[key].username < b[key].username) {
					return -1;
				}
				if (a[key].username > b[key].username) {
					return 1;
				}
				return 0;
			});
		}

		if (sortedBy === key) {
			sortedBy = `${key}-reverse`;
			return totwCounts.reverse();
		}
		sortedBy = key;
		const sorted = totwCounts.sort((a, b) => {
			if (a[key].length < b[key].length) {
				return 1;
			}
			if (a[key].length > b[key].length) {
				return -1;
			}
			return 0;
		});
		return sorted;
	};

	const matchList = async (row, key) => {
		const matchData = await fetch(`/api/matches/list/`, {
			method: 'POST',
			body: JSON.stringify({ matches: row[key], player: row.player }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		totwMatches = await matchData.json();
		showTotwMatches = true;
	};



	const calculateImpact = () => {
		impactError = '';
		if (
			impactKills === '' ||
			impactDeaths === '' ||
			impactAssists === '' ||
			impactDuration === '' ||
			impactLastHits === '' ||
			impactHero === -1 ||
			impactRole === 0
		) {
			estimatedImpact = 0;
			return;
		}

		const kills = parseInt(impactKills);
		const deaths = parseInt(impactDeaths);
		const assists = parseInt(impactAssists);
		const lastHits = parseInt(impactLastHits);

		if (isNaN(kills) || isNaN(deaths) || isNaN(assists) || isNaN(lastHits)) {
			impactError = 'Please enter valid numbers.';
			estimatedImpact = 0;
			return;
		}

		if (kills < 0 || deaths < 0 || assists < 0 || lastHits < 0) {
			impactError = 'Please enter positive numbers.';
			estimatedImpact = 0;
			return;
		}

		if (/^([0-9]+):([0-5]?[0-9])$/.test(impactDuration) === false) {
			impactError = 'Please enter a valid duration.';
			estimatedImpact = 0;
			return;
		}

		const duration =
			parseInt(impactDuration.split(':')[0]) * 60 + parseInt(impactDuration.split(':')[1]);

		const match = { kills, deaths, assists, lastHits, hero_id: impactHero };

		const { csMinRating, deathRating, kapmRating, impact } = getImpactDetails(
			match,
			impactRole,
			duration
		);

		estimatedImpact = impact;
	};
	let totwCounts = $derived(data.totwCounts);
	let totwMatches = $derived([]);
	let showTotwMatches = $state(false);
	
	let impactHero = $derived(-1);
	let impactKills = $state('');
	
	let impactDeaths = $state('');
	
	let impactAssists = $state('');
	
	let impactDuration = $state('');
	
	let impactLastHits = $state('');
	
	let impactError = $state('');
	
	let impactRole = $state(0);
	
	let estimatedImpact = $state(0);
	
	
	
	
</script>

<svelte:head>
	<title>whos-playing | Stats</title>
	{#if showTotwMatches}
		<style>
			body {
				overflow: hidden;
			}
		</style>
	{:else}
		<style>
			body {
				overflow: auto;
			}
		</style>
	{/if}
</svelte:head>

<div class="flex flex-col gap-2">
	<div>
		<div class="my-2 flex flex-col items-center justify-center">
			<div class="flex justify-center font-display text-3xl">TEAM OF THE WEEK COUNTS</div>
		</div>
		<div class="flex w-full items-center gap-4 rounded-xl bg-zinc-800 p-2">
			{#key totwCounts}
				<table>
					<thead>
						<tr>
							<th class="w-28">
								<button
									class="flex w-full items-center"
									onclick={() => (totwCounts = orderBy('player'))}
								>
									<div class="basis-1/3"></div>
									<div class="basis-1/3">PLAYER</div>
									<div class="flex basis-1/3 justify-end">
										{#if sortedBy == 'player'}
											<BiSortDown />
										{:else if sortedBy == 'player-reverse'}
											<BiSortDownAlt />
										{/if}
									</div>
								</button>
							</th>
							<th class:highlight-column={highlightColumn === 1} class="w-16">
								<button
									class="flex w-full items-center"
									onclick={() => (totwCounts = orderBy('one'))}
								>
									<div class="basis-1/3"></div>
									<div class="basis-1/3">1</div>
									<div class="flex basis-1/3 justify-end">
										{#if sortedBy == 'one'}
											<BiSortDown />
										{:else if sortedBy == 'one-reverse'}
											<BiSortDownAlt />
										{/if}
									</div>
								</button></th
							>
							<th class:highlight-column={highlightColumn === 2} class="w-16">
								<button
									class="flex w-full items-center"
									onclick={() => (totwCounts = orderBy('two'))}
								>
									<div class="basis-1/3"></div>
									<div class="basis-1/3">2</div>
									<div class="flex basis-1/3 justify-end">
										{#if sortedBy == 'two'}
											<BiSortDown />
										{:else if sortedBy == 'two-reverse'}
											<BiSortDownAlt />
										{/if}
									</div>
								</button></th
							>
							<th class:highlight-column={highlightColumn === 3} class="w-16"
								><button
									class="flex w-full items-center"
									onclick={() => (totwCounts = orderBy('three'))}
								>
									<div class="basis-1/3"></div>
									<div class="basis-1/3">3</div>
									<div class="flex basis-1/3 justify-end">
										{#if sortedBy == 'three'}
											<BiSortDown />
										{:else if sortedBy == 'three-reverse'}
											<BiSortDownAlt />
										{/if}
									</div>
								</button></th
							>
							<th class:highlight-column={highlightColumn === 4} class="w-16"
								><button
									class="flex w-full items-center"
									onclick={() => (totwCounts = orderBy('four'))}
								>
									<div class="basis-1/3"></div>
									<div class="basis-1/3">4</div>
									<div class="flex basis-1/3 justify-end">
										{#if sortedBy == 'four'}
											<BiSortDown />
										{:else if sortedBy == 'four-reverse'}
											<BiSortDownAlt />
										{/if}
									</div>
								</button>
							</th><th class:highlight-column={highlightColumn === 5} class="w-16"
								><button
									class="flex w-full items-center"
									onclick={() => (totwCounts = orderBy('five'))}
								>
									<div class="basis-1/3"></div>
									<div class="basis-1/3">5</div>
									<div class="flex basis-1/3 justify-end">
										{#if sortedBy == 'five'}
											<BiSortDown />
										{:else if sortedBy == 'five-reverse'}
											<BiSortDownAlt />
										{/if}
									</div>
								</button>
							</th><th class:highlight-column={highlightColumn === 6} class="w-24"
								><button
									class="flex w-full items-center"
									onclick={() => (totwCounts = orderBy('total'))}
								>
									<div class="basis-1/3"></div>
									<div class="basis-1/3">SUM</div>
									<div class="flex basis-1/3 justify-end">
										{#if sortedBy == 'total'}
											<BiSortDown />
										{:else if sortedBy == 'total-reverse'}
											<BiSortDownAlt />
										{/if}
									</div>
								</button></th
							>
						</tr>
					</thead>
					<tbody>
						{#each totwCounts as row, i}
							{#key sortedBy}
								<tr class="border-y-[1px] border-white border-opacity-10 text-right">
									<td
										class="px-2 text-center"
										class:highlight-row={highlightRow === i}
										class:highlight-column={highlightColumn === 0}
										onmouseenter={() => highlight(i, -1)}
										onmouseleave={clearHighlight}
										>{row.player.username}
									</td>
									<td
										class="px-2"
										onmouseenter={() => highlight(i, 1)}
										onmouseleave={clearHighlight}
										class:highlight-row={highlightRow === i}
										class:highlight-column={highlightColumn === 1}
										class:highlight-cell={highlightRow === i && highlightColumn === 1}
										><button onclick={() => matchList(row, 'one')}>{row.one.length}</button></td
									>
									<td
										class="px-2"
										onmouseenter={() => highlight(i, 2)}
										onmouseleave={clearHighlight}
										class:highlight-row={highlightRow === i}
										class:highlight-column={highlightColumn === 2}
										class:highlight-cell={highlightRow === i && highlightColumn === 2}
										onclick={() => matchList(row, 'two')}
										><button onclick={() => matchList(row, 'two')}>{row.two.length}</button></td
									>
									<td
										class="px-2"
										onmouseenter={() => highlight(i, 3)}
										onmouseleave={clearHighlight}
										class:highlight-row={highlightRow === i}
										class:highlight-column={highlightColumn === 3}
										class:highlight-cell={highlightRow === i && highlightColumn === 3}
										onclick={() => matchList(row, 'three')}
										><button onclick={() => matchList(row, 'three')}>{row.three.length}</button
										></td
									>
									<td
										class="px-2"
										onmouseenter={() => highlight(i, 4)}
										onmouseleave={clearHighlight}
										class:highlight-row={highlightRow === i}
										class:highlight-column={highlightColumn === 4}
										class:highlight-cell={highlightRow === i && highlightColumn === 4}
										onclick={() => matchList(row, 'four')}
										><button onclick={() => matchList(row, 'four')}>{row.four.length}</button></td
									>
									<td
										class="px-2"
										onmouseenter={() => highlight(i, 5)}
										onmouseleave={clearHighlight}
										class:highlight-row={highlightRow === i}
										class:highlight-column={highlightColumn === 5}
										class:highlight-cell={highlightRow === i && highlightColumn === 5}
										onclick={() => matchList(row, 'five')}
										><button onclick={() => matchList(row, 'five')}>{row.five.length}</button></td
									>
									<td
										class="px-2"
										onmouseenter={() => highlight(i, 6)}
										onmouseleave={clearHighlight}
										class:highlight-row={highlightRow === i}
										class:highlight-column={highlightColumn === 6}
										class:highlight-cell={highlightRow === i && highlightColumn === 6}
										onclick={() => matchList(row, 'total')}
										><button onclick={() => matchList(row, 'total')}>{row.total.length}</button
										></td
									>
								</tr>
							{/key}
						{/each}
					</tbody>
				</table>
			{/key}
		</div>
	</div>
	<div>
		<div class="my-2 flex flex-col items-center justify-center gap-2">
			<div class="flex justify-center font-display text-3xl">IMPACT CALCULATOR</div>
			<div class="flex gap-4">
				<div class="flex flex-col gap-2">
					<div>
						<div class="text-sm">Hero</div>
						<select
							oninput={() => calculateImpact()}
							bind:value={impactHero}
							onchange={() => calculateImpact()}
							class="w-40 rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
						>
							<option value={-1}>Select Hero</option>
							{#each heroList as hero}
								<option value={hero.id}>{hero.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<div class="text-sm">Kills</div>
						<input
							oninput={() => calculateImpact()}
							onchange={() => calculateImpact()}
							class="w-40 rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
							bind:value={impactKills}
						/>
					</div>
					<div>
						<div class="text-sm">Deaths</div>
						<input
							oninput={() => calculateImpact()}
							onchange={() => calculateImpact()}
							class="w-40 rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
							bind:value={impactDeaths}
						/>
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<div>
						<div class="text-sm">Assists</div>
						<input
							oninput={() => calculateImpact()}
							onchange={() => calculateImpact()}
							class="w-40 rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
							bind:value={impactAssists}
						/>
					</div>
					<div>
						<div class="text-sm">Duration</div>
						<input
							oninput={() => calculateImpact()}
							onchange={() => calculateImpact()}
							class="w-40 rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
							bind:value={impactDuration}
						/>
					</div>
					<div>
						<div class="text-sm">Last Hits</div>
						<input
							oninput={() => calculateImpact()}
							onchange={() => calculateImpact()}
							class="w-40 rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
							bind:value={impactLastHits}
						/>
					</div>
				</div>
			</div>
			<div>
				<div class="text-sm">Role</div>
				<select
					oninput={() => calculateImpact()}
					bind:value={impactRole}
					onchange={() => calculateImpact()}
					class="w-40 rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
				>
					<option value={0}>Select Role</option>
					<option value={1}>Carry</option>
					<option value={2}>Mid</option>
					<option value={3}>Offlane</option>
					<option value={4}>Soft Support</option>
					<option value={5}>Hard Support</option>
				</select>
			</div>
			<div class="text-red-500">{impactError}</div>
			<div class="flex h-12 items-center justify-center gap-8">
				<div class="text-right text-3xl">{estimatedImpact}</div>
				<div class="cursor-default items-center text-left text-3xl">
					{#if estimatedImpact > 200}
						<div id="splusplusrating" class="font-display">
							{calcImpact(estimatedImpact)}
						</div>
					{:else if estimatedImpact >= 140}
						<div id="srating" class="font-display">
							{calcImpact(estimatedImpact)}
						</div>
					{:else if estimatedImpact < 140 && estimatedImpact > 25}
						<div class="font-display">
							{calcImpact(estimatedImpact)}
						</div>
					{:else if estimatedImpact <= 25}
						<div id="frating" class="flex justify-center font-display">
							<FxemojiPoo />
						</div>
					{/if}
				</div>
			</div>
			<table class="text-lg">
				<tbody>
					<tr>
						<td class="pr-4 text-zinc-300">
							CS/min Rating ({distribution(impactRole, impactHero)?.csMin || 'N/A'}%)
						</td>
						<td>{csMinRating}</td>
					</tr>
					<tr>
						<td class="pr-4 text-zinc-300">
							Death Rating ({distribution(impactRole, impactHero)?.death || 'N/A'}%)
						</td>
						<td>{deathRating}</td>
					</tr>
					<tr>
						<td class="pr-4 text-zinc-300">
							K/A Rating ({distribution(impactRole, impactHero)?.kapm || 'N/A'}%)
						</td>
						<td>{kapmRating}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
	<div class="w-full">
		<WinChart data={graph} type="collective" />
	</div>
</div>

{#if showTotwMatches}
	<div
		transition:fade={{ duration: 200 }}
		id="backdrop"
		class="fixed top-0 z-10 flex h-screen w-screen cursor-default items-center justify-center"
		onclick={self(() => (showTotwMatches = false))}
		onkeypress={(e) => e.key === 'Escape' && (showTotwMatches = false)}
		tabindex="0"
		role="button"
		class:scroll-lock={showTotwMatches}
	>
		<div
			class="absolute z-20 rounded-xl border-[1px] border-zinc-200 border-opacity-15 bg-zinc-900 px-4 py-2 opacity-100"
		>
			<table>
				<tbody>
					{#each totwMatches as match}
						<tr class="hover:bg-zinc-800">
							{#if !match.matchId}
								<td><div class="flex h-10 w-20 items-center text-left">Week {match.week}</div></td>
								<td colspan="15">Match not available.</td>
							{:else}
								<td
									><MatchModal matchId={match.match.matchId}
										><div class="flex h-10 w-20 items-center text-left">
											Week {match.week}
										</div></MatchModal
									></td
								>

								<td class="flex items-center">
									<MatchModal matchId={match.match.matchId}>
										<img
											src={match.match.hero.img}
											alt={match.match.hero.name}
											class="m-auto max-w-16"
										/>
									</MatchModal>
								</td>
								<td class="text-center">
									<img
										src={getRoleIcon(match.match.role)}
										alt={`position ${match.match.role}`}
										class="mx-auto w-8"
									/>
								</td>
								<td>
									<MatchModal matchId={match.match.matchId}>
										<div class="w-7 text-center text-green-400">
											{match.match.kills}
										</div>
									</MatchModal>
								</td>

								<td>
									<MatchModal matchId={match.match.matchId}>
										<div class="w-7 text-center text-red-400">
											{match.match.deaths}
										</div>
									</MatchModal>
								</td>

								<td class="text-center">
									<MatchModal matchId={match.match.matchId}>
										<div class="w-7 text-center text-cyan-300">
											{match.match.assists}
										</div>
									</MatchModal>
								</td>

								<td class="text-center">
									<MatchModal matchId={match.match.matchId}>
										<div
											class="w-12 cursor-default items-center text-center text-base"
											use:tippy={{
												content: `
                <div class='text-center'>Impact Rating: <span class='font-bold'>${
									match.match.impact
								}</span></div>
                <table>
<thead>
    <tr class='border-b-2 border-black'>
        <th class='text-left'>Stat</th>
        <th class='px-4 text-center'>Dist</th>
        <th class='text-right'>Rating</th>
    </tr>
  <tbody>
    <tr>
      <td class='text-left'>K/A</td>
      <td class='px-4 text-center'>${distribution(match.match.role)?.kapm}%</td>
      <td class='text-right'>${
				getImpactDetails(match.match, match.match.role, match.match.duration).kapmRating
			}</td>
    </tr>
    <tr>
      <td class='text-left'>Death</td>
      <td class='px-4 text-center'>${distribution(match.match.role)?.death}%</td>
      <td class='text-right'>${
				getImpactDetails(match.match, match.match.role, match.match.duration).deathRating
			}</td>
    </tr>
    ${
			match.match.role === 1 || match.match.role === 2 || match.match.role === 3
				? `<tr>
      <td class='text-left'>CS</td>
      <td class='px-4 text-center'>${distribution(match.match.role)?.csMin}%</td>
      <td class='text-right'>${
				getImpactDetails(match.match, match.match.role, match.match.duration).csMinRating
			}</td>
    </tr>`
				: ``
		}

  </tbody>
</table>`,
												placement: 'bottom',
												theme: 'light',
												allowHTML: true
											}}
										>
											{#if match.match.impact > 200}
												<div id="splusplusrating" class="font-display">
													{calcImpact(match.match.impact)}
												</div>
											{:else if match.match.impact >= 140}
												<div id="srating" class="font-display">
													{calcImpact(match.match.impact)}
												</div>
											{:else if match.match.impact < 140 && match.match.impact > 25}
												<div class="font-display">
													{calcImpact(match.match.impact)}
												</div>
											{:else if match.match.impact <= 25}
												<div id="frating" class="flex justify-center font-display">
													<FxemojiPoo />
												</div>
											{/if}
										</div>
									</MatchModal>
								</td>
								<td>
									<MatchModal matchId={match.match.matchId}>
										<div class="w-12">{toTime(match.match.duration)}</div>
									</MatchModal>
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}

<style>
	.scroll-lock {
		overflow-y: hidden;
	}
	#backdrop {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.5);
	}
	table {
		border-collapse: collapse;
	}

	td,
	th {
		padding-top: 4px;
		padding-bottom: 4px;
		transition: background-color 0.1s ease; /* Add transition for background-color */
		font-weight: normal;
	}

	.highlight-row {
		background-color: #3f3f46; /* Row highlight */
	}

	.highlight-column {
		background-color: #3f3f46; /* Column highlight */
	}

	.highlight-cell {
		background-color: #52525b; /* Cell highlight */
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
</style>
