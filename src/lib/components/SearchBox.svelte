<script>
	import LucideCornerDownLeft from '~icons/lucide/corner-down-left';

	let { groups = [], placeholder = 'Type a command or search...' } = $props();

	let searchValue = $state('');
	let isOpen = $state(false);
	let searchInput = $state();
	let selectedIndex = $state(-1);

	// Flatten all options for keyboard navigation
	let allOptions = $derived(
		groups.reduce((acc, group) => {
			return [...acc, ...group.options.map((option) => ({ ...option, groupHeader: group.header }))];
		}, [])
	);

	// Filter options based on search
	let filteredGroups = $derived(
		groups
			.map((group) => ({
				...group,
				options: group.options.filter((option) =>
					option.label.toLowerCase().includes(searchValue.toLowerCase())
				)
			}))
			.filter((group) => group.options.length > 0)
	);

	function handleInput() {
		isOpen = searchValue.length > 0 || true; // Always show suggestions
		selectedIndex = -1;
	}

	function handleKeydown(event) {
		if (!isOpen) return;

		const flatFiltered = filteredGroups.reduce((acc, group) => [...acc, ...group.options], []);

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, flatFiltered.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0 && flatFiltered[selectedIndex]) {
					selectOption(flatFiltered[selectedIndex]);
				} else if (flatFiltered.length > 0) {
					// If no option is selected, select the first one
					selectOption(flatFiltered[0]);
				}
				break;
			case 'Escape':
				isOpen = false;
				selectedIndex = -1;
				searchInput.blur();
				break;
		}
	}

	function selectOption(option) {
		searchValue = option.label;
		isOpen = false;
		selectedIndex = -1;

		// Execute the option's function if it exists
		if (option.action && typeof option.action === 'function') {
			option.action();
		}
	}

	function handleFocus() {
		isOpen = true;
	}

	function handleBlur() {
		// Delay closing to allow clicks on options
		setTimeout(() => {
			isOpen = false;
			selectedIndex = -1;
		}, 150);
	}
</script>

<div class="relative w-full max-w-sm font-sans">
	<div class="relative flex items-center">
		<svg class="absolute left-3 z-10 h-4 w-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
				clip-rule="evenodd"
			/>
		</svg>
		<input
			bind:this={searchInput}
			bind:value={searchValue}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={handleFocus}
			onblur={handleBlur}
			{placeholder}
			class="w-full rounded-lg border border-zinc-600 bg-[#09090b] py-2.5 pl-10 pr-3 text-sm text-zinc-100 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500"
			type="text"
		/>
	</div>

	{#if isOpen && filteredGroups.length > 0}
		<div
			class="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border bg-[#09090b] shadow-xl"
		>
			{#each filteredGroups as group}
				<div class="py-2">
					<div class="px-4 py-1 text-xs text-zinc-400">
						{group.header}
					</div>
					{#each group.options as option, optionIndex}
						{@const globalIndex =
							filteredGroups
								.slice(0, filteredGroups.indexOf(group))
								.reduce((acc, g) => acc + g.options.length, 0) + optionIndex}
						{@const isFirstOption =
							filteredGroups.findIndex((g) => g.options.length > 0) ===
								filteredGroups.indexOf(group) && optionIndex === 0}
						<button
							class="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-zinc-100 transition-colors hover:bg-zinc-800 {selectedIndex ===
							globalIndex
								? 'bg-zinc-600'
								: ''}"
							onclick={() => selectOption(option)}
						>
							<div class="flex items-center gap-3">
								{#if option.icon}
									<span class="flex w-5 items-center justify-center text-base">
										{option.icon}
									</span>
								{/if}
								<span class="font-medium">{option.label}</span>
							</div>
							<div class="flex items-center gap-2">
								{#if isFirstOption && selectedIndex < 0}
									<LucideCornerDownLeft class="h-5 w-5 text-zinc-400" />
								{/if}
								{#if option.shortcut}
									<span class="rounded bg-zinc-700 px-2 py-1 font-mono text-xs text-zinc-400">
										{option.shortcut}
									</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
				{#if filteredGroups.indexOf(group) < filteredGroups.length - 1}
					<div class="border-b border-zinc-600"></div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
