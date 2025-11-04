<script lang="ts">
	type Player = {
		id: number;
		username: string;
		kills?: number;
		deaths?: number;
		assists?: number;
		gpm?: number;
		xpm?: number;
		impact?: number;
		lastHits?: number;
		heroDamage?: number;
		winLoss?: number;
	};
	type Features = {
		mostKills: Player[];
		mostDeaths: Player[];
		mostAssists: Player[];
		mostGPM: Player[];
		mostXPM: Player[];
		mostImpact: Player[];
		leastImpact: Player[];
		mostLastHits: Player[];
		mostHeroDamage: Player[];
		leastHeroDamage: Player[];
		mostGained: Player[];
		mostLost: Player[];
	};
	import FeatureBox from './FeatureBox.svelte';
	import { getContext, onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import Button from '../ui/button/button.svelte';

	interface Props {
		features: Features;
	}
	let { features }: Props = $props();
	let viewport = $derived(getContext('viewport'));

	const items = [
		{ data: features.mostKills, title: 'Most Kills', type: 'kills' },
		{ data: features.mostDeaths, title: 'Most Deaths', type: 'deaths' },
		{ data: features.mostGPM, title: 'Most GPM', type: 'gpm' },
		{ data: features.mostHeroDamage, title: 'Most Hero Damage', type: 'heroDamage' },
		{ data: features.mostImpact, title: 'Most Impact', type: 'impact' },
		{ data: features.mostGained, title: 'Most MMR Gained', type: 'winLoss' },
		{ data: features.mostLastHits, title: 'Most Last Hits', type: 'lastHits' },
		{ data: features.mostAssists, title: 'Most Assists', type: 'assists' },
		{ data: features.mostXPM, title: 'Most XPM', type: 'xpm' },
		{ data: features.leastHeroDamage, title: 'Least Hero Damage', type: 'heroDamage' },
		{ data: features.leastImpact, title: 'Least Impact', type: 'impact' },
		{ data: features.mostLost, title: 'Most MMR Lost', type: 'winLoss' }
	];

	let currentIndex = $state(Math.floor(Math.random() * items.length));
	let direction = $state(1); // 1 for forward, -1 for backward
	let autoPlayInterval: ReturnType<typeof setInterval> | null = null;
	let freezeUntil = $state(0);

	function nextSlide() {
		direction = 1;
		currentIndex = (currentIndex + 1) % items.length;
	}

	function prevSlide() {
		direction = -1;
		currentIndex = (currentIndex - 1 + items.length) % items.length;
	}

	function handleInteraction() {
		freezeUntil = Date.now() + 20000; // Freeze for 20 seconds
	}

	function startAutoPlay() {
		if (autoPlayInterval) clearInterval(autoPlayInterval);

		autoPlayInterval = setInterval(() => {
			if (Date.now() >= freezeUntil) {
				nextSlide();
			}
		}, 5000);
	}

	onMount(() => {
		startAutoPlay();
	});

	onDestroy(() => {
		if (autoPlayInterval) clearInterval(autoPlayInterval);
	});

	let currentItem = $derived(items[currentIndex]);
</script>

<div class="relative flex w-fit flex-col gap-2">
	<div class="absolute right-0 w-13 rounded-md border py-1 text-center text-sm text-white">
		{currentIndex + 1} / {items.length}
	</div>
	<div class="flex h-full items-center justify-center gap-4">
		<!-- Previous Button -->
		<Button
			variant="outline"
			onclick={() => {
				handleInteraction();
				prevSlide();
			}}
			aria-label="Previous feature"
		>
			<ChevronLeft size={24} />
		</Button>

		<!-- Carousel Container -->
		<div class="relative h-48 w-64" style="min-height: 180px;">
			{#key currentIndex}
				<div class="absolute" in:fade={{ duration: 199, delay: 200 }} out:fade={{ duration: 199 }}>
					<FeatureBox data={currentItem.data} title={currentItem.title} type={currentItem.type} />
				</div>
			{/key}
		</div>

		<!-- Next Button -->
		<Button
			variant="outline"
			onclick={() => {
				handleInteraction();
				nextSlide();
			}}
			aria-label="Next feature"
		>
			<ChevronRight size={24} />
		</Button>
	</div>
	<!-- Indicator Dots	
	<div class="flex w-full items-center justify-center gap-2">
		{#each items as _, i}
			<button
				class="h-2 w-2 rounded-full transition-all {i === currentIndex
					? 'w-4 bg-white'
					: 'bg-white/50'}"
				onclick={() => {
					handleInteraction();
					direction = i > currentIndex ? 1 : -1;
					currentIndex = i;
				}}
				aria-label="Go to slide {i + 1}"
			></button>
		{/each}
	</div> 
	-->
</div>
