<script lang="ts">
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState
	} from '@tanstack/table-core';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
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

<div class="w-full overflow-hidden rounded-md border border-zinc-800/80 bg-zinc-950/35">
	<div class="h-72 overflow-y-auto">
		<table class="w-full caption-bottom text-sm">
			<thead>
				{#each table.getHeaderGroups() as headerGroup}
					<tr class="border-b border-zinc-800 bg-zinc-950/70">
						{#each headerGroup.headers as header}
							<th class="h-8 px-1.5 text-left align-middle text-[11px] font-medium uppercase tracking-wide text-zinc-400">
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
							</th>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody>
				{#each table.getRowModel().rows as row}
					<tr class="border-b border-zinc-900 transition-colors hover:bg-zinc-900/70">
						{#each row.getVisibleCells() as cell}
							<td class="px-1.5 py-1.5 align-middle text-sm text-zinc-300">
								{#if cell.column.id === 'username'}
									<PlayerCell player={cell.getValue()} />
								{:else if cell.column.id === 'matches'}
									<MatchesCell matches={cell.getValue()} {maxMatches} />
								{:else if cell.column.id === 'winrate'}
									<WinRateCell winrate={cell.getValue()} />
								{:else if cell.column.id === 'avgImpact'}
									<ImpactCell impact={cell.getValue()} />
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
