<script lang="ts">
	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import MatchModal from '$lib/components/match/MatchModal.svelte';

	dayjs.extend(relativeTime);
	import { getStatColour } from '$lib/functions';

	type Player = {
		id: number;
		username: string;
		matchId?: number;
		kills?: number;
		deaths?: number;
		assists?: number;
		gpm?: number;
		xpm?: number;
		impact?: number;
		lastHits?: number;
		heroDamage?: number;
		winLoss?: number;
		hero?: {
			id: number;
			name: string;
			img: string;
		};
	};

	export let data: Player[] = [
			{ id: -1, username: 'PLAYER 1', kills: 999 },
			{ id: -1, username: 'PLAYER 1', kills: 999 },
			{ id: -1, username: 'PLAYER 1', kills: 999 }
		],
		title: string = 'RECORD TITLE',
		type: string = 'kills';
</script>

{#if type == 'winLoss'}
	<div
		class="bg-neutral-800 bg-opacity-100 border-[1px] border-neutral-200 border-opacity-15 rounded-xl w-72"
	>
		<div class="rounded-xl border-white border-b-[1px] border-opacity-15 max-h-28">
			<div class="rounded-xl border-white border-b-[1px] border-opacity-15">
				<div
					class={`bg-cover bg-center rounded-xl max-h-28 max-w-auto`}
					id={title == 'Most MMR Lost' ? `down-arrows` : `up-arrows`}
				>
					<div class="flex bg-black bg-opacity-70 py-2 px-4 rounded-xl h-28">
						<div class="grow flex flex-col">
							<div class="text-2xl font-bold text-center font-display">{title}</div>
							<div class="flex-1 grow" />
							<div class="flex flex-row justify-between text-3xl">
								<button
									on:click={() => goto(`/player/${data[0].id}`)}
									class="hover:text-neutral-400 duration-300"
								>
									<div>{data[0].username}</div>
								</button>
								<div
									class="font-bold text-4xl"
									style={`color: ${getStatColour(title == 'Most MMR Gained' ? 'wins' : 'losses')};`}
								>
									{data[0][type]}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div
			class="flex flex-row items-center px-4 py-0.5 rounded-xl border-white border-b-[1px] border-opacity-15"
		>
			<button
				on:click={() => goto(`/player/${data[1].id}`)}
				class="hover:text-neutral-400 duration-300"
			>
				<div class="flex h-7 items-center">{data[1].username}</div>
			</button>
			<div class="grow" />
			<div>{data[1][type]}</div>
		</div>
		<div class="flex flex-row items-center px-4 py-0.5 h-7">
			<button
				on:click={() => goto(`/player/${data[2].id}`)}
				class="hover:text-neutral-400 duration-300"
			>
				<div class="flex h-7 items-center">{data[2].username}</div>
			</button>
			<div class="grow" />
			<div>{data[2][type]}</div>
		</div>
	</div>
{:else}
	<div
		class="bg-neutral-800 bg-opacity-100 border-[1px] border-neutral-200 border-opacity-15 rounded-xl w-72"
	>
		<div class="rounded-xl border-white border-b-[1px] border-opacity-15">
			<MatchModal matchId={data[0].matchId}>
				<div
					class={`bg-cover bg-center bg-no-repeat rounded-xl min-h-28 w-full`}
					style={`background-image: url('${data[0]?.hero?.img}')`}
				>
					<div class="flex bg-black bg-opacity-70 py-2 px-4 rounded-xl min-h-28">
						<div class="grow flex flex-col">
							<div class="text-2xl font-bold text-center font-display">{title}</div>
							<div class="flex-1 grow" />
							<div class="flex flex-row justify-between text-3xl">
								<button
									on:click={() => goto(`/player/${data[0].id}`)}
									class="hover:text-neutral-400 duration-300"
								>
									<div>{data[0].username}</div>
								</button>
								<div>{data[0][type]}</div>
							</div>
						</div>
					</div>
				</div>
			</MatchModal>
		</div>
		<MatchModal matchId={data[1].matchId}>
			<div
				class="flex flex-row items-center px-4 py-0.5 rounded-xl border-white border-b-[1px] border-opacity-15 w-full"
			>
				<div><img src={data[1]?.hero?.img} class="h-7 mr-2" alt={data[2]?.hero?.name} /></div>
				<button
					on:click={() => goto(`/player/${data[1].id}`)}
					class="hover:text-neutral-400 duration-300"
				>
					<div>{data[1].username}</div>
				</button>
				<div class="grow" />
				<div>{data[1][type]}</div>
			</div>
		</MatchModal>

		<MatchModal matchId={data[2].matchId}>
			<div class="flex flex-row items-center px-4 py-0.5 w-full">
				<div><img src={data[2]?.hero?.img} class="h-7 mr-2" alt={data[2]?.hero?.name} /></div>
				<button
					on:click={() => goto(`/player/${data[2].id}`)}
					class="hover:text-neutral-400 duration-300"
				>
					<div>{data[2].username}</div>
				</button>
				<div class="grow" />
				<div>{data[2][type]}</div>
			</div>
		</MatchModal>
	</div>
{/if}

<style>
	@keyframes downScroll {
		0% {
			background-position: 0px -24000px;
		}
		100% {
			background-position: 0px 0px;
		}
	}

	#down-arrows {
		background-image: url('/down-arrows.png');
		animation: downScroll 600s linear infinite;
	}

	@keyframes upScroll {
		0% {
			background-position: 0px 0px;
		}
		100% {
			background-position: 0px -24000px;
		}
	}

	#up-arrows {
		background-image: url('/up-arrows.png');
		animation: upScroll 600s linear infinite;
	}

	#backdrop {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.5);
	}

	:root {
		--splus-base: #fef3c7;
		--splus-accent1: #fcd34d;
		--splus-accent2: #fbbf24;

		--splusplus-base: #fdba74;
		--splusplus-accent1: #f97316;
		--splusplus-accent2: #ea580c;

		--f-base: #b45309;
		--f-accent1: #9a3412;
		--f-accent2: #7c2d12;
	}

	#srating {
		animation: srating 1s ease-in-out infinite alternate;
		color: var(--splus-base);
	}

	@keyframes srating {
		from {
			text-shadow:
				0 0 2px var(--splus-base),
				0 0 4px var(--splus-base),
				0 0 6px var(--splus-accent1),
				0 0 8px var(--splus-accent1),
				0 0 10px var(--splus-accent1),
				0 0 12px var(--splus-accent1),
				0 0 14px var(--splus-accent1);
		}
		to {
			text-shadow:
				0 0 4px var(--splus-base),
				0 0 8px var(--splus-accent2),
				0 0 12px var(--splus-accent2),
				0 0 12px var(--splus-accent2),
				0 0 15px var(--splus-accent2),
				0 0 18px var(--splus-accent2),
				0 0 21px var(--splus-accent2);
		}
	}

	#frating {
		color: var(--f-base);
		animation: frating 1s ease-in-out infinite alternate;
	}

	@keyframes frating {
		from {
			filter: drop-shadow(0 0 8px var(--f-accent1));
		}
		to {
			filter: drop-shadow(0 0 4px var(--f-accent2));
		}
	}

	#splusplusrating {
		color: var(--splusplus-base);
		animation: ssrating 1s ease-in-out infinite alternate;
	}

	@keyframes ssrating {
		from {
			text-shadow:
				0 0 2px var(--splusplus-base),
				0 0 4px var(--splusplus-base),
				0 0 6px var(--splusplus-accent1),
				0 0 8px var(--splusplus-accent1),
				0 0 10px var(--splusplus-accent1),
				0 0 12px var(--splusplus-accent1),
				0 0 14px var(--splusplus-accent1);
		}

		to {
			text-shadow:
				0 0 4px var(--splusplus-base),
				0 0 8px var(--splusplus-accent2),
				0 0 12px var(--splusplus-accent2),
				0 0 16px var(--splusplus-accent2),
				0 0 20px var(--splusplus-accent2),
				0 0 24px var(--splusplus-accent2),
				0 0 28px var(--splusplus-accent2);
		}
	}

	@keyframes shine {
		0% {
			background-position: left;
		}
		50% {
			background-position: right;
		}
		100% {
			background-position: left;
		}
	}
</style>
