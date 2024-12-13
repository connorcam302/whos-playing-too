<script lang="ts">
	import TeamOfTheYear from './TeamOfTheYear.svelte';

	export let oty;

	const { toty, foty } = oty;
</script>

<div class="flex flex-col items-center gap-24">
	<div class="flex flex-col items-center gap-8">
		<div class="text-4xl">Team of the Year</div>
		<div class="flex max-w-screen-md flex-col gap-2 text-center">
			<div>
				Calculating the best five players in each position is challenging. Some players participate
				in more games than others, causing their win rate to trend closer to 50%. Additionally, some
				players favor heroes that are more advantageous according to the algorithm. With the recent
				surge in "preservation Dota" being played, we had to ensure we weren't being biased towards
				the champions of this form of play.
			</div>
			<div>
				Here is how we approached the process: We used a combination of win rate, impact score, and
				match count. Smurfs were excluded from this category, as they tend to farm high-impact-score
				games by exploiting low MMR matches and engaging in preservation Dota. After applying these
				criteria, we identified the highest-rated player in each role. You also had to play at least
				24 games this year, this was decided as any higher would exclude too many players.
			</div>
		</div>
		<div class="text-3xl">Congratulations to our Team of the Year 2024!</div>
		<TeamOfTheYear {toty} />
	</div>
	<div class="flex flex-col items-center gap-8">
		<div class="flex max-w-screen-md flex-col gap-2 text-center">
			<div>
				On a slightly different tone, on occasions, players when informed they were to play a
				certain role became nefarious actors. Some potentially through expressing creativity that
				the world was not ready for, some drunk drivers and some playing in bad faith. Regardless of
				how they got here, these players have been identified as vulnerabilities when placed into
				the given roles and should be approached with caution in future games.
			</div>
			<div>
				For how this was calculated, we used the same calculation as Team of the Year, but also
				included smurfs as there is no excuse to be placed among the worst players when smurfing,
				right?
			</div>
		</div>
		<div class="text-3xl">Behold your 2024 Flops of the Year!</div>
		<TeamOfTheYear toty={foty} />
	</div>
</div>
