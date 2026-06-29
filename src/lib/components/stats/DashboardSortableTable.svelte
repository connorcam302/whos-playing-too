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
		minWidth?: string;
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
		if (columnId === 'label') return row.label ?? '';
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

	const formatCellValue = (value: unknown) => {
		if (typeof value === 'number') return formatNumber(value);
		return String(value ?? '');
	};
</script>

<div class="w-full max-w-[100vw] overflow-hidden rounded-md border border-zinc-800">
	<div class="overflow-x-auto">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup}
					<Table.Row>
						{#each headerGroup.headers as header}
							{@const column = columns.find((item) => item.id === header.column.id)}
							<Table.Head
								class="{getCellClass(column ?? { id: header.column.id, label: '' })} px-2.5 text-xs text-zinc-400"
								style={column?.minWidth ? `min-width: ${column.minWidth}` : undefined}
							>
								{#if !header.isPlaceholder}
									<Button
										variant="ghost"
										class="h-8 px-1.5 text-xs font-medium text-zinc-400 hover:bg-transparent hover:text-zinc-100 {column?.align ===
										'right'
											? 'ml-auto'
											: ''}"
										onclick={header.column.getToggleSortingHandler()}
									>
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
										<ArrowUpDown class="ml-1 h-3.5 w-3.5" />
									</Button>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#if table.getRowModel().rows.length === 0}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center text-sm text-zinc-500">
							{emptyLabel}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each table.getRowModel().rows as row}
						<Table.Row class="hover:bg-zinc-900/70">
							{#each row.getVisibleCells() as cell}
								{@const column = columns.find((item) => item.id === cell.column.id)}
								<Table.Cell class="{getCellClass(column ?? { id: cell.column.id, label: '' })} px-2.5">
									{#if cell.column.id === 'player'}
										<span class="font-medium text-zinc-100">{row.original.username}</span>
									{:else if cell.column.id === 'hero'}
										<div class="flex min-w-44 items-center gap-2 font-medium text-zinc-100">
											<img src={row.original.img} alt="" class="h-7 w-10 rounded-sm object-cover" />
											<span class="truncate">{row.original.name}</span>
										</div>
									{:else if cell.column.id === 'role'}
										<div class="flex items-center gap-2 font-medium text-zinc-100">
											<img src={getRoleIcon(row.original.role)} alt="" class="h-7 w-7" />
											<span>{getRoleName(row.original.role)}</span>
										</div>
									{:else if cell.column.id === 'wl'}
										<div class="min-w-36">
											<Tooltip.Root>
												<Tooltip.Trigger class="flex h-2 w-full overflow-hidden rounded-full bg-zinc-900">
													<div
														class="bg-green-500"
														style={`width: ${row.original.matches ? (row.original.wins / row.original.matches) * 100 : 0}%`}
													></div>
													<div
														class="bg-red-500"
														style={`width: ${row.original.matches ? (row.original.losses / row.original.matches) * 100 : 0}%`}
													></div>
												</Tooltip.Trigger>
												<Tooltip.Content class="text-xs">
													{row.original.wins} wins, {row.original.losses} losses
												</Tooltip.Content>
											</Tooltip.Root>
										</div>
									{:else if cell.column.id === 'winRate'}
										{formatNumber(Number(cell.getValue()), 1)}%
									{:else if cell.column.id === 'kda'}
										{formatNumber(Number(cell.getValue()), 2)}
									{:else if cell.column.id === 'avgDuration'}
										{toTime(Math.round(Number(cell.getValue()) || 0))}
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
