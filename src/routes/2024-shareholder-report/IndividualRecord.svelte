<script lang="ts">
	export let record;
</script>

<div class="flex w-64 flex-col gap-2">
	<div class="flex flex-col items-center gap-2 rounded-xl bg-zinc-800 p-4">
		<img src={record.avatarfull} class="h-56 w-56" />
		<div class="text-3xl">{record.username}</div>
		<div class="text-xl">{record.statName}: {record.statValue}</div>
	</div>
</div>
