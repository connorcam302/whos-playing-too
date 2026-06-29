<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import SearchBox from '../SearchBox.svelte';
	import HamburgerIcon from '../HamburgerIcon.svelte';

	interface Props {
		playerList?: any[];
		heroList?: { id: number; name: string; img: string }[];
		links?: { link: string; title: string }[];
	}

	let { playerList = [], heroList = [], links = [] }: Props = $props();

	// --- Auto-hide logic ---
	let visible = $state(true);
	let lastScrollY = $state(0);
	let navHeight = $state(0);
	let navEl: HTMLElement | undefined = $state();

	const SCROLL_THRESHOLD = 10;

	function handleScroll() {
		const currentY = window.scrollY;
		const delta = currentY - lastScrollY;

		if (currentY <= 0) {
			visible = true;
		} else if (delta > SCROLL_THRESHOLD) {
			visible = false;
			if (mobileOpen) mobileOpen = false;
		} else if (delta < -SCROLL_THRESHOLD) {
			visible = true;
		}

		lastScrollY = currentY;
	}

	onMount(() => {
		lastScrollY = window.scrollY;
	});

	// --- Mobile menu ---
	let mobileOpen = $state(false);

	$effect(() => {
		if (mobileOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	});

	// --- Search groups (players, heroes, pages) ---
	let searchGroups = $derived([
		{
			header: 'Players',
			options: playerList.map((player: any) => ({
				label: player.username,
				action: () => goto(`/player/${player.id}`)
			}))
		},
		{
			header: 'Heroes',
			options: heroList.map((hero) => ({
				label: hero.name,
				action: () => goto(`/heroes/${hero.id}`)
			}))
		},
		{
			header: 'Pages',
			options: links.map((link) => ({
				label: link.title,
				action: () => goto(link.link)
			}))
		}
	]);

	function isActive(link: string): boolean {
		if (link === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(link);
	}
</script>

<svelte:window onscroll={handleScroll} />

<!-- Spacer to prevent content from jumping under fixed nav -->
<div style:height="{navHeight}px"></div>

<nav
	bind:this={navEl}
	bind:clientHeight={navHeight}
	class="fixed top-0 right-0 left-0 z-40 transition-transform duration-200 ease-out"
	class:translate-y-0={visible}
	class:-translate-y-full={!visible}
>
	<!-- Desktop navbar -->
	<div class="hidden border-b border-zinc-800/60 bg-background/95 backdrop-blur-md md:block">
		<div class="mx-auto flex h-12 max-w-7xl items-center gap-6 px-4">
			<!-- Logo -->
			<a href="/" class="flex shrink-0 items-center gap-2 font-display text-[15px] text-zinc-100">
				<img src="/logo.png" alt="whos-playing" class="h-6 w-6" />
				<span>whos-playing</span>
			</a>

			<!-- Nav links -->
			<div class="flex items-center gap-1">
				{#each links as link}
					<a
						href={link.link}
						class="relative rounded-md px-3 py-1.5 text-sm transition-colors duration-150
							{isActive(link.link)
								? 'text-zinc-100'
								: 'text-zinc-400 hover:text-zinc-200'}"
					>
						{link.title}
						{#if isActive(link.link)}
							<span class="absolute inset-x-1 -bottom-[9px] h-[2px] rounded-full bg-sky-500"></span>
						{/if}
					</a>
				{/each}
			</div>

			<!-- Spacer -->
			<div class="grow"></div>

			<!-- Search -->
			<div class="w-64">
				<SearchBox groups={searchGroups} placeholder="Search players, pages..." />
			</div>
		</div>
	</div>

	<!-- Mobile navbar -->
	<div class="border-b border-zinc-800/60 bg-background/95 backdrop-blur-md md:hidden">
		<div class="flex h-12 items-center justify-between px-3">
			<a href="/" class="flex items-center gap-2 font-display text-[15px] text-zinc-100">
				<img src="/logo.png" alt="whos-playing" class="h-6 w-6" />
				<span>whos-playing</span>
			</a>

			<button
				onclick={() => (mobileOpen = !mobileOpen)}
				class="flex items-center justify-center rounded-md p-1 text-zinc-300 transition-colors hover:text-zinc-100"
				aria-label="Toggle menu"
				aria-expanded={mobileOpen}
			>
				<HamburgerIcon width={36} open={mobileOpen} />
			</button>
		</div>
	</div>

	<!-- Mobile flyout -->
	{#if mobileOpen}
		<div
			class="fixed inset-0 top-12 z-40 bg-background/60 backdrop-blur-sm md:hidden"
			transition:fade={{ duration: 150 }}
			onclick={() => (mobileOpen = false)}
			onkeydown={(e) => e.key === 'Escape' && (mobileOpen = false)}
			role="button"
			tabindex="-1"
		>
			<div
				class="border-b border-zinc-800/60 bg-background"
				transition:fly={{ y: -200, duration: 250, easing: quintOut }}
				onclick={(e) => e.stopPropagation()}
			>
				<div class="px-4 py-3">
					<SearchBox groups={searchGroups} placeholder="Search players, pages..." />
				</div>

				<div class="flex flex-col gap-0.5 px-2 pb-3">
					{#each links as link}
						<a
							href={link.link}
							onclick={() => (mobileOpen = false)}
							class="flex items-center rounded-md px-3 py-2.5 text-sm transition-colors duration-150
								{isActive(link.link)
									? 'bg-sky-500/10 text-sky-400'
									: 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'}"
						>
							{link.title}
						</a>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</nav>
