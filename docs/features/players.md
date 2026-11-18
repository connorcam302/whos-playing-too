# Player profiles

## Identity and loading

`/player/[id]` addresses a tracked person, not a Steam account. The server resolves the person and their linked accounts; invalid or missing people produce 404. Steam summaries supply the main-account identity and smurf details. Steam requests abort after 2.5 seconds and fall back to empty data; missing smurf summaries fall back to stored account information.

Many supporting profile queries use a timeout wrapper that returns empty/zero values after 2.5 seconds or on failure; hero rankings and ownership changes allow five seconds. These fallbacks keep a profile usable, but an empty panel can mean a timeout rather than no historical games. The wrapper does not cancel the underlying database query. Profile records use a rejection fallback instead of the same timeout wrapper.

Sources: `src/routes/player/[id]/+page.server.ts`, `+page.svelte`, `ProfileBanner.svelte`, and person/account helpers in `src/lib/server/db-functions.ts`.

## Tabs and state

The URL `tab` supports `home`, `matches`, `stats`, `heroes`, `ownership`, `records` and `teammates`. Home is the default and removes the parameter. The older `hero-pool` value maps to Heroes. Tab navigation preserves other query parameters. Most tab filters are owned by their individual components; do not assume every filter is encoded in the profile URL.

| Tab       | Behavior                                                              | Main component            |
| --------- | --------------------------------------------------------------------- | ------------------------- |
| Home      | Recent/all-time results, activity and featured hero context           | `ProfileHome.svelte`      |
| Matches   | Filterable paginated stored history and summary statistics            | `ProfileMatches.svelte`   |
| Stats     | Averages, role counts, grade distribution and win/loss by game length | `ProfileStats.svelte`     |
| Heroes    | Hero pool and player hero-performance summaries                       | `ProfileHeroes.svelte`    |
| Ownership | Hero/core-support standing, leaders and calibration progress          | `ProfileOwnership.svelte` |
| Records   | Person-specific performance, match and run records                    | `ProfileRecords.svelte`   |
| Teammates | Shared match results with other tracked people                        | `ProfileTeammates.svelte` |

## Time windows and hero pool

The loader requests recent result/average/chart data over 31 days, all-time-style data with larger offsets, and twelve months of activity. These are helper-specific windows, not a single global profile time filter. The featured hero is selected from recent hero stats by `avgImpact * matches`.

The hero-pool query parameter `pool` accepts 100, 200, 500 or 1000 recent matches, default 500; other values fall back to 500. Recent pool data, all-time hero stats and hero ownership standings are separate datasets. Ownership rankings combine main and linked smurf account contributions through shared ranking helpers.

Ownership change data requests a twenty-match comparison window and retains changes involving this person as current or previous owner. See [Rankings](rankings.md) for calibration, core/support grouping and comparison semantics.

## Records and teammates

Profile records are computed from the person's loaded record history and filtered in the browser. They support category, roles, hero(s), teammates and date/patch. Multiple selected teammates use an “any selected teammate” check in the record component. This is a separate flow from the global records API and the global match explorer's all-selected-player requirement.

Teammate data comes from `getPlayerTeammateStats`; preserve same-side/opponent definitions in that helper when extending the UI. Do not equate simply sharing a match with playing together on one side.

The compact current-player overview on Home is another data flow: fourteen-day summaries and a latest match, rather than the profile's 31-day recent panels. See [Dashboards](dashboards.md).

## Verification when changing this feature

Check a known person, nonexistent ID, multiple linked accounts, missing Steam summaries, timed-out panels, empty history, profile tab links, old `hero-pool` links and each pool limit. For filters, confirm the intended teammate semantics and account inclusion. Profile totals and group rankings can legitimately differ due to visibility, smurfs, duration and time windows.
