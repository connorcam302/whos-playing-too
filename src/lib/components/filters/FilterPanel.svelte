<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ListFilter, RotateCcw } from 'lucide-svelte';
	let {
		label = 'Filters',
		active = false,
		disabled = false,
		onreset,
		children
	}: {
		label?: string;
		active?: boolean;
		disabled?: boolean;
		onreset: () => void;
		children: Snippet;
	} = $props();
</script>

<section class="rounded-lg border border-border bg-card p-3" aria-label={label}>
	<div class="mb-3 flex items-center justify-between gap-3 border-b border-zinc-800 pb-2">
		<div class="flex items-center gap-2 text-sm font-medium text-zinc-200">
			<ListFilter class="h-4 w-4 text-zinc-400" /> Filters
			{#if active}<span
					class="rounded bg-sky-950 px-1.5 py-0.5 text-[11px] font-medium text-sky-200">Active</span
				>{/if}
		</div>
		<button
			type="button"
			class="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-950/70 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:text-zinc-600"
			disabled={disabled || !active}
			onclick={onreset}
		>
			<RotateCcw class="h-3.5 w-3.5" /> Reset
		</button>
	</div>
	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{@render children()}</div>
</section>
