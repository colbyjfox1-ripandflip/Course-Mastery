# tools/seed

Loads `/data/courses/**` and the accomplishment/tier catalog into Supabase.
Service-role only — never run with an anon/publishable key, and never
imported from `apps/mobile`.

## Setup

```
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm seed:courses
```

`seed-courses.ts` only ever reads a file literally named `scorecard.json`
in each `data/courses/<slug>/` directory, and refuses to seed unless its
`verificationStatus` is `club_verified`. A directory holding only a
`*.candidate.json` (like `data/courses/grassy-creek/` today) is skipped
with a warning — see that course's own `README.md` for why.

```
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SEED_CATALOG_CONFIRM=yes pnpm seed:catalog
```

`seed-catalog.ts` loads `packages/catalog`'s proposed accomplishment
definitions. It refuses to run without `SEED_CATALOG_CONFIRM=yes` — that
catalog is proposed, pending founder sign-off against
`ACCOMPLISHMENTS_PROPOSAL.md` (repo root).

Neither script has been run against a real project yet — no Supabase
project exists for this repo so far (see `IMPLEMENTATION_PLAN.md`). Both
were validated by running `supabase/migrations/0001_init.sql` against a
throwaway local Postgres instance during development; that's how the
schema was confirmed to apply cleanly, not by running these scripts live.
