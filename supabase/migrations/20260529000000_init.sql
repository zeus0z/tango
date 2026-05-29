-- ============================================================
-- Nihongo Flash — initial schema
-- Migration: 20260529000000_init.sql
-- ============================================================

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

-- profiles (created automatically on first sign-in via the trigger below)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- cards (seeded by the app, not user-created)
create table cards (
  id uuid primary key default gen_random_uuid(),
  character text not null,
  romaji text not null,
  type text not null,              -- 'hiragana' | 'katakana' | 'kanji'
  group_name text not null,        -- e.g. 'vowel' | 'k-group'
  genki_order int not null,
  example_word text,
  example_word_romaji text
);

-- user_card_progress (one row per user per card; full FSRS state)
create table user_card_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  due timestamptz not null default now(),
  stability float not null default 0,
  difficulty float not null default 0,
  elapsed_days int not null default 0,
  scheduled_days int not null default 0,
  reps int not null default 0,
  lapses int not null default 0,
  state text not null default 'New',   -- 'New' | 'Learning' | 'Review' | 'Relearning'
  last_review timestamptz,
  unique(user_id, card_id)
);

-- review_logs (append-only log of every review)
create table review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  card_id uuid not null references cards(id),
  rating text not null,            -- 'Again' | 'Hard' | 'Good' | 'Easy'
  reviewed_at timestamptz default now(),
  was_correct boolean not null
);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table profiles enable row level security;
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

alter table user_card_progress enable row level security;
create policy "Users can read own progress"
  on user_card_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress"
  on user_card_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress"
  on user_card_progress for update using (auth.uid() = user_id);

alter table review_logs enable row level security;
create policy "Users can insert own logs"
  on review_logs for insert with check (auth.uid() = user_id);
create policy "Users can read own logs"
  on review_logs for select using (auth.uid() = user_id);

alter table cards enable row level security;
create policy "Cards are publicly readable"
  on cards for select using (true);

-- ------------------------------------------------------------
-- Auth trigger: auto-create a profile row on signup
-- ------------------------------------------------------------

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
