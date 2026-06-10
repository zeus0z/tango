import { test } from './fixtures/auth'

/**
 * @screenshot — capture each screen across both viewports without running the
 * app by hand. Run with `pnpm screenshots`; PNGs land in `screenshots/` named
 * `<route>-<project>.png` (e.g. `home-mobile-chromium.png`).
 *
 * Every route uses the authed page (seeded session + Supabase mock). A seeded
 * session is harmless on the public landing/login pages, so one path covers all.
 */

const ROUTES: Array<{ name: string; path: string }> = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'home', path: '/home' },
  { name: 'progress', path: '/progress' },
  { name: 'session', path: '/session' },
]

test.describe('@screenshot', () => {
  for (const { name, path } of ROUTES) {
    test(`capture ${name}`, async ({ authedPage }, testInfo) => {
      await authedPage.goto(path)
      // Let lazy chunks + entry animations settle.
      await authedPage.waitForLoadState('networkidle')
      await authedPage.screenshot({
        path: `screenshots/${name}-${testInfo.project.name}.png`,
        fullPage: true,
      })
    })
  }
})

/**
 * Infinite Review (PER-26). Needs learnt hiragana cards (with `type` + `id`) so
 * the setup screen enables hiragana and the looping session can render a card.
 * The /session screen reads location state, so we click through from setup
 * rather than navigating directly.
 */
const IR_CARDS = [
  { id: 'c1', character: 'あ', romaji: 'a', type: 'hiragana', group_name: 'vowel', genki_order: 1 },
  { id: 'c2', character: 'い', romaji: 'i', type: 'hiragana', group_name: 'vowel', genki_order: 2 },
  { id: 'c3', character: 'う', romaji: 'u', type: 'hiragana', group_name: 'vowel', genki_order: 3 },
]
const IR_PROGRESS = IR_CARDS.map((c, i) => ({
  id: `p${i}`,
  card_id: c.id,
  state: 'Review',
  stability: 10,
  due: '2026-06-10T00:00:00Z',
  reps: 5,
  lapses: 0,
  last_review: '2026-06-04T00:00:00Z',
  cards: { character: c.character, romaji: c.romaji, group_name: c.group_name, genki_order: c.genki_order },
}))

test.describe('@screenshot infinite-review', () => {
  test.use({ mockTables: { cards: IR_CARDS, user_card_progress: IR_PROGRESS } })

  test('capture infinite-review setup + session', async ({ authedPage }, testInfo) => {
    const project = testInfo.project.name

    // Setup / details screen
    await authedPage.goto('/infinite-review')
    await authedPage.waitForLoadState('networkidle')
    await authedPage.getByRole('button', { name: /Hiragana/ }).waitFor()
    await authedPage.screenshot({
      path: `screenshots/infinite-review-setup-${project}.png`,
      fullPage: true,
    })

    // Pick hiragana, start, capture the looping session
    await authedPage.getByRole('button', { name: /Hiragana/ }).click()
    await authedPage.getByRole('button', { name: /Start practising/ }).click()
    await authedPage.waitForLoadState('networkidle')
    await authedPage.getByText('Exit').waitFor()
    await authedPage.screenshot({
      path: `screenshots/infinite-review-session-${project}.png`,
      fullPage: true,
    })
  })
})

/**
 * Learn intro (PER-30 mnemonics). The Learn queue introduces unseen base
 * characters on a full-screen IntroduceCharacter, which shows the "Memory hook"
 * with the MnemonicViewer (one hook + ‹ › arrows) by default. We click the Learn
 * mode from /home (it navigates to /session with location state) rather than
 * hitting /session directly. Empty progress => the first base char is "unseen".
 */
const LEARN_CARDS = [
  { id: 'c1', character: 'あ', romaji: 'a', type: 'hiragana', group_name: 'vowel', genki_order: 1, derives_from: null, mnemonics_pt: ['Tem um A maiúsculo escondido — uma abelha pousada nele', 'Um abacaxi, com a coroa espetada em cima'] },
  { id: 'c2', character: 'い', romaji: 'i', type: 'hiragana', group_name: 'vowel', genki_order: 2, derives_from: null, mnemonics_pt: ['Duas ilhas pequenas lado a lado', 'Dois dedinhos fazendo sinal de paz — "íi"'] },
  { id: 'c3', character: 'う', romaji: 'u', type: 'hiragana', group_name: 'vowel', genki_order: 3, derives_from: null, mnemonics_pt: ['Um urubu de perfil, com o bico curvado', 'Uma curva em U na estrada — faz o retorno, "uuu"'] },
]

test.describe('@screenshot learn-mnemonic', () => {
  test.use({ mockTables: { cards: LEARN_CARDS, user_card_progress: [], review_logs: [] } })

  test('capture learn intro with mnemonic viewer', async ({ authedPage }, testInfo) => {
    await authedPage.goto('/home')
    await authedPage.waitForLoadState('networkidle')

    // Start a Learn session (navigates to /session via location state).
    await authedPage.getByRole('button', { name: /^Learn/ }).click()
    await authedPage.waitForLoadState('networkidle')

    // The intro screen renders the Memory hook block by default.
    await authedPage.getByText('Memory hook').waitFor()
    await authedPage.screenshot({
      path: `screenshots/learn-mnemonic-${testInfo.project.name}.png`,
      fullPage: true,
    })
  })
})
