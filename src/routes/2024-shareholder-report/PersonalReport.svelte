<script lang="ts">
	import PlayerReport from './PlayerReport.svelte';
	import { reportData } from '$lib/data/reportData';
	import { fade } from 'svelte/transition';

	function isPlayerValid(obj) {
		const requiredFields = [
			'player_name',
			'role_combination',
			'character_and_game.character',
			'character_and_game.game',
			'most_played_heroes', // Array itself must be non-empty
			'most_played_heroes[0].name', // Check first item's name
			'most_played_heroes[0].matches', // Check first item's matches
			'most_played_heroes[0].winrate', // Check first item's winrate
			'most_played_heroes[1].name', // Check first item's name
			'most_played_heroes[1].matches', // Check first item's matches
			'most_played_heroes[1].winrate', // Check first item's winrate
			'most_played_heroes[2].name', // Check first item's name
			'most_played_heroes[2].matches', // Check first item's matches
			'most_played_heroes[2].winrate', // Check first item's winrate
			'best_heroes', // Array itself must be non-empty
			'best_heroes[0].name', // Check first item's name
			'best_heroes[0].matches', // Check first item's matches
			'best_heroes[0].winrate', // Check first item's winrate
			'best_heroes[0].impact',
			'best_heroes[0].kills',
			'best_heroes[0].deaths',
			'best_heroes[0].assists',
			'best_heroes[0].gpm',
			'best_heroes[0].xpm',
			'best_heroes[1].name', // Check first item's name
			'best_heroes[1].matches', // Check first item's matches
			'best_heroes[1].winrate', // Check first item's winrate
			'best_heroes[1].impact',
			'best_heroes[1].kills',
			'best_heroes[1].deaths',
			'best_heroes[1].assists',
			'best_heroes[1].gpm',
			'best_heroes[1].xpm',
			'best_heroes[2].name', // Check first item's name
			'best_heroes[2].matches', // Check first item's matches
			'best_heroes[2].winrate', // Check first item's winrate
			'best_heroes[2].impact',
			'best_heroes[2].kills',
			'best_heroes[2].deaths',
			'best_heroes[2].assists',
			'best_heroes[2].gpm',
			'best_heroes[2].xpm',
			'matches_played',
			'win_rate_percentage',
			'average_impact'
		];
		// Helper function to check if a value is non-empty
		const isNonEmpty = (value) => {
			if (Array.isArray(value)) return value.length > 0;
			if (value && typeof value === 'object') return Object.keys(value).length > 0;
			return value !== undefined && value !== null && value !== '';
		};

		// Function to get nested field values
		const getNestedValue = (obj, path) => {
			try {
				return path
					.split(/\.|\[(\d+)\]/)
					.filter(Boolean)
					.reduce((acc, key) => {
						return acc && acc[key];
					}, obj);
			} catch {
				return undefined; // If path is invalid, return undefined
			}
		};

		const missingFields = requiredFields.filter((field) => {
			const value = getNestedValue(obj, field);
			return !isNonEmpty(value);
		});

		return missingFields.length === 0;
	}

	const users: { id: number; username: string }[] = [
		{ id: 1, username: 'Bingham' },
		{ id: 2, username: 'Brock' },
		{ id: 3, username: 'Callum' },
		{ id: 4, username: 'Colfox' },
		{ id: 5, username: 'Dan' },
		{ id: 6, username: 'Dom' },
		{ id: 7, username: 'Evan' },
		{ id: 8, username: 'Frenchy' },
		{ id: 9, username: 'Harry' },
		{ id: 10, username: 'Joe' },
		{ id: 11, username: 'Liam' },
		{ id: 12, username: 'Matthew' },
		{ id: 13, username: 'Phil' },
		{ id: 14, username: 'Pona' },
		{ id: 15, username: 'Potto' },
		{ id: 16, username: 'Sam' },
		{ id: 18, username: 'Sighboys' },
		{ id: 19, username: 'Steve' },
		{ id: 20, username: 'Tom' },
		{ id: 21, username: 'Doherty' },
		{ id: 17, username: 'Lillie' }
	];

	$: selectedReport = reportData[0];

	function handleSelection(event) {
		selectedReport = reportData.find((obj) => obj.player_name === event.target.value);
	}
</script>

<div class="flex max-w-screen-md flex-col gap-4">
	<div class="text-3xl">Thank you!</div>
	<div>
		That concludes our overall report, however if you want to delve deeper individual players, you
		can check out individual reports below. Thank you for a great 2024, and I look forward to seeing
		who's playing in 2025!
	</div>
</div>

<div class="flex flex-col gap-4">
	<select
		id="user-dropdown"
		on:change={handleSelection}
		class="ml-auto w-48 rounded-xl border-x-8 border-transparent bg-zinc-800 py-[7px]"
	>
		<option value="" disabled selected>Select a Player</option>
		{#each users as user}
			<option value={user.username}>{user.username}</option>
		{/each}
	</select>

	{#key selectedReport}
		<div in:fade={{ delay: 120, duration: 250 }}>
			{#if isPlayerValid(selectedReport)}
				{#key selectedReport}
					<div>
						<PlayerReport player={selectedReport} />
					</div>
				{/key}
			{:else}
				<div class="flex h-32 max-w-screen-md items-center justify-center text-3xl">
					Sorry! A report could not be generated for this player.
				</div>
			{/if}
		</div>
	{/key}
</div>
