<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

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

	const handleViewport = (innerWidth: number) => {
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
	};
	$: handleViewport(innerWidth);

	const viewportStore = writable();
	$: viewportStore.set(viewport);

	setContext('viewport', viewportStore);
	$: console.log(viewport);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if viewport === 'loading'}
	<div class="flex items-center justify-center w-full h-64">
		<Loading />
	</div>
{:else}
	<div class="text-zinc-100 py-4 min-h-screen">
		<div class="mx-auto mb-8">
			<div>
				<div class="w-full flex items-center justify-center gap-8">
					<a
						href="/"
						class="flex items-center justify-center text-lg rounded-full text-center font-display gap-1w-48"
					>
						<div>whos-playing</div>
					</a>
					<div class="flex items-center justify-center h-full">
						<div
							class="w-fit my-2 bg-zinc-800 flex justify-center items-center rounded-full h-full"
						>
							<div class="flex gap-4 justify-center items-center">
								{#each links as link}
									{#if link.link == $page.url.pathname}
										<a href={link.link} class="bg-sky-500 py-1.5 px-2 rounded-full w-32 text-center"
											>{link.title}</a
										>
									{:else}
										<a href={link.link} class="py-1.5 px-2 rounded-full w-32 text-center"
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
							class="bg-zinc-800 w-48 py-[7px] accent-sky-500 rounded-xl border-x-8 border-transparent"
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
					<div class="flex items-center justify-center w-full h-64">
						<Loading />
					</div>
				{:else}
					<div
						class="flex justify-center items-center mx-auto text-white"
						in:fade={{ delay: 120, duration: 250 }}
					>
						<slot viewport />
					</div>
				{/if}
			</div>
		{/key}
	</div>
{/if}

<style>
</style>
