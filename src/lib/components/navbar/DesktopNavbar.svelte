<script lang="ts">
	import { goto } from '$app/navigation';
	import DesktopNavbar from '$lib/components/navbar/DesktopNavbar.svelte';
	import { page } from '$app/state';

	let { playerList = [], links = [] } = $props();

	let navigateTo = $state(0);

	const navigate = (playerId: string) => {
		goto('/player/' + playerId);
	};
</script>

<div class="mx-auto">
	<div>
		<div class="flex w-full items-center justify-center gap-8 bg-zinc-800">
			<a
				href="/"
				class="gap-1w-48 font-display flex items-center justify-center gap-2 rounded-full text-center text-lg"
			>
				<img src="/logo.png" alt="whos-playing logo" class="h-7 w-7" />
				<div>whos-playing</div>
			</a>
			<div class="flex h-full items-center justify-center">
				<div class="flex h-full w-fit items-center justify-center rounded-full bg-zinc-800">
					<div class="flex h-full items-center justify-center gap-4">
						{#each links as link}
							{#if link.link == page.url.pathname}
								<div
									class="w-32 flex-col items-center justify-center border-b-2 border-b-sky-500 bg-gradient-to-t from-sky-950 py-2 pt-2 transition-all"
								>
									<div class="mx-auto w-full grow rounded-full py-1 text-center">
										<a href={link.link} class="text-center">{link.title}</a>
									</div>
								</div>
							{:else}
								<div
									class="w-32 flex-col items-center justify-center border-b-2 border-b-transparent py-2 pt-2"
								>
									<div class="mx-auto w-full grow rounded-full py-1 text-center">
										<a
											href={link.link}
											class="text-center transition-all duration-300 hover:text-zinc-400"
											>{link.title}</a
										>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>
			<div>
				<select
					name="players"
					class="w-48 rounded-xl border-x-8 border-transparent bg-zinc-900 py-[7px]"
					bind:value={navigateTo}
					onchange={() => navigate(navigateTo)}
				>
					<option value={0} selected disabled>Search Players</option>
					{#each playerList as player}
						<option onclick={() => goto(`/player/${player.id}`)} value={player.id}
							>{player.username}</option
						>
					{/each}
				</select>
			</div>
		</div>
	</div>
</div>
