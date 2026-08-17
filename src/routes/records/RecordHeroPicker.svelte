<script lang="ts">
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';

	type Props = {
		heroes: DotaAsset[];
		value?: string;
		disabled?: boolean;
	};

	let { heroes, value = $bindable('-1'), disabled = false }: Props = $props();
	let open = $state(false);

	const selectedHero = $derived(heroes.find((hero) => hero.id.toString() === value));

	const selectHero = (heroId: string) => {
		value = heroId;
		open = false;
	};
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-zinc-200 ring-offset-background transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
		aria-label="Choose hero"
		aria-expanded={open}
		{disabled}
	>
		<span class="flex min-w-0 items-center gap-2">
			{#if selectedHero}
				<img src={selectedHero.img} alt="" class="h-6 w-8 shrink-0 rounded-sm object-cover" />
			{/if}
			<span class="truncate">{selectedHero?.name ?? 'All Heroes'}</span>
		</span>
		<ChevronsUpDown class="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
	</Popover.Trigger>
	<Popover.Content align="start" class="w-[min(22rem,calc(100vw-1.5rem))] p-0">
		<Command.Root>
			<Command.Input placeholder="Search heroes…" aria-label="Search heroes" />
			<Command.List class="max-h-72">
				<Command.Empty>No heroes found.</Command.Empty>
				<Command.Group>
					<Command.Item value="All Heroes" onclick={() => selectHero('-1')}>
						<Check class={`h-4 w-4 ${value === '-1' ? 'opacity-100' : 'opacity-0'}`} />
						<span>All Heroes</span>
					</Command.Item>
					{#each heroes as hero}
						<Command.Item value={hero.name} onclick={() => selectHero(hero.id.toString())}>
							<Check class={`h-4 w-4 ${value === hero.id.toString() ? 'opacity-100' : 'opacity-0'}`} />
							<img src={hero.img} alt="" class="h-6 w-8 rounded-sm object-cover" />
							<span>{hero.name}</span>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
