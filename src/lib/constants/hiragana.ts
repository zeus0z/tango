/**
 * Hiragana constants — all 46 base (gojūon) hiragana ordered by Genki I/II
 * phonetic groups with strictly increasing genki_order values.
 *
 * Katakana: TODO for post-MVP.
 */

import type { Card } from '@/types'

// ---------------------------------------------------------------------------
// HiraganaChar — a Card without the DB-generated `id` field
// ---------------------------------------------------------------------------

export type HiraganaChar = Omit<Card, 'id'>

// ---------------------------------------------------------------------------
// Genki group ordering
// ---------------------------------------------------------------------------

export const GENKI_ORDER: string[] = [
  'vowel',
  'k-group',
  's-group',
  't-group',
  'n-group',
  'h-group',
  'm-group',
  'y-group',
  'r-group',
  'w-group',
  'n',
]

// ---------------------------------------------------------------------------
// All 46 base hiragana (gojūon), ordered strictly by genki_order
// ---------------------------------------------------------------------------

export const HIRAGANA: HiraganaChar[] = [
  // ── vowel ─────────────────────────────────────────────────────────────────
  { character: 'あ', romaji: 'a',   type: 'hiragana', group_name: 'vowel',   genki_order: 1,  example_word: 'あおい',     example_word_romaji: 'aoi' },
  { character: 'い', romaji: 'i',   type: 'hiragana', group_name: 'vowel',   genki_order: 2,  example_word: 'いぬ',       example_word_romaji: 'inu' },
  { character: 'う', romaji: 'u',   type: 'hiragana', group_name: 'vowel',   genki_order: 3,  example_word: 'うみ',       example_word_romaji: 'umi' },
  { character: 'え', romaji: 'e',   type: 'hiragana', group_name: 'vowel',   genki_order: 4,  example_word: 'えき',       example_word_romaji: 'eki' },
  { character: 'お', romaji: 'o',   type: 'hiragana', group_name: 'vowel',   genki_order: 5,  example_word: 'おかあさん', example_word_romaji: 'okaasan' },

  // ── k-group ───────────────────────────────────────────────────────────────
  { character: 'か', romaji: 'ka',  type: 'hiragana', group_name: 'k-group', genki_order: 6,  example_word: 'かさ',       example_word_romaji: 'kasa' },
  { character: 'き', romaji: 'ki',  type: 'hiragana', group_name: 'k-group', genki_order: 7,  example_word: 'きって',     example_word_romaji: 'kitte' },
  { character: 'く', romaji: 'ku',  type: 'hiragana', group_name: 'k-group', genki_order: 8,  example_word: 'くに',       example_word_romaji: 'kuni' },
  { character: 'け', romaji: 'ke',  type: 'hiragana', group_name: 'k-group', genki_order: 9,  example_word: 'けいたい',   example_word_romaji: 'keitai' },
  { character: 'こ', romaji: 'ko',  type: 'hiragana', group_name: 'k-group', genki_order: 10, example_word: 'こども',     example_word_romaji: 'kodomo' },

  // ── s-group ───────────────────────────────────────────────────────────────
  { character: 'さ', romaji: 'sa',  type: 'hiragana', group_name: 's-group', genki_order: 11, example_word: 'さかな',     example_word_romaji: 'sakana' },
  { character: 'し', romaji: 'shi', type: 'hiragana', group_name: 's-group', genki_order: 12, example_word: 'しんぶん',   example_word_romaji: 'shinbun' },
  { character: 'す', romaji: 'su',  type: 'hiragana', group_name: 's-group', genki_order: 13, example_word: 'すし',       example_word_romaji: 'sushi' },
  { character: 'せ', romaji: 'se',  type: 'hiragana', group_name: 's-group', genki_order: 14, example_word: 'せんせい',   example_word_romaji: 'sensei' },
  { character: 'そ', romaji: 'so',  type: 'hiragana', group_name: 's-group', genki_order: 15, example_word: 'そら',       example_word_romaji: 'sora' },

  // ── t-group ───────────────────────────────────────────────────────────────
  { character: 'た', romaji: 'ta',  type: 'hiragana', group_name: 't-group', genki_order: 16, example_word: 'たべもの',   example_word_romaji: 'tabemono' },
  { character: 'ち', romaji: 'chi', type: 'hiragana', group_name: 't-group', genki_order: 17, example_word: 'ちず',       example_word_romaji: 'chizu' },
  { character: 'つ', romaji: 'tsu', type: 'hiragana', group_name: 't-group', genki_order: 18, example_word: 'つくえ',     example_word_romaji: 'tsukue' },
  { character: 'て', romaji: 'te',  type: 'hiragana', group_name: 't-group', genki_order: 19, example_word: 'てがみ',     example_word_romaji: 'tegami' },
  { character: 'と', romaji: 'to',  type: 'hiragana', group_name: 't-group', genki_order: 20, example_word: 'とけい',     example_word_romaji: 'tokei' },

  // ── n-group ───────────────────────────────────────────────────────────────
  { character: 'な', romaji: 'na',  type: 'hiragana', group_name: 'n-group', genki_order: 21, example_word: 'なまえ',     example_word_romaji: 'namae' },
  { character: 'に', romaji: 'ni',  type: 'hiragana', group_name: 'n-group', genki_order: 22, example_word: 'にほん',     example_word_romaji: 'nihon' },
  { character: 'ぬ', romaji: 'nu',  type: 'hiragana', group_name: 'n-group', genki_order: 23, example_word: null,         example_word_romaji: null },
  { character: 'ね', romaji: 'ne',  type: 'hiragana', group_name: 'n-group', genki_order: 24, example_word: 'ねこ',       example_word_romaji: 'neko' },
  { character: 'の', romaji: 'no',  type: 'hiragana', group_name: 'n-group', genki_order: 25, example_word: 'のみもの',   example_word_romaji: 'nomimono' },

  // ── h-group ───────────────────────────────────────────────────────────────
  { character: 'は', romaji: 'ha',  type: 'hiragana', group_name: 'h-group', genki_order: 26, example_word: 'はな',       example_word_romaji: 'hana' },
  { character: 'ひ', romaji: 'hi',  type: 'hiragana', group_name: 'h-group', genki_order: 27, example_word: 'ひと',       example_word_romaji: 'hito' },
  { character: 'ふ', romaji: 'fu',  type: 'hiragana', group_name: 'h-group', genki_order: 28, example_word: 'ふじさん',   example_word_romaji: 'fujisan' },
  { character: 'へ', romaji: 'he',  type: 'hiragana', group_name: 'h-group', genki_order: 29, example_word: null,         example_word_romaji: null },
  { character: 'ほ', romaji: 'ho',  type: 'hiragana', group_name: 'h-group', genki_order: 30, example_word: 'ほん',       example_word_romaji: 'hon' },

  // ── m-group ───────────────────────────────────────────────────────────────
  { character: 'ま', romaji: 'ma',  type: 'hiragana', group_name: 'm-group', genki_order: 31, example_word: 'まいにち',   example_word_romaji: 'mainichi' },
  { character: 'み', romaji: 'mi',  type: 'hiragana', group_name: 'm-group', genki_order: 32, example_word: 'みみ',       example_word_romaji: 'mimi' },
  { character: 'む', romaji: 'mu',  type: 'hiragana', group_name: 'm-group', genki_order: 33, example_word: null,         example_word_romaji: null },
  { character: 'め', romaji: 'me',  type: 'hiragana', group_name: 'm-group', genki_order: 34, example_word: 'めがね',     example_word_romaji: 'megane' },
  { character: 'も', romaji: 'mo',  type: 'hiragana', group_name: 'm-group', genki_order: 35, example_word: 'もの',       example_word_romaji: 'mono' },

  // ── y-group ───────────────────────────────────────────────────────────────
  { character: 'や', romaji: 'ya',  type: 'hiragana', group_name: 'y-group', genki_order: 36, example_word: 'やま',       example_word_romaji: 'yama' },
  { character: 'ゆ', romaji: 'yu',  type: 'hiragana', group_name: 'y-group', genki_order: 37, example_word: 'ゆき',       example_word_romaji: 'yuki' },
  { character: 'よ', romaji: 'yo',  type: 'hiragana', group_name: 'y-group', genki_order: 38, example_word: 'よる',       example_word_romaji: 'yoru' },

  // ── r-group ───────────────────────────────────────────────────────────────
  { character: 'ら', romaji: 'ra',  type: 'hiragana', group_name: 'r-group', genki_order: 39, example_word: 'らいしゅう', example_word_romaji: 'raishuu' },
  { character: 'り', romaji: 'ri',  type: 'hiragana', group_name: 'r-group', genki_order: 40, example_word: 'りんご',     example_word_romaji: 'ringo' },
  { character: 'る', romaji: 'ru',  type: 'hiragana', group_name: 'r-group', genki_order: 41, example_word: null,         example_word_romaji: null },
  { character: 'れ', romaji: 're',  type: 'hiragana', group_name: 'r-group', genki_order: 42, example_word: null,         example_word_romaji: null },
  { character: 'ろ', romaji: 'ro',  type: 'hiragana', group_name: 'r-group', genki_order: 43, example_word: null,         example_word_romaji: null },

  // ── w-group ───────────────────────────────────────────────────────────────
  { character: 'わ', romaji: 'wa',  type: 'hiragana', group_name: 'w-group', genki_order: 44, example_word: 'わたし',     example_word_romaji: 'watashi' },
  { character: 'を', romaji: 'wo',  type: 'hiragana', group_name: 'w-group', genki_order: 45, example_word: null,         example_word_romaji: null },

  // ── n (standalone) ────────────────────────────────────────────────────────
  { character: 'ん', romaji: 'n',   type: 'hiragana', group_name: 'n',       genki_order: 46, example_word: null,         example_word_romaji: null },
]

// ---------------------------------------------------------------------------
// Katakana — TODO post-MVP
// ---------------------------------------------------------------------------

/** @todo Populate once katakana curriculum is added (post-MVP). */
export const KATAKANA: HiraganaChar[] = []
