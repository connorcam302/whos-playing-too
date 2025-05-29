<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { twMerge } from 'tailwind-merge';

	let { item, styles } = $props();
</script>

<HoverCard.Root>
	<HoverCard.Trigger
		><img
			class={twMerge(styles, 'object-fit h-full w-full')}
			src={item.img}
			alt={item.name}
		/></HoverCard.Trigger
	>
	<HoverCard.Content class="w-auto">{item.name}</HoverCard.Content>
</HoverCard.Root>
