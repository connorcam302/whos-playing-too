<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { formatHeroScore } from '$lib/heroScores';

	type HeroScoreChange = {
		matchNumber: number | null;
		scoreBefore: number | null;
		scoreAfter: number | null;
		scoreChange: number | null;
		becameCalibrated: boolean;
	};

	interface Props {
		score: HeroScoreChange;
		heroName: string;
	}

	let { score, heroName }: Props = $props();

	const getText = () => {
		if (score.matchNumber === null) return '—';
		if (score.matchNumber < 10) return `${score.matchNumber}/10`;
		if (score.becameCalibrated) {
			return score.scoreAfter !== null ? formatHeroScore(score.scoreAfter) : '—';
		}
		if (score.scoreChange === null || score.scoreChange === 0) return '±0';
		return score.scoreChange > 0
			? `+${formatHeroScore(score.scoreChange)}`
			: `−${formatHeroScore(Math.abs(score.scoreChange))}`;
	};

	const getTextClass = () => {
		if (score.scoreChange === null || score.scoreChange === 0) return 'text-zinc-400';
		return score.scoreChange > 0 ? 'text-green-400' : 'text-red-400';
	};

	const getAriaLabel = () => {
		if (score.matchNumber === null) {
			return 'Hero score excluded because this match was 15 minutes or less';
		}
		if (score.matchNumber < 10) {
			return `Hero score uncalibrated, ${score.matchNumber} of 10 games played on ${heroName}`;
		}
		if (score.becameCalibrated && score.scoreAfter !== null) {
			return `Hero score calibrated at ${formatHeroScore(score.scoreAfter)} after this match`;
		}
		if (score.scoreChange === null || score.scoreAfter === null) return 'Hero score unavailable';
		if (score.scoreChange === 0) {
			return `Hero score unchanged at ${formatHeroScore(score.scoreAfter)}`;
		}
		return `Hero score ${score.scoreChange > 0 ? 'gained' : 'lost'} ${formatHeroScore(Math.abs(score.scoreChange))} from this match`;
	};
</script>

<Tooltip.Root>
	<Tooltip.Trigger
		class={`absolute bottom-0 left-0 z-10 min-w-6 rounded-tr-sm bg-zinc-950/90 px-1 py-0.5 text-center text-[9px] leading-none font-semibold tabular-nums shadow-sm shadow-black/40 md:min-w-7 md:text-[10px] ${getTextClass()}`}
		aria-label={getAriaLabel()}
	>
		{getText()}
	</Tooltip.Trigger>
	<Tooltip.Content class="max-w-64 text-xs">
		{#if score.matchNumber === null}
			Hero scores exclude matches of 15 minutes or less.
		{:else if score.matchNumber < 10}
			Hero score uncalibrated. {score.matchNumber} of 10 games played on {heroName}.
		{:else if score.becameCalibrated && score.scoreAfter !== null}
			Hero score calibrated at {formatHeroScore(score.scoreAfter)} after this match.
		{:else if score.scoreBefore !== null && score.scoreAfter !== null}
			<div class="font-medium tabular-nums text-zinc-100">
				Hero score {formatHeroScore(score.scoreBefore)} → {formatHeroScore(score.scoreAfter)}
			</div>
			<div class="mt-0.5 text-zinc-300">
				{#if score.scoreChange === 0}
					No score change from this match.
				{:else}
					{score.scoreChange !== null && score.scoreChange > 0 ? 'Gained' : 'Lost'}
					{formatHeroScore(Math.abs(score.scoreChange ?? 0))} from this match.
				{/if}
			</div>
		{/if}
	</Tooltip.Content>
</Tooltip.Root>
