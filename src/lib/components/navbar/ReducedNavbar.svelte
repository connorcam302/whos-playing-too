<script lang="ts">
	import { goto } from '$app/navigation';
	import DesktopNavbar from '$lib/components/navbar/DesktopNavbar.svelte';
	import { page } from '$app/stores';
	import HamburgerIcon from '$lib/components/HamburgerIcon.svelte';

	export let playerList = [],
		links = [];

	$: open = false;
	$: navigateTo = 0;
	const navigate = (url: string) => {
		open = false;
		goto(url);
	};
</script>

<div class="mx-auto mb-4">
	<div>
		<div class="flex w-full items-center justify-center gap-8 bg-zinc-800 px-4">
			<a
				href="/"
				class="gap-1w-48 flex items-center justify-center gap-2 rounded-full text-center font-display text-lg"
			>
				<img src="/logo.png" alt="whos-playing logo" class="h-7 w-7" />
				<div>whos-playing</div>
			</a>
			<div class="grow" />
			<button on:click={() => (open = !open)}>
				<HamburgerIcon width={50} {open} />
			</button>
		</div>
	</div>
	{#key open}
		{#if open}
			<div class="bg-zinc-800">
				<div class="flex items-center justify-center">
					<select
						name="players"
						class="w-48 rounded-xl border-x-8 border-transparent bg-zinc-900 py-[7px]"
						bind:value={navigateTo}
						on:change={() => navigate('/player/' + navigateTo)}
					>
						<option value={0} selected disabled>Search Players</option>
						{#each playerList as player}
							<option on:click={() => navigate(`/player/${player.id}`)} value={player.id}>
								{player.username}
							</option>
						{/each}
					</select>
				</div>
				{#each links as link}
					<div class="flex items-center justify-center gap-4 py-2">
						{#if link.link == $page.url.pathname}
							<div class="w-32 flex-col items-center justify-center">
								<div class="mx-auto w-full grow rounded-full bg-sky-500 py-1 text-center">
									<button on:click={() => navigate(link.link)} class="text-center text-sky-950">
										{link.title}
									</button>
								</div>
							</div>
						{:else}
							<div class="w-32 flex-col items-center justify-center">
								<div class="mx-auto w-full grow rounded-full text-center">
									<button
										on:click={() => navigate(link.link)}
										class="text-center transition-all duration-300 hover:text-zinc-400"
									>
										{link.title}
									</button>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/key}
</div>
