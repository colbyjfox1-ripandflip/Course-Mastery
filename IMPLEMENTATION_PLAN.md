# Course Mastery — Implementation Plan

Status: living document, updated at each checkpoint. Read alongside
`PRODUCT_SPEC.md` (the "why") and `ARCHITECTURE.md` (the "how").

Working style: incremental checkpoints. At each one — what was built, what
works, what you can test, what remains, and any decision that materially
affects product/architecture flagged before it's made irreversibly.
Ordinary technical decisions that clearly follow the spec are made without
asking.

## Checkpoint 0 — Repository Foundation (this checkpoint)

**Goal:** the repo is a real pnpm workspace with the source-of-truth docs
in place, and Grassy Creek course data is staged for verification (not yet
authoritative).

Scope:
- [x] `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`
- [x] pnpm workspace scaffold: `apps/mobile`, `packages/{schema,engine,
      personalize,catalog}`, `supabase/{migrations,functions}`,
      `data/courses`, `tools/{seed,fixtures}`
- [x] Root tooling: `package.json`, `pnpm-workspace.yaml`,
      `tsconfig.base.json`, `.gitignore`, `.nvmrc`
- [x] Grassy Creek course/tee/hole data — **candidate, still not
      authoritative**. All scorecard-hosting domains remain blocked by
      this environment's egress policy, so the founder transcribed the
      Zomma Golf dataset (checked 2026-08-21) directly. Full 18-hole
      par/yardage for all 3 tees (Champions/Regular/Forward) is in
      `data/courses/grassy-creek/scorecard.candidate.json`, internally
      verified (every tee's hole yardages sum to its stated front/back/
      total). Stroke index is `null` for all holes (Zomma Golf doesn't
      carry it) and rating/slope is marked `reported_not_club_verified` —
      neither is back-filled from older sources per the founder's recency
      directive. Still needs a current physical/official scorecard before
      `tools/seed` will load it (see that directory's `README.md`).
- [x] Initial accomplishments proposal (20, spanning the evaluator
      families) — drafted for your review in `ACCOMPLISHMENTS_PROPOSAL.md`,
      not yet loaded as seed data. Written course-generically so it doesn't
      depend on Grassy Creek hole data being confirmed first.

## Checkpoint 1 — Schema, Engine, Migrations, Seed Tooling (done, built against candidate data)

Built ahead of full course-data/catalog sign-off, per the founder's
instruction to keep moving after reviewing the candidate scorecard
representation. Everything here works against
`scorecard.candidate.json` and the proposed catalog — nothing is seeded to
a real database yet, since no Supabase project exists and the data/catalog
are still candidate/proposed.

- [x] `packages/schema`: Zod schemas for Course/Tee/Hole reference data,
      the normalized round contract (tri-state hole scores, entry method,
      data tier), the accomplishment/tier catalog, immutable facts (unlock
      events, MP ledger), and `PlayerCourseHistory`
- [x] `packages/engine`: pure `evaluate()` plus all 10 evaluator families
      from PRODUCT_SPEC.md §5.1. 14 tests pass, covering every family,
      including that completeness-gated evaluators refuse to fire on
      rounds with untouched holes
- [x] `tools/fixtures`: Grassy Creek course fixture built from the
      candidate scorecard, plus sample rounds/histories used by the engine
      and catalog tests
- [x] `packages/catalog`: the 20 proposed accomplishment definitions as
      typed data, smoke-tested through the engine (params validate against
      each family) — still marked PROPOSED, not seeded
- [x] `supabase/migrations/0001_init.sql`: reference/facts/rollup tables
      per ARCHITECTURE.md §3, with RLS from this first migration —
      progression-writing tables (`unlock_events`, `mp_ledger`, both
      rollup tables) have no client write grants at all, service-role
      only. Applied and exercised end-to-end against a throwaway local
      Postgres instance during development (insert course/tee/hole/round/
      hole_scores data, confirmed the tri-state check constraint rejects
      malformed rows) — not yet applied to a real Supabase project, since
      none exists for this repo yet (see "Needs you" below)
- [x] `tools/seed`: service-role-only scripts to load course data and the
      catalog into Supabase. `seed-courses.ts` only ever reads a file
      literally named `scorecard.json` (never `*.candidate.json`) and
      refuses to run unless `verificationStatus` is `club_verified`;
      `seed-catalog.ts` refuses to run without an explicit
      `SEED_CATALOG_CONFIRM=yes`. Neither has been run against a real
      project — both are typechecked but unexercised against live infra.

**Needs you:**
1. A current physical/official Grassy Creek scorecard, to corroborate the
   candidate data and resolve stroke index/rating/slope (unchanged ask —
   see `data/courses/grassy-creek/README.md`).
2. Sign-off (or edits) on `ACCOMPLISHMENTS_PROPOSAL.md`.
3. A Supabase project to actually deploy the migration and run the seed
   scripts against — this needs your account/org (region, plan, billing),
   so it's flagged here rather than guessed. Once you have a project URL +
   service role key, applying `0001_init.sql` is a single
   `supabase db push` (or `psql -f`) away.

## Checkpoint 2 — Walking Skeleton App (next)

Needs a real Supabase project (see Checkpoint 1's "Needs you" #3) before
Auth/DB wiring can go further than local scaffolding.

- Expo app init (`apps/mobile`), Supabase Auth, founder account/profile,
  basic ability input
- Native hole-by-hole entry (tri-state scores) → confirmation screen →
  idempotent submit
- Manual post-round entry (rapid 18-hole entry) sharing the same
  confirmation/submit path
- Edge Function: server-authoritative resolution (§8 of ARCHITECTURE.md)
- Post-round resolution screen (MP awarded, unlocks, tier movement)
- Crude 18-hole Course Mastery Map/grid
- Dev-only progression reset for the founder's test player

**Milestone:** the founder plays a real round at Grassy Creek, enters it
natively or manually, submits, and sees Course Mastery move on their phone.
This is the walking skeleton described in PRODUCT_SPEC.md §17.

## Checkpoint 3 — Image Import

- Screenshot/photo → multimodal extraction → confirmation screen
  pre-filled → same submit path as Checkpoint 2
- Degradation handling per ARCHITECTURE.md §11 / PRODUCT_SPEC.md §10.2:
  partial hole extraction, course-resolves-tee-doesn't, full-failure
  fallback to manual entry — all reachable and tested, none silent

## Later (explicitly not before the above)

Full 60–80 accomplishment catalog · additional courses beyond Grassy Creek
· groups/social · Next Round scheduling · Featured Objectives · full
PostHog analytics · Sentry · notifications · Nemesis/Stronghold display ·
share extension · polished UI pass.

## Decisions Log

Record of decisions made along the way that future sessions should treat as
settled (vs. still-open items, which stay in PRODUCT_SPEC.md §20).

- **2026-09-10** — Repo scaffolded as specified; no deviations from the
  approved stack or layout.
- **2026-09-10** — Could not verify Grassy Creek course data via web fetch
  in this environment (all scorecard-hosting domains are blocked by
  egress policy here). Decision: do not seed anything as authoritative
  from an unverified search snippet; ask the founder directly instead of
  guessing. See `data/courses/grassy-creek/README.md`.
- **2026-09-10** — Founder supplied the Zomma Golf dataset (checked
  2026-08-21) directly by pasting it, since zommagolf.com is also blocked
  here. Recorded as `scorecard.candidate.json` with full provenance;
  stroke index left `null`, rating/slope marked
  `reported_not_club_verified`, per the founder's explicit recency policy
  (no back-filling from undated sources).
- **2026-09-10** — Per founder instruction, proceeded with
  schema/engine/migrations/seed (Checkpoint 1) built against the candidate
  data rather than waiting for physical-scorecard corroboration or
  catalog sign-off. `PlayerCourseHistory` was placed in `packages/schema`
  rather than `packages/engine` (a deviation from the ARCHITECTURE.md
  draft's original sketch) to avoid a `schema <-> engine <-> fixtures`
  dependency cycle — `tools/fixtures` needs the type but must not depend
  on `engine`.
- **2026-09-10** — Migration `0001_init.sql` was validated by running it
  against a throwaway local PostgreSQL 16 instance (with `auth.users`/
  `auth.uid()` stubbed to mimic Supabase) rather than a real Supabase
  project, since none exists for this repo yet. This confirms the DDL and
  constraints are sound; it does not exercise Supabase's actual RLS-role
  grants, which is why full RLS hardening (ARCHITECTURE.md §9) is still
  gated on a real project existing.
