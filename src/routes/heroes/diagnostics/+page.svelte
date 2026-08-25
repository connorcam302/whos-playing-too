<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import type {
		HeroScoreConfigurationResult,
		HeroScoreEvaluationReport
	} from '$lib/heroScoreEvaluation';
	import {
		HERO_SCORE_HISTORICAL_EVIDENCE_CAP,
		HERO_SCORE_HISTORICAL_PERFORMANCE_WEIGHT,
		HERO_SCORE_NORMALIZE_ROLE_PERFORMANCE,
		HERO_SCORE_RECENT_FORM_REGRESSION_FACTOR,
		HERO_SCORE_RECENCY_HALF_LIFE_DAYS,
		HERO_SCORE_VOLUME_FULL_MATCHES,
		HERO_SCORE_VOLUME_WEIGHT,
		getHeroScoreGroupName
	} from '$lib/heroScores';
	import { ArrowLeft, ExternalLink } from 'lucide-svelte';

	const getMatchRangeLabel = (label: string) => {
		if (label === 'Stale') return 'Fewer than 10 matches';
		if (label === 'Provisional') return '10–19 matches';
		if (label === 'Established') return '20–49 matches';
		return '50+ matches';
	};

	type Props = {
		data: {
			report: Promise<HeroScoreEvaluationReport>;
		};
	};

	let { data }: Props = $props();

	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		}).format(value);
	const formatPercent = (value: number, decimals = 1) => `${formatNumber(value * 100, decimals)}%`;
	const formatCorrelation = (value: number | null) =>
		value === null ? 'Not enough data' : formatNumber(value, 3);
	const formatCorrelationInterval = (lower: number | null, upper: number | null) =>
		lower === null || upper === null
			? 'Interval unavailable'
			: `${formatNumber(lower, 3)} to ${formatNumber(upper, 3)}`;
	const formatSigned = (value: number, decimals = 1) =>
		`${value > 0 ? '+' : value < 0 ? '−' : '±'}${formatNumber(Math.abs(value), decimals)}`;
	const isCurrentConfiguration = (configuration: HeroScoreConfigurationResult) =>
		configuration.config.recencyHalfLifeDays === HERO_SCORE_RECENCY_HALF_LIFE_DAYS &&
		configuration.config.historicalPerformanceWeight ===
			HERO_SCORE_HISTORICAL_PERFORMANCE_WEIGHT &&
		configuration.config.historicalEvidenceCap === HERO_SCORE_HISTORICAL_EVIDENCE_CAP &&
		configuration.config.recentFormRegressionFactor ===
			HERO_SCORE_RECENT_FORM_REGRESSION_FACTOR &&
		configuration.config.volumeFullMatches === HERO_SCORE_VOLUME_FULL_MATCHES &&
		configuration.config.normalizeRolePerformance === HERO_SCORE_NORMALIZE_ROLE_PERFORMANCE &&
		configuration.config.volumeWeight === HERO_SCORE_VOLUME_WEIGHT;
</script>

<svelte:head>
	<title>whos-playing | Hero Score Diagnostics</title>
</svelte:head>

{#await data.report}
	<div class="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col items-center justify-center gap-3 px-4 pt-16">
		<Loading />
		<div class="text-sm font-medium text-zinc-300">Generating hero score report…</div>
		<div class="max-w-md text-center text-xs leading-relaxed text-zinc-500">
			Replaying every player–hero–group history and evaluating 27 scoring configurations.
		</div>
	</div>
{:then report}
	<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 pb-4 pt-16 sm:px-4">
		<section class="rounded-md border border-border bg-card p-4">
			<a href="/heroes" class="mb-3 inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100">
				<ArrowLeft class="h-3.5 w-3.5" />
				Hero rankings
			</a>
			<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<div class="text-sm text-zinc-400">Model evaluation</div>
					<h1 class="mt-1 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
						Hero Score Diagnostics
					</h1>
					<p class="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
						A time-based holdout of player–hero–group histories. Each prediction uses only matches before {new Date(report.holdoutCutoff).toLocaleDateString('en-GB')}, then checks the next ten without overlapping windows.
					</p>
				</div>
				<div class="shrink-0 text-left text-xs leading-5 text-zinc-500 lg:text-right">
					<div>{new Date(report.generatedAt).toLocaleString('en-GB')}</div>
					<div>{formatNumber(report.generationMs)} ms to query and evaluate</div>
				</div>
			</div>
			<div class="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
				<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">{formatNumber(report.rowsEvaluated)} matches</span>
				<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">{formatNumber(report.playerHeroHistories)} player–hero–group histories</span>
				<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">{formatNumber(report.current.calibratedRatings)} calibrated ratings</span>
				<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">{report.configurations.length} configurations tested</span>
			</div>
		</section>

		<section class="overflow-hidden rounded-md border border-border bg-card">
			<div class="border-b border-border px-4 py-3">
				<h2 class="text-base font-semibold text-zinc-100">Regression safeguards</h2>
				<p class="mt-0.5 text-xs text-zinc-500">Model invariants checked on every report generation.</p>
			</div>
			<div class="divide-y divide-zinc-800">
				{#each report.invariants as invariant}
					<div class="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
						<div class="flex items-center gap-2 text-xs font-medium text-zinc-200">
							<span class={`h-2 w-2 rounded-full ${invariant.passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
							{invariant.label}
						</div>
						<div class="text-[11px] tabular-nums text-zinc-500">{invariant.detail}</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="overflow-hidden rounded-md border border-border bg-card">
			<div class="border-b border-border px-4 py-3">
				<h2 class="text-base font-semibold text-zinc-100">Current model health</h2>
				<p class="mt-0.5 text-xs text-zinc-500">Read these together; no single metric decides whether the model is good.</p>
			</div>
			<div class="grid sm:grid-cols-2 lg:grid-cols-3">
				<div class="border-b border-zinc-800 p-4 sm:border-r lg:border-b-0">
					<div class="text-[11px] uppercase tracking-wide text-zinc-500">Score spread</div>
					<div class="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">{formatNumber(report.current.scoreStandardDeviation, 1)}</div>
					<div class="mt-1 text-xs text-zinc-500">Standard deviation; higher means ratings are less grouped.</div>
				</div>
				<div class="border-b border-zinc-800 p-4 lg:border-b-0 lg:border-r">
					<div class="text-[11px] uppercase tracking-wide text-zinc-500">Predictive correlation</div>
					<div class="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">{formatCorrelation(report.current.predictiveCorrelation)}</div>
					<div class="mt-1 text-xs text-zinc-500">95% interval: {formatCorrelationInterval(report.current.predictiveCorrelationInterval.lower, report.current.predictiveCorrelationInterval.upper)}</div>
				</div>
				<div class="border-b border-zinc-800 p-4 sm:border-r lg:border-b-0 lg:border-r-0">
					<div class="text-[11px] uppercase tracking-wide text-zinc-500">Unexpected movement</div>
					<div class="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">{formatPercent(report.current.counterintuitiveRate)}</div>
					<div class="mt-1 text-xs text-zinc-500">Wins falling or losses rising by more than one point.</div>
				</div>
				<div class="border-b border-zinc-800 p-4 sm:border-r sm:border-b-0 lg:border-t">
					<div class="text-[11px] uppercase tracking-wide text-zinc-500">Typical movement</div>
					<div class="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">{formatNumber(report.current.meanAbsoluteScoreMovement, 1)}</div>
					<div class="mt-1 text-xs text-zinc-500">Mean absolute score change after a calibrated match.</div>
				</div>
				<div class="border-b border-zinc-800 p-4 sm:border-b-0 lg:border-r lg:border-t">
					<div class="text-[11px] uppercase tracking-wide text-zinc-500">Inactivity drift</div>
					<div class="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">{formatNumber(report.current.meanAbsoluteInactivityMovement, 1)}</div>
					<div class="mt-1 text-xs text-zinc-500">Average movement before a match, reported separately from that match.</div>
				</div>
				<div class="p-4 lg:border-t">
					<div class="text-[11px] uppercase tracking-wide text-zinc-500">Score clamps</div>
					<div class="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">{report.current.lowerClampCount + report.current.upperClampCount}</div>
					<div class="mt-1 text-xs text-zinc-500">Ratings currently pinned to either 0 or 1,000.</div>
				</div>
			</div>
		</section>

		<div class="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
			<section class="overflow-hidden rounded-md border border-border bg-card">
				<div class="border-b border-border px-4 py-3">
					<h2 class="text-base font-semibold text-zinc-100">Rating distribution</h2>
					<p class="mt-0.5 text-xs text-zinc-500">Current calibrated player–hero ratings.</p>
				</div>
				<div class="grid grid-cols-5 divide-x divide-zinc-800">
					{#each Object.entries(report.current.percentiles) as [label, value]}
						<div class="px-2 py-4 text-center">
							<div class="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</div>
							<div class="mt-1 text-lg font-semibold tabular-nums text-zinc-200">{formatNumber(value)}</div>
						</div>
					{/each}
				</div>
				<div class="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-400">
					Mean <span class="font-medium tabular-nums text-zinc-200">{formatNumber(report.current.scoreMean, 1)}</span>
					<span class="mx-2 text-zinc-700">·</span>
					Middle 50% spans <span class="font-medium tabular-nums text-zinc-200">{formatNumber(report.current.percentiles.p25)}–{formatNumber(report.current.percentiles.p75)}</span>
				</div>
			</section>

			<section class="overflow-hidden rounded-md border border-border bg-card">
				<div class="border-b border-border px-4 py-3">
					<h2 class="text-base font-semibold text-zinc-100">Next-ten results</h2>
					<p class="mt-0.5 text-xs text-zinc-500">Independent holdout histories, with 95% intervals.</p>
				</div>
				<div class="space-y-3 p-4">
					{#each report.current.predictiveQuartiles as quartile}
						<div>
							<div class="mb-1 flex items-center justify-between text-xs">
								<span class="text-zinc-400">{quartile.label} · {quartile.samples} histories</span>
								<span class="font-medium tabular-nums text-zinc-200">{formatNumber(quartile.winRate, 1)}%</span>
							</div>
							<div class="h-1.5 overflow-hidden rounded-full bg-zinc-900">
								<div class="h-full bg-sky-500/80" style:width={`${Math.min(100, Math.max(0, quartile.winRate))}%`}></div>
							</div>
							<div class="mt-1 text-right text-[10px] tabular-nums text-zinc-600">{formatNumber(quartile.lower, 1)}–{formatNumber(quartile.upper, 1)}%</div>
						</div>
					{/each}
				</div>
				<div class="border-t border-zinc-800 px-4 py-2.5 text-[11px] text-zinc-500">{formatNumber(report.current.predictiveSamples)} independent histories · {formatNumber(report.current.predictiveBaseline, 1)}% holdout baseline</div>
			</section>
		</div>

		<section class="overflow-hidden rounded-md border border-border bg-card">
			<div class="border-b border-border px-4 py-3">
				<h2 class="text-base font-semibold text-zinc-100">Match-count cohorts</h2>
				<p class="mt-0.5 text-xs text-zinc-500">Performance confidence reaches full weight at 24 matches. Volume awards up to 200 points across {HERO_SCORE_VOLUME_FULL_MATCHES} matches; latest-10 form is regressed toward neutral and impact/KDA are role-normalised.</p>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full min-w-[680px] text-left text-xs">
					<thead class="bg-zinc-950/60 text-[10px] uppercase tracking-wide text-zinc-500">
					<tr><th class="px-4 py-2.5 font-medium">Matches</th><th class="px-3 py-2.5 text-right font-medium">Ratings</th><th class="px-3 py-2.5 text-right font-medium">Average</th><th class="px-3 py-2.5 text-right font-medium">Spread</th><th class="px-3 py-2.5 text-right font-medium">Holdout</th><th class="px-4 py-2.5 text-right font-medium">Prediction</th></tr>
					</thead>
					<tbody class="divide-y divide-zinc-800">
						{#each report.current.confidenceGroups as group}
						<tr class="hover:bg-zinc-900/35"><td class="px-4 py-3 font-medium text-zinc-300">{getMatchRangeLabel(group.label)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-300">{formatNumber(group.count)}</td><td class="px-3 py-3 text-right font-medium tabular-nums text-zinc-200">{formatNumber(group.average, 1)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatNumber(group.standardDeviation, 1)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatNumber(group.predictiveSamples)}</td><td class="px-4 py-3 text-right tabular-nums text-zinc-400">{formatCorrelation(group.predictiveCorrelation)}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<section class="overflow-hidden rounded-md border border-border bg-card">
			<div class="border-b border-border px-4 py-3">
				<h2 class="text-base font-semibold text-zinc-100">Component ablation</h2>
				<p class="mt-0.5 text-xs text-zinc-500">Each row removes part of the formula while keeping the same independent holdout.</p>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full min-w-[900px] text-left text-xs">
					<thead class="bg-zinc-950/60 text-[10px] uppercase tracking-wide text-zinc-500">
						<tr><th class="px-4 py-2.5 font-medium">Model</th><th class="px-3 py-2.5 text-right font-medium">Prediction</th><th class="px-3 py-2.5 text-right font-medium">Core</th><th class="px-3 py-2.5 text-right font-medium">Support</th><th class="px-3 py-2.5 text-right font-medium">95% interval</th><th class="px-3 py-2.5 text-right font-medium">Q4–Q1</th><th class="px-4 py-2.5 text-right font-medium">Typical move</th></tr>
					</thead>
					<tbody class="divide-y divide-zinc-800">
						{#each report.ablations as ablation}
							<tr class="hover:bg-zinc-900/35"><td class="px-4 py-3"><div class="font-medium text-zinc-200">{ablation.label}</div><div class="mt-0.5 text-[10px] text-zinc-500">{ablation.detail}</div></td><td class="px-3 py-3 text-right font-medium tabular-nums text-zinc-200">{formatCorrelation(ablation.predictiveCorrelation)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatCorrelation(ablation.corePrediction)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatCorrelation(ablation.supportPrediction)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-500">{formatCorrelationInterval(ablation.predictiveCorrelationInterval.lower, ablation.predictiveCorrelationInterval.upper)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatSigned(ablation.quartileLift)} pts</td><td class="px-4 py-3 text-right tabular-nums text-zinc-400">{formatNumber(ablation.meanAbsoluteScoreMovement, 1)}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<div>
			<section class="overflow-hidden rounded-md border border-border bg-card">
				<div class="border-b border-border px-4 py-3">
				<h2 class="text-base font-semibold text-zinc-100">Prediction by score group</h2>
				<p class="mt-0.5 text-xs text-zinc-500">Checks whether Core or Support is carrying or weakening the model.</p>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full min-w-[620px] text-left text-xs">
						<thead class="bg-zinc-950/60 text-[10px] uppercase tracking-wide text-zinc-500"><tr><th class="px-4 py-2.5 font-medium">Group</th><th class="px-3 py-2.5 text-right font-medium">Ratings</th><th class="px-3 py-2.5 text-right font-medium">Average</th><th class="px-3 py-2.5 text-right font-medium">Holdout</th><th class="px-4 py-2.5 text-right font-medium">Prediction</th></tr></thead>
						<tbody class="divide-y divide-zinc-800">
							{#each report.current.scoreGroups as group}
								<tr><td class="px-4 py-3 font-medium text-zinc-200">{group.label}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatNumber(group.ratings)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-300">{formatNumber(group.averageScore, 1)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatNumber(group.predictiveSamples)}</td><td class="px-4 py-3 text-right font-medium tabular-nums text-zinc-300">{formatCorrelation(group.predictiveCorrelation)}</td></tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		</div>

		<section class="overflow-hidden rounded-md border border-border bg-card">
			<div class="border-b border-border px-4 py-3">
				<h2 class="text-base font-semibold text-zinc-100">Prediction by hero</h2>
				<p class="mt-0.5 text-xs text-zinc-500">Hero cohorts sorted by holdout sample size. Small cohorts should not drive tuning decisions.</p>
			</div>
			<div class="max-h-[28rem] overflow-auto">
				<table class="w-full min-w-[720px] text-left text-xs">
					<thead class="sticky top-0 z-10 bg-zinc-950 text-[10px] uppercase tracking-wide text-zinc-500"><tr><th class="px-4 py-2.5 font-medium">Hero</th><th class="px-3 py-2.5 text-right font-medium">Ratings</th><th class="px-3 py-2.5 text-right font-medium">Average</th><th class="px-3 py-2.5 text-right font-medium">Spread</th><th class="px-3 py-2.5 text-right font-medium">Holdout</th><th class="px-4 py-2.5 text-right font-medium">Prediction</th></tr></thead>
					<tbody class="divide-y divide-zinc-800">
						{#each report.current.heroGroups as group}
							<tr class="hover:bg-zinc-900/35"><td class="px-4 py-3 font-medium text-zinc-200">{group.label}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatNumber(group.ratings)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-300">{formatNumber(group.averageScore, 1)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatNumber(group.scoreSpread, 1)}</td><td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatNumber(group.predictiveSamples)}</td><td class="px-4 py-3 text-right font-medium tabular-nums text-zinc-300">{formatCorrelation(group.predictiveCorrelation)}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<section class="overflow-hidden rounded-md border border-border bg-card">
			<div class="border-b border-border px-4 py-3">
				<h2 class="text-base font-semibold text-zinc-100">Configuration comparison</h2>
				<p class="mt-0.5 text-xs text-zinc-500">Sorted by holdout prediction. The grid tests evidence decay, historical-to-latest-20 blending and the historical performance-memory cap.</p>
			</div>
			<div class="max-h-[34rem] overflow-auto">
				<table class="w-full min-w-[900px] text-left text-xs">
					<thead class="sticky top-0 z-10 bg-zinc-950 text-[10px] uppercase tracking-wide text-zinc-500">
						<tr><th class="px-4 py-2.5 font-medium">Configuration</th><th class="px-3 py-2.5 text-right font-medium">Prediction</th><th class="px-3 py-2.5 text-right font-medium">Unexpected</th><th class="px-3 py-2.5 text-right font-medium">Score spread</th><th class="px-3 py-2.5 text-right font-medium">Typical move</th><th class="px-4 py-2.5 text-right font-medium">Clamped</th></tr>
					</thead>
					<tbody class="divide-y divide-zinc-800">
						{#each report.configurations as configuration}
							<tr class={isCurrentConfiguration(configuration) ? 'bg-sky-950/25' : 'hover:bg-zinc-900/35'}>
								<td class="px-4 py-3 font-medium text-zinc-200">{configuration.label}{#if isCurrentConfiguration(configuration)}<span class="ml-2 rounded-sm border border-sky-800/70 bg-sky-950/60 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-sky-300">Current</span>{/if}</td>
								<td class="px-3 py-3 text-right tabular-nums text-zinc-300">{formatCorrelation(configuration.predictiveCorrelation)}</td>
								<td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatPercent(configuration.counterintuitiveRate)}</td>
								<td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatNumber(configuration.scoreStandardDeviation, 1)}</td>
								<td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatNumber(configuration.meanAbsoluteScoreMovement, 1)}</td>
								<td class="px-4 py-3 text-right tabular-nums text-zinc-400">{formatPercent(configuration.clampRate)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<section class="overflow-hidden rounded-md border border-border bg-card">
			<div class="border-b border-border px-4 py-3">
				<h2 class="text-base font-semibold text-zinc-100">Largest unexpected movements</h2>
				<p class="mt-0.5 text-xs text-zinc-500">A win can still lower performance after a weak individual game; this table makes those cases inspectable instead of hiding them.</p>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full min-w-[980px] text-left text-xs">
					<thead class="bg-zinc-950/60 text-[10px] uppercase tracking-wide text-zinc-500">
						<tr><th class="px-4 py-2.5 font-medium">Match</th><th class="px-3 py-2.5 font-medium">Player / Hero</th><th class="px-3 py-2.5 font-medium">Result</th><th class="px-3 py-2.5 text-right font-medium">Match move</th><th class="px-3 py-2.5 text-right font-medium">Inactivity</th><th class="px-3 py-2.5 text-right font-medium">Performance</th><th class="px-4 py-2.5 text-right font-medium">Volume</th></tr>
					</thead>
					<tbody class="divide-y divide-zinc-800">
						{#each report.current.anomalies as anomaly}
							<tr class="hover:bg-zinc-900/35">
								<td class="px-4 py-3"><a href={`/match/${anomaly.matchId}`} class="inline-flex items-center gap-1 font-medium text-zinc-300 hover:text-zinc-100">{anomaly.matchId}<ExternalLink class="h-3 w-3 text-zinc-600" /></a><div class="mt-0.5 text-[10px] text-zinc-600">Game {anomaly.matchNumber}</div></td>
								<td class="px-3 py-3"><div class="font-medium text-zinc-200">{anomaly.username}</div><div class="text-[10px] text-zinc-500">{anomaly.heroName} · {getHeroScoreGroupName(anomaly.scoreGroup)}</div></td>
								<td class="px-3 py-3 text-zinc-300">{anomaly.result}</td>
								<td class="px-3 py-3 text-right"><span class={anomaly.scoreChange > 0 ? 'text-green-400' : 'text-red-400'}>{formatSigned(anomaly.scoreChange, 0)}</span><div class="mt-0.5 text-[10px] tabular-nums text-zinc-600">{anomaly.scoreBefore} → {anomaly.scoreAfter}</div></td>
								<td class="px-3 py-3 text-right tabular-nums text-zinc-500">{formatSigned(anomaly.inactivityChange)}</td>
								<td class="px-3 py-3 text-right tabular-nums text-zinc-400">{formatSigned(anomaly.performanceChange)}</td>
								<td class="px-4 py-3 text-right tabular-nums text-zinc-400">{formatSigned(anomaly.volumeChange)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	</div>
{:catch error}
	<div class="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-4 pt-16 text-center">
		<h1 class="text-xl font-semibold text-zinc-100">Couldn’t generate the report</h1>
		<p class="mt-2 text-sm text-zinc-400">{error instanceof Error ? error.message : 'The diagnostics query failed.'}</p>
		<a href="/heroes/diagnostics" class="mt-4 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800">Try again</a>
	</div>
{/await}
