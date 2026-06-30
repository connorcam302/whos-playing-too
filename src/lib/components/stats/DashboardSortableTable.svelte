<script lang="ts">
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState
	} from '@tanstack/table-core';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Button } from '$lib/components/ui/button';
	import { getRoleIcon, getRoleName, toTime } from '$lib/functions';
	import { ArrowUpDown } from 'lucide-svelte';

	type DashboardColumn = {
		id: string;
		label: string;
		align?: 'left' | 'right';
		width?: string;
		minWidth?: string;
		maxWidth?: string;
	};

	type DashboardRow = Record<string, any>;

	type Props = {
		rows: DashboardRow[];
		columns: DashboardColumn[];
		initialSort?: SortingState;
		emptyLabel?: string;
	};

	let {
		rows,
		columns,
		initialSort = [{ id: columns[1]?.id ?? columns[0]?.id ?? 'matches', desc: true }],
		emptyLabel = 'No rows match the current filters.'
	}: Props = $props();

	let sorting = $state<SortingState>([]);

	$effect(() => {
		if (sorting.length === 0) {
			sorting = initialSort;
		}
	});

	const getCellSortValue = (row: DashboardRow, columnId: string) => {
		if (columnId === 'hero') return row.name ?? '';
		if (columnId === 'role') return row.role ?? 0;
		if (columnId === 'label') return row.sortValue ?? row.label ?? '';
		if (columnId === 'wl') return row.matches ? row.wins / row.matches : 0;
		return row[columnId] ?? 0;
	};

	const tableColumns = $derived<ColumnDef<DashboardRow>[]>(
		columns.map((column) => ({
			id: column.id,
			header: column.label,
			accessorFn: (row) => getCellSortValue(row, column.id),
			sortingFn: (rowA, rowB) => {
				const valueA = getCellSortValue(rowA.original, column.id);
				const valueB = getCellSortValue(rowB.original, column.id);
				if (typeof valueA === 'string' || typeof valueB === 'string') {
					return String(valueA).localeCompare(String(valueB));
				}
				return Number(valueA) - Number(valueB);
			}
		}))
	);

	const table = $derived(
		createSvelteTable({
			data: rows,
			columns: tableColumns,
			state: {
				get sorting() {
					return sorting;
				}
			},
			onSortingChange: (updater) => {
				sorting = updater instanceof Function ? updater(sorting) : updater;
			},
			getCoreRowModel: getCoreRowModel(),
			getSortedRowModel: getSortedRowModel()
		})
	);

	const formatNumber = (value: number, decimals = 0) =>
		new Intl.NumberFormat('en-GB', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals
		}).format(value || 0);

	const getCellClass = (column: DashboardColumn) =>
		column.align === 'right' ? 'text-right tabular-nums' : '';

	const getColumnStyle = (column: DashboardColumn | undefined) => {
		if (!column) return undefined;

		const declarations = [
			column.width ? `width: ${column.width}` : undefined,
			column.minWidth ? `min-width: ${column.minWidth}` : undefined,
			column.maxWidth ? `max-width: ${column.maxWidth}` : undefined
		].filter(Boolean);

		return declarations.length > 0 ? declarations.join('; ') : undefined;
	};

	const formatCellValue = (value: unknown) => {
		if (typeof value === 'number') return formatNumber(value);
		return String(value ?? '');
	};
</script>

<div class="dashboard-table w-full overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
	<div>
		<Table.Root>
			<Table.Header class="bg-zinc-950/70">
				{#each table.getHeaderGroups() as headerGroup}
					<Table.Row class="border-zinc-800 hover:bg-transparent">
						{#each headerGroup.headers as header}
							{@const column = columns.find((item) => item.id === header.column.id)}
							<Table.Head
								class="{getCellClass(column ?? { id: header.column.id, label: '' })} h-8 px-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400"
								style={getColumnStyle(column)}
							>
								{#if !header.isPlaceholder}
									<button
										class="inline-flex items-center gap-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400 hover:text-zinc-100 {column?.align ===
										'right'
											? 'ml-auto'
											: ''}"
										onclick={header.column.getToggleSortingHandler()}
									>
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
										<ArrowUpDown class="h-2.5 w-2.5" />
									</button>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#if table.getRowModel().rows.length === 0}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center text-sm text-zinc-400">
							{emptyLabel}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each table.getRowModel().rows as row}
						<Table.Row class="border-zinc-900 transition-colors hover:bg-zinc-900/70">
							{#each row.getVisibleCells() as cell}
								{@const column = columns.find((item) => item.id === cell.column.id)}
								<Table.Cell
									class="{getCellClass(column ?? { id: cell.column.id, label: '' })} px-1.5 py-1.5 text-sm text-zinc-300"
									style={getColumnStyle(column)}
								>
									{#if cell.column.id === 'player'}
										<span class="block truncate font-medium text-zinc-100">{row.original.username}</span>
									{:else if cell.column.id === 'hero'}
										<div class="flex min-w-0 items-center gap-2 font-medium text-zinc-100">
											<img src={row.original.img} alt="" class="h-7 w-10 rounded-sm object-cover" />
											<span class="truncate">{row.original.name}</span>
										</div>
									{:else if cell.column.id === 'role'}
										<div class="flex items-center font-medium text-zinc-100">
											<img src={getRoleIcon(row.original.role)} alt={getRoleName(row.original.role)} class="h-7 w-7" />
										</div>
									{:else if cell.column.id === 'wl'}
										<div class="min-w-24">
											<Tooltip.Root>
												<Tooltip.Trigger class="flex h-2 w-full overflow-hidden rounded-full bg-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-ring">
													<div
														class="bg-green-500/80"
														style={`width: ${row.original.matches ? (row.original.wins / row.original.matches) * 100 : 0}%`}
													></div>
													<div
														class="bg-red-500/80"
														style={`width: ${row.original.matches ? (row.original.losses / row.original.matches) * 100 : 0}%`}
													></div>
												</Tooltip.Trigger>
												<Tooltip.Content class="text-xs">
													{row.original.wins} wins, {row.original.losses} losses
												</Tooltip.Content>
											</Tooltip.Root>
										</div>
									{:else if cell.column.id === 'winRate' || cell.column.id === 'pickRate'}
										{formatNumber(Number(cell.getValue()), 1)}%
									{:else if cell.column.id === 'kda'}
										{formatNumber(Number(cell.getValue()), 2)}
									{:else if cell.column.id === 'avgDuration'}
										{toTime(Math.round(Number(cell.getValue()) || 0))}
									{:else if cell.column.id === 'label'}
										{row.original.label}
									{:else if cell.column.id === 'tag'}
										{@const tagClasses: Record<string, string> = {
											Signature: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
											Comfort: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
											Pocket: 'border-purple-500/30 bg-purple-500/10 text-purple-200',
											Damage: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
											Danger: 'border-red-500/30 bg-red-500/10 text-red-200',
											Rotation: 'border-zinc-700 bg-zinc-950/40 text-zinc-300'
										}}
										<span class="rounded-sm border px-1.5 py-0.5 text-[11px] font-medium {tagClasses[String(cell.getValue())] ?? 'border-zinc-700 bg-zinc-950/40 text-zinc-300'}">
											{cell.getValue()}
										</span>
									{:else if ['impact', 'gpm', 'xpm', 'heroDamage'].includes(cell.column.id)}
										{formatNumber(Number(cell.getValue()))}
									{:else}
										{formatCellValue(cell.getValue())}
									{/if}
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>

<style>
	.dashboard-table :global(.overflow-auto) {
		overflow: visible;
	}
</style>
