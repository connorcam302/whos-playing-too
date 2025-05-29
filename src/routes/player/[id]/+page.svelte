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

	import ProfileHome from './ProfileHome.svelte';
	import ProfileBanner from './ProfileBanner.svelte';
	import ProfileMatches from './ProfileMatches.svelte';
	import ProfileStats from './ProfileStats.svelte';
	import * as Tabs from '$lib/components/ui/tabs';

	interface Props {
		data: {
			player: Player;
			mainAccount: SteamProfile;
			smurfAccounts: SteamProfile[];
			allTimeStats: Stats;
			recentStats: Stats;
			heroStats: any;
			allTimeHeroStats: any;
			winGraph: { resultsArray: number[]; daysArray: number[] };
			heroList: { id: number; name: string }[];
			impactCounts: object;
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
		heroList
	} = $derived(data);
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
<div class="flex w-full flex-col content-center items-center justify-center gap-4">
	<ProfileBanner {data} />
	<Tabs.Root value="matches" class="w-full md:max-w-screen-md">
		<Tabs.List class="">
			<Tabs.Trigger value="home">Home</Tabs.Trigger>
			<Tabs.Trigger value="stats">Stats</Tabs.Trigger>
			<Tabs.Trigger value="matches">Matches</Tabs.Trigger>
			<Tabs.Trigger value="records">Records</Tabs.Trigger>
			<Tabs.Trigger value="teammates">Teammates</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="home"><ProfileHome {data} /></Tabs.Content>
		<Tabs.Content value="stats"><ProfileStats {data} /></Tabs.Content>
		<Tabs.Content value="matches"><ProfileMatches {data} /></Tabs.Content>
		<Tabs.Content value="records"><ProfileHome {data} /></Tabs.Content>
		<Tabs.Content value="teammates"><ProfileHome {data} /></Tabs.Content>
	</Tabs.Root>
</div>
