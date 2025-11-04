<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card';
	import Bar from '../Bar.svelte';
	import { calcImpact } from '../../../functions';

	interface Props {
		impact: number;
	}

	let { impact }: Props = $props();
</script>

<HoverCard.Root>
	<HoverCard.Trigger class="w-full">
		<div class="pb-1 text-sm opacity-85">{calcImpact(impact)}</div>
		<Bar percentage={(impact / 140) * 100} colour="#9333ea" />
	</HoverCard.Trigger>
	<HoverCard.Content class="w-fit text-sm">
		Impact: {impact}
	</HoverCard.Content>
</HoverCard.Root>
