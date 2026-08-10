<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { Shuffle, TrendingDown, Trophy } from 'lucide-svelte';

	type TopPlayer = {
		playerId: number;
		username: string;
		smurf: boolean;
		matches: number;
		wins: number;
		losses: number;
		winRate: number;
		score: number;
	};

	type HeroSummary = {
		id: number;
		name: string;
		img: string;
		topPlayers: TopPlayer[];
	};

	type OwnershipChange = {
		hero: {
			id: number;
			name: string;
			img: string;
		};
		changeType: 'changed' | 'new';
	};

	type OwnershipMode = 'best' | 'worst';

	type OwnedHero = {
		id: number;
		name: string;
		img: string;
		score: number;
		matches: number;
		winRate: number;
	};

	type OwnershipPlayer = {
		playerId: number;
		username: string;
		count: number;
		heroes: OwnedHero[];
		color: string;
	};

	type Rect = OwnershipPlayer & {
		x: number;
		y: number;
		width: number;
		height: number;
	};

	type LayoutItem = OwnershipPlayer & {
		area: number;
	};

	type Props = {
		heroes: HeroSummary[];
		ownershipChanges?: OwnershipChange[];
	};

	const { heroes, ownershipChanges = [] }: Props = $props();
	const getOwnershipMode = (): OwnershipMode =>
		page.url.searchParams.get('ownership') === 'worst' ? 'worst' : 'best';
	let ownershipMode = $state<OwnershipMode>(getOwnershipMode());

	const palette = [
		'#34a85a',
		'#4682b4',
		'#a78bfa',
		'#f59e0b',
		'#66d9ef',
		'#e879f9',
		'#94a3b8',
		'#22c55e',
		'#60a5fa',
		'#f97316',
		'#14b8a6',
		'#c084fc'
	];
	const stageWidth = 1000;
	const stageHeight = 520;
	const territoryGap = 5;
	const ownershipModes: { id: OwnershipMode; label: string }[] = [
		{ id: 'best', label: 'Best' },
		{ id: 'worst', label: 'Worst' }
	];

	const getHeroOwner = (hero: HeroSummary) => {
		if (ownershipMode === 'worst') return hero.topPlayers[hero.topPlayers.length - 1];
		return hero.topPlayers[0];
	};

	const getModeButtonClass = (mode: OwnershipMode) =>
		[
			'inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-xs font-medium transition-colors',
			ownershipMode === mode ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
		].join(' ');

	const ownedPlayers = $derived.by(() => {
		const playerMap = new Map<number, Omit<OwnershipPlayer, 'count' | 'color'>>();

		for (const hero of heroes) {
			const owner = getHeroOwner(hero);
			if (!owner) continue;

			const current = playerMap.get(owner.playerId) ?? {
				playerId: owner.playerId,
				username: owner.username,
				heroes: []
			};

			current.heroes.push({
				id: hero.id,
				name: hero.name,
				img: hero.img,
				score: owner.score,
				matches: owner.matches,
				winRate: owner.winRate
			});
			playerMap.set(owner.playerId, current);
		}

		return Array.from(playerMap.values())
			.map((player, index) => ({
				...player,
				count: player.heroes.length,
				color: palette[index % palette.length],
				heroes: player.heroes.sort((a, b) =>
					ownershipMode === 'worst' ? a.score - b.score : b.score - a.score
				)
			}))
			.sort((a, b) => {
				if (b.count !== a.count) return b.count - a.count;
				return a.username.localeCompare(b.username);
			});
	});

	const recentlyChangedHeroIds = $derived(new Set(ownershipChanges.map((change) => change.hero.id)));
	const modeCopy = $derived({
		eyebrow: ownershipMode === 'worst' ? 'Weakness Infographic' : 'Ownership Infographic',
		title: ownershipMode === 'worst' ? 'Who Struggles With The Hero Pool?' : 'Who Owns The Hero Pool?',
		description:
			ownershipMode === 'worst'
				? 'Area shows how many heroes each player is currently worst calibrated on.'
				: 'Area shows how many heroes each player owns.'
	});

	const getWorstAspect = (row: LayoutItem[], side: number) => {
		if (row.length === 0) return Number.POSITIVE_INFINITY;

		const rowArea = row.reduce((sum, item) => sum + item.area, 0);
		const maxArea = Math.max(...row.map((item) => item.area));
		const minArea = Math.min(...row.map((item) => item.area));
		const sideSquared = side * side;

		return Math.max((sideSquared * maxArea) / (rowArea * rowArea), (rowArea * rowArea) / (sideSquared * minArea));
	};

	const layoutRow = (
		row: LayoutItem[],
		x: number,
		y: number,
		width: number,
		height: number
	) => {
		const rowArea = row.reduce((sum, item) => sum + item.area, 0);
		const rects: Rect[] = [];

		if (width >= height) {
			const columnWidth = rowArea / height;
			let currentY = y;

			for (const item of row) {
				const itemHeight = item.area / columnWidth;
				rects.push({ ...item, x, y: currentY, width: columnWidth, height: itemHeight });
				currentY += itemHeight;
			}

			return {
				rects,
				x: x + columnWidth,
				y,
				width: width - columnWidth,
				height
			};
		}

		const rowHeight = rowArea / width;
		let currentX = x;

		for (const item of row) {
			const itemWidth = item.area / rowHeight;
			rects.push({ ...item, x: currentX, y, width: itemWidth, height: rowHeight });
			currentX += itemWidth;
		}

		return {
			rects,
			x,
			y: y + rowHeight,
			width,
			height: height - rowHeight
		};
	};

	const buildTreemapRects = (players: OwnershipPlayer[]) => {
		const total = players.reduce((sum, player) => sum + player.count, 0);
		if (total === 0) return [];

		const scale = (stageWidth * stageHeight) / total;
		const items = players.map((player) => ({ ...player, area: player.count * scale }));
		const rects: Rect[] = [];
		let remainingItems = [...items];
		let row: LayoutItem[] = [];
		let x = 0;
		let y = 0;
		let width = stageWidth;
		let height = stageHeight;

		while (remainingItems.length > 0) {
			const item = remainingItems[0];
			const side = Math.min(width, height);
			const nextRow = [...row, item];

			if (row.length === 0 || getWorstAspect(nextRow, side) <= getWorstAspect(row, side)) {
				row = nextRow;
				remainingItems = remainingItems.slice(1);
			} else {
				const layout = layoutRow(row, x, y, width, height);
				rects.push(...layout.rects);
				x = layout.x;
				y = layout.y;
				width = layout.width;
				height = layout.height;
				row = [];
			}
		}

		if (row.length > 0) {
			const layout = layoutRow(row, x, y, width, height);
			rects.push(...layout.rects);
		}

		return rects;
	};

	const treemapRects = $derived(buildTreemapRects(ownedPlayers));

	const getTerritoryStyle = (rect: Rect) => {
		const gap = Math.min(territoryGap, rect.width / 8, rect.height / 8);
		return [
			`left:${((rect.x + gap) / stageWidth) * 100}%`,
			`top:${((rect.y + gap) / stageHeight) * 100}%`,
			`width:${(Math.max(0, rect.width - gap * 2) / stageWidth) * 100}%`,
			`height:${(Math.max(0, rect.height - gap * 2) / stageHeight) * 100}%`,
			`--owner-color:${rect.color}`
		].join(';');
	};

	const getHeroStyle = (rect: Rect, index: number) => {
		const territoryWidth = Math.max(1, rect.width - Math.min(territoryGap, rect.width / 8, rect.height / 8) * 2);
		const territoryHeight = Math.max(1, rect.height - Math.min(territoryGap, rect.width / 8, rect.height / 8) * 2);
		const headerHeight = territoryHeight < 58 ? 16 : 28;
		const padding = territoryWidth < 80 || territoryHeight < 80 ? 4 : 7;
		const gap = territoryWidth < 100 || territoryHeight < 90 ? 2 : 4;
		const usableWidth = Math.max(1, territoryWidth - padding * 2);
		const usableHeight = Math.max(1, territoryHeight - headerHeight - padding);
		const columns = Math.max(
			1,
			Math.ceil(Math.sqrt(rect.heroes.length * (usableWidth / usableHeight)))
		);
		const rows = Math.max(1, Math.ceil(rect.heroes.length / columns));
		const cellWidth = usableWidth / columns;
		const cellHeight = usableHeight / rows;
		const size = Math.max(1, Math.min(cellWidth - gap, cellHeight - gap));
		const column = index % columns;
		const row = Math.floor(index / columns);
		const centerX = padding + column * cellWidth + cellWidth / 2;
		const centerY = headerHeight + row * cellHeight + cellHeight / 2;
		const left = Math.max(0, Math.min(territoryWidth - size, centerX - size / 2));
		const top = Math.max(0, Math.min(territoryHeight - size, centerY - size / 2));

		return [
			`left:${(left / territoryWidth) * 100}%`,
			`top:${(top / territoryHeight) * 100}%`,
			`width:${(size / territoryWidth) * 100}%`,
			`height:${(size / territoryHeight) * 100}%`
		].join(';');
	};

	const getLabelSize = (rect: Rect) => {
		if (rect.width < 58 || rect.height < 44) return 8;
		if (rect.width < 110 || rect.height < 70) return 10;
		return 13;
	};

	const setOwnershipMode = (mode: OwnershipMode) => {
		ownershipMode = mode;
		const nextUrl = new URL(page.url);
		nextUrl.searchParams.set('ownership', mode);
		replaceState(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, page.state);
	};
</script>

<section class="rounded-md border border-border bg-card p-4">
	<div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<div class="text-sm text-zinc-400">{modeCopy.eyebrow}</div>
			<h2 class="mt-1 text-xl font-semibold tracking-normal text-zinc-100">
				{modeCopy.title}
			</h2>
		</div>
		<div class="inline-flex rounded-md border border-zinc-800 bg-zinc-950/50 p-0.5">
			{#each ownershipModes as mode}
				<button
					class={getModeButtonClass(mode.id)}
					type="button"
					aria-pressed={ownershipMode === mode.id}
					onclick={() => setOwnershipMode(mode.id)}
				>
					{#if mode.id === 'best'}
						<Trophy class="h-3.5 w-3.5" />
					{:else}
						<TrendingDown class="h-3.5 w-3.5" />
					{/if}
					{mode.label}
				</button>
			{/each}
		</div>
	</div>

	<article class="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950/35">
		<div class="border-b border-zinc-800 px-3 py-2">
			<h3 class="text-sm font-semibold text-zinc-100">Treemap Territories</h3>
			<p class="mt-0.5 text-xs text-zinc-500">{modeCopy.description}</p>
		</div>
		<div class="ownership-stage">
			{#each treemapRects as rect}
				<div
					class="territory absolute overflow-hidden rounded-md border"
					style={getTerritoryStyle(rect)}
				>
					<div
						class="pointer-events-none absolute left-2 right-2 top-1.5 z-10 flex items-center justify-between gap-2 text-zinc-100"
						style={`font-size:${getLabelSize(rect)}px`}
					>
						<span class="min-w-0 truncate font-semibold">{rect.username}</span>
						<span class="shrink-0 tabular-nums text-zinc-300">{rect.count}</span>
					</div>
					{#each rect.heroes as hero, index}
						<a
							href={`/heroes/${hero.id}`}
							class="absolute overflow-hidden rounded-sm border border-zinc-950/70 bg-zinc-900 transition-transform hover:z-20 hover:scale-105 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							style={getHeroStyle(rect, index)}
							title={`${hero.name}: ${rect.username}, score ${hero.score}${recentlyChangedHeroIds.has(hero.id) ? ' · recently changed owner' : ''}`}
							aria-label={`${hero.name}, owned by ${rect.username}`}
						>
							<img
								src={hero.img}
								alt=""
								draggable="false"
								class="pointer-events-none h-full w-full select-none object-cover"
							/>
							{#if recentlyChangedHeroIds.has(hero.id)}
								<span
									class="pointer-events-none absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-sm border border-sky-300/70 bg-sky-950/90 text-sky-200 shadow-sm shadow-black/40"
									aria-hidden="true"
								>
									<Shuffle class="h-2.5 w-2.5" />
								</span>
							{/if}
						</a>
					{/each}
				</div>
			{/each}
		</div>
	</article>
</section>

<style>
	.ownership-stage {
		position: relative;
		height: 520px;
		overflow: hidden;
		background:
			linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
			rgba(3, 16, 24, 0.36);
		background-size: 32px 32px;
	}

	.territory {
		background-color: color-mix(in srgb, var(--owner-color) 13%, transparent);
		border-color: color-mix(in srgb, var(--owner-color) 55%, transparent);
		box-sizing: border-box;
	}
</style>
