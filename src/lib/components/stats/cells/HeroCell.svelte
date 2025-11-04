<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card';

	interface Props {
		hero: DotaAsset;
	}

	let { hero }: Props = $props();
</script>

<HoverCard.Root>
	<HoverCard.Trigger class="w-full">
		<img src={hero.img} alt="{hero.id}-{hero.name}" class="w-14" />
	</HoverCard.Trigger>
	<HoverCard.Content class="w-fit text-sm">
		{hero.name}
	</HoverCard.Content>
</HoverCard.Root>
