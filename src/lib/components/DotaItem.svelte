<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { twMerge } from 'tailwind-merge';

	let { item, styles } = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger class="h-full"
		><img
			class={twMerge('h-full w-auto', styles)}
			src={item.img}
			alt={item.name}
		/></Tooltip.Trigger
	>
	<Tooltip.Content class="w-auto">{item.name}</Tooltip.Content>
</Tooltip.Root>
