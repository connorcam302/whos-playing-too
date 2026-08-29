<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import PlayerWeightSection from '$lib/components/stack-analysis/PlayerWeightSection.svelte';
	import { getRoleIcon, getRoleName } from '$lib/functions';
	import {
		getHeroRecommendations,
		getPlayerContributions,
		getStackEstimate,
		type StackAnalysisRow
	} from '$lib/stack-analysis';
	import {
		ArrowLeft,
		ArrowRight,
		BarChart3,
		BrainCircuit,
		Check,
		Gauge,
		Lightbulb,
		RotateCcw,
		Search,
		ShieldQuestion,
		Sparkles,
		Swords,
		TriangleAlert,
		Users
	} from 'lucide-svelte';

	type PlayerOption = { id: number; username: string };
	type HeroOption = { id: number; name: string; img: string };
	type DraftPick = { playerId: number; role: string; heroId: string };
	type Stage = 'pregame' | 'draft' | 'match';
	type Props = {
		data: { rows: StackAnalysisRow[]; playerList: PlayerOption[]; heroList: HeroOption[] };
	};

	let { data }: Props = $props();
	let stage = $state<Stage>('pregame');
	let lobbyPlayerIds = $state<number[]>([]);
	let draftPicks = $state<DraftPick[]>([]);
	let playerQuery = $state('');

	const stages: { id: Stage; label: string; description: string }[] = [
		{ id: 'pregame', label: 'Pregame', description: 'Build the lobby' },
		{ id: 'draft', label: 'Draft', description: 'Set roles and heroes' },
		{ id: 'match', label: 'The match', description: 'Review the outlook' }
	];
	const roleIds = [1, 2, 3, 4, 5];
	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value || 0);
	const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
	const makeHeroIcon = (img?: string) => img?.replace('/heroes/', '/heroes/icons/');
	const getPlayer = (playerId: number) => data.playerList.find((player) => player.id === playerId);
	const getPlayerName = (playerId: number) => getPlayer(playerId)?.username ?? 'Unknown player';
	const getHero = (heroId: string) => data.heroList.find((hero) => hero.id.toString() === heroId);
	const getHeroName = (heroId: string) => getHero(heroId)?.name ?? 'Select hero';
	const getHeroIcon = (heroId: string) => makeHeroIcon(getHero(heroId)?.img);

	const visiblePlayers = $derived(
		data.playerList.filter((player) =>
			player.username.toLowerCase().includes(playerQuery.trim().toLowerCase())
		)
	);
	const assignedRoles = $derived(
		draftPicks.filter((pick) => pick.role !== '-1').map((pick) => Number(pick.role))
	);
	const selectedHeroIds = $derived(
		draftPicks.filter((pick) => pick.heroId !== '-1').map((pick) => Number(pick.heroId))
	);
	const hasDuplicateRoles = $derived(new Set(assignedRoles).size !== assignedRoles.length);
	const hasDuplicateHeroes = $derived(new Set(selectedHeroIds).size !== selectedHeroIds.length);
	const draftReady = $derived(
		draftPicks.length >= 2 &&
			draftPicks.every((pick) => pick.role !== '-1' && pick.heroId !== '-1') &&
			!hasDuplicateRoles &&
			!hasDuplicateHeroes
	);
	const analysisSlots = $derived(
		roleIds.map((role) => {
			const pick = draftPicks.find((entry) => Number(entry.role) === role);
			return {
				role,
				playerId: pick?.playerId ?? null,
				playerName: pick ? getPlayerName(pick.playerId) : 'Open slot',
				heroId: pick && pick.heroId !== '-1' ? Number(pick.heroId) : null,
				heroName: pick ? getHeroName(pick.heroId) : 'No hero selected',
				heroIcon: pick ? getHeroIcon(pick.heroId) : undefined
			};
		})
	);
	const playerContributions = $derived(getPlayerContributions(data.rows, analysisSlots));
	const estimate = $derived(getStackEstimate(data.rows, analysisSlots));

	const toggleLobbyPlayer = (playerId: number) => {
		if (lobbyPlayerIds.includes(playerId)) {
			lobbyPlayerIds = lobbyPlayerIds.filter((id) => id !== playerId);
			return;
		}
		if (lobbyPlayerIds.length < 5) lobbyPlayerIds = [...lobbyPlayerIds, playerId];
	};
	const beginDraft = () => {
		draftPicks = lobbyPlayerIds.map((playerId) => {
			const current = draftPicks.find((pick) => pick.playerId === playerId);
			return current ?? { playerId, role: '-1', heroId: '-1' };
		});
		stage = 'draft';
	};
	const getRecommendations = (pick: DraftPick, pickIndex: number) =>
		getHeroRecommendations(
			data.rows,
			pick.playerId,
			pick.role === '-1' ? 0 : Number(pick.role),
			lobbyPlayerIds,
			draftPicks
				.filter((_, index) => index !== pickIndex)
				.filter((entry) => entry.heroId !== '-1')
				.map((entry) => Number(entry.heroId)),
			4
		);
	const selectRecommendation = (pickIndex: number, heroId: number) => {
		draftPicks[pickIndex].heroId = heroId.toString();
	};
	const resetDraft = () => {
		stage = 'pregame';
		lobbyPlayerIds = [];
		draftPicks = [];
		playerQuery = '';
	};
	const barWidth = (value: number) => `${clamp(value, 0, 100)}%`;
	const canVisitStage = (target: Stage) => {
		if (target === 'pregame') return true;
		if (target === 'draft') return lobbyPlayerIds.length >= 2;
		return draftReady;
	};
	const visitStage = (target: Stage) => {
		if (!canVisitStage(target)) return;
		if (target === 'draft' && draftPicks.length === 0) beginDraft();
		else stage = target;
	};
</script>

<svelte:head><title>whos-playing | Draft</title></svelte:head>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4">
	<header class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight text-zinc-100">Draft</h1>
			<p class="mt-1 text-sm text-zinc-400">Build the lobby, settle the roles, then find the strongest picks.</p>
		</div>
		{#if lobbyPlayerIds.length > 0}
			<button type="button" class="mt-2 inline-flex h-9 items-center gap-2 self-start rounded-md px-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mt-0" onclick={resetDraft}>
				<RotateCcw class="h-4 w-4" /> Start over
			</button>
		{/if}
	</header>

	<nav class="grid grid-cols-3 overflow-hidden rounded-md border border-border bg-card" aria-label="Draft stages">
		{#each stages as item, index}
			<button
				type="button"
				disabled={!canVisitStage(item.id)}
				class={`relative flex min-h-16 items-center gap-2 border-r border-border px-3 text-left last:border-r-0 transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 ${stage === item.id ? 'bg-zinc-900' : 'hover:bg-zinc-800/50'}`}
				onclick={() => visitStage(item.id)}
				aria-current={stage === item.id ? 'step' : undefined}
			>
				<span class={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${stage === item.id ? 'border-sky-500 bg-sky-500 text-sky-950' : 'border-zinc-600 text-zinc-400'}`}>{index + 1}</span>
				<span class="min-w-0">
					<span class="block text-sm font-semibold text-zinc-100">{item.label}</span>
					<span class="hidden truncate text-xs text-zinc-500 sm:block">{item.description}</span>
				</span>
				{#if index < stages.findIndex((entry) => entry.id === stage)}<Check class="ml-auto hidden h-4 w-4 text-zinc-500 sm:block" />{/if}
			</button>
		{/each}
	</nav>

	{#if stage === 'pregame'}
		<section class="overflow-hidden rounded-md border border-border bg-card" aria-labelledby="pregame-title">
			<div class="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 id="pregame-title" class="flex items-center gap-2 text-base font-semibold text-zinc-100"><Users class="h-4 w-4 text-zinc-400" /> Who is in the lobby?</h2>
					<p class="mt-1 text-xs text-zinc-400">Choose between two and five players. Roles come next.</p>
				</div>
				<div class="text-sm tabular-nums text-zinc-300"><span class="font-semibold text-zinc-100">{lobbyPlayerIds.length}</span> / 5 selected</div>
			</div>
			<div class="p-3 sm:p-4">
				<label class="relative block max-w-sm">
					<span class="sr-only">Search players</span>
					<Search class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
					<input type="search" bind:value={playerQuery} placeholder="Find a player" class="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 pl-9 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-ring/30" />
				</label>
				<div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{#each visiblePlayers as player}
						{@const selected = lobbyPlayerIds.includes(player.id)}
						<button
							type="button"
							disabled={!selected && lobbyPlayerIds.length === 5}
							class={`flex min-h-14 items-center gap-3 rounded-md border px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35 ${selected ? 'border-sky-500 bg-sky-950/30' : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-600 hover:bg-zinc-900'}`}
							onclick={() => toggleLobbyPlayer(player.id)}
							aria-pressed={selected}
						>
							<span class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${selected ? 'bg-sky-500 text-sky-950' : 'bg-zinc-800 text-zinc-300'}`}>{player.username.slice(0, 1).toUpperCase()}</span>
							<span class="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-100">{player.username}</span>
							<span class={`flex h-5 w-5 items-center justify-center rounded border ${selected ? 'border-sky-500 bg-sky-500 text-sky-950' : 'border-zinc-600 text-transparent'}`}><Check class="h-3.5 w-3.5" /></span>
						</button>
					{/each}
				</div>
				{#if visiblePlayers.length === 0}<div class="py-10 text-center text-sm text-zinc-500">No players match “{playerQuery}”.</div>{/if}
			</div>
			<div class="flex items-center justify-between border-t border-border px-4 py-3">
				<p class="text-xs text-zinc-500">{lobbyPlayerIds.length < 2 ? 'Select at least two players to continue.' : 'Lobby ready.'}</p>
				<button type="button" disabled={lobbyPlayerIds.length < 2} class="inline-flex h-10 items-center gap-2 rounded-md bg-sky-600 px-4 text-sm font-semibold text-zinc-100 transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40" onclick={beginDraft}>
					Set the roles <ArrowRight class="h-4 w-4" />
				</button>
			</div>
		</section>
	{:else if stage === 'draft'}
		<section class="overflow-hidden rounded-md border border-border bg-card" aria-labelledby="draft-title">
			<div class="border-b border-border p-4">
				<h2 id="draft-title" class="flex items-center gap-2 text-base font-semibold text-zinc-100"><Swords class="h-4 w-4 text-zinc-400" /> Assign the draft</h2>
				<p class="mt-1 text-xs text-zinc-400">Suggestions combine 60% role-specific hero score, 20% teammate history, and 20% allied-hero synergy. They update as the draft changes.</p>
			</div>
			<div class="divide-y divide-zinc-800">
				{#each draftPicks as pick, pickIndex}
					{@const recommendations = getRecommendations(pick, pickIndex)}
					<div class="grid gap-3 p-3 sm:p-4 lg:grid-cols-[150px_165px_minmax(0,1fr)] lg:items-start">
						<div class="flex min-w-0 items-center gap-3 pt-1">
							<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-200">{getPlayerName(pick.playerId).slice(0, 1).toUpperCase()}</span>
							<div class="min-w-0"><div class="truncate text-sm font-semibold text-zinc-100">{getPlayerName(pick.playerId)}</div><div class="text-xs text-zinc-500">Lobby player {pickIndex + 1}</div></div>
						</div>
						<div class="grid grid-cols-2 gap-2 lg:grid-cols-1">
							<Select.Root type="single" bind:value={draftPicks[pickIndex].role}>
								<Select.Trigger class="w-full">{pick.role === '-1' ? 'Select role' : getRoleName(Number(pick.role))}</Select.Trigger>
								<Select.Content>
									<Select.Item value="-1" label="Select role">Select role</Select.Item>
									{#each roleIds as role}
										<Select.Item value={role.toString()} label={getRoleName(role)}><div class="flex items-center gap-2"><img src={getRoleIcon(role)} alt="" class="h-5 w-5" /><span>{getRoleName(role)}</span></div></Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<Select.Root type="single" bind:value={draftPicks[pickIndex].heroId}>
								<Select.Trigger class="w-full">{getHeroName(pick.heroId)}</Select.Trigger>
								<Select.Content>
									<Select.Item value="-1" label="Select hero">Select hero</Select.Item>
									{#each data.heroList as hero}
										<Select.Item value={hero.id.toString()} label={hero.name}><div class="flex items-center gap-2"><img src={makeHeroIcon(hero.img)} alt="" class="h-7 w-7 rounded-sm object-contain" /><span>{hero.name}</span></div></Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="min-w-0">
							<div class="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400"><Lightbulb class="h-3.5 w-3.5" /> Suggested heroes</div>
							{#if pick.role === '-1'}
								<div class="flex h-14 items-center rounded-md border border-dashed border-zinc-700 px-3 text-xs text-zinc-500">Choose a role to rank this player’s hero pool.</div>
							{:else if recommendations.length === 0}
								<div class="flex h-14 items-center rounded-md border border-dashed border-zinc-700 px-3 text-xs text-zinc-500">No recorded hero history for this player yet. Use the hero selector.</div>
							{:else}
								<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(145px,0.9fr)]">
									{#each recommendations as recommendation, recommendationIndex}
										<button type="button" class={`min-w-0 rounded-md border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${recommendation.isWorstPick ? (pick.heroId === recommendation.heroId.toString() ? 'border-red-400 bg-red-950/50 ring-1 ring-red-400 xl:ml-1' : 'border-red-900/70 bg-red-950/30 hover:border-red-600 xl:ml-1') : pick.heroId === recommendation.heroId.toString() ? 'border-sky-500 bg-sky-950/30' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'}`} onclick={() => selectRecommendation(pickIndex, recommendation.heroId)}>
											{#if recommendation.isWorstPick}
												<div class="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-red-400"><TriangleAlert class="h-3 w-3" /> Worst fit</div>
											{/if}
											<div class="flex items-center gap-2">
												<img src={recommendation.heroIcon} alt="" class="h-9 w-9 shrink-0 rounded-sm object-contain" />
												<div class="min-w-0 flex-1"><div class={`flex items-center gap-1 text-xs font-semibold ${recommendation.isWorstPick ? 'text-red-300' : 'text-zinc-100'}`}>{#if recommendationIndex === 0}<Sparkles class="h-3 w-3 text-sky-400" />{/if}<span class="truncate">{recommendation.heroName}</span></div><div class={`mt-0.5 whitespace-nowrap text-[10px] tabular-nums ${recommendation.isWorstPick ? 'text-red-400/80' : 'text-zinc-500'}`}>Fit {formatNumber(recommendation.score)} · {recommendation.roleMatches} games</div></div>
											</div>
											<div title="Hero score · Teammate score · Allied hero score" class={`mt-1.5 truncate text-[10px] tabular-nums ${recommendation.isWorstPick ? 'text-red-400/70' : 'text-zinc-500'}`}>H {formatNumber(recommendation.playerRoleScore)} · T {formatNumber(recommendation.teammateScore)} · A {formatNumber(recommendation.alliedHeroScore)}</div>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			{#if hasDuplicateRoles || hasDuplicateHeroes}
				<div class="border-t border-amber-500/30 bg-amber-950/20 px-4 py-2 text-xs text-amber-100">{hasDuplicateRoles ? 'Each player needs a different role. ' : ''}{hasDuplicateHeroes ? 'Each player needs a different hero.' : ''}</div>
			{/if}
			<div class="flex items-center justify-between border-t border-border px-4 py-3">
				<button type="button" class="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onclick={() => (stage = 'pregame')}><ArrowLeft class="h-4 w-4" /> Lobby</button>
				<button type="button" disabled={!draftReady} class="inline-flex h-10 items-center gap-2 rounded-md bg-sky-600 px-4 text-sm font-semibold text-zinc-100 transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40" onclick={() => (stage = 'match')}>Review the match <ArrowRight class="h-4 w-4" /></button>
			</div>
		</section>
	{:else}
		<section class="overflow-hidden rounded-md border border-border bg-card" aria-labelledby="lineup-title">
			<div class="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
				<div><h2 id="lineup-title" class="flex items-center gap-2 text-base font-semibold text-zinc-100"><Swords class="h-4 w-4 text-zinc-400" /> Match lineup</h2><p class="mt-1 text-xs text-zinc-400">The final draft and its historical outlook.</p></div>
				<button type="button" class="inline-flex h-9 items-center gap-2 self-start rounded-md border border-zinc-700 px-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onclick={() => (stage = 'draft')}><ArrowLeft class="h-4 w-4" /> Edit draft</button>
			</div>
			<div class="grid divide-y divide-zinc-800 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
				{#each analysisSlots.filter((slot) => slot.playerId !== null) as slot}
					<div class="flex items-center gap-3 p-3"><img src={slot.heroIcon} alt="" class="h-12 w-12 shrink-0 rounded-sm object-contain" /><div class="min-w-0"><div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500"><img src={getRoleIcon(slot.role)} alt="" class="h-4 w-4" /> {getRoleName(slot.role)}</div><div class="truncate text-sm font-semibold text-zinc-100">{slot.playerName}</div><div class="truncate text-xs text-zinc-400">{slot.heroName}</div></div></div>
				{/each}
			</div>
		</section>

		<div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
			<Card.Root class="rounded-md border-border bg-card shadow-none">
				<Card.Header class="px-4 pt-4 pb-0"><Card.Title class="flex items-center gap-2 text-base"><BrainCircuit class="h-4 w-4 text-zinc-400" /> Estimated win rate</Card.Title></Card.Header>
				<Card.Content class="px-4 pt-3 pb-4">
					<div class="flex flex-wrap items-end gap-x-3 gap-y-1"><div class="text-4xl font-semibold tabular-nums text-zinc-100">{formatNumber(estimate.value, 1)}%</div><div class={`pb-1 text-sm ${estimate.delta >= 0 ? 'text-green-300' : 'text-red-300'}`}>{estimate.delta > 0 ? '+' : ''}{formatNumber(estimate.delta, 1)} pts vs baseline</div></div>
					<div class="mt-4 h-3 overflow-hidden rounded-full bg-zinc-950"><div class="h-full rounded-full bg-sky-500" style:width={barWidth(estimate.value)}></div></div>
					<div class="mt-3 grid grid-cols-3 gap-2 text-sm">
						<div class="rounded-md border border-zinc-800 bg-zinc-950/50 p-2"><div class="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400"><Gauge class="h-3.5 w-3.5" /> Confidence</div><div class="mt-1 text-lg font-semibold tabular-nums">{formatNumber(estimate.confidence * 100)}%</div></div>
						<div class="rounded-md border border-zinc-800 bg-zinc-950/50 p-2"><div class="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400"><Swords class="h-3.5 w-3.5" /> Stack games</div><div class="mt-1 text-lg font-semibold tabular-nums">{formatNumber(estimate.stackGames)}</div></div>
						<div class="rounded-md border border-zinc-800 bg-zinc-950/50 p-2"><div class="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400"><ShieldQuestion class="h-3.5 w-3.5" /> Exact drafts</div><div class="mt-1 text-lg font-semibold tabular-nums">{formatNumber(estimate.exactDrafts)}</div></div>
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root class="rounded-md border-border bg-card shadow-none">
				<Card.Header class="px-4 pt-4 pb-0"><Card.Title class="flex items-center gap-2 text-base"><BarChart3 class="h-4 w-4 text-zinc-400" /> Model evidence</Card.Title><Card.Description class="text-xs text-zinc-400">The historical signals behind this draft.</Card.Description></Card.Header>
				<Card.Content class="px-4 pt-3 pb-4">
					<div class="overflow-hidden rounded-md border border-zinc-800">
						{#each estimate.entries as entry}
							<div class="grid gap-2 border-b border-zinc-900 p-3 last:border-b-0 sm:grid-cols-[1fr_88px_88px]"><div class="min-w-0"><div class="flex items-center justify-between gap-3"><div class="truncate text-sm font-medium text-zinc-100">{entry.label}</div><div class="text-sm tabular-nums text-zinc-200 sm:hidden">{formatNumber(entry.value, 1)}%</div></div><div class="mt-1 text-xs text-zinc-400">{entry.note}</div><div class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-950"><div class="h-full rounded-full bg-zinc-500" style:width={barWidth(entry.value)}></div></div></div><div class="hidden text-right text-sm tabular-nums text-zinc-200 sm:block">{formatNumber(entry.value, 1)}%</div><div class="text-right text-xs tabular-nums text-zinc-400">x{formatNumber(entry.weight, 1)} · n {formatNumber(entry.sample)}</div></div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
		<PlayerWeightSection groups={[{ contributions: playerContributions }]} />
	{/if}
</div>
