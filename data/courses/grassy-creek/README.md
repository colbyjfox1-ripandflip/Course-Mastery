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
| Par (72) | **Candidate, in hand** | Zomma Golf | checked 2026-08-21 |
| Hole-by-hole par + yardage, all 18 holes, all 3 tees (Champions/Regular/Forward) | **Candidate, in hand, internally consistent** (all tee/front/back/total sums verified against the club-side totals) | Zomma Golf, founder-transcribed | checked 2026-08-21 |
| Course rating / slope, per tee | **Candidate, in hand, explicitly reported-not-club-verified** | Zomma Golf | checked 2026-08-21 |
| Stroke index, all 18 holes | **Unresolved — `null`** | Zomma Golf explicitly does not hold this data | not back-filled from any older/undated source, per founder directive |
| Tee names (Champions/Regular/Forward) | **Candidate, in hand** — differs from an earlier, now-rejected undated source's Blue/White/Gold/Red naming, consistent with the founder's renovation/tee-structure-change caution | Zomma Golf | checked 2026-08-21 |

See `scorecard.candidate.json` for the full structured data and
`provenance` block. **Status: candidate, not yet seeded.** Zomma Golf is
explicitly "reported, not obtained directly from the club" — high-confidence
recent supporting evidence, not sufficient alone for authoritative seeding.
Stroke index remains unresolved until a current physical/official scorecard
is available.

## What's needed next

A current physical/official Grassy Creek scorecard, to:
1. Corroborate `scorecard.candidate.json` against the club's own numbers.
2. Resolve stroke index for all 18 holes (Zomma Golf has none).
3. Confirm rating/slope as club-verified rather than reported.

Once that exists, `scorecard.candidate.json` becomes `scorecard.json`
(course-data version bumped, `verificationStatus` flipped to
`club_verified`) and `tools/seed` can load it for real.

`draft-scorecard-UNVERIFIED.md` (the earlier, unverified back-nine-only
snippet from an unknown/undated tee) remains superseded and unusable, even
as a gap-filler — see its own header.
