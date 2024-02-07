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

<div class="w-full flex">
	<div class=" text-xs leading-none h-1" style="width: {percentage}%; background-color: {colour}" />
	<div class=" text-xs leading-none h-1 bg-zinc-700" style="width: {100 - percentage}%;" />
</div>
