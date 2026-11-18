# Match explorer, modal and full analysis

## Stored explorer (`/matches`)

The loader supplies player/hero options; the browser calls `/api/matches/all` for data. Defaults: all players/heroes/roles/dates, ranked and unranked All Pick plus Other, wins and losses, no smurfs, versus off. Standard filter changes fetch automatically; advanced query edits take effect when run. Clear resets filters and query. Responses from older requests cannot replace a newer fetch.

Filters and the applied query are written into the URL with `replaceState`, allowing a link to restore the view on mount. API page numbers are zero-based; visible page numbers are one-based. Pages contain up to ten unique games. The response is `{ matches, stats, totalMatches }`; stats cover the full qualifying result set, not just the visible page. There is compatibility handling for older array responses in the UI.

| Parameter                    | Encoding / meaning                                            |
| ---------------------------- | ------------------------------------------------------------- |
| `players`, `heroes`, `roles` | JSON arrays of numeric IDs; omit to use defaults              |
| `dateRange`                  | Shared preset, `all`, or `patch-VERSION`                      |
| `gameMode`                   | JSON array of `ranked-all-pick`, `unranked-all-pick`, `other` |
| `results`                    | JSON array of `wins`, `losses`                                |
| `smurf`, `versus`            | Boolean text                                                  |
| `page`                       | Nonnegative safe integer, zero-based                          |
| `query`                      | Validated JSON query described below                          |

Each selected player must appear among the rows satisfying the other filters in a qualifying match. Multiple player selection alone does not require one side. With versus enabled, multiple selected players must span both sides. For one selected person, versus requires another tracked person on the opposing side, subject to account inclusion. With no selected person, versus requires qualifying rows on both sides.

Match counts are distinct game IDs; appearances, wins/losses and performance averages use qualifying tracked rows. A game containing both sides can contribute a win and a loss. Blocks include additional tracked-player context beyond the qualifying rows. Qualification, pagination and block rendering are separate steps; rendering currently drops games of 900 seconds or less, so do not assume a short page proves the distinct count is wrong. Blocks are sorted by match end time within the fetched page.

Sources: `src/routes/matches/+page.svelte`, `src/routes/api/matches/all/+server.ts`, `src/lib/components/match/MatchBlock.svelte`.

## Advanced query builder

`src/lib/match-query.ts` owns field definitions and validation; `src/lib/server/match-query.ts` compiles parameterized Drizzle conditions. `MatchQueryBuilder.svelte` and `MatchQueryGroup.svelte` render the editor.

A query has `{ mode: 'all' | 'any', conditions, groups? }`. Conditions have `{ field, operator, value, join? }`; additional groups have their own conditions/mode and an optional group join. Limits are eight player groups total and twenty conditions total. Additional groups must be nonempty and require a nonempty first group. Unsupported fields, operators and values are rejected; the endpoint reports invalid advanced queries as 400 responses.

Conditions within one player group apply to one tracked performance row. Additional player groups use correlated match-level existence checks, allowing different participants to satisfy them; groups do not require distinct people unless the conditions enforce that. AND binds more tightly than OR; groups provide parentheses. `mode` supplies default connectors when explicit joins are absent.

Fields cover match ID, duration, UTC date, game/lobby IDs, hero, person, account ID, side, K/D/A, KDA, impact, farm, damage, level, facet and final items/upgrades. Duration comparisons use minutes. KDA is `(kills + assists) / max(deaths, 1)`. Date equality compares the UTC day. Item checks search inventory, backpack and neutral slots, not a purchase timeline. Item “missing” treats both null and zero as empty; other missing/present fields use SQL null checks. A `player` is the internal person; `playerId` is the Dota account ID.

Operators are equality/inequality, numeric comparisons and missing/present where supported. Date validation rejects impossible calendar days. Most numeric fields require whole numbers; duration and KDA allow fractions. Keep UI definitions, parser and SQL compiler aligned when adding a field. Existing regressions: `tests/match-query.test.ts`.

## Stored profile match lists

`/api/matches/all/profile/[id]` supplies a person's paginated history and profile-focused statistics. The caller is `ProfileMatches.svelte`; it supports role, hero, teammate, date/patch, result, lobby and smurf filters. Do not substitute the global endpoint without checking the person and teammate rules. Both endpoints enrich blocks with hero score history; match chips/deltas can depend on earlier games outside the current filter window.

## Match modal and role correction

`src/lib/components/match/MatchModal.svelte` opens contextual match detail without leaving the current list. `/api/matches/[id]` fetches Steam match details, resolves local tracked accounts and hero/items, infers positions and calculates original impact. A separate sequence endpoint supports sequence-number retrieval. This is distinct from STRATZ analysis.

The role-edit action posts `{ roleData, sequenceNum }` to `/api/matches/[id]/set-roles`. Changed role entries identify hero and role. The handler reloads Steam details, falls back to sequence history and updates stored role and original impact for matching match/hero rows. It does not update the scraper's inference logic or beta calibration. Currently updates run inside async `forEach`, so the “Done” response does not guarantee all writes have completed. Document this limitation when investigating stale role-dependent displays.

## Full analysis (`/match/[id]`)

The page loads a normalized STRATZ overview, with tabs for Overview, Players, Timeline, Economy and Combat. `tab` and selected player `slot` are URL state. Timeline/economy/combat load only when needed through `/api/matches/[id]/stratz/[section]`, with independent loading, error and retry state. Repeated tab visits reuse loaded section data unless a retry forces loading.

The overview includes scoreboard, tracked identities, player/role context and graph data; detailed tabs add events, economy/farm and damage breakdowns. Partial/unprocessed matches may lack advanced data. Invalid IDs get an explicit error payload; provider failures are normalized into titles/messages and retry capability. The page loader returns errors as page data, so an error panel does not necessarily imply an HTTP error document.

`src/lib/server/stratz.ts` owns GraphQL requests, identity/asset normalization, provider errors and process-local promise caching. Ready overviews and sections cache for 24 hours; processing overviews cache for one minute. HTTP cache headers are shorter: ready pages/sections five minutes, processing pages thirty seconds. `STRATZ_KEY` is required. API section names are limited to timeline/economy/combat; invalid IDs return 400 and unknown sections 404.

Player-weight panels use historical stack analysis through `/api/matches/[id]/player-weights`; see [Stack analysis](stack-analysis.md). These estimates are separate from STRATZ's match outcome analysis.

## Verification when changing this feature

Exercise shareable filters, page reset, rapid requests, zero matches, smurf/versus combinations, cross-player advanced groups, null stats and inventory checks. For full analysis, verify invalid IDs, unavailable/processing data, section retries and URL-selected player/tab restoration. Role edits require a configured database and external API and modify stored data; unit tests alone do not verify that flow.
