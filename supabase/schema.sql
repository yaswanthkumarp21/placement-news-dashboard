-- Placement News Dashboard: database schema (Phase 2)
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE where possible).

-- ============ Reference data (config; edited by Claude Code on request) ============

create table if not exists companies (
  id          text primary key,            -- slug, e.g. 'hul'
  name        text not null,
  industry    text,
  is_default  boolean not null default true,  -- shown to every new user until deselected
  created_at  timestamptz not null default now()
);

create table if not exists roles (
  id          bigint generated always as identity primary key,
  company_id  text not null references companies(id) on delete cascade,
  title       text not null,               -- e.g. 'Supply Chain Management Trainee'
  function    text not null,               -- ops / sales / marketing / finance / strategy / hr / tech
  level       text,
  description text,
  unique (company_id, title)
);

-- ============ News ============

create table if not exists articles (
  id            bigint generated always as identity primary key,
  dedupe_key    text not null unique,      -- hash of normalized headline + date; makes loads idempotent
  view          text not null check (view in ('archive', 'daily')),
  company_id    text references companies(id) on delete set null,
  industry      text,
  headline      text not null,
  recap         text,                       -- 1-2 lines
  source_url    text not null,              -- required: no link, no entry
  source_name   text,
  also_covered  jsonb not null default '[]',-- [{name,url}] other outlets, same story
  function_tags text[] not null default '{}',
  type_tag      text,                       -- results, deal, leadership, expansion, layoffs, hiring, regulation, product...
  published_at  date not null,
  fetched_at    timestamptz not null default now(),
  status        text not null default 'done' check (status in ('done', 'pending'))
);

-- Inference pointers (1-3 each). Role-specific rows have role_id; generic rows have role_id null.
create table if not exists inferences (
  id          bigint generated always as identity primary key,
  article_id  bigint not null references articles(id) on delete cascade,
  role_id     bigint references roles(id) on delete cascade,
  pointers    text[] not null check (array_length(pointers, 1) between 1 and 3)
);
create unique index if not exists inferences_one_per_role
  on inferences (article_id, coalesce(role_id, 0));

create index if not exists articles_company_date on articles (company_id, published_at desc);
create index if not exists articles_view_date    on articles (view, published_at desc);
create index if not exists articles_tags         on articles using gin (function_tags);

-- ============ Users ============

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile when someone signs in with Google for the first time.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Opt-out model: every default company is on; a row here means the user turned it OFF.
create table if not exists user_deselected_companies (
  user_id     uuid not null references profiles(id) on delete cascade,
  company_id  text not null references companies(id) on delete cascade,
  primary key (user_id, company_id)
);

-- The role a user is preparing for (optional). Drives role-specific pointers.
create table if not exists user_roles (
  user_id  uuid not null references profiles(id) on delete cascade,
  role_id  bigint not null references roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table if not exists saved_items (
  user_id     uuid not null references profiles(id) on delete cascade,
  article_id  bigint not null references articles(id) on delete cascade,
  saved_at    timestamptz not null default now(),
  primary key (user_id, article_id)
);

-- ============ Security (Row Level Security) ============
-- News and reference data: readable by signed-in users only. Written only by the
-- server jobs using the service-role key (which bypasses RLS).
-- User tables: each user sees and edits only their own rows.

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false)
$$;

alter table companies                  enable row level security;
alter table roles                      enable row level security;
alter table articles                   enable row level security;
alter table inferences                 enable row level security;
alter table profiles                   enable row level security;
alter table user_deselected_companies  enable row level security;
alter table user_roles                 enable row level security;
alter table saved_items                enable row level security;

drop policy if exists "read companies"  on companies;
drop policy if exists "read roles"      on roles;
drop policy if exists "read articles"   on articles;
drop policy if exists "read inferences" on inferences;
create policy "read companies"  on companies  for select to authenticated using (true);
create policy "read roles"      on roles      for select to authenticated using (true);
create policy "read articles"   on articles   for select to authenticated using (true);
create policy "read inferences" on inferences for select to authenticated using (true);

drop policy if exists "own profile read"  on profiles;
create policy "own profile read" on profiles for select to authenticated
  using (id = auth.uid() or is_admin());
-- Profiles are not directly updatable by users (prevents self-promotion to admin).

drop policy if exists "own deselections" on user_deselected_companies;
create policy "own deselections" on user_deselected_companies for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own roles" on user_roles;
create policy "own roles" on user_roles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own saved" on saved_items;
create policy "own saved" on saved_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============ After your first Google sign-in, make yourself admin ============
-- update profiles set is_admin = true where email = 'yaswanthkumar.p21@gmail.com';
-- Removing a user later: Admin page in the app (calls Supabase's admin API with the
-- service-role key on the server), or Supabase dashboard -> Authentication -> Users.
