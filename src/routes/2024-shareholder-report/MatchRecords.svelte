<script lang="ts">
	import dayjs from 'dayjs';
	import type { PageData } from '../$types';
	import MatchDisplay from './MatchDisplay.svelte';
	import localizedFormat from 'dayjs/plugin/localizedFormat';

	dayjs.extend(localizedFormat);

	interface Props {
		matches: PageData;
	}

	let { matches }: Props = $props();
</script>

<div
	class="flex max-w-screen-sm flex-col items-center justify-center gap-4 px-2 text-center md:max-w-screen-lg"
>
	<div>
		<div class="text-center text-4xl">Match Records</div>
		<div class="text-center text-lg">
			Here are some of the matches throughout 2024 that stood out, all of these are 5-stack games
			with smaller stacks being excluded from the rankings. We will start with the positive.
		</div>
	</div>
	<div class="flex flex-col gap-24">
		<div class="flex flex-col gap-1">
			<div class="text-3xl">Longest Match</div>
			<div class="text-2xl">Duration: 1:22:07</div>
			<div class="text-right text-sm text-zinc-200">
				{dayjs(dayjs.unix(matches.longestMatch[0].startTime)).format('lll')}
			</div>
			<MatchDisplay match={matches.longestMatch} />
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-3xl">Best Match</div>
			<div>The match with the highest average impact score.</div>
			<div class="text-2xl">Average Impact: 258</div>
			<div class="text-right text-sm text-zinc-200">
				{dayjs(dayjs.unix(matches.bestMatch[0].startTime)).format('lll')}
			</div>
			<MatchDisplay match={matches.bestMatch} />
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-3xl">Highest Total Kills</div>
			<div class="text-2xl">Total Kills: 83</div>
			<div class="text-right text-sm text-zinc-200">
				{dayjs(dayjs.unix(matches.highestKillGame[0].startTime)).format('lll')}
			</div>
			<MatchDisplay match={matches.highestKillGame} />
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-3xl">Least Total Deaths</div>
			<div class="text-2xl">Total Deaths: 2</div>
			<div class="text-right text-sm text-zinc-200">
				{dayjs(dayjs.unix(matches.lowestDeathsGame[0].startTime)).format('lll')}
			</div>
			<MatchDisplay match={matches.lowestDeathsGame} />
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-3xl">Hardest Carry</div>
			<div>The match with the greatest differential in impact score.</div>
			<div class="text-right text-sm text-zinc-200">
				{dayjs(dayjs.unix(matches.hardestCarry[0].startTime)).format('lll')}
			</div>
			<MatchDisplay match={matches.hardestCarry} />
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-3xl">Most Total Farm</div>
			<div class="text-right text-sm text-zinc-200">
				{dayjs(dayjs.unix(matches.highestFarmGame[0].startTime)).format('lll')}
			</div>
			<MatchDisplay match={matches.highestFarmGame} />
		</div>
		<div class="text-center text-lg">
			However, some matches stood out as being particularly bad. Lets look at some of the lows.
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-3xl">Worst Match</div>
			<div>The match with the lowest average impact score.</div>
			<div class="text-2xl">Average Impact: 28</div>
			<div class="text-right text-sm text-zinc-200">
				{dayjs(dayjs.unix(matches.worstMatch[0].startTime)).format('lll')}
			</div>
			<MatchDisplay match={matches.worstMatch} />
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-3xl">Lowest Total Kills</div>
			<div class="text-2xl">Total Kills: 2</div>
			<div class="text-right text-sm text-zinc-200">
				{dayjs(dayjs.unix(matches.lowestKillGame[0].startTime)).format('lll')}
			</div>
			<MatchDisplay match={matches.lowestKillGame} />
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-3xl">Most Total Deaths</div>
			<div class="text-2xl">Deaths: 86</div>
			<div class="text-right text-sm text-zinc-200">
				{dayjs(dayjs.unix(matches.highestDeathsGame[0].startTime)).format('lll')}
			</div>
			<MatchDisplay match={matches.highestDeathsGame} />
		</div>
	</div>
</div>
