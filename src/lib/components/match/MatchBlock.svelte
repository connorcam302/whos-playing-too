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
		item_zinc: number;
		items: DotaAsset[];
		zincItem: DotaAsset;
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
	<div class="w-fit">
		<div
			id="box"
			class="bg-zinc-800 bg-opacity-95 border-[1px] border-zinc-200 border-opacity-15 p-1 rounded-xl w-auto"
		>
			<div class="w-full">
				<div class="flex flex-row items-center gap-4 my-1 mx-2">
					<div class="flex items-center grow justify-start">
						<div class="flex gap-2">
							<div class="flex items-center gap-2">
								{#if matchData.lobby === 7}
									<UilExchange />
								{:else if matchData.lobby === 0}
									<BiDashLg />
								{:else}
									<UilQuestion />
								{/if}
								{getGameMode(matchData.gameMode)}
							</div>
							|
							<div>
								{(matchData.duration / 60) | 0}:{matchData.duration % 60 < 10
									? 0
									: ''}{matchData.duration % 60}
							</div>
						</div>
					</div>
					<div class="flex items-center grow gap-4 justify-end">
						<div>
							{dayjs(matchData.startTime * 1000 + matchData.duration * 1000).from(dayjs())}
						</div>
						<div class="flex gap-1 items-center">
							<button on:click={() => goto(`/match/${matchData.id}`)} class="text-xl">
								<IcBaselineLaunch />
							</button>
							<a href={`https://www.dotabuff.com/matches/${matchData.id}`} target="_blank">
								<img src="/dotabuff.png" alt="dotabuff" class="h-5" />
							</a>
							<a href={`https://www.opendota.com/matches/${matchData.id}`} target="_blank">
								<img src="/opendota.png" alt="opendota" class="h-5" />
							</a>
							<a href={`https://stratz.com/match/${matchData.id}`} target="_blank">
								<img src="/stratz.png" alt="stratz" class="h-5" />
							</a>
						</div>
					</div>
				</div>
			</div>
			{#if radiant.length > 0}
				{#if matchData.winner == 'radiant'}
					<div
						class="border-[2px] border-solid border-green-700 rounded-lg p-1 bg-green-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
					>
						{#each radiant as player}
							<PlayerData {player} />
						{/each}
					</div>
				{:else}
					<div
						class="border-[2px] border-solid border-red-700 rounded-lg p-1 bg-red-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
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
						class="border-[2px] border-solid border-green-700 rounded-lg p-1 bg-green-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
					>
						{#each dire as player}
							<PlayerData {player} />
						{/each}
					</div>
				{:else}
					<div
						class="border-[2px] border-solid border-red-700 rounded-lg p-1 bg-red-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
					>
						{#each dire as player}
							<PlayerData {player} />
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</MatchModal>
