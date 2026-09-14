<script lang="ts">
	import {
		QUERY_FIELDS,
		emptyMatchQuery,
		operatorsFor,
		type QueryGroup,
		type QueryJoin
	} from '$lib/match-query';
	import { heroData } from '$lib/data/heroData';
	import { Plus, X, ChevronDown } from 'lucide-svelte';
	let {
		query = $bindable<QueryGroup>(emptyMatchQuery()),
		atLimit = false,
		playerList
	}: {
		query: QueryGroup;
		atLimit?: boolean;
		playerList: { id: number; username: string }[];
	} = $props();
	const playerOptions = $derived(
		[...playerList].sort((a, b) => a.username.localeCompare(b.username))
	);
	const heroOptions = heroData
		.map((hero) => ({ id: hero.id, username: hero.localized_name }))
		.sort((a, b) => a.username.localeCompare(b.username));
	let fieldSearch = $state('');
	let adding = $state(false);
	const fieldGroups = [...new Set(QUERY_FIELDS.map((field) => field.group))];
	const control =
		'h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
	const action =
		'inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
	const add = (key: string) => {
		const field = QUERY_FIELDS.find((field) => field.key === key)!;
		query.conditions = [
			...query.conditions,
			{
				field: key,
				operator: field.type === 'number' ? 'gte' : 'eq',
				value: field.options?.[0]?.value ?? ''
			}
		];
		adding = false;
		fieldSearch = '';
	};
</script>

<div class="space-y-2">
	{#each query.conditions as condition, index}
		{#if index > 0}
			<select
				class="h-8 rounded border border-input bg-background px-2 text-xs font-semibold text-sky-300"
				aria-label={`Join condition ${index + 1}`}
				value={condition.join ?? (query.mode === 'any' ? 'or' : 'and')}
				onchange={(event) => (condition.join = event.currentTarget.value as QueryJoin)}
			>
				<option value="and">AND</option><option value="or">OR</option>
			</select>
		{/if}
		{@const field = QUERY_FIELDS.find((field) => field.key === condition.field)!}
		<div
			class="grid grid-cols-[1fr_2.25rem] items-center gap-2 rounded-md bg-background/40 p-2 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_2.25rem]"
		>
			<div class="col-span-1 px-1 text-sm font-medium">{field.label}</div>
			<button
				type="button"
				aria-label={`Remove condition ${index + 1}: ${field.label}`}
				class="row-start-1 col-start-2 inline-flex h-9 items-center justify-center rounded-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:col-start-4"
				onclick={() => {
					query.conditions = query.conditions.filter((_, i) => i !== index);
				}}><X class="h-4 w-4" /></button
			>
			<select
				class={control + ' col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1'}
				aria-label={`${field.label} comparison`}
				bind:value={condition.operator}
			>
				{#each operatorsFor(field) as op}<option value={op.value}>{op.label}</option>{/each}
			</select>
			<div class="col-span-2 sm:col-span-1 sm:col-start-3 sm:row-start-1">
				{#if !['missing', 'present'].includes(condition.operator)}
					{#if field.type === 'player' || field.type === 'hero'}
						<select
							class={control}
							aria-label={`${field.label} value`}
							bind:value={condition.value}
							required
						>
							<option value="" disabled>Choose a {field.label.toLowerCase()}</option>
							{#each field.type === 'hero' ? heroOptions : playerOptions as player}<option
									value={player.id.toString()}>{player.username}</option
								>{/each}
						</select>
					{:else if field.type === 'choice'}
						<select class={control} aria-label={`${field.label} value`} bind:value={condition.value}
							>{#each field.options ?? [] as option}<option value={option.value}
									>{option.label}</option
								>{/each}</select
						>
					{:else if field.type === 'item'}
						<input
							class={control}
							aria-label="Item name or ID"
							list="query-items"
							placeholder="Search item name or ID"
							bind:value={condition.value}
							required
						/>
					{:else if field.type === 'date'}
						<input
							class={control}
							aria-label={`${field.label} value`}
							type="date"
							bind:value={condition.value}
							required
						/>
					{:else}
						<input
							class={control}
							aria-label={`${field.label} value`}
							inputmode="decimal"
							placeholder="Enter a number"
							bind:value={condition.value}
							required
						/>
					{/if}
				{:else}<span class="px-2 text-xs text-muted-foreground">No value needed</span>{/if}
			</div>
		</div>
	{/each}
</div>
{#if adding}
	<div class="mt-3 rounded-md border border-border bg-background p-3">
		<input
			class={control}
			aria-label="Search query fields"
			placeholder="Find a field: damage, item, date…"
			bind:value={fieldSearch}
		/>
		<div class="mt-3 grid max-h-64 gap-3 overflow-y-auto sm:grid-cols-3">
			{#each fieldGroups as group}
				<div>
					<div class="mb-1 text-xs font-medium text-muted-foreground">{group}</div>
					{#each QUERY_FIELDS.filter((field) => field.group === group && field.label
								.toLowerCase()
								.includes(fieldSearch.toLowerCase())) as field}
						<button
							type="button"
							class="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
							onclick={() => add(field.key)}>{field.label}</button
						>
					{/each}
				</div>
			{/each}
		</div>
		{#if !QUERY_FIELDS.some((field) => field.label
				.toLowerCase()
				.includes(fieldSearch.toLowerCase()))}<p class="mt-2 text-sm text-muted-foreground">
				No fields found. Try “damage” or “gold”.
			</p>{/if}
	</div>
{/if}

<div class="mt-3 flex gap-2">
	<button
		type="button"
		class={action}
		disabled={atLimit}
		aria-expanded={adding}
		onclick={() => (adding = !adding)}
		><Plus class="h-4 w-4" /> Add condition <ChevronDown class="h-3 w-3" /></button
	>
</div>
