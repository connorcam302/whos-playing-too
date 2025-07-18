<script lang="ts">
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import type { PageData } from '../$types';
	import MajesticonsCoinsLine from '~icons/majesticons/coins-line';
	import CarbonProgressBar from '~icons/carbon/progress-bar';
	import MingcuteSwordLine from '~icons/mingcute/sword-line';
	import MaterialSymbolsLightReadinessScoreOutline from '~icons/material-symbols-light/readiness-score-outline';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import tippy from 'sveltejs-tippy';
	import { players } from './PlayerData';
	import { getRoleIcon, calcImpact } from '$lib/functions';
	import FeaturePlayer from '$lib/components/otw/FeaturePlayer.svelte';
	import { heroData } from '$lib/data/heroData';

	type Hero = {
		id: number;
		name: string;
		img: string;
	};

	type MatchData = {
		id: number;
		username: string;
		kills: number;
		deaths: number;
		assists: number;
		impact: number;
		role: number;
		gpm: number;
		xpm: number;
		lastHits: number;
		matchId: number;
		duration: number;
		startTime: number;
		hero: Hero;
		sequenceNumber: number;
		heroDamage: number;
	};

	let { record } = $props();

	let { player, statName, statValue } = record;
	let playerId = player;
	let matchUnsorted = record.match;

	function moveToMiddle(array, id) {
		// Find the index of the object with the given id
		const index = array.findIndex((obj) => obj.id === id);

		// If the object is found
		if (index !== -1) {
			// Remove the object from its current position
			const [player] = array.splice(index, 1);

			// Determine the middle index (for an array of length 5, it's 2)
			const middleIndex = Math.floor(array.length / 2);

			// Insert the removed object into the middle position
			array.splice(middleIndex, 0, player);
		}

		return array;
	}
	let match = moveToMiddle(matchUnsorted, player);

	const getImpactScore = (match: any, role: any, duration: any) => {
		let impact = 0;
		const csMin = match.lastHits / (duration / 60);
		const deathsPerMin = match.deaths / (duration / 60);

		let csMinRating: number = 0;
		let deathRating: number = 0;
		let kapmRating: number = 0;

		// Carry
		if (role === 1) {
			// Heroes with lower returns for high CS/min
			// Anti-mage, Naga Siren, Medusa, Luna, Terrorblade
			if ([1, 89, 94, 48, 109].includes(match.hero_id)) {
				csMinRating = csMin ** 1.3 / 25;
			} else {
				csMinRating = csMin ** 1.3 / 20;
			}
			deathRating = 3 / (20 * deathsPerMin + 1);
			kapmRating = ((match.kills * 2.4 + match.assists * 1.2) / (duration / 60)) ** 2;
			impact = kapmRating * 0.475 + deathRating * 0.425 + csMinRating * 0.1;

			// Mid
		} else if (role === 2) {
			// Heroes with lower returns for high CS/min
			// Templar Assassin, Arc Warden, Shadow Fiend
			if ([46, 113, 11].includes(match.hero_id)) {
				csMinRating = csMin ** 1.3 / 23;
			} else {
				csMinRating = csMin ** 1.3 / 18;
			}
			deathRating = 4 / (24 * deathsPerMin + 1);
			kapmRating = ((match.kills * 1.6 + match.assists * 1.4) / (duration / 60)) ** 2;
			impact = kapmRating * 0.65 + deathRating * 0.3 + csMinRating * 0.05;

			// Offlane
		} else if (role === 3) {
			csMinRating = csMin ** 1.3 / 18;
			deathRating = 4.5 / (23 * deathsPerMin + 1);
			// Lower returns on kills for Axe
			kapmRating = ((match.kills * 1.35 + match.assists * 1.35) / (duration / 60)) ** 2;
			impact = kapmRating * 0.65 + deathRating * 0.3 + csMinRating * 0.05;

			// Support
		} else if (role === 4 || role === 5) {
			deathRating = 5 / (24 * deathsPerMin + 1);
			kapmRating = ((match.kills * 0.65 + match.assists * 1.35) / (duration / 60)) ** 2;
			if ([20, 105].includes(match.hero_id)) {
				impact = kapmRating * 0.7 + deathRating * 0.3;
			} else {
				impact = kapmRating * 0.55 + deathRating * 0.45;
			}
		}

		csMinRating = Math.round(csMinRating * 100);
		deathRating = Math.round(deathRating * 100);
		kapmRating = Math.round(kapmRating * 100);
		impact = Math.round(impact * 100);

		return { csMinRating, deathRating, kapmRating, impact };
	};

	const distribution = (role: number, heroId: number) => {
		if (role === 1) {
			return {
				kapm: 47.5,
				death: 42.5,
				csMin: 10
			};
		}
		if (role === 2) {
			return {
				kapm: 65,
				death: 30,
				csMin: 5
			};
		}
		if (role === 3) {
			return {
				kapm: 65,
				death: 30,
				csMin: 5
			};
		}
		if (role === 4 || role === 5) {
			if ([20, 105].includes(heroId)) {
				return {
					kapm: 70,
					death: 30,
					csMin: 0
				};
			} else {
				return {
					kapm: 55,
					death: 45,
					csMin: 0
				};
			}
		}
	};
</script>

<div>
	<div class="text-2xl">
		{statName}: {statValue}
	</div>
	<MatchModal matchId={match[0].matchId} sequenceNum={match[0].sequenceNumber}>
		<div class="mx-auto flex w-fit flex-wrap items-end justify-center rounded-xl p-2">
			{#each match as player, i}
				{#if player.id === playerId}
					<div class="rounded-t-xl bg-zinc-800 p-2">
						<div class="flex flex-col gap-2 rounded-lg bg-zinc-700 p-4">
							<div class="w-64">
								<FeaturePlayer
									data={{
										hero: heroData.find((hero) => hero.id === player.hero.id)?.name,
										backgroundColour: 'none'
									}}
								/>
							</div>
							<div class="flex items-center justify-center gap-2 text-4xl">
								<div>
									{player.username}
								</div>
								<img src={getRoleIcon(player.role)} class="h-10 w-10" />
							</div>
							<div class="flex items-center justify-center gap-1 text-3xl">
								<div class="text-center text-green-400">{player.kills}</div>
								<div>-</div>
								<div class="text-center text-red-400">{player.deaths}</div>
								<div>-</div>
								<div class="text-center text-cyan-300">{player.assists}</div>
							</div>
							<div class="flex items-center justify-between gap-1 px-2 text-2xl">
								<div
									class="flex items-center gap-1 text-center text-yellow-400"
									use:tippy={{
										content: `Gold per Minute`,
										placement: 'bottom',
										theme: 'dark'
									}}
								>
									<MajesticonsCoinsLine />
									{player.gpm}
								</div>
								<div
									class="flex items-center gap-1 text-center text-zinc-400"
									use:tippy={{
										content: `Experience per Minute`,
										placement: 'bottom',
										theme: 'dark'
									}}
								>
									<CarbonProgressBar />
									{player.xpm}
								</div>
							</div>
							<div class="flex items-center justify-between gap-1 px-2 text-2xl">
								<div
									class="flex items-center gap-1 text-center text-teal-400"
									use:tippy={{
										content: `Hero Damage`,
										placement: 'bottom',
										theme: 'dark'
									}}
								>
									<MingcuteSwordLine />
									{player.heroDamage >= 1000
										? (player.heroDamage / 1000).toFixed(1) + 'k'
										: player.heroDamage.toString()}
								</div>
								<div
									class="flex items-center gap-1 text-center"
									use:tippy={{
										content: `
                <div class='text-center'>Impact Rating: <span class='font-bold'>${
									player.impact
								}</span></div>
                <table>
<thead>
    <tr class='border-b-2 border-white'>
        <th class='text-left'>Stat</th>
        <th class='px-4 text-center'>Dist</th>
        <th class='text-right'>Rating</th>
    </tr>
  <tbody>
    <tr>
      <td class='text-left'>K/A</td>
      <td class='px-4 text-center'>${distribution(player.role, player.hero.id)?.kapm}%</td>
      <td class='text-right'>${getImpactScore(player, player.role, player.duration).kapmRating}</td>
    </tr>
    <tr>
      <td class='text-left'>Death</td>
      <td class='px-4 text-center'>${distribution(player.role, player.hero.id)?.death}%</td>
      <td class='text-right'>${
				getImpactScore(player, player.role, player.duration).deathRating
			}</td>
    </tr>
    ${
			player.role === 1 || player.role === 2 || player.role === 3
				? `<tr>
      <td class='text-left'>CS</td>
      <td class='px-4 text-center'>${distribution(player.role, player.hero.id)?.csMin}%</td>
      <td class='text-right'>${
				getImpactScore(player, player.role, player.duration).csMinRating
			}</td>
    </tr>`
				: ``
		}

  </tbody>
</table>`,
										placement: 'bottom',
										theme: 'dark',
										allowHTML: true
									}}
								>
									{#if player.impact > 200}
										<div id="splusplusrating" class="font-display">
											{calcImpact(player.impact)}
										</div>
									{:else if player.impact >= 140}
										<div id="srating" class="font-display">
											{calcImpact(player.impact)}
										</div>
									{:else if player.impact < 140 && player.impact > 25}
										<div class="font-display">
											{calcImpact(player.impact)}
										</div>
									{:else if player.impact <= 25}
										<div id="frating" class="flex justify-center font-display">
											<FxemojiPoo />
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{:else}
					<div
						class={`flex flex-col items-center justify-center gap-1 bg-zinc-800 p-4  ${
							i === 0 ? 'rounded-l-xl' : ''
						} ${i === match.length - 1 ? 'rounded-r-xl' : ''}`}
					>
						<img src={player.hero.img} class="w-20" />
						<div class="flex items-center justify-center gap-2">
							<div>
								{player.username}
							</div>
							<img src={getRoleIcon(player.role)} class="h-6 w-6" />
						</div>
						<div class="flex items-center justify-center gap-1 text-sm">
							<div class="text-center text-green-400">{player.kills}</div>
							<div>-</div>
							<div class="text-center text-red-400">{player.deaths}</div>
							<div>-</div>
							<div class="text-center text-cyan-300">{player.assists}</div>
						</div>
						<div class="flex w-full items-center justify-between gap-1 px-2 text-xs">
							<div
								class="flex items-center gap-1 text-center text-yellow-400"
								use:tippy={{
									content: `Gold per Minute`,
									placement: 'bottom',
									theme: 'dark'
								}}
							>
								<MajesticonsCoinsLine class="w-3" />
								{player.gpm}
							</div>
							<div
								class="flex items-center gap-1 text-center text-zinc-400"
								use:tippy={{
									content: `Experience per Minute`,
									placement: 'bottom',
									theme: 'dark'
								}}
							>
								<CarbonProgressBar class="w-3" />
								{player.xpm}
							</div>
						</div>
						<div class="flex w-full items-center justify-between gap-1 px-2 text-xs">
							<div
								class="flex items-center gap-1 text-center text-teal-400"
								use:tippy={{
									content: `Hero Damage`,
									placement: 'bottom',
									theme: 'dark'
								}}
							>
								<MingcuteSwordLine class="w-3" />
								{player.heroDamage >= 1000
									? (player.heroDamage / 1000).toFixed(1) + 'k'
									: player.heroDamage.toString()}
							</div>
							<div
								class="flex items-center gap-1 text-center"
								use:tippy={{
									content: `
                <div class='text-center'>Impact Rating: <span class='font-bold'>${
									player.impact
								}</span></div>
                <table>
<thead>
    <tr class='border-b-2 border-white'>
        <th class='text-left'>Stat</th>
        <th class='px-4 text-center'>Dist</th>
        <th class='text-right'>Rating</th>
    </tr>
  <tbody>
    <tr>
      <td class='text-left'>K/A</td>
      <td class='px-4 text-center'>${distribution(player.role, player.hero.id)?.kapm}%</td>
      <td class='text-right'>${getImpactScore(player, player.role, player.duration).kapmRating}</td>
    </tr>
    <tr>
      <td class='text-left'>Death</td>
      <td class='px-4 text-center'>${distribution(player.role, player.hero.id)?.death}%</td>
      <td class='text-right'>${
				getImpactScore(player, player.role, player.duration).deathRating
			}</td>
    </tr>
    ${
			player.role === 1 || player.role === 2 || player.role === 3
				? `<tr>
      <td class='text-left'>CS</td>
      <td class='px-4 text-center'>${distribution(player.role, player.hero.id)?.csMin}%</td>
      <td class='text-right'>${
				getImpactScore(player, player.role, player.duration).csMinRating
			}</td>
    </tr>`
				: ``
		}

  </tbody>
</table>`,
									placement: 'bottom',
									theme: 'dark',
									allowHTML: true
								}}
							>
								{#if player.impact > 200}
									<div id="splusplusrating" class="font-display">
										{calcImpact(player.impact)}
									</div>
								{:else if player.impact >= 140}
									<div id="srating" class="font-display">
										{calcImpact(player.impact)}
									</div>
								{:else if player.impact < 140 && player.impact > 25}
									<div class="font-display">
										{calcImpact(player.impact)}
									</div>
								{:else if player.impact <= 25}
									<div id="frating" class="flex justify-center font-display">
										<FxemojiPoo />
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</MatchModal>
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
	.color_Red_0 {
		background: linear-gradient(to right, #9f3c3c, #4a2040);
	}

	.color_Red_1 {
		background: linear-gradient(to right, #954533, #452732);
	}

	.color_Red_2 {
		background: linear-gradient(to right, #a3735e, #4f2a25);
	}

	.color_Yellow_0 {
		background: linear-gradient(to right, #c8a45c, #6f3d21);
	}

	.color_Yellow_1 {
		background: linear-gradient(to right, #c6a158, #604928);
	}

	.color_Yellow_2 {
		background: linear-gradient(to right, #cac194, #433828);
	}

	.color_Yellow_3 {
		background: linear-gradient(to right, #c3a99a, #4d352b);
	}

	.color_Purple_0 {
		background: linear-gradient(to right, #b57789, #412755);
	}

	.color_Purple_1 {
		background: linear-gradient(to right, #9c70a4, #282752);
	}

	.color_Purple_2 {
		background: linear-gradient(to right, #675cae, #261c44);
	}

	.color_Blue_0 {
		background: linear-gradient(to right, #727cb2, #342d5b);
	}

	.color_Blue_1 {
		background: linear-gradient(to right, #547ea6, #2a385e);
	}

	.color_Blue_2 {
		background: linear-gradient(to right, #6baebc, #135459);
	}

	.color_Blue_3 {
		background: linear-gradient(to right, #94b5ba, #385b59);
	}

	.color_Green_0 {
		background: linear-gradient(to right, #a2b23e, #2d5a18);
	}

	.color_Green_1 {
		background: linear-gradient(to right, #7ec2b2, #29493a);
	}

	.color_Green_2 {
		background: linear-gradient(to right, #a2b23e, #2d5a18);
	}

	.color_Green_3 {
		background: linear-gradient(to right, #9a9f6a, #223824);
	}

	.color_Green_4 {
		background: linear-gradient(to right, #9fad8e, #3f4129);
	}

	.color_Gray_0 {
		background: linear-gradient(to right, #565c61, #1b1b21);
	}

	.color_Gray_1 {
		background: linear-gradient(to right, #6a6d73, #29272c);
	}

	.color_Gray_2 {
		background: linear-gradient(to right, #95a9b1, #3e464f);
	}

	.color_Gray_3 {
		background: linear-gradient(to right, #adb6be, #4e5557);
	}
</style>
