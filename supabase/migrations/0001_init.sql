-- Course Mastery — initial schema.
--
-- Three layers per ARCHITECTURE.md §3:
--   reference data  (courses, tees, holes, accomplishment_definitions)
--   facts           (player_profiles, player_ability_estimates, rounds,
--                     hole_scores, unlock_events, mp_ledger)
--   rollups         (player_course_progress, player_course_hole_stats)
--
-- Every rollup must be reconstructible by replaying facts — rollup tables
-- here are plain cache tables maintained by Edge Functions, never a second
-- source of truth. RLS is applied from this first migration per
-- ARCHITECTURE.md §9: progression-writing tables (unlock_events,
-- mp_ledger, the two rollup tables) have NO client write grants at all —
-- service-role only, written exclusively by Edge Functions.

create extension if not exists pgcrypto;

-- ============================================================
-- REFERENCE DATA
-- ============================================================

create table courses (
  slug text primary key,
  name text not null,
  location jsonb not null,
  hole_count integer not null,
  par integer not null,
  -- Bumped whenever hole/tee data changes; stamped onto every round
  -- submitted against this course (ARCHITECTURE.md §4).
  course_data_version text not null,
  verification_status text not null check (verification_status in ('candidate_unverified', 'club_verified')),
  created_at timestamptz not null default now()
);

create table tees (
  id text not null,
  course_slug text not null references courses (slug) on delete cascade,
  name text not null,
  par integer not null,
  total_yardage integer not null,
  rating numeric,
  slope integer,
  rating_slope_provenance text check (rating_slope_provenance in ('club_verified', 'reported_not_club_verified', 'unresolved')),
  primary key (course_slug, id)
);

create table holes (
  course_slug text not null references courses (slug) on delete cascade,
  number integer not null check (number between 1 and 18),
  par integer not null check (par between 3 and 6),
  -- null until sourced from data that actually carries stroke index —
  -- never guessed or back-filled (see data/courses/grassy-creek/README.md).
  stroke_index integer check (stroke_index between 1 and 18),
  -- keyed by tees.id
  yardages jsonb not null,
  primary key (course_slug, number)
);

create table accomplishment_definitions (
  slug text not null,
  version integer not null,
  family text not null check (family in (
    'hole_relative_to_par', 'counts_within_round', 'round_score_threshold',
    'nine_hole_threshold', 'streak_within_round', 'absence',
    'consistency_recent_rounds', 'compression', 'personal_best',
    'round_count_milestone'
  )),
  tier text not null check (tier in ('familiarity', 'competence', 'command', 'mastery', 'open_ended')),
  name text not null,
  description text not null,
  mp_value integer not null check (mp_value >= 0),
  params jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (slug, version)
);

-- Reference data is public read (needed before login, e.g. course
-- selection); writes are admin/seed-only (service role), never via a
-- client RLS grant.
alter table courses enable row level security;
alter table tees enable row level security;
alter table holes enable row level security;
alter table accomplishment_definitions enable row level security;

create policy "courses are publicly readable" on courses for select using (true);
create policy "tees are publicly readable" on tees for select using (true);
create policy "holes are publicly readable" on holes for select using (true);
create policy "accomplishment definitions are publicly readable" on accomplishment_definitions for select using (true);

-- ============================================================
-- FACTS
-- ============================================================

create table player_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  self_reported_handicap numeric,
  created_at timestamptz not null default now()
);

-- Ability estimates as a time series (never a single mutable field), so a
-- later recalibration can reconstruct what the system believed about a
-- player at a given time (PRODUCT_SPEC.md §9). Never labeled as an
-- official USGA Handicap Index.
create table player_ability_estimates (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references player_profiles (id) on delete cascade,
  band text not null,
  source text not null check (source in ('self_reported_handicap', 'self_reported_approximate', 'derived_from_history')),
  personalization_version text not null,
  recorded_at timestamptz not null default now()
);

-- Round id is client-generated; submission is idempotent on it
-- (PRODUCT_SPEC.md §12) — hence primary key rather than a server default.
create table rounds (
  id uuid primary key,
  player_id uuid not null references player_profiles (id) on delete cascade,
  course_slug text not null references courses (slug),
  course_data_version text not null,
  tee_id text not null,
  date_played date not null,
  entry_method text not null check (entry_method in ('native', 'manual_post_round', 'image_import')),
  data_tier text not null check (data_tier in ('complete', 'partial')),
  gross_score integer,
  provenance jsonb,
  submitted_at timestamptz not null default now(),
  foreign key (course_slug, tee_id) references tees (course_slug, id)
);

create table hole_scores (
  round_id uuid not null references rounds (id) on delete cascade,
  hole_number integer not null check (hole_number between 1 and 18),
  status text not null check (status in ('untouched', 'scored', 'no_score')),
  strokes integer check (strokes > 0),
  primary key (round_id, hole_number),
  check ((status = 'scored') = (strokes is not null))
);

-- Immutable. Never updated/deleted by application code — corrections are
-- new rows via a future definition version, not edits (ARCHITECTURE.md §3).
create table unlock_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references player_profiles (id) on delete cascade,
  course_slug text not null references courses (slug),
  definition_slug text not null,
  definition_version integer not null,
  round_id uuid not null references rounds (id),
  tee_id text not null,
  evidence jsonb not null,
  engine_version text not null,
  catalog_version text not null,
  created_at timestamptz not null default now(),
  foreign key (definition_slug, definition_version) references accomplishment_definitions (slug, version)
);

-- Append-only. A correction is a new row with a negative amount
-- referencing the original via source_id — never an update/delete
-- (PRODUCT_SPEC.md §3, ARCHITECTURE.md §7).
create table mp_ledger (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references player_profiles (id) on delete cascade,
  -- nullable: MP is course-scoped today, but this shape supports future
  -- Season MP / Career MP projections without a schema change.
  course_slug text references courses (slug),
  amount integer not null,
  source_type text not null check (source_type in ('unlock_event', 'reversal', 'manual_adjustment')),
  source_id uuid,
  engine_version text not null,
  catalog_version text not null,
  created_at timestamptz not null default now()
);

alter table player_profiles enable row level security;
alter table player_ability_estimates enable row level security;
alter table rounds enable row level security;
alter table hole_scores enable row level security;
alter table unlock_events enable row level security;
alter table mp_ledger enable row level security;

create policy "players manage their own profile" on player_profiles
  for select using (auth.uid() = id);
create policy "players create their own profile" on player_profiles
  for insert with check (auth.uid() = id);
create policy "players update their own profile" on player_profiles
  for update using (auth.uid() = id);

create policy "players read their own ability estimates" on player_ability_estimates
  for select using (auth.uid() = player_id);
create policy "players record their own ability estimates" on player_ability_estimates
  for insert with check (auth.uid() = player_id);

-- Rounds/hole_scores: players submit facts about their own rounds
-- (PRODUCT_SPEC.md §18). No update/delete policy — resolved rounds are
-- not destructively edited; corrections are new facts, never row edits.
create policy "players read their own rounds" on rounds
  for select using (auth.uid() = player_id);
create policy "players submit their own rounds" on rounds
  for insert with check (auth.uid() = player_id);

create policy "players read their own hole scores" on hole_scores
  for select using (
    exists (select 1 from rounds where rounds.id = hole_scores.round_id and rounds.player_id = auth.uid())
  );
create policy "players submit their own hole scores" on hole_scores
  for insert with check (
    exists (select 1 from rounds where rounds.id = hole_scores.round_id and rounds.player_id = auth.uid())
  );

-- unlock_events / mp_ledger: server-authoritative. Players may read their
-- own; NO client insert/update/delete grant exists at all — only the
-- service role (used by Edge Functions) can write these
-- (ARCHITECTURE.md §8, §9). This is the concrete mechanism behind "clients
-- cannot award themselves MP."
create policy "players read their own unlock events" on unlock_events
  for select using (auth.uid() = player_id);
create policy "players read their own mp ledger entries" on mp_ledger
  for select using (auth.uid() = player_id);

-- ============================================================
-- ROLLUPS
-- ============================================================
-- Derived, cached, always reconstructible from facts above. No client
-- write grants — service-role only, via Edge Functions.

create table player_course_progress (
  player_id uuid not null references player_profiles (id) on delete cascade,
  course_slug text not null references courses (slug),
  tier text not null check (tier in ('familiarity', 'competence', 'command', 'mastery', 'open_ended')),
  course_mp integer not null default 0,
  rounds_played integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (player_id, course_slug)
);

create table player_course_hole_stats (
  player_id uuid not null references player_profiles (id) on delete cascade,
  course_slug text not null references courses (slug),
  hole_number integer not null check (hole_number between 1 and 18),
  rounds_played integer not null default 0,
  best_strokes integer,
  best_relative_to_par integer,
  pars_or_better_count integer not null default 0,
  bogeys_or_worse_count integer not null default 0,
  last_played_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (player_id, course_slug, hole_number)
);

alter table player_course_progress enable row level security;
alter table player_course_hole_stats enable row level security;

create policy "players read their own course progress" on player_course_progress
  for select using (auth.uid() = player_id);
create policy "players read their own hole stats" on player_course_hole_stats
  for select using (auth.uid() = player_id);

-- ============================================================
-- INDEXES
-- ============================================================

create index rounds_player_course_idx on rounds (player_id, course_slug, date_played desc);
create index unlock_events_player_course_idx on unlock_events (player_id, course_slug);
create index mp_ledger_player_course_idx on mp_ledger (player_id, course_slug);
create index hole_scores_round_idx on hole_scores (round_id);
