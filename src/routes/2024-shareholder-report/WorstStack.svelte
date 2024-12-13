<script lang="ts">
	import PooIcon from '$lib/components/PooIcon.svelte';

	export let stack;

	console.log(stack);
</script>

<div class="flex flex-wrap items-center justify-center gap-4 pt-24">
	{#each stack as player, i}
		<div class={`${i > 1 ? 'pt-24' : 'pt-0'} md:pt-0`}>
			<div class="rounded-xl bg-[#A57655] p-1">
				<div class="relative flex flex-col items-center gap-2 rounded-lg bg-zinc-800 p-4">
					<div class="absolute -top-32">
						<PooIcon class="w-40" />
					</div>
					<div class="flex flex-col items-center">
						<img src={player.avatarfull} class="h-32 w-32" />
					</div>
					<div class="text-3xl">{player.username}</div>
				</div>
			</div>
		</div>
	{/each}
</div>
