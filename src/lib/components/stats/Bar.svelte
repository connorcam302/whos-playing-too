<script lang="ts">
	export let colour: string, percentage: number;
</script>

<div class="w-full">
	<div class=" text-xs leading-none h-1" style="width: {percentage}%; background-color: {colour}" />
</div>
