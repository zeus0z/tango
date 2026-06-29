/**
 * Distractor helper for Type-B cards (Sound → Symbol, 6 options).
 *
 * `getDistractors(target, count)` returns `count` unique HiraganaChar entries
 * that are NOT the target, preferring characters from the same group_name,
 * padding with random entries from the rest of the set.
 *
 * The selection is deterministic enough for predictable UI snapshots but
 * shuffled so consecutive calls for the same target produce variety.
 */

import { HIRAGANA } from './hiragana'
import type { HiraganaChar } from './hiragana'

/**
 * Simple seeded shuffle (Fisher-Yates) using a string seed so that the same
 * target always produces the same candidate order within a session while
 * still being random across targets.
 */
function seededShuffle<T>(arr: T[], seed: string): T[] {
  // Derive a numeric seed from the character codes of the seed string.
  let s = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const next = () => {
    // LCG parameters from Numerical Recipes
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0x100000000
  }

  const copy = arr.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Returns `count` distractor characters for the given `target`.
 *
 * Strategy:
 * 1. Collect same-group candidates (excluding target).
 * 2. Collect other-group candidates (excluding target).
 * 3. Fill up to `count` first from group-mates, then from others.
 *
 * Never returns the target; never returns duplicates.
 *
 * @param target  The correct answer character entry.
 * @param count   Number of distractors to return (default 5).
 * @returns       Array of exactly `count` distractor HiraganaChar entries.
 * @throws        RangeError if the full HIRAGANA list has fewer than count+1 entries.
 */
export function getDistractors(target: HiraganaChar, count = 5): HiraganaChar[] {
  const all = HIRAGANA
  const available = all.filter((h) => h.character !== target.character)

  if (available.length < count) {
    throw new RangeError(
      `Cannot pick ${count} distractors from a pool of ${available.length} (target: ${target.character})`,
    )
  }

  const sameGroup = seededShuffle(
    available.filter((h) => h.group_name === target.group_name),
    target.character,
  )

  const otherGroup = seededShuffle(
    available.filter((h) => h.group_name !== target.group_name),
    target.character,
  )

  const result: HiraganaChar[] = []

  for (const h of sameGroup) {
    if (result.length >= count) break
    result.push(h)
  }

  for (const h of otherGroup) {
    if (result.length >= count) break
    result.push(h)
  }

  return result
}
