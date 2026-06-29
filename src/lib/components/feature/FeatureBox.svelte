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

<div class="w-full">
	{#if type == 'winLoss'}
		<div class="w-full rounded-md border border-zinc-800">
			<div
				class="rounded-t-md bg-cover bg-center"
				id={title === 'Most MMR Lost' ? `down-arrows` : `up-arrows`}
			>
				<div class="flex h-20 rounded-t-md bg-[#00000080] px-3 py-1.5">
					<div class="flex grow flex-col">
						<div class="font-display text-center text-base">{title}</div>
						<div class="grow"></div>
						<div class="flex items-end justify-between">
							<button
								onclick={() => goto(`/player/${data[0].id}`)}
								class="text-sm duration-200 hover:text-zinc-400"
							>
								{data[0].username}
							</button>
							<div
								id="feature"
								class="text-xl font-bold"
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
			<div class="flex flex-col border-t border-zinc-800">
				<div class="flex items-center px-2.5 py-1 text-sm">
					<button
						onclick={() => goto(`/player/${data[1].id}`)}
						class="duration-200 hover:text-zinc-400"
					>
						{data[1].username}
					</button>
					<div class="grow"></div>
					<div>{title === 'Most MMR Lost' ? '' : '+'}{data[1][type]}</div>
				</div>
				<div class="border-t border-zinc-800"></div>
				<div class="flex items-center px-2.5 py-1 text-sm">
					<button
						onclick={() => goto(`/player/${data[2].id}`)}
						class="duration-200 hover:text-zinc-400"
					>
						{data[2].username}
					</button>
					<div class="grow"></div>
					<div>{title === 'Most MMR Lost' ? '' : '+'}{data[2][type]}</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="w-full rounded-md border border-zinc-800">
			<MatchModal matchId={data[0].matchId} sequenceNum={data[0].sequenceNumber}>
				<div
					class="w-full rounded-t-md bg-cover bg-center bg-no-repeat"
					style={`background-image: url('${data[0]?.hero?.img}')`}
				>
					<div class="flex h-20 rounded-t-md bg-[#00000099] px-3 py-1.5">
						<div class="flex grow flex-col">
							<div class="font-display text-center text-base">{title}</div>
							<div class="grow"></div>
							<div class="flex items-end justify-between">
								<button
									onclick={() => goto(`/player/${data[0].id}`)}
									class="text-sm duration-200 hover:text-zinc-400"
								>
									{data[0].username}
								</button>
								<div class="text-xl font-bold" id="feature" style="color: {getStatColour(type)};">
									{data[0][type]}
								</div>
							</div>
						</div>
					</div>
				</div>
			</MatchModal>
			<div class="flex flex-col border-t border-zinc-800">
				<MatchModal matchId={data[1].matchId} sequenceNum={data[1].sequenceNumber}>
					<div
						class="dynamic-bg flex w-full items-center px-2.5 py-1 text-sm"
						style="--hover-color: {hoverColour};"
					>
						<img src={data[1]?.hero?.img} class="mr-1.5 h-5" alt={data[1]?.hero?.name} />
						<button
							onclick={() => goto(`/player/${data[1].id}`)}
							class="duration-200 hover:text-zinc-400"
						>
							{data[1].username}
						</button>
						<div class="grow"></div>
						<div class="font-bold" style="color: {getStatColour(type)};">{data[1][type]}</div>
					</div>
				</MatchModal>
				<div class="border-t border-zinc-800"></div>
				<MatchModal matchId={data[2].matchId} sequenceNum={data[2].sequenceNumber}>
					<div
						class="dynamic-bg flex w-full items-center rounded-b-md px-2.5 py-1 text-xs"
						style="--hover-color: {hoverColour};"
					>
						<img src={data[2]?.hero?.img} class="mr-1.5 h-5" alt={data[2]?.hero?.name} />
						<button
							onclick={() => goto(`/player/${data[2].id}`)}
							class="duration-200 hover:text-zinc-400"
						>
							{data[2].username}
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
		text-shadow: 2px 2px 6px #000000;
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
</style>
