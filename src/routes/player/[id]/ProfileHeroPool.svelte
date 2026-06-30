<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import DashboardSortableTable from '$lib/components/stats/DashboardSortableTable.svelte';
	import { calcImpact } from '$lib/functions';
	import {
		Activity,
		Crosshair,
		Flame,
		HeartPulse,
		ShieldAlert,
		ShieldCheck,
		Sparkles,
		Star,
		Swords,
		Trophy,
		Users,
		Zap
	} from 'lucide-svelte';

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

	type Player = {
		username: string;
	};

	type SpotlightIcon = typeof Trophy;

	type Props = {
		data: {
			player: Player;
			recentHeroPoolStats: Promise<HeroStat[]> | HeroStat[];
			recentHeroPoolMatchLimit: number;
			heroPoolMatchLimitOptions: number[];
		};
	};

	let { data }: Props = $props();

	const minMatches = (sampleSize: number) => Math.max(5, Math.round(sampleSize * 0.02));
	const eligible = (heroes: HeroStat[], sampleSize: number) =>
		heroes.filter((hero) => hero.matches >= minMatches(sampleSize));

	const formatNumber = (value: number | null | undefined, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value ?? 0);

	const getWins = (hero: HeroStat) => hero.radiantWins + hero.direWins;
	const getLosses = (hero: HeroStat) => Math.max(0, hero.matches - getWins(hero));
	const getWinRate = (hero: HeroStat) => (hero.matches > 0 ? (getWins(hero) / hero.matches) * 100 : 0);
	const getPickRate = (hero: HeroStat, sampleSize: number) =>
		sampleSize > 0 ? (hero.matches / sampleSize) * 100 : 0;
	const getKda = (hero: HeroStat) =>
		(hero.avgKills + hero.avgAssists) / Math.max(hero.avgDeaths, 1);
	const getImpactScore = (hero: HeroStat) => Math.min(100, (hero.avgImpact / 150) * 100);
	const getLatestStartTime = (hero: HeroStat) => hero.latestStartTime ?? 0;
	const getRecentHeroes = (heroes: HeroStat[]) =>
		heroes.filter((hero) => hero.hero && hero.matches > 0);
	const getSampleSize = (heroes: HeroStat[]) =>
		heroes.reduce((total, hero) => total + hero.matches, 0);
	const getSignatureScore = (hero: HeroStat, sampleSize: number) =>
		getPickRate(hero, sampleSize) * 0.65 +
		getWinRate(hero) * 0.2 +
		getImpactScore(hero) * 0.15;
	const getTag = (hero: HeroStat, sampleSize: number) => {
		const pickRate = getPickRate(hero, sampleSize);
		const winRate = getWinRate(hero);

		if (pickRate >= 18 && winRate >= 50) return 'Signature';
		if (pickRate >= 16) return 'Comfort';
		if (hero.matches <= 4 && hero.matches >= 2 && winRate >= 50) return 'Pocket';
		if (hero.avgImpact >= 100) return 'Damage';
		if (hero.matches >= 3 && winRate < 35) return 'Danger';
		return 'Rotation';
	};
	const getTagClass = (tag: string) =>
		({
			Signature: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
			Comfort: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
			Pocket: 'border-purple-500/30 bg-purple-500/10 text-purple-200',
			Damage: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
			Danger: 'border-red-500/30 bg-red-500/10 text-red-200',
			Rotation: 'border-zinc-700 bg-zinc-950/40 text-zinc-300'
		})[tag] ?? 'border-zinc-700 bg-zinc-950/40 text-zinc-300';
	const getTagDescription = (tag: string) =>
		({
			Signature: 'High pick rate with a strong win rate',
			Comfort: 'Frequently picked regardless of results',
			Pocket: 'Rarely picked but wins when it counts',
			Damage: 'High average impact output',
			Danger: 'Picked often but struggling to win',
			Rotation: 'Part of the general hero rotation'
		})[tag] ?? '';
	const getImpactRatingClass = (rating: string) =>
		({
			S: 'bg-yellow-400/30 text-yellow-300',
			A: 'bg-green-500/30 text-green-300',
			B: 'bg-blue-500/30 text-blue-300',
			C: 'bg-purple-500/30 text-purple-300',
			D: 'bg-orange-500/30 text-orange-300',
			F: 'bg-red-500/30 text-red-300'
		})[rating.charAt(0)] ?? 'bg-zinc-700/40 text-zinc-300';
	const getSignatureHero = (heroes: HeroStat[], sampleSize: number) =>
		eligible(heroes, sampleSize).sort((a, b) => getSignatureScore(b, sampleSize) - getSignatureScore(a, sampleSize))[0] ?? null;
	const getComfortHero = (heroes: HeroStat[], sampleSize: number) =>
		eligible(heroes, sampleSize).sort((a, b) => b.matches - a.matches)[0] ?? null;
	const getHotHandHero = (heroes: HeroStat[], sampleSize: number) =>
		eligible(heroes, sampleSize).sort((a, b) => getWinRate(b) - getWinRate(a) || b.matches - a.matches)[0] ?? null;
	const getDamageHero = (heroes: HeroStat[], sampleSize: number) =>
		eligible(heroes, sampleSize).sort((a, b) => b.avgImpact - a.avgImpact)[0] ?? null;
	const getFinisherHero = (heroes: HeroStat[], sampleSize: number) =>
		eligible(heroes, sampleSize).sort((a, b) => b.avgKills - a.avgKills || b.avgImpact - a.avgImpact)[0] ?? null;
	const getPlaymakerHero = (heroes: HeroStat[], sampleSize: number) =>
		eligible(heroes, sampleSize).sort((a, b) => b.avgAssists - a.avgAssists || getKda(b) - getKda(a))[0] ?? null;
	const getSurvivorHero = (heroes: HeroStat[], sampleSize: number) =>
		eligible(heroes, sampleSize).sort((a, b) => a.avgDeaths - b.avgDeaths || getKda(b) - getKda(a))[0] ?? null;
	const getCleanHero = (heroes: HeroStat[], sampleSize: number) =>
		eligible(heroes, sampleSize).sort((a, b) => getKda(b) - getKda(a))[0] ?? null;
	const getReliableWinnerHero = (heroes: HeroStat[], sampleSize: number) =>
		eligible(heroes, sampleSize).sort((a, b) => getWinRate(b) - getWinRate(a) || b.matches - a.matches)[0] ?? null;
	const getPocketHero = (heroes: HeroStat[], sampleSize: number) =>
		heroes
			.filter((hero) => hero.matches >= 2 && hero.matches < minMatches(sampleSize) && getPickRate(hero, sampleSize) <= 12)
			.sort((a, b) => getWinRate(b) - getWinRate(a) || b.avgImpact - a.avgImpact)[0] ?? null;
	const getFreshHero = (heroes: HeroStat[]) =>
		heroes.slice().sort((a, b) => getLatestStartTime(b) - getLatestStartTime(a))[0] ?? null;
	const getDangerHero = (heroes: HeroStat[], sampleSize: number) =>
		eligible(heroes, sampleSize).sort((a, b) => getWinRate(a) - getWinRate(b) || b.matches - a.matches)[0] ?? null;
</script>

{#snippet heroSpotlight(title: string, hero: HeroStat | null, icon: SpotlightIcon, sampleSize: number, note: string)}
	<Card.Root class="overflow-hidden rounded-md border-border bg-card shadow-none">
		{#if hero}
			{@const Icon = icon}
			{@const tag = getTag(hero, sampleSize)}
			{@const impactRating = calcImpact(hero.avgImpact)}
			<div class="relative min-h-40">
				<img
					src={hero.hero.img}
					alt={hero.hero.name}
					class="absolute inset-0 h-full w-full object-cover opacity-45"
				/>
				<div class="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/35"></div>
				<div class="relative flex h-full min-h-40 flex-col justify-between p-4">
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
							<Icon class="h-4 w-4" />
							<span>{title}</span>
						</div>
						<Tooltip.Root>
							<Tooltip.Trigger class="rounded-sm border px-2 py-1 text-xs font-medium outline-none {getTagClass(tag)}">
								{tag}
							</Tooltip.Trigger>
							<Tooltip.Content class="text-xs">
								{getTagDescription(tag)}
							</Tooltip.Content>
						</Tooltip.Root>
					</div>
					<div>
						<a
							href={`/heroes/${hero.hero.id}`}
							class="text-xl font-semibold text-zinc-100 transition-colors hover:text-sky-300"
						>
							{hero.hero.name}
						</a>
						<div class="mt-1 text-xs text-zinc-400">{note}</div>
						<div class="mt-3 grid grid-cols-2 gap-2 text-xs">
							<div class="rounded-sm border border-zinc-800 bg-zinc-950/45 px-2 py-1">
								<div class="text-zinc-500">Pick rate</div>
								<div class="font-medium text-zinc-100">{formatNumber(getPickRate(hero, sampleSize), 1)}%</div>
							</div>
							<div class="rounded-sm border border-zinc-800 bg-zinc-950/45 px-2 py-1">
								<div class="text-zinc-500">Record</div>
								<div class="font-medium tabular-nums">
									<span class="text-green-400">{getWins(hero)}</span>
									<span class="text-zinc-600">/</span>
									<span class="text-red-400">{getLosses(hero)}</span>
									<span class="ml-1 text-zinc-400">{formatNumber(getWinRate(hero), 0)}%</span>
								</div>
							</div>
							<div class="rounded-sm border border-zinc-800 bg-zinc-950/45 px-2 py-1">
								<div class="text-zinc-500">KDA</div>
								<div class="font-medium tabular-nums text-zinc-100">{formatNumber(getKda(hero), 2)}</div>
							</div>
							<div class="rounded-sm border border-zinc-800 bg-zinc-950/45 px-2 py-1">
								<div class="text-zinc-500">Impact</div>
								<div
									class="mt-0.5 inline-flex min-w-10 justify-center rounded-md px-2 py-0.5 text-center font-display text-sm font-semibold tabular-nums {getImpactRatingClass(
										impactRating
									)}"
								>
									{impactRating}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<Card.Content class="flex min-h-40 items-center justify-center p-4 text-sm text-zinc-500">
				Not enough recent data yet.
			</Card.Content>
		{/if}
	</Card.Root>
{/snippet}

<div class="flex w-full min-w-0 flex-col gap-4">
	{#await data.recentHeroPoolStats}
		<Card.Root class="rounded-md border-border bg-card shadow-none">
			<Card.Content class="flex min-h-40 items-center justify-center p-6 text-sm text-zinc-400">
				Loading hero pool...
			</Card.Content>
		</Card.Root>
	{:then heroStats}
		{@const heroes = getRecentHeroes(heroStats ?? [])}
		{@const sampleSize = getSampleSize(heroes)}
		{@const signatureHero = getSignatureHero(heroes, sampleSize)}
		{@const comfortHero = getComfortHero(heroes, sampleSize)}
		{@const hotHandHero = getHotHandHero(heroes, sampleSize)}
		{@const damageHero = getDamageHero(heroes, sampleSize)}
		{@const finisherHero = getFinisherHero(heroes, sampleSize)}
		{@const playmakerHero = getPlaymakerHero(heroes, sampleSize)}
		{@const survivorHero = getSurvivorHero(heroes, sampleSize)}
		{@const cleanHero = getCleanHero(heroes, sampleSize)}
		{@const reliableWinnerHero = getReliableWinnerHero(heroes, sampleSize)}
		{@const pocketHero = getPocketHero(heroes, sampleSize)}
		{@const freshHero = getFreshHero(heroes)}
		{@const dangerHero = getDangerHero(heroes, sampleSize)}

		<section class="rounded-md border border-border bg-card p-4">
			<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<div class="text-sm text-zinc-400">Hero Pool</div>
					<h2 class="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">
						{data.player.username}'s Draft Sheet
					</h2>
					<div class="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
						<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
							Last {sampleSize || data.recentHeroPoolMatchLimit} games sampled
						</span>
						<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
							{heroes.length} heroes in rotation
						</span>
						{#if signatureHero}
							<span class="rounded-sm border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-yellow-200">
								Signature weighs pick rate, form, and impact
							</span>
						{/if}
					</div>
				</div>
				<div class="flex items-center gap-2 text-xs text-zinc-400">
					<span>Sample size</span>
					<div class="flex gap-1">
						{#each data.heroPoolMatchLimitOptions as option}
							<a
								href="?tab=hero-pool&pool={option}"
								class="rounded-sm border px-2 py-1 transition-colors {data.recentHeroPoolMatchLimit === option
									? 'border-sky-500/40 bg-sky-500/15 text-sky-200'
									: 'border-zinc-700 bg-zinc-950/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'}"
							>
								{option}
							</a>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{@render heroSpotlight('Signature Pick', signatureHero, Trophy, sampleSize, 'Most draft-defining recent hero.')}
			{@render heroSpotlight('Comfort Pick', comfortHero, Star, sampleSize, 'The hero they keep coming back to.')}
			{@render heroSpotlight('Hot Hand', hotHandHero, Flame, sampleSize, 'Winning most often in the recent sample.')}
			{@render heroSpotlight('Damage Lab', damageHero, Crosshair, sampleSize, 'Highest average impact output.')}
			{@render heroSpotlight('Finisher', finisherHero, Swords, sampleSize, 'Highest average kills on repeat picks.')}
			{@render heroSpotlight('Playmaker', playmakerHero, Users, sampleSize, 'Most assists flowing through the hero.')}
			{@render heroSpotlight('Survivor', survivorHero, ShieldCheck, sampleSize, 'Lowest average deaths in repeat picks.')}
			{@render heroSpotlight('Clean Game', cleanHero, Activity, sampleSize, 'Best KDA profile in repeat picks.')}
			{@render heroSpotlight('Reliable Winner', reliableWinnerHero, HeartPulse, sampleSize, 'Best win rate with at least five games.')}
			{@render heroSpotlight('Pocket Pick', pocketHero, Sparkles, sampleSize, 'Lower pick rate, still doing work.')}
			{@render heroSpotlight('Latest Pick', freshHero, Zap, sampleSize, 'Most recent hero in the sample.')}
			{@render heroSpotlight('Needs Work', dangerHero, ShieldAlert, sampleSize, 'The spicy problem child.')}
		</div>

		<Card.Root class="rounded-md border-border bg-card shadow-none">
			<Card.Header class="px-4 pt-4 pb-2">
				<Card.Title class="text-base">Full Hero Pool</Card.Title>
				<Card.Description class="text-xs text-zinc-400">All heroes played in the last {sampleSize || data.recentHeroPoolMatchLimit} games.</Card.Description>
			</Card.Header>
			<Card.Content class="px-4 pt-3 pb-4">
				<DashboardSortableTable
					rows={heroes.map((hero) => {
						const wins = getWins(hero);
						const losses = getLosses(hero);
						return {
							hero: hero.hero.id,
							name: hero.hero.name,
							img: hero.hero.img,
							role: hero.role ?? 0,
							matches: hero.matches,
							wins,
							losses,
							winRate: hero.matches > 0 ? (wins / hero.matches) * 100 : 0,
							pickRate: getPickRate(hero, sampleSize),
							kda: getKda(hero),
							impact: hero.avgImpact,
							tag: getTag(hero, sampleSize)
						};
					})}
					initialSort={[{ id: 'matches', desc: true }]}
					columns={[
						{ id: 'hero', label: 'Hero', minWidth: '10rem' },
						{ id: 'role', label: 'Role' },
						{ id: 'tag', label: 'Tag' },
						{ id: 'matches', label: 'Matches', align: 'right' },
						{ id: 'pickRate', label: 'Pick %', align: 'right' },
						{ id: 'wl', label: 'W/L', minWidth: '7rem' },
						{ id: 'winRate', label: 'WR', align: 'right' },
						{ id: 'kda', label: 'KDA', align: 'right' },
						{ id: 'impact', label: 'Impact', align: 'right' }
					]}
				/>
			</Card.Content>
		</Card.Root>
	{:catch}
		<Card.Root class="rounded-md border-border bg-card shadow-none">
			<Card.Content class="flex min-h-40 items-center justify-center p-6 text-sm text-zinc-400">
				Hero pool could not be loaded.
			</Card.Content>
		</Card.Root>
	{/await}
</div>
