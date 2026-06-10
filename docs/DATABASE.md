# DATABASE.md — Supabase Schema, RLS & Logic

## Tables

### `profiles`
Created automatically on first sign-in via a Supabase Auth trigger.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);
```

### `cards`
Seeded by the app — not user-created. Contains every hiragana (and future katakana/kanji) card.

```sql
create table cards (
  id uuid primary key default gen_random_uuid(),
  character text not null,         -- e.g. 'あ'
  romaji text not null,            -- e.g. 'a'
  type text not null,              -- 'hiragana' | 'katakana' | 'kanji'
  group_name text not null,        -- e.g. 'vowel' | 'k-group'
  genki_order int not null,        -- sort order per Genki curriculum
  example_word text,               -- optional Genki vocab word using this character
  example_word_romaji text
);
```

### `user_card_progress`
One row per user per card. Stores the full FSRS state for that card.

```sql
create table user_card_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  -- FSRS fields (ts-fsrs Card type)
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
```

### `review_logs`
Append-only log of every review action. Used for stats and weak card detection.

```sql
create table review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  card_id uuid not null references cards(id),
  rating text not null,            -- 'Again' | 'Hard' | 'Good' | 'Easy'
  reviewed_at timestamptz default now(),
  was_correct boolean not null
);
```

---

## Row Level Security (RLS)

Enable RLS on all tables. Users can only access their own data.

```sql
-- profiles
alter table profiles enable row level security;
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

-- user_card_progress
alter table user_card_progress enable row level security;
create policy "Users can read own progress"
  on user_card_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress"
  on user_card_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress"
  on user_card_progress for update using (auth.uid() = user_id);

-- review_logs
alter table review_logs enable row level security;
create policy "Users can insert own logs"
  on review_logs for insert with check (auth.uid() = user_id);
create policy "Users can read own logs"
  on review_logs for select using (auth.uid() = user_id);

-- cards (public read, no auth needed)
alter table cards enable row level security;
create policy "Cards are publicly readable"
  on cards for select using (true);
```

---

## FSRS Integration (ts-fsrs)

The FSRS scheduling logic runs **client-side** for MVP. When the user rates a card:

```ts
import { fsrs, generatorParameters, Rating, createEmptyCard } from 'ts-fsrs'

const f = fsrs(generatorParameters({ enable_fuzz: true }))

// Map UI rating to ts-fsrs Rating enum
const ratingMap = {
  Again: Rating.Again,
  Hard: Rating.Hard,
  Good: Rating.Good,
  Easy: Rating.Easy,
}

// Schedule next review
const now = new Date()
const scheduling = f.repeat(card, now)
const nextCard = scheduling[ratingMap[userRating]].card

// Persist nextCard fields to user_card_progress
```

The `nextCard` object maps directly to the columns in `user_card_progress`.
Always persist the full FSRS card state — never partial updates.

---

## Session Building Logic (client-side)

Run in `src/lib/session.ts`. Queries Supabase directly.

### Learn Mode
1. Fetch cards from `cards` table ordered by `genki_order`
2. Exclude cards that already have a row in `user_card_progress` for this user
3. Take the next 5 unseen cards
4. Fetch all `user_card_progress` rows where `due <= now()` for this user
5. Merge: new cards first, then due reviews

### Review Recent Mode
- `user_card_progress` where `due <= now()` AND `last_review >= now() - interval '7 days'`

### Review All Mode
- `user_card_progress` where `due <= now()`

---

## Auth Trigger

Auto-create a profile row on sign-up:

```sql
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
```

---

## Supabase Edge Functions (future)

When AI features are added, Edge Functions will handle:
- Weak spot analysis
- Mnemonic generation (calls external AI API)

Do not build these yet. When ready, create under `supabase/functions/`.

---

## Implementation Notes (kept in sync with code)

- **Schema** (PER-6): implemented verbatim as `supabase/migrations/20260529000000_init.sql` — all four tables, RLS enabled on each, plus the `handle_new_user` / `on_auth_user_created` trigger. Column names/types match the SQL above exactly.
- **Seeding** (PER-10): `supabase/seed.sql` populates `cards` from `src/lib/constants/hiragana.ts` (46 base hiragana, ordered by `genki_order` 1–46). Idempotency: `CREATE UNIQUE INDEX IF NOT EXISTS cards_character_type_key ON cards (character, type)` runs first, then `INSERT ... ON CONFLICT (character, type) DO NOTHING`. Run with `pnpm seed` (alias for `supabase db reset`) for local dev, `supabase db push` for linked remotes, or `psql $DATABASE_URL -f supabase/seed.sql` manually.
- **Session building** (PER-14): implemented in `src/features/session/utils/buildSession.ts` — queries Supabase directly per "Session Building Logic" above. See `docs/CODE_PRACTICES.md` "Implementation Notes" for why MVP feature code skips the Axios 3-layer.
- **FSRS persistence** (PER-14): `src/features/session/utils/persistReview.ts` calls `f.repeat(card, now)[rating].card` and upserts the FULL FSRS state to `user_card_progress`, then inserts a `review_logs` row with `rating` + `was_correct` (anything other than `Again` is correct). The ts-fsrs numeric `State` enum ↔ DB string mapping happens in this file.
- **Mastery mapping** (PER-15, reused by PER-16): not a DB column — derived client-side in `src/features/home/hooks/useHomeData.ts` `fsrsStateToMastery`. Rule: `state === 'Review'` AND `stability >= 21` days → `Mastered`; otherwise the FSRS state name maps 1:1 (`New` → `Unseen`, `Learning` stays, `Review` stays).
- **Reads** (PER-15/16): TanStack Query hooks wrap thin service files. Service files at `src/features/{home,progress}/services/<name>.service.ts` import the Supabase singleton from `src/lib/supabase.ts`. Joins (e.g. `user_card_progress → cards(character)`) normalise the array-vs-object shape with an explicit cast.
