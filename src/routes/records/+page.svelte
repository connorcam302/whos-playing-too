<script lang="ts">
	import { afterNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy, untrack } from 'svelte';
	import FilterPanel from '$lib/components/filters/FilterPanel.svelte';
	import { Toggle } from '$lib/components/ui/toggle';
	import {
		ArrowUpRight,
		ChevronRight,
		ListFilter,
		RotateCcw,
		Trophy,
		VenetianMask
	} from 'lucide-svelte';
	import MatchModal from '$lib/components/match/MatchModal.svelte';
	import * as Select from '$lib/components/ui/select';
	import { DATE_RANGE_PRESETS, DOTA_MAJOR_PATCHES } from '$lib/data/dotaPatchRanges';
	import { calcImpact, getRoleIcon, getRoleName, toTime } from '$lib/functions';
	import {
		buildRecordsSearchParams,
		DEFAULT_RECORDS_FILTERS,
		type RecordsFilters,
		type RecordsResponse,
		type RecordEntry,
		type RecordSet
	} from '$lib/records';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	// These editable values start from the server response and resync on route navigation below.
	// svelte-ignore state_referenced_locally
	let result = $state<RecordsResponse>(data);
	// svelte-ignore state_referenced_locally
	let applied = $state<RecordsFilters>(data.filters);
	// svelte-ignore state_referenced_locally
	let draft = $state<RecordsFilters>({ ...data.filters });
	// svelte-ignore state_referenced_locally
	let hero = $state(String(data.filters.hero));
	// svelte-ignore state_referenced_locally
	let roles = $state(data.filters.roles.map(String));
	// svelte-ignore state_referenced_locally
	let lobby = $state(data.filters.lobbies.length === 2 ? 'all' : String(data.filters.lobbies[0]));
	let loading = $state(false);
	let error = $state('');
	let selectedKey = $state(page.url.searchParams.get('record') ?? 'most-kills');
	let controller: AbortController | undefined;
	let request = 0;

	const categories = [
		{
			id: 'highlights',
			label: 'Combat & impact',
			keys: ['most-kills', 'most-assists', 'highest-kda', 'highest-impact']
		},
		{ id: 'damage', label: 'Damage', keys: ['most-hero-damage', 'highest-dpm'] },
		{
			id: 'economy',
			label: 'Economy & objectives',
			keys: ['highest-gpm', 'highest-xpm', 'most-last-hits', 'most-building-damage']
		},
		{
			id: 'runs',
			label: 'Games & streaks',
			keys: ['longest-games', 'longest-winning-streak', 'longest-losing-streak']
		},
		{
			id: 'notorious',
			label: 'Notorious',
			keys: ['most-deaths', 'lowest-impact', 'least-hero-damage']
		}
	];
	const categoryRecords = (category: (typeof categories)[number]) =>
		result.records
			.filter((record) => record.category === category.id)
			.sort((a, b) => category.keys.indexOf(a.key) - category.keys.indexOf(b.key));
	const descriptions: Record<string, string> = {
		'highest-dpm':
			'Hero damage divided by match length in minutes. Matches without damage data are excluded.',
		'highest-kda': 'Kills plus assists divided by deaths. Deathless games use a divisor of 1.',
		'longest-games':
			'Each qualifying match is listed once with its full tracked-player lineup, including smurf accounts.',
		'longest-winning-streak':
			'Consecutive logged wins on the same account, within the selected period.',
		'longest-losing-streak':
			'Consecutive logged losses on the same account, within the selected period.',
		'most-kills': 'The biggest kill counts in a single match.',
		'most-assists': 'The players who had a hand in everything.',
		'highest-impact': 'The strongest performances by impact score.',
		'most-last-hits': 'The most creeps claimed in a single match.',
		'highest-gpm': 'The fastest gold earners, measured per minute.',
		'highest-xpm': 'The fastest experience gain, measured per minute.',
		'most-building-damage': 'The biggest contributions to tearing down the base.',
		'most-hero-damage': 'The most damage dealt to enemy heroes.',
		'most-deaths': 'Some games are harder to forget than others.',
		'lowest-impact': 'The toughest outings by impact score, lowest first.',
		'least-hero-damage': 'The smallest damage totals against enemy heroes, lowest first.'
	};
	const selected = $derived(
		result.records.find((record) => record.key === selectedKey) ?? result.records[0]
	);
	const filters = $derived<RecordsFilters>({
		...draft,
		hero: Number(hero),
		roles: roles.length ? roles.map(Number) : [1, 2, 3, 4, 5],
		lobbies: lobby === 'all' ? [0, 7] : [Number(lobby)]
	});
	const hasActiveFilters = $derived(
		buildRecordsSearchParams(filters).toString() !==
			buildRecordsSearchParams(DEFAULT_RECORDS_FILTERS).toString()
	);
	const number = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });
	const date = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});
	const dateLabel = (value: string) =>
		DATE_RANGE_PRESETS.find((preset) => preset.value === value)?.label ??
		DOTA_MAJOR_PATCHES.find((patch) => `patch-${patch.version}` === value)?.label ??
		'All Time';
	const scope = $derived(
		[
			dateLabel(applied.dateRange),
			data.heroList.find((item) => item.id === applied.hero)?.name ?? 'All heroes',
			applied.roles.length === 5 ? 'All roles' : applied.roles.map(getRoleName).join(', '),
			applied.lobbies.length === 2
				? 'Ranked & unranked'
				: applied.lobbies[0] === 7
					? 'Ranked'
					: 'Unranked',
			applied.includeSmurfs ? 'Smurfs included' : 'Main accounts'
		].join(' · ')
	);

	const setDraft = (value: RecordsFilters) => {
		draft = { ...value };
		hero = String(value.hero);
		roles = value.roles.map(String);
		lobby = value.lobbies.length === 2 ? 'all' : String(value.lobbies[0]);
	};
	$effect(() => {
		result = data;
		applied = data.filters;
		setDraft(data.filters);
	});

	afterNavigate(() => {
		selectedKey = new URL(window.location.href).searchParams.get('record') ?? 'most-kills';
	});

	const selectRecord = (key: string) => {
		selectedKey = key;
		const url = new URL(window.location.href);
		url.searchParams.set('record', key);
		replaceState(url, page.state);
	};
	const applyFilters = async (next: RecordsFilters = filters) => {
		const current = ++request;
		controller?.abort();
		controller = new AbortController();
		loading = true;
		error = '';
		try {
			const params = buildRecordsSearchParams(next);
			const response = await fetch(`/api/records?${params}`, { signal: controller.signal });
			if (!response.ok) throw new Error('The records could not be updated. Try again in a moment.');
			const updated: RecordsResponse = await response.json();
			if (current !== request) return;
			result = updated;
			applied = next;
			const url = new URL(window.location.href);
			url.search = params.toString();
			url.searchParams.set('record', selectedKey);
			replaceState(url, page.state);
		} catch (cause) {
			if (current === request && !controller?.signal.aborted) {
				error = cause instanceof Error ? cause.message : 'The records could not be updated.';
			}
		} finally {
			if (current === request) loading = false;
		}
	};
	$effect(() => {
		const next = filters;
		controller?.abort();
		request++;
		if (
			buildRecordsSearchParams(next).toString() ===
			untrack(() => buildRecordsSearchParams(applied).toString())
		) {
			loading = false;
			return;
		}
		loading = true;
		const timer = setTimeout(() => void applyFilters(next), 180);
		return () => clearTimeout(timer);
	});
	const reset = () => {
		setDraft(DEFAULT_RECORDS_FILTERS);
	};
	const toggleLobby = (value: string) => {
		lobby = lobby === 'all' ? (value === '7' ? '0' : '7') : lobby === value ? lobby : 'all';
	};
	const rank = (entry: RecordEntry) =>
		(selected?.records.findIndex((item) => item.record === entry.record) ?? 0) + 1;
	const formatRecord = (record: RecordSet, value: number) => {
		if (record.format === 'duration') return toTime(value);
		if (record.format === 'ratio') return value.toFixed(2);
		return number.format(value);
	};
	const secondaryValue = (entry: RecordEntry) => {
		if (!selected) return '';
		if (selected.kind === 'streak') return 'consecutive games';
		if (selected.format === 'duration') return 'minutes:seconds';
		if (selected.format === 'ratio') return 'KDA ratio';
		if (selected.format === 'rate' || ['GPM', 'XPM'].includes(selected.recordTitle))
			return 'per minute';
		if (selected.recordTitle === 'Impact') return `${calcImpact(entry.data.impact)} grade`;
		return entry.data.duration > 0
			? `${number.format(entry.record / (entry.data.duration / 60))}/min`
			: '';
	};
	onDestroy(() => {
		request++;
		controller?.abort();
	});
</script>

<svelte:head>
	<title>Records | whos-playing</title>
	<meta
		name="description"
		content="Explore the group's match records, streaks, record holders, and top ten performances."
	/>
</svelte:head>

<main class="records-page">
	<header class="page-heading"><h1>Records</h1></header>
	<FilterPanel label="Record filters" active={hasActiveFilters} onreset={reset}>
		<div class="flex min-w-0 flex-col gap-1">
			<div
				id="records-hero-label"
				class="text-xs font-medium uppercase tracking-wide text-zinc-400"
			>
				Hero
			</div>
			<Select.Root type="single" bind:value={hero}>
				<Select.Trigger aria-labelledby="records-hero-label" class="w-full"
					>{data.heroList.find((item) => String(item.id) === hero)?.name ??
						'All Heroes'}</Select.Trigger
				>
				<Select.Content
					><Select.Item value="-1" label="All Heroes">All Heroes</Select.Item>
					{#each data.heroList as item}<Select.Item value={String(item.id)} label={item.name}
							><div class="flex items-center gap-2">
								<img src={item.img} alt="" class="h-6 w-8 rounded-sm object-cover" /><span
									>{item.name}</span
								>
							</div></Select.Item
						>{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex min-w-0 flex-col gap-1">
			<div
				id="records-role-label"
				class="text-xs font-medium uppercase tracking-wide text-zinc-400"
			>
				Roles
			</div>
			<Select.Root type="multiple" bind:value={roles}>
				<Select.Trigger aria-labelledby="records-role-label" class="w-full"
					>{roles.length === 0 || roles.length === 5
						? 'All Roles'
						: roles.length === 1
							? getRoleName(Number(roles[0]))
							: `${roles.length} Roles`}</Select.Trigger
				>
				<Select.Content
					>{#each [1, 2, 3, 4, 5] as role}<Select.Item
							value={String(role)}
							label={getRoleName(role)}
							><div class="flex items-center gap-2">
								<img src={getRoleIcon(role)} alt="" class="h-6 w-6" /><span
									>{getRoleName(role)}</span
								>
							</div></Select.Item
						>{/each}</Select.Content
				>
			</Select.Root>
		</div>
		<div class="flex min-w-0 flex-col gap-1">
			<div
				id="records-date-label"
				class="text-xs font-medium uppercase tracking-wide text-zinc-400"
			>
				Date Range
			</div>
			<Select.Root type="single" bind:value={draft.dateRange}>
				<Select.Trigger aria-labelledby="records-date-label" class="w-full"
					>{dateLabel(draft.dateRange)}</Select.Trigger
				>
				<Select.Content
					>{#each DATE_RANGE_PRESETS as range}<Select.Item value={range.value} label={range.label}
							>{range.label}</Select.Item
						>{/each}{#each [...DOTA_MAJOR_PATCHES].reverse() as patch}<Select.Item
							value={`patch-${patch.version}`}
							label={patch.label}>{patch.label}</Select.Item
						>{/each}</Select.Content
				>
			</Select.Root>
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Lobby</div>
			<div class="flex flex-wrap gap-1">
				{#each [{ value: '7', label: 'Ranked' }, { value: '0', label: 'Unranked' }] as item}<button
						type="button"
						aria-pressed={lobby === 'all' || lobby === item.value}
						class="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {lobby ===
							'all' || lobby === item.value
							? 'bg-sky-600 text-white'
							: 'bg-transparent text-zinc-300'}"
						onclick={() => toggleLobby(item.value)}>{item.label}</button
					>{/each}
			</div>
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium uppercase tracking-wide text-zinc-400">Accounts</div>
			<Toggle
				bind:pressed={draft.includeSmurfs}
				class="h-10 w-fit gap-2 border px-3 data-[state=on]:bg-sky-600 data-[state=on]:text-white"
				><VenetianMask class="h-4 w-4" /> Include smurfs</Toggle
			>
		</div>
	</FilterPanel>

	{#if error}<div class="error" role="alert">
			<div>
				<strong>Records did not update</strong>
				<p>{error} Previous results are still shown.</p>
			</div>
			<button onclick={() => void applyFilters()}>Try again</button>
		</div>{/if}
	<div class="scope" aria-live="polite">
		<p>{scope}</p>
		<span
			>{loading
				? 'Updating records…'
				: `${number.format(result.playerMatchCount)} player-matches`}</span
		>
	</div>

	<div class="record-book" aria-busy={loading}>
		<aside class="record-index" aria-label="Choose a record">
			<div class="index-heading">
				<h2>Record index</h2>
				<span>{result.records.length}</span>
			</div>
			<div class="desktop-index">
				{#each categories as category}
					<div class="record-group">
						<h3>{category.label}</h3>
						{#each categoryRecords(category) as record}
							{@const holder = record.records[0]}
							<button
								class="index-item"
								class:selected={selected?.key === record.key}
								aria-pressed={selected?.key === record.key}
								onclick={() => selectRecord(record.key)}
							>
								<span class="index-copy"
									><span class="record-title">{record.title}</span><span class="holder"
										>{(holder?.participants
											? `${holder.participants.length} tracked players`
											: holder?.data.username) ??
											'No qualifying matches'}{#if holder && record.records.filter((entry) => entry.record === holder.record).length > 1}<span
											>
												· tied</span
											>{/if}</span
									></span
								>
								<span class="index-mark">{holder ? formatRecord(record, holder.record) : '—'}</span
								><ChevronRight size={14} aria-hidden="true" />
							</button>
						{/each}
					</div>
				{/each}
			</div>
			<label class="mobile-index"
				><span class="sr-only">Choose a record</span><select
					value={selected?.key}
					onchange={(event) => selectRecord(event.currentTarget.value)}
					>{#each categories as category}<optgroup label={category.label}
							>{#each categoryRecords(category) as record}<option value={record.key}
									>{record.title}</option
								>{/each}</optgroup
						>{/each}</select
				></label
			>
		</aside>

		<section class="leaderboard" aria-labelledby="leaderboard-heading">
			{#if selected}
				<header class="leaderboard-heading">
					<div>
						<div class="eyebrow">
							{selected.kind === 'streak' ? 'Logged-match streaks' : 'Single-match leaderboard'}
						</div>
						<h2 id="leaderboard-heading">{selected.title}</h2>
						<p>{descriptions[selected.key]}</p>
						{#if selected.kind === 'streak'}<p class="streak-note">
								At least 2 games. A logged game outside your hero, role, lobby, mode or duration
								filters breaks the run. Missing games may affect streaks. Main and smurf accounts
								are counted separately.
							</p>{/if}
					</div>
					<span class="top-ten">Top {Math.min(10, selected.records.length)}</span>
				</header>
				{#if selected.records.length}
					<div class="table-wrap">
						<table>
							<caption class="sr-only"
								>{selected.title}, {scope}. Equal values share a rank.</caption
							>
							<thead
								><tr>
									<th scope="col" class="rank">#</th>
									<th scope="col"
										>{selected.kind === 'match'
											? 'Tracked players'
											: selected.kind === 'streak'
												? 'Player / run'
												: 'Player / hero'}</th
									>
									<th scope="col" class="value"
										>{selected.recordTitle === 'Impact' ? 'Score' : selected.recordTitle}</th
									>
									<th scope="col" class="match-context"
										>{selected.kind === 'streak'
											? 'From'
											: selected.kind === 'match'
												? 'Match'
												: 'K / D / A'}</th
									>
									<th scope="col" class="played"
										>{selected.kind === 'streak' ? 'Through' : 'Played'}</th
									>
									<th scope="col"><span class="sr-only">Match details</span></th>
								</tr></thead
							>
							<tbody>
								{#each selected.records.slice(0, 10) as entry, index (`${selected.key}-${entry.data.matchId}-${entry.data.id}-${index}`)}
									<tr class:record-holder={rank(entry) === 1}>
										<td class="rank"
											><span title={rank(entry) === 1 ? 'Record holder' : `Rank ${rank(entry)}`}>
												{#if rank(entry) === 1}<Trophy
														size={17}
														aria-label="Record holder"
													/>{:else}{rank(entry)}{/if}
											</span></td
										>
										<td class="identity">
											{#if entry.participants}
												<div
													class="participant-list"
													style={`--participant-columns: ${Math.max(2, Math.ceil(entry.participants.length / 3))}`}
													role="region"
													aria-label="Tracked player lineup"
												>
													{#each [...entry.participants].sort((a, b) => a.role - b.role || a.username.localeCompare(b.username)) as participant}
														<a
															class="participant"
															href={`/player/${participant.id}`}
															title={`${participant.username} · ${participant.hero.name}`}
														>
															<img src={participant.hero.img} alt="" loading="lazy" />
															<span class="participant-copy"
																><span class="participant-name">{participant.username}</span><span
																	class="participant-hero">{participant.hero.name}</span
																></span
															>
														</a>
													{/each}
												</div>
											{:else}
												<div class="player">
													{#if !entry.streak}<img
															class="hero-portrait"
															src={entry.data.hero.img}
															alt=""
															loading="lazy"
														/>{/if}
													<div class="player-copy">
														<a href={`/player/${entry.data.id}`}>{entry.data.username}</a
														>{#if entry.data.smurf}<VenetianMask
																size={13}
																aria-label="Smurf account"
															/>{/if}
														{#if entry.streak}<div class="hero-name">
																{date.format(entry.streak.startTime * 1000)} to {date.format(
																	entry.streak.endTime * 1000
																)}
															</div>
														{:else}<div class="hero-name">
																<span>{entry.data.hero.name}</span><img
																	src={getRoleIcon(entry.data.role)}
																	alt={getRoleName(entry.data.role)}
																	title={getRoleName(entry.data.role)}
																/>
															</div>{/if}
													</div>
												</div>
											{/if}
											{#if !entry.streak}<div class="mobile-context">
													{#if !entry.participants}{entry.data.kills} / {entry.data.deaths} / {entry
															.data.assists}<span> · {toTime(entry.data.duration)}</span>{/if}
													<time datetime={new Date(entry.data.startTime * 1000).toISOString()}
														>{date.format(entry.data.startTime * 1000)}</time
													>
												</div>{/if}
										</td>
										<td class="value"
											><strong>{formatRecord(selected, entry.record)}</strong><small
												>{secondaryValue(entry)}</small
											></td
										>
										<td class="match-context">
											{#if entry.streak}<a href={`/match/${entry.streak.startMatchId}`}
													>{date.format(entry.streak.startTime * 1000)}</a
												><small>First match</small>
											{:else if entry.participants}<a href={`/match/${entry.data.matchId}`}
													>{entry.data.matchId}</a
												>
											{:else}<span class="kda"
													>{entry.data.kills}<i> / </i>{entry.data.deaths}<i> / </i>{entry.data
														.assists}</span
												><small>{toTime(entry.data.duration)} duration</small>{/if}
										</td>
										<td class="played"
											><time datetime={new Date(entry.data.startTime * 1000).toISOString()}
												>{date.format(entry.data.startTime * 1000)}</time
											><small
												>{entry.streak
													? 'Final match in run'
													: entry.participants
														? ''
														: getRoleName(entry.data.role)}</small
											></td
										>
										<td class="match-action"
											><MatchModal
												matchId={entry.data.matchId}
												sequenceNum={entry.data.sequenceNumber ?? undefined}
												buttonTrigger
												triggerLabel={entry.streak
													? `Open final match of ${entry.data.username}'s streak`
													: `Open match ${entry.data.matchId}`}
												triggerClass="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
												><ArrowUpRight size={17} /></MatchModal
											></td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<footer class="table-footer">
						<span><Trophy size={13} /> Record holders share the top rank when tied.</span><span
							>Up to 10 {selected.kind === 'streak'
								? 'runs'
								: selected.kind === 'match'
									? 'matches'
									: 'performances'} per record</span
						>
					</footer>
				{:else}
					<div class="empty">
						<ListFilter size={28} />
						<h3>No qualifying performances</h3>
						<p>
							Try a longer time period, another hero, or more roles to find records for this
							leaderboard.
						</p>
						<button class="apply" onclick={reset} disabled={loading}
							><RotateCcw size={15} /> Reset filters</button
						>
					</div>
				{/if}
			{:else}
				<div class="empty">
					<h2 id="leaderboard-heading">No records available</h2>
					<p>Try resetting the filters to see the group's records.</p>
					<button class="apply" onclick={reset} disabled={loading}>Reset filters</button>
				</div>
			{/if}
		</section>
	</div>
</main>

<style>
	.participant-list {
		display: grid;
		grid-template-columns: repeat(var(--participant-columns), minmax(104px, 1fr));
		gap: 6px 10px;
		width: clamp(120px, calc(100vw - 220px), 380px);
		overflow-x: auto;
		padding: 2px;
	}
	.participant {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		min-height: 30px;
	}
	.participant img {
		width: 32px;
		height: 24px;
		object-fit: cover;
		border-radius: 3px;
		flex-shrink: 0;
	}
	.participant-copy {
		min-width: 0;
	}
	.participant-name {
		display: block;
		font-size: 12px;
		font-weight: 700;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.participant-hero {
		display: block;
		margin-top: 2px;
		font-size: 11px;
		color: var(--muted-foreground);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.participant:hover .participant-name,
	.match-context a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.participant-list:focus-visible {
		outline: 2px solid var(--record-accent);
		outline-offset: 2px;
	}
	@media (max-width: 600px) {
		.participant {
			min-height: 36px;
			gap: 6px;
		}
		.participant-hero {
			font-size: 10px;
		}
	}
	.leaderboard-heading .streak-note {
		margin-top: 10px;
		max-width: 65ch;
		line-height: 1.6;
	}

	.records-page {
		--record-accent: oklch(0.72 0.13 235);
		width: 100%;
		max-width: 1400px;
		padding: 30px 28px 16px;
		color: var(--foreground);
	}
	.page-heading {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 16px;
		margin-bottom: 24px;
	}
	.eyebrow {
		color: var(--muted-foreground);
		font-size: 11px;
		font-weight: 650;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}
	h1 {
		font-size: 30px;
		font-weight: 750;
		line-height: 1.25;
		letter-spacing: -0.035em;
		margin-top: 5px;
	}

	select {
		width: 100%;
		height: 40px;
		padding: 0 30px 0 11px;
		border: 1px solid var(--input);
		border-radius: 6px;
		background: var(--background);
		color: var(--foreground);
		font-size: 13px;
		font-weight: 400;
	}

	button {
		transition:
			background-color 160ms ease-out,
			color 160ms ease-out;
	}
	button:focus-visible,
	select:focus-visible,
	a:focus-visible {
		outline: 2px solid var(--record-accent);
		outline-offset: 3px;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.apply {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		border-radius: 6px;
		background: oklch(0.72 0.13 235);
		color: oklch(0.2 0.035 235);
		font-size: 12px;
		font-weight: 750;
		min-height: 40px;
		padding: 0 14px;
		white-space: nowrap;
	}
	.apply:hover:not(:disabled) {
		background: oklch(0.8 0.1 235);
	}

	.scope {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 20px;
		margin: 18px 0 12px;
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.scope span {
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.record-book {
		display: grid;
		grid-template-columns: 285px minmax(0, 1fr);
		gap: 20px;
		align-items: start;
	}
	.record-index,
	.leaderboard {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
	}
	.index-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid var(--border);
	}
	.index-heading h2 {
		font-size: 13px;
		font-weight: 700;
	}
	.index-heading > span {
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.record-group {
		padding: 14px 7px 5px;
	}
	.record-group:last-child {
		padding-bottom: 10px;
	}
	.record-group h3 {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.075em;
		color: var(--muted-foreground);
		margin: 0 9px 6px;
	}
	.index-item {
		display: flex;
		width: 100%;
		align-items: center;
		text-align: left;
		gap: 8px;
		padding: 10px 8px;
		border: 1px solid transparent;
		border-radius: 5px;
	}
	.index-item:hover {
		background: var(--background);
	}
	.index-item.selected {
		background: var(--background);
		border-color: var(--border);
	}
	.index-item > :global(svg) {
		color: var(--muted-foreground);
		flex-shrink: 0;
	}
	.index-item.selected > :global(svg) {
		color: var(--record-accent);
	}
	.index-copy {
		flex: 1;
		min-width: 0;
	}
	.record-title {
		display: block;
		font-size: 12px;
		font-weight: 650;
	}
	.holder {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--muted-foreground);
		font-size: 11px;
		margin-top: 2px;
	}
	.index-mark {
		font-size: 13px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.mobile-index {
		display: none;
	}
	.leaderboard-heading {
		padding: 24px;
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 16px;
	}
	.leaderboard-heading h2 {
		font-size: 24px;
		line-height: 1.3;
		letter-spacing: -0.025em;
		font-weight: 750;
		margin: 6px 0;
	}
	.leaderboard-heading p {
		color: var(--muted-foreground);
		font-size: 12px;
	}
	.top-ten {
		font-size: 11px;
		padding: 4px 8px;
		border: 1px solid var(--border);
		border-radius: 4px;
		white-space: nowrap;
	}
	.table-wrap {
		width: 100%;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 12px;
	}
	th {
		color: var(--muted-foreground);
		font-size: 10px;
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-align: left;
		background: var(--background);
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		padding: 11px 10px;
	}
	td {
		padding: 15px 10px;
		border-bottom: 1px solid color-mix(in oklch, var(--border) 60%, transparent);
		font-variant-numeric: tabular-nums;
	}
	tr:last-child td {
		border-bottom: 0;
	}
	tbody tr:hover {
		background: color-mix(in oklch, var(--background) 65%, transparent);
	}
	.record-holder {
		background: color-mix(in oklch, var(--foreground) 4%, transparent);
	}
	.rank {
		width: 47px;
		text-align: center;
		color: var(--muted-foreground);
		padding-left: 14px;
	}
	.rank > span {
		display: inline-flex;
		justify-content: center;
	}
	.record-holder .rank {
		color: var(--foreground);
	}
	.player {
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.hero-portrait {
		width: 52px;
		height: 32px;
		object-fit: cover;
		border-radius: 3px;
		flex-shrink: 0;
	}
	.player-copy {
		min-width: 0;
	}
	.player-copy a {
		font-size: 13px;
		font-weight: 700;
		overflow-wrap: anywhere;
	}
	.player-copy a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.player-copy > :global(svg) {
		display: inline;
		margin-left: 4px;
		color: var(--muted-foreground);
	}
	.hero-name {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		color: var(--muted-foreground);
		margin-top: 3px;
	}
	.hero-name img {
		width: 15px;
		height: 15px;
	}
	.value {
		text-align: right;
	}
	.value strong {
		display: block;
		font-size: 18px;
		font-weight: 750;
		line-height: 1.3;
	}
	small {
		display: block;
		font-size: 10px;
		color: var(--muted-foreground);
		margin-top: 4px;
		white-space: nowrap;
	}
	.kda,
	time {
		white-space: nowrap;
	}
	.kda i {
		color: var(--muted-foreground);
		font-style: normal;
	}
	.match-action {
		width: 48px;
		padding-left: 0;
		padding-right: 8px;
	}
	.mobile-context {
		display: none;
	}
	.mobile-context time {
		display: block;
		margin-top: 3px;
	}
	.holder > span {
		margin-left: 4px;
	}
	.table-footer {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 18px;
		border-top: 1px solid var(--border);
		font-size: 10px;
		color: var(--muted-foreground);
	}
	.table-footer span:first-child {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.empty {
		display: flex;
		min-height: 390px;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 14px;
		padding: 32px;
		text-align: center;
	}
	.empty > :global(svg) {
		color: var(--muted-foreground);
	}
	.empty h3,
	.empty h2 {
		font-size: 18px;
		font-weight: 700;
	}
	.empty p {
		max-width: 42ch;
		color: var(--muted-foreground);
		font-size: 13px;
	}
	.error {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		padding: 16px;
		margin-top: 16px;
		border: 1px solid oklch(0.62 0.16 25);
		border-radius: 6px;
		font-size: 13px;
	}
	.error p {
		color: var(--muted-foreground);
		margin-top: 4px;
	}
	.error button {
		padding: 10px;
		text-decoration: underline;
		white-space: nowrap;
	}
	@media (max-width: 1150px) {
		.record-book {
			grid-template-columns: 245px minmax(0, 1fr);
			gap: 14px;
		}
		.played {
			display: none;
		}
		.table-footer {
			flex-direction: column;
		}
	}
	@media (max-width: 800px) {
		.records-page {
			padding: 22px 16px;
		}
		.page-heading {
			align-items: start;
			flex-direction: column;
			gap: 8px;
			margin-bottom: 18px;
		}
		.record-book {
			grid-template-columns: minmax(0, 1fr);
		}
		.desktop-index {
			display: none;
		}
		.record-index {
			display: flex;
			align-items: center;
			padding: 12px;
			gap: 16px;
		}
		.index-heading {
			border: 0;
			padding: 0;
			flex-shrink: 0;
		}
		.index-heading > span {
			display: none;
		}
		.mobile-index {
			display: block;
			flex: 1;
			min-width: 0;
		}
		.scope {
			align-items: start;
			flex-direction: column;
			gap: 6px;
		}
		.played {
			display: table-cell;
		}
		.table-footer {
			flex-direction: row;
		}
	}
	@media (max-width: 600px) {
		.records-page {
			padding: 20px 12px;
		}

		.leaderboard-heading {
			padding: 20px 16px;
		}
		.leaderboard-heading h2 {
			font-size: 22px;
		}
		.match-context,
		.played {
			display: none;
		}
		.mobile-context {
			display: block;
			margin-top: 7px;
			font-size: 10px;
			color: var(--muted-foreground);
		}
		.rank {
			width: 28px;
			padding-left: 8px;
			padding-right: 4px;
		}
		td {
			padding: 13px 7px;
		}
		.hero-portrait {
			width: 38px;
			height: 27px;
		}
		.player {
			gap: 7px;
		}
		.player-copy a {
			font-size: 12px;
		}
		.hero-name {
			font-size: 10px;
		}
		.value strong {
			font-size: 16px;
		}
		th.value {
			max-width: 90px;
		}
		.match-action {
			width: 38px;
			padding-right: 2px;
		}
		.match-action :global(button) {
			width: 34px;
			min-height: 44px;
		}
		.table-footer {
			padding: 12px;
			flex-direction: column;
		}
		.error {
			align-items: start;
			flex-direction: column;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}
</style>
