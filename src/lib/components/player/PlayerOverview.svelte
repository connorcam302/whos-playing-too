<script lang="ts">
	import { currentPlayer } from '$lib/current-player';
	import { getRoleIcon, getRoleName } from '$lib/functions';
	import RatingChip from '$lib/components/RatingChip.svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import DotaItem from '$lib/components/DotaItem.svelte';
	dayjs.extend(relativeTime);
	import type { PlayerOverviewData } from '$lib/player-overview';

	let { refreshKey }: { refreshKey?: number } = $props();
	let overview = $state<PlayerOverviewData | null>(null);
	let loading = $state(true);
	let failed = $state(false);
	let retry = $state(0);
	let hoveredRole = $state<number | null>(null);
	let focusedRole = $state<number | null>(null);
	const highlightedRole = $derived(hoveredRole ?? focusedRole);
	const roleColours: Record<number, string> = { 1: '#4555A9', 2: '#308794', 3: '#C47716', 4: '#C14755', 5: '#3B9C75' };
	const panelClass = 'min-w-0 rounded-md border border-border bg-card p-3';
	const linkClass = 'rounded-sm text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

	$effect(() => {
		const playerId = $currentPlayer;
		refreshKey;
		retry;
		overview = null;
		hoveredRole = null;
		focusedRole = null;
		failed = false;
		if (playerId === null) return;
		loading = true;
		const controller = new AbortController();
		const load = async () => {
			try {
				const response = await fetch(`/api/player/${playerId}/overview`, { signal: controller.signal });
				if (!response.ok) throw new Error('Player overview unavailable');
				const result: PlayerOverviewData = await response.json();
				if (!controller.signal.aborted) overview = result;
			} catch {
				if (!controller.signal.aborted) failed = true;
			} finally {
				if (!controller.signal.aborted) loading = false;
			}
		};
		void load();
		return () => controller.abort();
	});
</script>

{#if $currentPlayer !== null}
	<section class="mt-6" aria-labelledby="player-overview-heading" aria-busy={loading}>
		<div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
			<h2 id="player-overview-heading" class="text-base font-semibold">Your overview</h2>
			<a href={`/player/${$currentPlayer}`} class={linkClass}>View player profile</a>
		</div>
		{#if loading}
			<div class="grid auto-rows-fr gap-3 lg:grid-cols-3" role="status">
				<span class="sr-only">Loading your player overview</span>
				{#each [1, 2, 3] as panel (panel)}
					<div class={`${panelClass} h-56`} aria-hidden="true">
						<div class="h-3 w-24 rounded bg-muted motion-safe:animate-pulse"></div>
						<div class="mt-5 h-5 w-32 rounded bg-muted motion-safe:animate-pulse"></div>
					</div>
				{/each}
			</div>
		{:else if failed}
			<div class={`${panelClass} flex items-center justify-between gap-4 text-sm`} role="status">
				<p class="text-muted-foreground">Your overview couldn’t be loaded.</p>
				<button class={linkClass} onclick={() => retry += 1}>Try again</button>
			</div>
		{:else if overview}
			{@const matches = overview.wins + overview.losses}
			{@const roleMatchCount = overview.roles.reduce((total, role) => total + role.matches, 0)}
			{#if matches === 0 && !overview.latestMatch}
				<div class={panelClass}>
					<p class="text-sm">No matches in the last 14 days.</p>
					<a href={`/player/${$currentPlayer}?tab=matches`} class={`${linkClass} mt-2 inline-block`}>View your match history</a>
				</div>
			{:else}
				<div class="grid auto-rows-fr gap-3 lg:grid-cols-3">
					<div class={panelClass}>
						<div class="flex items-baseline justify-between gap-2">
							<h3 class="text-xs font-medium text-muted-foreground">Most recent match</h3>
							{#if overview.latestMatch}
								{@const match = overview.latestMatch}
								<a href={`/match/${match.id}`} class={`${linkClass} shrink-0 whitespace-nowrap text-right tabular-nums`}>
									<time datetime={new Date(match.startTime * 1000).toISOString()}>{dayjs.unix(match.startTime).fromNow()}</time>
									· {Math.floor(match.duration / 60)}:{String(match.duration % 60).padStart(2, '0')}
								</a>
							{/if}
						</div>
						{#if overview.latestMatch}
							{@const match = overview.latestMatch}
							<div class="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
								<div class="min-w-0">
									<a href={`/match/${match.id}`} class="flex min-w-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
										{#if match.hero.img}
											<img src={match.hero.img} alt="" class="h-11 w-16 shrink-0 rounded-sm object-cover" />
										{/if}
										<span class="min-w-0">
											<span class="block text-base font-semibold hover:underline">{match.hero.name}</span>
											<span class={match.won ? 'text-xs text-green-500' : 'text-xs text-red-500'}>{match.won ? 'Victory' : 'Defeat'}</span>
										</span>
									</a>
									<div class="mt-3 flex flex-wrap items-center gap-2 text-base tabular-nums">
										<p aria-label={`${match.kills} kills, ${match.deaths} deaths, ${match.assists} assists`}><span class="text-green-300">{match.kills}</span> / <span class="text-red-400">{match.deaths}</span> / <span class="text-cyan-300">{match.assists}</span></p>
										<img src={getRoleIcon(match.role)} alt={getRoleName(match.role) ?? 'Unknown role'} title={getRoleName(match.role) ?? 'Unknown role'} class="h-5 w-5 object-contain" />
									</div>
									<div class="mt-3 flex items-center gap-2" role="group" aria-label="Item build">
										<div class="grid grid-cols-3 gap-1">
											{#each match.items as item, slot (slot)}
												<div class="h-[30px] w-10">
													<DotaItem {item} styles="w-full rounded-sm object-cover" />
												</div>
											{/each}
										</div>
										{#if match.neutralItem}
											<div class="h-8 w-8 shrink-0">
												<DotaItem item={match.neutralItem} styles="w-full rounded-full object-cover" />
											</div>
										{/if}
									</div>
								</div>
								<div class="flex flex-col items-end text-right">
									<RatingChip data={{ player: match, matchData: { duration: match.duration } }} />
									<dl class="mt-3 grid w-full grid-cols-[auto_auto] gap-x-2 gap-y-1.5 text-xs">
										<dt class="text-muted-foreground">GPM</dt><dd class="text-sm tabular-nums text-yellow-300">{match.gpm ?? '—'}</dd>
										<dt class="text-muted-foreground">XPM</dt><dd class="text-sm tabular-nums text-purple-300">{match.xpm ?? '—'}</dd>
										<dt class="text-muted-foreground">Last hits</dt><dd class="text-sm tabular-nums text-orange-300">{match.lastHits}</dd>
										<dt class="text-muted-foreground">Hero dmg</dt><dd class="text-sm tabular-nums text-red-400">{match.heroDamage?.toLocaleString('en-GB') ?? '—'}</dd>
										<dt class="text-muted-foreground">Tower dmg</dt><dd class="text-sm tabular-nums text-orange-300">{match.towerDamage?.toLocaleString('en-GB') ?? '—'}</dd>
									</dl>

								</div>
							</div>

						{:else}
							<p class="mt-3 text-sm text-muted-foreground">No matches yet.</p>
						{/if}
					</div>
					<div class={panelClass}>
						<h3 class="text-xs font-medium text-muted-foreground">Recent form <span class="font-normal">· Last 14 days</span></h3>
						{#if matches > 0}
							<div class="mt-3 flex items-baseline justify-between gap-3 tabular-nums">
								<p class="text-lg font-semibold"><span class="text-green-500">{overview.wins}W</span> <span class="text-red-500">{overview.losses}L</span></p>
								<p class="text-sm">{Math.round(overview.wins / matches * 100)}% win rate</p>
							</div>
							<div class="mt-2 flex h-1.5 overflow-hidden rounded-full bg-red-500" aria-hidden="true">
								<div class="h-full bg-green-500" style:width={`${overview.wins / matches * 100}%`}></div>
							</div>
						{:else}
							<p class="mt-3 text-sm text-muted-foreground">No matches in the last 14 days.</p>
						{/if}
						<a href={`/player/${$currentPlayer}?tab=matches`} class={`${linkClass} mt-3 inline-block`}>{matches} {matches === 1 ? 'match' : 'matches'} played →</a>

						<div class="mt-3 border-t border-border pt-3">
							{#if overview.average}
								<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
									<RatingChip impact={overview.average.avgImpact} />
									<span class="text-xs text-muted-foreground tabular-nums">{overview.average.avgImpact} impact</span>
								<p class="ml-auto text-sm tabular-nums" aria-label={`${overview.average.avgKills} average kills, ${overview.average.avgDeaths} average deaths, ${overview.average.avgAssists} average assists`}><span class="text-green-300">{overview.average.avgKills}</span> / <span class="text-red-400">{overview.average.avgDeaths}</span> / <span class="text-cyan-300">{overview.average.avgAssists}</span></p>
								</div>
								<dl class="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs">
									<div><dt class="text-muted-foreground">GPM</dt><dd class="mt-1 text-sm tabular-nums text-yellow-300">{overview.average.avgGpm ?? '—'}</dd></div>
									<div><dt class="text-muted-foreground">XPM</dt><dd class="mt-1 text-sm tabular-nums text-purple-300">{overview.average.avgXpm ?? '—'}</dd></div>
									<div><dt class="text-muted-foreground">Last hits</dt><dd class="mt-1 text-sm tabular-nums text-orange-300">{overview.average.avgLastHits ?? '—'}</dd></div>
									<div><dt class="text-muted-foreground">Hero dmg</dt><dd class="mt-1 text-sm tabular-nums text-red-400">{overview.average.avgHeroDamage?.toLocaleString('en-GB') ?? '—'}</dd></div>
									<div><dt class="text-muted-foreground">Tower dmg</dt><dd class="mt-1 text-sm tabular-nums text-orange-300">{overview.average.avgTowerDamage?.toLocaleString('en-GB') ?? '—'}</dd></div>
								</dl>
							{:else}
								<p class="mt-3 text-sm text-muted-foreground">Performance data unavailable.</p>
							{/if}
						</div>
					</div>

					<div class={`${panelClass} flex flex-col`}>
						<h3 class="mb-3 text-xs font-medium text-muted-foreground">Win rate by role <span class="font-normal">· Last 14 days</span></h3>
						<ul class="grid min-h-32 flex-1 auto-rows-fr grid-cols-[1rem_minmax(0,1fr)_max-content_max-content] gap-x-2 gap-y-2">
							{#each overview.roles as role (role.role)}
								{@const winRate = role.matches > 0 ? role.wins / role.matches * 100 : 0}
								<li id={`overview-role-${role.role}`} class="col-span-4 grid grid-cols-subgrid items-center gap-x-2 rounded-sm text-xs tabular-nums transition-colors"
									style:background-color={highlightedRole === role.role ? `${roleColours[role.role]}33` : undefined}
									style:outline={highlightedRole === role.role ? `1px solid ${roleColours[role.role]}` : undefined}
									style:outline-offset="3px"
									aria-label={`${getRoleName(role.role)}: ${role.matches ? `${Math.round(winRate)}% win rate, ${role.wins} wins in ${role.matches} matches` : 'No matches'}`}
									title={`${getRoleName(role.role)}: ${role.wins}W ${role.matches - role.wins}L`}>
									<img src={getRoleIcon(role.role)} alt={getRoleName(role.role) ?? ''} class="h-4 w-4 object-contain" />
									<div class="flex h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
										{#if role.matches > 0}
											<div class="h-full bg-green-500" style:width={`${winRate}%`}></div>
											<div class="h-full bg-red-500" style:width={`${100 - winRate}%`}></div>
										{/if}
									</div>
									<span class="whitespace-nowrap text-right">{role.matches ? `${Math.round(winRate)}%` : '—'}</span>
									<span class="whitespace-nowrap text-right text-muted-foreground">{role.matches} {role.matches === 1 ? 'game' : 'games'}</span>
								</li>
							{/each}
						</ul>
						<div class="mt-3">
							<h4 class="mb-2 text-xs text-muted-foreground">Match volume</h4>
							{#if roleMatchCount > 0}
								<div class="flex h-3 overflow-hidden rounded-sm" role="group" aria-label="Match volume by role">
									{#each overview.roles as role (role.role)}
										{#if role.matches > 0}
											<button type="button" class="h-full transition-[filter] hover:brightness-125 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground"
												onmouseenter={() => hoveredRole = role.role}
												onmouseleave={() => hoveredRole = null}
												onfocus={() => focusedRole = role.role}
												onblur={() => focusedRole = null}
												aria-controls={`overview-role-${role.role}`}
												aria-label={`${getRoleName(role.role)}: ${role.matches} matches (${Math.round(role.matches / roleMatchCount * 100)}%)`}
												style:width={`${role.matches / roleMatchCount * 100}%`} style:background-color={roleColours[role.role]} title={`${getRoleName(role.role)}: ${role.matches} matches (${Math.round(role.matches / roleMatchCount * 100)}%)`}></button>
										{/if}
									{/each}
								</div>

							{:else}
								<p class="text-xs text-muted-foreground">No role data in the last 14 days.</p>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</section>
{/if}
