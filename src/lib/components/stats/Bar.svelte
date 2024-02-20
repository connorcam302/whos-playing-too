<script lang="ts">
	export let colour: string = '',
		percentage: number;

	const getColour = (value: number) => {
		if (value > 52) {
			if (value > 56) {
				return '#16a34a';
			}
			return '#84cc16';
		} else if (value < 48) {
			if (value < 44) {
				return '#dc2626';
			}
			return '#f97316';
		} else {
			return '#eab308';
		}
	};

	if (!colour) {
		colour = getColour(percentage);
	}
</script>

<div class="flex w-full">
	<div class=" h-1 text-xs leading-none" style="width: {percentage}%; background-color: {colour}" />
	<div class=" h-1 bg-zinc-700 text-xs leading-none" style="width: {100 - percentage}%;" />
</div>
