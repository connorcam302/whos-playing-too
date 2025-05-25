<script lang="ts">
	import { goto } from '$app/navigation';
	import TitleBar from '$lib/components/otw/TitleBar.svelte';
	import FeaturePlayer from '$lib/components/otw/FeaturePlayer.svelte';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import { getContext } from 'svelte';
	import dayjs from 'dayjs';
	import weekday from 'dayjs/plugin/weekday';
	import advancedFormat from 'dayjs/plugin/advancedFormat';
	dayjs.extend(weekday);
	dayjs.extend(advancedFormat);

	interface Props {
		totw: {
		id: number;
		onePlayer: number;
		oneHero: number;
		onePlayerName: string;
		oneSequence: number;
		twoPlayer: number;
		twoHero: number;
		twoPlayerName: string;
		twoSequence: number;
		threePlayer: number;
		threeHero: number;
		threePlayerName: string;
		threeSequence: number;
		fourPlayer: number;
		fourHero: number;
		fourPlayerName: string;
		fourSequence: number;
		fivePlayer: number;
		fiveHero: number;
		fivePlayerName: string;
		fiveSequence: number;
		oneHeroId: string;
		twoHeroId: string;
		threeHeroId: string;
		fourHeroId: string;
		fiveHeroId: string;
		oneMatch: number;
		twoMatch: number;
		threeMatch: number;
		fourMatch: number;
		fiveMatch: number;
	};
	}

	let { totw }: Props = $props();
</script>

<div
	class="flex h-fit flex-col items-center justify-center rounded-lg border-zinc-200 border-opacity-15 px-2 pb-2"
>
	<div class="my-2 flex flex-col items-center justify-center">
		<div id="title" class="w-fit px-4 pt-1 text-center font-display text-4xl">TEAM OF THE WEEK</div>
		<div class="text-center text-sm text-zinc-400">
			{dayjs(dayjs().weekday(-6), 'YYYY-MM-DD').format('dddd Do [of] MMMM')} - {dayjs(
				dayjs().weekday(0),
				'YYYY-MM-DD'
			).format('dddd Do [of] MMMM')}
		</div>
	</div>
	<div class="grow"></div>
	<div class="flex flex-wrap justify-center gap-2">
		<div class="flex w-28 flex-col justify-center rounded-xl bg-zinc-800 pt-2 md:w-36 lg:w-48">
			<MatchModal matchId={totw.oneMatch} sequenceNum={totw.oneSequence}>
				<div class="mx-2 lg:max-h-48 lg:max-w-48">
					<FeaturePlayer data={{ hero: totw.oneHeroId, role: 1 }} />
				</div>
				<div class="mx-auto my-2 flex h-10 max-w-44 items-center justify-center rounded-xl px-2">
					<div class="w-full">
						<TitleBar name={totw.onePlayerName} role={1} id={totw.onePlayer} team={'radiant'} />
					</div>
				</div>
			</MatchModal>
		</div>
		<div class="flex w-28 flex-col justify-center rounded-xl bg-zinc-800 pt-2 md:w-36 lg:w-48">
			<MatchModal matchId={totw.twoMatch} sequenceNum={totw.twoSequence}>
				<div class="mx-2 lg:max-h-48 lg:max-w-48">
					<FeaturePlayer data={{ hero: totw.twoHeroId, role: 2 }} />
				</div>
				<div class="mx-auto my-2 flex h-10 max-w-44 items-center justify-center rounded-xl px-2">
					<div class="w-full">
						<TitleBar name={totw.twoPlayerName} role={2} id={totw.twoPlayer} team={'radiant'} />
					</div>
				</div>
			</MatchModal>
		</div>

		<div class="flex w-28 flex-col justify-center rounded-xl bg-zinc-800 pt-2 md:w-36 lg:w-48">
			<MatchModal matchId={totw.threeMatch} sequenceNum={totw.threeSequence}>
				<div class="mx-2 lg:max-h-48 lg:max-w-48">
					<FeaturePlayer data={{ hero: totw.threeHeroId, role: 3 }} />
				</div>
				<div class="mx-auto my-2 flex h-10 max-w-44 items-center justify-center rounded-xl px-2">
					<div class="w-full">
						<TitleBar name={totw.threePlayerName} role={3} id={totw.threePlayer} team={'radiant'} />
					</div>
				</div>
			</MatchModal>
		</div>
		<div class="flex w-28 flex-col justify-center rounded-xl bg-zinc-800 pt-2 md:w-36 lg:w-48">
			<MatchModal matchId={totw.fourMatch} sequenceNum={totw.fourSequence}>
				<div class="mx-2 lg:max-h-48 lg:max-w-48">
					<FeaturePlayer data={{ hero: totw.fourHeroId, role: 4 }} />
				</div>
				<div class="mx-auto my-2 flex h-10 max-w-44 items-center justify-center rounded-xl px-2">
					<div class="w-full">
						<TitleBar name={totw.fourPlayerName} role={4} id={totw.fourPlayer} team={'radiant'} />
					</div>
				</div>
			</MatchModal>
		</div>
		<div class="flex w-28 flex-col justify-center rounded-xl bg-zinc-800 pt-2 md:w-36 lg:w-48">
			<MatchModal matchId={totw.fiveMatch} sequenceNum={totw.fiveSequence}>
				<div class="mx-2 lg:max-h-48 lg:max-w-48">
					<FeaturePlayer data={{ hero: totw.fiveHeroId, role: 5 }} />
				</div>
				<div class="mx-auto my-2 flex h-10 max-w-44 items-center justify-center rounded-xl px-2">
					<div class="w-full">
						<TitleBar name={totw.fivePlayerName} role={5} id={totw.fivePlayer} team={'radiant'} />
					</div>
				</div>
			</MatchModal>
		</div>
	</div>
</div>
