<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';

	interface Props {
		hero: DotaAsset;
	}

	let { hero }: Props = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger class="w-full">
		<img src={hero.img} alt="{hero.id}-{hero.name}" class="w-14" />
	</Tooltip.Trigger>
	<Tooltip.Content class="w-fit text-sm">
		{hero.name}
	</Tooltip.Content>
</Tooltip.Root>
