<script lang="ts">
	export let data: { hero: string; role: number };

	const { hero, role } = data;

	const handleVideoError = (e: Error) => {
		console.error('Video error:', e);
	};
</script>

<div class="bg-no-repeat w-full h-full">
	<div class={`bg-opacity-10 w-full h-full`}>
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
