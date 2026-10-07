-- OpsPulse: one row per user holding saved story ids, switched-off companies and the onboarding flag.
-- Story ids are text (daily stories look like d123, archive stories use stable slugs), so this table is separate from saved_items.
-- Run once in the Supabase SQL editor.

create table if not exists user_prefs (
  user_id     uuid primary key references profiles(id) on delete cascade,
  saved       text[]  not null default '{}',
  off         text[]  not null default '{}',
  onboarded   boolean not null default false,
  updated_at  timestamptz not null default now()
);

alter table user_prefs enable row level security;

drop policy if exists "own prefs" on user_prefs;
create policy "own prefs" on user_prefs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
