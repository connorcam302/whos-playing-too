<script lang="ts">
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState
	} from '@tanstack/table-core';
	import {
		FlexRender,
		createSvelteTable,
		renderComponent,
		renderSnippet
	} from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { ArrowUpDown } from 'lucide-svelte';
	import HeroCell from './cells/HeroCell.svelte';
	import MatchesCell from './cells/MatchesCell.svelte';
	import WinRateCell from './cells/WinRateCell.svelte';
	import ImpactCell from './cells/ImpactCell.svelte';

	interface Props {
		heroStats: {
			hero: DotaAsset;
			matches: number;
			radiantWins: number;
			direWins: number;
			avgImpact: number;
		}[];
		height?: string;
	}

	let { heroStats, height = 'h-96' }: Props = $props();

	const maxMatches = heroStats[0]?.matches || 1;

	const columns: ColumnDef<(typeof heroStats)[0]>[] = [
		{
			accessorKey: 'hero',
			header: 'Hero',
			cell: (info) => info.getValue(),
			sortingFn: (rowA, rowB) => {
				const nameA = rowA.original.hero.name.toLowerCase();
				const nameB = rowB.original.hero.name.toLowerCase();
				return nameB.localeCompare(nameA);
			}
		},
		{
			accessorKey: 'matches',
			header: 'Matches',
			cell: (info) => info.getValue()
		},
		{
			id: 'winrate',
			accessorFn: (row) => (row.radiantWins + row.direWins) / row.matches,
			header: 'Winrate',
			cell: (info) => info.getValue()
		},
		{
			accessorKey: 'avgImpact',
			header: 'Impact',
			cell: (info) => info.getValue()
		}
	];

	let sorting = $state<SortingState>([{ id: 'matches', desc: true }]);

	const table = $derived(
		createSvelteTable({
			data: heroStats,
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
	<div class="overflow-auto {height}">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup}
					<Table.Row>
						{#each headerGroup.headers as header}
							<Table.Head class="text-zinc-400">
								{#if !header.isPlaceholder}
									<Button
										variant="ghost"
										class="gap-0.5 hover:bg-transparent"
										onclick={header.column.getToggleSortingHandler()}
									>
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
										<ArrowUpDown class="h-3 w-3" />
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
								{#if cell.column.id === 'hero'}
									<HeroCell hero={cell.getValue()} />
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
