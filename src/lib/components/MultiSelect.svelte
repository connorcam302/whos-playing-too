<script>
	import { ChevronDown, Check, Search } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	let { options = $bindable([]), placeholder = 'Select options...' } = $props();
	let isOpen = $state(false);
	let dropdownRef = $state();
	let searchInput = $state();
	let searchTerm = $state('');

	// Use $state.raw for the options to allow direct mutation
	let localOptions = $derived(options);

	// Update local options when props change
	$effect(() => {
		localOptions = options;
	});

	// Filter options based on search term
	let filteredOptions = $derived(
		localOptions.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	// Get selected items for display
	let selectedItems = $derived(localOptions.filter((option) => option.selected));
	let displayText = $derived(
		selectedItems.length === 0
			? placeholder
			: selectedItems.length === 1
				? selectedItems[0].label
				: `${selectedItems.length} items selected`
	);

	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen) {
			// Focus search input when opening
			setTimeout(() => {
				if (searchInput) {
					searchInput.focus();
				}
			}, 0);
		} else {
			// Clear search when closing
			searchTerm = '';
		}
	}

	function toggleOption(optionValue) {
		const option = localOptions.find((opt) => opt.value === optionValue);
		if (option) {
			// If trying to deselect and it's the last selected option, prevent it
			if (option.selected && selectedItems.length === 1) {
				return; // Don't allow deselecting the last item
			}
			option.selected = !option.selected;
			// Update the bindable prop
			options = [...localOptions];
		}
	}

	function handleClickOutside(event) {
		if (dropdownRef && !dropdownRef.contains(event.target)) {
			isOpen = false;
			searchTerm = '';
		}
	}

	function handleSearchKeydown(event) {
		// Prevent dropdown from closing when typing in search
		event.stopPropagation();
	}

	// Add click outside listener
	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<div bind:this={dropdownRef} class="relative w-full max-w-xs">
	<!-- Trigger Button -->
	<button
		onclick={toggleDropdown}
		class="flex h-10 w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-zinc-400 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid]:border-destructive [&>span]:line-clamp-1 data-[placeholder]:[&>span]:text-muted-foreground"
	>
		<span class="truncate">{displayText}</span>
		<ChevronDown class="ml-2 h-4 w-4 transition-transform" />
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			transition:fly={{ y: 100, duration: 200 }}
			class="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-zinc-600 bg-[#09090b] shadow-xl"
		>
			<!-- Search Box -->
			<div class="px-2 pt-2">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
					<input
						bind:this={searchInput}
						bind:value={searchTerm}
						onkeydown={handleSearchKeydown}
						placeholder="Search options..."
						class="w-full rounded-md border border-zinc-600 bg-background py-2 pl-10 pr-3 text-sm text-zinc-300 placeholder-zinc-500 focus:border-zinc-400 focus:outline-none"
					/>
				</div>
			</div>

			<!-- Options -->
			<div class="max-h-60 overflow-y-auto py-1">
				{#each filteredOptions as option}
					<button
						onclick={() => toggleOption(option.value)}
						class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 {option.selected &&
						selectedItems.length === 1
							? 'cursor-not-allowed opacity-60'
							: ''}"
					>
						<!-- Custom Checkbox -->
						<div
							class="flex h-4 w-4 items-center justify-center rounded border border-zinc-600 bg-transparent transition-colors {option.selected
								? 'border-blue-500 bg-blue-500'
								: ''}"
						>
							{#if option.selected}
								<Check class="h-3 w-3 text-white" />
							{/if}
						</div>
						{#if option.image}
							<img src={option.image} class="h-6" alt={option.label} />
						{/if}
						<span class="font-medium">{option.label}</span>
					</button>
				{:else}
					<div class="px-3 py-2 text-sm text-zinc-500">No options found</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
