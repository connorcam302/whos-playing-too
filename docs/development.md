# Development, APIs and troubleshooting

## Runtime and configuration

The repository uses Svelte 5, SvelteKit 2, TypeScript, Tailwind 4, Drizzle, PostgreSQL and the Node adapter. Bun is used by the lockfile, scripts and Docker build. Read `PRODUCT.md` and `DESIGN.md` for UI work and root `AGENTS.md` for code/documentation rules.

Install with `bun install --frozen-lockfile`. Copy `.env.sample` to `.env` when setting up a new checkout and populate configuration locally; never overwrite an existing environment or include its values in documentation. The private runtime database connection reads `DATABASE_URL`; Steam requests use `STEAM_KEY`; rich match analysis uses `STRATZ_KEY`. The Dockerfile also declares `BASE_URL`; inspect a consumer before assuming it controls framework origin handling. The external scraper has its own deployment/configuration.

`bun run dev` starts Vite (normally port 5173); `bun run build` generates the Node server; `bun run preview` serves the local production preview. Docker exposes port 3000 and runs `bun build/index.js`. Database-backed pages need access to the configured database; a successful build alone does not verify those pages.

## Checks

| Command                                        | Purpose                                          |
| ---------------------------------------------- | ------------------------------------------------ |
| `bun run check`                                | SvelteKit sync and Svelte/TypeScript diagnostics |
| `bun run build`                                | Production bundle                                |
| `bun run lint`                                 | Repository-wide Prettier and ESLint checks       |
| `bun test tests/match-query.test.ts`           | Query validation, joins and SQL generation       |
| `bun test src/lib/server/heroStats.test.ts`    | Hero rankings and score-history behavior         |
| `bun test src/lib/record-calculations.test.ts` | Pure record calculations                         |
| `bun test src/lib/impact-beta.test.ts`         | Beta scoring behavior                            |

There is no package-level `test` script. Run relevant tests directly. Broad checks may include existing failures; report the actual outcome and distinguish pre-existing issues rather than silently changing unrelated files. For documentation-only edits, check formatting, local links, route coverage and agreement with source; running the app is unnecessary unless behavior itself is uncertain.

`bun run format` rewrites the whole repository: prefer invoking local Prettier with an explicit changed-file list. `bun run db:pull` introspects the configured database; it is not a migration command. `build-items` and `build-heroes` fetch reference data and write mappings/database data, so they are maintenance operations, not harmless validation. `bun src/scripts/backtestImpact.ts` reads historical data and writes reports; use `--calibrate` only when intentionally fitting a new calibration. See [beta specification](impact-beta.md).

## Dota patch reference refresh

See the [patch reference refresh workflow](dota-patch-updates.md) for commands, upstream sources, database synchronization, limitations and verification.

## API map

These are application endpoints, not a versioned external API. Route file names below are relative to `src/routes/api`.

| Method and path                          | Purpose / caller                                         |
| ---------------------------------------- | -------------------------------------------------------- |
| GET `/api/matches/latest`                | Newest stored match ID; no-store homepage refresh probe  |
| GET `/api/matches/recent`                | Recent tracked match blocks; no-store                    |
| GET `/api/matches/all`                   | Global explorer, full filtered stats and ten-game pages  |
| GET `/api/matches/all/profile/[id]`      | Person's filtered history and stats                      |
| GET `/api/matches/[id]`                  | Steam modal details, inferred positions, original impact |
| GET `/api/matches/sequence/[id]`         | Steam sequence-based match retrieval                     |
| POST `/api/matches/[id]/set-roles`       | Persist role corrections and recomputed impact           |
| GET `/api/matches/[id]/player-weights`   | Historical stack/player estimate context                 |
| GET `/api/matches/[id]/stratz/[section]` | Lazy timeline/economy/combat data                        |
| POST `/api/matches/list`                 | Resolve weekly award references for a person             |
| GET `/api/player/[id]/overview`          | Fourteen-day overview plus latest appearance; no-store   |
| GET `/api/stats/[id]`                    | Filtered comparison/profile statistics                   |
| GET `/api/records`                       | Group record sets with normalized filters                |
| GET `/api/item/[id]`                     | Item detail lookup                                       |

For request semantics and response shapes, start with the relevant [feature guide](README.md), then its route and caller. Not all endpoints validate JSON arrays equally; do not claim malformed filter handling is uniform.

## Troubleshooting map

| Symptom                               | First things to inspect                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Match absent from site                | External scraper, linked accounts, stored match rows, then feature-specific eligibility         |
| Hero/profile/group numbers differ     | Person versus account IDs, smurfs, visibility, time windows, duration, appearances versus games |
| Home appears stale                    | Latest-ID comparison, tab visibility, refresh errors, five-minute digest cache                  |
| Profile panel unexpectedly empty      | Timeout/fallback path, not just underlying record count                                         |
| Full analysis fails while modal works | STRATZ configuration/provider status versus Steam; independent pipelines                        |
| Advanced tab is empty                 | Unprocessed/partial provider data, lazy section request and error state                         |
| Corrected role still looks old        | Unawaited role updates, cached analysis, and which provider supplies the display                |
| New hero/item missing                 | Static mappings versus database references and generated assets                                 |
| Ownership differs from raw win rate   | Calibration, core/support grouping, score components and comparison window                      |

## Boundaries and known limitations

The root source tree does not implement a site-wide login/session authorization system. Choosing a current player is a local preference. Aggregate visibility is not access control. Do not describe role correction as authenticated administrative behavior without adding and verifying that mechanism.

In-process caches are per server instance and reset on restart. New ingested data does not automatically invalidate every computed cache. HTTP cache lifetimes can differ from internal cache lifetimes, especially STRATZ. Steam modal roles and STRATZ positions can differ; richer live optional metrics can also produce a different beta score from an older stored appearance.

These docs describe the reviewed implementation. External scheduling, actual deployed environment, database contents, provider availability and production configuration require separate verification when relevant.
