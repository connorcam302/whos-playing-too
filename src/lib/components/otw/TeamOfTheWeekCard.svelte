<script lang="ts">
	import { getColour, getHeroLocalisedName } from '$lib/functions';
	import type { InferSelectModel } from 'drizzle-orm';
	import MatchModal from '../match/MatchModal.svelte';
	import RatingChip from '../RatingChip.svelte';
	import FeaturePlayer from './FeaturePlayer.svelte';
	import type { matchData, matches } from '$lib/server/schema';
	import { FlameIcon } from 'lucide-svelte';
	interface Match {
		id: number;
		player: {
			name: string;
			id: number;
		};
		sequence: number;
		hero: string;
		impact: number;
		gameData: {
			matchData: InferSelectModel<typeof matches>;
			playerData: InferSelectModel<typeof matchData>;
		};
		role: number;
	}
	let { match }: { match: Match } = $props();
	let backgroundColour = $state(getColour(match.role));
	let isHovered = $state(false);
</script>

<div
	class="rounded-xl border transition-colors duration-300"
	style="background-color: {isHovered ? backgroundColour + '20' : 'transparent'}"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
	role="button"
	tabindex="0"
>
	<MatchModal matchId={match.id} sequenceNum={match.sequence}>
		<div class="flex w-full flex-col items-center">
			<FeaturePlayer data={{ hero: match.hero, role: match.role }} />
		</div>
		<div class="flex flex-col gap-2 p-2 text-lg md:gap-4">
			<div class="flex flex-row items-center gap-2">
				<img src="/roles/pos{match.role}.svg" alt="" class="h-6 w-6 md:h-8 md:w-8" />
				<div class="w-fit min-w-0 flex-col gap-0 text-left">
					<a
						href={`/player/${match.player.id}`}
						class="text-lg leading-none duration-300 hover:text-zinc-400"
					>
						<div>{match.player.name}</div>
					</a>
					<div
						class="w-20 overflow-hidden text-xs text-ellipsis whitespace-nowrap text-zinc-400 md:w-32"
					>
						{getHeroLocalisedName(match.hero)}
					</div>
				</div>
			</div>
			<div class="flex flex-col items-center justify-between gap-2 px-2 md:flex-row">
				<div class="flex flex-row gap-1">
					<div class="text-green-300">{match.gameData.playerData.kills}</div>
					<div>/</div>
					<div class="text-red-400">{match.gameData.playerData.deaths}</div>
					<div>/</div>
					<div class="text-cyan-300">{match.gameData.playerData.assists}</div>
				</div>
				<div class="hidden md:block">
					<RatingChip
						data={{ player: match.gameData.playerData, matchData: match.gameData.matchData }}
					/>
				</div>
			</div>
			<div
				class="flex flex-row items-center justify-center gap-2 rounded-lg px-2 py-1"
				style="background-color: {backgroundColour}50"
			>
				<FlameIcon />
				{match.gameData.playerData.impact}
			</div>
		</div>
	</MatchModal>
</div>
