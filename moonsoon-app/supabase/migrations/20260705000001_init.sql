-- Run this in the Supabase SQL editor on first project setup.

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  date_of_birth date,
  time_of_birth time,
  place_of_birth text,
  onboarding_complete boolean default false,
  accent_color text default 'indigo',
  theme text default 'light',
  focus_areas text[] default '{}',
  notifications_mantra boolean default true,
  notifications_horoscope boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read/write own profile" on public.profiles;
create policy "Users can read/write own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
