<script lang="ts">
	export let data: { hero: string; role: number };
	import { getColour } from '$lib/functions';

	const { hero, role, backgroundColour } = data;

	let background = backgroundColour;
	if (!backgroundColour) {
		background = getColour(role);
	}
</script>

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
</div>
