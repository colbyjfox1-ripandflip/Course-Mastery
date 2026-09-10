# Initial Accomplishments Proposal (for review — not yet seeded)

Status: **proposal, not authoritative.** Per PRODUCT_SPEC.md §5.1, this is
a spanning set across evaluator families, not a curated demo picked to
guarantee I'll unlock things on my first round. Review and edit freely —
MP values and thresholds are provisional (PRODUCT_SPEC.md §20).

These are written to be **course-generic** (no specific hole numbers),
since Grassy Creek's hole-by-hole par/yardage data isn't confirmed yet
(see `data/courses/grassy-creek/README.md`). Once that data is confirmed,
a couple of these could optionally be made hole-specific (e.g. "birdie the
signature par 3") if you want — not required.

Each entry: **slug · evaluator family · condition · MP · notes.**

## Familiarity tier (early, easy, discovery-flavored)

1. `first-round-played` · round-count milestone · complete 1 round at this
   course · 25 MP · the very first unlock, always fires
2. `first-par` · hole relative-to-par · score par on any hole · 15 MP
3. `first-birdie-or-better` · hole relative-to-par · score birdie or better
   on any hole · 30 MP
4. `nine-holes-tracked` · absence/completeness · submit a round with all 9
   (or 18) holes explicitly scored (no untouched holes) · 15 MP — rewards
   using the app fully, and only fires on genuinely complete data
5. `front-nine-under-personal-threshold` · nine-hole threshold
   (personalized) · front nine score at or under a band-appropriate
   threshold from `personalize` (e.g. bogey golf pace) · 25 MP
6. `back-nine-under-personal-threshold` · nine-hole threshold
   (personalized) · same, back nine · 25 MP
7. `three-rounds-played` · round-count milestone · 3rd round at this course
   · 20 MP

## Competence tier (pattern recognition starting)

8. `two-pars-in-a-round` · counts within a round · 2+ pars in one round ·
   20 MP
9. `bogey-or-better-streak-3` · streak within a round · 3 consecutive holes
   bogey-or-better · 30 MP
10. `round-under-personal-threshold` · round score threshold
    (personalized) · full 18 (or 9, if that's all that's played) under a
    band-appropriate score · 40 MP
11. `no-blowup-holes` · absence accomplishment · a complete round (every
    hole explicitly scored) with no hole worse than double-bogey · 35 MP —
    requires completeness; refuses to fire on any untouched hole
12. `personal-best-round` · personal best · lowest 18-hole score yet
    recorded at this course · 50 MP — always re-evaluated, fires again any
    time a new low is set
13. `five-rounds-played` · round-count milestone · 5th round at this course
    · 30 MP

## Command tier (consistency starting to matter)

14. `four-pars-in-a-round` · counts within a round · 4+ pars in one round ·
    35 MP
15. `bogey-or-better-streak-6` · streak within a round · 6 consecutive
    holes bogey-or-better · 50 MP
16. `personal-best-nine` · personal best · lowest 9-hole (front or back)
    score yet recorded at this course · 35 MP
17. `consistency-window-3` · consistency across recent rounds · last 3
    rounds at this course all within N strokes of each other (N derived
    from ability band) · 45 MP — needs ≥3 rounds of history, so naturally
    gated to golfers returning to the course
18. `ten-rounds-played` · round-count milestone · 10th round at this course
    · 40 MP

## Early compression flavor (light touch, full version is Mastery-tier+)

19. `tighter-than-last-five` · compression · this round's score is closer
    to the player's rolling best-5-average than any of the prior 5 rounds
    were · 30 MP — an early, simple taste of the compression family; the
    fuller version (spread narrowing over a longer window) is intentionally
    left for the post-walking-skeleton catalog expansion, per
    PRODUCT_SPEC.md §4 (long-term progression shouldn't be pure grind, but
    the *simple* version is fine as flavor this early)

## Bogey-free (absence family, held to Command since it's genuinely hard)

20. `bogey-free-nine` · absence accomplishment · a complete 9 holes (every
    hole explicitly scored) with no hole worse than bogey · 60 MP —
    requires completeness; refuses to fire on any untouched hole

---

## Evaluator family coverage check (against PRODUCT_SPEC.md §5.1)

| Family | Covered by |
|---|---|
| Hole score relative to par | #2, #3 |
| Counts within a round | #8, #14 |
| Round score thresholds (personalized) | #10 |
| Nine-hole thresholds | #5, #6 |
| Streaks within a round | #9, #15 |
| Absence accomplishments | #4, #11, #20 |
| Consistency across recent rounds | #17 |
| Compression | #19 (simple version) |
| Personal bests | #12, #16 |
| Round-count milestones | #1, #7, #13, #18 |

All 10 families from the spec are represented at least once — this is 20
accomplishments, at the top of the 15–20 target range, biased toward
covering every family at least twice where reasonable rather than toward
guaranteeing easy unlocks.

## What I need from you

- Sign off on this list as-is, or edit slugs/MP/thresholds/tier
  placement directly
- Confirm whether any should be made hole-specific once Grassy Creek data
  is confirmed (optional — none *need* to be)
- Flag if any family reads as too close to "measuring/instructing" rather
  than "progressing" per the product rule in PRODUCT_SPEC.md §1 — I don't
  think any of these cross that line (they're all outcome-based, not
  technique-based), but it's your call
