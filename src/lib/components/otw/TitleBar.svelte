<script lang="ts">
	import { goto } from '$app/navigation';
	import { getColour, getRoleIcon } from '$lib/functions';
	interface Props {
		name: string;
		role: number;
		id: number;
		team: string;
	}

	let {
		name,
		role,
		id,
		team
	}: Props = $props();
</script>

<div class="flex flex-col items-center justify-center">
	<div class="flex items-center justify-center gap-2 text-xl tracking-wide">
		<div class="fill-green-600 stroke-green-600">
			<img src={getRoleIcon(role)} alt={`position ${role}`} class="h-7" style="color: 'red'" />
		</div>
		<button
			onclick={() => goto('player/' + id)}
			class="text-lg transition-all duration-300 hover:text-zinc-400 lg:text-2xl">{name}</button
		>
	</div>
</div>
