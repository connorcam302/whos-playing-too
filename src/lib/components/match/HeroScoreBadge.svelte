<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { formatHeroScore } from '$lib/heroScores';

	type ComponentKey = 'winRate' | 'recentForm' | 'impact' | 'kda' | 'volume';
	type ComponentChanges = Record<ComponentKey, number>;

	type HeroScoreChange = {
		matchNumber: number | null;
		scoreAtPreviousMatch?: number | null;
		scoreBefore: number | null;
		scoreAfter: number | null;
		scoreChange: number | null;
		inactivityChange?: number | null;
		becameCalibrated: boolean;
		componentChanges?: ComponentChanges | null;
	};

	interface Props {
		score: HeroScoreChange;
		heroName: string;
		roleName?: string;
	}

	let { score, heroName, roleName = 'this role' }: Props = $props();
	const isStable = () => score.scoreChange !== null && Math.abs(score.scoreChange) <= 1;
	const components: Array<{ key: ComponentKey; label: string }> = [
		{ key: 'winRate', label: 'Win rate' },
		{ key: 'recentForm', label: 'Recent form' },
		{ key: 'impact', label: 'Impact' },
		{ key: 'kda', label: 'KDA' },
		{ key: 'volume', label: 'Match volume' }
	];
	const formatChange = (change: number) =>
		`${change > 0 ? '+' : change < 0 ? '−' : '±'}${Math.abs(change).toFixed(1)}`;
	const getText = () => {
		if (score.matchNumber === null) return '—';
		if (score.matchNumber < 10) return `${score.matchNumber}/10`;
		if (score.becameCalibrated) {
			return score.scoreAfter !== null ? formatHeroScore(score.scoreAfter) : '—';
		}
		if (score.scoreChange === null || isStable()) return 'Stable';
		return score.scoreChange > 0
			? `+${formatHeroScore(score.scoreChange)}`
			: `−${formatHeroScore(Math.abs(score.scoreChange))}`;
	};

	const getTextClass = () => {
		if (score.scoreChange === null || isStable()) return 'text-zinc-300';
		return score.scoreChange > 0 ? 'text-green-400' : 'text-red-400';
	};

	const getAriaLabel = () => {
		if (score.matchNumber === null) {
			return 'Hero score excluded because this match was 15 minutes or less';
		}
		if (score.matchNumber < 10) {
			return `${roleName} ${heroName} score uncalibrated, ${score.matchNumber} of 10 games played`;
		}
		if (score.becameCalibrated && score.scoreAfter !== null) {
			return `Hero score calibrated at ${formatHeroScore(score.scoreAfter)} after this match`;
		}
		if (score.scoreChange === null || score.scoreAfter === null) return 'Hero score unavailable';
		if (isStable()) {
			return `Hero rating stable at ${formatHeroScore(score.scoreAfter)} after this match`;
		}
		return `Hero rating moved ${score.scoreChange > 0 ? 'up' : 'down'} ${formatHeroScore(Math.abs(score.scoreChange))} after this match`;
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
			{roleName} score uncalibrated. {score.matchNumber} of 10 games played on {heroName} in this position.
		{:else if score.becameCalibrated && score.scoreAfter !== null}
			{roleName} hero score calibrated at {formatHeroScore(score.scoreAfter)} after this match.
			{:else if score.scoreBefore !== null && score.scoreAfter !== null}
			<div class="font-medium tabular-nums text-zinc-100">
				{roleName} hero rating {formatHeroScore(score.scoreBefore)} → {formatHeroScore(score.scoreAfter)}
			</div>
				<div class="mt-0.5 text-zinc-300">
				{#if isStable()}
					Stable. Movement of one point or less is treated as noise.
				{:else}
					Moved {score.scoreChange !== null && score.scoreChange > 0 ? 'up' : 'down'}
					{formatHeroScore(Math.abs(score.scoreChange ?? 0))} after this match.
				{/if}
			</div>
			{#if score.componentChanges}
				<div class="mt-2 border-t border-zinc-700/70 pt-1.5">
					<div class="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Why it changed</div>
					{#each components as component}
						{@const change = score.componentChanges[component.key]}
						<div class="flex items-center justify-between gap-4 py-0.5 text-[11px]">
							<span class="text-zinc-400">{component.label}</span>
							<span class="font-medium tabular-nums {change > 0.05 ? 'text-green-400' : change < -0.05 ? 'text-red-400' : 'text-zinc-500'}">{formatChange(change)}</span>
						</div>
					{/each}
				</div>
				{#if score.inactivityChange !== null && score.inactivityChange !== undefined && Math.abs(score.inactivityChange) > 1}
					<div class="mt-1 text-[10px] leading-4 text-zinc-500">
						Before this match, inactivity moved the rating {formatChange(score.inactivityChange)} since its previous appearance.
					</div>
				{/if}
			{/if}
		{/if}
	</Tooltip.Content>
</Tooltip.Root>
