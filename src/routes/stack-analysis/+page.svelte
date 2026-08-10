<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import PlayerWeightSection from '$lib/components/stack-analysis/PlayerWeightSection.svelte';
	import { getRoleIcon, getRoleName } from '$lib/functions';
	import { getPlayerContributions, getStackEstimate, type StackAnalysisRow } from '$lib/stack-analysis';
	import { BarChart3, BrainCircuit, Gauge, ShieldQuestion, Swords } from 'lucide-svelte';

	type PlayerOption = {
		id: number;
		username: string;
	};

	type HeroOption = {
		id: number;
		name: string;
		img: string;
	};

	type Slot = {
		role: number;
		playerId: string;
		heroId: string;
	};

	type Props = {
		data: {
			rows: StackAnalysisRow[];
			playerList: PlayerOption[];
			heroList: HeroOption[];
		};
	};

	let { data }: Props = $props();
	let slots = $state<Slot[]>([
		{ role: 1, playerId: '-1', heroId: '-1' },
		{ role: 2, playerId: '-1', heroId: '-1' },
		{ role: 3, playerId: '-1', heroId: '-1' },
		{ role: 4, playerId: '-1', heroId: '-1' },
		{ role: 5, playerId: '-1', heroId: '-1' }
	]);

	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value || 0);

	const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
	const selectedSlots = $derived(slots.filter((slot) => slot.playerId !== '-1'));
	const selectedPlayerIds = $derived(selectedSlots.map((slot) => Number(slot.playerId)));
	const selectedHeroIds = $derived(
		slots.filter((slot) => slot.heroId !== '-1').map((slot) => Number(slot.heroId))
	);
	const duplicatePlayerIds = $derived(
		selectedPlayerIds.filter((playerId, index) => selectedPlayerIds.indexOf(playerId) !== index)
	);
	const duplicateHeroIds = $derived(
		selectedHeroIds.filter((heroId, index) => selectedHeroIds.indexOf(heroId) !== index)
	);

	const getPlayerName = (playerId: string) =>
		data.playerList.find((player) => player.id.toString() === playerId)?.username ?? 'Select player';
	const getHeroName = (heroId: string) =>
		data.heroList.find((hero) => hero.id.toString() === heroId)?.name ?? 'Select hero';
	const makeHeroIcon = (img?: string) => img?.replace('/heroes/', '/heroes/icons/');
	const getHeroIcon = (heroId: string) =>
		makeHeroIcon(data.heroList.find((hero) => hero.id.toString() === heroId)?.img);

	const analysisSlots = $derived(
		slots.map((slot) => ({
			role: slot.role,
			playerId: slot.playerId === '-1' ? null : Number(slot.playerId),
			playerName: getPlayerName(slot.playerId),
			heroId: slot.heroId === '-1' ? null : Number(slot.heroId),
			heroName: getHeroName(slot.heroId),
			heroIcon: getHeroIcon(slot.heroId)
		}))
	);
	const playerContributions = $derived(getPlayerContributions(data.rows, analysisSlots));
	const estimate = $derived(getStackEstimate(data.rows, analysisSlots));

	const resetDraft = () => {
		slots = [
			{ role: 1, playerId: '-1', heroId: '-1' },
			{ role: 2, playerId: '-1', heroId: '-1' },
			{ role: 3, playerId: '-1', heroId: '-1' },
			{ role: 4, playerId: '-1', heroId: '-1' },
			{ role: 5, playerId: '-1', heroId: '-1' }
		];
	};

	const barWidth = (value: number) => `${clamp(value, 0, 100)}%`;
</script>

<svelte:head>
	<title>whos-playing | Stack Analysis</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4">
	<div class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight text-zinc-100">Stack Analysis</h1>
		<p class="text-sm text-zinc-400">Estimate a lineup win rate from selected players, roles, and heroes.</p>
	</div>

	<div class="grid gap-3 rounded-md border border-border bg-card p-3">
		<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
			{#each slots as slot, index}
				<div class="min-w-0 rounded-md border border-zinc-800 bg-zinc-950/50 p-2">
					<div class="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
						<img src={getRoleIcon(slot.role)} alt="" class="h-5 w-5" />
						<span>{getRoleName(slot.role)}</span>
					</div>
					<div class="flex flex-col gap-2">
						<Select.Root type="single" bind:value={slots[index].playerId}>
							<Select.Trigger class="w-full">{getPlayerName(slot.playerId)}</Select.Trigger>
							<Select.Content>
								<Select.Item value="-1" label="Select player">Select player</Select.Item>
								{#each data.playerList as player}
									<Select.Item value={player.id.toString()} label={player.username}>{player.username}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<Select.Root type="single" bind:value={slots[index].heroId}>
							<Select.Trigger class="w-full">{getHeroName(slot.heroId)}</Select.Trigger>
							<Select.Content>
								<Select.Item value="-1" label="Select hero">Select hero</Select.Item>
								{#each data.heroList as hero}
									<Select.Item value={hero.id.toString()} label={hero.name}>
										<div class="flex items-center gap-2">
											<img src={makeHeroIcon(hero.img)} alt="" class="h-7 w-7 rounded-sm object-contain" />
											<span>{hero.name}</span>
										</div>
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>
			{/each}
		</div>
		<div class="flex justify-end">
			<button
				type="button"
				class="h-10 rounded-md bg-sky-600 px-3 text-sm font-medium text-white transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				onclick={resetDraft}
			>
				Clear
			</button>
		</div>
	</div>

	{#if duplicatePlayerIds.length > 0 || duplicateHeroIds.length > 0}
		<div class="rounded-md border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-100">
			{#if duplicatePlayerIds.length > 0}
				A player is selected more than once.
			{/if}
			{#if duplicateHeroIds.length > 0}
				A hero is selected more than once.
			{/if}
		</div>
	{/if}

	<div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
		<Card.Root class="rounded-md border-border bg-card shadow-none">
			<Card.Header class="px-4 pt-4 pb-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<BrainCircuit class="h-4 w-4 text-zinc-400" />
					Estimated Win Rate
				</Card.Title>
			</Card.Header>
			<Card.Content class="px-4 pt-3 pb-4">
				<div class="flex items-end gap-3">
					<div class="text-5xl font-semibold tabular-nums text-zinc-100">{formatNumber(estimate.value, 1)}%</div>
					<div class="pb-2 text-sm text-zinc-400">
						{formatNumber(estimate.delta, 1)} pts vs baseline
					</div>
				</div>
				<div class="mt-4 h-3 overflow-hidden rounded-full bg-zinc-950">
					<div class="h-full rounded-full bg-sky-500" style:width={barWidth(estimate.value)}></div>
				</div>
				<div class="mt-3 grid gap-2 text-sm sm:grid-cols-3">
					<div class="rounded-md border border-zinc-800 bg-zinc-950/50 p-2">
						<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
							<Gauge class="h-3.5 w-3.5" /> Confidence
						</div>
						<div class="mt-1 text-lg font-semibold tabular-nums">{formatNumber(estimate.confidence * 100)}%</div>
					</div>
					<div class="rounded-md border border-zinc-800 bg-zinc-950/50 p-2">
						<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
							<Swords class="h-3.5 w-3.5" /> Stack Games
						</div>
						<div class="mt-1 text-lg font-semibold tabular-nums">{formatNumber(estimate.stackGames)}</div>
					</div>
					<div class="rounded-md border border-zinc-800 bg-zinc-950/50 p-2">
						<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
							<ShieldQuestion class="h-3.5 w-3.5" /> Exact Drafts
						</div>
						<div class="mt-1 text-lg font-semibold tabular-nums">{formatNumber(estimate.exactDrafts)}</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="rounded-md border-border bg-card shadow-none">
			<Card.Header class="px-4 pt-4 pb-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<BarChart3 class="h-4 w-4 text-zinc-400" />
					Model Evidence
				</Card.Title>
				<Card.Description class="text-xs text-zinc-400">Weighted components behind the estimate.</Card.Description>
			</Card.Header>
			<Card.Content class="px-4 pt-3 pb-4">
				<div class="overflow-hidden rounded-md border border-zinc-800">
					{#each estimate.entries as entry}
						<div class="grid gap-2 border-b border-zinc-900 p-3 last:border-b-0 sm:grid-cols-[1fr_88px_88px]">
							<div class="min-w-0">
								<div class="flex items-center justify-between gap-3">
									<div class="truncate text-sm font-medium text-zinc-100">{entry.label}</div>
									<div class="text-sm tabular-nums text-zinc-200 sm:hidden">{formatNumber(entry.value, 1)}%</div>
								</div>
								<div class="mt-1 text-xs text-zinc-400">{entry.note}</div>
								<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-950">
									<div class="h-full rounded-full bg-zinc-500" style:width={barWidth(entry.value)}></div>
								</div>
							</div>
							<div class="hidden text-right text-sm tabular-nums text-zinc-200 sm:block">{formatNumber(entry.value, 1)}%</div>
							<div class="text-right text-xs tabular-nums text-zinc-400">x{formatNumber(entry.weight, 1)} · n {formatNumber(entry.sample)}</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<PlayerWeightSection groups={[{ contributions: playerContributions }]} />

</div>
