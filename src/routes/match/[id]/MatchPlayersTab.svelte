<script lang="ts">
	import { ExternalLink, UserRound } from 'lucide-svelte';
	import {
		formatCompactNumber,
		formatStratzImpact,
		getStratzImpactColor,
		type MatchOverview,
		type MatchPlayerOverview
	} from '$lib/match-page';
	import { getColour, getRoleIcon } from '$lib/functions';
	import RatingChip from '$lib/components/RatingChip.svelte';
	import MatchLineChart from './MatchLineChart.svelte';
	import MatchPlayerPicker from './MatchPlayerPicker.svelte';

	interface Props {
		match: MatchOverview;
		selectedSlot: number;
		onSelect: (playerSlot: number) => void;
	}

	let { match, selectedSlot, onSelect }: Props = $props();

	const focusedPlayer = $derived(
		match.players.find((player) => player.playerSlot === selectedSlot) ?? match.players[0]
	);

	const getRelativeWidth = (value: number, selector: (player: MatchPlayerOverview) => number) => {
		const maximum = Math.max(1, ...match.players.map(selector));
		return Math.max(2, (value / maximum) * 100);
	};

	const statRows = $derived(
		focusedPlayer
			? [
					{ label: 'Hero damage', value: focusedPlayer.heroDamage, key: 'heroDamage' },
					{ label: 'Tower damage', value: focusedPlayer.towerDamage, key: 'towerDamage' },
					{ label: 'Hero healing', value: focusedPlayer.heroHealing, key: 'heroHealing' },
					{ label: 'Net worth', value: focusedPlayer.networth, key: 'networth' }
				]
			: []
	);
	const impactTimeline = $derived(focusedPlayer?.whosPlayingImpactTimeline ?? []);
	const impactChartColor = $derived(
		focusedPlayer?.positionNumber ? getColour(focusedPlayer.positionNumber) : '#71717a'
	);
	const focusedPlayerLabel = $derived(
		focusedPlayer?.user || !focusedPlayer?.isAnonymous ? focusedPlayer?.name : focusedPlayer?.hero.name
	);
	const focusedPlayerContext = $derived(
		focusedPlayer?.user || !focusedPlayer?.isAnonymous ? focusedPlayer?.hero.name : 'Untracked player'
	);

	const getStatWidth = (key: string, value: number) => {
		if (key === 'heroDamage') return getRelativeWidth(value, (player) => player.heroDamage);
		if (key === 'towerDamage') return getRelativeWidth(value, (player) => player.towerDamage);
		if (key === 'heroHealing') return getRelativeWidth(value, (player) => player.heroHealing);
		return getRelativeWidth(value, (player) => player.networth);
	};
</script>

<MatchPlayerPicker players={match.players} {selectedSlot} {onSelect} />

{#if focusedPlayer}
	<div class="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
		<section class="rounded-md border border-border bg-card" aria-labelledby="player-summary-heading">
			<div class="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex min-w-0 items-center gap-3">
					<img src={focusedPlayer.hero.img} alt="" class="h-14 w-20 shrink-0 rounded-sm object-cover" />
					<div class="min-w-0">
						<div class="flex flex-wrap items-center gap-2">
							<h3 id="player-summary-heading" class="truncate text-lg font-semibold text-zinc-100">
								{focusedPlayerLabel}
							</h3>
							{#if focusedPlayer.user?.smurf}<span class="rounded-sm bg-indigo-500/15 px-1.5 py-0.5 text-xs text-indigo-300">Smurf</span>{/if}
							{#if focusedPlayer.award}<span class="rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-300">{focusedPlayer.award}</span>{/if}
						</div>
						<div class="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-400">
							{#if focusedPlayer.positionNumber}
								<img
									src={getRoleIcon(focusedPlayer.positionNumber)}
									alt=""
									class="h-4 w-4"
								/>
							{/if}
							<span>{focusedPlayerContext} · {focusedPlayer.position || focusedPlayer.role || 'Unknown role'}</span>
						</div>
					</div>
				</div>
				{#if focusedPlayer.user}
					<a
						href={`/player/${focusedPlayer.user.id}`}
						class="inline-flex min-h-11 w-fit items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<UserRound class="h-4 w-4" /> Player profile <ExternalLink class="h-3.5 w-3.5" />
					</a>
				{/if}
			</div>

			<div class="grid grid-cols-2 divide-x divide-y divide-zinc-800/80 sm:grid-cols-3">
				<div class="p-4">
					<p class="text-xs uppercase tracking-wide text-zinc-400">K / D / A</p>
					<p class="mt-1 text-lg font-semibold tabular-nums text-zinc-100">{focusedPlayer.kills} / {focusedPlayer.deaths} / {focusedPlayer.assists}</p>
				</div>
				<div class="p-4">
					<p class="text-xs uppercase tracking-wide text-zinc-400">Level</p>
					<p class="mt-1 text-lg font-semibold tabular-nums text-zinc-100">{focusedPlayer.level}</p>
				</div>
				<div class="p-4">
					<p class="text-xs uppercase tracking-wide text-zinc-400">Last hits / denies</p>
					<p class="mt-1 text-lg font-semibold tabular-nums text-zinc-100">{focusedPlayer.lastHits} / {focusedPlayer.denies}</p>
				</div>
				<div class="p-4">
					<p class="text-xs uppercase tracking-wide text-zinc-400">whos-playing Impact</p>
					{#if focusedPlayer.whosPlayingImpact !== null && focusedPlayer.positionNumber}
						<div class="mt-1 flex items-center">
							<RatingChip
								data={{
									player: {
										impact: focusedPlayer.whosPlayingImpact,
										role: focusedPlayer.positionNumber,
										kills: focusedPlayer.kills,
										deaths: focusedPlayer.deaths,
										assists: focusedPlayer.assists,
										lastHits: focusedPlayer.lastHits,
										hero: focusedPlayer.hero,
										hero_id: focusedPlayer.hero.id
									},
									matchData: { duration: match.durationSeconds }
								}}
								comfortable
							/>
						</div>
					{:else}
						<p class="mt-1 text-sm text-zinc-400">N/A</p>
					{/if}
				</div>
				<div class="p-4">
					<p class="text-xs uppercase tracking-wide text-zinc-400">STRATZ IMP</p>
					{#if focusedPlayer.stratzImpact !== null}
						<p
							class="mt-1 text-lg font-semibold tabular-nums"
							style:color={getStratzImpactColor(focusedPlayer.stratzImpact)}
						>
							{formatStratzImpact(focusedPlayer.stratzImpact)}
						</p>
					{:else}
						<p class="mt-1 text-sm text-zinc-400">N/A</p>
					{/if}
				</div>
				<div class="p-4">
					<p class="text-xs uppercase tracking-wide text-zinc-400">GPM</p>
					<p class="mt-1 text-lg font-semibold tabular-nums text-amber-300">{focusedPlayer.goldPerMinute}</p>
				</div>
				<div class="p-4">
					<p class="text-xs uppercase tracking-wide text-zinc-400">XPM</p>
					<p class="mt-1 text-lg font-semibold tabular-nums text-cyan-300">{focusedPlayer.experiencePerMinute}</p>
				</div>
				<div class="p-4">
					<p class="text-xs uppercase tracking-wide text-zinc-400">Lane</p>
					<p class="mt-1 text-sm font-medium text-zinc-200">{focusedPlayer.lane || 'Unknown'}</p>
				</div>
				<div class="p-4">
					<p class="text-xs uppercase tracking-wide text-zinc-400">Result</p>
					<p class={`mt-1 text-sm font-semibold ${focusedPlayer.isVictory ? 'text-emerald-300' : 'text-red-300'}`}>{focusedPlayer.isVictory ? 'Victory' : 'Defeat'}</p>
				</div>
			</div>
		</section>

		<section class="rounded-md border border-border bg-card" aria-labelledby="comparison-heading">
			<div class="border-b border-border px-4 py-3">
				<h3 id="comparison-heading" class="text-sm font-semibold text-zinc-100">Match comparison</h3>
				<p class="mt-0.5 text-xs text-zinc-400">Relative to the highest value among all ten players.</p>
			</div>
			<div class="space-y-5 p-4">
				{#each statRows as stat}
					<div>
						<div class="mb-1.5 flex items-center justify-between gap-3 text-xs">
							<span class="text-zinc-400">{stat.label}</span>
							<span class="tabular-nums text-zinc-200">{formatCompactNumber(stat.value)}</span>
						</div>
						<div class="h-1.5 overflow-hidden rounded-full bg-zinc-900">
							<div class="h-full rounded-full bg-sky-500" style={`width: ${getStatWidth(stat.key, stat.value)}%`}></div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</div>

	<section class="mt-4 rounded-md border border-border bg-card" aria-labelledby="impact-timeline-heading">
		<div class="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h3 id="impact-timeline-heading" class="text-sm font-semibold text-zinc-100">WP impact over time</h3>
				<p class="mt-0.5 text-xs text-zinc-400">Role-weighted impact recalculated from cumulative stats each minute, from 5:00.</p>
			</div>
			{#if focusedPlayer.whosPlayingImpact !== null && focusedPlayer.positionNumber}
				<div class="flex items-center gap-2">
					<span class="text-xs uppercase tracking-wide text-zinc-400">Final</span>
					<RatingChip
						data={{
							player: {
								impact: focusedPlayer.whosPlayingImpact,
								role: focusedPlayer.positionNumber,
								kills: focusedPlayer.kills,
								deaths: focusedPlayer.deaths,
								assists: focusedPlayer.assists,
								lastHits: focusedPlayer.lastHits,
								hero: focusedPlayer.hero,
								hero_id: focusedPlayer.hero.id
							},
							matchData: { duration: match.durationSeconds }
						}}
						comfortable
					/>
				</div>
			{/if}
		</div>
		<div class="p-3 sm:p-4">
			{#if impactTimeline.length > 1}
				<MatchLineChart
					datasets={[{ label: 'WP impact', data: impactTimeline.map((point) => point.impact), color: impactChartColor }]}
					timestamps={impactTimeline.map((point) => point.time)}
					mode="number"
					ariaLabel={`${focusedPlayer.name} WP impact over match time`}
				/>
			{:else}
				<div class="flex h-52 items-center justify-center text-sm text-zinc-400">WP impact history is not available for this player.</div>
			{/if}
		</div>
	</section>

	<section class="mt-4 rounded-md border border-border bg-card" aria-labelledby="build-heading">
		<div class="border-b border-border px-4 py-3">
			<h3 id="build-heading" class="text-sm font-semibold text-zinc-100">Final build</h3>
		</div>
		<div class="flex flex-wrap items-start gap-5 p-4">
			<div>
				<p class="mb-2 text-xs uppercase tracking-wide text-zinc-400">Inventory</p>
				<div class="flex flex-wrap gap-1">
					{#each focusedPlayer.items as item}
						<img src={item.img} alt={item.name} title={item.name} class="h-10 w-14 rounded-sm object-cover" />
					{/each}
				</div>
			</div>
			{#if focusedPlayer.backpack.length > 0}
				<div>
					<p class="mb-2 text-xs uppercase tracking-wide text-zinc-400">Backpack</p>
					<div class="flex gap-1 opacity-70">
						{#each focusedPlayer.backpack as item}
							<img src={item.img} alt={item.name} title={item.name} class="h-10 w-14 rounded-sm object-cover" />
						{/each}
					</div>
				</div>
			{/if}
			{#if focusedPlayer.neutralItem}
				<div>
					<p class="mb-2 text-xs uppercase tracking-wide text-zinc-400">Neutral</p>
					<img src={focusedPlayer.neutralItem.img} alt={focusedPlayer.neutralItem.name} title={focusedPlayer.neutralItem.name} class="h-10 w-10 rounded-full object-cover" />
				</div>
			{/if}
		</div>
	</section>
{/if}
