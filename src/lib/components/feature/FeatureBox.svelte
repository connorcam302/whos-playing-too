<script lang="ts">
	type Player = {
		id: number;
		username: string;
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

	import { getStatColour } from '$lib/functions';
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
								<div>{data[0].username}</div>
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
			<div class="h-7">{data[1].username}</div>
			<div class="grow" />
			<div>{data[1][type]}</div>
		</div>
		<div class="flex flex-row items-center px-4 py-0.5 h-7">
			<div class="flex h-7 items-center">{data[2].username}</div>
			<div class="grow" />
			<div>{data[2][type]}</div>
		</div>
	</div>
{:else}
	<div
		class="bg-neutral-800 bg-opacity-100 border-[1px] border-neutral-200 border-opacity-15 rounded-xl w-72"
	>
		<div class="rounded-xl border-white border-b-[1px] border-opacity-15">
			<div
				class={`bg-cover bg-center bg-no-repeat rounded-xl min-h-28 `}
				style={`background-image: url('${data[0].hero.img}')`}
			>
				<div class="flex bg-black bg-opacity-70 py-2 px-4 rounded-xl min-h-28">
					<div class="grow flex flex-col">
						<div class="text-2xl font-bold text-center font-display">{title}</div>
						<div class="flex-1 grow" />
						<div class="flex flex-row justify-between text-3xl">
							<div>{data[0].username}</div>
							<div>{data[0][type]}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div
			class="flex flex-row items-center px-4 py-0.5 rounded-xl border-white border-b-[1px] border-opacity-15"
		>
			<div><img src={data[1].hero.img} class="h-7 mr-2" /></div>
			<div>{data[1].username}</div>
			<div class="grow" />
			<div>{data[1][type]}</div>
		</div>
		<div class="flex flex-row items-center px-4 py-0.5">
			<div><img src={data[2].hero.img} class="h-7 mr-2" /></div>
			<div>{data[2].username}</div>
			<div class="grow" />
			<div>{data[2][type]}</div>
		</div>
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
</style>
