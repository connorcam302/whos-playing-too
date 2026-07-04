<script lang="ts">
	import { goto } from '$app/navigation';

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
	};

	const { heroes }: Props = $props();

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

	const ownedPlayers = $derived.by(() => {
		const playerMap = new Map<number, Omit<OwnershipPlayer, 'count' | 'color'>>();

		for (const hero of heroes) {
			const owner = hero.topPlayers[0];
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
				heroes: player.heroes.sort((a, b) => b.score - a.score)
			}))
			.sort((a, b) => {
				if (b.count !== a.count) return b.count - a.count;
				return a.username.localeCompare(b.username);
			});
	});

	const totalOwnedHeroes = $derived(
		ownedPlayers.reduce((total, player) => total + player.count, 0)
	);
	const topOwner = $derived(ownedPlayers[0]);

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

	const handleHeroClick = (heroId: number) => {
		goto(`/heroes/${heroId}`);
	};
</script>

<section class="rounded-md border border-border bg-card p-4">
	<div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<div class="text-sm text-zinc-400">Ownership Infographic</div>
			<h2 class="mt-1 text-xl font-semibold tracking-normal text-zinc-100">
				Who Owns The Hero Pool?
			</h2>
		</div>
		<div class="flex flex-wrap gap-2 text-xs text-zinc-400">
			<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
				{ownedPlayers.length} owners
			</span>
			<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
				{totalOwnedHeroes} assigned heroes
			</span>
			{#if topOwner}
				<span class="rounded-sm border border-zinc-700 bg-zinc-950/40 px-2 py-1">
					Most owned: {topOwner.username}, {topOwner.count}
				</span>
			{/if}
		</div>
	</div>

	<article class="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950/35">
		<div class="border-b border-zinc-800 px-3 py-2">
			<h3 class="text-sm font-semibold text-zinc-100">Treemap Territories</h3>
			<p class="mt-0.5 text-xs text-zinc-500">Area shows how many heroes each player owns.</p>
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
						<button
							class="absolute overflow-hidden rounded-sm border border-zinc-950/70 bg-zinc-900 transition-transform hover:z-20 hover:scale-105 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							style={getHeroStyle(rect, index)}
							onclick={() => handleHeroClick(hero.id)}
							title={`${hero.name}: ${rect.username}, score ${hero.score}`}
							aria-label={`${hero.name}, owned by ${rect.username}`}
						>
							<img src={hero.img} alt="" class="h-full w-full object-cover" />
						</button>
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
