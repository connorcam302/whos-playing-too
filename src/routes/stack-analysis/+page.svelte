<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { getRoleIcon, getRoleName } from '$lib/functions';
	import { BarChart3, BrainCircuit, Gauge, ShieldQuestion, Swords } from 'lucide-svelte';
	import dayjs from 'dayjs';

	type StatRow = {
		playerId: number;
		username: string;
		smurf: boolean;
		matchId: number;
		startTime: number;
		duration: number;
		lobby: number;
		gameMode: number;
		winner: string;
		team: string;
		role: number;
		heroId: number;
		heroName: string;
		impact: number;
	};

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

	type Sample = {
		matches: number;
		wins: number;
		winRate: number;
	};

	type Evidence = {
		label: string;
		value: number;
		weight: number;
		sample: number;
		note: string;
	};

	type PlayerContribution = {
		slot: Slot;
		playerName: string;
		heroName: string;
		heroIcon?: string;
		selected: boolean;
		value: number;
		delta: number;
		components: {
			label: string;
			value: number;
			delta: number;
			sample: number;
			enabled: boolean;
		}[];
	};

	type Props = {
		data: {
			rows: StatRow[];
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
	const uniqueNumbers = (values: number[]) => Array.from(new Set(values));
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

	const sampleFromRows = (rows: StatRow[]): Sample => {
		const matches = rows.length;
		const wins = rows.filter((row) => row.team === row.winner).length;
		return {
			matches,
			wins,
			winRate: matches > 0 ? (wins / matches) * 100 : 50
		};
	};

	const sampleFromSides = (sides: StatRow[][]): Sample => {
		const wins = sides.filter((side) => side[0]?.team === side[0]?.winner).length;
		return {
			matches: sides.length,
			wins,
			winRate: sides.length > 0 ? (wins / sides.length) * 100 : 50
		};
	};

	const confidenceFor = (sample: number, target: number) => clamp(sample / target, 0, 1);
	const weightedRate = (sample: Sample, fallback: number, target: number) => {
		const confidence = confidenceFor(sample.matches, target);
		return fallback + (sample.winRate - fallback) * confidence;
	};

	const bySide = $derived.by(() => {
		const sideMap = data.rows.reduce((map, row) => {
			const sideKey = `${row.matchId}:${row.team}`;
			const rows = map.get(sideKey) ?? [];
			rows.push(row);
			map.set(sideKey, rows);
			return map;
		}, new Map<string, StatRow[]>());
		return Array.from(sideMap.values());
	});

	const contextRows = $derived(data.rows);
	const baseline = $derived(sampleFromSides(bySide));
	const selectedStackSides = $derived.by(() => {
		if (selectedPlayerIds.length === 0) return [];
		const requiredIds = uniqueNumbers(selectedPlayerIds);
		if (requiredIds.length < 2) return [];
		return bySide.filter((side) => {
			const sidePlayerIds = new Set(side.map((row) => row.playerId));
			return requiredIds.every((playerId) => sidePlayerIds.has(playerId));
		});
	});
	const exactDraftSides = $derived.by(() => {
		if (selectedSlots.length === 0) return [];
		if (uniqueNumbers(selectedPlayerIds).length < 2) return [];
		return selectedStackSides.filter((side) =>
			selectedSlots.every((slot) =>
				side.some(
					(row) =>
						row.playerId === Number(slot.playerId) &&
						(slot.heroId === '-1' || row.heroId === Number(slot.heroId)) &&
						row.role === slot.role
				)
			)
		);
	});

	const playerHeroEvidence = $derived.by(() => {
		const fallback = baseline.winRate;
		return slots
			.filter((slot) => slot.playerId !== '-1' && slot.heroId !== '-1')
			.map((slot) => {
				const rows = contextRows.filter(
					(row) => row.playerId === Number(slot.playerId) && row.heroId === Number(slot.heroId)
				);
				const sample = sampleFromRows(rows);
				return weightedRate(sample, fallback, 12);
			});
	});

	const roleEvidence = $derived.by(() => {
		const fallback = baseline.winRate;
		return selectedSlots.map((slot) => {
			const rows = contextRows.filter(
				(row) => row.playerId === Number(slot.playerId) && row.role === slot.role
			);
			const sample = sampleFromRows(rows);
			return weightedRate(sample, fallback, 20);
		});
	});

	const heroEvidence = $derived.by(() => {
		const fallback = baseline.winRate;
		return slots
			.filter((slot) => slot.heroId !== '-1')
			.map((slot) => {
				const rows = contextRows.filter((row) => row.heroId === Number(slot.heroId) && row.role === slot.role);
				const sample = sampleFromRows(rows);
				return weightedRate(sample, fallback, 25);
			});
	});

	const recentEvidence = $derived.by(() => {
		const fallback = baseline.winRate;
		const recentFloor = dayjs().subtract(60, 'day').unix();
		return selectedSlots.map((slot) => {
			const rows = contextRows.filter(
				(row) => row.playerId === Number(slot.playerId) && row.startTime >= recentFloor
			);
			const sample = sampleFromRows(rows);
			return weightedRate(sample, fallback, 12);
		});
	});

	const average = (values: number[], fallback: number) =>
		values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

	const getPlayerName = (playerId: string) =>
		data.playerList.find((player) => player.id.toString() === playerId)?.username ?? 'Select player';
	const getHeroName = (heroId: string) =>
		data.heroList.find((hero) => hero.id.toString() === heroId)?.name ?? 'Select hero';
	const makeHeroIcon = (img?: string) => img?.replace('/heroes/', '/heroes/icons/');
	const getHeroIcon = (heroId: string) =>
		makeHeroIcon(data.heroList.find((hero) => hero.id.toString() === heroId)?.img);

	const playerContributions = $derived.by((): PlayerContribution[] =>
		slots.map((slot) => {
			const selected = slot.playerId !== '-1';
			const playerName = getPlayerName(slot.playerId);
			const heroName = getHeroName(slot.heroId);
			const heroIcon = getHeroIcon(slot.heroId);
			const playerId = Number(slot.playerId);
			const heroId = Number(slot.heroId);
			const heroRows =
				selected && slot.heroId !== '-1'
					? contextRows.filter((row) => row.playerId === playerId && row.heroId === heroId)
					: [];
			const roleRows = selected
				? contextRows.filter((row) => row.playerId === playerId && row.role === slot.role)
				: [];
			const recentFloor = dayjs().subtract(60, 'day').unix();
			const recentRows = selected
				? contextRows.filter((row) => row.playerId === playerId && row.startTime >= recentFloor)
				: [];
			const heroSample = sampleFromRows(heroRows);
			const roleSample = sampleFromRows(roleRows);
			const recentSample = sampleFromRows(recentRows);
			const components = [
				{
					label: 'Hero',
					value: weightedRate(heroSample, baseline.winRate, 12),
					delta: weightedRate(heroSample, baseline.winRate, 12) - baseline.winRate,
					sample: heroSample.matches,
					enabled: selected && slot.heroId !== '-1'
				},
				{
					label: 'Role',
					value: weightedRate(roleSample, baseline.winRate, 20),
					delta: weightedRate(roleSample, baseline.winRate, 20) - baseline.winRate,
					sample: roleSample.matches,
					enabled: selected
				},
				{
					label: 'Form',
					value: weightedRate(recentSample, baseline.winRate, 12),
					delta: weightedRate(recentSample, baseline.winRate, 12) - baseline.winRate,
					sample: recentSample.matches,
					enabled: selected
				}
			];
			const activeComponents = components.filter((component) => component.enabled);
			const value = average(
				activeComponents.map((component) => component.value),
				baseline.winRate
			);

			return {
				slot,
				playerName,
				heroName,
				heroIcon,
				selected,
				value,
				delta: selected ? value - baseline.winRate : 0,
				components
			};
		})
	);

	const estimate = $derived.by(() => {
		const exactDraftSample = sampleFromSides(exactDraftSides);
		const stackSample = sampleFromSides(selectedStackSides);
		const entries: Evidence[] = [
			{
				label: 'Group baseline',
				value: baseline.winRate,
				weight: 1,
				sample: baseline.matches,
				note: 'All matching team sides'
			},
			{
				label: 'Stack history',
				value: weightedRate(stackSample, baseline.winRate, 10),
				weight: selectedPlayerIds.length >= 2 ? 1.6 : 0,
				sample: stackSample.matches,
				note: 'Same selected players together'
			},
			{
				label: 'Exact draft history',
				value: weightedRate(exactDraftSample, baseline.winRate, 4),
				weight: exactDraftSample.matches > 0 ? 1.4 : 0,
				sample: exactDraftSample.matches,
				note: 'Same players on these heroes and roles'
			},
			{
				label: 'Player hero comfort',
				value: average(playerHeroEvidence, baseline.winRate),
				weight: playerHeroEvidence.length > 0 ? 1.5 : 0,
				sample: playerHeroEvidence.length,
				note: 'Each player on their selected hero'
			},
			{
				label: 'Role fit',
				value: average(roleEvidence, baseline.winRate),
				weight: roleEvidence.length > 0 ? 1 : 0,
				sample: roleEvidence.length,
				note: 'Each player in the selected position'
			},
			{
				label: 'Hero role form',
				value: average(heroEvidence, baseline.winRate),
				weight: heroEvidence.length > 0 ? 0.8 : 0,
				sample: heroEvidence.length,
				note: 'Heroes in these positions across the group'
			},
			{
				label: 'Recent player form',
				value: average(recentEvidence, baseline.winRate),
				weight: recentEvidence.length > 0 ? 0.7 : 0,
				sample: recentEvidence.length,
				note: 'Last 60 days for selected players'
			}
		].filter((entry) => entry.weight > 0);
		const weightedTotal = entries.reduce((sum, entry) => sum + entry.value * entry.weight, 0);
		const weightTotal = entries.reduce((sum, entry) => sum + entry.weight, 0);
		const raw = weightTotal > 0 ? weightedTotal / weightTotal : baseline.winRate;
		const completedSlots = slots.filter((slot) => slot.playerId !== '-1' && slot.heroId !== '-1').length;
		const stackSize = uniqueNumbers(selectedPlayerIds).length;
		const completedDraftRatio = completedSlots / 5;
		const confidence =
			(stackSize >= 2 ? clamp(selectedStackSides.length / 12, 0, 0.3) : 0) +
			clamp(playerHeroEvidence.length / 5, 0, 0.2) +
			(stackSize >= 2 ? clamp(exactDraftSides.length / 4, 0, 0.2) * completedDraftRatio : 0) +
			clamp(completedDraftRatio, 0, 0.25);

		return {
			value: clamp(raw, 5, 95),
			confidence: clamp(confidence, 0.1, 1),
			entries
		};
	});

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
	const contributionWidth = (delta: number) => `${(Math.min(Math.abs(delta), 20) / 20) * 50}%`;
	const contributionLeft = (delta: number) => {
		const width = (Math.min(Math.abs(delta), 20) / 20) * 50;
		return delta < 0 ? `${50 - width}%` : '50%';
	};
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
						{formatNumber(estimate.value - baseline.winRate, 1)} pts vs baseline
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
						<div class="mt-1 text-lg font-semibold tabular-nums">{formatNumber(selectedStackSides.length)}</div>
					</div>
					<div class="rounded-md border border-zinc-800 bg-zinc-950/50 p-2">
						<div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
							<ShieldQuestion class="h-3.5 w-3.5" /> Exact Drafts
						</div>
						<div class="mt-1 text-lg font-semibold tabular-nums">{formatNumber(exactDraftSides.length)}</div>
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

	<Card.Root class="rounded-md border-border bg-card shadow-none">
		<Card.Header class="px-4 pt-4 pb-0">
			<Card.Title class="text-base">Player Weight</Card.Title>
			<Card.Description class="text-xs text-zinc-400">How each selected slot moves the estimate against the current baseline.</Card.Description>
		</Card.Header>
		<Card.Content class="px-4 pt-3 pb-4">
			<div class="grid gap-3 lg:grid-cols-5">
				{#each playerContributions as contribution}
					<div class="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
						<div class="flex items-center gap-2">
							<img src={getRoleIcon(contribution.slot.role)} alt="" class="h-6 w-6" />
							<div class="min-w-0">
								<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">
									{getRoleName(contribution.slot.role)}
								</div>
								<div class="truncate text-sm font-semibold text-zinc-100">{contribution.playerName}</div>
							</div>
						</div>
						<div class="mt-3 flex items-center gap-2">
							{#if contribution.heroIcon}
								<img src={contribution.heroIcon} alt="" class="h-10 w-10 rounded-sm object-contain" />
							{:else}
								<div class="h-10 w-10 rounded-sm bg-zinc-900"></div>
							{/if}
							<div class="min-w-0 text-sm text-zinc-300">{contribution.heroName}</div>
						</div>
						<div class="mt-3">
							<div class="flex items-center justify-between text-xs">
								<span class="text-zinc-400">Net weight</span>
								<span
									class={contribution.delta > 0
										? 'tabular-nums text-green-300'
										: contribution.delta < 0
											? 'tabular-nums text-red-300'
											: 'tabular-nums text-zinc-400'}
								>
									{contribution.delta > 0 ? '+' : ''}{formatNumber(contribution.delta, 1)} pts
								</span>
							</div>
							<div class="relative mt-2 h-2 rounded-full bg-zinc-900">
								<div class="absolute left-1/2 top-[-3px] h-4 w-px bg-zinc-600"></div>
								<div
									class={contribution.delta >= 0
										? 'absolute top-0 h-full rounded-full bg-green-500'
										: 'absolute top-0 h-full rounded-full bg-red-500'}
									style:left={contributionLeft(contribution.delta)}
									style:width={contributionWidth(contribution.delta)}
								></div>
							</div>
						</div>
						<div class="mt-3 flex flex-col gap-1.5">
							{#each contribution.components as component}
								<div class="grid grid-cols-[42px_1fr_54px] items-center gap-2 text-[11px]">
									<div class={component.enabled ? 'text-zinc-400' : 'text-zinc-600'}>{component.label}</div>
									<div class="h-1 overflow-hidden rounded-full bg-zinc-900">
										<div
											class={component.delta >= 0 ? 'h-full bg-green-500/70' : 'h-full bg-red-500/70'}
											style:width={contributionWidth(component.delta)}
										></div>
									</div>
									<div
										class={component.enabled
											? component.delta > 0
												? 'text-right tabular-nums text-green-300'
												: component.delta < 0
													? 'text-right tabular-nums text-red-300'
													: 'text-right tabular-nums text-zinc-400'
											: 'text-right tabular-nums text-zinc-600'}
									>
										{component.enabled ? `${component.delta > 0 ? '+' : ''}${formatNumber(component.delta, 1)}` : '-'}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

</div>
