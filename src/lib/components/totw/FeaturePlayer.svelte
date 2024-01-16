<script lang="ts">
	export let data: { hero: string; role: number };

	const { hero, role } = data;

	const handleVideoError = (e: Error) => {
		console.error('Video error:', e);
	};
</script>

<div class="bg-[url('/hero-backdrop.png')] bg-cover bg-center bg-no-repeat w-full h-full">
	<div
		class={`bg-opacity-10 w-full h-full`}
		style={`background-image: url('/roles/pos${role}.svg')`}
	>
		<video autoPlay muted loop playsInline class="h-full w-full object-cover">
			<source
				type="video/webm"
				src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero}.webm`}
				class="w-full h-full"
			/>
			<img
				src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero}.png`}
				alt="necrolyte"
				class="w-full h-full"
			/>
		</video>
	</div>
</div>
