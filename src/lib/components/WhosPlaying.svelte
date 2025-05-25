<script lang="ts">

	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	interface Props {
		allPlayerSteamData: any;
	}

	let { allPlayerSteamData }: Props = $props();
</script>

<div
	class="flex rounded-xl border-[1px] border-zinc-200 border-opacity-15 bg-zinc-800 bg-opacity-95 px-2 py-2"
>
	<div class="flex flex-col gap-2 overflow-y-scroll">
		{#each allPlayerSteamData as profile}
			{#if profile.gameextrainfo === 'Dota 2'}
				<div
					class="mr-2 rounded-lg border-[2px] border-solid border-sky-700 bg-sky-700 bg-opacity-5 p-1"
				>
					<div class="flex w-64 flex-col px-2 py-1">
						<div class="flex">
							<button
								onclick={() => goto(`/player/${profile.id}`)}
								class="duration-300 hover:text-zinc-400"
							>
								<div class="text-lg">{profile.username}</div>
							</button>
							<div class="flex grow justify-end"></div>
							<div class="h-3 w-3 rounded-full bg-sky-500"></div>
						</div>
						<div class="flex grow text-sm">
							<div class="text-zinc-400">
								{profile.personaname.length > 20
									? profile.personaname.substring(0, 18) + '...'
									: profile.personaname}
							</div>
							<div class="flex grow justify-end text-sky-500">In Game</div>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="mr-2 rounded-lg border-[2px] border-solid border-zinc-600 bg-zinc-600 bg-opacity-5 p-1"
				>
					<div class="flex w-64 flex-col px-2 py-1">
						<div class="flex">
							<button
								onclick={() => goto(`/player/${profile.id}`)}
								class="duration-300 hover:text-zinc-400"
							>
								<div class="text-lg">{profile.username}</div>
							</button>
							<div class="flex grow justify-end"></div>
							<div class="h-3 w-3 rounded-full bg-zinc-400"></div>
						</div>
						<div class="flex grow text-sm">
							<div class="text-zinc-400">
								{profile.personaname.length > 20
									? profile.personaname.substring(0, 18) + '...'
									: profile.personaname}
							</div>
							<div class="flex grow justify-end">
								{dayjs(profile.lastlogoff * 1000).from(dayjs())}
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
