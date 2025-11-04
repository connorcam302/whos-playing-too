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
	import PlayerCell from './cells/PlayerCell.svelte';
	import MatchesCell from './cells/MatchesCell.svelte';
	import WinRateCell from './cells/WinRateCell.svelte';
	import ImpactCell from './cells/ImpactCell.svelte';

	interface Props {
		playerStats: {
			id: number;
			username: string;
			matches: number;
			radiantWins: number;
			direWins: number;
			avgImpact: number;
		}[];
	}

	let { playerStats }: Props = $props();

	const maxMatches = playerStats[0]?.matches || 1;

	const columns: ColumnDef<(typeof playerStats)[0]>[] = [
		{
			id: 'username',
			accessorFn: (row) => row,
			header: 'Player',
			sortingFn: (rowA, rowB) => {
				const nameA = rowA.original.username.toLowerCase();
				const nameB = rowB.original.username.toLowerCase();
				return nameA.localeCompare(nameB);
			}
		},
		{
			accessorKey: 'matches',
			header: 'Matches'
		},
		{
			id: 'winrate',
			accessorFn: (row) => (row.radiantWins + row.direWins) / row.matches,
			header: 'Winrate'
		},
		{
			accessorKey: 'avgImpact',
			header: 'Impact'
		}
	];

	let sorting = $state<SortingState>([{ id: 'matches', desc: true }]);

	const table = $derived(
		createSvelteTable({
			data: playerStats,
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
	<div class="h-96 overflow-auto">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup}
					<Table.Row>
						{#each headerGroup.headers as header}
							<Table.Head class="text-zinc-400">
								{#if !header.isPlaceholder}
									<Button
										variant="ghost"
										class="hover:bg-transparent"
										onclick={header.column.getToggleSortingHandler()}
									>
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
										<ArrowUpDown class="ml-2 h-4 w-4" />
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
								{#if cell.column.id === 'username'}
									<PlayerCell player={cell.getValue()} />
								{:else if cell.column.id === 'matches'}
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
</div>
