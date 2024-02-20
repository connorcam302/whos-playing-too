<script lang="ts">
	import { type MatchDetails } from './matchDetails.type';
	import { page } from '$app/stores';
	import MatchTable from '$lib/components/match/MatchTable.svelte';
	import WinRateGraph from './WinRateGraph.svelte';
	import NetWorthGraph from './NetWorthGraph.svelte';
	import ExperienceGraph from './ExperienceGraph.svelte';
	export let data: { matchData: any; matchDetails: MatchDetails };

	const { matchData, matchDetails } = data;

	let chartState = 'winRate';

	$: fixRoleScreenShow = false;
</script>

<svelte:head>
	<title>whos-playing | Match {$page.params.id}</title>
</svelte:head>

<div class="flex flex-col items-center">
	<div>
		<MatchTable matchDetails={matchData} modal={false} />
	</div>
	<div class="w-full p-2">
		<div class="w-full">
			<button
				class="rounded-xl bg-zinc-800 px-4 py-2 text-white"
				style={`background-color: ${chartState === 'winRate' ? '#27272a' : '#18181b'}`}
				on:click={() => (chartState = 'winRate')}
			>
				Win Chance
			</button>
			<button
				class="rounded-xl bg-zinc-800 px-4 py-2 text-white"
				style={`background-color: ${chartState === 'netWorth' ? '#27272a' : '#18181b'}`}
				on:click={() => (chartState = 'netWorth')}
			>
				Net Worth
			</button>
			<button
				class="rounded-xl bg-zinc-800 px-4 py-2 text-white"
				style={`background-color: ${chartState === 'experience' ? '#27272a' : '#18181b'}`}
				on:click={() => (chartState = 'experience')}
			>
				Experience
			</button>
		</div>
		<div class="p-2">
			{#if chartState === 'winRate'}
				<div class="w-full">
					<WinRateGraph data={matchDetails.winRates} />
				</div>
			{:else if chartState === 'netWorth'}
				<div class="w-full">
					<NetWorthGraph data={matchDetails.radiantNetworthLead} />
				</div>
			{:else if chartState === 'experience'}
				<div class="w-full">
					<ExperienceGraph data={matchDetails.radiantExperienceLead} />
				</div>
			{/if}
		</div>
	</div>
</div>
