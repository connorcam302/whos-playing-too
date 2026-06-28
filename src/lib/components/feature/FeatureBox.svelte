<script lang="ts">
	import { goto } from '$app/navigation';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import { getStatColour } from '$lib/functions';

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

	export let data: Player[] = [];
	export let title: string = 'RECORD TITLE';
	export let type: string = 'kills';

	const emptyPlayer: Player = { id: -1, username: 'No data' };
	const getRow = (index: number) => data[index] ?? emptyPlayer;
	const hasRow = (index: number) => Boolean(data[index]);
	const getStat = (player: Player) => player[type as keyof Player] ?? '-';
	const getPrefix = (index: number) => (hasRow(index) && title !== 'Most MMR Lost' ? '+' : '');
	const goToPlayer = (player: Player) => {
		if (player.id !== -1) {
			goto(`/player/${player.id}`);
		}
	};
</script>

{#key title}
<div class="w-64">
	{#if type == 'winLoss'}
		<div class="w-64 rounded-xl bg-zinc-800 bg-opacity-100">
			<div class="max-h-28 rounded-xl">
				<div class="rounded-xl">
					<div
						class="max-w-auto max-h-28 rounded-xl bg-cover bg-center"
						id={title === 'Most MMR Lost' ? `down-arrows` : `up-arrows`}
					>
						<div class="flex h-28 rounded-xl bg-black bg-opacity-70 px-4 py-2">
							<div class="flex grow flex-col">
								<div class="text-center font-display text-2xl">{title}</div>
								<div class="flex-1 grow" />
								<div class="flex flex-row justify-between text-2xl">
									<button
										on:click={() => goToPlayer(getRow(0))}
										class="duration-300 hover:text-zinc-400 disabled:cursor-default disabled:hover:text-white"
										disabled={!hasRow(0)}
									>
										<div>{getRow(0).username}</div>
									</button>
									<div
										id="feature"
										class="text-4xl font-bold"
										style={`color: ${getStatColour(
											title == 'Most MMR Gained' ? 'wins' : 'losses'
										)};`}
									>
										{getPrefix(0)}{getStat(getRow(0))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="flex flex-col gap-1 py-1">
				{#each [1, 2] as rowIndex}
					<div class="flex h-7 w-full flex-row items-center rounded-xl px-3">
						<button
							on:click={() => goToPlayer(getRow(rowIndex))}
							class="duration-300 hover:text-zinc-400 disabled:cursor-default disabled:hover:text-white"
							disabled={!hasRow(rowIndex)}
						>
							<div>{getRow(rowIndex).username}</div>
						</button>
						<div class="grow" />
						<div>{getPrefix(rowIndex)}{getStat(getRow(rowIndex))}</div>
					</div>
					{#if rowIndex === 1}
						<div class="flex w-full px-2">
							<div class="h-[1px] grow bg-zinc-200 bg-opacity-40" />
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{:else}
		<div class="w-64 rounded-xl bg-zinc-800 bg-opacity-100">
			<div class="rounded-xl border-opacity-15">
				<MatchModal matchId={getRow(0).matchId} sequenceNum={getRow(0).sequenceNumber}>
					<div
						class="min-h-28 w-full rounded-xl bg-cover bg-center bg-no-repeat"
						style={`background-image: url('${getRow(0).hero?.img ?? ''}')`}
					>
						<div class="flex min-h-28 rounded-xl bg-black bg-opacity-70 px-3 py-2">
							<div class="flex grow flex-col">
								<div class="text-center font-display text-xl">{title}</div>
								<div class="flex-1 grow" />
								<div class="flex flex-row justify-between text-3xl">
									<button
										on:click={() => goToPlayer(getRow(0))}
										class="duration-300 hover:text-zinc-400 disabled:cursor-default disabled:hover:text-white"
										disabled={!hasRow(0)}
									>
										<div>{getRow(0).username}</div>
									</button>
									<div class="font-bold" id="feature" style="color: {getStatColour(type)};">
										{getStat(getRow(0))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</MatchModal>
			</div>
			<div class="flex flex-col gap-1 py-1">
				{#each [1, 2] as rowIndex}
					<MatchModal matchId={getRow(rowIndex).matchId} sequenceNum={getRow(rowIndex).sequenceNumber}>
						<div class="flex w-full flex-row items-center rounded-xl px-3">
							{#if getRow(rowIndex).hero}
								<div>
									<img
										src={getRow(rowIndex).hero?.img}
										class="mr-2 h-7"
										alt={getRow(rowIndex).hero?.name}
									/>
								</div>
							{/if}
							<button
								on:click={() => goToPlayer(getRow(rowIndex))}
								class="duration-300 hover:text-zinc-400 disabled:cursor-default disabled:hover:text-white"
								disabled={!hasRow(rowIndex)}
							>
								<div>{getRow(rowIndex).username}</div>
							</button>
							<div class="grow" />
							<div class="font-bold" style="color: {getStatColour(type)};">
								{getStat(getRow(rowIndex))}
							</div>
						</div>
					</MatchModal>
					{#if rowIndex === 1}
						<div class="flex w-full px-2">
							<div class="h-[1px] grow bg-zinc-200 bg-opacity-40" />
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
{/key}

<style>
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
