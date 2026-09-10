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
- [ ] Grassy Creek course/tee/hole data — **staged, not authoritative**.
      Network egress to every scorecard site attempted (BlueGolf, ForeTee,
      GolfLink, Golfify, OffCourse, 18Birdies) was blocked by this
      environment's proxy, so nothing beyond an unverified search snippet
      (partial back nine, one tee only) could be gathered. See
      `data/courses/grassy-creek/README.md` for exactly what's known vs.
      missing and what's needed from you before this becomes real seed
      data.
- [x] Initial accomplishments proposal (20, spanning the evaluator
      families) — drafted for your review in `ACCOMPLISHMENTS_PROPOSAL.md`,
      not yet loaded as seed data. Written course-generically so it doesn't
      depend on Grassy Creek hole data being confirmed first.

Not started yet (by design — see below): Expo app init, Supabase project,
`schema`/`engine` package contents, migrations, seed tooling.

## Checkpoint 1 — Course Data + Catalog Confirmed (next, pending your input)

Blocked on: you confirming/correcting the Grassy Creek scorecard (all tees,
all 18 holes: par, yardage, stroke index) and signing off on the proposed
accomplishment list (`ACCOMPLISHMENTS_PROPOSAL.md`).

Scope once unblocked:
- Load confirmed Grassy Creek data into `data/courses/grassy-creek/` as the
  authoritative source file(s)
- `packages/schema`: normalized round contract, course/tee/hole types,
  accomplishment definition types (Zod)
- `packages/engine`: v0 with the ~6–8 evaluator families needed for the
  walking skeleton's 15–20 accomplishments, tested against
  `tools/fixtures`
- Supabase project provisioned; initial migrations for reference data,
  facts, and rollup tables (§3 of ARCHITECTURE.md); RLS from the first
  migration
- `tools/seed`: loads Grassy Creek + catalog into Supabase

## Checkpoint 2 — Walking Skeleton App

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
