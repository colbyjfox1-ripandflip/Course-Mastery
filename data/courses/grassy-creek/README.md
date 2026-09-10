# Grassy Creek — Course Data Staging (NOT YET AUTHORITATIVE)

**Nothing in this directory is loaded into the app or treated as real course
data yet.**

Confirmed course: **Grassy Creek Golf & Country Club**, 2360 Swiss Pine
Lake Drive, Spruce Pine, NC 28777.

## Recency rule (founder directive, 2026-09-10)

Grassy Creek underwent course changes within the last several years.
**Do not use legacy scorecards, or any source whose underlying course-data
update date cannot be established.** Only evidence that can reasonably be
shown to reflect the course within roughly the last 1–2 years may be used.
A webpage being crawled/updated recently is **not** sufficient by itself —
the underlying scorecard/course data itself must be current. Do not patch
missing fields (stroke index, rating, slope, tee names, yardages) from
older sources just to fill gaps — an unresolved field stays `null` rather
than being contaminated with possibly pre-renovation data.

This is corroborated by an unrelated search snippet noting Grassy Creek has
"been newly restored and renovated" (new cart paths, bunker renovations,
practice area renovations) — consistent with the founder's caution that
older hole layouts/yardages may no longer be accurate.

## Field-by-field status

| Field | Status | Evidence | Date / source |
|---|---|---|---|
| Course identity/location | **Resolved** | Multiple aggregator listings agree | undated, low-stakes fact, not course-data-sensitive |
| Par (72) | **Recent evidence, not yet sole-sourced for seeding** | Zomma Golf | checked 2026-08-21 (per founder) |
| Champions tee total yardage (6,277) | **Recent evidence** | Zomma Golf | checked 2026-08-21 |
| Regular tee total yardage (5,744) | **Recent evidence** | Zomma Golf | checked 2026-08-21 |
| Forward tee total yardage (4,797) | **Recent evidence** | Zomma Golf | checked 2026-08-21 |
| Hole-by-hole par/yardage, all 3 tees | **Not yet in hand** | Zomma Golf reportedly has this | checked 2026-08-21 — table itself not yet transcribed into this repo, see "What's needed" below |
| Stroke index, all holes | **Unresolved** | Zomma Golf explicitly does not include it | — |
| Course rating / slope, per tee | **Unresolved for the confirmed-current tee set** | Older aggregator data exists (Blue 132/70.1, White 124/67.7, Gold 112/64.5, Red 105/63.1) but **not usable** — no update date, predates confirmed recency requirement, and tee names/count don't match Zomma Golf's 3-tee (Champions/Regular/Forward) naming, suggesting a tee-structure change | do not use |
| Tee names/colors (Champions/Regular/Forward vs. older Blue/White/Gold/Red) | **Conflicting** | Zomma Golf uses Champions/Regular/Forward; older sources use Blue/White/Gold/Red | reinforces that the course changed and older tee structure is stale |

Important: Zomma Golf itself is flagged by the founder as "reported rather
than obtained directly from the club" — **recent supporting evidence, not
sufficient by itself for authoritative seeding.** Before this becomes real
seed data we still want a current physical scorecard (or official club/GHIN
source) to corroborate it and fill stroke index/rating/slope.

## What's needed next

1. **The actual Zomma Golf hole-by-hole table** (par + yardage per hole,
   all 3 tees: Champions, Regular, Forward) — not yet transcribed into this
   repo. Please paste it (or a screenshot) and I'll add it here as
   corroborating-but-not-sole-source evidence, clearly labeled.
2. **A current physical/official scorecard** to serve as the actual
   authoritative source — this is what unlocks moving data out of "staged"
   and into `scorecard.json` for real seeding. Stroke index and
   rating/slope will almost certainly need to come from this, since Zomma
   Golf doesn't carry stroke index at all.

Until both exist, everything in this directory remains staged, not seeded.
`draft-scorecard-UNVERIFIED.md` (the earlier, unverified back-nine-only
snippet from an unknown/undated tee) is superseded by this recency policy
and should be treated as **not usable at all**, not even as a fallback.
