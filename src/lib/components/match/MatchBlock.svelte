<script lang="ts">
	import { getGameMode } from '$lib/functions';
	import UilExchange from 'virtual:icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import UilQuestion from '~icons/uil/question';
	import PlayerData from '$lib/components/match/PlayerData.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import { fade, fly } from 'svelte/transition';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { goto } from '$app/navigation';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import MaterialSymbolsTrophyRounded from '~icons/material-symbols/trophy-rounded';

	import IcBaselineLaunch from '~icons/ic/baseline-launch';
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

	export let match: any;
	const { matchData, radiant, dire } = match;
</script>

<MatchModal matchId={matchData.id}>
	<div class="w-full">
		<div
			id="box"
			class="bg-zinc-800 bg-opacity-95 border-zinc-200 border-opacity-15 pt-1 w-auto rounded-lg flex flex-col"
		>
			<div class="flex items-center my-0.5 mx-2 text-zinc-300 gap-1 justify-center">
				<div class="flex items-center justify-end">
					<div class="flex">
						<div class="flex items-center gap-1">
							<div class="text-lg">
								{#if matchData.lobby === 7}
									<UilExchange />
								{:else if matchData.lobby === 0}
									<BiDashLg />
								{:else}
									<UilQuestion />
								{/if}
							</div>
							<div class="text-base">{getGameMode(matchData.gameMode)}</div>
							<div>|</div>
							<div class="text-base">
								{(matchData.duration / 60) | 0}:{matchData.duration % 60 < 10
									? 0
									: ''}{matchData.duration % 60}
							</div>
						</div>
					</div>
				</div>

				<div class="grow" />
				<div>
					{dayjs(matchData.startTime * 1000 + matchData.duration * 1000).from(dayjs())}
				</div>
			</div>
			<div class="flex items-center justify-center w-full grow">
				{#if radiant.length > 0}
					{#if matchData.winner == 'radiant'}
						<div
							class="bg-emerald-500 bg-opacity-15 rounded-lg transition-all w-full py-1"
							id="winner"
						>
							{#each radiant as player}
								<div class="pl-2 hover:bg-black hover:bg-opacity-10">
									<PlayerData {player} />
								</div>
							{/each}
						</div>
					{:else}
						<div class="bg-red-500 bg-opacity-15 rounded-lg transition-all w-full py-1" id="loser">
							{#each radiant as player}
								<div class="pl-2 hover:bg-black hover:bg-opacity-10">
									<PlayerData {player} />
								</div>
							{/each}
						</div>
					{/if}
				{/if}
				{#if dire.length > 0}
					{#if matchData.winner == 'dire'}
						<div
							class="bg-emerald-500 bg-opacity-15 rounded-lg transition-all w-full py-1"
							id="winner"
						>
							{#each dire as player}
								<div class="pl-2 hover:bg-black hover:bg-opacity-10">
									<PlayerData {player} />
								</div>
							{/each}
						</div>
					{:else}
						<div class="bg-red-500 bg-opacity-15 rounded-lg transition-all w-full py-1" id="loser">
							{#each dire as player}
								<div class="pl-2 hover:bg-black hover:bg-opacity-10">
									<PlayerData {player} />
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
			<div class="flex">
				<div class="bg-zinc-400 w-full h-full" />
			</div>
			<div class="flex"></div>
		</div>
	</div>
</MatchModal>

<style>
</style>
