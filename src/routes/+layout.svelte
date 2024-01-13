<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	export let data;
	const { playerList } = data;

	const links: { link: string; title: string }[] = [
		{ link: '/matches', title: 'Matches' },
		{ link: '/records', title: 'Records' },
		{ link: '/stats', title: 'Stats' },
		{ link: '/leaderboard', title: 'Leaderboard' },
		{ link: '/about', title: 'About' }
	];
</script>

<div class="text-neutral-100 bg-neutral-900 p-4 min-h-screen">
	<div class="max-w-screen-2xl mx-auto">
		<div>
			<div class="w-full flex items-center justify-center gap-8">
				<a
					href="/"
					class="flex items-center justify-center text-lg rounded-full text-center font-display gap-1w-48"
				>
					<div>whos-playing</div>
				</a>
				<div class="flex items-center justify-center">
					<div class="w-fit my-2 bg-neutral-700 flex justify-center items-center rounded-full">
						<div class="flex gap-4 justify-center items-center">
							{#each links as link}
								{#if link.link == $page.url.pathname}
									<a
										href={link.link}
										class="text-lg bg-rose-500 py-2 px-4 rounded-full w-36 text-center"
										>{link.title}</a
									>
								{:else}
									<a
										href={link.link}
										class="text-lg hover:text-indigo-400 py-2 px-4 rounded-full w-36 text-center"
										>{link.title}</a
									>
								{/if}
							{/each}
						</div>
					</div>
				</div>
				<div>
					<select name="players" class="bg-neutral-800 w-48 py-2 px-2 accent-rose-500">
						<option selected disabled>Search Players</option>
						{#each playerList as player}
							<option value={player.id} class="hover:bg-rose-500">{player.username}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>
	<div class="flex justify-center">
		<slot />
	</div>
</div>
