# UI.md — Design System & UI Patterns

## Core Philosophy

This app must feel **native on mobile**. Every interaction — taps, transitions, feedback —
should feel as close to a native iOS/Android app as possible, built on the web.
Desktop is supported but mobile is the primary target.

---

## Layout

- Max content width: `390px` centred on desktop (mimics a phone screen)
- Full-screen on mobile — no visible browser chrome when installed as PWA
- Safe area insets must be respected (`env(safe-area-inset-*)`) for notched devices
- Bottom navigation bar (if used) must sit above the home indicator on iOS

---

## Tailwind Config

- Mobile-first breakpoints — default styles are mobile, `md:` is desktop
- Custom colours are defined in `tailwind.config.ts` — never use arbitrary hex inline
- Spacing and sizing use Tailwind scale only — no arbitrary pixel values unless unavoidable

### Colour Palette (define in config)

| Token | Use |
|---|---|
| `primary` | CTAs, active states, progress fills |
| `success` | Correct answer highlight |
| `danger` | Wrong answer highlight / shake |
| `muted` | Inactive cards, unseen characters |
| `card-bg` | Flashcard surface |

---

## shadcn/ui Usage

- Use shadcn components as a base — always customise to match the design system
- Do not use shadcn components unstyled out of the box
- Preferred components: `Button`, `Card`, `Progress`, `Badge`, `Dialog`, `Toaster`
- Import from `@/components/ui/` — never directly from Radix

---

## Flashcard UI

The card is the centrepiece of the app. It must feel substantial and tactile.

- Large, centred character display — minimum `text-8xl` on mobile
- Card surface has soft shadow and rounded corners (`rounded-3xl`)
- Answer choices are large tap targets — minimum `48px` height, comfortable padding
- No hover states as primary feedback — use `active:` states for tap feedback
- Correct answer: green background flash that **holds** on green until the user taps Next
- Wrong answer: red background flash + horizontal shake animation (Framer Motion), holding on red (tapped option) + green (correct option) until the user taps Next

---

## Framer Motion Patterns

### Page Transitions
All route changes use a shared `PageTransition` wrapper:
```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -16 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
/>
```

### Card Answer Feedback
Feedback holds on the final color instead of fading back to white — `onAnswer`
fires once the hold begins, but the session view waits for an explicit **Next**
tap before advancing.
```tsx
// Correct — ends on green, stays
animate={{ backgroundColor: ['#fff', '#dcfce7'] }}

// Wrong — shake, ends on red, stays
animate={{ x: [0, -8, 8, -8, 8, 0], backgroundColor: ['#fff', '#fee2e2'] }}
transition={{ duration: 0.4 }}
```

### Card Transition (next card)
Slide out current card, slide in next — horizontal swipe feel:
```tsx
variants={{
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
}}
```

---

## Typography

- Japanese characters: system font stack with CJK fallbacks
  ```css
  font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
  ```
- UI text: system sans-serif (Tailwind default)
- Character display size: always large enough to be unambiguous at a glance

---

## Mastery State Colours (Progress Map)

| State | Colour | Tailwind class |
|---|---|---|
| Unseen | Grey | `bg-muted` |
| Learning | Amber | `bg-amber-200` |
| Review | Blue | `bg-blue-200` |
| Mastered | Green | `bg-green-300` |

---

## Rating Buttons

Shown after a correct answer. Three buttons in a row, full width of the card:

| Button | Colour |
|---|---|
| Hard | Amber/orange tint |
| Good | Green tint (default/primary) |
| Easy | Blue tint |

Buttons must be large enough to tap comfortably without looking — at least `56px` tall.
Good should be visually the most prominent (it's the default path).

---

## Progress Bar (Session)

- Thin bar at the top of the session screen
- Fills left to right as cards are completed
- Smooth animated fill (Framer Motion `layout` prop or CSS transition)
- Shows card count label: "6 / 13"

---

## Toast Notifications

Use shadcn `Toaster` for:
- Auth errors
- Save failures (when a review result can't be persisted)
- Milestone achievements (e.g. "Hiragana vowels complete!")

Keep toasts brief, non-blocking, and auto-dismissed after 3 seconds.

---

## Accessibility

- All tap targets minimum `44x44px`
- Colour is never the only indicator of state — always pair with text or icon
- Focus states visible for keyboard users (desktop)
- Japanese characters must have `lang="ja"` on their container for correct rendering

---

## Implementation Notes (kept in sync with code)

- **Toaster is `sonner`**, not Radix toast (React 19 compatibility — see STACK.md). Imported and mounted by F7 in `App.tsx`.
- **Layout shell** is at `src/components/Layout.tsx`; page transitions at `src/components/PageTransition.tsx` (the Framer Motion `PageTransitions` snippet above is the live pattern).
- **Mastery cells** in `AlphabetProgressMap` use the Tailwind tokens from the Mastery State Colours table above — match those classes if adding new state-coloured surfaces elsewhere.
- **Card answer animations** (shipped in PER-13 `AnswerFeedback`):
  - Correct: `backgroundColor: ['#ffffff', '#dcfce7']` flash, holds on green.
  - Wrong: `backgroundColor: ['#ffffff', '#fee2e2']` red flash (holds on red) AND `x: [0, -8, 8, -8, 8, 0]` horizontal shake.
  - The hold is intentional: `onAnswer` fires when the hold begins, but advancing to the next card/item always waits for a `NextButton` tap — no card surface auto-advances.
- **Tap target sizing actually enforced in shipped code:**
  - Session rating buttons: ≥56px height. Good (primary) is visually dominant via `flex-2`. Used only by Review Recent/All's correct-answer path.
  - `NextButton`: ≥56px height, same styling as `IntroduceCharacter`'s "Got it →" CTA. Used everywhere else an answer needs acknowledging.
  - Session mode buttons on /home: ≥56px tall, full-width.
  - Weak cards / list rows: ≥48px.
  - shadcn `input.tsx` primitive: ≥48px.
- **Study heatmap** (PER-16 `StudyHeatmap`) is hand-rolled — no charting library. Gray for zero days, increasing primary-green opacity for higher counts, today gets a ring indicator. Last 12 weeks × 7 days.
- **AlphabetProgressMap prop contract** (defined by A5, consumed by A6):
  ```ts
  interface AlphabetProgressMapProps {
    progress: Record<string, MasteryState>      // character → state
    size?: 'sm' | 'md' | 'lg'                   // default 'md'
    onCellPress?: (character: string) => void   // undefined = non-interactive
  }
  ```
  Home uses `size='sm'` non-interactive; Progress uses `size='lg'` with `onCellPress`.
