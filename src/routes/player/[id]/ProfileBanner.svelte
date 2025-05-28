<script lang="ts">
	let { data }: Props = $props();

	import FxemojiPoo from '~icons/fxemoji/poo';
	import UilExchange from '~icons/uil/exchange';
	import BiDashLg from '~icons/bi/dash-lg';
	import MaterialSymbolsArrowBackRounded from '~icons/material-symbols/arrow-back-rounded';
	import MaterialSymbolsArrowForwardRounded from '~icons/material-symbols/arrow-forward-rounded';
	import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded';
	import IonLogoGameControllerB from '~icons/ion/logo-game-controller-b';
	import MaterialSymbolsCalendarMonth from '~icons/material-symbols/calendar-month';
	import SimpleIconsRedhat from '~icons/simple-icons/redhat';
	import Loading from '$lib/components/Loading.svelte';
	import MatchBlock from '$lib/components/match/MatchBlock.svelte';
	import HeroStatbox from '$lib/components/stats/HeroStatbox.svelte';
	import WinChart from '$lib/components/profile/WinChart.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import tippy from 'sveltejs-tippy';
	import MatchDropdown from '$lib/components/match/MatchDropdown.svelte';
	import { browser } from '$app/environment';
	import Bar from '$lib/components/stats/Bar.svelte';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';
	import IconamoonMenuBurgerHorizontalDuotone from '~icons/iconamoon/menu-burger-horizontal-duotone';
	import * as Select from '$lib/components/ui/select';

	let {
		player,
		mainAccount,
		smurfAccounts,
		allTimeStats,
		weeklyStats,
		heroStats,
		allTimeHeroStats,
		winGraph,
		heroList
	} = $derived(data);
</script>

<div class="flex w-full flex-wrap items-center justify-center">
	<div class="flex w-full max-w-screen-md items-center gap-2 px-2 py-2">
		<img src={player.image} alt="profilepicture" class="h-28 lg:h-36" />
		<div class="flex h-full flex-col justify-center">
			<div class="flex h-full flex-col gap-1 px-2 py-4 lg:w-80">
				<div class="text-4xl">{player.username}</div>
				<div class="grow"></div>
				<div class="flex items-center gap-2">
					<div class="flex gap-1 text-xs">
						{#if mainAccount}
							<div>
								{mainAccount.personaname.length > 20
									? mainAccount.personaname.substring(0, 20) + '...'
									: (mainAccount.personaname ?? 'Main mainAccount')}
							</div>
						{:else}
							Main account
						{/if}

						<div class="opacity-45">(main)</div>
					</div>
					{#if mainAccount}
						<div class="h-2 w-2">
							{#if mainAccount.gameextrainfo === 'Dota 2'}
								<div class="h-full w-full rounded-full bg-sky-500"></div>
							{/if}
						</div>
					{/if}
					<div class="grow"></div>
					{#if mainAccount}
						<a
							href={mainAccount.profileurl}
							target="_blank"
							rel="noopener noreferrer"
							class="hidden lg:inline"
						>
							<img src={'/steam.png'} alt="profilepicture" class="h-5" />
						</a>
					{/if}
					<a
						href={`https://dotabuff.com/players/${player.accountId}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<img src={'/dotabuff.png'} alt="profilepicture" class="h-5" />
					</a>
					<a
						href={`https://www.opendota.com/players/${player.accountId}`}
						target="_blank"
						rel="noopener noreferrer"
						class="hidden lg:inline"
					>
						<img src={'/opendota.png'} alt="profilepicture" class="h-5" />
					</a>
					<a
						href={`https://stratz.com/en-us/player/${player.accountId}`}
						target="_blank"
						rel="noopener noreferrer"
						class="hidden lg:inline"
					>
						<img src={'/stratz.png'} alt="profilepicture" class="h-5" />
					</a>
				</div>
				{#each smurfAccounts as profile, i}
					<div class="flex items-center gap-2">
						<div class="flex gap-1 text-xs">
							{#if profile.personaname}
								{profile.personaname.length > 25
									? profile.personaname.substring(0, 25) + '...'
									: profile.personaname}
								{#if profile.accountId === player.accountId}
									<div class="opacity-45">(main)</div>
								{/if}
							{:else}
								Smurf {i + 1}
							{/if}
						</div>

						<div class="grow"></div>
						<a
							href={profile.profileurl}
							target="_blank"
							rel="noopener noreferrer"
							class="hidden lg:inline"
						>
							<img src={'/steam.png'} alt="profilepicture" class="h-5" />
						</a>
						<a
							href={`https://dotabuff.com/players/${player.accountId}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<img src={'/dotabuff.png'} alt="profilepicture" class="h-5" />
						</a>
						<a
							href={`https://www.opendota.com/players/${player.accountId}`}
							target="_blank"
							rel="noopener noreferrer"
							class="hidden lg:inline"
						>
							<img src={'/opendota.png'} alt="profilepicture" class="h-5" />
						</a>
						<a
							href={`https://stratz.com/en-us/player/${player.accountId}`}
							target="_blank"
							rel="noopener noreferrer"
							class="hidden lg:inline"
						>
							<img src={'/stratz.png'} alt="profilepicture" class="h-5" />
						</a>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
