<script lang="ts">
	import { ArrowLeft, ChevronDown, Clock3, ExternalLink, Trophy } from 'lucide-svelte';
	import { formatEnumLabel, formatMatchTime, type MatchOverview } from '$lib/match-page';

	interface Props {
		match: MatchOverview;
	}

	let { match }: Props = $props();

	const formatDate = (timestamp: number) =>
		new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(timestamp * 1000));

	const toTitleCase = (value: string) =>
		formatEnumLabel(value).replace(/\b\w/g, (character) => character.toUpperCase());

	const formatMatchType = (gameMode: string, lobbyType: string) => {
		const lobby = toTitleCase(lobbyType);
		const game = toTitleCase(gameMode).replace(/\b(?:Ranked|Unranked)\b/gi, '').trim();
		if (!game) return lobby;
		if (game.toLowerCase().includes(lobby.toLowerCase())) return game;
		return `${lobby} ${game}`;
	};

	const formatPatch = (patch: string) => patch.replace(/^patch\s+/i, '');

	const goBack = (event: MouseEvent) => {
		if (history.length <= 1) return;
		event.preventDefault();
		history.back();
	};
</script>

<header class="relative rounded-md border border-border bg-card">
	<div class="flex flex-col gap-5 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
		<div class="flex min-w-0 items-start gap-3">
			<a
				href="/matches"
				onclick={goBack}
				class="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				aria-label="Back to matches"
			>
				<ArrowLeft class="h-4 w-4" />
			</a>
			<div class="min-w-0">
				<div class="flex flex-wrap items-center gap-2">
					<span
						class={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-semibold ${
							match.winner === 'radiant'
								? 'border-emerald-900/70 bg-emerald-950/35 text-emerald-300'
								: 'border-red-900/70 bg-red-950/35 text-red-300'
						}`}
					>
						<Trophy class="h-3.5 w-3.5" />
						{match.winner === 'radiant' ? 'Radiant victory' : 'Dire victory'}
					</span>
					<span class="text-xs text-zinc-400">Match {match.id}</span>
				</div>
				<div class="mt-2 flex items-baseline gap-3">
					<span class="text-3xl font-semibold tabular-nums text-emerald-400">{match.radiantScore}</span>
					<span class="text-sm text-zinc-600">:</span>
					<span class="text-3xl font-semibold tabular-nums text-red-400">{match.direScore}</span>
					<span class="ml-1 inline-flex items-center gap-1.5 text-sm tabular-nums text-zinc-400">
						<Clock3 class="h-3.5 w-3.5" />
						{formatMatchTime(match.durationSeconds)}
					</span>
				</div>
				<p class="mt-2 text-sm text-zinc-400">{formatDate(match.startDateTime)}</p>
			</div>
		</div>

		<div class="flex flex-col gap-3 md:items-end">
			<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-400 md:justify-end">
				<span class="font-medium text-zinc-200">{formatMatchType(match.gameMode, match.lobbyType)}</span>
				{#if match.patch}
					<span aria-hidden="true" class="text-zinc-600">·</span>
					<span>Patch {formatPatch(match.patch)}</span>
				{/if}
				{#if match.averageRank}
					<span aria-hidden="true" class="text-zinc-600">·</span>
					<span>Average rank {match.averageRank}</span>
				{/if}
			</div>
			<details class="group relative w-fit md:self-end">
				<summary class="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
					Match sources
					<ChevronDown class="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
				</summary>
				<nav aria-label="External match sources" class="absolute left-0 z-30 mt-2 w-48 overflow-hidden rounded-md border border-zinc-700 bg-popover p-1 shadow-xl md:right-0 md:left-auto">
					{#each [
						{ label: 'Dotabuff', href: `https://www.dotabuff.com/matches/${match.id}` },
						{ label: 'OpenDota', href: `https://www.opendota.com/matches/${match.id}` },
						{ label: 'STRATZ', href: `https://www.stratz.com/matches/${match.id}` }
					] as source}
						<a
							href={source.href}
							target="_blank"
							rel="noopener noreferrer"
							class="flex min-h-11 items-center justify-between rounded-sm px-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							{source.label} <ExternalLink class="h-3.5 w-3.5" />
						</a>
					{/each}
				</nav>
			</details>
		</div>
	</div>

	{#if match.status !== 'ready'}
		<div class="border-t border-amber-900/50 bg-amber-950/20 px-4 py-2.5 text-xs text-amber-200/80">
			STRATZ is still processing this match. Some analysis may be incomplete for a few minutes.
		</div>
	{/if}
</header>
