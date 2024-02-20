<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import { writable } from 'svelte/store';
	import { onMount, setContext } from 'svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import BiGithub from 'virtual:icons/bi/github';
	import BiTwitterX from 'virtual:icons/bi/twitter-x';
	import BiLinkedin from 'virtual:icons/bi/linkedin';

	inject({ mode: dev ? 'development' : 'production' });

	export let data;
	const { playerList } = data;

	const links: { link: string; title: string }[] = [
		{ link: '/matches', title: 'Matches' },
		{ link: '/records', title: 'Records' },
		{ link: '/stats', title: 'Stats' },
		{ link: '/leaderboard', title: 'Leaderboard' },
		{ link: '/about', title: 'About' }
	];

	$: navigateTo = 0;
	const navigate = (playerId: string) => {
		goto('/player/' + playerId);
	};

	$: innerWidth = 0;
	$: innerHeight = 0;
	$: viewport = 'desktop';
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
	$: handleViewport(innerWidth);
	$: viewportStore.set(viewport);

	setContext('viewport', viewportStore);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if viewport === 'loading'}
	<div class="flex h-64 w-full items-center justify-center">
		<Loading />
	</div>
{:else}
	<div class="min-h-screen text-zinc-100">
		<div class="mx-auto mb-8">
			<div>
				<div class="flex w-full items-center justify-center gap-8 bg-zinc-800">
					<a
						href="/"
						class="gap-1w-48 flex items-center justify-center rounded-full text-center font-display text-lg"
					>
						<div>whos-playing</div>
					</a>
					<div class="flex h-full items-center justify-center">
						<div
							class="my-2 flex h-full w-fit items-center justify-center rounded-full bg-zinc-800"
						>
							<div class="flex items-center justify-center gap-4">
								{#each links as link}
									{#if link.link == $page.url.pathname}
										<a href={link.link} class="w-32 rounded-full bg-sky-500 px-2 py-1.5 text-center"
											>{link.title}</a
										>
									{:else}
										<a href={link.link} class="w-32 rounded-full px-2 py-1.5 text-center"
											>{link.title}</a
										>
									{/if}
								{/each}
							</div>
						</div>
					</div>
					<div>
						<select
							name="players"
							class="w-48 rounded-xl border-x-8 border-transparent bg-zinc-800 py-[7px] accent-sky-500"
							bind:value={navigateTo}
							on:change={() => navigate(navigateTo)}
						>
							<option value={0} selected disabled>Search Players</option>
							{#each playerList as player}
								<option on:click={() => goto(`/player/${player.id}`)} value={player.id}
									>{player.username}</option
								>
							{/each}
						</select>
					</div>
				</div>
			</div>
		</div>
		{#key data.url}
			<div in:fade={{ delay: 120, duration: 250 }}>
				{#if $navigating}
					<div class="flex h-64 w-full items-center justify-center">
						<Loading />
					</div>
				{:else}
					<div
						class="mx-auto flex items-center justify-center bg-zinc-900 text-white"
						in:fade={{ delay: 120, duration: 250 }}
					>
						<slot viewport />
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
