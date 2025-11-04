<script lang="ts">
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState
	} from '@tanstack/table-core';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
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

<div class="w-full max-w-[100vw] rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup}
				<Table.Row>
					{#each headerGroup.headers as header}
						<Table.Head class="text-zinc-400">
							{#if !header.isPlaceholder}
								<Button
									variant="ghost"
									class="flex gap-0.5 hover:bg-transparent"
									onclick={header.column.getToggleSortingHandler()}
								>
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
									<ArrowUpDown class="h-4 w-4" />
								</Button>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row}
				<Table.Row class="hover:bg-zinc-700/20">
					{#each row.getVisibleCells() as cell}
						<Table.Cell>
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
