<script lang="ts">
	import dayjs from 'dayjs';
	import weekday from 'dayjs/plugin/weekday';
	import advancedFormat from 'dayjs/plugin/advancedFormat';
	import type { InferSelectModel } from 'drizzle-orm';
	import type { matchData, matches } from '$lib/server/schema';
	import FlopOfTheWeekCard from './FlopOfTheWeekCard.svelte';
	dayjs.extend(weekday);
	dayjs.extend(advancedFormat);

	interface Match {
		id: number;
		player: {
			name: string;
			id: number;
		};
		sequence: number;
		hero: string;
		impact: number;
		gameData: {
			matchData: InferSelectModel<typeof matches>;
			playerData: InferSelectModel<typeof matchData>;
		};
		role: number;
	}

	interface Props {
		totw: Match[];
	}

	let { fotw }: Props = $props();
</script>

<div class="flex h-fit flex-col items-center justify-center rounded-lg px-2 pb-2">
	<div class="my-2 flex flex-col items-center justify-center">
		<div id="title" class="font-display w-fit px-4 pt-1 text-center text-4xl">TEAM OF THE WEEK</div>
		<div class="text-center text-sm text-zinc-400">
			{dayjs(dayjs().weekday(-6), 'YYYY-MM-DD').format('dddd Do [of] MMMM')} - {dayjs(
				dayjs().weekday(0),
				'YYYY-MM-DD'
			).format('dddd Do [of] MMMM')}
		</div>
	</div>
	<div class="grow"></div>
	<div class="flex flex-wrap justify-center gap-2">
		{#each fotw as match}
			<FlopOfTheWeekCard {match} />
		{/each}
	</div>
</div>
