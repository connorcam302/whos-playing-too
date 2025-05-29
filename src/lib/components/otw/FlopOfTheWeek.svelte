<script lang="ts">
	import { goto } from '$app/navigation';
	import TitleBar from '$lib/components/otw/TitleBar.svelte';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import { getContext } from 'svelte';
	import dayjs from 'dayjs';
	import weekday from 'dayjs/plugin/weekday';
	import advancedFormat from 'dayjs/plugin/advancedFormat';
	import FlopPlayer from './FlopPlayer.svelte';
	dayjs.extend(weekday);
	dayjs.extend(advancedFormat);

	interface Props {
		fotw: {
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

	let { fotw }: Props = $props();
</script>

<div class="flex h-fit flex-col items-center justify-center rounded-lg px-2 pb-2">
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
		<div
			class="flex w-28 flex-col justify-center rounded-xl border-2 border-[#4555a980] pt-2 duration-500 hover:bg-[#4555a950] md:w-36 md:hover:w-44 lg:w-48 lg:hover:w-56"
		>
			<MatchModal matchId={fotw.oneMatch} sequenceNum={fotw.oneSequence}>
				<div class="flex w-full flex-col items-center px-2">
					<div class="mx-2 w-full lg:max-h-48 lg:max-w-48">
						<FlopPlayer data={{ hero: fotw.oneHeroId, role: 1 }} />
					</div>
					<div class="mx-auto my-2 flex h-10 max-w-44 items-center justify-center rounded-xl px-2">
						<div class="w-full">
							<TitleBar name={fotw.onePlayerName} role={1} id={fotw.onePlayer} team={'radiant'} />
						</div>
					</div>
				</div>
			</MatchModal>
		</div>
		<div
			class="flex w-28 flex-col justify-center rounded-xl border-2 border-[#30879480] pt-2 duration-500 hover:bg-[#30879450] md:w-36 md:hover:w-44 lg:w-48 lg:hover:w-56"
		>
			<MatchModal matchId={fotw.twoMatch} sequenceNum={fotw.twoSequence}>
				<div class="flex w-full flex-col items-center px-2">
					<div class="mx-2 w-full lg:max-h-48 lg:max-w-48">
						<FlopPlayer data={{ hero: fotw.twoHeroId, role: 2 }} />
					</div>
					<div class="mx-auto my-2 flex h-10 max-w-44 items-center justify-center rounded-xl px-2">
						<div class="w-full">
							<TitleBar name={fotw.twoPlayerName} role={2} id={fotw.twoPlayer} team={'radiant'} />
						</div>
					</div>
				</div>
			</MatchModal>
		</div>

		<div
			class="flex w-28 flex-col justify-center rounded-xl border-2 border-[#C4771680] pt-2 duration-500 hover:bg-[#C4771650] md:w-36 md:hover:w-44 lg:w-48 lg:hover:w-56"
		>
			<MatchModal matchId={fotw.threeMatch} sequenceNum={fotw.threeSequence}>
				<div class="flex w-full flex-col items-center px-2">
					<div class="mx-2 w-full lg:max-h-48 lg:max-w-48">
						<FlopPlayer data={{ hero: fotw.threeHeroId, role: 3 }} />
					</div>
					<div class="mx-auto my-2 flex h-10 max-w-44 items-center justify-center rounded-xl px-2">
						<div class="w-full">
							<TitleBar
								name={fotw.threePlayerName}
								role={3}
								id={fotw.threePlayer}
								team={'radiant'}
							/>
						</div>
					</div>
				</div>
			</MatchModal>
		</div>
		<div
			class="flex w-28 flex-col justify-center rounded-xl border-2 border-[#C1475580] pt-2 duration-500 hover:bg-[#C1475550] md:w-36 md:hover:w-44 lg:w-48 lg:hover:w-56"
		>
			<MatchModal matchId={fotw.fourMatch} sequenceNum={fotw.fourSequence}>
				<div class="flex w-full flex-col items-center px-2">
					<div class="mx-2 w-full lg:max-h-48 lg:max-w-48">
						<FlopPlayer data={{ hero: fotw.fourHeroId, role: 4 }} />
					</div>
					<div class="mx-auto my-2 flex h-10 max-w-44 items-center justify-center rounded-xl px-2">
						<div class="w-full">
							<TitleBar name={fotw.fourPlayerName} role={4} id={fotw.fourPlayer} team={'radiant'} />
						</div>
					</div>
				</div>
			</MatchModal>
		</div>
		<div
			class="flex w-28 flex-col justify-center rounded-xl border-2 border-[#3D957280] pt-2 duration-500 hover:bg-[#3D957250] md:w-36 md:hover:w-44 lg:w-48 lg:hover:w-56"
		>
			<MatchModal matchId={fotw.fiveMatch} sequenceNum={fotw.fiveSequence}>
				<div class="flex w-full flex-col items-center px-2">
					<div class="mx-2 w-full lg:max-h-48 lg:max-w-48">
						<FlopPlayer data={{ hero: fotw.fiveHeroId, role: 5 }} />
					</div>
					<div class="mx-auto my-2 flex h-10 max-w-44 items-center justify-center rounded-xl px-2">
						<div class="w-full">
							<TitleBar name={fotw.fivePlayerName} role={5} id={fotw.fivePlayer} team={'radiant'} />
						</div>
					</div>
				</div>
			</MatchModal>
		</div>
	</div>
</div>
