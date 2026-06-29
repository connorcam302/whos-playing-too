<script lang="ts">
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState
	} from '@tanstack/table-core';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table';
	import { ArrowUpDown } from 'lucide-svelte';
	import RoleCell from './cells/RoleCell.svelte';
	import MatchesCell from './cells/MatchesCell.svelte';
	import WinRateCell from './cells/WinRateCell.svelte';
	import ImpactCell from './cells/ImpactCell.svelte';

	interface Props {
		roleCounts: {
			role: number;
			count: number;
			wins: number;
			losses: number;
			avgImpact: number;
		}[];
	}

	let { roleCounts }: Props = $props();

	const maxMatches = Math.max(...roleCounts.map((r) => r.count));

	const columns: ColumnDef<(typeof roleCounts)[0]>[] = [
		{
			accessorKey: 'role',
			header: 'Role',
			sortingFn: (rowA, rowB) => {
				return rowA.original.role - rowB.original.role;
			}
		},
		{
			accessorKey: 'count',
			header: 'Matches'
		},
		{
			id: 'winrate',
			accessorFn: (row) => row.wins / (row.wins + row.losses),
			header: 'Winrate'
		},
		{
			accessorKey: 'avgImpact',
			header: 'Impact'
		}
	];

	let sorting = $state<SortingState>([{ id: 'role', desc: false }]);

	const table = $derived(
		createSvelteTable({
			data: roleCounts,
			columns,
			state: {
				get sorting() {
					return sorting;
				}
			},
			onSortingChange: (updater) => {
				if (updater instanceof Function) {
					sorting = updater(sorting);
				} else {
					sorting = updater;
				}
			},
			getCoreRowModel: getCoreRowModel(),
			getSortedRowModel: getSortedRowModel()
		})
	);
</script>

<div class="w-full max-w-[100vw] overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-950/35">
	<Table.Root>
		<Table.Header class="bg-zinc-950/70">
			{#each table.getHeaderGroups() as headerGroup}
				<Table.Row class="border-zinc-800 hover:bg-transparent">
					{#each headerGroup.headers as header}
						<Table.Head class="h-8 px-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
							{#if !header.isPlaceholder}
								<button
									class="inline-flex items-center gap-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400 hover:text-zinc-100"
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
			{#each table.getRowModel().rows as row}
				<Table.Row class="border-zinc-900 transition-colors hover:bg-zinc-900/70">
					{#each row.getVisibleCells() as cell}
						<Table.Cell class="px-1.5 py-1.5 text-sm text-zinc-300">
							{#if cell.column.id === 'role'}
								<RoleCell role={cell.getValue()} />
							{:else if cell.column.id === 'count'}
								<MatchesCell matches={cell.getValue()} {maxMatches} />
							{:else if cell.column.id === 'winrate'}
								<WinRateCell winrate={cell.getValue()} />
							{:else if cell.column.id === 'avgImpact'}
								<ImpactCell impact={cell.getValue()} />
							{/if}
						</Table.Cell>
					{/each}
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
