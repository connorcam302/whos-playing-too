<script lang="ts">
	import { getColour } from '$lib/functions';
	import { cn } from '$lib/utils';
	interface Props {
		data: { hero: string; role: number };
	}

	let { data }: Props = $props();

	const { hero, role, backgroundColour } = data;

	let background = $state(backgroundColour);
	if (!backgroundColour) {
		background = getColour(role);
	}
    
</script>

<!--
<div class="h-full w-full bg-no-repeat">
	<div class={`h-full w-full rounded-xl`} style="background-color: {background}30;">
		<video autoPlay muted loop playsInline class="h-full w-full object-cover opacity-100">
			<source
				type="video/webm"
				src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero}.webm`}
				class="h-full w-full"
			/>
			<img
				src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero}.png`}
				alt="necrolytbg-[url('/hero-backdrop.png')] e"
				class="h-full w-full"
			/>
		</video>
	</div>
</div> -->

<div
	class={cn('max-h-24 max-w-32 overflow-hidden rounded-t-xl md:max-h-32 md:max-w-48')}
	style="background: linear-gradient(to bottom, {background}80, {background}10);"
>
	<div class="flex w-full items-center">
		<img
			src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero.replace(
				'npc_dota_hero_',
				''
			)}.png`}
			alt={hero}
			class="h-full w-full object-cover"
		/>
	</div>
</div>
