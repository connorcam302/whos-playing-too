<script lang="ts">
	let { stack } = $props();
</script>

<div class="flex flex-wrap items-center justify-center gap-4 pt-24">
	{#each stack as player, i}
		<div class={`${i > 1 ? 'pt-24' : 'pt-0'} md:pt-0`}>
			<div class="rounded-xl bg-yellow-400 p-1">
				<div class="relative flex flex-col items-center gap-2 rounded-lg bg-zinc-800 p-4">
					<div class="absolute -top-28">
						<img src={'/shareholder-report/crown.webp'} class="w-48" />
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
