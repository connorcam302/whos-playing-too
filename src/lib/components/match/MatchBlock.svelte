<script lang="ts">
	import { getGameMode } from '$lib/functions';
	import UilExchange from 'virtual:icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import UilQuestion from '~icons/uil/question';
	import PlayerData from '$lib/components/match/PlayerData.svelte';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
	interface Props {
		match: any;
	}

	let { match }: Props = $props();
	const { matchData, radiant, dire } = match;
</script>

<div>
	<MatchModal matchId={matchData.id} sequenceNum={matchData.sequenceNumber}>
		<div>
			<div
				id="box"
				class="flex flex-col rounded-lg border-zinc-200 border-opacity-15 bg-zinc-800 bg-opacity-95 pt-1"
			>
				<div class="mx-2 my-0.5 flex items-center justify-center gap-1 text-zinc-300">
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

					<div class="grow"></div>
					<div>
						{dayjs(matchData.startTime * 1000 + matchData.duration * 1000).from(dayjs())}
					</div>
				</div>
				<div class="flex flex-col items-center justify-center gap-1">
					{#if radiant.length > 0}
						{#if matchData.winner == 'radiant'}
							<div class="rounded-lg bg-emerald-500 bg-opacity-15 py-1 transition-all" id="winner">
								{#each radiant as player}
									<div class="pl-1 hover:bg-black hover:bg-opacity-10 lg:pl-2">
										<PlayerData {player} {matchData} />
									</div>
								{/each}
							</div>
						{:else}
							<div class="rounded-lg bg-red-500 bg-opacity-15 py-1 transition-all" id="loser">
								{#each radiant as player}
									<div class="pl-1 hover:bg-black hover:bg-opacity-10 lg:pl-2">
										<PlayerData {player} {matchData} />
									</div>
								{/each}
							</div>
						{/if}
					{/if}
					{#if radiant.length > 0 && dire.length > 0}
						<div class="flex items-center justify-center rounded-full">
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm text-zinc-900"
							>
								vs
							</div>
						</div>
					{/if}
					{#if dire.length > 0}
						{#if matchData.winner == 'dire'}
							<div class="rounded-lg bg-emerald-500 bg-opacity-15 py-1 transition-all" id="winner">
								{#each dire as player}
									<div class="pl-1 hover:bg-black hover:bg-opacity-10 lg:pl-2">
										<PlayerData {player} {matchData} />
									</div>
								{/each}
							</div>
						{:else}
							<div class="rounded-lg bg-red-500 bg-opacity-15 py-1 transition-all" id="loser">
								{#each dire as player}
									<div class="pl-1 hover:bg-black hover:bg-opacity-10 lg:pl-2">
										<PlayerData {player} {matchData} />
									</div>
								{/each}
							</div>
						{/if}
					{/if}
				</div>
				<div class="flex">
					<div class="h-full w-full bg-zinc-400"></div>
				</div>
				<div class="flex"></div>
			</div>
		</div>
	</MatchModal>
</div>

<style>
</style>
