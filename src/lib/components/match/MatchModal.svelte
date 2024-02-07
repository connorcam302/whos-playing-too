<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import { fade } from 'svelte/transition';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import MatchTable from './MatchTable.svelte';
	import { goto } from '$app/navigation';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import MaterialSymbolsTrophyRounded from '~icons/material-symbols/trophy-rounded';
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

	export let matchId: number | undefined;

	const fetchMatchData = async () => {
		const res = await fetch(`/api/matches/${matchId}`);
		if (!res.ok) return { error: res.status };
		return await res.json();
	};

	$: showMatchData = false;
	let matchDetails: {
		matchData: MatchData;
		radiantData: PlayerData[];
		direData: PlayerData[];
		error?: any;
	};
	const openMatchData = async () => {
		showMatchData = true;
		if (!matchDetails) {
			matchDetails = await fetchMatchData();
			console.log(matchDetails);
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
</script>

<button
	on:click={openMatchData}
	class="hover:text-zinc-300 transition-all duration-300 w-full h-full"
>
	<slot />
</button>

{#if showMatchData}
	<div
		transition:fade={{ duration: 200 }}
		id="backdrop"
		class="h-screen fixed top-0 w-screen cursor-default flex justify-center items-center z-10"
		on:click|self={() => (showMatchData = false)}
		on:keypress={(e) => e.key === 'Escape' && (showMatchData = false)}
		tabindex="0"
		role="button"
	>
		<div
			class="absolute opacity-100 bg-zinc-900 border-[1px] border-zinc-200 border-opacity-15 px-4 py-2 rounded-xl z-20"
		>
			<MatchTable {matchDetails} />
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
