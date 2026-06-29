<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import MatchTable from './MatchTable.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

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

	interface Props {
		matchId: number | undefined;
		sequenceNum: number | undefined;
		children?: import('svelte').Snippet;
	}

	let { matchId, sequenceNum, children }: Props = $props();

	const fetchMatchData = async () => {
		let res = await fetch(`/api/matches/${matchId}`);
		if (!res.ok) {
			res = await fetch(`/api/matches/sequence/${sequenceNum}`);
			if (!res.ok) {
				const error = await res.json();
				return { error: res.status, message: error.message };
			}
		}
		return await res.json();
	};

	let open = $state(false);

	type MatchDetails =
		| {
				matchData: MatchData;
				radiantData: PlayerData[];
				direData: PlayerData[];
				error?: undefined;
				message?: undefined;
		  }
		| {
				error: number;
				message: string;
				matchData?: undefined;
				radiantData?: undefined;
				direData?: undefined;
		  };

	let matchDetails: MatchDetails | undefined = $state();

	const handleOpenChange = async (isOpen: boolean) => {
		if (isOpen && !matchDetails) {
			matchDetails = await fetchMatchData();
		}
	};
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<div
				{...props}
				class="h-full w-full cursor-pointer transition-colors duration-150"
			>
				{@render children?.()}
			</div>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content
		class="w-[min(96vw,1180px)] max-w-none gap-0 overflow-hidden rounded-md border-border bg-card p-0 shadow-2xl shadow-black/60"
	>
		<Dialog.Header class="border-b border-border px-4 py-3">
			<Dialog.Title class="text-sm font-medium text-zinc-100">Match Details</Dialog.Title>
			<Dialog.Description class="text-xs text-zinc-500">
				{#if matchId}
					Match {matchId}
				{:else if sequenceNum}
					Sequence {sequenceNum}
				{:else}
					Loading match
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<div class="max-h-[calc(88vh-4rem)] overflow-auto p-3">
			{#if matchDetails}
				{#if matchDetails.error}
					<div class="rounded-md border border-red-900/60 bg-red-950/30 px-4 py-6 text-center">
						<h1 class="text-lg font-semibold text-red-100">Error {matchDetails.error}</h1>
						<p class="mt-1 text-sm text-red-200/80">{matchDetails.message}</p>
					</div>
				{:else if matchDetails.matchData}
					<MatchTable {matchDetails} />
				{/if}
			{:else}
				<div class="flex min-h-40 items-center justify-center">
					<Loading />
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
