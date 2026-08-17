<script lang="ts">
	interface Props {
		rankTier: number;
	}

	let { rankTier }: Props = $props();

	const rankNames = [
		'Uncalibrated',
		'Herald',
		'Guardian',
		'Crusader',
		'Archon',
		'Legend',
		'Ancient',
		'Divine',
		'Immortal'
	];

	const medal = $derived(Math.floor(rankTier / 10));
	const star = $derived(rankTier % 10);
	const rankName = $derived(rankNames[medal] ?? 'Unknown rank');
	const rankLabel = $derived(`${rankName}${star > 0 && medal < 8 ? ` ${star}` : ''}`);
	const assetRoot = 'https://www.opendota.com/assets/images/dota2/rank_icons';
</script>

{#if medal >= 1 && medal <= 8}
	<span
		class="relative inline-flex h-7 w-7 shrink-0 items-center justify-center"
		title={rankLabel}
		aria-label={rankLabel}
	>
		<img
			src={`${assetRoot}/rank_icon_${medal}.png`}
			alt=""
			class="h-7 w-7 object-contain"
		/>
		{#if star >= 1 && star <= 7 && medal < 8}
			<img
				src={`${assetRoot}/rank_star_${star}.png`}
				alt=""
				class="pointer-events-none absolute inset-0 h-7 w-7 object-contain"
			/>
		{/if}
	</span>
{/if}
