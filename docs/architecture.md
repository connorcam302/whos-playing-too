# Architecture and shared behavior

## Data flow

The SvelteKit application reads a PostgreSQL database through Drizzle and `postgres`. A separate Bun scraper, scheduled through Dokploy, imports tracked account matches from Steam, with OpenDota as an alternative provider. Its ingestion and scheduling logic lives outside this repository; see the scraper link in the root README. Do not assume changing a web query changes ingestion.

Stored lists and analytics use database rows. The match modal fetches detailed Steam data. The dedicated match page uses STRATZ GraphQL for richer analysis and joins tracked account identities from the local database. These sources can have different coverage, role assignments and update times.

The production adapter is `@sveltejs/adapter-node`; the Docker image installs with Bun and runs `build/index.js`. Pages combine server loaders with client-side filtering or API requests. There is no single global analytics query or filter store.

## Identity and tables

Source: `src/lib/server/schema.ts`.

| Table                                  | Meaning                                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `players`                              | A tracked person, identified by internal player ID and username                                      |
| `accounts`                             | Dota account ID, linked to a person through `owner`; `smurf` distinguishes alternate accounts        |
| `matches`                              | One game: ID, start timestamp, duration, winning side, lobby, game mode and optional sequence number |
| `match_data`                           | One tracked account's performance in a game; account/match pair is unique                            |
| `heroes`, `items`                      | Asset/reference data used by joins and displays                                                      |
| `team_of_the_week`, `flop_of_the_week` | Stored weekly award selections by position, player, hero and match                                   |

`match_data.playerId` refers to **accounts.accountId**, not `players.id`. Resolve a person through accounts before applying a person filter. Steam summary requests convert account IDs to Steam64 using the offset `76561197960265728`.

A stored game can contain several tracked players. Counting `match_data` rows measures appearances; counting distinct match IDs measures games. Team-side analytics often deduplicate by `(matchId, team)`. A person wins when their row's `team` equals the match's `winner`. Start timestamps and durations are seconds; browser dates use milliseconds.

## Eligibility and visibility

`src/lib/server/visibility-config.ts` excludes player IDs 18 and 14 from aggregate surfaces while retaining profiles and match appearances. `getPlayers()` defaults to excluding them; callers needing full identity selection use `includeHiddenFromAggregates: true`. Match listings intentionally include these players. Changing visibility requires checking each aggregate loader and query; this is not an authorization or privacy boundary.

Many ranking and statistics loaders require duration **greater than 900 seconds**. This is not a universal application rule: records, overview queries and list qualification can use different populations. Match list qualification and block rendering also apply rules at different stages. Check the relevant feature before reconciling totals.

Smurf behavior is feature-specific. Match and record filters normally exclude smurfs until enabled. Hero-score rankings always remove smurf rows inside the ranking helper. Some summary totals and stack evidence include alternate-account appearances. Do not apply a global exclusion and assume existing totals remain equivalent.

Ranked All Pick is game mode 22, lobby 7; unranked All Pick is mode 22, lobby 0. The match explorer and group stats place other combinations in “Other.” Some older endpoints support only lobbies 0 and 7.

## Navigation, preferences and shared UI

The layout loads a full tracked-player list and sorted database hero list. Navbar variants handle desktop/mobile navigation; `SearchBox.svelte` and current-player controls link into profiles and match workflows. `FilterPanel.svelte` provides shared presentation, not a shared query implementation. Domain-specific components live under `src/lib/components`; generic UI primitives are under `components/ui`.

`src/lib/current-player.ts` stores an optional internal player ID in local storage under `whos-playing:current-player`. Initialization validates it against known IDs; clearing removes it. This is a browser preference, not sign-in. `PlayerOverview.svelte` consumes the selected player through the overview API.

`src/lib/impact-preference.ts` stores `whos-playing:show-beta-impact`, default false, with cross-tab storage synchronization. It changes individual match chips to beta impact without changing stored scores or analytics. See [impact beta](impact-beta.md). Original scoring helpers and grade mapping live in `src/lib/functions.ts`; beta calculations live in `src/lib/impact-beta.ts`.

Patch labels and date bounds come from `src/lib/data/dotaPatchRanges.ts`. Rolling date windows are not identical everywhere: some list/stat filters round to start of day, records use the current rolling timestamp, monthly role rankings use UTC calendar boundaries, and the digest uses rolling seven-day windows. Preserve those distinctions or document deliberate changes.

Static hero, item, ability and facet mappings live in `src/lib/data`. Database hero lists and static maps coexist. A new Dota asset can therefore require updates in multiple places. See the [patch reference refresh workflow](dota-patch-updates.md) for generators, upstream sources, database synchronization and patch-date maintenance. Follow `PRODUCT.md` and `DESIGN.md` for product and visual conventions.

## Files to start with

- `src/lib/server/database.ts`, `schema.ts`, `db-functions.ts`: database connection, model and older shared queries.
- `src/routes/+layout.server.ts`, `+layout.svelte`: shared data and shell.
- `src/lib/server/stratz.ts`: external match analysis and normalization.
- `src/lib/data/dotaPatchRanges.ts`, `src/lib/functions.ts`: shared dates, labels and original impact behavior.

For setup, API entry points and operational limitations, see [Development](development.md).
