<script lang="ts">
	export let player: PlayerData;
	import { getContext } from 'svelte';
	import Fa6SolidPoop from '~icons/fa6-solid/poop';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import tippy from 'sveltejs-tippy';

	import { calcImpact, getRoleIcon } from '$lib/functions';
	import { goto } from '$app/navigation';

	$: viewport = getContext('viewport');
</script>

<div>
	<div class="my-0.5 flex items-center gap-2 md:gap-4">
		<div class="flex items-center gap-2">
			<img src={player.hero.img} alt={player.hero.name} class="h-8 md:h-10" />
			<div class="min-w-28 text-left text-xl">
				<button
					class="duration-300 hover:text-zinc-400"
					on:click={() => goto(`/player/${player.id}`)}
				>
					{player.username}</button
				>
				<span class="italic text-indigo-400">{player.smurf ? 'S' : ''}</span>
			</div>
		</div>
		<div
			class="w-12 cursor-default items-center text-center"
			use:tippy={{
				content: `Impact: ${player.impact}`,
				placement: 'bottom',
				theme: 'light'
			}}
		>
			{#if player.impact > 200}
				<div id="splusplusrating" class="font-display text-xl">
					{calcImpact(player.impact)}
				</div>
			{:else if player.impact >= 140}
				<div id="srating" class="font-display text-xl">
					{calcImpact(player.impact)}
				</div>
			{:else if player.impact < 140 && player.impact > 25}
				<div class="font-display text-xl">
					{calcImpact(player.impact)}
				</div>
			{:else if player.impact <= 25}
				<div id="frating" class="flex justify-center font-display text-xl">
					<FxemojiPoo />
				</div>
			{/if}
		</div>
		<div class="flex w-8 items-center justify-center">
			<img src={getRoleIcon(player.role)} alt={`${player.role} role`} class="h-7" />
		</div>
		<div class="flex w-24 items-center justify-center gap-1">
			<div class="text-green-300">{player.kills}</div>
			<div>/</div>
			<div class="text-red-400">{player.deaths}</div>
			<div>/</div>
			<div class="text-cyan-300">{player.assists}</div>
		</div>
		{#if $viewport === 'desktop'}
			<div class="flex">
				<img src={player.item0.img} alt={player.item0.name} class="h-8 w-[44px]" />
				<img src={player.item1.img} alt={player.item1.name} class="h-8 w-[44px]" />
				<img src={player.item2.img} alt={player.item2.name} class="h-8 w-[44px]" />
				<img src={player.item3.img} alt={player.item3.name} class="h-8 w-[44px]" />
				<img src={player.item4.img} alt={player.item4.name} class="h-8 w-[44px]" />
				<img src={player.item5.img} alt={player.item5.name} class="h-8 w-[44px]" />
				<div class="px-2">
					<img
						src={player.itemzinc.img}
						alt={player.itemzinc.name}
						class="h-8 w-8 rounded-full object-cover"
					/>
				</div>
			</div>
			<div class="flex flex-col">
				<img
					class="mr-2 w-6 object-contain"
					src={`/scepter_${player.aghanimsScepter}.png`}
					alt={`/scepter_${player.aghanimsScepter}`}
				/>
				<img
					class="mr-2 w-6 object-contain"
					src={`/shard_${player.aghanimsShard}.png`}
					alt={`/shard_${player.aghanimsShard}`}
				/>
			</div>
		{/if}
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
</style>
