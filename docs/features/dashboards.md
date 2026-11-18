# Home, group statistics and comparison

## Home (`/`)

The server loader returns hero and player statistics, Team of the Week, Flop of the Week and a weekly digest. Some values remain promises so sections can render loading states independently. The client separately loads recent stored games from `/api/matches/recent`.

Recent games refresh on mount, every 60 seconds and when the browser tab becomes visible. Background tabs skip refresh, and concurrent refreshes are suppressed. After initial data exists, `/api/matches/latest` checks the newest stored match ID first; an unchanged ID skips the heavier request. A changed visible newest match triggers `invalidateAll()` to refresh server-backed panels. Network failures retain existing games for a later retry. A same-ID correction may not trigger this refresh path.

The recent endpoint chooses up to ten matching games and builds tracked-player match blocks. The latest-ID endpoint reads the newest `matches` row without applying the recent endpoint's eligibility rules. Their newest IDs can differ.

The current-player overview offers a personal entry point. `/api/player/[id]/overview` loads 14-day results, averages and role counts, plus the latest stored appearance across all dates. Empty history returns a null latest match; unknown items/heroes get fallbacks. Its queries do not all share the same account/eligibility predicates, so do not infer that every number covers an identical sample.

Sources: `src/routes/+page.server.ts`, `src/routes/+page.svelte`, `src/lib/components/player/PlayerOverview.svelte`, `src/lib/components/stats/{HeroStatbox,PlayerStatbox}.svelte`, `src/routes/api/matches/recent/+server.ts`.

## Weekly awards

Team and Flop of the Week display stored selections using `getTeamOfTheWeek` and `getFlopOfTheWeek` in `db-functions.ts`, with presentation under `components/otw`. These are separate from the computed weekly digest. This repository's award readers do not establish the external process that chooses or writes awards. Preserve position, player, hero and match links when changing their display. `/api/matches/list` resolves a person's award match references, including null-match weeks.

## Weekly digest

`src/lib/server/weeklyDigest.ts` compares the most recent rolling seven days with the preceding seven days. It builds candidates for records, streaks, notable games, poor performances, hero ownership and role-ranking changes. These are computed highlights rather than authored news. `src/lib/weeklyDigest.ts` defines the payload and ranking; `components/digest` renders it.

Recent match data and full hero history load independently with `Promise.allSettled`. A failed source produces a partial digest when the other succeeds. Both failing gives `error`; successful sources without highlights give `empty`; otherwise status is `ready`. Source errors remain in the payload. The digest is cached in process for five minutes and concurrent requests share one build. A new homepage refresh need not bypass that cache.

When changing digest calculations, check the corresponding ranking/record guide too. Digest snapshots and comparisons can intentionally differ from all-time boards.

## Group statistics (`/stats`)

The server sends eligible performance rows and hero/player options. It excludes aggregate-hidden players and games of 15 minutes or less. The browser applies player, hero, position, date/patch, result, ranked/unranked/other and smurf filters. Defaults are all time, all roles, both results, all lobby categories, no smurfs. Clear restores these defaults.

Filtered views include sortable player/hero statistics, role and duration analysis, and a stack chemistry matrix. Duration buckets are five minutes. Individual metrics use appearance rows; team context uses match/side groupings. Selecting several players here includes selected-player rows, unlike the match explorer's requirement that every selected person occur in a qualifying game. Do not copy filter semantics between the two pages without an intentional behavior change.

Sources: `src/routes/stats/+page.server.ts`, `+page.svelte`, `StackChemistryMatrix.svelte`, `src/lib/components/stats/DashboardSortableTable.svelte`.

## Comparison (`/comparison`)

Users select players and compare cards side by side, filtering roles, one hero, rolling date/patch, ranked/unranked and smurf inclusion. Initially no players are selected, all roles and dates are allowed, both lobbies are enabled and smurfs are off. The page requests `/api/stats/[id]` for selected players. Cards include result totals, averages, role distribution, most-played heroes and versatility. Keep selected player identity attached to returned metrics when changing asynchronous fetching.

This endpoint uses a different request shape from match filters: JSON-encoded `roles`, `lobby`, `time`, `hero`, `smurf`, plus optional `dateRange`. The page is the reference caller. Source: `src/routes/comparison/+page.svelte`, `src/routes/api/stats/[id]/+server.ts`, `getPlayerStats` in `db-functions.ts`.

## Other pages

`/2024-shareholder-report` is a historical report, with personal reports, individual/match records, yearly team selections, stack summaries and ticker graphics. Its route folder, `src/lib/data/reportData.ts` and `getTOTWCounts` contain report-specific data and logic. Do not treat its year-specific assumptions as current dashboard defaults.

`/about` explains the product. `/leaderboard` currently renders “Page Under Development”; active rankings are provided by heroes and roles instead.

## Verification when changing these features

Check empty and populated panels, failed refreshes, background/foreground refresh, selected-player clearing, filters and reset, and appearance-versus-game totals. For digest changes, cover partial/error/empty states and cache effects. Live data/provider checks require configured services; distinguish them from static or unit checks in the change summary.
