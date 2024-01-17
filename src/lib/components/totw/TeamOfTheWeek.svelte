<script lang="ts">
	export let totw: {
		id: number;
		onePlayer: number;
		oneHero: number;
		onePlayerName: string;
		twoPlayer: number;
		twoHero: number;
		twoPlayerName: string;
		threePlayer: number;
		threeHero: number;
		threePlayerName: string;
		fourPlayer: number;
		fourHero: number;
		fourPlayerName: string;
		fivePlayer: number;
		fiveHero: number;
		fivePlayerName: string;
		oneHeroId: string;
		twoHeroId: string;
		threeHeroId: string;
		fourHeroId: string;
		fiveHeroId: string;
	};

	import FeaturePlayer from '$lib/components/totw/FeaturePlayer.svelte';
</script>

<div
	id="box"
	class="bg-neutral-800 border-[1px] border-neutral-200 border-opacity-15 bg-opacity-95 rounded-2xl px-2 py-2"
>
	<div id="title" class="font-display text-center text-4xl my-4">TEAM OF THE WEEK</div>
	<div class="flex gap-2">
		<div
			class="border-2 border-indigo-800 bg-indigo-900 bg-opacity-20 hover:bg-opacity-40 transition-all px-1 pt-3 rounded-xl"
		>
			<div class="w-48 h-48">
				<FeaturePlayer data={{ hero: totw.oneHeroId, role: 1 }} />
			</div>
			<div class="flex my-2 h-8 justify-center items-center">
				<img src={`/roles/pos1.svg`} class="h-8" alt="pos1" />
				<div class="font-display text-2xl">{totw.onePlayerName}</div>
			</div>
		</div>
		<div
			class="border-2 border-sky-700 bg-sky-800 bg-opacity-20 hover:bg-opacity-40 transition-all px-1 pt-3 rounded-xl"
		>
			<div class="w-48 h-48">
				<FeaturePlayer data={{ hero: totw.twoHeroId, role: 2 }} />
			</div>
			<div class="flex my-2 h-8 justify-center items-center">
				<img src={`/roles/pos1.svg`} class="h-8" alt="pos2" />
				<div class="font-display text-2xl">{totw.twoPlayerName}</div>
			</div>
		</div>
		<div
			class="border-2 border-orange-600 bg-orange-700 bg-opacity-20 hover:bg-opacity-40 transition-all px-1 pt-3 rounded-xl"
		>
			<div class="w-48 h-48">
				<FeaturePlayer data={{ hero: totw.threeHeroId, role: 3 }} />
			</div>
			<div class="flex my-2 h-8 justify-center items-center">
				<img src={`/roles/pos3.svg`} class="h-8" alt="pos3" />
				<div class="font-display text-2xl">{totw.threePlayerName}</div>
			</div>
		</div>
		<div
			class="border-2 border-red-600 bg-red-700 bg-opacity-20 hover:bg-opacity-40 transition-all px-1 pt-3 rounded-xl"
		>
			<div class="w-48 h-48">
				<FeaturePlayer data={{ hero: totw.fourHeroId, role: 4 }} />
			</div>
			<div class="flex my-2 h-8 justify-center items-center">
				<img src={`/roles/pos4.svg`} class="h-8" alt="pos4" />
				<div class="font-display text-2xl">{totw.fourPlayerName}</div>
			</div>
		</div>
		<div
			class="border-2 border-emerald-600 bg-emerald-700 bg-opacity-20 hover:bg-opacity-40 transition-all px-1 pt-3 rounded-xl"
		>
			<div class="w-48 h-48">
				<FeaturePlayer data={{ hero: totw.fiveHeroId, role: 5 }} />
			</div>
			<div class="flex my-2 h-8 justify-center items-center">
				<img src={`/roles/pos5.svg`} class="h-8" alt="pos5" />
				<div class="font-display text-2xl">{totw.fivePlayerName}</div>
			</div>
		</div>
	</div>
</div>
