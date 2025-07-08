<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { twMerge } from 'tailwind-merge';

	let { item, styles } = $props();

	console.log(item);
</script>

<HoverCard.Root>
	<HoverCard.Trigger
		><img
			class={twMerge(styles, 'h-full w-auto')}
			src={item.img}
			alt={item.name}
		/></HoverCard.Trigger
	>
	<HoverCard.Content class="w-auto">{item.name}</HoverCard.Content>
</HoverCard.Root>
