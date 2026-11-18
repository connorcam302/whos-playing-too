# Hero scores, ownership and role rankings

## Hero surfaces

`/heroes` loads hero summaries and tracked performance rows for games longer than 900 seconds, excluding aggregate-hidden people. It builds core/support rankings per hero, flattens them to identify top players, and shows ownership changes. Hero totals and score rankings include linked main and smurf account appearances. Heroes sort by best score, then match volume and name.

`/heroes/[id]` validates the database hero and loads its eligible history, summary, recent ten-row form, player rankings, core/support rankings, five-position breakdown, five-minute duration bands and performance records. Missing heroes return 404. General hero summaries and records still use stored original impact; ranking impact averages use beta and are labelled accordingly. Its “most played” player is selected from calibrated player rankings, not an unrestricted count of every appearance. Hero summary samples and score-eligible samples need not match.

Sources: `src/routes/heroes/+page.server.ts`, `src/routes/heroes/[id]/+page.server.ts`, their Svelte pages, `OwnershipChanges.svelte`, `OwnershipInfographics.svelte`, `src/lib/components/heroes/HeroScoreComparisonDialog.svelte`.

## Hero score rules

`src/lib/server/heroStats.ts` aggregates eligible history; `src/lib/heroScores.ts` owns the configuration and score breakdown. A hero score measures performance in tracked history, not official Dota MMR. The impact input is beta 3.3, recalculated from stored per-match stats by `src/lib/heroScoreImpact.ts` and `src/lib/impact-beta.ts`. This is independent of the browser setting for beta match chips; stored original impact is not rewritten. Rankings, ownership, monthly roles, digest hero-score snapshots, stack role scores, score history badges and diagnostics all use this input.

- Beta inputs include the actual hero ID (for farming exceptions), position, duration, K/D/A, last hits, hero damage and tower damage. Missing optional damage fields retain beta's missing-data behavior; stored healing is unavailable. Games with invalid required beta inputs are omitted from scoring and calibration, including core games without last hits. Supports do not require last hits.
- Ranked and unranked games both count. Linked main and smurf account appearances are combined per player; having a smurf on the same team does not exclude a game.
- Default published rankings require at least **10 actual matches**. Callers can explicitly include uncalibrated players, for example calibration displays and monthly roles.
- The win-rate, form, KDA and volume formulas and fixed group priors are unchanged. Core groups positions 1–3; support groups positions 4–5. Shared helpers produce a ranking for each group.
- Historic metric evidence uses recency weights with a four-year half-life. Historical and recent performance blend 70/30; the recent performance window is twenty matches. Recent result form is tracked separately.
- Current component weights: win rate 30%, recent form 10%, impact 25%, KDA 15%, volume 20%. Recent form regresses halfway toward 50%.
- Performance sample weight is `min(1, log(matches + 1) / log(25))`; volume scales logarithmically to full volume at 500 matches.
- Impact and KDA normalize against core/support priors, then scale against impact 150 and KDA 6, capped at 100 component points. Component contributions are multiplied by ten, giving the nominal 0–1000 score scale.
- The current breakdown sums performance and volume and rounds the result. Several retained configuration fields/helpers describe earlier or experimental mechanisms: effective-match uncertainty, spread, centering and performance pulse currently contribute zero in `getHeroScoreBreakdown`. Do not infer active behavior from a constant name alone.

KDA aggregation uses `(kills + assists) / deaths`, with zero deaths returning kills plus assists. Current helper output includes component contributions and adjusted metrics to explain a score. Treat these as part of the UI contract when modifying calculations.

## History and score changes

`getPlayerHeroScoreHistory` replays score-eligible rows chronologically per hero and score group and returns per-match before/after scores and component changes. Match endpoints attach this to appearances. Preserve chronological ordering and hero/group isolation; filtering the displayed list must not turn a later match into the person's first historical game.

The heroes index's latest-game score delta recomputes the current leader without the latest tracked match for that hero/group. It follows that same player rather than comparing two different leaders. It can be null when the prior ranking is unavailable. A latest-game delta is different from a full-period ownership change.

## Ownership changes

`src/lib/server/heroOwnershipChanges.ts` compares current eligible rankings against history with the most recent distinct tracked match IDs removed. Default window: five games across the group, not five games per hero or person. Profiles request twenty. It loads score-eligible appearances from games longer than 900 seconds and excludes aggregate-hidden people. Ranked and unranked games, including smurf appearances, are included in the recent match window.

Rankings from both score groups are flattened and sorted. Best ownership is the highest qualifying player/group; worst ownership is the lowest. Ownership identity includes **both person and score group**. The same person moving from core to support can therefore register a change. A missing previous owner produces `new`, otherwise `changed`; unchanged person/group pairs are omitted. A player disappearing below calibration can affect ownership.

The digest has its own time-based hero change snapshots. Do not replace those with the recent-match-window feed without changing its documented meaning.

## Monthly positions (`/roles`)

The route ranks positions 1–5 using the same score engine within UTC calendar months, across heroes. `role` accepts 1–5 and defaults to 1. `month` selects an available `YYYY-MM` value and otherwise defaults to the latest available month. Eligible rows require duration greater than 900 seconds, a valid role and aggregate-visible player.

Rankings include uncalibrated players. Rank movement compares with the **previous available month**, which may skip an empty calendar month. Positive movement means the prior numerical rank minus the current numerical rank is positive. Each ranked player includes their most-played hero for that role/month, breaking count ties by wins then hero name.

Source: `src/routes/roles/+page.server.ts`, `+page.svelte`.

## Experimental MMR (`/heroes/mmr`)

The experimental MMR page produces rankings per hero and position. The loader groups rows by hero before running the position-ranking helper. It starts from 1000, calibrates over twenty games, and sets initial rating to `1000 + average(calibration changes) * 12`. Later matches add their change. A win gains 15–35 and a loss loses 15–35; impact around the neutral value 85 adjusts the magnitude around 25. Stronger impact increases win gains and reduces loss magnitude. Only players with twenty matches in that position appear. This helper's name does not mean the rating is official Steam MMR.

Sources: `src/lib/server/heroMmr.ts`, `src/routes/heroes/mmr/+page.server.ts`, `+page.svelte`. Account/visibility scope comes from the route loader; the MMR helper itself filters position and continues to use stored original impact.

## Diagnostics

`/heroes/diagnostics`, `src/lib/heroScoreEvaluation.ts` and the comparison dialog expose score evaluation/configuration comparisons. The diagnostics loader uses aggregate-visible players and duration greater than 900 seconds, recalculates beta impact with the same shared helper as the rankings, and streams a report promise with generation timing. Ranked and unranked games and linked smurf accounts are included. Changes to scoring should keep explanations, diagnostics, profile ownership, role boards, digest snapshots and match history aligned. See [Development](../development.md) for checks; verify formula changes with meaningful numerical regressions rather than relying only on page rendering.
