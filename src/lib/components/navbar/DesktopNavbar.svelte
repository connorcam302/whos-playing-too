<script lang="ts">
	import DesktopNavbar from '$lib/components/navbar/DesktopNavbar.svelte';
	import { page } from '$app/state';
	import * as Command from '$lib/components/ui/command';
	import { goto } from '$app/navigation';
	import SearchBox from '../SearchBox.svelte';

	let { playerList = [], links = [] } = $props();

	let navigateTo = $state(0);

	const navigate = (playerId: string) => {
		goto('/player/' + playerId);
	};

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

<div class="mx-auto">
	<div>
		<div class="flex w-full items-center justify-center gap-8">
			<a
				href="/"
				class="gap-1w-48 flex items-center justify-center gap-2 rounded-full text-center font-display text-lg"
			>
				<img src="/logo.png" alt="whos-playing logo" class="h-7 w-7" />
				<div>whos-playing</div>
			</a>
			<SearchBox groups={searchGroups} />
			<div class="flex h-full items-center justify-center">
				<div class="flex h-full w-fit items-center justify-center">
					<div class="flex h-full items-center justify-center gap-4">
						{#each links as link}
							{#if false}
								<div
									class="flex-1 flex-col items-center justify-center border-b-2 border-b-sky-500 bg-gradient-to-t from-sky-950 py-2 pt-2 transition-all"
								>
									<div class="mx-auto w-full grow rounded-full py-1 text-center">
										<a href={link.link} class="text-center">{link.title}</a>
									</div>
								</div>
							{:else}
								<div
									class="flex-1 flex-col items-center justify-center border-b-2 border-b-transparent py-2 pt-2"
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
		</div>
	</div>
</div>
