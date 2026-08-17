<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<Card.Root class="min-w-0 rounded-md border-border bg-card shadow-none" aria-label="Loading weekly timeline" aria-live="polite">
	<Card.Header class="px-4 pt-4 pb-0">
		<div class="h-4 w-28 animate-pulse rounded bg-zinc-800"></div>
		<div class="h-3 w-48 animate-pulse rounded bg-zinc-900"></div>
	</Card.Header>
	<Card.Content class="px-4 pt-3 pb-4">
		<div>
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as row}
				<div class="flex h-11 items-center gap-1.5" data-skeleton-row={row}>
					<div class="h-6 w-9 animate-pulse rounded-sm bg-zinc-800"></div>
					<div class="flex-1 space-y-1">
						<div class="h-3 w-2/3 animate-pulse rounded bg-zinc-800"></div>
						<div class="h-2 w-1/3 animate-pulse rounded bg-zinc-900"></div>
					</div>
					<div class="h-4 w-12 animate-pulse rounded bg-zinc-800"></div>
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
