<script lang="ts">
	type SteamProfile = {
		avatar: string;
		avatarfull: string;
		avatarhash: string;
		avatarmedium: string;
		communityvisibilitystate: number;
		lastlogoff: number;
		loccountrycode: string;
		personaname: string;
		personastate: number;
		personastateflags: number;
		primaryclanid: string;
		profilestate: number;
		profileurl: string;
		steamid: string;
		timecreated: number;
		smurf: boolean;
		gameextrainfo?: string;
	};
	type Player = {
		accountId: number;
		username: string;
		id: number;
		image: string;
	};
	type Stats = {
		wins: number;
		losses: number;
		rankedWins: number;
		rankedLosses: number;
	};
	type Hero = {
		id: number;
		name: string;
		localized_name: string;
		img: string;
		icon: string;
		primary_attr?: string;
		attack_type?: string;
		roles?: string[];
	};

	import ProfileHome from './ProfileHome.svelte';
	import ProfileBanner from './ProfileBanner.svelte';
	import ProfileStats from './ProfileStats.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import ProfileMatches from './ProfileMatches.svelte';
	import ProfileRecords from './ProfileRecords.svelte';
	import ProfileTeammates from './ProfileTeammates.svelte';
	import ProfileHeroes from './ProfileHeroes.svelte';
	import ProfileOwnership from './ProfileOwnership.svelte';
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';

	interface Props {
		data: {
			player: Player;
			mainAccount: SteamProfile;
			smurfAccounts: SteamProfile[];
			allTimeStats: Stats;
			recentStats: Stats;
			heroStats: any;
			allTimeHeroStats: any;
			recentHeroPoolStats: any;
			playerHeroRankings: any;
			playerOwnershipChanges: any;
			recentHeroPoolMatchLimit: number;
			heroPoolMatchLimitOptions: number[];
			winGraph: { resultsArray: number[]; daysArray: number[] };
			heroList: Hero[];
			playerList: any[];
			impactCounts: Record<string, { role: number; count: number | string }[]>;
			roleCounts: { role: number; count: number }[];
			matchesByDay: { wins: number; losses: number; date: number }[];
			featuredHero: any;
			averageStats: any;
			winLossByMinute: any;
			playerRecords: any[];
			teammateStats: any[];
		};
	}

	let { data }: Props = $props();

	let {
		player,
		mainAccount,
		smurfAccounts,
		allTimeStats,
		recentStats,
		heroStats,
		allTimeHeroStats,
		winGraph,
		heroList,
		winLossByMinute,
		roleCounts,
		matchesByDay,
		featuredHero,
		averageStats,
		playerList
	} = $derived(data);

	type ProfileTab =
		| 'home'
		| 'stats'
		| 'heroes'
		| 'ownership'
		| 'matches'
		| 'records'
		| 'teammates';

	const profileTabs: ProfileTab[] = [
		'home',
		'matches',
		'stats',
		'heroes',
		'ownership',
		'records',
		'teammates'
	];

	const getUrlTab = (url: URL) => {
		const tab = url.searchParams.get('tab');
		if (tab === 'hero-pool') return 'heroes';
		return profileTabs.includes(tab as ProfileTab) ? (tab as ProfileTab) : 'home';
	};

	let selectedTab = $state<ProfileTab>(getUrlTab(page.url));

	$effect(() => {
		selectedTab = getUrlTab(page.url);
	});

	const navigateToTab = (value: string) => {
		if (!profileTabs.includes(value as ProfileTab)) return;

		const tab = value as ProfileTab;
		if (tab === getUrlTab(page.url)) return;

		const nextUrl = new URL(page.url);
		if (tab === 'home') {
			nextUrl.searchParams.delete('tab');
		} else {
			nextUrl.searchParams.set('tab', tab);
		}
		pushState(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, page.state);
	};
</script>

<svelte:head>
	<title>whos-playing | {player.username || 'Unknown'}</title>
</svelte:head>

<meta property="og:title" content={`whos-playing | ${player.username}`} />
<meta
	property="og:description"
	content={`All Time Ranked: ${allTimeStats.rankedWins} - ${allTimeStats.rankedLosses}
This Month Ranked: ${recentStats.rankedWins} - ${recentStats.rankedLosses}
All Time: ${allTimeStats.wins} - ${allTimeStats.losses}
This Month: ${recentStats.wins} - ${recentStats.losses}`}
/>
<meta property="og:image" content={player.image} />
<meta property="og:url" content={`https://whos-playing.com/player/${player.id}`} />
<div class="flex w-full flex-col items-center gap-4 px-3 py-3 sm:px-4">
	<ProfileBanner {data} />
	<Tabs.Root
		bind:value={selectedTab}
		onValueChange={navigateToTab}
		class="flex w-full max-w-6xl flex-col items-stretch gap-3"
	>
		<Tabs.List class="grid h-auto w-full grid-cols-2 gap-1 rounded-lg border border-zinc-700 bg-card sm:inline-grid sm:w-fit sm:grid-cols-7">
			<Tabs.Trigger class="min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none" value="home">Home</Tabs.Trigger>
			<Tabs.Trigger class="min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none" value="matches">Matches</Tabs.Trigger>
			<Tabs.Trigger class="min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none" value="stats">Stats</Tabs.Trigger>
			<Tabs.Trigger class="min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none" value="heroes">Heroes</Tabs.Trigger>
			<Tabs.Trigger class="min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none" value="ownership">Ownership</Tabs.Trigger>
			<Tabs.Trigger class="min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none" value="records">Records</Tabs.Trigger>
			<Tabs.Trigger class="col-span-2 min-h-10 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none sm:col-span-1" value="teammates">Teammates</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="home" class="w-full"><ProfileHome {data} /></Tabs.Content>
		<Tabs.Content value="matches" class="w-full"><ProfileMatches {data} /></Tabs.Content>
		<Tabs.Content value="stats" class="w-full"><ProfileStats {data} /></Tabs.Content>
		<Tabs.Content value="heroes" class="w-full"><ProfileHeroes {data} /></Tabs.Content>
		<Tabs.Content value="ownership" class="w-full"><ProfileOwnership {data} /></Tabs.Content>
		<Tabs.Content value="records" class="w-full min-w-0"><ProfileRecords {data} /></Tabs.Content>
		<Tabs.Content value="teammates" class="w-full"><ProfileTeammates {data} /></Tabs.Content>
	</Tabs.Root>
</div>
