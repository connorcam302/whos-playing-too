<script lang="ts">
	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import MatchModal from '$lib/components/match/MatchModal.svelte';

	dayjs.extend(relativeTime);
	import { getStatColour } from '$lib/functions';
	import { twMerge } from 'tailwind-merge';

	type Player = {
		id: number;
		username: string;
		matchId?: number;
		sequenceNumber?: number;
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

	interface Props {
		data?: Player[];
		title?: string;
		type?: string;
	}

	let {
		data = [
			{ id: -1, username: 'PLAYER 1', kills: 999 },
			{ id: -1, username: 'PLAYER 1', kills: 999 },
			{ id: -1, username: 'PLAYER 1', kills: 999 }
		],
		title = 'RECORD TITLE',
		type = 'kills'
	}: Props = $props();

	let hoverColour = getStatColour(type) + 40;
</script>

<div class="w-64">
	{#if type == 'winLoss'}
		<div class="w-64 rounded-lg border">
			<div class="max-h-28 rounded-t-lg">
				<div class="rounded-t-lg">
					<div
						class={`max-w-auto max-h-28 rounded-t-lg bg-cover bg-center`}
						id={title === 'Most MMR Lost' ? `down-arrows` : `up-arrows`}
					>
						<div class="flex h-28 rounded-t-lg bg-[#00000080] px-4 py-2">
							<div class="flex grow flex-col">
								<div class="font-display text-center text-2xl">{title}</div>
								<div class="flex-1 grow"></div>
								<div class="flex flex-row justify-between text-2xl">
									<button
										onclick={() => goto(`/player/${data[0].id}`)}
										class="duration-300 hover:text-zinc-400"
									>
										<div>{data[0].username}</div>
									</button>
									<div
										id="feature"
										class="text-4xl font-bold"
										style={`color: ${getStatColour(
											title == 'Most MMR Gained' ? 'wins' : 'losses'
										)};`}
									>
										{title === 'Most MMR Lost' ? '' : '+'}{data[0][type]}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="flex flex-col gap-1 border-t py-1">
				<div class="flex h-7 w-full flex-row items-center rounded-lg px-3">
					<button
						onclick={() => goto(`/player/${data[1].id}`)}
						class="duration-300 hover:text-zinc-400"
					>
						<div>{data[1].username}</div>
					</button>
					<div class="grow"></div>
					<div>{title === 'Most MMR Lost' ? '' : '+'}{data[1][type]}</div>
				</div>
				<div class="flex w-full">
					<div class="grow border-t"></div>
				</div>
				<div class="flex h-7 w-full flex-row items-center px-3">
					<button
						onclick={() => goto(`/player/${data[2].id}`)}
						class="duration-300 hover:text-zinc-400"
					>
						<div>{data[2].username}</div>
					</button>
					<div class="grow"></div>
					<div>{title === 'Most MMR Lost' ? '' : '+'}{data[2][type]}</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="w-64 rounded-lg border">
			<div class="border-opacity-15 rounded-t-lg">
				<MatchModal matchId={data[0].matchId} sequenceNum={data[0].sequenceNumber}>
					<div
						class={`min-h-28 w-full rounded-t-lg bg-cover bg-center bg-no-repeat`}
						style={`background-image: url('${data[0]?.hero?.img}')`}
					>
						<div class="bg-opacity-70 flex min-h-28 rounded-t-lg bg-[#00000099] px-3 py-2">
							<div class="flex grow flex-col">
								<div class="font-display text-center text-xl">{title}</div>
								<div class="flex-1 grow"></div>
								<div class="flex flex-row justify-between text-3xl">
									<button
										onclick={() => goto(`/player/${data[0].id}`)}
										class="duration-300 hover:text-zinc-400"
									>
										<div>{data[0].username}</div>
									</button>
									<div class="font-bold" id="feature" style="color: {getStatColour(type)};">
										{data[0][type]}
									</div>
								</div>
							</div>
						</div>
					</div>
				</MatchModal>
			</div>
			<div class="flex flex-col border-t">
				<MatchModal matchId={data[1].matchId} sequenceNum={data[1].sequenceNumber}>
					<div
						class="dynamic-bg flex w-full flex-row items-center px-3 py-1"
						style="--hover-color: {hoverColour};"
					>
						<div><img src={data[1]?.hero?.img} class="mr-2 h-7" alt={data[2]?.hero?.name} /></div>
						<button
							onclick={() => goto(`/player/${data[1].id}`)}
							class="duration-300 hover:text-zinc-400"
						>
							<div>{data[1].username}</div>
						</button>
						<div class="grow"></div>
						<div class="font-bold" style="color: {getStatColour(type)};">{data[1][type]}</div>
					</div>
				</MatchModal>
				<div class="flex w-full">
					<div class="grow border-t"></div>
				</div>
				<MatchModal matchId={data[2].matchId} sequenceNum={data[2].sequenceNumber}>
					<div
						class="dynamic-bg flex w-full flex-row items-center rounded-b-lg px-3 py-1"
						style="--hover-color: {hoverColour};"
					>
						<div><img src={data[2]?.hero?.img} class="mr-2 h-7" alt={data[2]?.hero?.name} /></div>
						<button
							onclick={() => goto(`/player/${data[2].id}`)}
							class="duration-300 hover:text-zinc-400"
						>
							<div>{data[2].username}</div>
						</button>
						<div class="grow"></div>
						<div class="font-bold" style="color: {getStatColour(type)};">{data[2][type]}</div>
					</div>
				</MatchModal>
			</div>
		</div>
	{/if}
</div>

<style>
	.dynamic-bg:hover {
		background-color: var(--hover-color);
		transition-duration: 0.3s;
	}

	#feature {
		text-shadow: 3px 3px 8px #000000;
	}

	@keyframes downScroll {
		0% {
			background-position: 0px -24000px;
		}
		100% {
			background-position: 0px 0px;
		}
	}

	#down-arrows {
		background-image: url('/down-arrows.png') !important;
		animation: downScroll 600s linear infinite !important;
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
		background-image: url('/up-arrows.png') !important;
		animation: upScroll 600s linear infinite !important;
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
