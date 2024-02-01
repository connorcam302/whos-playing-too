<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import MaterialSymbolsTrophyRounded from '~icons/material-symbols/trophy-rounded';
	import Loading from '$lib/components/Loading.svelte';
	import { calcImpact } from '$lib/functions';
	import tippy from 'tippy.js';

	dayjs.extend(relativeTime);
	import { getStatColour } from '$lib/functions';

	type Player = {
		id: number;
		username: string;
		matchId?: number;
		kills?: number;
		deaths?: number;
		assists?: number;
		gpm?: number;
		xpm?: number;
		impact?: number;
		lastHits?: number;
		heroDamage?: number;
		winLoss?: number;
		hero?: {
			id: number;
			name: string;
			img: string;
		};
	};

	type MatchData = {
		radiant_win: boolean;
		duration: number;
		pre_game_duration: number;
		start_time: number;
		match_id: number;
		match_seq_num: number;
		tower_status_radiant: number;
		tower_status_dire: number;
		barracks_status_radiant: number;
		barracks_status_dire: number;
		cluster: number;
		first_blood_time: number;
		lobby_type: number;
		human_players: number;
		leagueid: number;
		game_mode: number;
		flags: number;
		engine: number;
		radiant_score: number;
		dire_score: number;
		picks_bans: Array<{
			is_pick: boolean;
			hero_id: number;
			team: number;
			order: number;
		}>;
		picks: DotaAsset[];
		bans: DotaAsset[];
	};

	type DotaAsset = {
		id: number;
		name: string;
		img: string;
	};

	type PlayerData = {
		account_id: number;
		player_slot: number;
		team_number: number;
		team_slot: number;
		hero_id: number;
		hero: DotaAsset;
		item_0: number;
		item_1: number;
		item_2: number;
		item_3: number;
		item_4: number;
		item_5: number;
		backpack_0: number;
		backpack_1: number;
		backpack_2: number;
		item_neutral: number;
		items: DotaAsset[];
		neutralItem: DotaAsset;
		backpack: DotaAsset[];
		kills: number;
		deaths: number;
		assists: number;
		leaver_status: number;
		last_hits: number;
		denies: number;
		gold_per_min: number;
		xp_per_min: number;
		level: number;
		net_worth: number;
		aghanims_scepter: number;
		aghanims_shard: number;
		moonshard: number;
		hero_damage: number;
		tower_damage: number;
		hero_healing: number;
		gold: number;
		gold_spent: number;
		scaled_hero_damage: number;
		scaled_tower_damage: number;
		scaled_hero_healing: number;
		ability_upgrades: Array<{
			ability: number;
			time: number;
			level: number;
		}>;
		role: number;
		impactScore: number;
		user?: {
			id: number;
			username: string;
			steamId: number;
			smurf: boolean;
		};
	};

	const fetchMatchData = async (matchId: number) => {
		const res = await fetch(`/api/matches/${matchId}`);
		return await res.json();
	};

	$: showMatchData1 = false;
	let matchDetails1: { matchData: MatchData; radiantData: PlayerData[]; direData: PlayerData[] };
	const openMatchData1 = async (matchId: number) => {
		showMatchData1 = true;
		if (!matchDetails1) {
			matchDetails1 = await fetchMatchData(matchId);
		}
	};

	$: showMatchData2 = false;
	let matchDetails2: { matchData: MatchData; radiantData: PlayerData[]; direData: PlayerData[] };
	const openMatchData2 = async (matchId: number) => {
		showMatchData2 = true;
		if (!matchDetails2) {
			matchDetails2 = await fetchMatchData(matchId);
		}
	};

	$: showMatchData3 = false;
	let matchDetails3: { matchData: MatchData; radiantData: PlayerData[]; direData: PlayerData[] };
	const openMatchData3 = async (matchId: number) => {
		showMatchData3 = true;
		if (!matchDetails3) {
			matchDetails3 = await fetchMatchData(matchId);
		}
	};

	const toTime = (time: number) => {
		return `${(time / 60) | 0}:${time % 60 < 10 ? 0 : ''}${time % 60}`;
	};

	const convertToKNumber = (num: number) => {
		if (num > 999) {
			return `${(num / 1000).toFixed(1)}k`;
		} else {
			return num;
		}
	};
	export let data: Player[] = [
			{ id: -1, username: 'PLAYER 1', kills: 999 },
			{ id: -1, username: 'PLAYER 1', kills: 999 },
			{ id: -1, username: 'PLAYER 1', kills: 999 }
		],
		title: string = 'RECORD TITLE',
		type: string = 'kills';
</script>

{#if type == 'winLoss'}
	<div
		class="bg-neutral-800 bg-opacity-100 border-[1px] border-neutral-200 border-opacity-15 rounded-xl w-72"
	>
		<div class="rounded-xl border-white border-b-[1px] border-opacity-15 max-h-28">
			<div class="rounded-xl border-white border-b-[1px] border-opacity-15">
				<div
					class={`bg-cover bg-center rounded-xl max-h-28 max-w-auto`}
					id={title == 'Most MMR Lost' ? `down-arrows` : `up-arrows`}
				>
					<div class="flex bg-black bg-opacity-70 py-2 px-4 rounded-xl h-28">
						<div class="grow flex flex-col">
							<div class="text-2xl font-bold text-center font-display">{title}</div>
							<div class="flex-1 grow" />
							<div class="flex flex-row justify-between text-3xl">
								<button
									on:click={() => goto(`/player/${data[0].id}`)}
									class="hover:text-neutral-400 duration-300"
								>
									<div>{data[0].username}</div>
								</button>
								<div
									class="font-bold text-4xl"
									style={`color: ${getStatColour(title == 'Most MMR Gained' ? 'wins' : 'losses')};`}
								>
									{data[0][type]}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div
			class="flex flex-row items-center px-4 py-0.5 rounded-xl border-white border-b-[1px] border-opacity-15"
		>
			<button
				on:click={() => goto(`/player/${data[1].id}`)}
				class="hover:text-neutral-400 duration-300"
			>
				<div class="flex h-7 items-center">{data[1].username}</div>
			</button>
			<div class="grow" />
			<div>{data[1][type]}</div>
		</div>
		<div class="flex flex-row items-center px-4 py-0.5 h-7">
			<button
				on:click={() => goto(`/player/${data[2].id}`)}
				class="hover:text-neutral-400 duration-300"
			>
				<div class="flex h-7 items-center">{data[2].username}</div>
			</button>
			<div class="grow" />
			<div>{data[2][type]}</div>
		</div>
	</div>
{:else}
	<div
		class="bg-neutral-800 bg-opacity-100 border-[1px] border-neutral-200 border-opacity-15 rounded-xl w-72"
	>
		<div class="rounded-xl border-white border-b-[1px] border-opacity-15">
			<button
				class={`bg-cover bg-center bg-no-repeat rounded-xl min-h-28 w-full`}
				style={`background-image: url('${data[0].hero.img}')`}
				on:click={() => openMatchData1(data[0].matchId)}
			>
				<div class="flex bg-black bg-opacity-70 py-2 px-4 rounded-xl min-h-28">
					<div class="grow flex flex-col">
						<div class="text-2xl font-bold text-center font-display">{title}</div>
						<div class="flex-1 grow" />
						<div class="flex flex-row justify-between text-3xl">
							<button
								on:click={() => goto(`/player/${data[0].id}`)}
								class="hover:text-neutral-400 duration-300"
							>
								<div>{data[0].username}</div>
							</button>
							<div>{data[0][type]}</div>
						</div>
					</div>
				</div>
			</button>
		</div>
		<button
			class="flex flex-row items-center px-4 py-0.5 rounded-xl border-white border-b-[1px] border-opacity-15 w-full"
			on:click={() => openMatchData2(data[1].matchId)}
		>
			<div><img src={data[1].hero.img} class="h-7 mr-2" /></div>
			<button
				on:click={() => goto(`/player/${data[1].id}`)}
				class="hover:text-neutral-400 duration-300"
			>
				<div>{data[1].username}</div>
			</button>
			<div class="grow" />
			<div>{data[1][type]}</div>
		</button>
		<button
			class="flex flex-row items-center px-4 py-0.5 w-full"
			on:click={() => openMatchData3(data[2].matchId)}
		>
			<div><img src={data[2].hero.img} class="h-7 mr-2" /></div>
			<button
				on:click={() => goto(`/player/${data[2].id}`)}
				class="hover:text-neutral-400 duration-300"
			>
				<div>{data[2].username}</div>
			</button>
			<div class="grow" />
			<div>{data[2][type]}</div>
		</button>
	</div>
{/if}

{#if showMatchData1}
	<div
		transition:fade={{ duration: 200 }}
		id="backdrop"
		class="h-screen fixed top-0 w-screen cursor-default flex justify-center items-center"
		on:click|self={() => (showMatchData1 = false)}
		on:keypress={(e) => e.key === 'Escape' && (showMatchData1 = false)}
		tabindex="0"
		role="button"
	>
		<div
			class="absolute opacity-100 bg-neutral-800 border-[1px] border-neutral-200 border-opacity-15 px-4 py-2 rounded-xl"
		>
			{#if !matchDetails1}
				<div class="flex w-full items-center justify-center"><Loading /></div>
			{:else if matchDetails1.error === 'Steam API Down.'}
				<div>Steam API Down.</div>
			{:else}
				<div class="flex flex-col gap-4 w-full">
					<div class="w-full flex justify-center gap-4 items-center">
						{#if matchDetails1.matchData.radiant_win}
							<div class="text-4xl text-emerald-500" style="text-shadow: #10b981 0 0 15px;">
								{matchDetails1.matchData.radiant_score}
							</div>
						{:else}
							<div class="text-4xl text-emerald-500">
								{matchDetails1.matchData.radiant_score}
							</div>
						{/if}
						<div class="flex flex-col justify-center items-center">
							<div class="text-4xl">
								{toTime(matchDetails1.matchData.duration)}
							</div>
							<div class="text-neutral-400">
								{dayjs(
									matchDetails1.matchData.startTime * 1000 + matchDetails1.matchData.duration * 1000
								).from(dayjs())}
							</div>
						</div>
						{#if !matchDetails1.matchData.radiant_win}
							<div class="text-4xl text-red-500" style="text-shadow: #ef4444 0 0 15px;">
								{matchDetails1.matchData.dire_score}
							</div>
						{:else}
							<div class="text-4xl text-red-500">
								{matchDetails1.matchData.dire_score}
							</div>
						{/if}
					</div>
					<div>
						<div class="text-xl font-display flex gap-2">
							<div>Radiant</div>
							{#if matchDetails1.matchData.radiant_win}
								<MaterialSymbolsTrophyRounded class="text-amber-300" />
							{/if}
						</div>
						<table class="table-auto">
							<thead>
								<tr>
									<th class="text-neutral-400 font-normal text-xs">PLAYER</th>
									<th class="text-neutral-400 font-normal text-xs">POS</th>
									<th class="text-neutral-400 font-normal text-xs">LEVEL</th>
									<th class="text-neutral-400 font-normal text-xs">K</th>
									<th class="text-neutral-400 font-normal text-xs">D</th>
									<th class="text-neutral-400 font-normal text-xs">A</th>
									<th class="text-neutral-400 font-normal text-xs">IMP</th>
									<th class="text-neutral-400 font-normal text-xs">CS</th>
									<th class="text-neutral-400 font-normal text-xs">NET</th>
									<th class="text-neutral-400 font-normal text-xs">GPM</th>
									<th class="text-neutral-400 font-normal text-xs">XPM</th>
									<th class="text-neutral-400 font-normal text-xs">HD</th>
									<th class="text-neutral-400 font-normal text-xs">TD</th>
									<th class="text-neutral-400 font-normal text-xs">HH</th>
									<th class="text-neutral-400 font-normal text-xs">ITEMS</th>
									<th class="text-neutral-400 font-normal text-xs">BACK</th>
									<th class="text-neutral-400 font-normal text-xs">AGHS</th>
								</tr>
							</thead>
							<tbody>
								{#each matchDetails1.radiantData as player}
									<tr class="border-y-[1px] border-white border-opacity-25">
										<td>
											<div class="flex items-center gap-2 w-40">
												<img src={player.hero.img} class="h-8" alt={player.hero.name} />
												{#if player.user}
													<button
														on:click={() => goto(`/player/${player.user?.id}`)}
														class="hover:text-neutral-300 transition-all duration-300"
														>{player.user.username}
													</button>

													<span class="italic text-indigo-400 text-lg"
														>{player.user.smurf ? 'S' : ''}</span
													>
												{:else}
													<div class="text-neutral-400">Anonymous</div>
												{/if}
											</div>
										</td>
										<td>
											<div class="w-12 text-center flex items-center justify-center h-6">
												<img
													src={`/roles/pos${player.role}.png`}
													alt={player.role.toString()}
													class="h-6"
												/>
											</div>
										</td>
										<td class="w-12 text-center">{player.level}</td>
										<td class="w-10 text-center text-green-400">{player.kills}</td>
										<td class="w-10 text-center text-red-400">{player.deaths}</td>
										<td class="w-10 text-center text-cyan-300">{player.assists}</td>
										<td class="w-12 text-center">
											<div
												class="w-12 items-center text-center cursor-default"
												use:tippy={{
													content: `Impact: ${player.impactScore}`,
													placement: 'bottom',
													theme: 'light'
												}}
											>
												{#if player.impactScore > 200}
													<div id="splusplusrating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore >= 140}
													<div id="srating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore < 140 && player.impactScore > 25}
													<div>
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore <= 25}
													<div id="frating" class="text-xl font-display flex justify-center">
														<FxemojiPoo />
													</div>
												{/if}
											</div>
										</td>
										<td class="w-20 text-center">{player.last_hits} / {player.denies}</td>
										<td class="w-20 text-center text-amber-300"
											>{convertToKNumber(player.gold + player.gold_spent)}</td
										>
										<td class="text-center w-20">{convertToKNumber(player.gold_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.xp_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.tower_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_healing)}</td>
										<td>
											<div class="flex flex-wrap items-center">
												{#each player.items as item}
													<img
														use:tippy={{ content: item.name, theme: 'light' }}
														src={item.img}
														class="h-7"
														alt={item.name}
													/>
												{/each}
												<img
													src={player.neutralItem.img}
													alt={player.neutralItem.name}
													use:tippy={{ content: player.neutralItem.name, theme: 'light' }}
													class="h-8 w-8 rounded-full object-cover mx-2"
												/>
											</div>
										</td>
										<td>
											<div class="flex flex-wrap">
												{#each player.backpack as item}
													<div>
														{#if item == null}
															<img
																use:tippy={{ content: 'Empty', theme: 'light' }}
																src="https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp"
																class="h-7"
																alt="Empty"
															/>
														{:else}
															<img
																use:tippy={{ content: item.name, theme: 'light' }}
																src={item.img}
																class="h-7"
																alt={item.name}
															/>
														{/if}
													</div>
												{/each}
											</div>
										</td>
										<td>
											<div class="flex flex-col">
												<img
													class="object-contain w-6 mx-auto"
													src={`/scepter_${player.aghanims_scepter}.png`}
													alt={`/scepter_${player.aghanims_scepter}`}
												/>
												<img
													class="object-contain w-6 mx-auto"
													src={`/shard_${player.aghanims_shard}.png`}
													alt={`/shard_${player.aghanims_shard}`}
												/>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div>
						<div class="text-xl font-display flex gap-2">
							<div>Dire</div>
							{#if !matchDetails1.matchData.radiant_win}
								<MaterialSymbolsTrophyRounded class="text-amber-300" />
							{/if}
						</div>
						<table class="table-auto">
							<thead>
								<tr>
									<th class="text-neutral-400 font-normal text-xs">PLAYER</th>
									<th class="text-neutral-400 font-normal text-xs">POS</th>
									<th class="text-neutral-400 font-normal text-xs">LEVEL</th>
									<th class="text-neutral-400 font-normal text-xs">K</th>
									<th class="text-neutral-400 font-normal text-xs">D</th>
									<th class="text-neutral-400 font-normal text-xs">A</th>
									<th class="text-neutral-400 font-normal text-xs">IMP</th>
									<th class="text-neutral-400 font-normal text-xs">CS</th>
									<th class="text-neutral-400 font-normal text-xs">NET</th>
									<th class="text-neutral-400 font-normal text-xs">GPM</th>
									<th class="text-neutral-400 font-normal text-xs">XPM</th>
									<th class="text-neutral-400 font-normal text-xs">HD</th>
									<th class="text-neutral-400 font-normal text-xs">TD</th>
									<th class="text-neutral-400 font-normal text-xs">HH</th>
									<th class="text-neutral-400 font-normal text-xs">ITEMS</th>
									<th class="text-neutral-400 font-normal text-xs">BACK</th>
									<th class="text-neutral-400 font-normal text-xs">AGHS</th>
								</tr>
							</thead>
							<tbody>
								{#each matchDetails1.direData as player}
									<tr class="border-y-[1px] border-white border-opacity-25">
										<td>
											<div class="flex items-center gap-2 w-40">
												<img src={player.hero.img} class="h-8" alt={player.hero.name} />
												{#if player.user}
													<button
														on:click={() => goto(`/player/${player.user?.id}`)}
														class="hover:text-neutral-300 transition-all duration-300"
														>{player.user.username}
													</button>

													<span class="italic text-indigo-400 text-lg"
														>{player.user.smurf ? 'S' : ''}</span
													>
												{:else}
													<div class="text-neutral-400">Anonymous</div>
												{/if}
											</div>
										</td>
										<td>
											<div class="w-12 text-center flex items-center justify-center h-6">
												<img
													src={`/roles/pos${player.role}.png`}
													alt={player.role.toString()}
													class="h-6"
												/>
											</div>
										</td>
										<td class="w-12 text-center">{player.level}</td>
										<td class="w-10 text-center text-green-400">{player.kills}</td>
										<td class="w-10 text-center text-red-400">{player.deaths}</td>
										<td class="w-10 text-center text-cyan-300">{player.assists}</td>
										<td class="w-12 text-center">
											<div
												class="w-12 items-center text-center cursor-default"
												use:tippy={{
													content: `Impact: ${player.impactScore}`,
													placement: 'bottom',
													theme: 'light'
												}}
											>
												{#if player.impactScore > 200}
													<div id="splusplusrating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore >= 140}
													<div id="srating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore < 140 && player.impactScore > 25}
													<div>
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore <= 25}
													<div id="frating" class="text-xl font-display flex justify-center">
														<FxemojiPoo />
													</div>
												{/if}
											</div>
										</td>
										<td class="w-20 text-center">{player.last_hits} / {player.denies}</td>
										<td class="w-20 text-center text-amber-300"
											>{convertToKNumber(player.gold + player.gold_spent)}</td
										>
										<td class="text-center w-20">{convertToKNumber(player.gold_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.xp_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.tower_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_healing)}</td>
										<td>
											<div class="flex flex-wrap items-center">
												{#each player.items as item}
													<img
														use:tippy={{ content: item.name, theme: 'light' }}
														src={item.img}
														class="h-7"
														alt={item.name}
													/>
												{/each}
												<img
													src={player.neutralItem.img}
													alt={player.neutralItem.name}
													use:tippy={{ content: player.neutralItem.name, theme: 'light' }}
													class="h-8 w-8 rounded-full object-cover mx-2"
												/>
											</div>
										</td>
										<td>
											<div class="flex flex-wrap">
												{#each player.backpack as item}
													<div>
														{#if item == null}
															<img
																use:tippy={{ content: 'Empty', theme: 'light' }}
																src="https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp"
																class="h-7"
																alt="Empty"
															/>
														{:else}
															<img
																use:tippy={{ content: item.name, theme: 'light' }}
																src={item.img}
																class="h-7"
																alt={item.name}
															/>
														{/if}
													</div>
												{/each}
											</div>
										</td>
										<td>
											<div class="flex flex-col">
												<img
													class="object-contain w-6 mx-auto"
													src={`/scepter_${player.aghanims_scepter}.png`}
													alt={`/scepter_${player.aghanims_scepter}`}
												/>
												<img
													class="object-contain w-6 mx-auto"
													src={`/shard_${player.aghanims_shard}.png`}
													alt={`/shard_${player.aghanims_shard}`}
												/>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div class="flex px-2">
						<div class="flex gap-1">
							{#each matchDetails1.matchData.picks as pick, i}
								<div class="flex flex-col text-xs text-center">
									<img src={pick.img} alt={pick.name} class="h-7" />
									{#if matchDetails1.direData.filter((player) => player.hero.id == pick.id).length + matchDetails1.radiantData.filter((player) => player.hero.id == pick.id).length > 0}
										<div
											class="py-[2px] bg-neutral-900 rounded-b-lg flex items-center justify-center"
										>
											Pick {i + 1}
										</div>
									{:else}
										<div class="py-[2px] bg-red-900 rounded-b-lg flex items-center justify-center">
											Pick {i + 1}
										</div>
									{/if}
								</div>
							{/each}
						</div>
						<div class="grow" />
						<div class="flex gap-1">
							{#each matchDetails1.matchData.bans as ban, i}
								<div class="flex flex-col text-xs text-center">
									<img src={ban.img} alt={ban.name} class="h-7" />
									<div class="py-[2px] bg-red-900 rounded-b-lg flex items-center justify-center">
										Pick {i + 1}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if showMatchData2}
	<div
		transition:fade={{ duration: 200 }}
		id="backdrop"
		class="h-screen fixed top-0 w-screen cursor-default flex justify-center items-center"
		on:click|self={() => (showMatchData2 = false)}
		on:keypress={(e) => e.key === 'Escape' && (showMatchData2 = false)}
		tabindex="0"
		role="button"
	>
		<div
			class="absolute opacity-100 bg-neutral-800 border-[1px] border-neutral-200 border-opacity-15 px-4 py-2 rounded-xl"
		>
			{#if !matchDetails2}
				<div class="flex w-full items-center justify-center"><Loading /></div>
			{:else if matchDetails2.error === 'Steam API Down.'}
				<div>Steam API Down.</div>
			{:else}
				<div class="flex flex-col gap-4 w-full">
					<div class="w-full flex justify-center gap-4 items-center">
						{#if matchDetails2.matchData.radiant_win}
							<div class="text-4xl text-emerald-500" style="text-shadow: #10b981 0 0 15px;">
								{matchDetails2.matchData.radiant_score}
							</div>
						{:else}
							<div class="text-4xl text-emerald-500">
								{matchDetails2.matchData.radiant_score}
							</div>
						{/if}
						<div class="flex flex-col justify-center items-center">
							<div class="text-4xl">
								{toTime(matchDetails2.matchData.duration)}
							</div>
							<div class="text-neutral-400">
								{dayjs(
									matchDetails2.matchData.startTime * 1000 + matchDetails2.matchData.duration * 1000
								).from(dayjs())}
							</div>
						</div>
						{#if !matchDetails2.matchData.radiant_win}
							<div class="text-4xl text-red-500" style="text-shadow: #ef4444 0 0 15px;">
								{matchDetails2.matchData.dire_score}
							</div>
						{:else}
							<div class="text-4xl text-red-500">
								{matchDetails2.matchData.dire_score}
							</div>
						{/if}
					</div>
					<div>
						<div class="text-xl font-display flex gap-2">
							<div>Radiant</div>
							{#if matchDetails2.matchData.radiant_win}
								<MaterialSymbolsTrophyRounded class="text-amber-300" />
							{/if}
						</div>
						<table class="table-auto">
							<thead>
								<tr>
									<th class="text-neutral-400 font-normal text-xs">PLAYER</th>
									<th class="text-neutral-400 font-normal text-xs">POS</th>
									<th class="text-neutral-400 font-normal text-xs">LEVEL</th>
									<th class="text-neutral-400 font-normal text-xs">K</th>
									<th class="text-neutral-400 font-normal text-xs">D</th>
									<th class="text-neutral-400 font-normal text-xs">A</th>
									<th class="text-neutral-400 font-normal text-xs">IMP</th>
									<th class="text-neutral-400 font-normal text-xs">CS</th>
									<th class="text-neutral-400 font-normal text-xs">NET</th>
									<th class="text-neutral-400 font-normal text-xs">GPM</th>
									<th class="text-neutral-400 font-normal text-xs">XPM</th>
									<th class="text-neutral-400 font-normal text-xs">HD</th>
									<th class="text-neutral-400 font-normal text-xs">TD</th>
									<th class="text-neutral-400 font-normal text-xs">HH</th>
									<th class="text-neutral-400 font-normal text-xs">ITEMS</th>
									<th class="text-neutral-400 font-normal text-xs">BACK</th>
									<th class="text-neutral-400 font-normal text-xs">AGHS</th>
								</tr>
							</thead>
							<tbody>
								{#each matchDetails2.radiantData as player}
									<tr class="border-y-[1px] border-white border-opacity-25">
										<td>
											<div class="flex items-center gap-2 w-40">
												<img src={player.hero.img} class="h-8" alt={player.hero.name} />
												{#if player.user}
													<button
														on:click={() => goto(`/player/${player.user?.id}`)}
														class="hover:text-neutral-300 transition-all duration-300"
														>{player.user.username}
													</button>

													<span class="italic text-indigo-400 text-lg"
														>{player.user.smurf ? 'S' : ''}</span
													>
												{:else}
													<div class="text-neutral-400">Anonymous</div>
												{/if}
											</div>
										</td>
										<td>
											<div class="w-12 text-center flex items-center justify-center h-6">
												<img
													src={`/roles/pos${player.role}.png`}
													alt={player.role.toString()}
													class="h-6"
												/>
											</div>
										</td>
										<td class="w-12 text-center">{player.level}</td>
										<td class="w-10 text-center text-green-400">{player.kills}</td>
										<td class="w-10 text-center text-red-400">{player.deaths}</td>
										<td class="w-10 text-center text-cyan-300">{player.assists}</td>
										<td class="w-12 text-center">
											<div
												class="w-12 items-center text-center cursor-default"
												use:tippy={{
													content: `Impact: ${player.impactScore}`,
													placement: 'bottom',
													theme: 'light'
												}}
											>
												{#if player.impactScore > 200}
													<div id="splusplusrating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore >= 140}
													<div id="srating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore < 140 && player.impactScore > 25}
													<div>
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore <= 25}
													<div id="frating" class="text-xl font-display flex justify-center">
														<FxemojiPoo />
													</div>
												{/if}
											</div>
										</td>
										<td class="w-20 text-center">{player.last_hits} / {player.denies}</td>
										<td class="w-20 text-center text-amber-300"
											>{convertToKNumber(player.gold + player.gold_spent)}</td
										>
										<td class="text-center w-20">{convertToKNumber(player.gold_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.xp_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.tower_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_healing)}</td>
										<td>
											<div class="flex flex-wrap items-center">
												{#each player.items as item}
													<img
														use:tippy={{ content: item.name, theme: 'light' }}
														src={item.img}
														class="h-7"
														alt={item.name}
													/>
												{/each}
												<img
													src={player.neutralItem.img}
													alt={player.neutralItem.name}
													use:tippy={{ content: player.neutralItem.name, theme: 'light' }}
													class="h-8 w-8 rounded-full object-cover mx-2"
												/>
											</div>
										</td>
										<td>
											<div class="flex flex-wrap">
												{#each player.backpack as item}
													<div>
														{#if item == null}
															<img
																use:tippy={{ content: 'Empty', theme: 'light' }}
																src="https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp"
																class="h-7"
																alt="Empty"
															/>
														{:else}
															<img
																use:tippy={{ content: item.name, theme: 'light' }}
																src={item.img}
																class="h-7"
																alt={item.name}
															/>
														{/if}
													</div>
												{/each}
											</div>
										</td>
										<td>
											<div class="flex flex-col">
												<img
													class="object-contain w-6 mx-auto"
													src={`/scepter_${player.aghanims_scepter}.png`}
													alt={`/scepter_${player.aghanims_scepter}`}
												/>
												<img
													class="object-contain w-6 mx-auto"
													src={`/shard_${player.aghanims_shard}.png`}
													alt={`/shard_${player.aghanims_shard}`}
												/>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div>
						<div class="text-xl font-display flex gap-2">
							<div>Dire</div>
							{#if !matchDetails2.matchData.radiant_win}
								<MaterialSymbolsTrophyRounded class="text-amber-300" />
							{/if}
						</div>
						<table class="table-auto">
							<thead>
								<tr>
									<th class="text-neutral-400 font-normal text-xs">PLAYER</th>
									<th class="text-neutral-400 font-normal text-xs">POS</th>
									<th class="text-neutral-400 font-normal text-xs">LEVEL</th>
									<th class="text-neutral-400 font-normal text-xs">K</th>
									<th class="text-neutral-400 font-normal text-xs">D</th>
									<th class="text-neutral-400 font-normal text-xs">A</th>
									<th class="text-neutral-400 font-normal text-xs">IMP</th>
									<th class="text-neutral-400 font-normal text-xs">CS</th>
									<th class="text-neutral-400 font-normal text-xs">NET</th>
									<th class="text-neutral-400 font-normal text-xs">GPM</th>
									<th class="text-neutral-400 font-normal text-xs">XPM</th>
									<th class="text-neutral-400 font-normal text-xs">HD</th>
									<th class="text-neutral-400 font-normal text-xs">TD</th>
									<th class="text-neutral-400 font-normal text-xs">HH</th>
									<th class="text-neutral-400 font-normal text-xs">ITEMS</th>
									<th class="text-neutral-400 font-normal text-xs">BACK</th>
									<th class="text-neutral-400 font-normal text-xs">AGHS</th>
								</tr>
							</thead>
							<tbody>
								{#each matchDetails2.direData as player}
									<tr class="border-y-[1px] border-white border-opacity-25">
										<td>
											<div class="flex items-center gap-2 w-40">
												<img src={player.hero.img} class="h-8" alt={player.hero.name} />
												{#if player.user}
													<button
														on:click={() => goto(`/player/${player.user?.id}`)}
														class="hover:text-neutral-300 transition-all duration-300"
														>{player.user.username}
													</button>

													<span class="italic text-indigo-400 text-lg"
														>{player.user.smurf ? 'S' : ''}</span
													>
												{:else}
													<div class="text-neutral-400">Anonymous</div>
												{/if}
											</div>
										</td>
										<td>
											<div class="w-12 text-center flex items-center justify-center h-6">
												<img
													src={`/roles/pos${player.role}.png`}
													alt={player.role.toString()}
													class="h-6"
												/>
											</div>
										</td>
										<td class="w-12 text-center">{player.level}</td>
										<td class="w-10 text-center text-green-400">{player.kills}</td>
										<td class="w-10 text-center text-red-400">{player.deaths}</td>
										<td class="w-10 text-center text-cyan-300">{player.assists}</td>
										<td class="w-12 text-center">
											<div
												class="w-12 items-center text-center cursor-default"
												use:tippy={{
													content: `Impact: ${player.impactScore}`,
													placement: 'bottom',
													theme: 'light'
												}}
											>
												{#if player.impactScore > 200}
													<div id="splusplusrating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore >= 140}
													<div id="srating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore < 140 && player.impactScore > 25}
													<div>
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore <= 25}
													<div id="frating" class="text-xl font-display flex justify-center">
														<FxemojiPoo />
													</div>
												{/if}
											</div>
										</td>
										<td class="w-20 text-center">{player.last_hits} / {player.denies}</td>
										<td class="w-20 text-center text-amber-300"
											>{convertToKNumber(player.gold + player.gold_spent)}</td
										>
										<td class="text-center w-20">{convertToKNumber(player.gold_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.xp_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.tower_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_healing)}</td>
										<td>
											<div class="flex flex-wrap items-center">
												{#each player.items as item}
													<img
														use:tippy={{ content: item.name, theme: 'light' }}
														src={item.img}
														class="h-7"
														alt={item.name}
													/>
												{/each}
												<img
													src={player.neutralItem.img}
													alt={player.neutralItem.name}
													use:tippy={{ content: player.neutralItem.name, theme: 'light' }}
													class="h-8 w-8 rounded-full object-cover mx-2"
												/>
											</div>
										</td>
										<td>
											<div class="flex flex-wrap">
												{#each player.backpack as item}
													<div>
														{#if item == null}
															<img
																use:tippy={{ content: 'Empty', theme: 'light' }}
																src="https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp"
																class="h-7"
																alt="Empty"
															/>
														{:else}
															<img
																use:tippy={{ content: item.name, theme: 'light' }}
																src={item.img}
																class="h-7"
																alt={item.name}
															/>
														{/if}
													</div>
												{/each}
											</div>
										</td>
										<td>
											<div class="flex flex-col">
												<img
													class="object-contain w-6 mx-auto"
													src={`/scepter_${player.aghanims_scepter}.png`}
													alt={`/scepter_${player.aghanims_scepter}`}
												/>
												<img
													class="object-contain w-6 mx-auto"
													src={`/shard_${player.aghanims_shard}.png`}
													alt={`/shard_${player.aghanims_shard}`}
												/>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div class="flex px-2">
						<div class="flex gap-1">
							{#each matchDetails2.matchData.picks as pick, i}
								<div class="flex flex-col text-xs text-center">
									<img src={pick.img} alt={pick.name} class="h-7" />
									{#if matchDetails2.direData.filter((player) => player.hero.id == pick.id).length + matchDetails2.radiantData.filter((player) => player.hero.id == pick.id).length > 0}
										<div
											class="py-[2px] bg-neutral-900 rounded-b-lg flex items-center justify-center"
										>
											Pick {i + 1}
										</div>
									{:else}
										<div class="py-[2px] bg-red-900 rounded-b-lg flex items-center justify-center">
											Pick {i + 1}
										</div>
									{/if}
								</div>
							{/each}
						</div>
						<div class="grow" />
						<div class="flex gap-1">
							{#each matchDetails2.matchData.bans as ban, i}
								<div class="flex flex-col text-xs text-center">
									<img src={ban.img} alt={ban.name} class="h-7" />
									<div class="py-[2px] bg-red-900 rounded-b-lg flex items-center justify-center">
										Pick {i + 1}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if showMatchData3}
	<div
		transition:fade={{ duration: 200 }}
		id="backdrop"
		class="h-screen fixed top-0 w-screen cursor-default flex justify-center items-center"
		on:click|self={() => (showMatchData3 = false)}
		on:keypress={(e) => e.key === 'Escape' && (showMatchData3 = false)}
		tabindex="0"
		role="button"
	>
		<div
			class="absolute opacity-100 bg-neutral-800 border-[1px] border-neutral-200 border-opacity-15 px-4 py-2 rounded-xl"
		>
			{#if !matchDetails3}
				<div class="flex w-full items-center justify-center"><Loading /></div>
			{:else if matchDetails3.error === 'Steam API Down.'}
				<div>Steam API Down.</div>
			{:else}
				<div class="flex flex-col gap-4 w-full">
					<div class="w-full flex justify-center gap-4 items-center">
						{#if matchDetails3.matchData.radiant_win}
							<div class="text-4xl text-emerald-500" style="text-shadow: #10b981 0 0 15px;">
								{matchDetails3.matchData.radiant_score}
							</div>
						{:else}
							<div class="text-4xl text-emerald-500">
								{matchDetails3.matchData.radiant_score}
							</div>
						{/if}
						<div class="flex flex-col justify-center items-center">
							<div class="text-4xl">
								{toTime(matchDetails3.matchData.duration)}
							</div>
							<div class="text-neutral-400">
								{dayjs(
									matchDetails3.matchData.startTime * 1000 + matchDetails3.matchData.duration * 1000
								).from(dayjs())}
							</div>
						</div>
						{#if !matchDetails3.matchData.radiant_win}
							<div class="text-4xl text-red-500" style="text-shadow: #ef4444 0 0 15px;">
								{matchDetails3.matchData.dire_score}
							</div>
						{:else}
							<div class="text-4xl text-red-500">
								{matchDetails3.matchData.dire_score}
							</div>
						{/if}
					</div>
					<div>
						<div class="text-xl font-display flex gap-2">
							<div>Radiant</div>
							{#if matchDetails3.matchData.radiant_win}
								<MaterialSymbolsTrophyRounded class="text-amber-300" />
							{/if}
						</div>
						<table class="table-auto">
							<thead>
								<tr>
									<th class="text-neutral-400 font-normal text-xs">PLAYER</th>
									<th class="text-neutral-400 font-normal text-xs">POS</th>
									<th class="text-neutral-400 font-normal text-xs">LEVEL</th>
									<th class="text-neutral-400 font-normal text-xs">K</th>
									<th class="text-neutral-400 font-normal text-xs">D</th>
									<th class="text-neutral-400 font-normal text-xs">A</th>
									<th class="text-neutral-400 font-normal text-xs">IMP</th>
									<th class="text-neutral-400 font-normal text-xs">CS</th>
									<th class="text-neutral-400 font-normal text-xs">NET</th>
									<th class="text-neutral-400 font-normal text-xs">GPM</th>
									<th class="text-neutral-400 font-normal text-xs">XPM</th>
									<th class="text-neutral-400 font-normal text-xs">HD</th>
									<th class="text-neutral-400 font-normal text-xs">TD</th>
									<th class="text-neutral-400 font-normal text-xs">HH</th>
									<th class="text-neutral-400 font-normal text-xs">ITEMS</th>
									<th class="text-neutral-400 font-normal text-xs">BACK</th>
									<th class="text-neutral-400 font-normal text-xs">AGHS</th>
								</tr>
							</thead>
							<tbody>
								{#each matchDetails3.radiantData as player}
									<tr class="border-y-[1px] border-white border-opacity-25">
										<td>
											<div class="flex items-center gap-2 w-40">
												<img src={player.hero.img} class="h-8" alt={player.hero.name} />
												{#if player.user}
													<button
														on:click={() => goto(`/player/${player.user?.id}`)}
														class="hover:text-neutral-300 transition-all duration-300"
														>{player.user.username}
													</button>

													<span class="italic text-indigo-400 text-lg"
														>{player.user.smurf ? 'S' : ''}</span
													>
												{:else}
													<div class="text-neutral-400">Anonymous</div>
												{/if}
											</div>
										</td>
										<td>
											<div class="w-12 text-center flex items-center justify-center h-6">
												<img
													src={`/roles/pos${player.role}.png`}
													alt={player.role.toString()}
													class="h-6"
												/>
											</div>
										</td>
										<td class="w-12 text-center">{player.level}</td>
										<td class="w-10 text-center text-green-400">{player.kills}</td>
										<td class="w-10 text-center text-red-400">{player.deaths}</td>
										<td class="w-10 text-center text-cyan-300">{player.assists}</td>
										<td class="w-12 text-center">
											<div
												class="w-12 items-center text-center cursor-default"
												use:tippy={{
													content: `Impact: ${player.impactScore}`,
													placement: 'bottom',
													theme: 'light'
												}}
											>
												{#if player.impactScore > 200}
													<div id="splusplusrating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore >= 140}
													<div id="srating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore < 140 && player.impactScore > 25}
													<div>
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore <= 25}
													<div id="frating" class="text-xl font-display flex justify-center">
														<FxemojiPoo />
													</div>
												{/if}
											</div>
										</td>
										<td class="w-20 text-center">{player.last_hits} / {player.denies}</td>
										<td class="w-20 text-center text-amber-300"
											>{convertToKNumber(player.gold + player.gold_spent)}</td
										>
										<td class="text-center w-20">{convertToKNumber(player.gold_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.xp_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.tower_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_healing)}</td>
										<td>
											<div class="flex flex-wrap items-center">
												{#each player.items as item}
													<img
														use:tippy={{ content: item.name, theme: 'light' }}
														src={item.img}
														class="h-7"
														alt={item.name}
													/>
												{/each}
												<img
													src={player.neutralItem.img}
													alt={player.neutralItem.name}
													use:tippy={{ content: player.neutralItem.name, theme: 'light' }}
													class="h-8 w-8 rounded-full object-cover mx-2"
												/>
											</div>
										</td>
										<td>
											<div class="flex flex-wrap">
												{#each player.backpack as item}
													<div>
														{#if item == null}
															<img
																use:tippy={{ content: 'Empty', theme: 'light' }}
																src="https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp"
																class="h-7"
																alt="Empty"
															/>
														{:else}
															<img
																use:tippy={{ content: item.name, theme: 'light' }}
																src={item.img}
																class="h-7"
																alt={item.name}
															/>
														{/if}
													</div>
												{/each}
											</div>
										</td>
										<td>
											<div class="flex flex-col">
												<img
													class="object-contain w-6 mx-auto"
													src={`/scepter_${player.aghanims_scepter}.png`}
													alt={`/scepter_${player.aghanims_scepter}`}
												/>
												<img
													class="object-contain w-6 mx-auto"
													src={`/shard_${player.aghanims_shard}.png`}
													alt={`/shard_${player.aghanims_shard}`}
												/>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div>
						<div class="text-xl font-display flex gap-2">
							<div>Dire</div>
							{#if !matchDetails3.matchData.radiant_win}
								<MaterialSymbolsTrophyRounded class="text-amber-300" />
							{/if}
						</div>
						<table class="table-auto">
							<thead>
								<tr>
									<th class="text-neutral-400 font-normal text-xs">PLAYER</th>
									<th class="text-neutral-400 font-normal text-xs">POS</th>
									<th class="text-neutral-400 font-normal text-xs">LEVEL</th>
									<th class="text-neutral-400 font-normal text-xs">K</th>
									<th class="text-neutral-400 font-normal text-xs">D</th>
									<th class="text-neutral-400 font-normal text-xs">A</th>
									<th class="text-neutral-400 font-normal text-xs">IMP</th>
									<th class="text-neutral-400 font-normal text-xs">CS</th>
									<th class="text-neutral-400 font-normal text-xs">NET</th>
									<th class="text-neutral-400 font-normal text-xs">GPM</th>
									<th class="text-neutral-400 font-normal text-xs">XPM</th>
									<th class="text-neutral-400 font-normal text-xs">HD</th>
									<th class="text-neutral-400 font-normal text-xs">TD</th>
									<th class="text-neutral-400 font-normal text-xs">HH</th>
									<th class="text-neutral-400 font-normal text-xs">ITEMS</th>
									<th class="text-neutral-400 font-normal text-xs">BACK</th>
									<th class="text-neutral-400 font-normal text-xs">AGHS</th>
								</tr>
							</thead>
							<tbody>
								{#each matchDetails3.direData as player}
									<tr class="border-y-[1px] border-white border-opacity-25">
										<td>
											<div class="flex items-center gap-2 w-40">
												<img src={player.hero.img} class="h-8" alt={player.hero.name} />
												{#if player.user}
													<button
														on:click={() => goto(`/player/${player.user?.id}`)}
														class="hover:text-neutral-300 transition-all duration-300"
														>{player.user.username}
													</button>

													<span class="italic text-indigo-400 text-lg"
														>{player.user.smurf ? 'S' : ''}</span
													>
												{:else}
													<div class="text-neutral-400">Anonymous</div>
												{/if}
											</div>
										</td>
										<td>
											<div class="w-12 text-center flex items-center justify-center h-6">
												<img
													src={`/roles/pos${player.role}.png`}
													alt={player.role.toString()}
													class="h-6"
												/>
											</div>
										</td>
										<td class="w-12 text-center">{player.level}</td>
										<td class="w-10 text-center text-green-400">{player.kills}</td>
										<td class="w-10 text-center text-red-400">{player.deaths}</td>
										<td class="w-10 text-center text-cyan-300">{player.assists}</td>
										<td class="w-12 text-center">
											<div
												class="w-12 items-center text-center cursor-default"
												use:tippy={{
													content: `Impact: ${player.impactScore}`,
													placement: 'bottom',
													theme: 'light'
												}}
											>
												{#if player.impactScore > 200}
													<div id="splusplusrating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore >= 140}
													<div id="srating">
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore < 140 && player.impactScore > 25}
													<div>
														{calcImpact(player.impactScore)}
													</div>
												{:else if player.impactScore <= 25}
													<div id="frating" class="text-xl font-display flex justify-center">
														<FxemojiPoo />
													</div>
												{/if}
											</div>
										</td>
										<td class="w-20 text-center">{player.last_hits} / {player.denies}</td>
										<td class="w-20 text-center text-amber-300"
											>{convertToKNumber(player.gold + player.gold_spent)}</td
										>
										<td class="text-center w-20">{convertToKNumber(player.gold_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.xp_per_min)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.tower_damage)}</td>
										<td class="text-center w-20">{convertToKNumber(player.hero_healing)}</td>
										<td>
											<div class="flex flex-wrap items-center">
												{#each player.items as item}
													<img
														use:tippy={{ content: item.name, theme: 'light' }}
														src={item.img}
														class="h-7"
														alt={item.name}
													/>
												{/each}
												<img
													src={player.neutralItem.img}
													alt={player.neutralItem.name}
													use:tippy={{ content: player.neutralItem.name, theme: 'light' }}
													class="h-8 w-8 rounded-full object-cover mx-2"
												/>
											</div>
										</td>
										<td>
											<div class="flex flex-wrap">
												{#each player.backpack as item}
													<div>
														{#if item == null}
															<img
																use:tippy={{ content: 'Empty', theme: 'light' }}
																src="https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp"
																class="h-7"
																alt="Empty"
															/>
														{:else}
															<img
																use:tippy={{ content: item.name, theme: 'light' }}
																src={item.img}
																class="h-7"
																alt={item.name}
															/>
														{/if}
													</div>
												{/each}
											</div>
										</td>
										<td>
											<div class="flex flex-col">
												<img
													class="object-contain w-6 mx-auto"
													src={`/scepter_${player.aghanims_scepter}.png`}
													alt={`/scepter_${player.aghanims_scepter}`}
												/>
												<img
													class="object-contain w-6 mx-auto"
													src={`/shard_${player.aghanims_shard}.png`}
													alt={`/shard_${player.aghanims_shard}`}
												/>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div class="flex px-2">
						<div class="flex gap-1">
							{#each matchDetails3.matchData.picks as pick, i}
								<div class="flex flex-col text-xs text-center">
									<img src={pick.img} alt={pick.name} class="h-7" />
									{#if matchDetails3.direData.filter((player) => player.hero.id == pick.id).length + matchDetails3.radiantData.filter((player) => player.hero.id == pick.id).length > 0}
										<div
											class="py-[2px] bg-neutral-900 rounded-b-lg flex items-center justify-center"
										>
											Pick {i + 1}
										</div>
									{:else}
										<div class="py-[2px] bg-red-900 rounded-b-lg flex items-center justify-center">
											Pick {i + 1}
										</div>
									{/if}
								</div>
							{/each}
						</div>
						<div class="grow" />
						<div class="flex gap-1">
							{#each matchDetails3.matchData.bans as ban, i}
								<div class="flex flex-col text-xs text-center">
									<img src={ban.img} alt={ban.name} class="h-7" />
									<div class="py-[2px] bg-red-900 rounded-b-lg flex items-center justify-center">
										Pick {i + 1}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	@keyframes downScroll {
		0% {
			background-position: 0px -24000px;
		}
		100% {
			background-position: 0px 0px;
		}
	}

	#down-arrows {
		background-image: url('/down-arrows.png');
		animation: downScroll 600s linear infinite;
	}

	@keyframes upScroll {
		0% {
			background-position: 0px 0px;
		}
		100% {
			background-position: 0px -24000px;
		}
	}

	#up-arrows {
		background-image: url('/up-arrows.png');
		animation: upScroll 600s linear infinite;
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
