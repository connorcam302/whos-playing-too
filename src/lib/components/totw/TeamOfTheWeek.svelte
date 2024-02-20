<script lang="ts">
	import { goto } from '$app/navigation';
	import TitleBar from '$lib/components/totw/TitleBar.svelte';
	import dayjs from 'dayjs';
	import weekday from 'dayjs/plugin/weekday';
	import advancedFormat from 'dayjs/plugin/advancedFormat';
	dayjs.extend(weekday);
	dayjs.extend(advancedFormat);

	export let totw: {
		id: number;
		onePlayer: number;
		oneHero: number;
		onePlayerName: string;
		twoPlayer: number;
		twoHero: number;
		twoPlayerName: string;
		threePlayer: number;
		threeHero: number;
		threePlayerName: string;
		fourPlayer: number;
		fourHero: number;
		fourPlayerName: string;
		fivePlayer: number;
		fiveHero: number;
		fivePlayerName: string;
		oneHeroId: string;
		twoHeroId: string;
		threeHeroId: string;
		fourHeroId: string;
		fiveHeroId: string;
	};

	import FeaturePlayer from '$lib/components/totw/FeaturePlayer.svelte';
</script>

<div
	class="border-zinc-200 border-opacity-15 rounded-lg px-2 pb-2 h-fit flex flex-col justify-center items-center"
>
	<div class="flex flex-col justify-center items-center my-2">
		<div id="title" class="font-display text-center w-fit text-4xl pt-1 px-4">TEAM OF THE WEEK</div>
		<div class="text-zinc-400 text-sm">
			{dayjs(dayjs().weekday(+1), 'YYYY-MM-DD').format('dddd Do [of] MMMM')} 00:00 - {dayjs(
				dayjs().weekday(+7),
				'YYYY-MM-DD'
			).format('dddd Do [of] MMMM')} 23:59
		</div>
	</div>
	<div class="grow" />
	<div class="flex gap-2">
		<div class="flex flex-col justify-center bg-zinc-800 rounded-xl pt-2">
			<div class="w-48 h-48 mx-2">
				<FeaturePlayer data={{ hero: totw.oneHeroId, role: 1 }} />
			</div>
			<div class="flex my-2 h-10 w-44 justify-center items-center mx-auto px-2 rounded-xl">
				<div class="w-full">
					<TitleBar name={totw.onePlayerName} role={1} id={totw.onePlayer} team={'radiant'} />
				</div>
			</div>
		</div>
		<div class="flex flex-col justify-center bg-zinc-800 rounded-xl pt-2">
			<div class="w-48 h-48 mx-2">
				<FeaturePlayer data={{ hero: totw.twoHeroId, role: 2 }} />
			</div>
			<div class="flex my-2 h-10 w-44 justify-center items-center mx-auto px-2 rounded-xl">
				<div class="w-full">
					<TitleBar name={totw.twoPlayerName} role={2} id={totw.twoPlayer} team={'radiant'} />
				</div>
			</div>
		</div>

		<div class="flex flex-col justify-center bg-zinc-800 rounded-xl pt-2">
			<div class="w-48 h-48 mx-2">
				<FeaturePlayer data={{ hero: totw.threeHeroId, role: 3 }} />
			</div>
			<div class="flex my-2 h-10 w-44 justify-center items-center mx-auto px-2 rounded-xl">
				<div class="w-full">
					<TitleBar name={totw.threePlayerName} role={3} id={totw.threePlayer} team={'radiant'} />
				</div>
			</div>
		</div>
		<div class="flex flex-col justify-center bg-zinc-800 rounded-xl pt-2">
			<div class="w-48 h-48 mx-2">
				<FeaturePlayer data={{ hero: totw.fourHeroId, role: 4 }} />
			</div>
			<div class="flex my-2 h-10 w-44 justify-center items-center mx-auto px-2 rounded-xl">
				<div class="w-full">
					<TitleBar name={totw.fourPlayerName} role={4} id={totw.fourPlayer} team={'radiant'} />
				</div>
			</div>
		</div>
		<div class="flex flex-col justify-center bg-zinc-800 rounded-xl pt-2">
			<div class="w-48 h-48 mx-2">
				<FeaturePlayer data={{ hero: totw.fiveHeroId, role: 5 }} />
			</div>
			<div class="flex my-2 h-10 w-44 justify-center items-center mx-auto px-2 rounded-xl">
				<div class="w-full">
					<TitleBar name={totw.fivePlayerName} role={5} id={totw.fivePlayer} team={'radiant'} />
				</div>
			</div>
		</div>
	</div>
</div>
