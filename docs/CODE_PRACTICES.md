# CODE_PRACTICES.md — Code Standards & Conventions

## General

- Language: **TypeScript strict mode** everywhere. No `any`. No `// @ts-ignore`.
- Formatting: **Prettier** with default config. Run on save.
- Linting: **ESLint** with `eslint-config-react-app` + `@typescript-eslint`.
- No unused imports, no unused variables — CI should fail on these.
- All async operations must handle errors explicitly — no silent failures.

---

## Component Structure

Each feature lives in `src/features/<feature-name>/`:

```
src/features/session/
  components/       # UI components scoped to this feature
  hooks/            # Custom hooks scoped to this feature
  utils/            # Pure functions (session building, card filtering)
  index.ts          # Public API — only export what other features need
```

Shared/global components live in `src/components/`.

### Component Rules
- One component per file. File name = component name (PascalCase).
- Prefer **function components** with hooks. No class components.
- Props must always be typed with an explicit interface above the component.
- Keep components small. If JSX exceeds ~80 lines, split it.

```tsx
// Good
interface CardFrontProps {
  character: string
  onReveal: () => void
}

export function CardFront({ character, onReveal }: CardFrontProps) { ... }
```

---

## Hooks

- Custom hooks live in `hooks/` (feature-scoped or global)
- Hook names always start with `use`
- Hooks should do one thing — data fetching OR state management, not both
- Data fetching hooks use **TanStack Query** (`useQuery`, `useMutation`)

```ts
// Good: focused hook
export function useCardsDueToday() {
  return useQuery({
    queryKey: ['cards', 'due'],
    queryFn: fetchCardsDueToday,
  })
}
```

---

## State Management

- **Local UI state**: `useState` / `useReducer`
- **Server state** (Supabase data): TanStack Query
- **Global app state** (auth, session queue, daily progress): Zustand store in `src/lib/store.ts`
- Do not put server data in Zustand — that's what TanStack Query is for

---

## API Service Layer

All data access follows a strict 3-layer architecture. Never skip a layer.

```
TanStack Query (async state, caching, refetching)
    └── API Service (business-level functions, typed)
            └── Axios instance (base URL, auth headers, interceptors)
```

### Layer 1 — Custom Axios Instance (`src/lib/axios.ts`)

One instance, configured once. All requests go through here.

```ts
import axios from 'axios'
import { supabase } from './supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

// Attach Supabase JWT to every request automatically
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Global error handling — 401 redirects to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)
```

### Layer 2 — API Service (`src/features/<name>/services/<name>.service.ts`)

Named functions that call the Axios instance. No TanStack Query here — pure async functions.
Typed with generated Supabase types or explicit interfaces.

```ts
// src/features/session/services/session.service.ts
import { api } from '@/lib/axios'
import type { CardProgress } from '@/types'

export async function fetchCardsDueToday(): Promise<CardProgress[]> {
  const { data } = await api.get('/cards/due')
  return data
}

export async function submitReview(cardId: string, rating: Rating): Promise<CardProgress> {
  const { data } = await api.post(`/cards/${cardId}/review`, { rating })
  return data
}
```

### Layer 3 — TanStack Query (`src/features/<name>/hooks/use<Name>.ts`)

Wraps service functions. Handles caching, loading, error states. Used directly in components.

```ts
// src/features/session/hooks/useCardsDueToday.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCardsDueToday, submitReview } from '../services/session.service'

export function useCardsDueToday() {
  return useQuery({
    queryKey: ['cards', 'due'],
    queryFn: fetchCardsDueToday,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, rating }: { cardId: string; rating: Rating }) =>
      submitReview(cardId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', 'due'] })
    },
  })
}
```

### Rules
- Components **only** import from TanStack Query hooks — never from services or axios directly
- Service functions **only** import from the axios instance — never from TanStack Query
- The axios instance **only** handles transport and auth — no business logic
- One service file per feature. One hooks file per service function (or group of related ones)
- Supabase direct calls (auth, realtime) are the exception — those stay in `src/lib/supabase.ts`

---

## File Naming

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `CardFront.tsx` |
| Hooks | camelCase | `useSession.ts` |
| Utils | camelCase | `buildSession.ts` |
| Types | PascalCase | `Card.ts` |
| Pages | PascalCase | `HomePage.tsx` |
| Constants | SCREAMING_SNAKE | `GENKI_ORDER.ts` |

---

## Constants & Seed Data

- All hiragana character data lives in `src/lib/constants/hiragana.ts`
- Genki curriculum order is defined there as a typed array — never hardcoded inline
- Card distractors for Type B cards are generated from the same constants file

---

## Error Handling

- Use an `ErrorBoundary` component at the page level (class component in `src/components/ErrorBoundary.tsx`)
- Every React Router route must specify `errorElement: <RouteErrorPage />` — both the parent layout route and every child route — so React Router never falls back to its default error UI
- TanStack Query error states must be handled in every `useQuery` consumer
- Auth errors redirect to `/` with a toast message
- Never `console.error` in production — use `reportError()` from `src/lib/errorReporter.ts`
- To wire an external error service (e.g. Sentry): call `setErrorReporter()` in `main.tsx` once at boot; the reporter is a no-op until configured

---

## Adding a New Feature

Before writing code:
1. Update `docs/FEATURES.md` with the new UX flow
2. Update `docs/DATABASE.md` if new tables/policies are needed
3. Update `docs/UI.md` if new components or patterns are introduced
4. Create the feature folder under `src/features/<name>/`
5. Follow all conventions in this file

---

## Implementation Notes (kept in sync with code)

### Data access — MVP vs future
The 3-layer Axios pattern above is the **future** architecture, scaffolded for the planned AI/FastAPI backend. **MVP feature code uses the Supabase JS client directly** for cards / progress / reviews. The live pattern, used by every feature shipped:

```
TanStack Query (hooks/use*.ts)
    └── Service function (services/<name>.service.ts) — imports singleton from src/lib/supabase.ts
            └── Supabase JS client (typed, RLS-protected)
```

Examples: `src/features/{home,session,progress}/services/*.service.ts`.

**Only move a feature to the Axios 3-layer pattern when that endpoint actually moves to the AI backend.** Don't pre-emptively wrap Supabase calls in Axios.

### Cross-feature contracts
When two features need to coordinate (e.g. `/home` → `/session` mode handoff), prefer **React Router location state** for one-shot intents (`navigate(path, { state: { ... } })`) and Zustand for persistent shared state. State the mechanism in the owning feature's implementation note. Mode handoff was the first contract reconciled this way — see `src/pages/SessionPage.tsx` and `src/features/home/components/SessionModeSelector.tsx`.

### Public APIs
Every feature folder ships a barrel `src/features/<name>/index.ts` exposing only what other features (or pages) need — internal components/hooks stay non-exported. Pages import from the barrel, never from internal paths. Match this pattern.

### Conventions confirmed in shipped code
- Page-level pages live at `src/pages/<Name>Page.tsx`; feature internals live under `src/features/<feature>/{components,hooks,utils,services}`.
- Shared shadcn primitives: `src/components/ui/`. Truly cross-feature components (e.g. `AlphabetProgressMap.tsx`): `src/components/`.
- Constants barrel: `src/lib/constants/index.ts`. Types barrel: `src/types/index.ts`.
- Zustand slot shape is owned by F7 (`src/lib/store.ts`) — features FILL slots but don't restructure the store.
- Routing is owned by F7 (`src/router.tsx`) — feature work never edits the router.
- Use `sonner` for toasts (not Radix toast). It's already wired by F7.
- Library docs: use the **`context7` MCP** (`mcp__context7__resolve-library-id` → `mcp__context7__query-docs`) for any library, framework, SDK, API, or CLI — see CLAUDE.md Golden Rules.

### User preference / appearance pattern (fonts, themes)
For any device-local, non-critical user preference (Japanese font, color theme, etc.), follow the shape established by `src/lib/fonts.ts` and `src/lib/themes.ts`:
- A dedicated `src/lib/<preference>.ts` module exporting: a typed `Option[]` constant, an `apply<X>()` function that writes CSS custom properties onto `document.documentElement.style` (no React re-render needed — the cascade handles it), `getPersisted<X>Id()` (reads `localStorage`, falls back to a `DEFAULT_<X>_ID` constant, safe to call during module init before React mounts), and `persistAndApply<X>()` (writes `localStorage` + calls `apply<X>()`).
- Persist to **`localStorage` only** — not Supabase — unless the preference genuinely needs cross-device sync. This keeps the pattern dependency-free and instant (no network round-trip, no loading state).
- A matching Zustand slot (`<x>Id`/`set<X>Id`) in `src/lib/store.ts`, seeded from `getPersisted<X>Id()` at store creation, plus `use<X>Id()`/`useSet<X>Id()` selector hooks.
- A blocking inline `<script>` in `index.html`, reading the persisted id from `localStorage` and applying the same CSS custom properties **before any React code runs**, to prevent a flash of the wrong preference on load (FOUT/FOUC). This table is hand-duplicated from the `Option[]` constant and kept in sync manually — there is no automated check.
- Both live pickers currently sit together on `src/pages/AccountPage.tsx` under one "Aparência" section.

---

## Internationalisation (i18n)

**Architecture: zero-dependency constant catalog. Single locale: pt-BR. No language toggle (YAGNI).**

All user-facing strings live in `src/lib/constants/strings.ts`, exported as the `t` object. Components import and use it directly — no i18n runtime, no context, no lazy loading.

```ts
import { t } from '@/lib/constants/strings'

// Static string
<h1>{t.landing.headline}</h1>

// Interpolated (exported as arrow functions)
<p>{t.home.signedInAs(user.email)}</p>
<p>{t.heatmap.cardCount(count)}</p>
```

### Rules
- **Every user-visible string must come from `t`** — no hardcoded English (or Portuguese) in JSX or toasts.
- `t` is re-exported from `src/lib/constants/index.ts` — you can import from either path.
- Interpolated strings are tiny arrow functions inside the `t` object. Keep them pure (no side effects).
- Do **NOT** translate: Japanese/romaji text, proper nouns (Genki, Tango, FSRS, Google), developer-only strings (console logs, error reporter payloads), test files, Supabase migrations.
- The `shadcn` primitives in `src/components/ui/` are not translated — they are headless and emit no visible text.
- When adding a new screen or toast, add its strings to `strings.ts` first, under the appropriate section. If a new section is needed, add it with a comment header.
- Mastery state values (`'Unseen' | 'Learning' | 'Review' | 'Mastered'`) are TypeScript discriminated-union keys — never change them. Their display labels live at `t.mastery.*` and must be used wherever the state is shown to the user.
