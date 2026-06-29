<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import Bar from '../Bar.svelte';
	import { calcImpact } from '../../../functions';

	interface Props {
		impact: number;
	}

	let { impact }: Props = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger class="w-full">
		<div class="pb-1 text-sm opacity-85">{calcImpact(impact)}</div>
		<Bar percentage={(impact / 140) * 100} colour="#9333ea" />
	</Tooltip.Trigger>
	<Tooltip.Content class="w-fit text-sm">
		Impact: {impact}
	</Tooltip.Content>
</Tooltip.Root>
