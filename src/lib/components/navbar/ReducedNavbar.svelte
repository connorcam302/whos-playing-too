<script lang="ts">
	import { run, nonpassive, self } from 'svelte/legacy';

	import { goto } from '$app/navigation';
	import DesktopNavbar from '$lib/components/navbar/DesktopNavbar.svelte';
	import { page } from '$app/state';
	import HamburgerIcon from '$lib/components/HamburgerIcon.svelte';
	import { slide, fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import SearchBox from '../SearchBox.svelte';

	let { playerList = [], links = [] } = $props();

	let open = $state(false);

	let navigateTo = $state(0);

	const navigate = (url: string) => {
		open = false;
		goto(url);
	};

	run(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
	});

	const searchGroups = [
		{
			header: 'Players',
			options: playerList.map((player) => ({
				label: player.username,
				action: () => {
					goto(`/player/${player.id}`);
				}
			}))
		}
	];
</script>

<svelte:window
	use:nonpassive={[
		'wheel',
		() => (e) => {
			if (open) e.preventDefault();
		}
	]}
/>

<div class="mx-auto mb-4 h-[50px] overflow-auto">
	<div class:scroll-lock={open} class="z-50">
		<div>
			<div class="z-10 flex w-full items-center justify-center gap-8 bg-[#09090b] px-4">
				<button
					onclick={() => navigate('/')}
					class="flex w-48 items-center gap-2 rounded-full text-center font-display text-lg"
				>
					<img src="/logo.png" alt="whos-playing logo" class="h-7 w-7" />
					<div>whos-playing</div>
				</button>
				<div class="grow"></div>
				<button onclick={() => (open = !open)}>
					<HamburgerIcon width={50} {open} />
				</button>
			</div>
		</div>
		{#if open}
			<div
				class="fixed z-50 h-full w-full bg-black bg-opacity-50"
				transition:fade={{ duration: 200 }}
				onclick={self(() => (open = false))}
				onkeypress={(e) => e.key === 'Escape' && (open = false)}
				role="button"
				tabindex="0"
			>
				<div
					class="z-10 w-full rounded-b-lg border bg-[#09090b]"
					transition:fly={{ y: -1000, duration: 500, easing: quintOut }}
				>
					<div class="flex items-center justify-center">
						<SearchBox groups={searchGroups} />
					</div>
					{#each links as link}
						<div class="flex items-center justify-center gap-4 py-2">
							{#if link.link == page.url.pathname}
								<div class="w-32 flex-col items-center justify-center">
									<div class="mx-auto w-full grow rounded-full bg-sky-500 py-1 text-center">
										<button onclick={() => navigate(link.link)} class="text-center text-sky-950">
											{link.title}
										</button>
									</div>
								</div>
							{:else}
								<div class="w-32 flex-col items-center justify-center">
									<div class="mx-auto w-full grow rounded-full text-center">
										<button
											onclick={() => navigate(link.link)}
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
			</div>
		{/if}
	</div>
</div>

<style>
	.scroll-lock {
		overflow-y: hidden;
	}
</style>
