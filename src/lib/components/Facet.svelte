<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { twMerge } from 'tailwind-merge';

	let { facet, styles } = $props();

	let facetImage = facet?.icon
		? `https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/icons/facets/${
				facet.icon
			}.png`
		: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Black_question_mark.png';
</script>

<HoverCard.Root>
	<HoverCard.Trigger class={styles}>
		<img
			class={`h-4 px-1 py-0.5 md:h-4 md:px-2 md:py-0.5`}
			src={facet?.icon
				? facetImage
				: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Black_question_mark.png'}
			alt={facet?.name ?? 'Facet Missing Name'}
		/>
	</HoverCard.Trigger>
	<HoverCard.Content>
		<div>
			<div class="flex items-center gap-2">
				<img
					src={facetImage}
					class="h-4 px-1 py-0.5 md:h-5 md:px-2 md:py-0.5"
					alt={facet?.name ?? 'Facet Missing Name'}
				/>
				<div class="font-display text-lg">{facet?.title ?? 'Unknown Facet'}</div>
			</div>
			<div class="text-sm leading-4">
				{@html facet?.description ?? 'Facet missing description'}
			</div>
		</div>
	</HoverCard.Content>
</HoverCard.Root>

<style>
	.color_Red_0 {
		background: linear-gradient(to right, #9f3c3c, #4a2040);
	}

	.color_Red_1 {
		background: linear-gradient(to right, #954533, #452732);
	}

	.color_Red_2 {
		background: linear-gradient(to right, #a3735e, #4f2a25);
	}

	.color_Yellow_0 {
		background: linear-gradient(to right, #c8a45c, #6f3d21);
	}

	.color_Yellow_1 {
		background: linear-gradient(to right, #c6a158, #604928);
	}

	.color_Yellow_2 {
		background: linear-gradient(to right, #cac194, #433828);
	}

	.color_Yellow_3 {
		background: linear-gradient(to right, #c3a99a, #4d352b);
	}

	.color_Purple_0 {
		background: linear-gradient(to right, #b57789, #412755);
	}

	.color_Purple_1 {
		background: linear-gradient(to right, #9c70a4, #282752);
	}

	.color_Purple_2 {
		background: linear-gradient(to right, #675cae, #261c44);
	}

	.color_Blue_0 {
		background: linear-gradient(to right, #727cb2, #342d5b);
	}

	.color_Blue_1 {
		background: linear-gradient(to right, #547ea6, #2a385e);
	}

	.color_Blue_2 {
		background: linear-gradient(to right, #6baebc, #135459);
	}

	.color_Blue_3 {
		background: linear-gradient(to right, #94b5ba, #385b59);
	}

	.color_Green_0 {
		background: linear-gradient(to right, #a2b23e, #2d5a18);
	}

	.color_Green_1 {
		background: linear-gradient(to right, #7ec2b2, #29493a);
	}

	.color_Green_2 {
		background: linear-gradient(to right, #a2b23e, #2d5a18);
	}

	.color_Green_3 {
		background: linear-gradient(to right, #9a9f6a, #223824);
	}

	.color_Green_4 {
		background: linear-gradient(to right, #9fad8e, #3f4129);
	}

	.color_Gray_0 {
		background: linear-gradient(to right, #565c61, #1b1b21);
	}

	.color_Gray_1 {
		background: linear-gradient(to right, #6a6d73, #29272c);
	}

	.color_Gray_2 {
		background: linear-gradient(to right, #95a9b1, #3e464f);
	}

	.color_Gray_3 {
		background: linear-gradient(to right, #adb6be, #4e5557);
	}
</style>
