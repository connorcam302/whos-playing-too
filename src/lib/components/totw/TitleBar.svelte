<script lang="ts">
	export let name: string, role: number, id: number, team: string;
</script>

<div class="flex flex-col items-center justify-center">
	<div class="text-xl tracking-wide flex gap-2 justify-center">
		<img src={`/roles/pos${role}.png`} alt={`${role} role`} class="h-7" />
		<div>{name}</div>
	</div>
</div>
