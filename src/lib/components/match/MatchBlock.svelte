<script lang="ts">
	import { getGameMode } from '$lib/functions';
	import UilExchange from 'virtual:icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import UilQuestion from '~icons/uil/question';
	import PlayerData from '$lib/components/match/PlayerData.svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	export let match: any;
	const { matchData, radiant, dire } = match;

	const fetchMatchData = async () => {
		const res = await fetch(`/api/matches/${matchData.id}`);
		const data = await res.json();
	};
</script>

<div class="w-fit">
	<div
		id="box"
		class="bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 p-1 rounded-xl w-auto"
	>
		<div class="w-full">
			<div class="flex flex-row items-center gap-4 my-1 mx-2">
				<div class="flex items-center grow justify-start">
					<div class="flex gap-2">
						<div class="flex items-center gap-2">
							{#if matchData.lobby === 7}
								<UilExchange />
							{:else if matchData.lobby === 0}
								<BiDashLg />
							{:else}
								<UilQuestion />
							{/if}
							{getGameMode(matchData.gameMode)}
						</div>
						|
						<div>
							{(matchData.duration / 60) | 0}:{matchData.duration % 60 < 10
								? 0
								: ''}{matchData.duration % 60}
						</div>
					</div>
				</div>
				<div class="flex items-center grow gap-4 justify-end">
					<div>
						{dayjs(matchData.startTime * 1000 + matchData.duration * 1000).from(dayjs())}
					</div>
					<div class="flex gap-1">
						<a href={`https://www.dotabuff.com/matches/${matchData.id}`} target="_blank">
							<img src="/dotabuff.png" alt="dotabuff" class="h-5" />
						</a>
						<a href={`https://www.opendota.com/matches/${matchData.id}`} target="_blank">
							<img src="/opendota.png" alt="opendota" class="h-5" />
						</a>
						<a href={`https://stratz.com/match/${matchData.id}`} target="_blank">
							<img src="/stratz.png" alt="stratz" class="h-5" />
						</a>
					</div>
				</div>
			</div>
		</div>
		{#if radiant.length > 0}
			{#if matchData.winner == 'radiant'}
				<div
					class="border-[2px] border-solid border-green-700 rounded-lg p-1 bg-green-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
				>
					{#each radiant as player}
						<PlayerData {player} />
					{/each}
				</div>
			{:else}
				<div
					class="border-[2px] border-solid border-red-700 rounded-lg p-1 bg-red-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
				>
					{#each radiant as player}
						<PlayerData {player} />
					{/each}
				</div>
			{/if}
		{/if}
		{#if dire.length > 0}
			{#if matchData.winner == 'dire'}
				<div
					class="border-[2px] border-solid border-green-700 rounded-lg p-1 bg-green-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
				>
					{#each dire as player}
						<PlayerData {player} />
					{/each}
				</div>
			{:else}
				<div
					class="border-[2px] border-solid border-red-700 rounded-lg p-1 bg-red-700 bg-opacity-5 hover:bg-opacity-15 transition-all"
				>
					{#each dire as player}
						<PlayerData {player} />
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>
