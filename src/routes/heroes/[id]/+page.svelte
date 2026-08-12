<script lang="ts">
	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import RatingChip from '$lib/components/RatingChip.svelte';
	import HeroScoreComparisonDialog from '$lib/components/heroes/HeroScoreComparisonDialog.svelte';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { getGameMode, getLobbyType, getRoleIcon, getRoleName, toTime } from '$lib/functions';
	import { formatHeroScore } from '$lib/heroScores';
	import { ArrowLeft, ArrowRight, HelpCircle, VenetianMask } from 'lucide-svelte';

	dayjs.extend(relativeTime);

	type Hero = {
		id: number;
		name: string;
		img: string;
		renderImg: string;
	};

	type PlayerRanking = {
		playerId: number;
		username: string;
		smurf: boolean;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		recentForm: string;
		avgKills: number;
		avgDeaths: number;
		avgAssists: number;
		kda: number;
		avgImpact: number;
		avgDuration: number;
		avgGpm: number;
		avgXpm: number;
		avgLastHits: number;
		avgHeroDamage: number;
		avgTowerDamage: number;
		primaryRole: number;
		score: number;
		scoreWinRate: number;
		scoreKda: number;
		scoreAvgImpact: number;
		volumeScore: number;
		sampleWeight: number;
		confidence: string;
		lastPlayed: number;
	};

	type RoleBreakdown = {
		role: number;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		avgImpact: number;
		avgDuration: number;
		avgKills: number;
		avgDeaths: number;
		avgAssists: number;
		avgLastHits: number;
	};

	type DurationBand = {
		label: string;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
	};

	type HeroMatch = {
		playerId: number;
		username: string;
		smurf: boolean;
		matchId: number;
		sequenceNumber: number | null;
		startTime: number;
		duration: number;
		lobby: number;
		gameMode: number;
		winner: string;
		team: string;
		role: number;
		kills: number;
		deaths: number;
		assists: number;
		impact: number;
		gpm: number | null;
		xpm: number | null;
		lastHits: number | null;
		heroDamage: number | null;
		towerDamage: number | null;
	};

	type HeroRecord = {
		title: string;
		metric: string;
		value: number;
		match: HeroMatch;
	};

	type Props = {
		data: {
			hero: Hero;
			summary: {
				matches: number;
				wins: number;
				losses: number;
				winRate: number;
				recentForm: string;
				recentWinRate: number;
				avgImpact: number;
				avgDuration: number;
				avgKills: number;
				avgDeaths: number;
				avgAssists: number;
				avgLastHits: number;
				primaryRole: number;
				bestPlayer: PlayerRanking | null;
				mostPlayedBy: PlayerRanking | null;
			};
			playerRankings: PlayerRanking[];
			roleBreakdown: RoleBreakdown[];
			durationBands: DurationBand[];
			records: HeroRecord[];
			matches: HeroMatch[];
		};
	};

	let { data }: Props = $props();
	const MATCHES_PER_PAGE = 20;
	let matchPage = $state(1);
	let scoreComparisonPlayerId = $state<number | null>(null);
	let scoreComparisonOpen = $state(false);

	const totalMatchPages = $derived(Math.max(1, Math.ceil(data.matches.length / MATCHES_PER_PAGE)));
	const paginatedMatches = $derived(
		data.matches.slice((matchPage - 1) * MATCHES_PER_PAGE, matchPage * MATCHES_PER_PAGE)
	);
	const matchPageStart = $derived(
		data.matches.length === 0 ? 0 : (matchPage - 1) * MATCHES_PER_PAGE + 1
	);
	const matchPageEnd = $derived(Math.min(matchPage * MATCHES_PER_PAGE, data.matches.length));

	const incrementMatchPage = () => {
		if (matchPage < totalMatchPages) {
			matchPage += 1;
		}
	};

	const decrementMatchPage = () => {
		if (matchPage > 1) {
			matchPage -= 1;
		}
	};

	const openScoreComparison = (playerId: number) => {
		scoreComparisonPlayerId = playerId;
		scoreComparisonOpen = true;
	};

	const formatNumber = (value: number | null | undefined, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value ?? 0);

	const formatPercent = (value: number | null | undefined) => `${formatNumber(value, 1)}%`;

	const formatDate = (timestamp: number) => dayjs(timestamp * 1000).format('D MMM YYYY');

	const getResultClass = (match: HeroMatch) =>
		match.team === match.winner
			? 'border-green-500/30 bg-green-500/10 text-green-300'
			: 'border-red-500/30 bg-red-500/10 text-red-300';

	const getFormClass = (result: string) =>
		result === 'W' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300';

	const makeRatingChipData = ({
		impact,
		role,
		duration,
		kills,
		deaths,
		assists,
		lastHits
	}: {
		impact: number;
		role: number;
		duration: number;
		kills: number;
		deaths: number;
		assists: number;
		lastHits: number;
	}) => ({
		player: {
			impact,
			role,
			kills,
			deaths,
			assists,
			lastHits,
			hero: data.hero,
			hero_id: data.hero.id
		},
		matchData: {
			duration
		}
	});
</script>

<svelte:head>
	<title>whos-playing | {data.hero.name}</title>
</svelte:head>

<HeroScoreComparisonDialog
	heroName={data.hero.name}
	heroImg={data.hero.img}
	players={data.playerRankings}
	selectedPlayerId={scoreComparisonPlayerId}
	bind:open={scoreComparisonOpen}
/>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-3 pb-4 pt-16 sm:px-4">
	<section class="overflow-hidden rounded-md border border-border bg-card">
		<div class="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
			<div class="flex min-w-0 flex-1 gap-4">
				<img
					src={data.hero.img}
					alt={data.hero.name}
					class="h-20 w-32 shrink-0 rounded-sm border border-zinc-700 object-cover sm:h-24 sm:w-40 lg:hidden"
				/>
				<div class="min-w-0">
					<div class="text-sm text-zinc-400">Hero Analysis</div>
					<h1 class="mt-1 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
						{data.hero.name}
					</h1>
					<div class="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
						<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
							{data.summary.wins}W / {data.summary.losses}L
						</span>
						<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
							{formatPercent(data.summary.winRate)} win rate
						</span>
						<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
							{data.summary.matches} matches
						</span>
					</div>
				</div>
			</div>

			<div class="hidden overflow-hidden rounded-md bg-black/10 bg-no-repeat lg:row-span-2 lg:block">
				<img
					src={data.hero.renderImg}
					alt="{data.hero.name} render"
					class="h-full w-full object-cover object-center"
				/>
			</div>

			<div class="grid min-w-0 gap-2 sm:grid-cols-2 lg:col-start-1 lg:row-start-2">
				<div class="rounded-md border border-zinc-800 bg-zinc-950/35 p-3">
					<div class="text-xs font-medium text-zinc-400">Best Player</div>
					<div class="mt-1 truncate text-lg font-semibold text-zinc-100">
						{data.summary.bestPlayer?.username ?? 'Uncalibrated'}
					</div>
					<div class="mt-1 flex items-center gap-2 text-xs text-zinc-400">
						{#if data.summary.bestPlayer}
							<button
								type="button"
								onclick={() => openScoreComparison(data.summary.bestPlayer!.playerId)}
								class="rounded-sm underline decoration-zinc-700 decoration-dotted underline-offset-4 outline-none transition-colors hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-ring"
								aria-label={`Compare all player scores for ${data.hero.name}`}
							>
								{formatHeroScore(data.summary.bestPlayer.score)} score
							</button>
						{:else}
							<span>Needs 10 games</span>
						{/if}
						<Tooltip.Root>
							<Tooltip.Trigger class="inline-flex text-zinc-500 outline-none hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-ring">
								<HelpCircle class="h-3.5 w-3.5" />
							</Tooltip.Trigger>
							<Tooltip.Content class="max-w-72 text-xs">
								Server-side score blends 70% time-weighted history with 30% from the latest 20 games
								for win rate, impact, and KDA. Recent form, sample weight, and match volume also contribute.
								Every match counts fully toward experience and confidence.
								Players need 10 games on a hero before they receive a score.
							</Tooltip.Content>
						</Tooltip.Root>
					</div>
				</div>
				<div class="rounded-md border border-zinc-800 bg-zinc-950/35 p-3">
					<div class="text-xs font-medium text-zinc-400">Most Played By</div>
					<div class="mt-1 truncate text-lg font-semibold text-zinc-100">
						{data.summary.mostPlayedBy?.username ?? 'No matches'}
					</div>
					<div class="mt-1 text-xs text-zinc-400">
						{data.summary.mostPlayedBy?.matches ?? 0} matches
					</div>
				</div>
				<div class="rounded-md border border-zinc-800 bg-zinc-950/35 p-3">
					<div class="text-xs font-medium text-zinc-400">Recent Form</div>
					<div class="mt-2 flex flex-wrap gap-1">
						{#each data.summary.recentForm.split('') as result}
							<span class="rounded-sm px-1.5 py-0.5 text-xs font-semibold {getFormClass(result)}">
								{result}
							</span>
						{:else}
							<span class="text-sm text-zinc-500">No recent matches</span>
						{/each}
					</div>
				</div>
				<div class="rounded-md border border-zinc-800 bg-zinc-950/35 p-3">
					<div class="text-xs font-medium text-zinc-400">Avg Impact</div>
					<div class="mt-2">
						{#if data.summary.primaryRole}
							<RatingChip
								data={makeRatingChipData({
									impact: Math.round(data.summary.avgImpact),
									role: data.summary.primaryRole,
									duration: Math.round(data.summary.avgDuration),
									kills: data.summary.avgKills,
									deaths: data.summary.avgDeaths,
									assists: data.summary.avgAssists,
									lastHits: data.summary.avgLastHits
								})}
							/>
						{:else}
							<span class="text-lg font-semibold text-zinc-100">{formatNumber(data.summary.avgImpact)}</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</section>

	{#if data.matches.length === 0}
		<Card.Root class="rounded-md border-border bg-card shadow-none">
			<Card.Content class="flex min-h-52 items-center justify-center p-6 text-center text-sm text-zinc-400">
				No tracked group matches on {data.hero.name} yet.
			</Card.Content>
		</Card.Root>
	{:else}
		<section class="rounded-md border border-border bg-card p-4">
			<div class="mb-3 flex items-center justify-between gap-3">
				<h2 class="text-base font-semibold text-zinc-100">Best On {data.hero.name}</h2>
				<Tooltip.Root>
					<Tooltip.Trigger class="inline-flex text-zinc-500 outline-none hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-ring">
						<HelpCircle class="h-4 w-4" />
					</Tooltip.Trigger>
					<Tooltip.Content class="max-w-80 text-xs">
						Score is calculated for players with at least 10 games on this hero. Performance blends
						70% time-weighted history with 30% from the latest 20 games, making improvement visible
						without discarding older matches.
					</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<div class="overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
				<Table.Root>
					<Table.Header class="bg-zinc-950/70">
						<Table.Row class="border-zinc-800 hover:bg-transparent">
							<Table.Head class="h-9 w-10 px-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">#</Table.Head>
							<Table.Head class="h-9 min-w-32 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Player</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Score</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">W/L</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">WR</Table.Head>
							<Table.Head class="h-9 px-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">Role</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">KDA</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Impact</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Last Played</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.playerRankings as player, index}
							<Table.Row class="border-zinc-900 transition-colors hover:bg-zinc-900/70">
								<Table.Cell class="px-2 py-2 text-center font-medium text-zinc-100">{index + 1}</Table.Cell>
								<Table.Cell class="px-2 py-2">
									<button
										onclick={() => goto(`/player/${player.playerId}`)}
										class="inline-flex max-w-36 items-center gap-1 truncate text-left font-medium text-zinc-100 transition-colors hover:text-sky-300"
									>
										<span class="truncate">{player.username}</span>
									</button>
								</Table.Cell>
								<Table.Cell class="px-2 py-2 text-right tabular-nums">
									<button
										type="button"
										onclick={() => openScoreComparison(player.playerId)}
										class="ml-auto block rounded-sm text-lg font-semibold text-zinc-100 underline decoration-zinc-700 decoration-dotted underline-offset-4 outline-none transition-colors hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-ring"
										aria-label={`Compare all player scores for ${data.hero.name}`}
									>
										{formatHeroScore(player.score)}
									</button>
								</Table.Cell>
								<Table.Cell class="px-2 py-2 text-right tabular-nums">
									<span class="text-green-400">{player.wins}</span>
									<span class="text-zinc-600">/</span>
									<span class="text-red-400">{player.losses}</span>
								</Table.Cell>
								<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">
									{formatPercent(player.winRate)}
								</Table.Cell>
								<Table.Cell class="px-2 py-2 text-center">
									<Tooltip.Root>
										<Tooltip.Trigger class="inline-flex rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
											<img src={getRoleIcon(player.primaryRole)} alt="" class="h-7 w-7" />
										</Tooltip.Trigger>
										<Tooltip.Content class="text-xs">{getRoleName(player.primaryRole)}</Tooltip.Content>
									</Tooltip.Root>
								</Table.Cell>
								<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">
									{formatNumber(player.kda, 2)}
								</Table.Cell>
								<Table.Cell class="px-2 py-2">
									<div class="flex justify-end">
										<RatingChip
											data={makeRatingChipData({
												impact: Math.round(player.avgImpact),
												role: player.primaryRole,
												duration: Math.round(player.avgDuration),
												kills: player.avgKills,
												deaths: player.avgDeaths,
												assists: player.avgAssists,
												lastHits: player.avgLastHits
											})}
										/>
									</div>
								</Table.Cell>
								<Table.Cell class="px-2 py-2 text-right text-xs text-zinc-400">
									{dayjs(player.lastPlayed * 1000).from(dayjs())}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</section>

		<div class="grid gap-4 lg:grid-cols-[1fr_1fr]">
			<section class="rounded-md border border-border bg-card p-4">
				<h2 class="mb-3 text-base font-semibold text-zinc-100">Role Context</h2>
				<div class="overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
					<Table.Root>
						<Table.Header class="bg-zinc-950/70">
							<Table.Row class="border-zinc-800 hover:bg-transparent">
								<Table.Head class="h-9 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Role</Table.Head>
								<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Matches</Table.Head>
								<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">W/L</Table.Head>
								<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">WR</Table.Head>
								<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Impact</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.roleBreakdown as role}
								<Table.Row class="border-zinc-900 transition-colors hover:bg-zinc-900/70">
									<Table.Cell class="px-2 py-2">
										<div class="flex items-center gap-2 font-medium text-zinc-100">
											<img src={getRoleIcon(role.role)} alt="" class="h-7 w-7" />
											<span>{getRoleName(role.role)}</span>
										</div>
									</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{role.matches}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{role.wins}/{role.losses}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{formatPercent(role.winRate)}</Table.Cell>
									<Table.Cell class="px-2 py-2">
										<div class="flex justify-end">
											{#if role.matches > 0}
												<RatingChip
													data={makeRatingChipData({
														impact: Math.round(role.avgImpact),
														role: role.role,
														duration: Math.round(role.avgDuration),
														kills: role.avgKills,
														deaths: role.avgDeaths,
														assists: role.avgAssists,
														lastHits: role.avgLastHits
													})}
												/>
											{:else}
												<span class="text-sm text-zinc-500">-</span>
											{/if}
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</section>

			<section class="rounded-md border border-border bg-card p-4">
				<h2 class="mb-3 text-base font-semibold text-zinc-100">Duration Bands</h2>
				<div class="max-h-80 overflow-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
					<Table.Root>
						<Table.Header class="bg-zinc-950/70">
							<Table.Row class="border-zinc-800 hover:bg-transparent">
								<Table.Head class="h-9 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Band</Table.Head>
								<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Matches</Table.Head>
								<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">W/L</Table.Head>
								<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">WR</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.durationBands as band}
								<Table.Row class="border-zinc-900 transition-colors hover:bg-zinc-900/70">
									<Table.Cell class="px-2 py-2 font-medium text-zinc-100">{band.label}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{band.matches}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{band.wins}/{band.losses}</Table.Cell>
									<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{formatPercent(band.winRate)}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</section>
		</div>

		<section class="rounded-md border border-border bg-card p-4">
			<h2 class="mb-3 text-base font-semibold text-zinc-100">Hero Records</h2>
			<div class="overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
				<Table.Root>
					<Table.Header class="bg-zinc-950/70">
						<Table.Row class="border-zinc-800 hover:bg-transparent">
							<Table.Head class="h-9 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Record</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Value</Table.Head>
							<Table.Head class="h-9 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Player</Table.Head>
							<Table.Head class="h-9 px-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">Role</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Date</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.records as record}
							<Table.Row class="relative border-zinc-900 transition-colors hover:bg-zinc-900/70">
								<Table.Cell class="px-2 py-2 font-medium text-zinc-100">
									<MatchModal matchId={record.match.matchId} sequenceNum={record.match.sequenceNumber ?? undefined}>
										<span class="absolute inset-0 z-10" aria-label={`Open match ${record.match.matchId}`}></span>
									</MatchModal>
									<span class="pointer-events-none relative z-20">{record.title}</span>
								</Table.Cell>
								<Table.Cell class="relative z-20 px-2 py-2">
									<div class="flex justify-end">
										{#if record.metric === 'Impact'}
											<RatingChip
												data={makeRatingChipData({
													impact: record.match.impact,
													role: record.match.role,
													duration: record.match.duration,
													kills: record.match.kills,
													deaths: record.match.deaths,
													assists: record.match.assists,
													lastHits: record.match.lastHits ?? 0
												})}
											/>
										{:else}
											<span class="pointer-events-none text-lg font-semibold tabular-nums text-zinc-100">
												{formatNumber(record.value)}
											</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-zinc-300">{record.match.username}</Table.Cell>
								<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-center">
									<img src={getRoleIcon(record.match.role)} alt="" class="mx-auto h-7 w-7" />
								</Table.Cell>
								<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right text-xs text-zinc-400">
									{formatDate(record.match.startTime)}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</section>

		<section class="rounded-md border border-border bg-card p-4">
			<div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 class="text-base font-semibold text-zinc-100">Matches</h2>
					<div class="mt-0.5 text-xs text-zinc-400">
						Showing {matchPageStart}-{matchPageEnd} of {data.matches.length} matches
					</div>
				</div>
				<div class="flex items-center gap-3">
					<button
						class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 transition-colors duration-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-600"
						disabled={matchPage === 1}
						onclick={decrementMatchPage}
					>
						<ArrowLeft class="h-4 w-4" />
					</button>
					<div class="min-w-16 text-center text-sm tabular-nums text-zinc-300">
						{matchPage} / {totalMatchPages}
					</div>
					<button
						class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 transition-colors duration-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-600"
						disabled={matchPage === totalMatchPages}
						onclick={incrementMatchPage}
					>
						<ArrowRight class="h-4 w-4" />
					</button>
				</div>
			</div>
			<div class="overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
				<Table.Root>
					<Table.Header class="bg-zinc-950/70">
						<Table.Row class="border-zinc-800 hover:bg-transparent">
							<Table.Head class="h-9 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Date</Table.Head>
							<Table.Head class="h-9 min-w-32 px-2 text-[11px] uppercase tracking-wide text-zinc-400">Player</Table.Head>
							<Table.Head class="h-9 px-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">Result</Table.Head>
							<Table.Head class="h-9 px-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">Role</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">K/D/A</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Impact</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">GPM</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">XPM</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Duration</Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Mode</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each paginatedMatches as match}
							<Table.Row class="relative border-zinc-900 transition-colors hover:bg-zinc-900/70">
								<Table.Cell class="px-2 py-2 text-xs text-zinc-400">
									<MatchModal matchId={match.matchId} sequenceNum={match.sequenceNumber ?? undefined}>
										<span class="absolute inset-0 z-10" aria-label={`Open match ${match.matchId}`}></span>
									</MatchModal>
									<span class="pointer-events-none relative z-20">{formatDate(match.startTime)}</span>
								</Table.Cell>
								<Table.Cell class="px-2 py-2">
									<button
										onclick={() => goto(`/player/${match.playerId}`)}
										class="relative z-20 inline-flex max-w-36 items-center gap-1 truncate text-left font-medium text-zinc-100 transition-colors hover:text-sky-300"
									>
										<span class="truncate">{match.username}</span>
										{#if match.smurf}
											<VenetianMask class="h-4 w-4 shrink-0" aria-hidden="true" />
										{/if}
									</button>
								</Table.Cell>
								<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-center">
									<span class="rounded-sm border px-2 py-1 text-xs font-semibold {getResultClass(match)}">
										{match.team === match.winner ? 'Win' : 'Loss'}
									</span>
								</Table.Cell>
								<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-center">
									<img src={getRoleIcon(match.role)} alt={getRoleName(match.role)} class="mx-auto h-7 w-7" />
								</Table.Cell>
								<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-zinc-300">
									<span class="text-green-400">{match.kills}</span>
									<span class="text-zinc-600">/</span>
									<span class="text-red-400">{match.deaths}</span>
									<span class="text-zinc-600">/</span>
									<span class="text-cyan-300">{match.assists}</span>
								</Table.Cell>
								<Table.Cell class="relative z-20 px-2 py-2">
									<div class="flex justify-end">
										<RatingChip
											data={makeRatingChipData({
												impact: match.impact,
												role: match.role,
												duration: match.duration,
												kills: match.kills,
												deaths: match.deaths,
												assists: match.assists,
												lastHits: match.lastHits ?? 0
											})}
										/>
									</div>
								</Table.Cell>
								<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-zinc-300">
									{formatNumber(match.gpm)}
								</Table.Cell>
								<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-zinc-300">
									{formatNumber(match.xpm)}
								</Table.Cell>
								<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right tabular-nums text-zinc-300">
									{toTime(match.duration)}
								</Table.Cell>
								<Table.Cell class="pointer-events-none relative z-20 px-2 py-2 text-right text-xs text-zinc-400">
									{getLobbyType(match.lobby)} · {getGameMode(match.gameMode)}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
			{#if totalMatchPages > 1}
				<div class="mt-3 flex items-center justify-center gap-3">
					<button
						class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 transition-colors duration-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-600"
						disabled={matchPage === 1}
						onclick={decrementMatchPage}
					>
						<ArrowLeft class="h-4 w-4" />
					</button>
					<div class="min-w-16 text-center text-sm tabular-nums text-zinc-300">
						{matchPage} / {totalMatchPages}
					</div>
					<button
						class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 transition-colors duration-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-600"
						disabled={matchPage === totalMatchPages}
						onclick={incrementMatchPage}
					>
						<ArrowRight class="h-4 w-4" />
					</button>
				</div>
			{/if}
		</section>
	{/if}
</div>
