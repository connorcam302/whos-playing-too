<script lang="ts">
	import { AlertTriangle, RefreshCw } from 'lucide-svelte';
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';
	import { tick } from 'svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import type {
		MatchCombatSection,
		MatchEconomySection,
		MatchOverview,
		MatchPageError,
		MatchSectionName,
		MatchTimelineSection
	} from '$lib/match-page';
	import MatchCombatTab from './MatchCombatTab.svelte';
	import MatchEconomyTab from './MatchEconomyTab.svelte';
	import MatchHeader from './MatchHeader.svelte';
	import MatchOverviewTab from './MatchOverviewTab.svelte';
	import MatchPlayersTab from './MatchPlayersTab.svelte';
	import MatchScoreboard from './MatchScoreboard.svelte';
	import MatchTimelineTab from './MatchTimelineTab.svelte';

	type MatchTab = 'overview' | 'timeline' | 'players' | 'economy' | 'combat';

	interface Props {
		data: {
			match: MatchOverview | null;
			error: MatchPageError | null;
		};
	}

	let { data }: Props = $props();

	const matchTabs: MatchTab[] = ['overview', 'timeline', 'players', 'economy', 'combat'];
	const lazyTabs: MatchSectionName[] = ['timeline', 'economy', 'combat'];

	const getUrlTab = (url: URL): MatchTab => {
		const value = url.searchParams.get('tab');
		return matchTabs.includes(value as MatchTab) ? (value as MatchTab) : 'overview';
	};

	const getUrlSlot = (url: URL, match: MatchOverview | null) => {
		const value = Number(url.searchParams.get('slot'));
		if (match?.players.some((player) => player.playerSlot === value)) return value;
		return match?.players.find((player) => player.award)?.playerSlot ?? match?.players[0]?.playerSlot ?? 0;
	};

	let selectedTab = $state<MatchTab>(getUrlTab(page.url));
	let selectedSlot = $state(0);
	let timelineData = $state<MatchTimelineSection | null>(null);
	let economyData = $state<MatchEconomySection | null>(null);
	let combatData = $state<MatchCombatSection | null>(null);
	let loading = $state<Record<MatchSectionName, boolean>>({
		timeline: false,
		economy: false,
		combat: false
	});
	let sectionErrors = $state<Record<MatchSectionName, MatchPageError | null>>({
		timeline: null,
		economy: null,
		combat: null
	});

	const hasSection = (section: MatchSectionName) => {
		if (section === 'timeline') return timelineData !== null;
		if (section === 'economy') return economyData !== null;
		return combatData !== null;
	};

	const loadSection = async (section: MatchSectionName, force = false) => {
		if (!data.match || loading[section] || (!force && hasSection(section))) return;

		loading[section] = true;
		sectionErrors[section] = null;

		try {
			const response = await fetch(`/api/matches/${data.match.id}/stratz/${section}`);
			const payload = (await response.json()) as {
				data: MatchTimelineSection | MatchEconomySection | MatchCombatSection | null;
				error: MatchPageError | null;
			};

			if (!response.ok || payload.error || !payload.data) {
				sectionErrors[section] = payload.error ?? {
					status: response.status,
					title: 'Analysis could not be loaded',
					message: 'Try this section again in a moment.',
					canRetry: true
				};
				return;
			}

			if (section === 'timeline') timelineData = payload.data as MatchTimelineSection;
			if (section === 'economy') economyData = payload.data as MatchEconomySection;
			if (section === 'combat') combatData = payload.data as MatchCombatSection;
		} catch {
			sectionErrors[section] = {
				status: 503,
				title: 'Analysis could not be reached',
				message: 'Check your connection and try this section again.',
				canRetry: true
			};
		} finally {
			loading[section] = false;
		}
	};

	const updateUrl = (tab: MatchTab, slot = selectedSlot) => {
		const nextUrl = new URL(page.url);
		if (tab === 'overview') nextUrl.searchParams.delete('tab');
		else nextUrl.searchParams.set('tab', tab);
		if (data.match?.players.some((player) => player.playerSlot === slot)) {
			nextUrl.searchParams.set('slot', slot.toString());
		}
		pushState(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, page.state);
	};

	const navigateToTab = (value: string) => {
		if (!matchTabs.includes(value as MatchTab)) return;
		const tab = value as MatchTab;
		selectedTab = tab;
		if (tab === getUrlTab(page.url)) return;
		updateUrl(tab);
	};

	const selectPlayer = (playerSlot: number) => {
		if (!data.match?.players.some((player) => player.playerSlot === playerSlot)) return;
		selectedSlot = playerSlot;
		updateUrl(selectedTab, playerSlot);
	};

	const inspectPlayer = async (playerSlot: number) => {
		selectedSlot = playerSlot;
		selectedTab = 'players';
		updateUrl('players', playerSlot);
		await tick();
		document.getElementById('match-analysis')?.scrollIntoView({ block: 'start' });
	};

	$effect(() => {
		selectedTab = getUrlTab(page.url);
		selectedSlot = getUrlSlot(page.url, data.match);
	});

	$effect(() => {
		if (lazyTabs.includes(selectedTab as MatchSectionName)) {
			void loadSection(selectedTab as MatchSectionName);
		}
	});
</script>

<svelte:head>
	<title>whos-playing | Match {page.params.id}</title>
	<meta name="description" content={`Full post-match analysis for Dota match ${page.params.id}, powered by STRATZ.`} />
</svelte:head>

{#if data.match}
	<div class="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
		<MatchHeader match={data.match} />

		<section id="match-analysis" aria-label="Match analysis" class="min-w-0 scroll-mt-2">
			<Tabs.Root
				value={selectedTab}
				onValueChange={navigateToTab}
				class="flex w-full min-w-0 flex-col items-stretch gap-3"
			>
				<Tabs.List
					aria-label="Match analysis sections"
					class="grid h-auto w-full grid-cols-2 gap-1 rounded-lg border border-zinc-700 bg-card sm:inline-grid sm:w-fit sm:grid-cols-5"
				>
					<Tabs.Trigger
						value="overview"
						class="min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none"
					>
						Overview
					</Tabs.Trigger>
					<Tabs.Trigger
						value="timeline"
						class="min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none"
					>
						Timeline
					</Tabs.Trigger>
					<Tabs.Trigger
						value="players"
						class="min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none"
					>
						Players
					</Tabs.Trigger>
					<Tabs.Trigger
						value="economy"
						class="min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none"
					>
						Economy
					</Tabs.Trigger>
					<Tabs.Trigger
						value="combat"
						class="col-span-2 min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none sm:col-span-1"
					>
						Combat
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="overview" class="w-full focus-visible:ring-offset-0">
					<div class="grid gap-4">
						<MatchScoreboard match={data.match} {selectedSlot} onSelect={inspectPlayer} />
						<MatchOverviewTab match={data.match} />
					</div>
				</Tabs.Content>
				<Tabs.Content value="players" class="w-full focus-visible:ring-offset-0">
					<MatchPlayersTab match={data.match} {selectedSlot} onSelect={selectPlayer} />
				</Tabs.Content>

				{#each lazyTabs as section}
					<Tabs.Content value={section} class="w-full focus-visible:ring-offset-0">
						{#if loading[section]}
							<div class="rounded-md border border-border bg-card p-4" aria-live="polite">
								<div class="h-4 w-40 animate-pulse rounded bg-zinc-800"></div>
								<div class="mt-4 h-72 animate-pulse rounded-sm bg-zinc-900/80"></div>
								<p class="mt-3 text-xs text-zinc-400">Loading {section} analysis from STRATZ...</p>
							</div>
						{:else if sectionErrors[section]}
							<div class="flex min-h-52 flex-col items-center justify-center rounded-md border border-red-900/60 bg-red-950/20 px-5 text-center">
								<AlertTriangle class="h-6 w-6 text-red-400" />
								<h3 class="mt-3 text-sm font-semibold text-red-100">{sectionErrors[section]?.title}</h3>
								<p class="mt-1 max-w-md text-sm text-red-200/70">{sectionErrors[section]?.message}</p>
								{#if sectionErrors[section]?.canRetry}
									<button
										type="button"
										onclick={() => loadSection(section, true)}
										class="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-red-800 px-3 text-sm text-red-200 transition-colors hover:bg-red-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
									>
										<RefreshCw class="h-4 w-4" /> Try again
									</button>
								{/if}
							</div>
						{:else if section === 'timeline' && timelineData}
							<MatchTimelineTab match={data.match} data={timelineData} />
						{:else if section === 'economy' && economyData}
							<MatchEconomyTab match={data.match} data={economyData} {selectedSlot} onSelect={selectPlayer} />
						{:else if section === 'combat' && combatData}
							<MatchCombatTab match={data.match} data={combatData} {selectedSlot} onSelect={selectPlayer} />
						{/if}
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		</section>
	</div>
{:else}
	<div class="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-4 py-10">
		<div class="w-full rounded-md border border-red-900/60 bg-card p-6 text-center sm:p-8">
			<AlertTriangle class="mx-auto h-8 w-8 text-red-400" />
			<h1 class="mt-4 text-xl font-semibold text-zinc-100">{data.error?.title ?? 'Match could not be loaded'}</h1>
			<p class="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-zinc-400">
				{data.error?.message ?? 'STRATZ did not return this match.'}
			</p>
			<div class="mt-5 flex flex-wrap justify-center gap-2">
				{#if data.error?.canRetry}
					<button
						type="button"
						onclick={() => location.reload()}
						class="inline-flex min-h-11 items-center gap-2 rounded-md bg-zinc-100 px-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<RefreshCw class="h-4 w-4" /> Try again
					</button>
				{/if}
				<a
					href="/matches"
					class="inline-flex min-h-11 items-center rounded-md border border-zinc-700 px-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					Back to matches
				</a>
			</div>
		</div>
	</div>
{/if}
