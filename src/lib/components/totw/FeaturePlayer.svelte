<script lang="ts">
	export let data: { hero: string; role: number };
	import { getColour } from '$lib/functions';

	const { hero, role } = data;

	const handleVideoError = (e: Error) => {
		console.error('Video error:', e);
	};

	const background = getColour(role);
</script>

<div class="bg-no-repeat w-full h-full">
	<div class={`w-full h-full rounded-xl`} style="background-color: {background}30;">
		<video autoPlay muted loop playsInline class="h-full w-full object-cover opacity-100">
			<source
				type="video/webm"
				src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero}.webm`}
				class="w-full h-full"
			/>
			<img
				src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero}.png`}
				alt="necrolytbg-[url('/hero-backdrop.png')] e"
				class="w-full h-full"
			/>
		</video>
	</div>
</div>
