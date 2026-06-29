<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';

	interface Props {
		hero: DotaAsset;
	}

	let { hero }: Props = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger class="w-full">
		{#snippet child({ props })}
			<a
				{...props}
				href={`/heroes/${hero.id}`}
				class="inline-flex rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<img src={hero.img} alt="{hero.id}-{hero.name}" class="w-14" />
			</a>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content class="w-fit text-sm">
		{hero.name}
	</Tooltip.Content>
</Tooltip.Root>
