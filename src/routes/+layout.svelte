<script lang="ts">
	import { run } from 'svelte/legacy';

	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import { writable } from 'svelte/store';
	import { onMount, setContext } from 'svelte';
	import DesktopNavbar from '$lib/components/navbar/DesktopNavbar.svelte';
	import ReducedNavbar from '$lib/components/navbar/ReducedNavbar.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import BiGithub from 'virtual:icons/bi/github';
	import BiTwitterX from 'virtual:icons/bi/twitter-x';
	import BiLinkedin from 'virtual:icons/bi/linkedin';

	inject({ mode: dev ? 'development' : 'production' });

	let { data, children } = $props();
	const { playerList } = data;

	const links: { link: string; title: string }[] = [
		{ link: '/matches', title: 'Matches' },
		{ link: '/records', title: 'Records' },
		{ link: '/stats', title: 'Stats' },
		{ link: '/comparison', title: 'Comparison' },
		{ link: '/about', title: 'About' }
	];

	let innerWidth = $state(0);

	let innerHeight = $state(0);

	let viewport = $state('desktop');

	let mounted = false;

	const handleViewport = (innerWidth: number) => {
		if (mounted) {
			if (innerWidth === 0) {
				viewport = 'loading';
			} else if (innerWidth > 667) {
				viewport = 'tablet';
			} else {
				viewport = 'mobile';
			}
			if (innerWidth > 1200) {
				viewport = 'desktop';
			} else if (innerWidth > 667) {
				viewport = 'tablet';
			} else {
				viewport = 'mobile';
			}
		}
	};

	onMount(() => {
		mounted = true;
		handleViewport(innerWidth);
	});

	const viewportStore = writable();
	run(() => {
		handleViewport(innerWidth);
	});
	run(() => {
		viewportStore.set(viewport);
	});

	setContext('viewport', viewportStore);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if viewport === 'loading'}
	<div class="flex h-64 w-full items-center justify-center">
		<Loading />
	</div>
{:else}
	<div class="flex min-h-screen flex-col text-zinc-100">
		{#if viewport === 'desktop'}
			<div class="min-w-screen">
				<DesktopNavbar {playerList} {links} />
			</div>
		{:else}
			<div class="min-w-screen">
				<ReducedNavbar {playerList} {links} />
			</div>
		{/if}
		{#key data.url}
			<div in:fade={{ delay: 120, duration: 250 }} class="mt-4 grow">
				{#if $navigating}
					<div class="flex h-64 w-full items-center justify-center">
						<Loading />
					</div>
				{:else}
					<div
						class="mx-auto flex grow items-center justify-center bg-zinc-900 text-white"
						in:fade={{ delay: 120, duration: 250 }}
					>
						{@render children?.({ viewport: true })}
					</div>
				{/if}
			</div>
		{/key}
		<div class="my-4 mt-8 flex flex-col gap-2">
			<div class="flex justify-center gap-4 text-xl">
				<a
					href="https://www.linkedin.com/in/connor-campbell-600265175/"
					class="transition-all hover:text-sky-500"><BiLinkedin /></a
				>
				<a href="https://twitter.com/TheColfox" class="transition-all hover:text-sky-500"
					><BiTwitterX /></a
				>
				<a href="https://github.com/whos-playing-too" class="transition-all hover:text-sky-500"
					><BiGithub /></a
				>
			</div>
			<div class="flex justify-center text-xs">whos-playing | Connor Campbell</div>
		</div>
	</div>
{/if}
