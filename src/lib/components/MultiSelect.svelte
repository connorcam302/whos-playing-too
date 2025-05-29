<script>
	import { ChevronDown, Check } from 'lucide-svelte';

	let { options = $bindable([]), placeholder = 'Select options...' } = $props();

	let isOpen = $state(false);
	let dropdownRef = $state();

	// Use $state.raw for the options to allow direct mutation
	let localOptions = $state.raw(options);

	// Update local options when props change
	$effect(() => {
		localOptions = options;
	});

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
		}
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
		class="flex w-full items-center justify-between rounded-lg border border-zinc-600 bg-[#09090b] px-3 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:border-zinc-500 focus:border-zinc-400 focus:outline-none"
	>
		<span class="truncate">{displayText}</span>
		<ChevronDown
			class="ml-2 h-4 w-4 text-zinc-400 transition-transform {isOpen ? 'rotate-180' : ''}"
		/>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			class="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-zinc-600 bg-[#09090b] shadow-xl"
		>
			<!-- Header -->
			<div class="border-b border-zinc-700 px-3 py-2">
				<span class="text-xs font-semibold uppercase tracking-wide text-zinc-400"> Fruits </span>
			</div>

			<!-- Options -->
			<div class="max-h-60 overflow-y-auto py-1">
				{#each localOptions as option}
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
						<span class="font-medium">{option.label}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
