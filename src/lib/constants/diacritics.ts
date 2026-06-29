/**
 * Diacritic explanation constants for dakuten and handakuten.
 * Consumed by PER-23's compound-lesson teaching screen.
 */

export interface DiacriticInfo {
  mark: string        // '゛' or '゜'
  name: string        // 'dakuten' / 'handakuten'
  nameJa: string      // '濁点' / '半濁点'
  shortLabel: string  // 'Two small strokes' / 'A small circle'
  rule: string        // 'Voices the consonant — k→g, s→z, t→d, h→b.'
  example: string     // 'So か (ka) + ゛ becomes が (ga).'
}

export const DIACRITICS: Record<'dakuten' | 'handakuten', DiacriticInfo> = {
  dakuten: {
    mark: '゛',
    name: 'dakuten',
    nameJa: '濁点',
    shortLabel: 'Two small strokes',
    rule: 'Voices the consonant — k→g, s→z, t→d, h→b.',
    example: 'So か (ka) + ゛ becomes が (ga).',
  },
  handakuten: {
    mark: '゜',
    name: 'handakuten',
    nameJa: '半濁点',
    shortLabel: 'A small circle',
    rule: 'Only on the h-row — h becomes p.',
    example: 'So は (ha) + ゜ becomes ぱ (pa).',
  },
}
