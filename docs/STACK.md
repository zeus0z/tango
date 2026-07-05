# STACK.md — Tech Stack & Setup

## Core Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | React + Vite | React 18, Vite 5 |
| Language | TypeScript | 5.x strict mode |
| Styling | Tailwind CSS + shadcn/ui | Tailwind 3.x |
| Animation | Framer Motion | 11.x |
| Auth + DB | Supabase | JS client v2 |
| SRS Algorithm | ts-fsrs | latest |
| PWA | vite-plugin-pwa | latest |
| Routing | React Router | v6 |
| State | Zustand | lightweight global state |
| Data fetching | TanStack Query | v5 |
| HTTP client | Axios | latest |

## Hosting

| Layer | Platform |
|---|---|
| Frontend | Cloudflare Pages |
| Backend (future AI) | Render (FastAPI) — not built yet |
| Auth + DB | Supabase free tier |

## Environment Variables

All env vars are prefixed with `VITE_` for Vite compatibility.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_CLIENT_ID=
```

`VITE_GOOGLE_CLIENT_ID` is the Google Cloud OAuth Client ID used by Google Identity Services (GIS) for client-side Google sign-in — same value as the Client ID configured in Supabase Dashboard → Authentication → Providers → Google. It's public (not a secret) and safe to expose in the client bundle.

Never commit `.env`. Always use `.env.local` for local development.
A `.env.example` must be kept up to date at the project root.

## Supabase Client Setup

Initialise once in `src/lib/supabase.ts` and import from there everywhere.
Never instantiate the Supabase client more than once.

## ts-fsrs Setup

Initialise the FSRS scheduler once in `src/lib/fsrs.ts`.
Default parameters are fine for MVP. Do not hardcode scheduling parameters inline.

## PWA

Configured via `vite-plugin-pwa`. The app must:
- Be installable on iOS and Android from the browser
- Cache card assets and core UI for offline use
- Show a custom splash screen and app icon

## TypeScript

- Strict mode enabled — no `any`, no implicit returns
- All Supabase table rows must have generated types via `supabase gen types typescript`
- Shared types live in `src/types/`

## Node

Use Node 20 LTS. Pin version in `.nvmrc`.

---

## Implementation Notes (kept in sync with code)

> Reflects what is actually built. The version table above predates the bootstrap.

- **Installed versions (build targets these):** React 19, Vite 8, React Router 7, TypeScript 6, Tailwind 3.4. CI runs on Node 22. Treat the older numbers in the table above as historical.
- **Data access (MVP):** feature code uses the **Supabase JS client directly**. The Axios 3-layer in `CODE_PRACTICES.md` is scaffolded for the *future* AI backend only.
- **Supabase client** (PER-2): singleton in `src/lib/supabase.ts`; env typed in `src/vite-env.d.ts`; `.env.example` at repo root.
- **Google Identity Services (GIS)**: loaded at runtime via a script tag (`https://accounts.google.com/gsi/client`), not an npm runtime dependency. `@types/google-one-tap` is a **devDependency only** (DefinitelyTyped, zero runtime code), providing TypeScript types for `window.google.accounts.id`. See `src/features/auth/components/GoogleSignInButton.tsx`.
- **Path alias** (PER-1): `@/` → `src` configured in `vite.config.ts` + `tsconfig.app.json`.
- **Design system** (PER-1): tokens in `tailwind.config.ts` + CSS variables in `src/index.css`; shadcn/ui base components in `src/components/ui/`. `Toaster` uses **sonner** (React 19-compatible) rather than the legacy Radix toast.
- **PWA**: `vite-plugin-pwa` emits `sw.js` + manifest at build (full manifest/icons/offline tuning tracked in PER-5). As of MVP completion: 28 precache entries (~875 KiB).
- **State management** (PER-9): Zustand store at `src/lib/store.ts` with predefined slots (`session`, `studySession`, `dailyProgress`, `sessionMode`). Server data lives in TanStack Query — never in the store. F7 owns the slot shapes; features fill them.
- **Routing** (PER-9): React Router v7 data router at `src/router.tsx` with `<ProtectedRoute>` reading the auth slot from the store. Public route is `/` only.
- **TanStack Query**: single `QueryClient` at `src/lib/queryClient.ts`, provider mounted at `src/main.tsx`. Devtools enabled in dev.
- **Cross-feature contract for mode handoff** (/home → /session): **React Router location state** (`navigate('/session', { state: { mode } })`). The Zustand `sessionMode` slot exists but is dormant — request-scoped state belongs in route state, not global.
- **Unit / integration** (Vitest + React Testing Library): `vitest.config.ts` (standalone, jsdom) + co-located `src/**/*.test.ts(x)`. Covers FSRS scheduling, home/progress service transforms, and prop-driven components; Supabase is mocked at the boundary via `src/test/supabase-mock.ts`. Scripts: `pnpm test`, `pnpm test:coverage`. **Runs in CI** (`ci.yml` `check` job). `tsconfig.app.json` excludes test files from the build. Full guide: `docs/TESTING.md`.
- **E2E / screenshots** (Playwright): `playwright.config.ts` + `tests/e2e/`. Two Chromium projects (mobile + desktop). Auth is **mocked** — the test webServer boots with a dummy Supabase URL (`https://test.supabase.co`) and fixtures seed a fake `sb-test-auth-token` session + stub `**/rest/v1/**`, so no live DB or secrets. Scripts: `pnpm test:e2e`, `pnpm screenshots`. Local-only for now (not in CI). Full guide: `docs/TESTING.md`.
