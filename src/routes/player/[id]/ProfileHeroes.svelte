<script lang="ts">
	import dayjs from 'dayjs';
	import { calcImpact, getRoleIcon, getRoleName } from '$lib/functions';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { ArrowUpDown, HelpCircle, Search } from 'lucide-svelte';

	type HeroStat = {
		hero: DotaAsset;
		matches: number;
		radiantWins: number;
		direWins: number;
		avgImpact: number;
		avgKills: number;
		avgDeaths: number;
		avgAssists: number;
		latestStartTime?: number;
		role?: number;
	};

	type HeroMetadata = DotaAsset & {
		localized_name?: string;
		primary_attr?: string;
		attack_type?: string;
		roles?: string[];
	};

	type PlayerRanking = {
		playerId: number;
		username: string;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		avgKills: number;
		avgDeaths: number;
		avgAssists: number;
		kda: number;
		avgImpact: number;
		avgGpm: number;
		avgXpm: number;
		avgLastHits: number;
		avgHeroDamage: number;
		avgTowerDamage: number;
		primaryRole: number;
		score: number;
		confidence: string;
		lastPlayed: number;
	};

	type LeaderboardEntry = Pick<
		PlayerRanking,
		'playerId' | 'username' | 'matches' | 'wins' | 'losses' | 'winRate' | 'score'
	>;

	type HeroRanking = {
		heroId: number;
		rank: number | null;
		totalRankedPlayers: number;
		player: PlayerRanking | null;
		rankings: LeaderboardEntry[];
	};

	type HeroRow = HeroStat & {
		metadata: HeroMetadata;
		ranking: HeroRanking | null;
		wins: number;
		losses: number;
		winRate: number;
		kda: number;
	};

	type SortKey = 'rank' | 'matches' | 'winRate' | 'kda' | 'impact' | 'lastPlayed';

	type Props = {
		data: {
			player: { id: number; username: string };
			heroList: HeroMetadata[];
			allTimeHeroStats: Promise<HeroStat[]> | HeroStat[];
			recentHeroPoolStats: Promise<HeroStat[]> | HeroStat[];
			playerHeroRankings: Promise<HeroRanking[]> | HeroRanking[];
			recentHeroPoolMatchLimit: number;
			heroPoolMatchLimitOptions: number[];
		};
	};

	let { data }: Props = $props();
	let searchQuery = $state('');
	let sortKey = $state<SortKey>('matches');
	let sortDescending = $state(true);

	const formatNumber = (value: number | null | undefined, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value ?? 0);

	const getWins = (hero: HeroStat) => hero.radiantWins + hero.direWins;
	const getLosses = (hero: HeroStat) => Math.max(0, hero.matches - getWins(hero));
	const getWinRate = (hero: HeroStat) => (hero.matches > 0 ? (getWins(hero) / hero.matches) * 100 : 0);
	const getKda = (hero: HeroStat) =>
		(hero.avgKills + hero.avgAssists) / Math.max(hero.avgDeaths, 1);
	const getSampleSize = (heroes: HeroStat[]) =>
		heroes.reduce((total, hero) => total + hero.matches, 0);
	const getPickRate = (hero: HeroStat, sampleSize: number) =>
		sampleSize > 0 ? (hero.matches / sampleSize) * 100 : 0;
	const getSignatureHero = (heroes: HeroStat[], sampleSize: number) =>
		heroes
			.filter((hero) => hero.hero && hero.matches >= Math.max(3, Math.round(sampleSize * 0.02)))
			.slice()
			.sort((a, b) => {
				const scoreA = getPickRate(a, sampleSize) * 0.65 + getWinRate(a) * 0.2 + Math.min(100, (a.avgImpact / 150) * 100) * 0.15;
				const scoreB = getPickRate(b, sampleSize) * 0.65 + getWinRate(b) * 0.2 + Math.min(100, (b.avgImpact / 150) * 100) * 0.15;
				return scoreB - scoreA;
			})[0] ?? null;

	const getHeroRows = (heroStats: HeroStat[], rankingData: HeroRanking[]) => {
		const metadataById = new Map(data.heroList.map((hero) => [hero.id, hero]));
		const rankingById = new Map(rankingData.map((ranking) => [ranking.heroId, ranking]));

		return heroStats
			.filter((hero) => hero.hero && hero.matches > 0)
			.map((hero): HeroRow => ({
				...hero,
				metadata: metadataById.get(hero.hero.id) ?? hero.hero,
				ranking: rankingById.get(hero.hero.id) ?? null,
				wins: getWins(hero),
				losses: getLosses(hero),
				winRate: getWinRate(hero),
				kda: getKda(hero)
			}));
	};

	const getSortValue = (hero: HeroRow, key: SortKey) => {
		if (key === 'rank') return hero.ranking?.rank ?? Number.MAX_SAFE_INTEGER;
		if (key === 'matches') return hero.matches;
		if (key === 'winRate') return hero.winRate;
		if (key === 'kda') return hero.kda;
		if (key === 'impact') return hero.avgImpact;
		return hero.ranking?.player?.lastPlayed ?? 0;
	};

	const getVisibleRows = (rows: HeroRow[]) => {
		const query = searchQuery.trim().toLowerCase();
		return rows
			.filter((hero) => {
				if (!query) return true;
				return [hero.hero.name, hero.metadata.localized_name, ...(hero.metadata.roles ?? [])]
					.filter(Boolean)
					.some((value) => String(value).toLowerCase().includes(query));
			})
			.slice()
			.sort((a, b) => {
				const valueA = getSortValue(a, sortKey);
				const valueB = getSortValue(b, sortKey);
				return sortDescending ? valueB - valueA : valueA - valueB;
			});
	};

	const setSort = (key: SortKey) => {
		if (sortKey === key) {
			sortDescending = !sortDescending;
			return;
		}
		sortKey = key;
		sortDescending = key !== 'rank';
	};

	const getAttributeLabel = (attribute?: string) =>
		({ str: 'Strength', agi: 'Agility', int: 'Intelligence', all: 'Universal' })[attribute ?? ''] ?? 'Unknown';

	const getImpactClass = (impact: number) =>
		({
			S: 'bg-yellow-400/30 text-yellow-300',
			A: 'bg-green-500/30 text-green-300',
			B: 'bg-blue-500/30 text-blue-300',
			C: 'bg-purple-500/30 text-purple-300',
			D: 'bg-orange-500/30 text-orange-300',
			F: 'bg-red-500/30 text-red-300'
		})[calcImpact(impact).charAt(0)] ?? 'bg-zinc-800 text-zinc-300';

	const formatDate = (timestamp?: number) =>
		timestamp ? dayjs(timestamp * 1000).format('D MMM YYYY') : 'Not available';
</script>

<div class="flex w-full min-w-0 flex-col gap-4">
	{#await Promise.all([data.allTimeHeroStats, data.playerHeroRankings, data.recentHeroPoolStats])}
		<section class="rounded-md border border-border bg-card p-4" aria-label="Loading hero statistics">
			<div class="h-5 w-40 animate-pulse rounded-sm bg-zinc-800"></div>
			<div class="mt-3 h-9 w-full max-w-md animate-pulse rounded-sm bg-zinc-900"></div>
			<div class="mt-6 space-y-2">
				{#each Array(6) as _}
					<div class="h-12 animate-pulse rounded-sm bg-zinc-900/70"></div>
				{/each}
			</div>
		</section>
	{:then [heroStats, rankingData, recentStats]}
		{@const rows = getHeroRows(heroStats ?? [], rankingData ?? [])}
		{@const visibleRows = getVisibleRows(rows)}
		{@const totalMatches = rows.reduce((total, hero) => total + hero.matches, 0)}
		{@const rankedHeroes = rows.filter((hero) => hero.ranking?.rank !== null).length}
		{@const recentHeroes = (recentStats ?? []).filter((hero) => hero.hero && hero.matches > 0)}
		{@const recentSampleSize = getSampleSize(recentHeroes)}
		{@const signatureHero = getSignatureHero(recentHeroes, recentSampleSize)}

		<section class="overflow-hidden rounded-md border border-border bg-card">
			<div class="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<div class="text-sm text-zinc-400">Hero record</div>
					<h2 class="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">
						{data.player.username}'s Heroes
					</h2>
					<p class="mt-1 max-w-2xl text-sm text-zinc-400">
						All-time performance and placement against every tracked player.
					</p>
				</div>
				<div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
					<div><span class="font-semibold tabular-nums text-zinc-100">{rows.length}</span> <span class="text-zinc-500">heroes</span></div>
					<div><span class="font-semibold tabular-nums text-zinc-100">{totalMatches}</span> <span class="text-zinc-500">matches</span></div>
					<div><span class="font-semibold tabular-nums text-zinc-100">{rankedHeroes}</span> <span class="text-zinc-500">ranked</span></div>
				</div>
			</div>

			{#if signatureHero}
				<div class="grid border-t border-zinc-800 bg-zinc-950/25 md:grid-cols-[16rem_minmax(0,1fr)]">
					<a href={`/heroes/${signatureHero.hero.id}`} class="group relative min-h-32 overflow-hidden border-b border-zinc-800 md:border-b-0 md:border-r">
						<img src={signatureHero.hero.img} alt={signatureHero.hero.name} class="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-200 ease-out group-hover:scale-[1.03]" />
						<div class="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 to-zinc-950/30"></div>
						<div class="relative flex h-full min-h-32 flex-col justify-end p-4">
							<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Recent signature</div>
							<div class="mt-1 text-lg font-semibold text-zinc-100 group-hover:text-sky-300">{signatureHero.hero.name}</div>
						</div>
					</a>
					<div class="flex flex-col justify-between gap-4 p-4">
						<div class="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
							<div><div class="text-xs text-zinc-500">Recent matches</div><div class="mt-1 font-medium tabular-nums text-zinc-100">{signatureHero.matches}</div></div>
							<div><div class="text-xs text-zinc-500">Pick rate</div><div class="mt-1 font-medium tabular-nums text-zinc-100">{formatNumber(getPickRate(signatureHero, recentSampleSize), 1)}%</div></div>
							<div><div class="text-xs text-zinc-500">Win rate</div><div class="mt-1 font-medium tabular-nums text-zinc-100">{formatNumber(getWinRate(signatureHero), 1)}%</div></div>
							<div><div class="text-xs text-zinc-500">Avg impact</div><div class="mt-1 font-medium tabular-nums text-zinc-100">{formatNumber(signatureHero.avgImpact)}</div></div>
						</div>
						<div class="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
							<span>Recent read from the last {recentSampleSize || data.recentHeroPoolMatchLimit} matches</span>
							<div class="flex items-center gap-1" aria-label="Recent sample size">
								{#each data.heroPoolMatchLimitOptions as option}
									<a href="?tab=heroes&pool={option}" class="rounded-sm border px-2 py-1 transition-colors {data.recentHeroPoolMatchLimit === option ? 'border-sky-500/40 bg-sky-500/15 text-sky-200' : 'border-zinc-700 bg-zinc-950/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'}">{option}</a>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</section>

		<section class="rounded-md border border-border bg-card">
			<div class="flex flex-col gap-3 border-b border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 class="text-base font-semibold text-zinc-100">All heroes</h3>
					<div class="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
						<span>{visibleRows.length} shown</span>
						<Tooltip.Root>
							<Tooltip.Trigger class="rounded-sm outline-none hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-ring"><HelpCircle class="h-3.5 w-3.5" /></Tooltip.Trigger>
							<Tooltip.Content class="max-w-80 text-xs">Hero ranks use the same score as each hero analysis page. A player needs 10 matches on that hero to qualify.</Tooltip.Content>
						</Tooltip.Root>
					</div>
				</div>
				<label class="relative w-full sm:w-72">
					<span class="sr-only">Search heroes</span>
					<Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
					<input bind:value={searchQuery} type="search" placeholder="Search hero or role" class="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 pl-9 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-ring" />
				</label>
			</div>

			<div class="overflow-x-auto">
				<Table.Root class="min-w-[1120px]">
					<Table.Header class="bg-zinc-950/60">
						<Table.Row class="border-zinc-800 hover:bg-transparent">
							<Table.Head class="h-9 min-w-52 px-3 text-[11px] uppercase tracking-wide text-zinc-400">Hero</Table.Head>
							<Table.Head class="h-9 w-24 px-2 text-center"><button onclick={() => setSort('rank')} class="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-zinc-400 hover:text-zinc-100">Rank <ArrowUpDown class="h-3 w-3" /></button></Table.Head>
							<Table.Head class="h-9 w-16 px-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">Role</Table.Head>
							<Table.Head class="h-9 px-2 text-right"><button onclick={() => setSort('matches')} class="ml-auto inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-zinc-400 hover:text-zinc-100">Matches <ArrowUpDown class="h-3 w-3" /></button></Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">W/L</Table.Head>
							<Table.Head class="h-9 px-2 text-right"><button onclick={() => setSort('winRate')} class="ml-auto inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-zinc-400 hover:text-zinc-100">WR <ArrowUpDown class="h-3 w-3" /></button></Table.Head>
							<Table.Head class="h-9 px-2 text-right"><button onclick={() => setSort('kda')} class="ml-auto inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-zinc-400 hover:text-zinc-100">KDA <ArrowUpDown class="h-3 w-3" /></button></Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">Avg K / D / A</Table.Head>
							<Table.Head class="h-9 px-2 text-right"><button onclick={() => setSort('impact')} class="ml-auto inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-zinc-400 hover:text-zinc-100">Impact <ArrowUpDown class="h-3 w-3" /></button></Table.Head>
							<Table.Head class="h-9 px-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">GPM</Table.Head>
							<Table.Head class="h-9 px-3 text-right"><button onclick={() => setSort('lastPlayed')} class="ml-auto inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-zinc-400 hover:text-zinc-100">Last played <ArrowUpDown class="h-3 w-3" /></button></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each visibleRows as hero (hero.hero.id)}
							<Table.Row class="border-zinc-900 transition-colors hover:bg-zinc-900/70">
								<Table.Cell class="px-3 py-2">
									<a href={`/heroes/${hero.hero.id}`} class="group flex min-w-0 items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
										<img src={hero.hero.img} alt="" class="h-10 w-16 shrink-0 rounded-sm border border-zinc-700 object-cover" />
										<span class="min-w-0"><span class="block truncate font-medium text-zinc-100 group-hover:text-sky-300">{hero.hero.name}</span><span class="mt-0.5 block truncate text-xs text-zinc-500">{getAttributeLabel(hero.metadata.primary_attr)} · {(hero.metadata.roles ?? []).slice(0, 2).join(' / ') || hero.metadata.attack_type || 'Hero'}</span></span>
									</a>
								</Table.Cell>
								<Table.Cell class="px-2 py-2 text-center">
									<HoverCard.Root openDelay={150} closeDelay={100}>
										<HoverCard.Trigger>
											{#snippet child({ props })}
												<button
													{...props}
													type="button"
													class="inline-flex rounded-sm border border-zinc-700 bg-zinc-950/70 px-2 py-1 text-xs font-semibold tabular-nums text-zinc-200 underline decoration-zinc-600 decoration-dotted underline-offset-4 outline-none hover:border-zinc-500 hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-ring"
													aria-label={`Show overall rankings on ${hero.hero.name}`}
												>
													{hero.ranking?.rank ? `#${hero.ranking.rank} of ${hero.ranking.totalRankedPlayers}` : 'Unranked'}
												</button>
											{/snippet}
										</HoverCard.Trigger>
										<HoverCard.Content class="w-[min(26rem,calc(100vw-2rem))] p-0" align="center">
											<div class="border-b border-zinc-800 px-3 py-2.5"><div class="font-medium text-zinc-100">Overall {hero.hero.name} rankings</div><div class="mt-0.5 text-xs text-zinc-400">Qualified players, 10 or more matches</div></div>
											<div class="grid grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] gap-2 border-b border-zinc-800/70 px-3.5 py-1.5 text-[10px] uppercase tracking-wide text-zinc-500"><span>#</span><span>Player</span><span>Games</span><span class="w-12 text-right">Score</span></div>
											<div class="max-h-72 overflow-y-auto p-1.5">
												{#each hero.ranking?.rankings ?? [] as rankedPlayer, index}
													<a href={`/player/${rankedPlayer.playerId}?tab=heroes`} class="grid grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-zinc-800 {rankedPlayer.playerId === data.player.id ? 'bg-sky-500/10' : ''}">
														<span class="text-center font-medium tabular-nums text-zinc-500">{index + 1}</span><span class="truncate font-medium text-zinc-100">{rankedPlayer.username}</span><span class="tabular-nums text-zinc-400">{rankedPlayer.matches}g</span><span class="w-12 text-right font-semibold tabular-nums text-zinc-200">{rankedPlayer.score}</span>
													</a>
												{:else}
													<div class="px-3 py-6 text-center text-sm text-zinc-500">No tracked player has qualified on this hero yet.</div>
												{/each}
											</div>
											<div class="border-t border-zinc-800 px-3 py-2 text-xs text-zinc-500"><a href={`/heroes/${hero.hero.id}`} class="text-sky-300 hover:text-sky-200">Open full hero analysis</a></div>
										</HoverCard.Content>
									</HoverCard.Root>
								</Table.Cell>
								<Table.Cell class="px-2 py-2 text-center">
									{#if hero.ranking?.player?.primaryRole}
										<Tooltip.Root><Tooltip.Trigger class="inline-flex rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><img src={getRoleIcon(hero.ranking.player.primaryRole)} alt={getRoleName(hero.ranking.player.primaryRole)} class="h-7 w-7" /></Tooltip.Trigger><Tooltip.Content class="text-xs">Most played as {getRoleName(hero.ranking.player.primaryRole)}</Tooltip.Content></Tooltip.Root>
									{:else}<span class="text-zinc-600">N/A</span>{/if}
								</Table.Cell>
								<Table.Cell class="px-2 py-2 text-right font-medium tabular-nums text-zinc-200">{hero.matches}</Table.Cell>
								<Table.Cell class="px-2 py-2 text-right tabular-nums"><span class="text-green-400">{hero.wins}</span><span class="text-zinc-600">/</span><span class="text-red-400">{hero.losses}</span></Table.Cell>
								<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{formatNumber(hero.winRate, 1)}%</Table.Cell>
								<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{formatNumber(hero.kda, 2)}</Table.Cell>
								<Table.Cell class="px-2 py-2 text-right text-xs tabular-nums"><span class="text-green-400">{formatNumber(hero.avgKills, 1)}</span><span class="text-zinc-600"> / </span><span class="text-red-400">{formatNumber(hero.avgDeaths, 1)}</span><span class="text-zinc-600"> / </span><span class="text-sky-300">{formatNumber(hero.avgAssists, 1)}</span></Table.Cell>
								<Table.Cell class="px-2 py-2 text-right"><span class="inline-flex min-w-10 justify-center rounded-md px-2 py-1 font-semibold tabular-nums {getImpactClass(hero.avgImpact)}" title={`${formatNumber(hero.avgImpact)} average impact`}>{calcImpact(hero.avgImpact)}</span></Table.Cell>
								<Table.Cell class="px-2 py-2 text-right tabular-nums text-zinc-300">{hero.ranking?.player ? formatNumber(hero.ranking.player.avgGpm) : 'N/A'}</Table.Cell>
								<Table.Cell class="px-3 py-2 text-right text-xs text-zinc-400">{formatDate(hero.ranking?.player?.lastPlayed)}</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row><Table.Cell colspan={11} class="h-28 text-center text-sm text-zinc-500">No heroes match “{searchQuery}”.</Table.Cell></Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</section>
	{:catch}
		<section class="rounded-md border border-border bg-card p-8 text-center">
			<h2 class="text-base font-semibold text-zinc-100">Hero statistics could not be loaded</h2>
			<p class="mt-1 text-sm text-zinc-400">Refresh the page to try again.</p>
		</section>
	{/await}
</div>
