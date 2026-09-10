# Course Mastery — Architecture

Status: source of truth for technical decisions. Read alongside
`PRODUCT_SPEC.md` (the "why") and `IMPLEMENTATION_PLAN.md` (the "when").

## 1. Stack

- **Expo / React Native** — mobile app (`apps/mobile`)
- **TypeScript** everywhere
- **Supabase** — Postgres, Auth, RLS, Edge Functions, Storage (for import
  images)
- **Zod** — shared runtime-validated schemas (`packages/schema`), the single
  source of truth for the normalized round contract and related types
- **TanStack Query** — server state in the mobile app
- **Zustand** — local/UI state where React state alone is awkward (e.g. the
  in-progress native scorecard draft before it's submitted)
- **SQLite** (via `expo-sqlite`) — local round drafts, for offline entry
- **PostHog** — product analytics (later; not in the walking skeleton)
- **Sentry** — error tracking (later; not in the walking skeleton)

Deliberately excluded: Kubernetes, Redis, message queues, GraphQL, a
separate API gateway, microservices. Supabase Postgres + Edge Functions is
the entire backend. If a future need seems to require one of these, treat
that as a signal to re-examine the design before reaching for the tool.

## 2. Repository Layout

pnpm workspace monorepo:

```
/apps/mobile          Expo app
/packages/engine       Pure TS Mastery evaluation engine (zero DB/network deps)
/packages/personalize  Ability bands, personalized-objective parameterization
/packages/schema       Zod schemas shared by app, engine, Edge Functions, tools
/packages/catalog      Typed access to accomplishment/tier definitions (+ local
                        copies for tests/fixtures); definitions themselves live
                        in Postgres in production
/supabase/migrations   SQL migrations (source of truth for DB schema)
/supabase/functions    Edge Functions (server-authoritative resolution, import
                        extraction orchestration, etc.)
/data/courses          Course/tee/hole source data, staged for review before
                        being loaded into Postgres by the seed tool
/tools/seed            Scripts that load /data/courses and catalog definitions
                        into Supabase
/tools/fixtures        Fixture rounds/histories for engine tests and local dev
```

Package boundaries are directional: `engine` and `personalize` depend on
`schema` only. `apps/mobile` depends on `schema`, `engine` (for local
preview/optimistic evaluation if ever needed), and calls Supabase for
everything authoritative. Edge Functions depend on `schema`, `engine`,
`catalog`, `personalize`. No package depends on `apps/mobile`.

## 3. Data Model Philosophy — Three Layers

**Reference data** — courses, tees, holes, accomplishment definitions, tier
definitions. Versioned, slow-changing, effectively "content."

**Facts** — rounds, hole scores, unlock events, MP ledger entries. Immutable
once written (corrections are new facts — reversal/compensating rows —
never edits or deletes of existing rows).

**Rollups** — player-course progress, player-course-hole statistics,
summaries, tier state, current MP balance. Derived, cached data.

**Hard rule: every rollup must be reconstructible by replaying facts from
scratch.** Rollups are an optimization, never a second source of truth. If a
rollup and a replay-from-facts ever disagree, the replay wins and the
rollup is a bug. This is what makes the append-only ledger, the immutable
unlock events, and versioned course data non-negotiable — they are the
replay log.

Practical implication: rollup tables should be things like
`player_course_progress`, `player_course_hole_stats` — plain Postgres
tables maintained by Edge Functions (not triggers doing business logic, to
keep the Mastery logic in one place — the `engine` package — rather than
split between TypeScript and PL/pgSQL). A `tools/seed` or admin "recompute"
path that rebuilds rollups from facts should exist even in the walking
skeleton, even if only exercised manually, because it's the thing that
proves the append-only design is real and not aspirational.

## 4. Course Data Versioning

Courses and tees carry a version. Editing par/yardage/handicap on a hole
after rounds have been recorded against it must not silently rewrite the
meaning of those historical rounds. Practical approach for the walking
skeleton: a `course_data_version` on the course row, copied onto each
normalized round at submission time. A full temporal/bitemporal course-data
history table is not required yet, but the round-level version stamp is —
it's cheap now and expensive to retrofit.

## 5. Tee Provenance

Course Mastery is per-course, not per-tee. The data model must support:

- A hole accomplishment ("birdied #14") recording *which tee* it was
  achieved from, without the accomplishment itself being tee-scoped.
- Displaying per-tee provenance under a course-scoped accomplishment
  (White ✓ / Blue ✓ / Black not yet) — i.e. the unlock event and the
  per-hole stat rollup both need a tee reference, even though the
  accomplishment definition and the player-facing tier progress do not.
- Future rating/slope-normalized thresholds: hole and tee rows carry
  enough (par, yardage, stroke index; tee carries rating/slope) that a
  personalized round-score objective can be normalized against tee
  difficulty rather than raw strokes.
- Future anti-farming: because tee is recorded on every unlock event, a
  later pass can detect "this player only ever unlocks difficulty-sensitive
  objectives from the forward tees" without a schema change — the evidence
  is already there. No anti-farming logic ships in the walking skeleton.

## 6. Pure Evaluation Engine (`packages/engine`)

The most important boundary in the system. The engine has **zero runtime
dependency** on Supabase, Postgres, or the network. It is pure TypeScript
operating on data handed to it.

Conceptual signature:

```ts
evaluate(
  round: NormalizedRound,
  playerHistory: PlayerCourseHistory,   // prior rounds/stats needed for
                                         // consistency, personal-best,
                                         // compression evaluators
  definitions: AccomplishmentDefinition[],
  config: EngineConfig                  // engine version, tunables
): EvaluationResult
```

`EvaluationResult` includes, per evaluated definition: whether it unlocked,
the evidence used (values compared, holes involved), and — where the
evaluator family supports it — proximity/near-miss information (e.g. "one
putt away from bogey-free") for future "so close" UI. Near-miss data is
part of the evaluator contract from the start even if no UI surfaces it in
the walking skeleton, because retrofitting it means re-running historical
rounds.

Why this boundary matters: it's what makes the engine independently
testable against fixtures (`tools/fixtures`) without a database, portable
if the backend ever changes, and safe to reason about for correctness
(same round + same history + same definitions + same config → same
result, always — enables replay).

The engine is called from an Edge Function (server-authoritative — see §8),
never trusted from the client.

## 7. MP Ledger

`mp_ledger` is append-only. Each row: player, course (nullable for future
non-course MP), amount (signed — reversals are negative rows referencing
the original), source (which unlock event or other cause), engine version,
catalog version, created_at. Course MP / Season MP / Career MP are
**projections** (sums with different grouping), not separate tables that
must be kept in sync — this follows directly from §3.

## 8. Server-Authoritative Resolution

Clients submit *facts* (a normalized round). They never submit *unlocks* or
*MP*. An Edge Function:

1. Validates the round (Zod schema from `packages/schema`).
2. Resolves course/tee/course-data-version.
3. Loads player history relevant to the evaluators that need it.
4. Calls `engine.evaluate(...)`.
5. Writes: the round (fact), unlock events (fact), MP ledger entries
   (fact), then updates rollups.
6. Returns the resolution (unlocks, MP delta, tier movement) to the client
   for the post-round screen.

RLS ensures a player can insert rounds owned by themselves and read their
own facts/rollups, but has no INSERT/UPDATE grant on unlock events, MP
ledger, or rollup tables — those are writable only by the Edge Function's
service role. This is the concrete mechanism behind "clients cannot award
themselves MP."

## 9. Security

- RLS on from the start: every player-owned table scoped by `auth.uid()`.
- Progression-writing tables (`mp_ledger`, `unlock_events`,
  `player_course_progress`, `player_course_hole_stats`) have **no client
  write grants at all** — service-role only, written exclusively by Edge
  Functions.
- Single-user walking skeleton: comprehensive multi-tenant RLS testing can
  wait, but the ownership boundary (player A cannot read/write player B's
  rows) must exist in the schema from the first migration, not bolted on
  later.
- **Hard gate:** before a second real account is created, do full RLS
  hardening and forbidden-write testing (attempt writes to progression
  tables as an authenticated non-service client; confirm they're rejected).

## 10. Offline

Scope is intentionally narrow: a round draft has exactly one author, so
this is *not* a general CRDT/multi-writer sync problem. Local SQLite holds
in-progress native-entry drafts (tri-state hole scores, per §11 of
PRODUCT_SPEC.md) so a round survives app kill/connectivity loss during
play. On submission, the draft is sent to the server, which remains the
sole source of truth for resolution — there is no client-side evaluation
that needs to be reconciled.

## 11. Import Pipeline

```
input (image, or manual keystrokes)
  → parsing/extraction (multimodal model call for images; direct for manual)
  → course/tee resolution (fuzzy match against reference data; ask on
    ambiguity)
  → normalized candidate round (may be partial)
  → confirmation screen (always shown; golfer edits/fills gaps)
  → validation (Zod)
  → submit (idempotent on client round UUID)
  → mastery evaluation (§8)
```

Degradation is handled by making every stage optional/partial rather than
all-or-nothing: the candidate round type allows per-hole
`unknown | value | no_score`, and a course/tee resolution can succeed
independently of hole extraction succeeding. The confirmation screen is the
single place all degradation paths converge — there is no separate "import
failed" dead end.

## 12. Versioning Concepts

Three independent version numbers travel with every round evaluation:

- **Engine version** — `packages/engine` release/build identifier
- **Catalog version** — the accomplishment/tier definition set in effect
- **Personalization version** — the ability-band/parameterization logic in
  effect

All three are stamped onto the round's evaluation record (not just the
round) so that a future retune can be analyzed against exactly what was
true when a given unlock fired, and — because facts are immutable and
rollups are replayable (§3) — historical evaluations can eventually be
replayed under a new engine/catalog version for what-if analysis without
losing the original record.

## 13. Environments

- **Development**: a dev-only reset operation exists for the founder's own
  test player, implemented as compensating ledger rows (never deletes),
  gated so it cannot run against production. See PRODUCT_SPEC.md §19.
- Everything else (schema, RLS, engine) is the same code path in dev and
  prod — no "dev mode" branching inside application logic beyond the reset
  tool itself.
