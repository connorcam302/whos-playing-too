<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
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
</script>

<div class="text-neutral-100 p-4 min-h-screen">
	<div class="max-w-screen-2xl mx-auto mb-8">
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
						class="w-fit my-2 bg-neutral-800 flex justify-center items-center rounded-full h-full"
					>
						<div class="flex gap-4 justify-center items-center">
							{#each links as link}
								{#if link.link == $page.url.pathname}
									<a href={link.link} class="bg-rose-500 py-1.5 px-2 rounded-full w-32 text-center"
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
						class="bg-neutral-800 w-48 py-[7px] accent-rose-500 rounded-xl border-x-8 border-transparent"
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
		<div class="flex justify-center items-center mx-auto" in:fade={{ delay: 120, duration: 250 }}>
			<slot />
		</div>
	{/key}
</div>

<style>
</style>
