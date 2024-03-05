<script lang="ts">
	type Player = {
		id: number;
		username: string;
		kills?: number;
		deaths?: number;
		assists?: number;
		gpm?: number;
		xpm?: number;
		impact?: number;
		lastHits?: number;
		heroDamage?: number;
		winLoss?: number;
	};

	type Features = {
		mostKills: Player[];
		mostDeaths: Player[];
		mostAssists: Player[];
		mostGPM: Player[];
		mostXPM: Player[];
		mostImpact: Player[];
		leastImpact: Player[];
		mostLastHits: Player[];
		mostHeroDamage: Player[];
		leastHeroDamage: Player[];
		mostGained: Player[];
		mostLost: Player[];
	};
	export let features: Features;
	import FeatureBox from './FeatureBox.svelte';
	import { getContext } from 'svelte';

	$: viewport = getContext('viewport');
</script>

<div>
	{#if $viewport === 'desktop'}
		<div class="flex flex-wrap items-center justify-center gap-2">
			<FeatureBox data={features.mostKills} title="Most Kills" type="kills" />
			<FeatureBox data={features.mostDeaths} title="Most Deaths" type="deaths" />
			<FeatureBox data={features.mostGPM} title="Most GPM" type="gpm" />
			<FeatureBox data={features.mostHeroDamage} title="Most Hero Damage" type="heroDamage" />
			<FeatureBox data={features.mostImpact} title="Most Impact" type="impact" />
			<FeatureBox data={features.mostGained} title="Most MMR Gained" type="winLoss" />
			<FeatureBox data={features.mostLastHits} title="Most Last Hits" type="lastHits" />
			<FeatureBox data={features.mostAssists} title="Most Assists" type="assists" />
			<FeatureBox data={features.mostXPM} title="Most XPM" type="xpm" />
			<FeatureBox data={features.leastHeroDamage} title="Least Hero Damage" type="heroDamage" />
			<FeatureBox data={features.leastImpact} title="Least Impact" type="impact" />
			<FeatureBox data={features.mostLost} title="Most MMR Lost" type="winLoss" />
		</div>
	{:else}
		<div class="flex w-[100vw] items-center gap-2 overflow-x-auto">
			<FeatureBox data={features.mostKills} title="Most Kills" type="kills" />
			<FeatureBox data={features.mostDeaths} title="Most Deaths" type="deaths" />
			<FeatureBox data={features.mostGPM} title="Most GPM" type="gpm" />
			<FeatureBox data={features.mostHeroDamage} title="Most Hero Damage" type="heroDamage" />
			<FeatureBox data={features.mostImpact} title="Most Impact" type="impact" />
			<FeatureBox data={features.mostGained} title="Most MMR Gained" type="winLoss" />
			<FeatureBox data={features.mostLastHits} title="Most Last Hits" type="lastHits" />
			<FeatureBox data={features.mostAssists} title="Most Assists" type="assists" />
			<FeatureBox data={features.mostXPM} title="Most XPM" type="xpm" />
			<FeatureBox data={features.leastHeroDamage} title="Least Hero Damage" type="heroDamage" />
			<FeatureBox data={features.leastImpact} title="Least Impact" type="impact" />
			<FeatureBox data={features.mostLost} title="Most MMR Lost" type="winLoss" />
		</div>
	{/if}
</div>
