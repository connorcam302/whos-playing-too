# Impact beta 3.3

Enable **Show beta impact** in Settings to replace individual match rating chips
with beta grades. Hover, focus or tap the β tag to compare original and beta
scores. The main chip explains the beta contributions and data coverage. The
preference defaults to off and persists in this browser. Original stored scores,
rankings, filters, averages, awards and charts are unchanged.

## Changes

- **Survival:** replace standalone survival points with a multiplier on all
  earned contributions: `0.85 + 0.30 / (1 + deathRate × deathsPerMinute)`. It
  ranges from a 15% bonus to a penalty approaching 15%. It cannot create points
  on its own. Deaths affect farmers and objective-focused players even with no
  kill involvement. Original role-specific death-rate coefficients are retained.
- **Farming:** retain the original CS/min exponent (1.3) and hero exceptions,
  increasing its weight from 10% to 35% for carry, 5% to 25% for mid and 5% to
  20% for offlane. Supports still receive no direct farming credit.
- **Combat:** retain original kill/assist coefficients and combat weights.
  The blended baseline is `r²` up to weighted combat rate r = 1 and `2r − 1`
  above it. Add an exceptional contribution of `max(0, r − 1)²` at the original
  combat weight, outside the optional-metric blend. Together these restore the
  original quadratic curve when optional metrics are absent. Exceptional games
  keep accelerating; their extra combat reward is not diluted by available
  damage/healing fields. Role scaling and survival still apply.
  The breakdown shows this contribution separately.
- **Team participation:** disabled for every match. Team totals, whether present,
  missing or inferred from tracked teammates, never change the score. This avoids
  inconsistent treatment while full-team totals are not consistently stored and
  backfilled. Individual kills and assists continue to count normally.
- **Contributions beyond KDA:** blend in hero damage (5%), tower damage (15%)
  and healing (10%) where supplied. Raw hero damage has a deliberately small
  weight because AoE potential and hero choice affect damage totals; tower
  damage remains a separate objective contribution. Each uses `100 × (perMinute / reference)^0.7`,
  with references 600 damage/min, 100 tower damage/min and 150 healing/min.
  These provisional reference rates temper padding while remaining uncapped.
  Available optional metrics take their weight from combat/farming. Missing
  metrics retain that weight in combat/farming; unknown is not treated as zero.
- **Role balance:** multiply all components by fixed, historical role scales.
  The original letter-grade thresholds remain, with no maximum score.

The displayed breakdown includes weighted points after role calibration and a
signed survival adjustment, so it reconciles to the final rounded score.
Invalid required stats or numeric overflow return unavailable. Supports do not
require last hits. API aliases and full-match raw optional stats are supported.

## Calibration and held-out check

Run `bun src/scripts/backtestImpact.ts` to audit the frozen calibration. Run with
`--calibrate` only when intentionally fitting a new version. The script reads the
database and writes local reports; it never updates matches or scores.

The fit used the most recent two years relative to the latest stored match,
restricted to non-smurf All Pick records, lobbies 0/7, durations at least 20
minutes, and valid roles/stats. Split chronologically at 2026-07-08T00:09:07Z;
all participants from a match stay on the same side. Training used 4,051 player
performances from 2,488 matches; holdout used 1,188 from 622 later matches.
Role scales were refitted for beta 3.2 on the same earlier training split after
reducing damage weight, preserving the general score scale. Each training role's median raw beta was scaled to the pooled original training
median of 68. The fixed scales are in `impact-beta-calibration.json`.

Beta 3.3 retains the beta 3.2 role factors. Held-out results:

| Position     | Original median | Beta median |
| ------------ | --------------: | ----------: |
| Carry        |              85 |          76 |
| Mid          |              72 |          69 |
| Offlane      |              77 |          73 |
| Soft support |              65 |          70 |
| Hard support |              62 |          66 |
| Overall      |              72 |          71 |

The role-median spread narrowed from 23 points to 10. The overall 90th percentile
moved from 149 to 155. S-tier frequency changed from 17.8% to 17.3%, while F-tier
changed from 12.8% to 19.1%. Grade frequencies were checked, not forced to match.
The 99th percentile is 289 versus 282 originally. The reported 37/1/12 Weaver
match (29:29, 215 last hits, 56,087 hero damage, 17,424 tower damage) now scores
581, up from beta 3.1’s 544 and beta 3’s 274, versus the original 629. This is a regression example,
not a fitted target or a statistical estimate of how rare that KDA is.
The full report includes grade distributions, duration groups and outcomes:
[impact-beta-backtest.json](impact-beta-backtest.json).

## Limits of this validation

This measures distributional compatibility within the tracked group, not expert
agreement about player impact or fairness across all Dota players. Role factors
can absorb differences in which players choose each role. Winning performances
still tend to score higher, and per-minute scoring retains a duration effect.
The holdout is observational, not a causal test of contribution to victory.

Damage fields cover 5,237 of 5,239 eligible performances; full-team kills cover
2,684. No stored healing history is available, so the healing contribution has
behavioral tests but no historical calibration evidence yet. Full match details
can contain richer data than an older match record and therefore yield a
different beta score; the breakdown explicitly lists missing metrics. Vision quality and saves remain unscored because those inputs are
not consistently available. This beta should remain opt-in while reviewed on
actual matches.

Run `bun test src/lib/impact-beta.test.ts` for behavior regressions.

Hero-relative damage normalization remains deferred: only 32 of 379 observed
hero/role combinations have at least 30 training performances, and none have
100, before further splitting by duration. Sparse group averages would introduce
noise and player-selection bias. The smaller raw-damage weight mitigates this
bias without claiming to remove it. Behavioral tests check that doubling damage
from 30,000 to 60,000 in a 40-minute match adds fewer than 10 points in every role.
