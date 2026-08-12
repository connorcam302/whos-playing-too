<script lang="ts">
	import { Search, Trophy } from 'lucide-svelte';
	import {
		formatCompactNumber,
		formatStratzImpact,
		getStratzImpactColor,
		type MatchOverview,
		type MatchPlayerOverview
	} from '$lib/match-page';
	import { getRoleIcon } from '$lib/functions';
	import RatingChip from '$lib/components/RatingChip.svelte';

	interface Props {
		match: MatchOverview;
		selectedSlot: number;
		onSelect: (playerSlot: number) => void;
	}

	let { match, selectedSlot, onSelect }: Props = $props();

	const teamPlayers = (isRadiant: boolean) =>
		match.players.filter((player) => player.isRadiant === isRadiant);

	const getPlayerHref = (player: MatchPlayerOverview) =>
		player.user ? `/player/${player.user.id}` : null;

	const itemSlots = (player: MatchPlayerOverview) => {
		const items = [...player.items];
		while (items.length < 6) items.push({ id: 0, name: 'Empty', img: '/empty-slot.webp' });
		return items.slice(0, 6);
	};

	const getPlayerLabel = (player: MatchPlayerOverview) =>
		player.user ? player.name : 'Anonymous';

	const getPlayerContext = (player: MatchPlayerOverview) =>
		player.hero.name;

</script>

<section aria-labelledby="scoreboard-heading" class="min-w-0 max-w-full overflow-x-clip [contain:paint]">
	<div class="mb-2 flex items-center justify-between gap-3 px-1">
		<div>
			<h2 id="scoreboard-heading" class="text-sm font-semibold text-zinc-100">Scoreboard</h2>
			<p class="mt-0.5 text-xs text-zinc-400">WP Impact is role weighted. STRATZ IMP estimates contribution to win probability.</p>
			<p class="mt-1 text-xs text-zinc-400 lg:hidden">Swipe sideways to compare every stat.</p>
		</div>
	</div>

	<div class="grid gap-4">
		{#each [true, false] as isRadiant}
			{@const teamName = isRadiant ? 'Radiant' : 'Dire'}
			{@const isWinner = match.didRadiantWin === isRadiant}
			<div class="min-w-0 overflow-hidden rounded-md border border-border bg-card">
				<div class="flex items-center justify-between border-b border-border bg-zinc-950/35 px-3 py-2">
					<div class="flex items-center gap-2">
						<span class={`h-2 w-2 rounded-full ${isRadiant ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
						<h3 class="text-sm font-semibold text-zinc-200">{teamName}</h3>
						{#if isWinner}<Trophy class="h-3.5 w-3.5 text-amber-400" />{/if}
					</div>
					<span class="text-xs tabular-nums text-zinc-400">
						{isRadiant ? match.radiantScore : match.direScore} kills
					</span>
				</div>

				<div
					class="max-w-full touch-pan-x overflow-x-auto overscroll-x-contain [contain:inline-size]"
					role="region"
					aria-label={`${teamName} scoreboard, scroll horizontally for all statistics`}
				>
					<table class="w-full min-w-[900px] text-sm">
						<thead>
							<tr class="border-b border-zinc-800/80 bg-zinc-950/20 text-xs uppercase tracking-wide text-zinc-400">
								<th class="sticky left-0 z-20 bg-zinc-900 px-3 py-2 text-left font-medium">Player</th>
								<th class="px-2 py-2 text-center font-medium">K / D / A</th>
								<th class="px-2 py-2 text-center font-medium" title="Whos Playing role-weighted impact">WP impact</th>
								<th class="px-2 py-2 text-center font-medium" title="STRATZ Individual Match Performance">STRATZ IMP</th>
								<th class="px-2 py-2 text-center font-medium">LH / DN</th>
								<th class="px-2 py-2 text-right font-medium">Net</th>
								<th class="px-2 py-2 text-center font-medium">GPM</th>
								<th class="px-2 py-2 text-center font-medium">XPM</th>
								<th class="px-2 py-2 text-right font-medium">Damage</th>
								<th class="px-2 py-2 text-left font-medium">Items</th>
								<th class="px-2 py-2 text-center font-medium"><span class="sr-only">Inspect</span></th>
							</tr>
						</thead>
						<tbody>
							{#each teamPlayers(isRadiant) as player}
								<tr
									class={`group border-b border-zinc-900/80 transition-colors last:border-b-0 ${
										selectedSlot === player.playerSlot ? 'bg-zinc-800/70' : 'hover:bg-zinc-900/55'
									}`}
								>
									<td class={`sticky left-0 z-10 px-3 py-1.5 transition-colors ${
										selectedSlot === player.playerSlot ? 'bg-zinc-800' : 'bg-card group-hover:bg-zinc-900'
									}`}>
										<div class="flex min-w-44 items-center gap-2">
											<button
												type="button"
												onclick={() => onSelect(player.playerSlot)}
												class="inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
												aria-label={`Inspect ${getPlayerLabel(player)} on ${player.hero.name}`}
											>
												<img src={player.hero.img} alt="" class="h-8 w-12 rounded-sm object-cover" />
											</button>
											<div class="min-w-0">
												{#if getPlayerHref(player)}
													<a
														href={getPlayerHref(player) ?? undefined}
														class="block max-w-32 truncate font-medium text-zinc-100 hover:text-zinc-300"
													>
														{getPlayerLabel(player)}
													</a>
											{:else}
												<span class="block max-w-32 truncate font-medium text-zinc-400">{getPlayerLabel(player)}</span>
											{/if}
												<div class="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
													{#if player.positionNumber}
														<img src={getRoleIcon(player.positionNumber)} alt="" class="h-3.5 w-3.5 shrink-0" />
													{/if}
													<span>{getPlayerContext(player)}</span>
													{#if player.user?.smurf}
														<span class="rounded-sm bg-indigo-500/15 px-1 text-indigo-300">Smurf</span>
													{/if}
												</div>
											</div>
										</div>
									</td>
									<td class="whitespace-nowrap px-2 py-2 text-center tabular-nums">
										<span class="text-emerald-400">{player.kills}</span>
										<span class="text-zinc-600"> / </span>
										<span class="text-red-400">{player.deaths}</span>
										<span class="text-zinc-600"> / </span>
										<span class="text-cyan-300">{player.assists}</span>
									</td>
									<td class="px-2 py-2 text-center">
										{#if player.whosPlayingImpact !== null && player.positionNumber}
											<div class="flex items-center justify-center">
												<RatingChip
													data={{
														player: {
															impact: player.whosPlayingImpact,
															role: player.positionNumber,
															kills: player.kills,
															deaths: player.deaths,
															assists: player.assists,
															lastHits: player.lastHits,
															hero: player.hero,
															hero_id: player.hero.id
														},
														matchData: { duration: match.durationSeconds }
													}}
													comfortable
												/>
											</div>
										{:else}<span class="text-zinc-700">-</span>{/if}
									</td>
									<td class="px-2 py-2 text-center">
										{#if player.stratzImpact !== null}
											<span
												class="text-xs font-semibold tabular-nums"
												style:color={getStratzImpactColor(player.stratzImpact)}
												title={`${player.stratzImpact > 0 ? 'Positive' : player.stratzImpact < 0 ? 'Negative' : 'Neutral'} STRATZ impact`}
											>
												{formatStratzImpact(player.stratzImpact)}
											</span>
										{:else}<span class="text-zinc-700">-</span>{/if}
									</td>
									<td class="whitespace-nowrap px-2 py-2 text-center tabular-nums text-zinc-300">{player.lastHits} / {player.denies}</td>
									<td class="px-2 py-2 text-right tabular-nums text-amber-300">{formatCompactNumber(player.networth)}</td>
									<td class="px-2 py-2 text-center tabular-nums text-zinc-300">{player.goldPerMinute}</td>
									<td class="px-2 py-2 text-center tabular-nums text-zinc-300">{player.experiencePerMinute}</td>
									<td class="px-2 py-2 text-right tabular-nums text-zinc-300">{formatCompactNumber(player.heroDamage)}</td>
									<td class="px-2 py-2">
										<div class="flex items-center gap-px">
											{#each itemSlots(player) as item}
												<img src={item.img} alt={item.id ? item.name : ''} title={item.name} class="h-7 w-10 max-w-none rounded-[2px] object-cover" />
											{/each}
											{#if player.neutralItem}
												<img src={player.neutralItem.img} alt={player.neutralItem.name} title={player.neutralItem.name} class="ml-1 h-7 w-7 max-w-none rounded-full object-cover" />
											{/if}
										</div>
									</td>
									<td class="px-2 py-2 text-center">
										<button
											type="button"
											onclick={() => onSelect(player.playerSlot)}
											class="inline-flex h-11 w-11 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											aria-label={`Inspect ${getPlayerLabel(player)}`}
										>
											<Search class="h-4 w-4" />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/each}
	</div>
</section>
