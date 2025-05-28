<script lang="ts">
	import { getGameMode } from '$lib/functions';
	import UilExchange from 'virtual:icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import UilQuestion from '~icons/uil/question';
	import LucideClock from '~icons/lucide/clock';
	import PlayerData from '$lib/components/match/PlayerData.svelte';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { twMerge } from 'tailwind-merge';
	dayjs.extend(relativeTime);
	interface Props {
		match: any;
	}

	let { match }: Props = $props();
	let { matchData, radiant, dire } = match;

	const radiantHeaderStyling =
		matchData.winner === 'radiant' ? 'bg-green-950/80 ' : 'bg-red-950/50 ';
	const direHeaderStyling = matchData.winner === 'dire' ? 'bg-green-950/80 ' : 'bg-red-950/50 ';

	const radiantStyling =
		matchData.winner === 'radiant'
			? 'bg-gradient-to-r from-green-950/80 hover:bg-green-950/50'
			: 'bg-gradient-to-r from-red-950/80 hover:bg-red-950/50';
	const direStyling =
		matchData.winner === 'dire'
			? 'bg-gradient-to-r from-green-950/80 hover:bg-green-950/50'
			: 'bg-gradient-to-r from-red-950/80 hover:bg-red-950/50';
	// if only radiant players are in game and radiant wins chip says victory, if only dire players are in game and dire wins chip says victory, if only radiant are in game and dire wins chip says defeat, if only dire are in game and radiant wins chip says defeat, if both teams chip says versus. Chip colour should be purple for versus, green for victory, red for defeat

	const chipText = () => {
		if (radiant.length > 0 && dire.length > 0) {
			return 'Versus';
		}

		const isWinner =
			(radiant.length > 0 && matchData.winner === 'radiant') ||
			(dire.length > 0 && matchData.winner === 'dire');

		return isWinner ? 'Victory' : 'Defeat';
	};

	const chipStyling = () => {
		if (radiant.length > 0 && dire.length > 0) {
			return 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/30';
		}

		const isWinner =
			(radiant.length > 0 && matchData.winner === 'radiant') ||
			(dire.length > 0 && matchData.winner === 'dire');

		return isWinner
			? 'bg-green-500/20 text-green-400 border-2 border-green-500/30'
			: 'bg-red-500/20 text-red-400 border-2 border-red-500/30';
	};
</script>

<div>
	<MatchModal matchId={matchData.id} sequenceNum={matchData.sequenceNumber}>
		<div>
			<div id="box" class="flex flex-col rounded-lg">
				<div class="mx-2 my-2 flex items-center justify-center gap-1 text-zinc-300">
					<div class="flex items-center justify-end">
						<div class="flex">
							<div class="flex items-center gap-1">
								<div
									class={twMerge(
										chipStyling(),
										'flex items-center justify-center gap-1 rounded-lg px-2 text-sm'
									)}
								>
									{chipText()}
								</div>
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
							</div>
						</div>
					</div>

					<div class="grow"></div>
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-2">
							<LucideClock />
							<div class="text-base">
								{(matchData.duration / 60) | 0}:{matchData.duration % 60 < 10
									? 0
									: ''}{matchData.duration % 60}
							</div>
						</div>
						<div class="text-sm text-zinc-400">
							{dayjs(matchData.startTime * 1000 + matchData.duration * 1000).from(dayjs())}
						</div>
					</div>
				</div>
				<div class="flex flex-col items-center justify-center border-t-2 border-zinc-800">
					{#if radiant.length > 0 && dire.length > 0}
						<div class={twMerge(radiantHeaderStyling, 'w-full ')}>
							<div class="flex items-center justify-center gap-4 border-b-2 border-zinc-800 py-1">
								{#if matchData.winner === 'radiant'}
									<div class="flex gap-4 text-green-300">
										<div class="w-16 text-right text-green-300">Radiant</div>
										<div class="my-auto h-2 w-2 rounded-full bg-green-300"></div>
										<div class="w-16 text-left text-green-300">Victory</div>
									</div>
								{:else if matchData.winner === 'dire'}
									<div class="w-16 text-right text-red-300">Dire</div>
									<div class="my-auto h-2 w-2 rounded-full bg-red-300"></div>
									<div class="w-16 text-left text-red-300">Defeat</div>
								{/if}
							</div>
						</div>
					{/if}
					{#if radiant.length > 0}
						{#each radiant as player}
							<div class={radiantStyling}>
								<PlayerData match={{ player, matchData }} />
							</div>
						{/each}
					{/if}
					{#if dire.length > 0}
						{#if radiant.length > 0 && dire.length > 0}
							<div class={twMerge(direHeaderStyling, 'w-full ')}>
								<div class="flex items-center justify-center gap-4 border-y-2 border-zinc-800 py-1">
									{#if matchData.winner === 'dire'}
										<div class="flex gap-4 text-green-300">
											<div class="w-16 text-right text-green-300">Dire</div>
											<div class="my-auto h-2 w-2 rounded-full bg-green-300"></div>
											<div class="w-16 text-left text-green-300">Victory</div>
										</div>
									{:else if matchData.winner === 'radiant'}
										<div class="w-16 text-right text-red-300">Radiant</div>
										<div class="my-auto h-2 w-2 rounded-full bg-red-300"></div>
										<div class="w-16 text-left text-red-300">Defeat</div>
									{/if}
								</div>
							</div>
						{/if}
						{#each dire as player}
							<div class={direStyling}>
								<PlayerData match={{ player, matchData }} />
							</div>
						{/each}
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
