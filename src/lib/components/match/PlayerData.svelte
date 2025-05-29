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

	import { getContext } from 'svelte';
	import Fa6SolidPoop from '~icons/fa6-solid/poop';
	import FxemojiPoo from '~icons/fxemoji/poo';
	import tippy from 'sveltejs-tippy';
	import UilExchange from 'virtual:icons/uil/exchange';
	import MaterialSymbolsExpandLessRounded from 'virtual:icons/material-symbols/expand-less-rounded';
	import MaterialSymbolsExpandMoreRounded from 'virtual:icons/material-symbols/expand-more-rounded';
	import BiDashLg from '~icons/bi/dash-lg';
	import UilQuestion from '~icons/uil/question';
	import LucideUsers from '~icons/lucide/users';
	import LucideUser from '~icons/lucide/user';
	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideChevronDown from '~icons/lucide/chevron-down';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);

	import { getGameMode } from '$lib/functions';

	import { calcImpact, getRoleIcon } from '$lib/functions';
	import { goto } from '$app/navigation';
	import PlayerData from './PlayerData.svelte';
	import MatchBlock from './MatchBlock.svelte';
	import MatchModal from './MatchModal.svelte';
	import RatingChip from '../RatingChip.svelte';
	import { Item } from '../ui/select';
	import DotaItem from '../DotaItem.svelte';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Facet from '../Facet.svelte';
	import { twMerge } from 'tailwind-merge';
	interface Props {
		match: {
			player: PlayerData;
			radiant: PlayerData[];
			dire: PlayerData[];
			matchData: MatchData;
		};
	}

	let { match }: Props = $props();

	const { player, matchData } = match;

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

	const makeFacetBox = (facets: any, selectedFacet: number) => {
		let facetBox = '<div class="flex flex-col gap-2 py-1">';
		facets.forEach((facet: any, i: number) => {
			const makeImageString = (icon: string) => {
				return (
					'https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/icons/facets/' +
					icon +
					'.png'
				);
			};

			const facetColour = `color_${facet.color}_${facet.gradient_id}`;

			if (i === selectedFacet) {
				facetBox += `<div class='color_${facet.color}_${
					facet.gradient_id
				} px-1'><div class='flex gap-2 items-center'>	<img
							src=${makeImageString(facet.icon)}
							class="h-4 px-1 py-0.5 md:h-5 md:px-2 md:py-0.5"
						/><div class='font-display text-lg'>${facet.title}</div></div><div class='text-sm leading-4'>${
							facet.description
						}</div></div>`;
			} else {
				facetBox += `<div class='px-1'><div class='flex gap-2 items-center'><img
							src=${makeImageString(facet.icon)}
							class="h-4 px-1 py-0.5 md:h-5 md:px-2 md:py-0.5 ${facetColour}"
						/><div class='font-display text-lg'>${facet.title}</div></div><div class='text-sm leading-4'>${
							facet.description
						}</div></div>`;
			}
		});
		facetBox += '</div>';
		return facetBox;
	};
</script>

<div class={'flex items-center duration-200'}>
	<MatchModal matchId={matchData.id} sequenceNum={matchData.sequenceNumber}>
		<div class={'flex items-center gap-2 px-2 py-1 md:gap-4'}>
			<div class="w-12 md:w-16">
				<div class="relative">
					<img src={player.hero.img} alt={player.hero.name} class="w-12 md:w-16" />
					{#if player.facet}
						<div
							class={`absolute bottom-0 right-0 color_${
								player.facets[player.facet - 1]?.color ?? 'Blue'
							}_${player.facets[player.facet - 1]?.gradient_id ?? 3}`}
						>
							<Facet facet={player.facets[player.facet - 1]} />
						</div>
					{/if}
				</div>
			</div>
			<div class="flex w-28 flex-col gap-0 text-left">
				<div class="flex gap-1 font-sans leading-none duration-200 hover:text-zinc-400">
					<a href="/player/{player.owner}">{player.username}</a>
					<div class="italic text-purple-500">{player.smurf ? 'S' : ''}</div>
				</div>
				<div class="font-sans text-xs leading-none text-zinc-400">{player.hero.name}</div>
			</div>
			<div class="my-auto">
				<RatingChip data={match} />
			</div>
			<div class="flex w-6 items-center justify-center lg:w-8">
				<img src={getRoleIcon(player.role)} alt={`${player.role} role`} class="h-7" />
			</div>
			<div class="flex w-16 items-center justify-center gap-1 text-xs md:w-20 lg:text-base">
				<div class="text-green-300">{player.kills}</div>
				<div>/</div>
				<div class="text-red-400">{player.deaths}</div>
				<div>/</div>
				<div class="text-cyan-300">{player.assists}</div>
			</div>
			<div class="hidden md:flex">
				{#each [0, 1, 2, 3, 4, 5] as slot}
					<div class="h-8">
						<DotaItem item={match.player[`item${slot}`]} />
					</div>
				{/each}
			</div>
			<div class="flex flex-col md:hidden">
				<div class="flex">
					{#each [0, 1, 2] as slot}
						<div class="h-5">
							<DotaItem item={match.player[`item${slot}`]} />
						</div>
					{/each}
				</div>
				<div class="flex">
					{#each [3, 4, 5] as slot}
						<div class="h-5">
							<DotaItem item={match.player[`item${slot}`]} />
						</div>
					{/each}
				</div>
			</div>
			<div class="hidden h-4 w-4 rounded-full md:block md:h-8 md:w-8">
				<DotaItem item={match.player[`itemNeutral`]} styles="rounded-full object-cover" />
			</div>
			<div class="hidden lg:block">
				<div class="flex flex-col">
					<img
						class="w-6 object-contain"
						src={`/scepter_${player.aghanimsScepter}.png`}
						alt={`/scepter_${player.aghanimsScepter}`}
					/>
					<img
						class="w-6 object-contain"
						src={`/shard_${player.aghanimsShard}.png`}
						alt={`/shard_${player.aghanimsShard}`}
					/>
				</div>
			</div>
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
