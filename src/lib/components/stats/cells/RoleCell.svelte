<script lang="ts">
	import { getRoleIcon, getRoleName } from '../../../functions';

	interface Props {
		role: number;
	}

	let { role }: Props = $props();
</script>

<img class="h-8 w-8" src={getRoleIcon(role)} alt={getRoleName(role)} />
