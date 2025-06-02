<script lang="ts">
	export let data: { hero: string; role: number };
	import { getColour } from '$lib/functions';

	const { hero, role } = data;

	const background = getColour(role);
</script>

<div class="h-full w-full bg-no-repeat">
	<div class={`h-48 w-full rounded-xl`} style="background-color: {background}30;" id="container">
		<div id="content" class="flex h-full items-center">
			<img
				src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero.replace(
					'npc_dota_hero_',
					''
				)}.png`}
				alt="necrolytbg-[url('/hero-backdrop.png')] e"
				class="h-full w-auto object-cover"
			/>
		</div>
	</div>
</div>

<style>
	#container {
		position: relative;
	}

	#container:before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1;
		background-image: url('/poo.svg');
		background-size: 90% 90%;
		background-repeat: no-repeat;
		background-position: center;
		opacity: 0.5;
	}

	#content {
		position: relative;
		z-index: 2;
	}
</style>
