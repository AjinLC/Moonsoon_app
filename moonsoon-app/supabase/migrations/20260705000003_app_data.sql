-- Additive migration: app data (tarot draw history, planner tasks & goals,
-- horoscope detail level, birth coordinates). Run after migration_002_theme.sql.

-- profiles: new preference + coordinates columns
alter table public.profiles
  add column if not exists horoscope_detail_level text
  check (horoscope_detail_level in ('brief', 'standard'))
  default 'standard';

alter table public.profiles
  add column if not exists birth_lat double precision;

alter table public.profiles
  add column if not exists birth_lng double precision;

-- Daily tarot draws (one row per user per day)
create table if not exists public.tarot_draws (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  draw_date date not null,
  card_ids text[] not null,
  reversed boolean[] not null,
  created_at timestamptz default now(),
  unique (user_id, draw_date)
);

alter table public.tarot_draws enable row level security;

drop policy if exists "Users manage own draws" on public.tarot_draws;
create policy "Users manage own draws"
  on public.tarot_draws for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Planner tasks (due_time null = "no set time")
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  due_date date not null,
  due_time time,
  done boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists tasks_user_date_idx on public.tasks (user_id, due_date);

alter table public.tasks enable row level security;

drop policy if exists "Users manage own tasks" on public.tasks;
create policy "Users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Planner goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  scope text not null check (scope in ('week', 'month', 'year')),
  progress integer not null default 0,
  target integer not null default 1 check (target > 0),
  created_at timestamptz default now()
);

alter table public.goals enable row level security;

drop policy if exists "Users manage own goals" on public.goals;
create policy "Users manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
