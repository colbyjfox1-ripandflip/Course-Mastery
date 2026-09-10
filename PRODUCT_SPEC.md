# Course Mastery — Product Specification

Status: source of truth. This document captures the approved product decisions
for Course Mastery. It exists so future work (including future coding
sessions with no memory of prior conversations) does not depend on any
external chat history. If behavior in the app contradicts this document,
the document wins unless a later dated addendum in this repo supersedes it.

This is a **new, standalone product**. It has no relationship to, and must
not reuse code, schemas, UI, conventions, or dependencies from, any other
application the founder has previously built.

## 1. Product Thesis

**Every golf course becomes a persistent progression map unique to the
golfer's relationship with that course.**

Strategic framing: **we are a Course Mastery platform that includes
scorekeeping.** We are not a general-purpose golf scorekeeping/GPS/stats app
with Course Mastery bolted on.

The product is a progression layer on top of whatever scorekeeping ecosystem
a golfer already uses, while still supporting native scoring for golfers who
don't use another app.

**Product rule: build nothing that measures, discovers, or instructs. Build
only what progresses.**

Explicitly out of scope, permanently (not just for alpha): GPS/rangefinding,
swing coaching, shot tracking, strokes gained, course reviews, tee-time
booking, official handicap calculation, equipment tracking, tournament
administration, generic social feed.

## 2. Core Product Loop

A golfer plays a course repeatedly. Every completed round is evaluated
against a persistent Course Mastery system. The golfer accumulates
accomplishments and Mastery Points, progresses through mastery tiers,
develops a unique history with individual holes, encounters unfinished
accomplishments, and gradually builds a persistent record of their
relationship with that course.

Target emotional arc:

| Rounds | Emotional stage |
|---|---|
| 1 | Discovery |
| ~10 | Pattern recognition / unfinished areas / Nemesis emerges |
| ~50 | Long-term chase |
| ~100 | Ownership / mastery |
| 250+ | Identity, history, seasonal performance, consistency, personal-best displacement, long-term course relationship |

The system must stay meaningful for golfers who play the same course
hundreds of times. This is the hardest constraint and should be treated as
a design filter for every feature: "does this still mean something at round
300?"

## 3. Mastery Points (MP)

There is **one** progression currency: **Mastery Points (MP)**. Do not
introduce XP or any second currency name.

The same MP-earning events aggregate into multiple projections:

- **Course MP** — primary Course Mastery progression (alpha's primary metric)
- **Season MP** — future seasonal/group competition (not alpha)
- **Career MP** — future lifetime progression (not alpha)

Implementation rule: MP is an **append-only ledger**, never only a mutable
balance column. Corrections are represented as ledger reversal entries, not
destructive edits to history. Balances/rollups are always views computable
by summing the ledger.

## 4. Course Mastery Tiers

Tiers are completable, followed by an open-ended tail:

1. Familiarity
2. Competence
3. Command
4. Mastery
5. Open-ended top progression (no ceiling)

Tier names are provisional, not permanently locked.

Approximate eventual pacing (provisional, for tuning):

| Tier | Rounds |
|---|---|
| Familiarity | 3–6 |
| Competence | 15–20 |
| Command | 45–60 |
| Mastery | 100–140 |
| Open-ended | thereafter |

A golfer should be able to advance through a tier at roughly **75–80%** of
that tier's available accomplishment points — not 100%. Nobody should be
blocked on one stubborn accomplishment.

Long-term progression (Command/Mastery and beyond) should emphasize:

- Consistency windows (e.g., bogey-or-better streaks across rounds)
- Compression accomplishments (tightening the spread between best/worst)
- Personal-best displacement
- Seasonal performance
- Meaningful cumulative history

Do not design the long-term system primarily around repetitive grind
("par this hole 25 times"). Simple cumulative milestones are acceptable
only as low-tier flavor, not as the backbone of late-game progression.

## 5. Accomplishments

Accomplishments are **data**, evaluated by **typed code**.

- Accomplishment *definitions* are database rows with a stable `slug` and a
  `version`. Adding another instance of an existing behavior (e.g., a new
  "birdie hole #12" definition) is a data change — no deploy required in
  steady state.
- *Evaluators* are pure TypeScript functions, grouped into families (see
  §5.1). Adding a wholly new evaluator behavior is a code change.
- Every unlock is an **immutable event** carrying enough evidence/context
  to reconstruct why it fired (round id, hole(s), values compared,
  definition version, engine version). This evidence is also the
  foundation for future rarity analysis — don't discard it to save space.

### 5.1 Evaluator families (initial set)

1. Hole score relative to par (birdie, par, bogey-or-better, etc. on a
   specific hole or hole-class)
2. Counts within a round (e.g., N pars in a round, N one-putts)
3. Round score thresholds (personalized, e.g., "break 90")
4. Nine-hole thresholds
5. Streaks within a round (consecutive pars/bogey-or-better)
6. Absence accomplishments (bogey-free round, no doubles) — must declare a
   completeness requirement and refuse to fire on incomplete data
7. Consistency across recent rounds (e.g., last 5 rounds within N strokes)
8. Compression (spread between best/worst on a hole or round narrows)
9. Personal bests (best score on a hole, best round, best nine)
10. Round-count milestones (Nth round at this course)

This is the initial spanning set for the evaluator library — not a final
list. New families get added as code when a genuinely new *shape* of
evaluation is needed; new *instances* of existing families are data.

## 6. Featured Objectives

Before a round, the golfer may receive **~3–5 Featured Objectives**. These
are recommendations/bonus opportunities — **not activation requirements**.

After every submitted round, the engine evaluates the full scorecard against
**all** eligible accomplishments, featured or not. An unfeatured unlock still
unlocks. Featured Objectives may carry an MP bonus/multiplier.

Post-round UI highlights only the 2–3 most meaningful unlocks and collapses
the rest, to avoid an accomplishment firehose.

Three legitimate pre-round states:

- **A. Scheduled round** — Featured Objectives generated and locked in
- **B. "Playing Now" without prior scheduling** — Featured Objectives can
  still be generated at the moment play starts
- **C. No pre-round interaction at all** — round just gets submitted after
  the fact; still receives every passive accomplishment, but no Featured
  bonus

**Scheduling must never be required to use the product.**

## 7. Nemesis / Stronghold

First-class future concept, not required for the walking skeleton, but the
underlying per-hole historical rollup architecture should exist from early
on so this can be turned on without a data migration.

- **Nemesis**: a hole (or hole-class) where the golfer has a long history of
  struggling relative to their own baseline. Example surface copy:

  > YOUR NEMESIS — Grassy Creek #7 — 12 rounds played — 0 pars — average
  > relative to par +1.6 — "You've never beaten this hole."

  On eventual defeat: "After 13 attempts, you conquered #7."

- **Stronghold**: the inverse — a hole the golfer consistently plays
  unusually well relative to their own baseline.

For alpha, use the **player's own historical baseline**, not peer
comparison — the population will be too small for peer comparison to mean
anything. Display can wait until enough rounds exist per player-hole pair;
the rollup data should start accumulating from round 1.

## 8. Tee Handling

Course Mastery is **not** scoped by tee. Changing tees must not reset the
golfer's relationship with the course. Tee provenance is retained
permanently and per-hole, e.g.:

> Hole #14 — Birdied ✓
> (White ✓ · Blue ✓ · Black not yet)

Score thresholds and difficulty-sensitive objectives should use course/tee
rating-and-slope normalization where appropriate, so a threshold objective
doesn't become trivially easy from a shorter tee. The architecture must
support future anti-farming logic that detects tee-shopping for easier
objectives (not required for alpha, but data model must not preclude it —
see ARCHITECTURE.md §Tee Provenance).

## 9. Player Ability / Personalization

Long-term goal: generate objectives relative to player ability so two
golfers of different ability get objectively different challenges with
comparable completion probability. **Do not build the advanced probability
model now.**

Alpha personalization, kept simple:

- Self-reported official handicap, if the golfer has one
- Approximate self-reported ability if not
- Recent scoring history, as it accumulates
- Broad ability bands
- Parameterized score/par objectives driven by those bands
- Basic course/tee difficulty (rating/slope)

For golfers without an official handicap, accumulated history may
eventually produce a proprietary internal ability estimate. **Never present
this as, or name it after, an official USGA Handicap Index.** Store ability
estimates as a time series (not a single mutable field) so later
recalibration can reconstruct what the system believed about the golfer at
any past point in time.

## 10. Round Ingestion

Existing golf-app users must **not** be forced into a second scorecard.
Two first-class ingestion paths, converging on one normalized round object:

**Path A — existing scorekeeping user**
Play → record in GHIN / 18Birdies / Garmin / etc. → screenshot/share/export
completed scorecard → our app extracts the round → golfer confirms/edits →
normalized round → Course Mastery evaluation.

**Path B — native scorekeeping user**
Play → our intentionally simple native hole-by-hole scorecard → finish
round → normalized round → Course Mastery evaluation.

**Manual post-round path** (subset of both, always available): physical
scorecard → rapidly enter 18 hole scores afterward → normalized round →
Course Mastery evaluation.

All paths converge into the same normalized round object before the Mastery
engine evaluates anything. The engine is source-agnostic — it never knows
or cares how a round was entered.

Conceptual pipeline:

```
input → parsing/extraction → course/tee resolution → normalized candidate
round → user confirmation/edit → validation → submit → mastery evaluation
→ MP/accomplishments → post-round resolution
```

### 10.1 Image Import

Image/screenshot import is a **first-class early feature**, not a distant
future item — it should land shortly after the native entry walking
skeleton, not be deferred to "someday."

Initial scope, intentionally narrow:

```
Photo library / screenshot → multimodal extraction → confirm/edit →
normalized round
```

Do not delay the first walking skeleton to build a full iOS/Android share
extension. A share extension is a later, thin front-end onto the exact same
ingestion pipeline. Do not assume GHIN or any other app exposes an API,
structured export, or particular share format unless independently
verified — treat unverified format assumptions as guesses.

### 10.2 Import Degradation (hard rule)

**An import failure must never strand the golfer.**

- 15/18 holes extract → keep those 15, ask for the other 3.
- Course resolves, tee doesn't → ask for tee only.
- Extraction fails entirely → fall back to manual post-round entry, with
  any reliably-extracted fields pre-populated.

Every import branch must terminate at a usable confirmation screen. **Never
silently save an extracted round** — the golfer always confirms before
submission.

## 11. Native Scorekeeping

Intentionally simple and fast. No general golf utility features (no GPS, no
club tracking, no shot-by-shot detail) — this is a scorecard, not a
companion app.

Hole score state is **tri-state**, per hole:

- `untouched` / null
- explicit numeric score
- explicit `no_score`

**Never default an untouched hole to par.** Par can be a fast one-tap
selection, but it must be an explicit user action, indistinguishable in the
data model from any other explicitly entered score. An incomplete hole must
never accidentally satisfy an accomplishment. Evaluators with a completeness
requirement (bogey-free, no-doubles, etc.) must check for `untouched` holes
and refuse to fire when any exist in the required range.

## 12. Normalized Round / Data Model (product-level contract)

A normalized round retains, at minimum:

- Player
- Course (id + version)
- Course-data version
- Tee
- Date
- Entry method (native / image-import / manual-post-round)
- Data tier (how complete/trustworthy the data is — see ARCHITECTURE.md)
- Per-hole scores (tri-state, per §11)
- Optional gross/putts if available
- Provenance (source, extraction confidence where applicable)
- Version stamps (engine version, catalog version, personalization version
  in effect at evaluation time)

Rules:

- Round id is a **client-generated UUID**. Submission is **idempotent** on
  that id.
- **Soft duplicate detection only** (same course + same date): warn, don't
  block — golfers can legitimately play the same course twice in a day.
- Resolved (evaluated) rounds are **not destructively edited**. Corrections
  preserve historical/replay integrity (see ARCHITECTURE.md §Facts &
  Rollups).

## 13. Groups / Social (future, scoped)

The private-alpha recruiting unit is **recurring golf groups/foursomes**,
not isolated individuals.

Initial group visibility (post-walking-skeleton):

- Group roster
- Each member's Course Mastery tier/progress at shared courses
- Recent meaningful mastery accomplishments
- Tier advancement
- Later: Nemesis Defeated events

**Do not build a traditional ranked leaderboard yet.** The alpha question is
whether seeing friends' progression itself creates engagement, independent
of ranking.

## 14. Next Round / Scheduling (future, scoped)

Lightweight only: course + date + optional group/friends. **Not** tee-time
booking or calendar management. Purpose: prepare Featured Objectives, create
legitimate pre-round engagement, cache info before playing, support
pre-round notifications and post-round import reminders. "Playing Now"
without scheduling is equally first-class (see §6, state B).

## 15. Private Alpha Scope

Target: ~20–25 recurring golf groups, seeded with ~3–5 courses those groups
regularly play.

**In scope for private alpha (not all at once — see IMPLEMENTATION_PLAN.md
for sequencing):**
Account/profile · ability calibration · course/tee selection · fast native
score entry · manual post-round entry · image/screenshot import · ~60–80
accomplishments per course · simple personalization · passive
accomplishment detection · 3–5 Featured Objectives · Course Mastery Map ·
hole grid · mastery tiers · Course MP · friends/groups · post-round
resolution · lightweight Next Round · analytics · basic notifications.

**Explicitly excluded from private alpha** (and not casually revisited):
advanced probability model · Career Mastery UI · displayed rarity ·
public/global leaderboards · monetization · GPS/rangefinder · shot
tracking/strokes gained · swing analysis/coaching · official handicap
calculation · tee-time booking · generic social feed · equipment tracking ·
tournament administration.

## 16. Primary Alpha Test

**Primary question:** does persistent depth progression at courses golfers
repeatedly play make those rounds more engaging, and cause golfers to care
about unfinished accomplishments?

**Secondary question:** does lightweight personalization make golfers of
different abilities feel the objectives are appropriately pitched to them?

**Confound to guard against:** duplicate score-entry friction must not be
allowed to masquerade as evidence that Course Mastery itself is weak. This
is exactly why image import and low-friction native entry are early
priorities, not polish items.

## 17. Walking Skeleton (first build target)

Not the full private alpha. The first milestone, end to end:

> I play one real round at Grassy Creek → get the hole-by-hole round into
> the application → confirm it → submit it → accomplishments unlock → MP is
> awarded → I see Course Mastery move on my phone.

Production-shaped foundations, reduced content/polish. Includes,
approximately:

- One real seeded course: Grassy Creek (pending data verification — see
  `data/courses/grassy-creek/README.md`)
- Founder account/profile
- Basic ability input
- Production-shaped normalized round contract
- Fast native/manual hole entry
- Confirmation screen
- Image/screenshot import (shortly after native entry works)
- Pure engine package
- ~6–8 evaluator types
- ~15–20 representative accomplishments (spanning set, not a curated demo —
  see §5.1 and the proposal doc for the actual list)
- Append-only MP ledger
- Immutable unlock events
- Server-authoritative resolution
- Basic post-round resolution screen
- Crude but functional Course Mastery Map / 18-hole grid

**Explicitly deferred past the walking skeleton:** full 60–80 accomplishment
catalog · large fixture set · groups · notifications · scheduling ·
Featured Objectives · full analytics · additional courses · polished UI ·
Nemesis display · share extension.

## 18. Security Posture (product-level)

Players report facts about their own rounds; the **server is authoritative
for progression**. Clients cannot award themselves MP, unlock
accomplishments, or directly mutate rollups — those are always
server/Edge-Function computed from submitted facts. RLS from day one for
basic ownership boundaries, even in the single-user walking skeleton. Full
RLS hardening and forbidden-write testing is a hard gate before any second
account is created (see ARCHITECTURE.md §Security).

## 19. Development Reset

Because early progression tuning (MP values, tier thresholds) is
provisional, there must be a safe, **development-only** way to reset a
test player's progression. This must not weaken the production ledger's
append-only guarantee — implemented as a dev-only operation that is
unavailable/disabled outside development, and which works by writing
compensating reversal entries (or operating in a clearly separate dev
dataset), never by deleting ledger rows.

## 20. Open / Provisional Items

These are intentionally not locked yet and should be revisited with real
usage data:

- Tier names (§4)
- MP values per accomplishment, tier point thresholds (§4, §5)
- The exact 15–20 walking-skeleton accomplishments (proposed, not yet
  authoritative — see `ACCOMPLISHMENTS_PROPOSAL.md`)
- Grassy Creek course/tee/hole data (must be verified against a real
  scorecard before seeding — see `data/courses/grassy-creek/README.md`)
