<script lang="ts">
	export let heroStats: {
		hero: DotaAsset;
		matches: number;
		radiantWins: number;
		direWins: number;
		avgImpact: number;
	}[];

	import Bar from './Bar.svelte';
</script>

<div>
	{#each heroStats as hero}
		<div class="flex gap-2">
			<div>
				<img src={hero.hero.img} alt={hero.hero.name} class="h-8" />
			</div>
			<div class="basis w-40">
				{hero.hero.name}
			</div>
			<div class="basis w-40">
				{hero.matches}
				<Bar colour="blue" percentage={(hero.matches / heroStats[0].matches) * 100} />
			</div>
			<div class="basis w-40">
				{Math.round(((hero.radiantWins + hero.direWins) / hero.matches) * 1000) / 10}%
				<Bar
					colour="green"
					percentage={((hero.radiantWins + hero.direWins) / hero.matches) * 100}
				/>
			</div>
		</div>
	{/each}
</div>
