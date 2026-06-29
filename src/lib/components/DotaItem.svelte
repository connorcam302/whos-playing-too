<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { twMerge } from 'tailwind-merge';

	let { item, styles } = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger
		><img
			class={twMerge(styles, 'h-full w-auto')}
			src={item.img}
			alt={item.name}
		/></Tooltip.Trigger
	>
	<Tooltip.Content class="w-auto">{item.name}</Tooltip.Content>
</Tooltip.Root>
