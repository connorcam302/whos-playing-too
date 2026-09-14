<script lang="ts">
	import { Settings2, UserRound } from 'lucide-svelte';
	import { currentPlayer } from '$lib/current-player';
	import { showBetaImpact } from '$lib/impact-preference';
	import { Switch } from '$lib/components/ui/switch';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';

	type Player = {
		id: number;
		username: string;
	};

	type Props = {
		playerList: Player[];
	};

	let { playerList }: Props = $props();
	const settingsId = $props.id();
	let settingsOpen = $state(false);
	let selectedPlayer = $derived(playerList.find((player) => player.id === $currentPlayer));
	let selectedValue = $derived($currentPlayer?.toString() ?? 'none');

	const selectPlayer = (value: string) => {
		currentPlayer.set(value === 'none' ? null : Number(value));
	};
</script>

<Dialog.Root bind:open={settingsOpen}>
	<div class="flex min-w-0 items-center gap-1.5">
		{#if selectedPlayer}
			<a
				href={`/player/${selectedPlayer.id}`}
				class="inline-flex h-8 min-w-0 max-w-32 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-300 outline-none transition-colors hover:bg-zinc-800/80 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-ring sm:max-w-40"
				aria-label={`Go to ${selectedPlayer.username}'s profile`}
				title={`${selectedPlayer.username}'s profile`}
			>
				<UserRound class="h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden="true" />
				<span class="truncate">{selectedPlayer.username}</span>
			</a>
		{:else}
			<button
				type="button"
				onclick={() => (settingsOpen = true)}
				class="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-500 outline-none transition-colors hover:bg-zinc-800/80 hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-ring"
			>
				<UserRound class="h-3.5 w-3.5" aria-hidden="true" />
				<span class="hidden sm:inline">Select profile</span>
			</button>
		{/if}

		<Dialog.Trigger>
			{#snippet child({ props })}
				<button
					type="button"
					{...props}
					class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 outline-none transition-colors hover:bg-zinc-800/80 hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="Open settings"
					title="Settings"
				>
					<Settings2 class="h-4 w-4" aria-hidden="true" />
				</button>
			{/snippet}
		</Dialog.Trigger>
	</div>

	<Dialog.Content
		class="max-w-md gap-0 overflow-hidden rounded-md border-border bg-card p-0 shadow-2xl shadow-black/60"
	>
		<Dialog.Header class="border-b border-border px-5 py-4 pr-12 text-left">
			<Dialog.Title class="text-base font-semibold text-zinc-100">Settings</Dialog.Title>
			<Dialog.Description class="mt-1 text-xs text-zinc-400">
				Personalise how Whos Playing works for you.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-5 px-5 py-5">
			<section aria-labelledby={`${settingsId}-profile-setting-heading`}>
				<div class="mb-3">
					<h2
						id={`${settingsId}-profile-setting-heading`}
						class="text-sm font-semibold text-zinc-100"
					>
						Your profile
					</h2>
					<p class="mt-1 text-xs leading-5 text-zinc-400">
						Used to identify your rows in matches and the weekly digest.
					</p>
				</div>

				<label
					for={`${settingsId}-profile-setting`}
					class="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-400"
				>
					Profile
				</label>
				<Select.Root type="single" value={selectedValue} onValueChange={selectPlayer}>
					<Select.Trigger
						id={`${settingsId}-profile-setting`}
						class="w-full bg-zinc-950 text-zinc-200"
					>
						{selectedPlayer?.username ?? 'No profile selected'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="none" label="No profile">No profile</Select.Item>
						{#each playerList as player}
							<Select.Item value={player.id.toString()} label={player.username}>
								{player.username}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</section>
			<section
				class="border-t border-border pt-5"
				aria-labelledby={`${settingsId}-impact-setting-heading`}
			>
				<div class="flex items-center justify-between gap-4">
					<label
						id={`${settingsId}-impact-setting-heading`}
						for={`${settingsId}-beta-impact-setting`}
						class="text-sm font-semibold text-zinc-100">Show beta impact</label
					>
					<Switch
						id={`${settingsId}-beta-impact-setting`}
						checked={$showBetaImpact}
						onCheckedChange={showBetaImpact.set}
						aria-describedby={`${settingsId}-beta-impact-description`}
						class="data-[state=checked]:bg-sky-500"
					/>
				</div>
				<p
					id={`${settingsId}-beta-impact-description`}
					class="mt-2 text-xs leading-5 text-zinc-400"
				>
					Uses the beta grade for individual match ratings. Hover or select the β tag to compare it
					with the original. Averages, charts and rankings use the original algorithm.
				</p>
				<p class="mt-2 text-xs text-zinc-500">Experimental · Saved on this browser</p>
			</section>
		</div>
	</Dialog.Content>
</Dialog.Root>
