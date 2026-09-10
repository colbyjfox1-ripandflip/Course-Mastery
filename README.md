# Course Mastery

A Course Mastery platform that includes scorekeeping — not a scorekeeping
app with Course Mastery bolted on. Every golf course becomes a persistent
progression map unique to a golfer's relationship with that course.

Start here:

- [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md) — what we're building and why
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — how it's built
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — current status and
  what's next

## Layout

```
apps/mobile          Expo app
packages/engine       Pure TS Mastery evaluation engine
packages/personalize  Ability bands / personalized-objective parameterization
packages/schema       Shared Zod schemas
packages/catalog      Accomplishment/tier definition access
supabase/             Migrations + Edge Functions
data/courses          Course/tee/hole source data (staged for review)
tools/seed            Loads /data/courses + catalog into Supabase
tools/fixtures        Fixture rounds/histories for engine tests
```

## Setup

Requires Node 20+ and pnpm 10 (`corepack enable` will pick up the pinned
version from `package.json`).

```
pnpm install
```

Individual packages are documented in their own READMEs as they're built
out — see `IMPLEMENTATION_PLAN.md` for what exists today.
