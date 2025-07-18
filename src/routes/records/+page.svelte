<script lang="ts">
	import { getRoleIcon, toTime, calcImpact } from '$lib/functions';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import tippy from 'tippy.js';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import MaterialSymbolsKeyboardArrowDown from '~icons/material-symbols/keyboard-arrow-down';
	import MaterialSymbolsKeyboardArrowUp from '~icons/material-symbols/keyboard-arrow-up';
	import HeroiconsXMark from '~icons/heroicons/x-mark';
	import UilExchange from '~icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import IcOutlineSearch from '~icons/ic/outline-search';
	import SimpleIconsRedhat from '~icons/simple-icons/redhat';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import Loading from '$lib/components/Loading.svelte';
	dayjs.extend(relativeTime);

	interface Record {
		title: string;
		recordTitle: string;
		records: RecordData[];
		length: number;
	}

	interface RecordData {
		record: number;
		data: Data;
	}

	interface Data {
		id: number;
		username: string;
		smurf: boolean;
		kills: number;
		deaths: number;
		assists: number;
		matchId: number;
		hero: Hero;
		impact: number;
		role: number;
		duration: number;
		startTime: number;
	}

	interface Hero {
		id: number;
		name: string;
		img: string;
	}

	interface Props {
		data: { playerList: any[]; url: string; records: Record[] };
	}

	let { data }: Props = $props();

	const getColour = (position: number) => {
		if (position === 1) return '#FFD70020';
		if (position === 2) return '#C0C0C020';
		if (position === 3) return '#CD7F3220';
		return '#FFFFFF00';
	};

	let records = $derived([]);
	let heroList = $derived(data.heroList);

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
			impact = kapmRating * 0.475 + deathRating * 0.425 + csMinRating * 0.1;

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

	const expandList = (length: number) => {
		if (length === 3) {
			return 10;
		} else {
			return 3;
		}
	};

	let pos1 = $state(true);
	
	let pos2 = $state(true);
	
	let pos3 = $state(true);
	
	let pos4 = $state(true);
	
	let pos5 = $state(true);
	

	let ranked = $state(true);
	
	let unranked = $state(true);
	

	let smurfs = $state(false);
	

	let hero = $derived(-1);

	let time = $state(365);
	

	const fetchRecordData: Promise<Record[]> = async () => {
		const data = await fetch(
			`/api/records?roles=[${pos1 ? 1 : -1},${pos2 ? 2 : -1},${pos3 ? 3 : -1},${pos4 ? 4 : -1},${
				pos5 ? 5 : -1
			}]&lobby=[${ranked ? 7 : -1},${unranked ? 0 : -1}]&time=${time}&hero=${hero}&smurf=${smurfs}`
		);
		const json = await data.json();
		return await json;
	};

	onMount(() => updateRecordData());

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

			updateRecordData();
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

			updateRecordData();
		}
	};

	const handleTimeChange = () => {
		updateRecordData();
	};

	const handleSmurfChange = () => {
		smurfs = !smurfs;
		updateRecordData();
	};

	const handleHeroChange = () => {
		updateRecordData();
	};

	const updateRecordData = async () => {
		records = [];
		const data = await fetchRecordData();
		records = data;
	};
</script>

<svelte:head>
	<title>whos-playing | Records</title>
</svelte:head>

<div class="flex flex-col items-center justify-center gap-4">
	<div class="flex flex-wrap justify-center gap-6">
		<div class="flex flex-col gap-1 text-sm">
			Roles
			<div class="flex gap-1">
				<button
					onclick={() => handleRoleChange(1)}
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
					onclick={() => handleRoleChange(2)}
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
					onclick={() => handleRoleChange(3)}
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
					onclick={() => handleRoleChange(4)}
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
					onclick={() => handleRoleChange(5)}
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
					onclick={() => handleLobbyChange(7)}
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
					onclick={() => handleLobbyChange(0)}
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
					onclick={() => handleSmurfChange()}
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
					onchange={() => handleHeroChange()}
				>
					<option value={-1}>All Heroes</option>
					{#each heroList as hero}
						<option value={hero.id}>{hero.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="flex flex-col gap-1 text-sm">
			Date
			<div>
				<select
					bind:value={time}
					class="rounded-xl border-x-8 border-zinc-800 bg-zinc-800 p-2 text-base"
					onchange={() => handleTimeChange()}
				>
					<option value={7}>Last 7 Days</option>
					<option value={30}>Last 30 Days</option>
					<option value={90}>Last 90 Days</option>
					<option value={180}>Last 180 Days</option>
					<option value={365}>Last 365 Days</option>
					<option value={730}>Last 2 Years</option>
					<option value={1095}>Last 3 Years</option>
					<option value={1461}>Last 4 Years</option>
					<option value={1826}>Last 5 Years</option>
					<option value={9999}>All Time</option>
				</select>
			</div>
		</div>
	</div>
	<div>
		{#if records.length === 0}
			<div class="flex flex-col items-center gap-4 rounded-xl p-2">
				<Loading />
			</div>
		{:else}
			<div class="flex flex-col gap-4" in:fade={{ duration: 200 }}>
				{#each records as recordSet}
					<div
						class="flex flex-col items-center gap-4 rounded-xl bg-zinc-800 p-2"
						id={recordSet.recordTitle}
					>
						<div class="flex flex-col items-center gap-2">
							<div class="font-display text-3xl">{recordSet.title}</div>
						</div>
						<div class="flex grow flex-col items-center justify-start gap-2 text-sm lg:text-base">
							<table class="w-full">
								<thead>
									<tr>
										<th class="w-8 text-center text-xs font-normal text-zinc-400">#</th>
										<th class="w-24 text-center text-xs font-normal text-zinc-400">Player</th>
										<th class="w-12 text-center text-xs font-normal text-zinc-400"
											>{recordSet.recordTitle}</th
										>
										<th class="w-16 text-center text-xs font-normal text-zinc-400">Duration</th>
										<th class="text-center text-xs font-normal text-zinc-400">Hero</th>
										<th class="w-12 text-center text-xs font-normal text-zinc-400">Pos</th>
										<th class="w-8 text-center text-xs font-normal text-zinc-400">K</th>
										<th class="w-8 text-center text-xs font-normal text-zinc-400">D</th>
										<th class="w-8 text-center text-xs font-normal text-zinc-400">A</th>
										<th class="w-10 text-center text-xs font-normal text-zinc-400">Impact</th>
										<th class="w-32 text-center text-xs font-normal text-zinc-400">Date</th>
									</tr>
								</thead>
								<tbody>
									{#each recordSet.records.slice(0, recordSet.length) as record, i}
										<tr
											class="border-y-[1px] border-white border-opacity-10 hover:bg-zinc-800"
											style="background-color: {getColour(i + 1)}"
										>
											<td>
												<MatchModal
													matchId={record.data.matchId}
													sequenceNum={record.data.sequenceNumber}
												>
													<div class="text-center font-display">
														{i + 1}
													</div>
												</MatchModal>
											</td>
											<td>
												<MatchModal
													matchId={record.data.matchId}
													sequenceNum={record.data.sequenceNumber}
												>
													<div class="text-left">
														<button
															onclick={() => goto(`/player/${record.data.id}`)}
															class="transition-all duration-300 hover:text-zinc-400"
														>
															{record.data.username}
														</button>
														<span class="italic text-indigo-400"
															>{record.data.smurf ? 'S' : ''}</span
														>
													</div>
												</MatchModal>
											</td>
											<td>
												<MatchModal
													matchId={record.data.matchId}
													sequenceNum={record.data.sequenceNumber}
												>
													{record.record}
												</MatchModal>
											</td>
											<td>
												<MatchModal
													matchId={record.data.matchId}
													sequenceNum={record.data.sequenceNumber}
												>
													{toTime(record.data.duration)}
												</MatchModal>
											</td>

											<td class="flex items-center">
												<MatchModal
													matchId={record.data.matchId}
													sequenceNum={record.data.sequenceNumber}
												>
													<img
														src={record.data.hero.img}
														alt={record.data.hero.name}
														class="m-auto max-w-16"
													/>
												</MatchModal>
											</td>
											<td class="text-center">
												<img
													src={getRoleIcon(record.data.role)}
													alt={`position ${record.data.role}`}
													class="mx-auto max-w-8"
												/>
											</td>
											<td>
												<MatchModal
													matchId={record.data.matchId}
													sequenceNum={record.data.sequenceNumber}
												>
													<div class="text-center text-green-400">
														{record.data.kills}
													</div>
												</MatchModal>
											</td>

											<td>
												<MatchModal
													matchId={record.data.matchId}
													sequenceNum={record.data.sequenceNumber}
												>
													<div class="text-center text-red-400">
														{record.data.deaths}
													</div>
												</MatchModal>
											</td>

											<td class="text-center">
												<MatchModal
													matchId={record.data.matchId}
													sequenceNum={record.data.sequenceNumber}
												>
													<div class="text-center text-cyan-300">
														{record.data.assists}
													</div>
												</MatchModal>
											</td>

											<td class="text-center">
												<MatchModal
													matchId={record.data.matchId}
													sequenceNum={record.data.sequenceNumber}
												>
													<div
														class="w-10 cursor-default items-center text-center text-base"
														use:tippy={{
															content: `
                <div class='text-center'>Impact Rating: <span class='font-bold'>${
									record.data.impact
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
      <td class='px-4 text-center'>${distribution(record.data.role)?.kapm}%</td>
      <td class='text-right'>${
				getImpactDetails(record.data, record.data.role, record.data.duration).kapmRating
			}</td>
    </tr>
    <tr>
      <td class='text-left'>Death</td>
      <td class='px-4 text-center'>${distribution(record.data.role)?.death}%</td>
      <td class='text-right'>${
				getImpactDetails(record.data, record.data.role, record.data.duration).deathRating
			}</td>
    </tr>
    ${
			record.data.role === 1 || record.data.role === 2 || record.data.role === 3
				? `<tr>
      <td class='text-left'>CS</td>
      <td class='px-4 text-center'>${distribution(record.data.role)?.csMin}%</td>
      <td class='text-right'>${
				getImpactDetails(record.data, record.data.role, record.data.duration).csMinRating
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
														{#if record.data.impact > 200}
															<div id="splusplusrating" class="font-display">
																{calcImpact(record.data.impact)}
															</div>
														{:else if record.data.impact >= 140}
															<div id="srating" class="font-display">
																{calcImpact(record.data.impact)}
															</div>
														{:else if record.data.impact < 140 && record.data.impact > 25}
															<div class="font-display">
																{calcImpact(record.data.impact)}
															</div>
														{:else if record.data.impact <= 25}
															<div id="frating" class="flex justify-center font-display">
																<FxemojiPoo />
															</div>
														{/if}
													</div>
												</MatchModal>
											</td>

											<td class="text-center text-xs lg:text-base">
												<MatchModal
													matchId={record.data.matchId}
													sequenceNum={record.data.sequenceNumber}
												>
													{dayjs(record.data.startTime * 1000 + record.data.duration * 1000).from(
														dayjs()
													)}
												</MatchModal>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
							<button onclick={() => (recordSet.length = expandList(recordSet.length))}>
								{#if recordSet.length !== 10}
									<MaterialSymbolsKeyboardArrowDown class="h-8 w-8" />
								{:else}
									<MaterialSymbolsKeyboardArrowUp class="h-8 w-8" />
								{/if}
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	::-webkit-scrollbar {
		height: 3px;
		background-color: transparent;
	}

	::-webkit-scrollbar-thumb {
		background-color: #e7e5e4;
		border-radius: 64px;
		width: 20px;
	}

	#backdrop {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.5);
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
