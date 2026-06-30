# FEATURES.md — App Feature Specification

## 1. Authentication

- Supported methods: **Google OAuth** (primary) — **Email + Password** is temporarily disabled, see Implementation Notes below
- All routes except `/` (landing page) require authentication
- On first login, a user profile and progress record is created automatically
- Auth state is managed via Supabase Auth and persisted via the Supabase JS client
- After login, redirect to `/home`

---

## 2. Landing Page (`/`)

The only public-facing page. Must be polished enough to advertise the app.
Content: headline, short description, login/signup CTA.
This is the only page where SEO matters — use proper meta tags and Open Graph.
Single centered column on all breakpoints, sized to fit one viewport — no scrolling.

---

## 3. Home Screen (`/home`)

Shown after login. Displays:
- **Daily goal tracker**: "X new cards learned today" with a visual progress bar (target: 5/day)
- **Alphabet progress map**: grid of all hiragana characters, each cell colour-coded by mastery state
  - Unseen (grey), Learning (yellow), Review (blue), Mastered (green)
- **Milestones**: contextual banners, e.g. "You completed the vowel group!"
- **Session mode selector**: three spaced-repetition buttons to start a session, plus a separate **Infinite Review** button
  - A small **green note** sits under the 🌱 Learn button: _"Do this daily to become fluent in Japanese."_ — daily spaced repetition is the primary path; Infinite Review is optional practice.

### Session Modes
| Mode | Description |
|---|---|
| 🌱 Learn | 5 new cards (Genki order) + all cards due today via FSRS |
| 🔁 Review Recent | Only cards introduced in the last 7 days that are due |
| 📚 Review All | Every card due today based on full FSRS history |
| ♾️ Infinite Review | Endless practice of all learnt cards of one script — opens a setup screen first (see §5.5). Practice-only, does **not** touch FSRS. |

---

## 4. Card Types

### Type A — Symbol → Sound (Full Grid)
- **Front**: Japanese character (e.g. `あ`)
- **Back**: Full romaji sound grid displayed as the traditional hiragana chart layout
- User taps the correct romaji sound from the grid
- This is intentionally harder — no process of elimination, must truly know the character
- Grid layout will be provided via screenshot reference — match it exactly

### Type B — Sound → Symbol (6 Options)
- **Front**: Romaji sound (e.g. `ka`)
- **Back**: 6 hiragana characters displayed as a grid of tappable cards
- Distractors are always from the same phonetic family when possible
- (e.g. for `ka`, mix in characters from the k-group + 1–2 random others)

---

## 5. Study Session (`/session`)

### Flow
1. User selects a session mode from Home
2. Cards are loaded and queued based on mode logic
3. One card shown at a time, full screen, distraction-free
4. Progress bar at top: "Card 6 of 13"
5. User answers (taps a choice)
6. Result is revealed and **stays visible** (correct/incorrect highlight does not
   auto-clear) until the user taps **Next**
7. What happens next depends on the mode and the answer:
   - **Wrong** (any mode): auto-rated **Again**, card re-enters the queue — no rating
     buttons, just a **Next** button once the marking has been seen
   - **Correct, Learn mode**: silently auto-rated **Good** in the background (Learn
     mode never asks the user to judge difficulty — that's a Review-mode concern) —
     just a **Next** button
   - **Correct, Review Recent / Review All**: show 3 rating buttons — **Hard**,
     **Good**, **Easy** — picking one both rates and advances
   - **Correct or wrong, Infinite Review**: just a **Next** button either way — this
     mode never rates or persists anything (see §5.5)
8. On rating (automatic or user-chosen), FSRS schedules the next review and saves to
   DB — except Infinite Review, which never writes to FSRS
9. Session ends when queue is empty → summary screen (Infinite Review has no end —
   see §5.5)

### Session Summary Screen
- Total cards reviewed
- Accuracy percentage
- Number of new cards learned
- Button to return home

### Card Animation
- Smooth transition between cards (Framer Motion)
- Correct answer: green highlight, animates in then **stays** (does not fade back out)
- Wrong answer: red highlight + shake animation, then **stays** red on the tapped
  option with the correct option marked green, until **Next** is tapped

---

## 5.5 Infinite Review (`/infinite-review` → `/session`)

A **secondary, optional** practice mode. Unlike spaced repetition (which surfaces only due cards), Infinite Review drills **every card the user has already learnt** of a chosen script, looping forever until the user exits.

**It is pure practice: it never writes to FSRS, `user_card_progress`, `review_logs`, or the daily counters.** The real spaced-repetition schedule is never distorted by it.

### Setup / details screen (`/infinite-review`)
1. Tapping the ♾️ button on Home opens this screen (not a session directly).
2. Explains what the mode does and that it does not affect the spaced-repetition schedule.
3. **Single-select** script chooser: hiragana / katakana / kanji. Scripts with **no learnt cards** are disabled (e.g. katakana/kanji until those decks exist).
4. **Start** → navigates to `/session` with `{ mode: 'infinite-review', script }`.
5. Back returns to Home.

### Session flow
1. Loads all learnt cards of the chosen script (any state, `reps > 0`), shuffled.
2. One Type B card at a time; reveal then self-mark correct / incorrect. Feedback
   stays on screen and a **Next** button appears — no FSRS rating buttons (no
   scheduling) either way.
3. Wrong answers requeue toward the end.
4. When the queue is exhausted it **reshuffles and restarts** — the session never auto-ends.
5. A header shows an **Exit** button (→ Home) and a running "X reviewed this session" counter. No summary screen.

---

## 6. Curriculum & Deck Structure

- Cards are **pre-built and seeded** in the database — users do not create their own
- Order follows **Genki I/II** phonetic groupings:
  - Day 1: Vowels (あ い う え お)
  - Day 2: K-group (か き く け こ)
  - Day 3: S-group (さ し す せ そ) — and so on
- Each character has both a Type A and Type B card
- Katakana deck unlocks after hiragana is 80% mastered
- Each card back optionally shows a **Genki example word** using that character

---

## 7. Progress & Stats (`/progress`)

- Alphabet progress map (same as home, but larger and interactive)
- Tap any character to see its mastery state and next review date
- Study history: cards reviewed per day (calendar heatmap style)
- Weak cards section: characters with lowest retention rate

---

## 8. Future Features (do not build yet)

- Drawing card type (motor memory, self-rated)
- AI-powered weak spot detection (FastAPI backend)
- AI-generated mnemonics for hard characters
- Katakana and Kanji decks beyond hiragana

---

## Implementation Notes (kept in sync with code)

> Reflects what is actually shipped. Specs above describe intent; this section records reality.

### §1 Auth (PER-11, PER-33)
- `src/features/auth/` — `useAuth` hook + `AppAuthProvider` (mounted once between `ErrorBoundary` and the router in `App.tsx`) subscribe to `supabase.auth.onAuthStateChange` and sync the session into the Zustand auth slot.
- `LoginPage` shows Google OAuth only — the tab toggle and email/password form are commented out in place (not deleted), pending a custom SMTP provider. See `docs/email-templates.md` "Future polish". Auth errors → sonner toast. On success: `navigate('/home')`.
- Google OAuth uses `supabase.auth.signInWithOAuth({ provider: 'google' })`; the redirect URL is configured in the Supabase project, not in the client. The Google provider must be enabled in Supabase Dashboard → Authentication → Providers with a Google Cloud OAuth Client ID/Secret, and the consent screen must be published to **Production** (not Testing — Testing's 100-user allow-list blocks anyone not manually added).
- **Auth resolution pattern (PER-33):** Both `ProtectedRoute` (routing gate) and `useAuthListener` (Zustand sync) use **only** `supabase.auth.onAuthStateChange` — no `getSession()` call. `onAuthStateChange` fires `INITIAL_SESSION` (cached session or null) or `SIGNED_IN` (after OAuth hash exchange), always after the Supabase client has finished processing the URL hash. Calling `getSession()` first raced against this async hash processing and caused the OAuth redirect to `/home` to immediately bounce back to `/` before the session was established.
- Profile + initial progress rows are created server-side by the `handle_new_user` trigger from D1.
- shadcn `input.tsx` and `label.tsx` primitives were added by this issue.

### §2 Landing (PER-12)
- Full SEO / OG / Twitter Card head tags injected via `index.html`; PWA manifest + icon links stay owned by F8.
- Trimmed to a single centered column with no card preview, so the whole page fits one
  viewport (mobile and desktop) without scrolling.

### §3 Home (PER-15)
- `AlphabetProgressMap` lives at `src/components/AlphabetProgressMap.tsx` (shared — PER-16 imports it). Props: `{ progress: Record<string, MasteryState>; size?: 'sm' | 'md' | 'lg'; onCellPress?: (character: string) => void }`. Home uses `size='sm'` non-interactive; Progress uses `size='lg'` with `onCellPress`.
- **Daily goal** definition: count of distinct `card_id`s with `was_correct = true` in `review_logs` since UTC midnight. Target 5/day.
- **Mastery threshold (locked-in convention)**: FSRS `state === 'Review'` AND `stability >= 21` days → `Mastered`. Lower stability stays `Review`. `Learning` and `New` (Unseen) map 1:1.
- **Mode handoff** to `/session`: React Router location state — `navigate('/session', { state: { mode } })`.
- Milestone banner derives from `progress` grouped by `group_name` from constants (e.g. "You completed the vowel group!").

### §4 Cards (PER-13)
- `src/features/cards/` exports `CardTypeA`, `CardTypeB`, `RomajiGrid`, `AnswerFeedback` via the barrel.
- Type A back is a 10×5 grid + lone `n` + backspace + blue checkmark, matching `docs/sounds_options.jpeg` exactly. Romaji uses `'fu'` for ふ (not `'hu'`) — must match `hiragana.ts`.
- Type B picks 5 distractors via `getDistractors` from `src/lib/constants/distractors.ts` (same-phonetic-family preference).
- Presentational only — `(card, onAnswer)` in, no Supabase / no FSRS / no data fetching. The session screen wires those.
- Animations: correct → green flash that **holds** on green; wrong → red flash + horizontal shake that **holds** on red (tapped option) + green (correct option). `onAnswer` fires once the hold begins; the session view (not the card) decides when to actually advance, via a Next button.
- Option order: CardTypeB shuffles correct + 5 distractors with `Math.random()` on every mount (not seeded by `card.id`) — the same card shows a different tile layout every time it's presented.

### §5 Session (PER-14)
- Queue builders in `src/features/session/utils/buildSession.ts` (Learn / Review Recent / Review All) hit Supabase directly per the "Session Building Logic" section of `docs/DATABASE.md`. New-first merge for Learn mode.
- `persistReview.ts` runs `ts-fsrs.repeat()`, persists the full FSRS card state to `user_card_progress`, and appends a `review_logs` row. `was_correct` is `true` for Hard/Good/Easy and `false` for Again. Maps ts-fsrs `State` enum ↔ DB string.
- Card-type selection: Type A for unseen/Learning cards (recognition); Type B for Review (recall).
- Wrong answers auto-rate `Again` and requeue at the END of the queue, so the user re-sees them before the session ends — the requeue/advance is now deferred to an explicit `NextButton` tap rather than firing automatically.
- **Learn mode never shows rating buttons.** `TeachingSessionView` auto-rates every correct drill answer `Good` (no user choice) and every wrong one `Again` (unchanged), then shows `NextButton` either way. `RatingButtons.tsx` is not imported here at all.
- Rating buttons (`RatingButtons.tsx`): Hard (amber, secondary) / **Good (primary, ≥56px, flex-2)** / Easy (blue) — used **only** by `ReviewSessionView`'s correct-answer path (Review Recent / Review All). Its wrong-answer path uses `NextButton` like everywhere else.
- `NextButton.tsx`: single CTA, styled like `IntroduceCharacter`'s "Got it →" button. Used for: Learn mode (both outcomes), Review Recent/All's wrong-answer path, and Infinite Review (both outcomes, see §5.5).
- Summary screen derives counters from session-local state, then "return home" → `/home`.
- Session-internal state (queue, queue index, daily counters) lives in the Zustand `studySession` + `dailyProgress` slots.

### §5.5 Infinite Review (PER-26)
- Read-only queue builder `buildInfiniteReviewQueue(userId, script)` in `buildSession.ts`: like Review All but **no `due` filter** and `.eq('type', script)`; "learnt" = `user_card_progress.reps > 0`. `fetchLearntScriptCounts(userId)` returns per-script learnt counts to drive the setup screen's enable/disable.
- Hooks: `useInfiniteReviewQueue` + `useLearntScriptCounts` in `useSessionQueue.ts`.
- Setup screen `src/pages/InfiniteReviewPage.tsx` (route `/infinite-review`): single-select script chooser → `navigate('/session', { state: { mode: 'infinite-review', script } })`.
- `InfiniteReviewSessionView.tsx`: adapted from `ReviewSessionView` but **zero persistence** — no `persistReview`, no `fetchCardProgress`, no `incrementReviewed/incrementLearned`. Loops forever (reshuffle on exhaustion), Exit button → `/home`, no `SessionSummary`. Both correct and wrong answers show a `NextButton` (feedback stays visible) rather than calling `advance()` immediately — same pacing as every other mode, still with no rating and no persistence.
- `SessionPage` branches on `mode === 'infinite-review'` before the learn/review split, reusing the loading/error/empty scaffolding.

### §7 Progress (PER-16)
- `src/features/progress/` ships:
  - `progress.service.ts`: three Supabase queries (full progress map, last-84-day per-day counts, top-10 weak cards with ≥3 reviews sorted by accuracy ascending).
  - `useProgressData.ts`: TanStack Query hooks; reuses `fsrsStateToMastery` from `src/features/home/hooks/useHomeData.ts` to stay aligned with A5.
  - `CharacterDetailDialog.tsx`: shadcn `Dialog` showing character (lang="ja"), romaji, group/genki order, coloured mastery pill, relative next-review date, reps/lapses/accuracy. Unseen cards show a "not seen yet" state.
  - `StudyHeatmap.tsx`: hand-rolled 12-week × 7-day CSS grid with month + day-of-week labels, green-opacity scale, today ring.
  - `WeakCardsList.tsx`: full-width tappable rows (≥48px), accuracy colour-coded.
- `AlphabetProgressMap` consumed with `size='lg'` and `onCellPress` → opens the detail dialog. Component not modified — A5 still owns it.
