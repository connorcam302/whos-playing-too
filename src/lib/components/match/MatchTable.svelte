<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import { fade } from 'svelte/transition';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { goto } from '$app/navigation';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import MaterialSymbolsTrophyRounded from '~icons/material-symbols/trophy-rounded';
	import IcBaselineLaunch from '~icons/ic/baseline-launch';
	import MaterialSymbolsLightSettings from '~icons/material-symbols-light/settings';
	import { calcImpact } from '$lib/functions';
	import tippy from 'tippy.js';

	dayjs.extend(relativeTime);

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
		item_zinc: number;
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

	export let matchDetails: {
			matchData: MatchData;
			radiantData: PlayerData[];
			direData: PlayerData[];
			error?: any;
		},
		pickOrder: boolean = true,
		modal: boolean = true;

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

	const arraySwap = (arr, index1, index2) => {
		const temp = arr[index1];
		arr[index1] = arr[index2];
		arr[index2] = temp;
	};

	let radiantRoles = [
		{ account_id: -1, hero_id: 0, role: 0, user: null },
		{ account_id: -2, hero_id: 0, role: 0, user: null },
		{ account_id: -3, hero_id: 0, role: 0, user: null },
		{ account_id: -4, hero_id: 0, role: 0, user: null },
		{ account_id: -5, hero_id: 0, role: 0, user: null }
	];
	let direRoles = [
		{ account_id: -6, hero_id: 0, role: 0, user: null },
		{ account_id: -7, hero_id: 0, role: 0, user: null },
		{ account_id: -8, hero_id: 0, role: 0, user: null },
		{ account_id: -9, hero_id: 0, role: 0, user: null },
		{ account_id: -10, hero_id: 0, role: 0, user: null }
	];

	$: if (matchDetails) {
		const radiantUserData = matchDetails.radiantData.filter((player) => player.user);
		const direUserData = matchDetails.direData.filter((player) => player.user);

		radiantUserData.forEach((player) => {
			radiantRoles[player.role - 1] = player;
		});

		direUserData.forEach((player) => {
			direRoles[player.role - 1] = player;
		});
	}

	$: radiantSelected = null;
	$: direSelected = null;

	const radiantHandleClick = (player) => {
		if (radiantSelected === null) {
			radiantSelected = player;
		} else if (radiantSelected === player) {
			radiantSelected = null;
		} else {
			arraySwap(radiantRoles, radiantRoles.indexOf(player), radiantRoles.indexOf(radiantSelected));
			radiantSelected = null;
		}
	};

	const direHandleClick = (player) => {
		if (direSelected === null) {
			direSelected = player;
		} else if (direSelected === player) {
			direSelected = null;
		} else {
			arraySwap(direRoles, direRoles.indexOf(player), direRoles.indexOf(direSelected));
			direSelected = null;
		}
	};

	$: buttonState = 'Apply';

	const applyRoleChange = async () => {
		const radiantData = radiantRoles.map((player, index) => {
			if (player?.user) {
				return { heroId: player?.hero_id, role: index + 1 };
			}
		});
		const direData = direRoles.map((player, index) => {
			if (player?.user) {
				return { heroId: player?.hero_id, role: index + 1 };
			}
		});
		console.log(radiantData, direData);

		buttonState = '...';

		const radiantResponse = await fetch(
			`/api/matches/${matchDetails.matchData.match_id}/set-roles`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ ...radiantData })
			}
		);

		const direResponse = await fetch(`/api/matches/${matchDetails.matchData.match_id}/set-roles`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ...direData })
		});

		await Promise.all([radiantResponse, direResponse]).then(() => location.reload());
	};

	$: fixRoleScreenShow = false;
</script>

<div class="px-4">
	{#if !matchDetails}
		<div class="flex w-full items-center justify-center"><Loading /></div>
	{:else if matchDetails.error === 'Steam API Down.'}
		<div>Steam API Down.</div>
	{:else}
		<div class="flex flex-col gap-4 w-full my-2">
			<div class="w-full flex justify-center gap-4 items-center">
				<div class="basis-1/3">
					<button class="text-4xl" on:click={() => (fixRoleScreenShow = true)}>
						<MaterialSymbolsLightSettings />
					</button>
				</div>
				<div class="basis-1/3 flex items-center justify-center gap-4">
					{#if matchDetails.matchData.radiant_win}
						<div class="text-4xl text-emerald-500" style="text-shadow: #10b981 0 0 15px;">
							{matchDetails.matchData.radiant_score}
						</div>
					{:else}
						<div class="text-4xl text-emerald-500">
							{matchDetails.matchData.radiant_score}
						</div>
					{/if}
					<div class="flex flex-col justify-center items-center">
						<div class="text-4xl">
							{toTime(matchDetails.matchData.duration)}
						</div>
						<div class="text-zinc-400">
							{dayjs(
								matchDetails.matchData.start_time * 1000 + matchDetails.matchData.duration * 1000
							).from(dayjs())}
						</div>
					</div>
					{#if !matchDetails.matchData.radiant_win}
						<div class="text-4xl text-red-500" style="text-shadow: #ef4444 0 0 15px;">
							{matchDetails.matchData.dire_score}
						</div>
					{:else}
						<div class="text-4xl text-red-500">
							{matchDetails.matchData.dire_score}
						</div>
					{/if}
				</div>
				<div class="basis-1/3 flex justify-end gap-2 items-center">
					{#if modal}
						<button
							on:click={() => goto(`/match/${matchDetails.matchData.match_id}`)}
							class="text-xl"
						>
							<IcBaselineLaunch />
						</button>
					{/if}
					<a
						href={`https://www.dotabuff.com/matches/${matchDetails.matchData.match_id}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<img src="/dotabuff.png" alt="dotabuff" class="h-6" />
					</a>
					<a
						href={`https://www.opendota.com/matches/${matchDetails.matchData.match_id}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<img src="/opendota.png" alt="opendota" class="h-6" />
					</a>
					<a
						href={`https://www.stratz.com/match/${matchDetails.matchData.match_id}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<img src="/stratz.png" alt="stratz" class="h-6" />
					</a>
				</div>
			</div>
			<div class="flex flex-col gap-8">
				<div>
					<div class="text-xl font-display flex gap-2">
						<div>Radiant</div>
						{#if matchDetails.matchData.radiant_win}
							<MaterialSymbolsTrophyRounded class="text-amber-300" />
						{/if}
					</div>
					<div class="overflow-x-auto max-w-[97vw]">
						<div class="min-w-[1432px]">
							<table class="table-auto">
								<thead>
									<tr>
										<th class="text-zinc-400 font-normal text-xs w-40">PLAYER</th>
										<th class="text-zinc-400 font-normal text-xs w-16">POS</th>
										<th class="text-zinc-400 font-normal text-xs w-20">LEVEL</th>
										<th class="text-zinc-400 font-normal text-xs w-16">K</th>
										<th class="text-zinc-400 font-normal text-xs w-16">D</th>
										<th class="text-zinc-400 font-normal text-xs w-16">A</th>
										<th class="text-zinc-400 font-normal text-xs w-20">IMP</th>
										<th class="text-zinc-400 font-normal text-xs max-w-24">CS</th>
										<th class="text-zinc-400 font-normal text-xs w-24">NET</th>
										<th class="text-zinc-400 font-normal text-xs w-24">GPM</th>
										<th class="text-zinc-400 font-normal text-xs w-24">XPM</th>
										<th class="text-zinc-400 font-normal text-xs w-24">HD</th>
										<th class="text-zinc-400 font-normal text-xs w-24">TD</th>
										<th class="text-zinc-400 font-normal text-xs w-24">HH</th>
										<th class="text-zinc-400 font-normal text-xs">ITEMS</th>
										<th class="text-zinc-400 font-normal text-xs">BACK</th>
										<th class="text-zinc-400 font-normal text-xs">AGHS</th>
									</tr>
								</thead>
								<tbody>
									{#each matchDetails.radiantData as player}
										<tr class="border-y-[1px] border-white border-opacity-10 hover:bg-zinc-800">
											<td>
												<div class="flex items-center gap-2 w-40 py-2">
													<img src={player.hero.img} class="h-8" alt={player.hero.name} />
													{#if player.user}
														<button
															on:click={() => goto(`/player/${player.user?.id}`)}
															class="hover:text-zinc-300 transition-all duration-300"
															>{player.user.username}
														</button>

														<span class="italic text-indigo-400 text-lg"
															>{player.user.smurf ? 'S' : ''}</span
														>
													{:else}
														<div class="text-zinc-400">Anonymous</div>
													{/if}
												</div>
											</td>
											<td>
												<div class="w-full text-center flex items-center justify-center h-6">
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
												<div class="flex items-center">
													{#each player.items as item}
														<img
															use:tippy={{ content: item.name, theme: 'light' }}
															src={item.img}
															class="h-7 max-w-none"
															alt={item.name}
														/>
													{/each}
													<img
														src={player.neutralItem.img}
														alt={player.neutralItem.name}
														use:tippy={{ content: player.neutralItem.name, theme: 'light' }}
														class="h-7 max-w-none rounded-full object-cover mx-2"
													/>
												</div>
											</td>
											<td>
												<div class="flex">
													{#each player.backpack as item}
														<div>
															{#if item == null}
																<img
																	use:tippy={{ content: 'Empty', theme: 'light' }}
																	src="https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp"
																	class="h-7 max-w-none"
																	alt="Empty"
																/>
															{:else}
																<img
																	use:tippy={{ content: item.name, theme: 'light' }}
																	src={item.img}
																	class="h-7 max-w-none"
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
					</div>
				</div>
				<div>
					<div class="text-xl font-display flex gap-2">
						<div>Dire</div>
						{#if !matchDetails.matchData.radiant_win}
							<MaterialSymbolsTrophyRounded class="text-amber-300" />
						{/if}
					</div>
					<div class="overflow-x-auto max-w-[97vw]">
						<div class="min-w-[1432px]">
							<table class="table-auto">
								<thead>
									<tr>
										<th class="text-zinc-400 font-normal text-xs w-40">PLAYER</th>
										<th class="text-zinc-400 font-normal text-xs w-16">POS</th>
										<th class="text-zinc-400 font-normal text-xs w-20">LEVEL</th>
										<th class="text-zinc-400 font-normal text-xs w-16">K</th>
										<th class="text-zinc-400 font-normal text-xs w-16">D</th>
										<th class="text-zinc-400 font-normal text-xs w-16">A</th>
										<th class="text-zinc-400 font-normal text-xs w-20">IMP</th>
										<th class="text-zinc-400 font-normal text-xs max-w-24">CS</th>
										<th class="text-zinc-400 font-normal text-xs w-24">NET</th>
										<th class="text-zinc-400 font-normal text-xs w-24">GPM</th>
										<th class="text-zinc-400 font-normal text-xs w-24">XPM</th>
										<th class="text-zinc-400 font-normal text-xs w-24">HD</th>
										<th class="text-zinc-400 font-normal text-xs w-24">TD</th>
										<th class="text-zinc-400 font-normal text-xs w-24">HH</th>
										<th class="text-zinc-400 font-normal text-xs">ITEMS</th>
										<th class="text-zinc-400 font-normal text-xs">BACK</th>
										<th class="text-zinc-400 font-normal text-xs">AGHS</th>
									</tr>
								</thead>
								<tbody>
									{#each matchDetails.direData as player}
										<tr class="border-y-[1px] border-white border-opacity-10">
											<td>
												<div class="flex items-center gap-2 w-40 py-2">
													<img src={player.hero.img} class="h-8" alt={player.hero.name} />
													{#if player.user}
														<button
															on:click={() => goto(`/player/${player.user?.id}`)}
															class="hover:text-zinc-300 transition-all duration-300"
															>{player.user.username}
														</button>

														<span class="italic text-indigo-400 text-lg"
															>{player.user.smurf ? 'S' : ''}</span
														>
													{:else}
														<div class="text-zinc-400">Anonymous</div>
													{/if}
												</div>
											</td>
											<td>
												<div class="w-full text-center flex items-center justify-center h-6">
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
												<div class="flex items-center">
													{#each player.items as item}
														<img
															use:tippy={{ content: item.name, theme: 'light' }}
															src={item.img}
															class="h-7 max-w-none"
															alt={item.name}
														/>
													{/each}
													<img
														src={player.neutralItem.img}
														alt={player.neutralItem.name}
														use:tippy={{ content: player.neutralItem.name, theme: 'light' }}
														class="h-7 max-w-none rounded-full object-cover mx-2"
													/>
												</div>
											</td>
											<td>
												<div class="flex">
													{#each player.backpack as item}
														<div>
															{#if item == null}
																<img
																	use:tippy={{ content: 'Empty', theme: 'light' }}
																	src="https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp"
																	class="h-7 max-w-none"
																	alt="Empty"
																/>
															{:else}
																<img
																	use:tippy={{ content: item.name, theme: 'light' }}
																	src={item.img}
																	class="h-7 max-w-none"
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
					</div>
				</div>
				{#if pickOrder}
					<div class="flex px-2">
						<div class="flex gap-1 basis-11/12 overflow-x-scroll">
							{#each matchDetails.matchData.picks as pick, i}
								<div class="flex flex-col text-xs text-center">
									<img src={pick.img} alt={pick.name} class="h-7 max-w-none" />
									{#if matchDetails.direData.filter((player) => player.hero.id == pick.id).length + matchDetails.radiantData.filter((player) => player.hero.id == pick.id).length > 0}
										<div class="py-[2px] bg-zinc-900 rounded-b-lg flex items-center justify-center">
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
						<div class="basis-2/12" />
						<div class="flex gap-1 justify-end basis-11/12 overflow-x-auto">
							{#each matchDetails.matchData.bans as ban, i}
								<div class="flex flex-col text-xs text-center">
									<img src={ban.img} alt={ban.name} class="h-7 max-w-none" />
									<div class="py-[2px] bg-red-900 rounded-b-lg flex items-center justify-center">
										Ban {i + 1}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if fixRoleScreenShow}
	<div
		transition:fade={{ duration: 200 }}
		id="backdrop"
		class="h-screen fixed top-0 w-screen cursor-default flex justify-center items-center z-10"
		on:click|self={() => (fixRoleScreenShow = false)}
		on:keypress={(e) => e.key === 'Escape' && (fixRoleScreenShow = false)}
		tabindex="0"
		role="button"
	>
		<div
			class="absolute opacity-100 bg-zinc-900 border-[1px] border-zinc-200 border-opacity-15 px-4 py-2 rounded-xl z-20"
		>
			<div class="flex flex-col gap-2">
				<div class="flex gap-8">
					{#if !radiantRoles.every((player) => player === null)}
						<div>
							{#key radiantSelected}
								<div class="text-center">Radiant Roles</div>
								<div class="flex flex-col gap-2 w-32">
									<div class="flex gap-1 items-center">
										<img src="/roles/pos1.png" alt="pos1" class="h-6" />
										<button
											class="border-zinc-200 border-2 rounded-xl border-opacity-25 px-2 grow flex gap-2"
											on:click={() => radiantHandleClick(radiantRoles[0])}
											style={radiantSelected?.account_id === radiantRoles[0].account_id
												? 'border-color: #f43f5e'
												: ''}
										>
											{#if radiantRoles[0]?.user}
												<div>{radiantRoles[0]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex gap-1 items-center">
										<img src="/roles/pos2.png" alt="pos2" class="h-6" />
										<button
											class="border-zinc-200 border-2 rounded-xl border-opacity-25 px-2 grow flex gap-2"
											on:click={() => radiantHandleClick(radiantRoles[1])}
											style={radiantSelected?.account_id === radiantRoles[1].account_id
												? 'border-color: #f43f5e'
												: ''}
										>
											{#if radiantRoles[1]?.user}
												<div>{radiantRoles[1]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex gap-1 items-center">
										<img src="/roles/pos3.png" alt="pos3" class="h-6" />
										<button
											class="border-zinc-200 border-2 rounded-xl border-opacity-25 px-2 grow flex gap-2"
											on:click={() => radiantHandleClick(radiantRoles[2])}
											style={radiantSelected?.account_id === radiantRoles[2].account_id
												? 'border-color: #f43f5e'
												: ''}
										>
											{#if radiantRoles[2]?.user}
												<div>{radiantRoles[2]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex gap-1 items-center">
										<img src="/roles/pos4.png" alt="pos4" class="h-6" />
										<button
											class="border-zinc-200 border-2 rounded-xl border-opacity-25 px-2 grow flex gap-2"
											on:click={() => radiantHandleClick(radiantRoles[3])}
											style={radiantSelected?.account_id === radiantRoles[3].account_id
												? 'border-color: #f43f5e'
												: ''}
										>
											{#if radiantRoles[3]?.user}
												<div>{radiantRoles[3]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex gap-1 items-center">
										<img src="/roles/pos5.png" alt="pos5" class="h-6" />
										<button
											class="border-zinc-200 border-2 rounded-xl border-opacity-25 px-2 grow flex gap-2"
											on:click={() => radiantHandleClick(radiantRoles[4])}
											style={radiantSelected?.account_id === radiantRoles[4].account_id
												? 'border-color: #f43f5e'
												: ''}
										>
											{#if radiantRoles[4]?.user}
												<div>{radiantRoles[4]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
								</div>
							{/key}
						</div>
					{/if}
					{#if !direRoles.every((player) => player === null)}
						<div>
							{#key direSelected}
								<div class="text-center">Dire Roles</div>
								<div class="flex flex-col gap-2 w-32">
									<div class="flex gap-1 items-center">
										<img src="/roles/pos1.png" alt="pos1" class="h-6" />
										<button
											class="border-zinc-200 border-2 rounded-xl border-opacity-25 px-2 grow"
											on:click={() => direHandleClick(direRoles[0])}
											style={direSelected?.account_id === direRoles[0].account_id
												? 'border-color: #f43f5e'
												: ''}
										>
											{#if direRoles[0]?.user}
												<div>{direRoles[0]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex gap-1 items-center">
										<img src="/roles/pos2.png" alt="pos2" class="h-6" />
										<button
											class="border-zinc-200 border-2 rounded-xl border-opacity-25 px-2 grow"
											on:click={() => direHandleClick(direRoles[1])}
											style={direSelected?.account_id === direRoles[1].account_id
												? 'border-color: #f43f5e'
												: ''}
										>
											{#if direRoles[1]?.user}
												<div>{direRoles[1]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex gap-1 items-center">
										<img src="/roles/pos3.png" alt="pos3" class="h-6" />
										<button
											class="border-zinc-200 border-2 rounded-xl border-opacity-25 px-2 grow"
											on:click={() => direHandleClick(direRoles[2])}
											style={direSelected?.account_id === direRoles[2].account_id
												? 'border-color: #f43f5e'
												: ''}
										>
											{#if direRoles[2]?.user}
												<div>{direRoles[2]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex gap-1 items-center">
										<img src="/roles/pos4.png" alt="pos4" class="h-6" />
										<button
											class="border-zinc-200 border-2 rounded-xl border-opacity-25 px-2 grow"
											on:click={() => direHandleClick(direRoles[3])}
											style={direSelected?.account_id === direRoles[3].account_id
												? ' border-color: #f43f5e'
												: ''}
										>
											{#if direRoles[3]?.user}
												<div>{direRoles[3]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex gap-1 items-center">
										<img src="/roles/pos5.png" alt="pos5" class="h-6" />
										<button
											class="border-zinc-200 border-2 rounded-xl border-opacity-25 px-2 grow"
											on:click={() => direHandleClick(direRoles[4])}
											style={direSelected?.account_id === direRoles[4].account_id
												? 'border-color: #f43f5e'
												: ''}
										>
											{#if direRoles[4]?.user}
												<div>{direRoles[4]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
								</div>
							{/key}
						</div>
					{/if}
				</div>
				<div class="flex w-full items-center justify-center">
					{#key buttonState}
						<button on:click={() => applyRoleChange()} class="rounded-xl px-4 py-1 bg-rose-500"
							>{buttonState}</button
						>
					{/key}
				</div>
			</div>
		</div>
	</div>
{/if}

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
