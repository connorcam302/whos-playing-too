# Feature documentation

Start here before investigating a feature. These guides describe the implemented site, its data rules, failure modes, and the files responsible for behavior. Read the relevant guide first, then inspect the specific implementation you need to change. Documentation reduces broad code discovery; it does not replace checking the code being edited.

Baseline reviewed against the working tree on **21 October 2026**, including existing uncommitted changes. This is an implementation reference, not a record of production deployment or a live database audit.

## Choose a guide

| Area                            | Guide                                         | Covers                                                                       |
| ------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| Architecture and shared rules   | [Architecture](architecture.md)               | Accounts, stored data, providers, visibility, preferences, assets            |
| Home and analytics              | [Dashboards](features/dashboards.md)          | Recent games, refresh, weekly digest, awards, group stats, comparison        |
| Match browsing and analysis     | [Matches](features/matches.md)                | Filters, query builder, pagination, modal, full analysis, role edits         |
| Player profiles                 | [Players](features/players.md)                | Tabs, overview, accounts, hero pool, ownership, records, teammates           |
| Hero and role rankings          | [Rankings](features/rankings.md)              | Hero score, calibration, ownership, history, monthly roles, MMR, diagnostics |
| Records                         | [Records](features/records.md)                | Categories, defaults, URL filters, match versus performance records, streaks |
| Stack builder                   | [Stack analysis](features/stack-analysis.md)  | Draft slots, recommendations, estimates, player weights                      |
| Impact beta                     | [Existing beta specification](impact-beta.md) | Opt-in score, formulas, coverage, calibration, backtest                      |
| Development and troubleshooting | [Development](development.md)                 | Runtime, configuration, checks, API map, known limitations                   |

## Route inventory

| Route                      | Behavior                                           | Guide          |
| -------------------------- | -------------------------------------------------- | -------------- |
| `/`                        | Group dashboard and current-player overview        | Dashboards     |
| `/matches`                 | Stored match explorer                              | Matches        |
| `/match/[id]`              | STRATZ match analysis                              | Matches        |
| `/player/[id]`             | Tracked person's profile                           | Players        |
| `/stats`                   | Filtered group analytics and stack chemistry       | Dashboards     |
| `/comparison`              | Selected players side by side                      | Dashboards     |
| `/heroes`                  | Hero summaries and ownership                       | Rankings       |
| `/heroes/[id]`             | Hero detail, rankings, records and history         | Rankings       |
| `/heroes/mmr`              | Experimental role-based MMR table                  | Rankings       |
| `/heroes/diagnostics`      | Hero-score analysis and configuration comparison   | Rankings       |
| `/roles`                   | Monthly position rankings                          | Rankings       |
| `/records`                 | Group record boards                                | Records        |
| `/stack-analysis`          | Select players, roles and heroes for a draft       | Stack analysis |
| `/2024-shareholder-report` | Historical report with group and personal sections | Dashboards     |
| `/about`                   | Product explanation                                | Dashboards     |
| `/leaderboard`             | Under-development placeholder                      | Dashboards     |

## Maintaining this reference

The root [AGENTS.md](../AGENTS.md) requires documentation updates in the same task as relevant implementation changes, without waiting for a separate user request. Update the existing guide rather than adding competing explanations. Add new feature guides and route entries here when needed. Keep calculation details in one canonical guide and link to them elsewhere.

Document behavior, defaults, filters, data dependencies, edge cases, responsible source files and useful verification. Distinguish implemented behavior from a proposal, a known limitation or an external service's behavior. Never paste credentials, private database contents or environment values into these guides.
