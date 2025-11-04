<script lang="ts">
	interface Props {
		player: {
			id: number;
			username: string;
			matches: number;
			radiantWins: number;
			direWins: number;
			avgImpact: number;
		};
	}

	let { player }: Props = $props();
</script>

<a href={`/player/${player.id}`} class="duration-300 hover:text-zinc-400">
	{player.username}
</a>
