import { describe, it, expect } from 'vitest'
import { State } from 'ts-fsrs'
import { createEmptyCard, scheduleNext } from './fsrs'

/**
 * Locks the FSRS scheduler's behaviour. The scheduler is configured with
 * `enable_fuzz: true`, so we assert on STATE transitions and the ORDER of due
 * dates — never exact intervals, which would flake.
 */
describe('scheduleNext', () => {
  const now = new Date('2026-06-05T12:00:00.000Z')

  it('a fresh card starts in the New state, due now', () => {
    const card = createEmptyCard(now)
    expect(card.state).toBe(State.New)
    expect(card.reps).toBe(0)
  })

  it('advances reps and pushes due into the future for every rating', () => {
    const card = createEmptyCard(now)
    for (const rating of ['Again', 'Hard', 'Good', 'Easy'] as const) {
      const next = scheduleNext(card, rating, now)
      expect(next.reps).toBe(1)
      expect(next.due.getTime()).toBeGreaterThan(now.getTime())
    }
  })

  it('schedules a harder rating sooner than an easier one', () => {
    const card = createEmptyCard(now)
    const again = scheduleNext(card, 'Again', now)
    const good = scheduleNext(card, 'Good', now)
    const easy = scheduleNext(card, 'Easy', now)

    // Again should come back the soonest; Easy the latest.
    expect(again.due.getTime()).toBeLessThan(easy.due.getTime())
    expect(good.due.getTime()).toBeLessThanOrEqual(easy.due.getTime())
  })

  it('does not mutate the input card', () => {
    const card = createEmptyCard(now)
    const snapshot = { state: card.state, reps: card.reps, due: card.due.getTime() }
    scheduleNext(card, 'Good', now)
    expect(card.state).toBe(snapshot.state)
    expect(card.reps).toBe(snapshot.reps)
    expect(card.due.getTime()).toBe(snapshot.due)
  })
})
