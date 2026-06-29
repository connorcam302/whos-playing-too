<script lang="ts">
	import { run } from 'svelte/legacy';

	import Loading from '$lib/components/Loading.svelte';
	import { fade } from 'svelte/transition';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { goto } from '$app/navigation';
	import { Settings, ExternalLink, Trophy } from 'lucide-svelte';
	import { calcImpact, getRoleIcon, getRoleName } from '$lib/functions';
	import RatingChip from '$lib/components/RatingChip.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tooltip from '$lib/components/ui/tooltip';

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

	type RoleSlot = PlayerData | {
		account_id: number;
		hero_id: number;
		role: number;
		user: null;
	};

	interface Props {
		matchDetails: {
			matchData: MatchData;
			radiantData: PlayerData[];
			direData: PlayerData[];
			error?: any;
		};
		pickOrder?: boolean;
		modal?: boolean;
	}

	let { matchDetails, pickOrder = true, modal = true }: Props = $props();

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

	const arraySwap = (arr: any[], index1: number, index2: number) => {
		const temp = arr[index1];
		arr[index1] = arr[index2];
		arr[index2] = temp;
	};

	let radiantRoles = $state<RoleSlot[]>([
		{ account_id: -1, hero_id: 0, role: 0, user: null },
		{ account_id: -2, hero_id: 0, role: 0, user: null },
		{ account_id: -3, hero_id: 0, role: 0, user: null },
		{ account_id: -4, hero_id: 0, role: 0, user: null },
		{ account_id: -5, hero_id: 0, role: 0, user: null }
	]);
	let direRoles = $state<RoleSlot[]>([
		{ account_id: -6, hero_id: 0, role: 0, user: null },
		{ account_id: -7, hero_id: 0, role: 0, user: null },
		{ account_id: -8, hero_id: 0, role: 0, user: null },
		{ account_id: -9, hero_id: 0, role: 0, user: null },
		{ account_id: -10, hero_id: 0, role: 0, user: null }
	]);

	run(() => {
		if (matchDetails) {
			const radiantUserData = matchDetails.radiantData.filter((player: any) => player.user);
			const direUserData = matchDetails.direData.filter((player: any) => player.user);

			radiantUserData.forEach((player: any) => {
				radiantRoles[player.role - 1] = player;
			});

			direUserData.forEach((player: any) => {
				direRoles[player.role - 1] = player;
			});
		}
	});

	let radiantSelected: any = $state(null);
	let direSelected: any = $state(null);

	const radiantHandleClick = (player: any) => {
		if (radiantSelected === null) {
			radiantSelected = player;
		} else if (radiantSelected === player) {
			radiantSelected = null;
		} else {
			arraySwap(radiantRoles, radiantRoles.indexOf(player), radiantRoles.indexOf(radiantSelected));
			radiantSelected = null;
		}
	};

	const direHandleClick = (player: any) => {
		if (direSelected === null) {
			direSelected = player;
		} else if (direSelected === player) {
			direSelected = null;
		} else {
			arraySwap(direRoles, direRoles.indexOf(player), direRoles.indexOf(direSelected));
			direSelected = null;
		}
	};

	let buttonState = $state('Apply');
	let fixRoleScreenShow = $state(false);

	const applyRoleChange = async () => {
		const radiantData = radiantRoles.map((player: any, index: number) => {
			if (player?.user) {
				return { heroId: player?.hero_id, role: index + 1 };
			}
		});
		const direData = direRoles.map((player: any, index: number) => {
			if (player?.user) {
				return { heroId: player?.hero_id, role: index + 1 };
			}
		});

		buttonState = '...';

		const radiantResponse = await fetch(
			`/api/matches/${matchDetails.matchData.match_id}/set-roles`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					roleData: { ...radiantData },
					sequenceNum: matchDetails.matchData.match_seq_num
				})
			}
		);

		const direResponse = await fetch(`/api/matches/${matchDetails.matchData.match_id}/set-roles`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				roleData: { ...direData },
				sequenceNum: matchDetails.matchData.match_seq_num
			})
		});

		await Promise.all([radiantResponse, direResponse]).then(() => location.reload());
	};
</script>

{#if !matchDetails}
	<div class="flex w-full items-center justify-center"><Loading /></div>
{:else if matchDetails.error === 'Steam API Down.'}
	<div class="rounded-md border border-red-900/60 bg-red-950/30 px-4 py-4 text-center text-sm text-red-200/80">
		Steam API Down.
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<!-- Scoreboard Header -->
		<div class="flex items-center justify-between gap-4 px-2">
			<div class="flex items-center gap-2">
				<button
					class="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
					onclick={() => (fixRoleScreenShow = true)}
					aria-label="Fix roles"
				>
					<Settings class="h-4 w-4" />
				</button>
			</div>

			<div class="flex items-center gap-4">
				<div
					class="text-2xl font-semibold tabular-nums text-green-500"
					style={matchDetails.matchData.radiant_win ? 'text-shadow: 0 0 12px rgba(34, 197, 94, 0.6), 0 0 4px rgba(34, 197, 94, 0.3)' : ''}
				>
					{matchDetails.matchData.radiant_score}
				</div>
				<div class="flex flex-col items-center">
					<div class="text-xl font-semibold tabular-nums text-zinc-100">
						{toTime(matchDetails.matchData.duration)}
					</div>
					<div class="text-[11px] text-zinc-500">
						{dayjs(
							matchDetails.matchData.start_time * 1000 + matchDetails.matchData.duration * 1000
						).from(dayjs())}
					</div>
				</div>
				<div
					class="text-2xl font-semibold tabular-nums text-red-500"
					style={!matchDetails.matchData.radiant_win ? 'text-shadow: 0 0 12px rgba(239, 68, 68, 0.6), 0 0 4px rgba(239, 68, 68, 0.3)' : ''}
				>
					{matchDetails.matchData.dire_score}
				</div>
			</div>

			<div class="flex items-center gap-1.5">
				{#if modal}
					<button
						onclick={() => goto(`/match/${matchDetails.matchData.match_id}`)}
						class="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
						aria-label="Open full match page"
					>
						<ExternalLink class="h-4 w-4" />
					</button>
				{/if}
				<a
					href={`https://www.dotabuff.com/matches/${matchDetails.matchData.match_id}`}
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-md p-1 transition-opacity hover:opacity-80"
				>
					<img src="/dotabuff.png" alt="Dotabuff" class="h-5" />
				</a>
				<a
					href={`https://www.opendota.com/matches/${matchDetails.matchData.match_id}`}
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-md p-1 transition-opacity hover:opacity-80"
				>
					<img src="/opendota.png" alt="OpenDota" class="h-5" />
				</a>
				<a
					href={`https://www.stratz.com/match/${matchDetails.matchData.match_id}`}
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-md p-1 transition-opacity hover:opacity-80"
				>
					<img src="/stratz.png" alt="Stratz" class="h-5" />
				</a>
			</div>
		</div>

		<!-- Team Tables -->
		<div class="flex flex-col gap-6">
			<!-- Radiant -->
			<div>
				<div class="mb-1.5 flex items-center gap-1.5 px-1">
					<span class="text-sm font-semibold text-zinc-200">Radiant</span>
					{#if matchDetails.matchData.radiant_win}
						<Trophy class="h-3.5 w-3.5 text-amber-400" />
					{/if}
				</div>
				<div class="overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-zinc-800 bg-zinc-950/70">
								<th class="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-400">Player</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">Pos</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">Lvl</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">K</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">D</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">A</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">Imp</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">CS</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">Net</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">GPM</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">XPM</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">HD</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">TD</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">HH</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-400">Items</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">Aghs</th>
							</tr>
						</thead>
						<tbody>
							{#each matchDetails.radiantData as player}
								<tr class="border-b border-zinc-900 transition-colors hover:bg-zinc-900/70">
									<td class="px-2 py-1.5">
										<div class="flex items-center gap-2">
											<a
												href={`/heroes/${player.hero.id}`}
												class="shrink-0 rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
												onclick={(event) => event.stopPropagation()}
											>
												<img src={player.hero.img} class="h-7 w-10 rounded-sm object-cover" alt={player.hero.name} />
											</a>
											{#if player.user}
												<button
													onclick={() => goto(`/player/${player.user?.id}`)}
													class="truncate text-sm text-zinc-100 transition-colors hover:text-zinc-400"
												>
													{player.user.username}
												</button>
												{#if player.user.smurf}
													<span class="shrink-0 rounded bg-indigo-500/20 px-1 text-[10px] font-medium text-indigo-400">S</span>
												{/if}
											{:else}
												<span class="text-sm text-zinc-500">Anonymous</span>
											{/if}
										</div>
									</td>
									<td class="px-1.5 py-1.5 text-center">
										<div class="flex items-center justify-center">
											<img src={getRoleIcon(player.role)} alt={getRoleName(player.role)} class="h-5 w-5" />
										</div>
									</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{player.level}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-green-400">{player.kills}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-red-400">{player.deaths}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-cyan-300">{player.assists}</td>
									<td class="px-1.5 py-1.5 text-center">
										<RatingChip data={{ player: { ...player, impact: player.impactScore, hero: player.hero, lastHits: player.last_hits }, matchData: matchDetails.matchData }} />
									</td>
									<td class="whitespace-nowrap px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{player.last_hits}/{player.denies}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-amber-300">{convertToKNumber(player.net_worth)}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{convertToKNumber(player.gold_per_min)}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{convertToKNumber(player.xp_per_min) || 'N/A'}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{convertToKNumber(player.hero_damage) || 'N/A'}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{convertToKNumber(player.tower_damage) || 'N/A'}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{convertToKNumber(player.hero_healing) || 'N/A'}</td>
									<td class="px-1.5 py-1.5">
										<div class="flex items-center gap-px">
											{#each player.items as item}
												<Tooltip.Root>
													<Tooltip.Trigger>
														<img src={item.img} class="h-6 max-w-none" alt={item.name} />
													</Tooltip.Trigger>
													<Tooltip.Content class="text-xs">{item.name}</Tooltip.Content>
												</Tooltip.Root>
											{/each}
											{#if player.neutralItem}
												<Tooltip.Root>
													<Tooltip.Trigger>
														<img
															src={player.neutralItem.img}
															alt={player.neutralItem.name}
															class="ml-1 h-6 w-6 max-w-none rounded-full object-cover"
														/>
													</Tooltip.Trigger>
													<Tooltip.Content class="text-xs">{player.neutralItem.name}</Tooltip.Content>
												</Tooltip.Root>
											{/if}
										</div>
									</td>
									<td class="px-1.5 py-1.5">
										<div class="flex flex-col items-center gap-0.5">
											<img class="h-5 w-5 object-contain" src={`/scepter_${player.aghanims_scepter}.png`} alt="Scepter" />
											<img class="h-5 w-5 object-contain" src={`/shard_${player.aghanims_shard}.png`} alt="Shard" />
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Dire -->
			<div>
				<div class="mb-1.5 flex items-center gap-1.5 px-1">
					<span class="text-sm font-semibold text-zinc-200">Dire</span>
					{#if !matchDetails.matchData.radiant_win}
						<Trophy class="h-3.5 w-3.5 text-amber-400" />
					{/if}
				</div>
				<div class="overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-zinc-800 bg-zinc-950/70">
								<th class="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-400">Player</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">Pos</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">Lvl</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">K</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">D</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">A</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">Imp</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">CS</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">Net</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">GPM</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">XPM</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">HD</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">TD</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">HH</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-400">Items</th>
								<th class="whitespace-nowrap px-1.5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">Aghs</th>
							</tr>
						</thead>
						<tbody>
							{#each matchDetails.direData as player}
								<tr class="border-b border-zinc-900 transition-colors hover:bg-zinc-900/70">
									<td class="px-2 py-1.5">
										<div class="flex items-center gap-2">
											<a
												href={`/heroes/${player.hero.id}`}
												class="shrink-0 rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
												onclick={(event) => event.stopPropagation()}
											>
												<img src={player.hero.img} class="h-7 w-10 rounded-sm object-cover" alt={player.hero.name} />
											</a>
											{#if player.user}
												<button
													onclick={() => goto(`/player/${player.user?.id}`)}
													class="truncate text-sm text-zinc-100 transition-colors hover:text-zinc-400"
												>
													{player.user.username}
												</button>
												{#if player.user.smurf}
													<span class="shrink-0 rounded bg-indigo-500/20 px-1 text-[10px] font-medium text-indigo-400">S</span>
												{/if}
											{:else}
												<span class="text-sm text-zinc-500">Anonymous</span>
											{/if}
										</div>
									</td>
									<td class="px-1.5 py-1.5 text-center">
										<div class="flex items-center justify-center">
											<img src={getRoleIcon(player.role)} alt={getRoleName(player.role)} class="h-5 w-5" />
										</div>
									</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{player.level}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-green-400">{player.kills}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-red-400">{player.deaths}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-cyan-300">{player.assists}</td>
									<td class="px-1.5 py-1.5 text-center">
										<RatingChip data={{ player: { ...player, impact: player.impactScore, hero: player.hero, lastHits: player.last_hits }, matchData: matchDetails.matchData }} />
									</td>
									<td class="whitespace-nowrap px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{player.last_hits}/{player.denies}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-amber-300">{convertToKNumber(player.net_worth)}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{convertToKNumber(player.gold_per_min)}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{convertToKNumber(player.xp_per_min) || 'N/A'}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{convertToKNumber(player.hero_damage) || 'N/A'}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{convertToKNumber(player.tower_damage) || 'N/A'}</td>
									<td class="px-1.5 py-1.5 text-center tabular-nums text-zinc-300">{convertToKNumber(player.hero_healing) || 'N/A'}</td>
									<td class="px-1.5 py-1.5">
										<div class="flex items-center gap-px">
											{#each player.items as item}
												<Tooltip.Root>
													<Tooltip.Trigger>
														<img src={item?.img || 'https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp'} class="h-6 max-w-none" alt={item?.name || 'Empty'} />
													</Tooltip.Trigger>
													<Tooltip.Content class="text-xs">{item?.name || 'Empty'}</Tooltip.Content>
												</Tooltip.Root>
											{/each}
											{#if player.neutralItem}
												<Tooltip.Root>
													<Tooltip.Trigger>
														<img
															src={player.neutralItem.img}
															alt={player.neutralItem.name}
															class="ml-1 h-6 w-6 max-w-none rounded-full object-cover"
														/>
													</Tooltip.Trigger>
													<Tooltip.Content class="text-xs">{player.neutralItem.name}</Tooltip.Content>
												</Tooltip.Root>
											{/if}
										</div>
									</td>
									<td class="px-1.5 py-1.5">
										<div class="flex flex-col items-center gap-0.5">
											<img class="h-5 w-5 object-contain" src={`/scepter_${player.aghanims_scepter}.png`} alt="Scepter" />
											<img class="h-5 w-5 object-contain" src={`/shard_${player.aghanims_shard}.png`} alt="Shard" />
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Picks & Bans -->
			{#if pickOrder && matchDetails.matchData.picks?.length > 0}
				<div class="flex items-start gap-4 px-1">
					<div class="flex min-w-0 flex-1 gap-1 overflow-x-auto">
						{#each matchDetails.matchData.picks as pick, i}
							{@const inMatch = matchDetails.direData.some((p) => p.hero.id === pick.id) || matchDetails.radiantData.some((p) => p.hero.id === pick.id)}
							<div class="flex shrink-0 flex-col text-center">
								<a
									href={`/heroes/${pick.id}`}
									class="rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
									onclick={(event) => event.stopPropagation()}
								>
									<img src={pick.img} alt={pick.name} class="h-6 w-8 rounded-sm object-cover" />
								</a>
								<div class="mt-px rounded-b px-1 py-px text-[10px] {inMatch ? 'bg-zinc-800/60 text-zinc-100' : 'bg-red-950/40 text-red-200'}">
									{i + 1}
								</div>
							</div>
						{/each}
					</div>
					{#if matchDetails.matchData.bans?.length > 0}
						<div class="flex min-w-0 flex-1 justify-end gap-1 overflow-x-auto">
							{#each matchDetails.matchData.bans as ban, i}
								<div class="flex shrink-0 flex-col text-center">
									<a
										href={`/heroes/${ban.id}`}
										class="rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
										onclick={(event) => event.stopPropagation()}
									>
										<img src={ban.img} alt={ban.name} class="h-6 w-8 rounded-sm object-cover opacity-50" />
									</a>
										<div class="mt-px rounded-b bg-red-950/40 px-1 py-px text-[10px] text-red-200">
										{i + 1}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Role Fix Dialog -->
<Dialog.Root bind:open={fixRoleScreenShow}>
	<Dialog.Content class="max-w-sm gap-0 rounded-md border-border bg-card p-0 shadow-2xl shadow-black/60">
		<Dialog.Header class="border-b border-border px-4 py-3">
			<Dialog.Title class="text-sm font-medium text-zinc-100">Fix Roles</Dialog.Title>
			<Dialog.Description class="text-xs text-zinc-500">
				Select two players on the same team to swap their roles.
			</Dialog.Description>
		</Dialog.Header>
		<div class="p-4">
			<div class="flex gap-6">
				{#if !radiantRoles.every((player) => player === null)}
					<div class="flex-1">
						<div class="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">Radiant</div>
						<div class="flex flex-col gap-1.5">
							{#each radiantRoles as player, i}
								<button
									class="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors
										{radiantSelected?.account_id === player?.account_id
											? 'border-sky-500 bg-sky-500/10 text-zinc-100'
											: 'border-zinc-800 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-800/40'}"
									onclick={() => radiantHandleClick(player)}
								>
									<img src={getRoleIcon(i + 1)} alt="pos{i + 1}" class="h-5 w-5 shrink-0" />
									{#if player?.user}
										<span class="truncate">{player.user.username}</span>
									{:else}
											<span class="text-zinc-300">Anonymous</span>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/if}
				{#if !direRoles.every((player) => player === null)}
					<div class="flex-1">
						<div class="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">Dire</div>
						<div class="flex flex-col gap-1.5">
							{#each direRoles as player, i}
								<button
									class="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors
										{direSelected?.account_id === player?.account_id
											? 'border-sky-500 bg-sky-500/10 text-zinc-100'
											: 'border-zinc-800 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-800/40'}"
									onclick={() => direHandleClick(player)}
								>
									<img src={getRoleIcon(i + 1)} alt="pos{i + 1}" class="h-5 w-5 shrink-0" />
									{#if player?.user}
										<span class="truncate">{player.user.username}</span>
									{:else}
											<span class="text-zinc-300">Anonymous</span>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<div class="mt-4 flex justify-end">
				<button
					onclick={() => applyRoleChange()}
					class="rounded-md bg-sky-500 px-4 py-1.5 text-sm font-medium text-sky-950 transition-colors hover:bg-sky-400"
				>
					{buttonState}
				</button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
