<script lang="ts">
	export let allPlayerSteamData: any;

	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
</script>

<div
	class="flex bg-zinc-800 border-[1px] border-zinc-200 border-opacity-15 bg-opacity-95 rounded-xl px-2 py-2"
>
	<div class="flex flex-col gap-2 overflow-y-scroll">
		{#each allPlayerSteamData as profile}
			{#if profile.gameextrainfo === 'Dota 2'}
				<div
					class="border-[2px] border-solid border-sky-700 rounded-lg p-1 bg-sky-700 bg-opacity-5 mr-2"
				>
					<div class="flex flex-col w-64 px-2 py-1">
						<div class="flex">
							<button
								on:click={() => goto(`/player/${profile.id}`)}
								class="hover:text-zinc-400 duration-300"
							>
								<div class="text-lg">{profile.username}</div>
							</button>
							<div class="grow flex justify-end" />
							<div class="bg-sky-500 w-3 h-3 rounded-full" />
						</div>
						<div class="flex grow text-sm">
							<div class="text-zinc-400">
								{profile.personaname.length > 20
									? profile.personaname.substring(0, 18) + '...'
									: profile.personaname}
							</div>
							<div class="grow flex justify-end text-sky-500">In Game</div>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="border-[2px] border-solid border-zinc-600 rounded-lg p-1 bg-zinc-600 bg-opacity-5 mr-2"
				>
					<div class="flex flex-col w-64 px-2 py-1">
						<div class="flex">
							<button
								on:click={() => goto(`/player/${profile.id}`)}
								class="hover:text-zinc-400 duration-300"
							>
								<div class="text-lg">{profile.username}</div>
							</button>
							<div class="grow flex justify-end" />
							<div class="bg-zinc-400 w-3 h-3 rounded-full" />
						</div>
						<div class="flex grow text-sm">
							<div class="text-zinc-400">
								{profile.personaname.length > 20
									? profile.personaname.substring(0, 18) + '...'
									: profile.personaname}
							</div>
							<div class="grow flex justify-end">
								{dayjs(profile.lastlogoff * 1000).from(dayjs())}
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
