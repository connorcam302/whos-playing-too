<script lang="ts">
	import { goto } from '$app/navigation';
	export let name: string, role: number, id: number, team: string;
	import { getColour } from '$lib/functions';

	$: console.log(getColour(role));
</script>

<div class="flex flex-col items-center justify-center">
	<div class="text-xl tracking-wide flex gap-2 justify-center items-center">
		<div class="stroke-green-600 fill-green-600">
			<img
				src={`/roles/pos${role}.svg`}
				alt={`position ${role}`}
				class="h-7"
				style="color: 'red'"
			/>
		</div>
		<button
			on:click={() => goto('player/' + id)}
			class="text-2xl hover:text-zinc-400 transition-all duration-300">{name}</button
		>
	</div>
</div>
