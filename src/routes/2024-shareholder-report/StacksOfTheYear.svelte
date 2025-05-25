<script lang="ts">
	import BestStack from './BestStack.svelte';
	import WorstStack from './WorstStack.svelte';

	let { stacks } = $props();

	let playerText = $state('players');
	
</script>

<div class="flex flex-col items-center gap-24">
	<div class="flex flex-col items-center gap-8">
		<div class="text-4xl">Stack of the Year</div>
		<div class="flex max-w-screen-md flex-col gap-2 text-center">
			<div>
				Where Team of the Year just takes the 5 best players in order to form a galácticos-esqe
				lineup, this does not always work. Sometimes <span
					onmouseover={() => (playerText = '(Bingham)')}
					onmouseout={() => (playerText = 'players')}
					class="font-bold">{playerText}</span
				> simply do not function together.
			</div>
			<div>
				But some stacks were forged in fire and bled together, some have strats that even transcend
				Dota and have moved over into other games. Whether your stack likes to pretend to back or
				whether your stack likes to ignore tormentor calls, you played together and probably had
				fun. Some stacks are just more successful than others at this.
			</div>
			<div>
				Calculating this was hard due to 5 man dota declining overall, so for this one we simply
				used win rate and matches. Role was not included in this as it should not matter where you
				play, just who you play with. Due to the Dota decline, we decided to allow each stack to
				have 1 smurf in. However, this ended up not mattering and the stack of the year did not
				include a smurf and went unbeaten in all their games.
			</div>
		</div>
		<div class="text-center text-3xl">Congratulations to our Stack of the Year 2024!</div>
		<BestStack stack={stacks.best} />
	</div>
	<div class="flex flex-col items-center gap-8">
		<div class="flex max-w-screen-md flex-col gap-2 text-center">
			<div>
				As suggested earlier, some stacks simply do not work. The roles aren't there. The focus
				isn't there. The drive isn' t there. The desire isn't there. Whatever it is the stack does
				not work, and that's okay.
			</div>
			<div>
				The calculating of this was the same as for stack of the year, but similar as we did for
				Flop of the Year, we have welcomed smurfs into this stack for the same reason as last.
				Surely a stack containing someone cosplaying as a lower MMR would favour better, wouldn't
				it?
			</div>
		</div>
		<div class="text-center text-3xl">Beware our Danger Stack of the Year 2024!</div>
		<WorstStack stack={stacks.worst} />
	</div>
</div>
