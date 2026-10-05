-- Daily news job: two extra columns on articles. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run.

alter table articles add column if not exists bullets text[] not null default '{}';  -- the 3 interview/GD angles
alter table articles add column if not exists importance numeric;                     -- 0 = not relevant, 1-10 = how useful for Ops interviews

create index if not exists articles_daily_rank
  on articles (view, importance desc nulls last, published_at desc);

-- Note: the website reads these rows on the server with the service-role key, so no new public read policy is added.
