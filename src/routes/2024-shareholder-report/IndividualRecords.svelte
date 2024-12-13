<script lang="ts">
	import FlopOfTheWeek from '$lib/components/otw/FlopOfTheWeek.svelte';
	import IndividualMatchRecord from './IndividualMatchRecord.svelte';
	import IndividualRecord from './IndividualRecord.svelte';

	export let records;

	console.log(records);
</script>

<div class="flex flex-col items-center gap-8">
	<div class="flex flex-col items-center gap-8">
		<div class="text-4xl">Individual Records</div>
		<div class="flex max-w-screen-md flex-col gap-2 text-center">
			<div>
				The methods used to collect these fields are not particularly consistent, some include
				smurfs, some do not, some include Sam, some do not. For quick reference:
			</div>
			<ul class="text-lg font-semibold">
				<li>
					- If it's a positive record, it does not include smurfs and it might not include Sam.
				</li>
				<li>- If its a negative record, it might not include Sam</li>
			</ul>
			<div>
				Why do some of these not include Sam? It's impossible to tell if Sam was actually playing a
				game or not. For example Sam had to be discluded from Lowest GPM as he leaves games or goes
				AFK. For the same reason he also had to be discluded from Lowest Hero Damage. The rest of
				these stats have been internally verified to ensure they are at least close to proper games.
				For any queries with this, contact @kurt098500 on Discord.gg
			</div>
			<div>Without further ado, here are our Individual Records.</div>
		</div>
	</div>
	<div class="flex flex-col gap-8">
		<div>
			First off, are the individuals who had a standout match, for <i>differing</i> reasons.
		</div>
		<div class="flex flex-col gap-4">
			<div class="text-3xl">Highest Impact</div>
			<IndividualMatchRecord record={records.highestImpact} />
		</div>
		<div class="flex flex-col gap-4">
			<div class="text-3xl">Lowest Impact</div>
			<IndividualMatchRecord record={records.lowestImpact} />
		</div>
		<div class="flex flex-col gap-4">
			<div class="text-3xl">Most Kills</div>
			<IndividualMatchRecord record={records.mostKills} />
		</div>
		<div class="flex flex-col gap-4">
			<div class="text-3xl">Most Deaths</div>
			<IndividualMatchRecord record={records.mostDeaths} />
		</div>
		<div class="flex flex-col gap-4">
			<div class="text-3xl">Most Assists</div>
			<IndividualMatchRecord record={records.mostAssists} />
		</div>
		<div class="flex flex-col gap-4">
			<div class="text-3xl">Highest GPM</div>
			<IndividualMatchRecord record={records.highestGPM} />
		</div>
		<div class="flex flex-col gap-4">
			<div class="text-3xl">Lowest GPM</div>
			<IndividualMatchRecord record={records.lowestGPM} />
		</div>
		<div class="flex flex-col gap-4">
			<div class="text-3xl">Most Damage</div>
			<IndividualMatchRecord record={records.mostDamage} />
		</div>
		<div class="flex flex-col gap-4">
			<div class="text-3xl">Least Damage</div>
			<IndividualMatchRecord record={records.leastDamage} />
		</div>
		<div class="flex flex-col gap-4">
			<div>
				And finally here are some player stats not taken from individual games, but across many.
			</div>
			<div class="flex max-w-screen-lg flex-wrap items-end justify-center gap-8">
				<div class="flex flex-col items-center gap-4">
					<div class="max-w-64 text-center text-3xl">Most Consistent</div>
					<IndividualRecord record={records.mostConsistent} />
				</div>
				<div class="flex flex-col items-center gap-4">
					<div class="max-w-64 text-center text-3xl">Most Matches Played</div>
					<IndividualRecord record={records.mostMatches} />
				</div>
				<div class="flex flex-col items-center gap-4">
					<div class="max-w-64 grow text-center text-3xl">Most Team of the Weeks</div>
					<IndividualRecord record={records.mostTOTW} />
				</div>
				<div class="flex flex-col items-center gap-4">
					<div class="max-w-64 text-center text-3xl">Most MMR Gained</div>
					<IndividualRecord record={records.mostMMRGained} />
				</div>
				<div class="flex flex-col items-center gap-4">
					<div class="max-w-64 text-center text-3xl">Most MMR Lost</div>
					<IndividualRecord record={records.mostMMRLost} />
				</div>
			</div>
		</div>
	</div>
</div>
