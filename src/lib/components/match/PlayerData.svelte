<script lang="ts">
	type MatchData = {
		radiant_win: boolean;
		duration: number;
		pre_game_duration: number;
		start_time: number;
		match_id: number;
		match_seq_num: number;
		tower_status_radiant: number;
		tower_status_dire: number;
		barracks_status_radiant: number;
		barracks_status_dire: number;
		cluster: number;
		first_blood_time: number;
		lobby_type: number;
		human_players: number;
		leagueid: number;
		game_mode: number;
		flags: number;
		engine: number;
		radiant_score: number;
		dire_score: number;
		picks_bans: Array<{
			is_pick: boolean;
			hero_id: number;
			team: number;
			order: number;
		}>;
		picks: DotaAsset[];
		bans: DotaAsset[];
	};

	export let player: PlayerData, matchData: MatchData;
	import { getContext } from 'svelte';
	import Fa6SolidPoop from '~icons/fa6-solid/poop';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import tippy from 'sveltejs-tippy';

	import { calcImpact, getRoleIcon } from '$lib/functions';
	import { goto } from '$app/navigation';

	$: viewport = getContext('viewport');

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

	const distribution = (role: number) => {
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
			if ([20, 105].includes(player.hero.id)) {
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

	const impactDetails = getImpactScore(player, player.role, matchData.duration);
	const distributionDetails = distribution(player.role);
</script>

<div>
	<div class="my-0.5 flex items-center gap-1 text-sm md:gap-4 lg:text-base">
		<div class="flex items-center gap-2">
			<img src={player.hero.img} alt={player.hero.name} class="h-8 md:h-10" />
			<div class="min-w-20 text-left lg:min-w-28 lg:text-xl">
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
			class="w-10 cursor-default items-center text-center"
			use:tippy={{
				content: `
                <div class='text-center'>Impact Rating: <span class='font-bold'>${
									player.impact
								}</span></div>
                <table>
<thead>
    <tr class='border-b-2 border-black'>
        <th class='text-left'>Stat</th>
        <th class='px-4 text-center'>Dist</th>
        <th class='text-right'>Rating</th>
    </tr>
  <tbody>
    <tr>
      <td class='text-left'>K/A</td>
      <td class='px-4 text-center'>${distributionDetails?.kapm}%</td>
      <td class='text-right'>${impactDetails.kapmRating}</td>
    </tr>
    <tr>
      <td class='text-left'>Death</td>
      <td class='px-4 text-center'>${distributionDetails?.death}%</td>
      <td class='text-right'>${impactDetails.deathRating}</td>
    </tr>
    ${
			player.role === 1 || player.role === 2 || player.role === 3
				? `<tr>
      <td class='text-left'>CS</td>
      <td class='px-4 text-center'>${distributionDetails?.csMin}%</td>
      <td class='text-right'>${impactDetails.csMinRating}</td>
    </tr>`
				: ``
		}

  </tbody>
</table>`,
				placement: 'bottom',
				theme: 'light',
				allowHTML: true
			}}
		>
			{#if player.impact > 200}
				<div id="splusplusrating" class="font-display lg:text-xl">
					{calcImpact(player.impact)}
				</div>
			{:else if player.impact >= 140}
				<div id="srating" class="font-display lg:text-xl">
					{calcImpact(player.impact)}
				</div>
			{:else if player.impact < 140 && player.impact > 25}
				<div class="font-display lg:text-xl">
					{calcImpact(player.impact)}
				</div>
			{:else if player.impact <= 25}
				<div id="frating" class="flex justify-center font-display lg:text-xl">
					<FxemojiPoo />
				</div>
			{/if}
		</div>
		<div class="flex w-6 items-center justify-center lg:w-8">
			<img src={getRoleIcon(player.role)} alt={`${player.role} role`} class="h-7" />
		</div>
		<div class="flex w-16 items-center justify-center gap-1 text-xs lg:text-base">
			<div class="text-green-300">{player.kills}</div>
			<div>/</div>
			<div class="text-red-400">{player.deaths}</div>
			<div>/</div>
			<div class="text-cyan-300">{player.assists}</div>
		</div>
		<div class="flex max-w-[86px] flex-wrap lg:max-w-96 lg:flex-row">
			<img src={player.item0.img} alt={player.item0.name} class="h-5 lg:h-8 lg:w-[44px]" />
			<img src={player.item1.img} alt={player.item1.name} class="h-5 lg:h-8 lg:w-[44px]" />
			<img src={player.item2.img} alt={player.item2.name} class="h-5 lg:h-8 lg:w-[44px]" />
			<img src={player.item3.img} alt={player.item3.name} class="h-5 lg:h-8 lg:w-[44px]" />
			<img src={player.item4.img} alt={player.item4.name} class="h-5 lg:h-8 lg:w-[44px]" />
			<img src={player.item5.img} alt={player.item5.name} class="h-5 lg:h-8 lg:w-[44px]" />
		</div>
		<img
			src={player.itemzinc.img}
			alt={player.itemzinc.name}
			class="mr-1 h-6 w-6 rounded-full object-cover lg:mr-0 lg:h-8 lg:w-8"
		/>
		<div class="hidden lg:block">
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
		</div>
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
