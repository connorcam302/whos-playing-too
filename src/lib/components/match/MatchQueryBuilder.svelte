<script lang="ts">
	import MatchQueryGroup from './MatchQueryGroup.svelte';
	import {
		emptyMatchQuery,
		parseMatchQuery,
		queryConditionCount,
		type MatchQuery,
		type QueryJoin
	} from '$lib/match-query';
	import { itemMap } from '$lib/data/itemMap';
	import { Search, Plus, X, Link } from 'lucide-svelte';
	let {
		query = $bindable<MatchQuery>(emptyMatchQuery()),
		onrun,
		loading = false,
		playerList
	}: {
		query: MatchQuery;
		onrun: () => void;
		loading?: boolean;
		playerList: { id: number; username: string }[];
	} = $props();
	let error = $state('');
	let copied = $state(false);
	const count = $derived(queryConditionCount(query));
	const action =
		'inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
	const items = [...itemMap.values()]
		.filter((item) => item.id > 0 && item.name)
		.sort((a, b) => a.name.localeCompare(b.name));
	const run = () => {
		try {
			parseMatchQuery(JSON.stringify(query));
			error = '';
			copied = false;
			onrun();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Check your query.';
		}
	};
	const addGroup = () => {
		query.groups = [
			...(query.groups ?? []),
			{ mode: 'all', join: 'and', conditions: [{ field: 'player', operator: 'eq', value: '' }] }
		];
	};
	const removeFirst = () => {
		const [first, ...rest] = query.groups ?? [];
		query = first
			? { mode: first.mode, conditions: first.conditions, groups: rest }
			: emptyMatchQuery();
	};
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			copied = true;
		} catch {
			error = 'Could not copy the link. Copy it from your address bar instead.';
		}
	};
</script>

<section
	class="rounded-lg border border-border bg-card p-3 sm:p-4"
	aria-label="Advanced match query"
>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<Search class="h-4 w-4 text-muted-foreground" />
			<h2 class="text-base font-semibold">Match explorer</h2>
			{#if count}<span class="rounded bg-sky-950 px-2 py-0.5 text-xs text-sky-200"
					>{count} {count === 1 ? 'condition' : 'conditions'}</span
				>{/if}
		</div>
		<button type="button" class={action} disabled={loading} onclick={copy}
			><Link class="h-3.5 w-3.5" />{copied ? 'Copied applied query' : 'Copy applied query'}</button
		>
	</div>
	<p class="mt-2 max-w-prose text-xs text-muted-foreground">
		Conditions inside a group describe one player. Add groups to find multiple players in the same
		match. AND is evaluated before OR.
	</p>
	<form
		class="mt-4"
		onsubmit={(event) => {
			event.preventDefault();
			run();
		}}
	>
		{#if !count}
			<div class="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
				<span>Start with</span>
				{#each [{ field: 'kills', value: '20', label: '20+ kills' }, { field: 'goldPerMin', value: '800', label: '800+ GPM' }, { field: 'duration', value: '60', label: 'Hour-long games' }] as preset}
					<button
						type="button"
						class={action}
						onclick={() =>
							(query = {
								mode: 'all',
								conditions: [{ field: preset.field, operator: 'gte', value: preset.value }]
							})}>{preset.label}</button
					>
				{/each}
			</div>
		{/if}
		<div class="border-y border-border py-3">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-sm font-semibold">Player group 1</h3>
				{#if query.groups?.length}<button
						type="button"
						class={action}
						aria-label="Remove player group 1"
						onclick={removeFirst}><X class="h-4 w-4" /></button
					>{/if}
			</div>
			<MatchQueryGroup bind:query {playerList} atLimit={count >= 20} />
		</div>
		{#each query.groups ?? [] as group, index}
			<div class="flex items-center gap-3 py-3">
				<select
					aria-label={`Join player group ${index + 2}`}
					class="h-9 rounded-md border border-input bg-background px-3 text-sm font-semibold text-sky-300"
					value={group.join ?? 'and'}
					onchange={(event) => (group.join = event.currentTarget.value as QueryJoin)}
					><option value="and">AND</option><option value="or">OR</option></select
				>
				<span class="text-xs text-muted-foreground">another matching player in this match</span>
			</div>
			<div class="border-b border-border pb-3">
				<div class="mb-2 flex items-center justify-between">
					<h3 class="text-sm font-semibold">Player group {index + 2}</h3>
					<button
						type="button"
						class={action}
						aria-label={`Remove player group ${index + 2}`}
						onclick={() => (query.groups = query.groups?.filter((_, i) => i !== index))}
						><X class="h-4 w-4" /></button
					>
				</div>
				<MatchQueryGroup bind:query={query.groups![index]} {playerList} atLimit={count >= 20} />
			</div>
		{/each}
		<p class="mt-3 max-w-prose text-xs text-muted-foreground">
			Example: (Player is Colfox AND Hero is Axe) AND (Player is Harry), OR (Player is Tom AND Hero
			is Pudge). Groups can match the same player. Only tracked accounts are searched; the smurf
			toggle applies to every group.
		</p>
		{#if query.groups?.length}<p class="mt-2 max-w-prose text-xs text-muted-foreground">
				The filters above and summary stats apply to tracked performances in the matching games.
				Each group independently searches those games.
			</p>{/if}
		<div class="mt-3 flex flex-wrap items-center justify-between gap-2">
			<div class="flex flex-wrap gap-1">
				<button
					type="button"
					class={action}
					disabled={!query.conditions.length || count >= 20 || (query.groups?.length ?? 0) >= 7}
					onclick={addGroup}><Plus class="h-4 w-4" /> Add player group</button
				>
				{#if count}<button
						type="button"
						class={action}
						onclick={() => {
							query = emptyMatchQuery();
							error = '';
						}}>Clear conditions</button
					>{/if}
			</div>
			<button
				type="submit"
				class={action + ' bg-sky-700 text-sky-50 hover:bg-sky-600'}
				disabled={loading}><Search class="h-4 w-4" />{loading ? 'Searching…' : 'Run query'}</button
			>
		</div>
		{#if error}<p role="alert" class="mt-2 text-sm text-destructive">{error}</p>{/if}
	</form>
	<datalist id="query-items"
		>{#each items as item}<option value={item.id.toString()}>{item.name}</option>{/each}</datalist
	>
</section>
