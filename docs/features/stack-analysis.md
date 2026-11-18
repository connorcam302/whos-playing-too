# Stack analysis and draft recommendations

## Builder (`/stack-analysis`)

Users choose up to five tracked players and draft roles/heroes. The client derives picks, recommendations and an estimate from server-loaded historical rows. Duplicate selected heroes are detected in the page. This is analysis of the tracked group's history; it does not fetch an opponent's draft or the full global Dota population.

The server loads games longer than 900 seconds and excludes aggregate-hidden players. It attaches person/hero/position scores from the hero-score engine, including uncalibrated rankings. Historical evidence rows can include smurf appearances; assigned hero scores themselves use the [shared hero-score eligibility rules](rankings.md#hero-score-rules): ranked and unranked games and linked smurf account appearances all count when their required beta inputs are available. Role scores use per-match beta impact. Data is cached in process for five minutes, with in-flight requests shared.

Sources: `src/routes/stack-analysis/+page.server.ts`, `+page.svelte`, `src/lib/server/stack-analysis.ts`, `src/lib/stack-analysis.ts`.

## Samples and recommendations

Evidence is grouped into `(matchId, team)` sides so a tracked stack is not counted once per participant when measuring team outcomes. Small samples blend toward the group's baseline win rate using sample confidence; empty samples fall back to baseline.

Candidates start with a person's heroes played in the selected position, adding their other heroes if needed. Already selected allied heroes are removed. Recommendation score weights are 60% player/hero/role score, 20% teammate history and 20% allied-hero history. Missing role scores fall back to a confidence-adjusted role win rate. Teammate and allied-hero samples blend toward baseline too.

Results sort by score, then role match count and total matches. The returned list can include a marked worst pick in addition to the best recommendations, so do not present every entry as an equally recommended choice. Reasons show available evidence such as games alongside picks, with the lobby, in position or on the comfort hero. Recommendation caches are tied to the historical row-array identity and draft arguments.

## Stack estimate

`getStackEstimate` combines evidence with these current weights:

| Evidence            | Weight | Behavior                                                                  |
| ------------------- | -----: | ------------------------------------------------------------------------- |
| Group baseline      |      1 | All historical tracked sides                                              |
| Stack history       |    1.6 | At least two selected people on the same historical side                  |
| Exact draft         |    1.4 | Same selected people, roles and selected heroes; only when history exists |
| Player hero comfort |    1.5 | Selected people on their chosen heroes                                    |
| Role fit            |      1 | Each selected person's position history                                   |
| Hero role form      |    0.8 | Selected heroes in their positions across the group                       |
| Recent player form  |    0.7 | Last sixty days for selected people                                       |

Unavailable evidence receives zero weight. Component win rates are shrunk toward baseline with their own sample targets before the weighted mean. Output is clamped to 5–95%. Confidence reflects stack games, exact drafts, hero evidence and completed slots, clamped to 0.1–1. It is a heuristic evidence indicator, not a validated probability interval. The output includes baseline, delta, historical stack/exact-draft counts and component explanations.

## Player weights and match integration

`getPlayerContributions` explains each selected slot using hero comfort, position and sixty-day form. Components blend toward group baseline, and available components are averaged. These are historical contributions to the estimate, not a causal measure of one player's effect on a match.

`getMatchPlayerWeightGroups` builds comparable groups for match teams. `/api/matches/[id]/player-weights` resolves locally tracked match participants and combines them with cached historical rows. Its HTTP cache is five minutes with an additional ten-minute stale-while-revalidate window. Shared UI lives in `components/stack-analysis/{PlayerWeightSection,MatchAnalysisBanner}.svelte`.

## Verification when changing this feature

Check an empty/partial/full draft, duplicate heroes, no history, sparse history, existing teammate pairs, role changes, recommendation worst-pick labeling, bounds and explanation totals. Confirm team-side sample counts do not grow merely because more tracked participants share a side. Changing the shared estimator can affect match panels as well as the standalone builder.
