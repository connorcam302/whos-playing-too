<script lang="ts">
	import { calcImpact } from '$lib/functions';
	import type { getBetaImpact } from '$lib/impact-beta';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Tooltip as TooltipPrimitive } from 'bits-ui';

	let {
		details,
		originalImpact
	}: {
		details: ReturnType<typeof getBetaImpact>;
		originalImpact: number;
	} = $props();
	const difference = $derived(details ? details.impact - originalImpact : null);
	let open = $state(false);
	const activate = (event: MouseEvent | KeyboardEvent) => {
		event.preventDefault();
		event.stopPropagation();
		open = !open;
	};
</script>

<Tooltip.Root bind:open delayDuration={100}>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				class="inline-flex min-h-6 items-center justify-center rounded px-1 text-[10px] font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
				aria-label="Beta impact: compare with original"
				onclickcapture={activate}
				onkeydowncapture={(event) => {
					if (event.key === 'Enter' || event.key === ' ') activate(event);
				}}>β</button
			>
		{/snippet}
	</Tooltip.Trigger>
	<TooltipPrimitive.Portal>
		<Tooltip.Content class="w-[min(20rem,calc(100vw-2rem))] p-3">
			<p class="font-semibold">Impact comparison</p>
			<dl class="my-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 tabular-nums">
				<dt>Original</dt>
				<dd class="text-right">{calcImpact(originalImpact)} · {originalImpact}</dd>
				<dt>Beta</dt>
				<dd class="text-right">
					{details ? `${calcImpact(details.impact)} · ${details.impact}` : 'Unavailable'}
				</dd>
				{#if difference !== null}
					<dt>Difference</dt>
					<dd class="text-right">{difference > 0 ? '+' : ''}{difference} points</dd>
				{/if}
			</dl>
			{#if details}
				<p class="text-xs leading-5 text-muted-foreground">
					Same grade thresholds, no score ceiling. Survival adjusts earned points by at most 15%.
					Farming, objectives and available contribution stats count alongside combat. Role scales
					are calibrated on earlier matches.
				</p>
			{:else}
				<p class="text-xs leading-5 text-muted-foreground">
					Beta requires a positive match duration, a known role, K/D/A, and last hits for core
					roles.
				</p>
			{/if}
			<p class="mt-2 text-xs leading-5 text-muted-foreground">
				Experimental. Averages and rankings still use the original scores.
			</p>
		</Tooltip.Content>
	</TooltipPrimitive.Portal>
</Tooltip.Root>
