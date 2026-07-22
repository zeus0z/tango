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

Run in `src/features/session/utils/buildSession.ts`. Queries Supabase directly.

### Learn Mode
The atomic "learn together / reset together" unit is `cards.group_name` (`'vowel'`, `'k-group'`, `'s-group'`, ...) — **not** a fixed character count. Group sizes vary: vowel/k/s/t/n/h/m-groups = 5, y-group = 3, w-group = 2, standalone `ん` = 1, dakuten/handakuten groups = 5 each. A session always teaches exactly one whole group_name, never splitting one across two sessions and never combining two groups into one.

1. Fetch every `cards` row + this user's `user_card_progress` rows.
2. Walk base-character groups (`derives_from IS NULL`) in `genki_order` order to find the first group_name that isn't fully learned (i.e. not every base card in it has a progress row). Every earlier group is 'complete'; the target group is either:
   - **untouched** — none of its base cards have a progress row yet, or
   - **partial** — some but not all do, meaning a previous Learn session was abandoned mid-group.
3. If the target group is **partial**, reset it before teaching: hard-delete `user_card_progress` + `review_logs` rows for its already-seen base cards, **plus** any already-seen derived/dakuten card whose `derives_from` is one of that group's characters (a derived card only ever gets a progress row via the "introduce-pair" step attached to its base group's teaching pass — its own group_name can never become the "target group" on its own, since derived cards are excluded from the base-character walk). This reset must run as a one-shot step gated to session-entry, never inside a query function that could re-fire on a window-focus refetch mid-session (see Implementation Notes below).
4. Teach that group's base characters (paired with any not-yet-introduced derived variant) — same introduce → drill TypeA → drill TypeB → cumulative-drill-of-previously-taught loop as before.

New-character teaching only — no FSRS-due cards are merged in. Due reviews surface exclusively via Review All Mode.

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

`handle_new_user` is `SECURITY DEFINER` and pinned with `set search_path = ''` (all refs inside are schema-qualified). `EXECUTE` is revoked from `public`/`anon`/`authenticated` since it must only run via the trigger, never as a direct `/rest/v1/rpc/handle_new_user` call — see `supabase/migrations/20260619000000_harden_handle_new_user.sql`.

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
- **Group-scoped Learn mode + abandoned-group reset** (2026-07-22): `findTargetGroup` (internal to `buildSession.ts`) fetches `cards` + `user_card_progress` once and reuses both for `resetAbandonedGroupIfAny` and `buildLearnTeachingQueue` — no repeat `cards` round-trip, and the test mock (`@/test/supabase-mock`) can't differentiate two calls to the same table anyway, since it ignores filter args and returns one fixture per table. `resetAbandonedGroupIfAny` is exported and must be awaited to completion *before* `useTeachingPlanQuery` is enabled — wired in `SessionPage.tsx` via `useResetAbandonedGroup` (`src/features/session/hooks/useSessionQueue.ts`), a one-shot `useEffect` gated by a `useRef`, deliberately not a TanStack Query. `useTeachingPlanQuery` sets `staleTime: 0` and the global `queryClient` (`src/lib/queryClient.ts`) defaults `refetchOnWindowFocus: true`, so embedding the reset check inside `buildLearnTeachingQueue`'s queryFn would let an ordinary alt-tab-back mid-session re-run it and delete progress the user just earned. No grace period — any partial group found at Learn-session entry is reset immediately, including an in-page reload mid-lesson. Detection only runs on Learn-mode entry, not globally on login; Review All keeps surfacing whatever progress rows exist until Learn mode is opened again. `NEW_CARDS_PER_SESSION` is gone — group size now varies per curriculum group.
- **FSRS persistence** (PER-14): `src/features/session/utils/persistReview.ts` calls `f.repeat(card, now)[rating].card` and upserts the FULL FSRS state to `user_card_progress`, then inserts a `review_logs` row with `rating` + `was_correct` (anything other than `Again` is correct). The ts-fsrs numeric `State` enum ↔ DB string mapping happens in this file.
- **Learn mode never passes a user-chosen rating.** `TeachingSessionView` calls `persistReview` with a fixed `rating: 'Good'` on every correct drill answer (and `'Again'` on wrong, same as Review mode) — there is no Hard/Good/Easy UI in Learn mode. Rating choice is a Review-mode-only concept; Learn mode just needs *some* FSRS write so a newly-taught card transitions out of "unseen" and gets a due date. Infinite Review (`InfiniteReviewSessionView.tsx`) is the one mode that never calls `persistReview`/`fetchCardProgress` at all — by design, not a gap.
- **Mastery mapping** (PER-15, reused by PER-16): not a DB column — derived client-side in `src/features/home/hooks/useHomeData.ts` `fsrsStateToMastery`. Rule: `state === 'Review'` AND `stability >= 21` days → `Mastered`; otherwise the FSRS state name maps 1:1 (`New` → `Unseen`, `Learning` stays, `Review` stays).
- **Reads** (PER-15/16): TanStack Query hooks wrap thin service files. Service files at `src/features/{home,progress}/services/<name>.service.ts` import the Supabase singleton from `src/lib/supabase.ts`. Joins (e.g. `user_card_progress → cards(character)`) normalise the array-vs-object shape with an explicit cast.
- **Linter hardening** (2026-06-19): `supabase/migrations/20260619000000_harden_handle_new_user.sql` fixes the Supabase database linter's `function_search_path_mutable` and `anon`/`authenticated_security_definer_function_executable` warnings on `handle_new_user`. The linter's third warning, `auth_leaked_password_protection`, is a Dashboard-only toggle (Authentication → Providers → Email → "Prevent use of leaked passwords") and requires the **Pro plan** — not fixable via migration while on the free tier (see `docs/STACK.md`).
