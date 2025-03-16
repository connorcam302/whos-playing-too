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
	import { calcImpact, getRoleIcon } from '$lib/functions';
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

		buttonState = '...';

		const radiantResponse = await fetch(
			`/api/matches/${matchDetails.matchData.match_id}/set-roles`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					roleData: { ...radiantData },
					sequenceNum: matchDetails.matchData.match_seq_num
				})
			}
		);

		const direResponse = await fetch(`/api/matches/${matchDetails.matchData.match_id}/set-roles`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				roleData: { ...direData },
				sequenceNum: matchDetails.matchData.match_seq_num
			})
		});

		await Promise.all([radiantResponse, direResponse]).then(() => location.reload());
	};

	$: fixRoleScreenShow = false;

	const getImpactDetails = (match: any, role: any, duration: any) => {
		let impact = 0;
		const csMin = match.last_hits / (duration / 60);
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
</script>

<div class="px-4">
	{#if !matchDetails}
		<div class="flex w-full items-center justify-center"><Loading /></div>
	{:else if matchDetails.error === 'Steam API Down.'}
		<div>Steam API Down.</div>
	{:else}
		<div class="my-2 flex w-full flex-col gap-4">
			<div class="flex w-full items-center justify-center gap-4">
				<div class="basis-1/3">
					<button class="text-4xl" on:click={() => (fixRoleScreenShow = true)}>
						<MaterialSymbolsLightSettings />
					</button>
				</div>
				<div class="flex basis-1/3 items-center justify-center gap-4">
					{#if matchDetails.matchData.radiant_win}
						<div class="text-4xl text-emerald-500" style="text-shadow: #10b981 0 0 15px;">
							{matchDetails.matchData.radiant_score}
						</div>
					{:else}
						<div class="text-4xl text-emerald-500">
							{matchDetails.matchData.radiant_score}
						</div>
					{/if}
					<div class="flex flex-col items-center justify-center">
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
				<div class="flex basis-1/3 flex-wrap items-center justify-end gap-2">
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
					<div class="flex gap-2 font-display text-xl">
						<div>Radiant</div>
						{#if matchDetails.matchData.radiant_win}
							<MaterialSymbolsTrophyRounded class="text-amber-300" />
						{/if}
					</div>
					<div class="max-w-[97vw] overflow-x-auto">
						<div class="min-w-[1450px]">
							<table class="table-auto">
								<thead>
									<tr>
										<th class="w-40 text-xs font-normal text-zinc-400">PLAYER</th>
										<th class="w-16 text-xs font-normal text-zinc-400">POS</th>
										<th class="w-20 text-xs font-normal text-zinc-400">LEVEL</th>
										<th class="w-16 text-xs font-normal text-zinc-400">K</th>
										<th class="w-16 text-xs font-normal text-zinc-400">D</th>
										<th class="w-16 text-xs font-normal text-zinc-400">A</th>
										<th class="w-20 text-xs font-normal text-zinc-400">IMP</th>
										<th class="max-w-24 text-xs font-normal text-zinc-400">CS</th>
										<th class="w-24 text-xs font-normal text-zinc-400">NET</th>
										<th class="w-24 text-xs font-normal text-zinc-400">GPM</th>
										<th class="w-24 text-xs font-normal text-zinc-400">XPM</th>
										<th class="w-24 text-xs font-normal text-zinc-400">HD</th>
										<th class="w-24 text-xs font-normal text-zinc-400">TD</th>
										<th class="w-24 text-xs font-normal text-zinc-400">HH</th>
										<th class="text-xs font-normal text-zinc-400">ITEMS</th>
										<th class="text-xs font-normal text-zinc-400">BACK</th>
										<th class="text-xs font-normal text-zinc-400">AGHS</th>
									</tr>
								</thead>
								<tbody>
									{#each matchDetails.radiantData as player}
										<tr class="border-y-[1px] border-white border-opacity-10 hover:bg-zinc-800">
											<td>
												<div class="flex w-40 items-center gap-2 py-2">
													<img src={player.hero.img} class="h-8" alt={player.hero.name} />
													{#if player.user}
														<button
															on:click={() => goto(`/player/${player.user?.id}`)}
															class="transition-all duration-300 hover:text-zinc-300"
															>{player.user.username}
														</button>

														<span class="text-lg italic text-indigo-400"
															>{player.user.smurf ? 'S' : ''}</span
														>
													{:else}
														<div class="text-zinc-400">Anonymous</div>
													{/if}
												</div>
											</td>
											<td>
												<div class="flex h-6 w-full items-center justify-center text-center">
													<img
														src={getRoleIcon(player.role)}
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
													class="w-12 cursor-default items-center text-center"
													use:tippy={{
														content: `
                <div class='text-center'>Impact Rating: <span class='font-bold'>${
									player.impactScore
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
      <td class='px-4 text-center'>${distribution(player.role)?.kapm}%</td>
      <td class='text-right'>${
				getImpactDetails(player, player.role, matchDetails.matchData.duration).kapmRating
			}</td>
    </tr>
    <tr>
      <td class='text-left'>Death</td>
      <td class='px-4 text-center'>${distribution(player.role)?.death}%</td>
      <td class='text-right'>${
				getImpactDetails(player, player.role, matchDetails.matchData.duration).deathRating
			}</td>
    </tr>
    ${
			player.role === 1 || player.role === 2 || player.role === 3
				? `<tr>
      <td class='text-left'>CS</td>
      <td class='px-4 text-center'>${distribution(player.role)?.csMin}%</td>
      <td class='text-right'>${
				getImpactDetails(player, player.role, matchDetails.matchData.duration).csMinRating
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
														<div id="frating" class="flex justify-center font-display text-xl">
															<FxemojiPoo />
														</div>
													{/if}
												</div>
											</td>
											<td class="w-20 text-center">{player.last_hits} / {player.denies}</td>
											<td class="w-20 text-center text-amber-300"
												>{convertToKNumber(player.net_worth)}</td
											>
											<td class="w-20 text-center">{convertToKNumber(player.gold_per_min)}</td>
											<td class="w-20 text-center"
												>{convertToKNumber(player.xp_per_min) || 'N/A'}</td
											>
											<td class="w-20 text-center"
												>{convertToKNumber(player.hero_damage) || 'N/A'}</td
											>
											<td class="w-20 text-center"
												>{convertToKNumber(player.tower_damage) || 'N/A'}</td
											>
											<td class="w-20 text-center"
												>{convertToKNumber(player.hero_healing) || 'N/A'}</td
											>
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
														src={player.neutralItem?.img ??
															'https://1000logos.net/wp-content/uploads/2024/04/Question-Mark-Emojis.png'}
														alt={player.neutralItem?.name}
														use:tippy={{ content: player.neutralItem?.name, theme: 'light' }}
														class="mx-2 h-7 max-w-none rounded-full object-cover"
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
														class="mx-auto w-6 object-contain"
														src={`/scepter_${player.aghanims_scepter}.png`}
														alt={`/scepter_${player.aghanims_scepter}`}
													/>
													<img
														class="mx-auto w-6 object-contain"
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
					<div class="flex gap-2 font-display text-xl">
						<div>Dire</div>
						{#if !matchDetails.matchData.radiant_win}
							<MaterialSymbolsTrophyRounded class="text-amber-300" />
						{/if}
					</div>
					<div class="max-w-[97vw] overflow-x-auto">
						<div class="min-w-[1450px]">
							<table class="table-auto">
								<thead>
									<tr>
										<th class="w-40 text-xs font-normal text-zinc-400">PLAYER</th>
										<th class="w-16 text-xs font-normal text-zinc-400">POS</th>
										<th class="w-20 text-xs font-normal text-zinc-400">LEVEL</th>
										<th class="w-16 text-xs font-normal text-zinc-400">K</th>
										<th class="w-16 text-xs font-normal text-zinc-400">D</th>
										<th class="w-16 text-xs font-normal text-zinc-400">A</th>
										<th class="w-20 text-xs font-normal text-zinc-400">IMP</th>
										<th class="max-w-28 text-xs font-normal text-zinc-400">CS</th>
										<th class="w-24 text-xs font-normal text-zinc-400">NET</th>
										<th class="w-24 text-xs font-normal text-zinc-400">GPM</th>
										<th class="w-24 text-xs font-normal text-zinc-400">XPM</th>
										<th class="w-24 text-xs font-normal text-zinc-400">HD</th>
										<th class="w-24 text-xs font-normal text-zinc-400">TD</th>
										<th class="w-24 text-xs font-normal text-zinc-400">HH</th>
										<th class="text-xs font-normal text-zinc-400">ITEMS</th>
										<th class="text-xs font-normal text-zinc-400">BACK</th>
										<th class="text-xs font-normal text-zinc-400">AGHS</th>
									</tr>
								</thead>
								<tbody>
									{#each matchDetails.direData as player}
										<tr class="border-y-[1px] border-white border-opacity-10">
											<td>
												<div class="flex w-40 items-center gap-2 py-2">
													<img src={player.hero.img} class="h-8" alt={player.hero.name} />
													{#if player.user}
														<button
															on:click={() => goto(`/player/${player.user?.id}`)}
															class="transition-all duration-300 hover:text-zinc-300"
															>{player.user.username}
														</button>

														<span class="text-lg italic text-indigo-400"
															>{player.user.smurf ? 'S' : ''}</span
														>
													{:else}
														<div class="text-zinc-400">Anonymous</div>
													{/if}
												</div>
											</td>
											<td>
												<div class="flex h-6 w-full items-center justify-center text-center">
													<img
														src={getRoleIcon(player.role)}
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
													class="w-12 cursor-default items-center text-center"
													use:tippy={{
														content: `
                <div class='text-center'>Impact Rating: <span class='font-bold'>${
									player.impactScore
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
      <td class='px-4 text-center'>${distribution(player.role)?.kapm}%</td>
      <td class='text-right'>${
				getImpactDetails(player, player.role, matchDetails.matchData.duration).kapmRating
			}</td>
    </tr>
    <tr>
      <td class='text-left'>Death</td>
      <td class='px-4 text-center'>${distribution(player.role)?.death}%</td>
      <td class='text-right'>${
				getImpactDetails(player, player.role, matchDetails.matchData.duration).deathRating
			}</td>
    </tr>
    ${
			player.role === 1 || player.role === 2 || player.role === 3
				? `<tr>
      <td class='text-left'>CS</td>
      <td class='px-4 text-center'>${distribution(player.role)?.csMin}%</td>
      <td class='text-right'>${
				getImpactDetails(player, player.role, matchDetails.matchData.duration).csMinRating
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
														<div id="frating" class="flex justify-center font-display text-xl">
															<FxemojiPoo />
														</div>
													{/if}
												</div>
											</td>
											<td class="w-20 text-center">{player.last_hits} / {player.denies}</td>
											<td class="w-20 text-center text-amber-300"
												>{convertToKNumber(player.net_worth)}</td
											>
											<td class="w-20 text-center">{convertToKNumber(player.gold_per_min)}</td>
											<td class="w-20 text-center">{convertToKNumber(player.xp_per_min)}</td>
											<td class="w-20 text-center"
												>{convertToKNumber(player.hero_damage) || 'N/A'}</td
											>
											<td class="w-20 text-center"
												>{convertToKNumber(player.tower_damage) || 'N/A'}</td
											>
											<td class="w-20 text-center"
												>{convertToKNumber(player.hero_healing) || 'N/A'}</td
											>
											<td>
												<div class="flex items-center">
													{#each player.items as item}
														<img
															use:tippy={{ content: item?.name, theme: 'light' }}
															src={item?.img ||
																'https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp'}
															class="h-7 max-w-none"
															alt={item?.name || 'Unknown Item'}
														/>
													{/each}
													<img
														src={player.neutralItem?.img}
														alt={player.neutralItem?.name}
														use:tippy={{ content: player.neutralItem?.name, theme: 'light' }}
														class="mx-2 h-7 max-w-none rounded-full object-cover"
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
														class="mx-auto w-6 object-contain"
														src={`/scepter_${player.aghanims_scepter}.png`}
														alt={`/scepter_${player.aghanims_scepter}`}
													/>
													<img
														class="mx-auto w-6 object-contain"
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
						<div class="flex basis-11/12 gap-1 overflow-x-scroll">
							{#each matchDetails.matchData.picks as pick, i}
								<div class="flex flex-col text-center text-xs">
									<img src={pick.img} alt={pick.name} class="h-7 max-w-none" />
									{#if matchDetails.direData.filter((player) => player.hero.id == pick.id).length + matchDetails.radiantData.filter((player) => player.hero.id == pick.id).length > 0}
										<div class="flex items-center justify-center rounded-b-lg bg-zinc-900 py-[2px]">
											Pick {i + 1}
										</div>
									{:else}
										<div class="flex items-center justify-center rounded-b-lg bg-red-900 py-[2px]">
											Pick {i + 1}
										</div>
									{/if}
								</div>
							{/each}
						</div>
						<div class="basis-2/12" />
						<div class="flex basis-11/12 justify-end gap-1 overflow-x-auto">
							{#each matchDetails.matchData.bans as ban, i}
								<div class="flex flex-col text-center text-xs">
									<img src={ban.img} alt={ban.name} class="h-7 max-w-none" />
									<div class="flex items-center justify-center rounded-b-lg bg-red-900 py-[2px]">
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
		class="fixed top-0 z-10 flex h-screen w-screen cursor-default items-center justify-center"
		on:click|self={() => (fixRoleScreenShow = false)}
		on:keypress={(e) => e.key === 'Escape' && (fixRoleScreenShow = false)}
		tabindex="0"
		role="button"
	>
		<div
			class="absolute z-20 rounded-xl border-[1px] border-zinc-200 border-opacity-15 bg-zinc-900 px-4 py-2 opacity-100"
		>
			<div class="flex flex-col gap-2">
				<div class="flex gap-8">
					{#if !radiantRoles.every((player) => player === null)}
						<div>
							{#key radiantSelected}
								<div class="text-center">Radiant Roles</div>
								<div class="flex w-32 flex-col gap-2">
									<div class="flex items-center gap-1">
										<img src="/roles/pos1.png" alt="pos1" class="h-6" />
										<button
											class="flex grow gap-2 rounded-xl border-2 border-zinc-200 border-opacity-25 px-2"
											on:click={() => radiantHandleClick(radiantRoles[0])}
											style={radiantSelected?.account_id === radiantRoles[0].account_id
												? 'border-color: #38bdf8'
												: ''}
										>
											{#if radiantRoles[0]?.user}
												<div>{radiantRoles[0]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex items-center gap-1">
										<img src="/roles/pos2.png" alt="pos2" class="h-6" />
										<button
											class="flex grow gap-2 rounded-xl border-2 border-zinc-200 border-opacity-25 px-2"
											on:click={() => radiantHandleClick(radiantRoles[1])}
											style={radiantSelected?.account_id === radiantRoles[1].account_id
												? 'border-color: #38bdf8'
												: ''}
										>
											{#if radiantRoles[1]?.user}
												<div>{radiantRoles[1]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex items-center gap-1">
										<img src="/roles/pos3.png" alt="pos3" class="h-6" />
										<button
											class="flex grow gap-2 rounded-xl border-2 border-zinc-200 border-opacity-25 px-2"
											on:click={() => radiantHandleClick(radiantRoles[2])}
											style={radiantSelected?.account_id === radiantRoles[2].account_id
												? 'border-color: #38bdf8'
												: ''}
										>
											{#if radiantRoles[2]?.user}
												<div>{radiantRoles[2]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex items-center gap-1">
										<img src="/roles/pos4.png" alt="pos4" class="h-6" />
										<button
											class="flex grow gap-2 rounded-xl border-2 border-zinc-200 border-opacity-25 px-2"
											on:click={() => radiantHandleClick(radiantRoles[3])}
											style={radiantSelected?.account_id === radiantRoles[3].account_id
												? 'border-color: #38bdf8'
												: ''}
										>
											{#if radiantRoles[3]?.user}
												<div>{radiantRoles[3]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex items-center gap-1">
										<img src="/roles/pos5.png" alt="pos5" class="h-6" />
										<button
											class="flex grow gap-2 rounded-xl border-2 border-zinc-200 border-opacity-25 px-2"
											on:click={() => radiantHandleClick(radiantRoles[4])}
											style={radiantSelected?.account_id === radiantRoles[4].account_id
												? 'border-color: #38bdf8'
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
								<div class="flex w-32 flex-col gap-2">
									<div class="flex items-center gap-1">
										<img src="/roles/pos1.png" alt="pos1" class="h-6" />
										<button
											class="grow rounded-xl border-2 border-zinc-200 border-opacity-25 px-2"
											on:click={() => direHandleClick(direRoles[0])}
											style={direSelected?.account_id === direRoles[0].account_id
												? 'border-color: #38bdf8'
												: ''}
										>
											{#if direRoles[0]?.user}
												<div>{direRoles[0]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex items-center gap-1">
										<img src="/roles/pos2.png" alt="pos2" class="h-6" />
										<button
											class="grow rounded-xl border-2 border-zinc-200 border-opacity-25 px-2"
											on:click={() => direHandleClick(direRoles[1])}
											style={direSelected?.account_id === direRoles[1].account_id
												? 'border-color: #38bdf8'
												: ''}
										>
											{#if direRoles[1]?.user}
												<div>{direRoles[1]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex items-center gap-1">
										<img src="/roles/pos3.png" alt="pos3" class="h-6" />
										<button
											class="grow rounded-xl border-2 border-zinc-200 border-opacity-25 px-2"
											on:click={() => direHandleClick(direRoles[2])}
											style={direSelected?.account_id === direRoles[2].account_id
												? 'border-color: #38bdf8'
												: ''}
										>
											{#if direRoles[2]?.user}
												<div>{direRoles[2]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex items-center gap-1">
										<img src="/roles/pos4.png" alt="pos4" class="h-6" />
										<button
											class="grow rounded-xl border-2 border-zinc-200 border-opacity-25 px-2"
											on:click={() => direHandleClick(direRoles[3])}
											style={direSelected?.account_id === direRoles[3].account_id
												? ' border-color: #38bdf8'
												: ''}
										>
											{#if direRoles[3]?.user}
												<div>{direRoles[3]?.user?.username}</div>
											{:else}
												<div class="text-zinc-400">Anonymous</div>
											{/if}
										</button>
									</div>
									<div class="flex items-center gap-1">
										<img src="/roles/pos5.png" alt="pos5" class="h-6" />
										<button
											class="grow rounded-xl border-2 border-zinc-200 border-opacity-25 px-2"
											on:click={() => direHandleClick(direRoles[4])}
											style={direSelected?.account_id === direRoles[4].account_id
												? 'border-color: #38bdf8'
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
						<button on:click={() => applyRoleChange()} class="rounded-xl bg-sky-500 px-4 py-1"
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
