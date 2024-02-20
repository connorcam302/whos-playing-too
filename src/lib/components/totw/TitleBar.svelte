<script lang="ts">
	import { goto } from '$app/navigation';
	export let name: string, role: number, id: number, team: string;
	import { getColour, getRoleIcon } from '$lib/functions';
</script>

<div class="flex flex-col items-center justify-center">
	<div class="flex items-center justify-center gap-2 text-xl tracking-wide">
		<div class="fill-green-600 stroke-green-600">
			<img src={getRoleIcon(role)} alt={`position ${role}`} class="h-7" style="color: 'red'" />
		</div>
		<button
			on:click={() => goto('player/' + id)}
			class="text-2xl transition-all duration-300 hover:text-zinc-400">{name}</button
		>
	</div>
</div>
