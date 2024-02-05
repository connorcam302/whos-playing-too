<script lang="ts">
	import { type MatchDetails } from './matchDetails.type';
	import MatchTable from '$lib/components/match/MatchTable.svelte';
	import WinRateGraph from './WinRateGraph.svelte';
	import NetWorthGraph from './NetWorthGraph.svelte';
	import ExperienceGraph from './ExperienceGraph.svelte';
	export let data: { matchData: any; matchDetails: MatchDetails };

	const { matchData, matchDetails } = data;

	let chartState = 'winRate';

	console.log(data);
</script>

<div class="flex flex-col items-center">
	<div>
		<MatchTable matchDetails={matchData} modal={false} />
	</div>
	<div class="w-full p-2">
		<div class="w-full">
			<button
				class="text-white py-2 px-4 rounded-t-xl"
				style={`background-color: ${chartState === 'winRate' ? '#27272a' : ''}`}
				on:click={() => (chartState = 'winRate')}
			>
				Win Chance
			</button>
			<button
				class="text-white py-2 px-4 rounded-t-xl"
				style={`background-color: ${chartState === 'netWorth' ? '#27272a' : ''}`}
				on:click={() => (chartState = 'netWorth')}
			>
				Net Worth
			</button>
			<button
				class="text-white py-2 px-4 rounded-t-xl"
				style={`background-color: ${chartState === 'experience' ? '#27272a' : ''}`}
				on:click={() => (chartState = 'experience')}
			>
				Experience
			</button>
		</div>
		<div class="bg-zinc-800 p-2">
			{#if chartState === 'winRate'}
				<div class="w-full bg-zinc-800">
					<WinRateGraph data={matchDetails.winRates} />
				</div>
			{:else if chartState === 'netWorth'}
				<div class="w-full bg-zinc-800">
					<NetWorthGraph data={matchDetails.radiantNetworthLead} />
				</div>
			{:else if chartState === 'experience'}
				<div class="w-full bg-zinc-800">
					<ExperienceGraph data={matchDetails.radiantExperienceLead} />
				</div>
			{/if}
		</div>
	</div>
</div>
