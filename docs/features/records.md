# Group and profile records

## Group boards (`/records`)

The page loader and `/api/records` share `parseRecordsSearchParams` and `getRecordSets`. Initial results are server-loaded; subsequent filter requests use the API. Defaults are all five roles, ranked/unranked lobbies 7 and 0, the last 365 days, all heroes (`-1`), and no smurfs. Categories group the presentation into highlights, economy, damage, notorious and runs.

| URL parameter | Meaning                                                |
| ------------- | ------------------------------------------------------ |
| `roles`       | JSON array from 1–5                                    |
| `lobby`       | JSON array from 0 and 7                                |
| `dateRange`   | Shared rolling preset, `all`, or major `patch-VERSION` |
| `hero`        | One hero ID; `-1` for all                              |
| `smurf`       | `true` to include alternate accounts                   |

Malformed/empty allowed-number arrays revert to defaults; valid arrays are deduplicated. Unsupported date values revert to the last-365-days default. The response is `{ records, playerMatchCount }`. A record set contains its stable key, category, display format and entries; entries retain person, hero, match and optional participants/streak context. `playerMatchCount` is the eligible performance population, not a promise of distinct games.

Sources: `src/lib/records.ts`, `src/lib/server/records.ts`, `src/routes/records/+page.server.ts`, `+page.svelte`, `RecordHeroPicker.svelte`, `src/routes/api/records/+server.ts`.

## Record types

Standard query boards return up to ten entries for kills, assists, highest impact, last hits, GPM, XPM, building damage, hero damage, deaths, lowest impact and least hero damage. Null metric records are removed. The queries live in `src/lib/server/db-functions.ts`.

Additional records use `src/lib/server/additional-records.ts` and pure calculations in `src/lib/record-calculations.ts`:

- Highest damage per minute and KDA use individual performance rows. DPM converts duration seconds to minutes; missing damage is excluded.
- Longest games are match-level records. A qualifying appearance admits a game; the displayed lineup can include other tracked participants, including smurfs even when smurfs did not qualify it. Aggregate-hidden players remain excluded from that lineup.
- Longest winning/losing streaks preserve chronological runs per account. Invalid outcomes and appearances excluded by the role/hero/lobby/mode/duration filters break runs; runs of only one game are omitted. Additional-record eligibility requires All Pick and duration greater than 900 seconds. Do not concatenate different accounts owned by one person into one streak.

Duration and eligibility rules live in the individual calculation/query paths, not a single universal “record match” filter. Null metrics, zero deaths, match deduplication and run boundaries have behavioral coverage in `src/lib/record-calculations.test.ts`.

## Dates and failures

Patch selections use shared patch bounds. Rolling record windows subtract from the current timestamp, rather than always rounding to midnight. `all` uses unbounded start/end. The records API converts failures into a 500 JSON message, “Records could not be loaded. Please try again.” Keep errors distinguishable from successful empty boards.

## Profile records

The profile Records tab uses `getPlayerRecords` and `ProfileRecords.svelte`, with its own client-side role, hero, teammate, category and date filters. It does not simply call the group records API with a person parameter. Changes intended to affect both surfaces must check both implementations and their populations. See [Players](players.md).

## Verification when changing records

Use `bun test src/lib/record-calculations.test.ts` for pure calculations. Also check default/reset filters, malformed URL values, empty records, missing damage, longest-game lineups, a streak interrupted by a loss or account change, and match links retaining sequence/player context. Validate live SQL separately when database queries change.
