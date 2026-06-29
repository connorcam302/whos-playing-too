<script lang="ts">
	import { Search, X } from 'lucide-svelte';

	interface SearchOption {
		label: string;
		icon?: string;
		shortcut?: string;
		action?: () => void;
	}

	interface SearchGroup {
		header: string;
		options: SearchOption[];
	}

	interface Props {
		groups?: SearchGroup[];
		placeholder?: string;
	}

	let { groups = [], placeholder = 'Search players...' }: Props = $props();

	let searchValue = $state('');
	let isOpen = $state(false);
	let searchInput = $state<HTMLInputElement>();
	let selectedIndex = $state(-1);

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
		isOpen = true;
		selectedIndex = -1;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!isOpen) return;

		const flatFiltered = filteredGroups.reduce<SearchOption[]>(
			(acc, group) => [...acc, ...group.options],
			[]
		);

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
					selectOption(flatFiltered[0]);
				}
				break;
			case 'Escape':
				isOpen = false;
				selectedIndex = -1;
				searchInput?.blur();
				break;
		}
	}

	function selectOption(option: SearchOption) {
		searchValue = '';
		isOpen = false;
		selectedIndex = -1;
		option.action?.();
	}

	function clearSearch() {
		searchValue = '';
		selectedIndex = -1;
		searchInput?.focus();
	}

	function handleFocus() {
		isOpen = true;
	}

	function handleBlur() {
		setTimeout(() => {
			isOpen = false;
			selectedIndex = -1;
		}, 150);
	}
</script>

<div class="relative w-full font-sans">
	<div class="relative flex items-center">
		<Search class="absolute left-2.5 z-10 h-3.5 w-3.5 text-zinc-500" />
		<input
			bind:this={searchInput}
			bind:value={searchValue}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={handleFocus}
			onblur={handleBlur}
			{placeholder}
			class="h-8 w-full rounded-md border border-zinc-700/50 bg-zinc-950 pl-8 pr-7 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-600 focus:bg-zinc-900"
			type="text"
		/>
		{#if searchValue}
			<button
				class="absolute right-2 z-10 flex items-center justify-center rounded-sm text-zinc-500 transition-colors hover:text-zinc-300"
				onclick={clearSearch}
				tabindex={-1}
			>
				<X class="h-3.5 w-3.5" />
			</button>
		{/if}
	</div>

	{#if isOpen && filteredGroups.length > 0}
		<div
			class="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/40"
		>
			{#each filteredGroups as group, groupIndex}
				{#if groupIndex > 0}
					<div class="border-t border-zinc-800/60"></div>
				{/if}
				<div class="py-1.5">
					<div class="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
						{group.header}
					</div>
					{#each group.options as option, optionIndex}
						{@const globalIndex =
							filteredGroups
								.slice(0, groupIndex)
								.reduce((acc, g) => acc + g.options.length, 0) + optionIndex}
						<button
							class="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors
								{selectedIndex === globalIndex
								? 'bg-zinc-800 text-zinc-100'
								: 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'}"
							onclick={() => selectOption(option)}
						>
							{#if option.icon}
								<span class="flex w-4 shrink-0 items-center justify-center text-sm text-zinc-500">
									{option.icon}
								</span>
							{/if}
							<span class="truncate">{option.label}</span>
							{#if option.shortcut}
								<span class="ml-auto shrink-0 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
									{option.shortcut}
								</span>
							{/if}
						</button>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>
