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
			class="bg-zinc-800 bg-opacity-95 border-zinc-200 border-opacity-15 p-1 w-auto flex rounded-xl"
		>
			<div class="flex items-center justify-center">
				{#if radiant.length > 0}
					{#if matchData.winner == 'radiant'}
						<div
							class="border-l-2 border-solid border-green-500 rounded-lg p-1 bg-green-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
							id="winner"
						>
							{#each radiant as player}
								<PlayerData {player} />
							{/each}
						</div>
					{:else}
						<div
							class="border-l-2 border-solid border-red-500 rounded-lg p-1 bg-green-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
							id="loser"
						>
							{#each radiant as player}
								<PlayerData {player} />
							{/each}
						</div>
					{/if}
				{/if}
				{#if dire.length > 0}
					{#if matchData.winner == 'dire'}
						<div
							class="border-l-2 border-solid border-green-500 rounded-lg p-1 bg-green-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
							id="winner"
						>
							{#each dire as player}
								<PlayerData {player} />
							{/each}
						</div>
					{:else}
						<div
							class="border-l-2 border-solid border-red-500 rounded-lg p-1 bg-green-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
							id="loser"
						>
							{#each dire as player}
								<PlayerData {player} />
							{/each}
						</div>
					{/if}
				{/if}
			</div>
			<div class="flex">
				<div class="bg-zinc-400 w-full h-full" />
			</div>
			<div class="flex">
				<div
					class="flex flex-col items-center my-1 mx-2 text-zinc-300 text-xs gap-1 justify-center"
				>
					<div class="grow" />
					<div class="flex items-center justify-start">
						<div class="flex">
							<div class="flex items-center">
								{#if matchData.lobby === 7}
									<UilExchange />
								{:else if matchData.lobby === 0}
									<BiDashLg />
								{:else}
									<UilQuestion />
								{/if}
								<div>{getGameMode(matchData.gameMode)}</div>
							</div>
						</div>
					</div>
					<div>
						{dayjs(matchData.startTime * 1000 + matchData.duration * 1000).from(dayjs())}
					</div>
					<div class="grow" />
				</div>
			</div>
		</div>
	</div>
</MatchModal>

<style>
	#winner {
		background-color: hsla(240, 3%, 15%, 0);
		background-image: radial-gradient(at 100% 100%, hsla(142, 70%, 43%, 0) 0px, transparent 50%),
			radial-gradient(at 17% 50%, hsla(142, 70%, 43%, 0.09) 0px, transparent 50%);
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
	}

	#loser {
		background-color: hsla(240, 3%, 15%, 0);
		background-image: radial-gradient(at 0% 50%, hsla(0, 100%, 37%, 0) 0px, transparent 50%),
			radial-gradient(at 17% 50%, hsla(0, 81%, 37%, 0.25) 0px, transparent 50%);
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
	}
</style>
