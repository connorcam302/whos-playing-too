<script lang="ts">
	export let player: PlayerData;
	import Fa6SolidPoop from '~icons/fa6-solid/poop';

	import { calcImpact, getRoleIcon } from '$lib/functions';
</script>

<div>
	<div class="my-1 flex items-center gap-4">
		<div class="flex gap-2 items-center">
			<img src={player.hero.img} alt={player.hero.name} class="h-10" />
			<div class="font-bold text-xl min-w-28">
				{player.username} <span class="italic text-indigo-400">{player.smurf ? 'S' : ''}</span>
			</div>
		</div>
		<div class="w-12 items-center text-center">
			{#if player.impact > 200}
				<div id="splusplusrating" class="text-xl font-display">
					{calcImpact(player.impact)}
				</div>
			{:else if player.impact >= 140}
				<div id="srating" class="text-xl font-display">
					{calcImpact(player.impact)}
				</div>
			{:else if player.impact < 140}
				<div class="text-xl font-display">
					{calcImpact(player.impact)}
				</div>
			{:else if player.impact <= 25}
				<div id="frating" class="text-xl font-display">
					<Fa6SolidPoop />
				</div>
			{/if}
		</div>
		<div class="flex w-8 items-center justify-center">
			<img src={getRoleIcon(player.role)} alt={`${player.role} role`} class="h-7" />
		</div>
		<div class="flex gap-1 w-24 items-center justify-center">
			<div class="text-green-300">{player.kills}</div>
			<div>/</div>
			<div class="text-red-400">{player.deaths}</div>
			<div>/</div>
			<div class="text-cyan-300">{player.assists}</div>
		</div>
		<div class="flex">
			<img src={player.item0.img} alt={player.item0.name} class="h-8" />
			<img src={player.item1.img} alt={player.item1.name} class="h-8" />
			<img src={player.item2.img} alt={player.item2.name} class="h-8" />
			<img src={player.item3.img} alt={player.item3.name} class="h-8" />
			<img src={player.item4.img} alt={player.item4.name} class="h-8" />
			<img src={player.item5.img} alt={player.item5.name} class="h-8" />
			<div class="px-2">
				<img
					src={player.itemNeutral.img}
					alt={player.itemNeutral.name}
					class="h-8 w-8 rounded-full object-cover"
				/>
			</div>
		</div>
		<div class="flex flex-col">
			<img
				class="object-contain w-6"
				src={`/scepter_${player.aghanimsScepter}.png`}
				alt={`/scepter_${player.aghanimsScepter}`}
			/>
			<img
				class="object-contain w-6"
				src={`/shard_${player.aghanimsShard}.png`}
				alt={`/shard_${player.aghanimsShard}`}
			/>
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
		color: #b7791f;
		text-shadow: 0px 0px 5px #b7791f;
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
