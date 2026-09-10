# Grassy Creek — Course Data Staging (NOT YET AUTHORITATIVE)

**Nothing in this directory is loaded into the app or treated as real course
data yet.** Per the project's data rules, course/tee/hole data must be
verified against a real scorecard before it's seeded — guessing par,
yardage, or stroke index is not acceptable, since accomplishments and
personalization are built directly on top of these numbers.

## What was attempted

A web search for "Grassy Creek Golf Course scorecard" turned up a strong
candidate: **Grassy Creek Golf & Country Club, Spruce Pine, NC**
(18 holes, par 72, ~6,277 yards from the longest tee, course rating 70.2 /
slope 132 on that tee, per aggregator listings).

I then tried to fetch full detailed scorecards (all tees, all 18 holes,
stroke indexes) from six scorecard-hosting sites (BlueGolf, ForeTee,
GolfLink, Golfify, OffCourse, 18Birdies). **Every one of those domains is
blocked by this environment's network egress proxy**, so I could not pull
verified structured data. The only information I have is a partial,
unverified search-result snippet — see `draft-scorecard-UNVERIFIED.md` in
this directory for exactly what it contains.

## What's missing / needs your confirmation

1. **Is this the right course?** Confirm "Grassy Creek Golf & Country Club,
   Spruce Pine, NC" is the Grassy Creek you mean — there may be other
   courses with this name elsewhere.
2. **Front nine (holes 1–9):** completely missing — par, yardage, stroke
   index for every hole.
3. **Back nine (holes 10–18):** I have par + yardage from one tee only
   (unclear which — likely the longest/back tee) from a search snippet,
   **unverified against a primary source**. Stroke index is missing for
   all 18 holes.
4. **All other tees** (typically at least 3–4 tee sets: e.g. Black/Blue/
   White/Red or similar) — no data at all. Course Mastery is tee-agnostic
   at the accomplishment level, but the underlying hole/tee rows still need
   real par/yardage/rating/slope per tee (ARCHITECTURE.md §5).
5. **Course rating / slope per tee** — only have it for one tee, unverified.

## What I need from you

The most reliable source is a photo of the actual scorecard (or your GHIN/
club's official card), since that's also exactly the kind of input the
image-import pipeline is meant to handle later. Any of these work:

- A photo/scan of the physical scorecard (all tees, all 18 holes)
- The official club/GHIN course data if you have login access
- Confirmation + corrections to `draft-scorecard-UNVERIFIED.md` if you
  happen to know the numbers are close enough to fix by hand

Once confirmed, I'll write the real `scorecard.json` in this directory and
wire it into `tools/seed`. Nothing here is used by the app until then.
