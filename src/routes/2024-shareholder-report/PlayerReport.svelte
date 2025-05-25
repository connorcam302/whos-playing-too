<script lang="ts">
	import FeaturePlayer from '$lib/components/otw/FeaturePlayer.svelte';
	import { heroData } from '$lib/data/heroData';
	import { calcImpact } from '$lib/functions';
	import { players } from './PlayerData';
	import FxemojiPoo from '~icons/fxemoji/poo';

	type HeroStats = {
		name: string;
		matches: string;
		winrate: string;
		impact?: string;
		kills?: string;
		deaths?: string;
		assists?: string;
		gpm?: string;
		xpm?: string;
	};

	type PlayerData = {
		player_name: string;
		role_combination: string;
		character_and_game: {
			character: string;
			game: string;
		};
		most_played_heroes: HeroStats[];
		best_heroes: HeroStats[];
		matches_played: string;
		win_rate_percentage: string;
		average_impact: string;
	};

	interface Props {
		player: PlayerData;
	}

	let { player = $bindable() }: Props = $props();
	player = { ...player, ...players.find((obj) => obj.username === player.player_name) };
</script>

<div class="rounded-xl bg-zinc-800 p-4">
	<div class="flex flex-col gap-4">
		<div class="flex flex-wrap gap-2">
			<img src={player.avatarfull} class="h-32 w-32" />
			<div class="flex flex-col">
				<div class="text-left text-6xl">{player.username.toUpperCase()}</div>
				<div class="flex flex-wrap gap-8">
					<div class="flex flex-col text-left">
						<div class="text-xl text-zinc-400">Matches</div>
						<div class="text-3xl">{player.matches_played}</div>
					</div>
					<div class="flex flex-col text-left">
						<div class="text-xl text-zinc-400">Win Rate</div>
						<div class="text-3xl">{player.win_rate_percentage}%</div>
					</div>
					<div class="flex flex-col text-left">
						<div class="text-xl text-zinc-400">Impact</div>
						<div class="text-3xl">
							{#if player.average_impact > 200}
								<div id="splusplusrating" class="font-display">
									{calcImpact(player.average_impact)}
								</div>
							{:else if player.impact >= 140}
								<div id="srating" class="font-display">
									{calcImpact(player.average_impact)}
								</div>
							{:else if player.average_impact < 140 && player.average_impact > 25}
								<div class="font-display">
									{calcImpact(player.average_impact)}
								</div>
							{:else if player.average_impact <= 25}
								<div id="frating" class="flex justify-center font-display">
									<FxemojiPoo />
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="flex flex-wrap justify-between">
			<div class="flex flex-col gap-8">
				<div class="flex gap-2">
					<div class="w-48 rounded-xl bg-zinc-700">
						<FeaturePlayer
							data={{
								hero: heroData.find((hero) => hero.localized_name === player.best_heroes[0].name)
									?.name,
								backgroundColour: 'none'
							}}
						/>
					</div>
					<div class="grid grid-cols-2 items-center gap-x-4 gap-y-0">
						<div class="flex flex-col text-left">
							<div class="text-base text-zinc-400">Matches</div>
							<div class="text-xl">{player.best_heroes[0].matches}</div>
						</div>
						<div class="flex flex-col text-left">
							<div class="text-base text-zinc-400">Win Rate</div>
							<div class="text-xl">{player.best_heroes[0].winrate}%</div>
						</div>
						<div class="flex flex-col text-left">
							<div class="text-base text-zinc-400">Impact</div>
							<div class="text-xl">
								{#if player.best_heroes[0].winrate > 200}
									<div id="splusplusrating" class="font-display">
										{calcImpact(player.best_heroes[0].winrate)}
									</div>
								{:else if player.best_heroes[0].winrate >= 140}
									<div id="srating" class="font-display">
										{calcImpact(player.best_heroes[0].winrate)}
									</div>
								{:else if player.best_heroes[0].winrate < 140 && player.best_heroes[0].winrate > 25}
									<div class="font-display">
										{calcImpact(player.best_heroes[0].winrate)}
									</div>
								{:else if player.best_heroes[0].winrate <= 25}
									<div id="frating" class="flex justify-center font-display">
										<FxemojiPoo />
									</div>
								{/if}
							</div>
						</div>
						<div class="flex flex-col text-left">
							<div class="text-base text-zinc-400">Average Kills</div>
							<div class="text-xl">{player.best_heroes[0].kills}</div>
						</div>
						<div class="flex flex-col text-left">
							<div class="text-base text-zinc-400">Average Deaths</div>
							<div class="text-xl">{player.best_heroes[0].deaths}</div>
						</div>
						<div class="flex flex-col text-left">
							<div class="text-base text-zinc-400">Average Assists</div>
							<div class="text-xl">{player.best_heroes[0].assists}</div>
						</div>
					</div>
				</div>
				<div class="flex flex-wrap items-center justify-center gap-16">
					{#each [player.best_heroes[1], player.best_heroes[2]] as hero}
						<div class="flex flex-col gap-2">
							<img
								src={heroData.find((obj) => obj.localized_name === hero.name)?.img}
								class="mx-auto w-40"
							/>
							<div class="flex flex-wrap gap-2">
								<div class="flex flex-col text-left">
									<div class="text-sm text-zinc-400">Matches</div>
									<div class="text-lg">{player.best_heroes[0].matches}</div>
								</div>
								<div class="flex flex-col text-left">
									<div class="text-sm text-zinc-400">Win Rate</div>
									<div class="text-lg">{player.best_heroes[0].winrate}%</div>
								</div>
								<div class="flex flex-col text-left">
									<div class="text-sm text-zinc-400">Impact</div>
									<div class="text-lg">
										{#if player.best_heroes[0].winrate > 200}
											<div id="splusplusrating" class="font-display">
												{calcImpact(player.best_heroes[0].winrate)}
											</div>
										{:else if player.best_heroes[0].winrate >= 140}
											<div id="srating" class="font-display">
												{calcImpact(player.best_heroes[0].winrate)}
											</div>
										{:else if player.best_heroes[0].winrate < 140 && player.best_heroes[0].winrate > 25}
											<div class="font-display">
												{calcImpact(player.best_heroes[0].winrate)}
											</div>
										{:else if player.best_heroes[0].winrate <= 25}
											<div id="frating" class="flex justify-center font-display">
												<FxemojiPoo />
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="flex flex-col items-center justify-center gap-1 text-2xl">
				<div>Your game persona was...</div>
				<img
					src={`/shareholder-report/${player.character_and_game.character}.png`}
					class="h-64 w-64"
				/>
				<div class="text-xl">{player.character_and_game.character}</div>
				<div class="text-base text-zinc-400">{player.character_and_game.game}</div>
				<div class="text-2xl">
					{player.role_combination
						.split(', ')
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(', ')}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
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
	.color_Red_0 {
		background: linear-gradient(to right, #9f3c3c, #4a2040);
	}

	.color_Red_1 {
		background: linear-gradient(to right, #954533, #452732);
	}

	.color_Red_2 {
		background: linear-gradient(to right, #a3735e, #4f2a25);
	}

	.color_Yellow_0 {
		background: linear-gradient(to right, #c8a45c, #6f3d21);
	}

	.color_Yellow_1 {
		background: linear-gradient(to right, #c6a158, #604928);
	}

	.color_Yellow_2 {
		background: linear-gradient(to right, #cac194, #433828);
	}

	.color_Yellow_3 {
		background: linear-gradient(to right, #c3a99a, #4d352b);
	}

	.color_Purple_0 {
		background: linear-gradient(to right, #b57789, #412755);
	}

	.color_Purple_1 {
		background: linear-gradient(to right, #9c70a4, #282752);
	}

	.color_Purple_2 {
		background: linear-gradient(to right, #675cae, #261c44);
	}

	.color_Blue_0 {
		background: linear-gradient(to right, #727cb2, #342d5b);
	}

	.color_Blue_1 {
		background: linear-gradient(to right, #547ea6, #2a385e);
	}

	.color_Blue_2 {
		background: linear-gradient(to right, #6baebc, #135459);
	}

	.color_Blue_3 {
		background: linear-gradient(to right, #94b5ba, #385b59);
	}

	.color_Green_0 {
		background: linear-gradient(to right, #a2b23e, #2d5a18);
	}

	.color_Green_1 {
		background: linear-gradient(to right, #7ec2b2, #29493a);
	}

	.color_Green_2 {
		background: linear-gradient(to right, #a2b23e, #2d5a18);
	}

	.color_Green_3 {
		background: linear-gradient(to right, #9a9f6a, #223824);
	}

	.color_Green_4 {
		background: linear-gradient(to right, #9fad8e, #3f4129);
	}

	.color_Gray_0 {
		background: linear-gradient(to right, #565c61, #1b1b21);
	}

	.color_Gray_1 {
		background: linear-gradient(to right, #6a6d73, #29272c);
	}

	.color_Gray_2 {
		background: linear-gradient(to right, #95a9b1, #3e464f);
	}

	.color_Gray_3 {
		background: linear-gradient(to right, #adb6be, #4e5557);
	}
</style>
