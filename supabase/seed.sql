-- ============================================================
-- Nihongo Flash — card seed
-- Idempotent: re-running is safe (on conflict do nothing).
--
-- How to run:
--   Local Supabase:  pnpm seed          (runs `supabase db reset`)
--   Remote (linked): supabase db push   (seed is applied automatically)
--   Manual:          psql $DATABASE_URL -f supabase/seed.sql
-- ============================================================

-- Ensure a unique constraint exists on (character, type) so the
-- ON CONFLICT clause below has a target to resolve against.
-- create unique index if not exists avoids errors on repeat runs.
create unique index if not exists cards_character_type_key
  on cards (character, type);

-- ── Insert all 46 base hiragana (gojūon) ordered by genki_order ──────────────

insert into cards (character, romaji, type, group_name, genki_order, example_word, example_word_romaji)
values
  -- vowel (1–5)
  ('あ', 'a',   'hiragana', 'vowel',   1,  'あおい',     'aoi'),
  ('い', 'i',   'hiragana', 'vowel',   2,  'いぬ',       'inu'),
  ('う', 'u',   'hiragana', 'vowel',   3,  'うみ',       'umi'),
  ('え', 'e',   'hiragana', 'vowel',   4,  'えき',       'eki'),
  ('お', 'o',   'hiragana', 'vowel',   5,  'おかあさん', 'okaasan'),

  -- k-group (6–10)
  ('か', 'ka',  'hiragana', 'k-group', 6,  'かさ',       'kasa'),
  ('き', 'ki',  'hiragana', 'k-group', 7,  'きって',     'kitte'),
  ('く', 'ku',  'hiragana', 'k-group', 8,  'くに',       'kuni'),
  ('け', 'ke',  'hiragana', 'k-group', 9,  'けいたい',   'keitai'),
  ('こ', 'ko',  'hiragana', 'k-group', 10, 'こども',     'kodomo'),

  -- s-group (11–15)
  ('さ', 'sa',  'hiragana', 's-group', 11, 'さかな',     'sakana'),
  ('し', 'shi', 'hiragana', 's-group', 12, 'しんぶん',   'shinbun'),
  ('す', 'su',  'hiragana', 's-group', 13, 'すし',       'sushi'),
  ('せ', 'se',  'hiragana', 's-group', 14, 'せんせい',   'sensei'),
  ('そ', 'so',  'hiragana', 's-group', 15, 'そら',       'sora'),

  -- t-group (16–20)
  ('た', 'ta',  'hiragana', 't-group', 16, 'たべもの',   'tabemono'),
  ('ち', 'chi', 'hiragana', 't-group', 17, 'ちず',       'chizu'),
  ('つ', 'tsu', 'hiragana', 't-group', 18, 'つくえ',     'tsukue'),
  ('て', 'te',  'hiragana', 't-group', 19, 'てがみ',     'tegami'),
  ('と', 'to',  'hiragana', 't-group', 20, 'とけい',     'tokei'),

  -- n-group (21–25)
  ('な', 'na',  'hiragana', 'n-group', 21, 'なまえ',     'namae'),
  ('に', 'ni',  'hiragana', 'n-group', 22, 'にほん',     'nihon'),
  ('ぬ', 'nu',  'hiragana', 'n-group', 23, null,         null),
  ('ね', 'ne',  'hiragana', 'n-group', 24, 'ねこ',       'neko'),
  ('の', 'no',  'hiragana', 'n-group', 25, 'のみもの',   'nomimono'),

  -- h-group (26–30)
  ('は', 'ha',  'hiragana', 'h-group', 26, 'はな',       'hana'),
  ('ひ', 'hi',  'hiragana', 'h-group', 27, 'ひと',       'hito'),
  ('ふ', 'fu',  'hiragana', 'h-group', 28, 'ふじさん',   'fujisan'),
  ('へ', 'he',  'hiragana', 'h-group', 29, null,         null),
  ('ほ', 'ho',  'hiragana', 'h-group', 30, 'ほん',       'hon'),

  -- m-group (31–35)
  ('ま', 'ma',  'hiragana', 'm-group', 31, 'まいにち',   'mainichi'),
  ('み', 'mi',  'hiragana', 'm-group', 32, 'みみ',       'mimi'),
  ('む', 'mu',  'hiragana', 'm-group', 33, null,         null),
  ('め', 'me',  'hiragana', 'm-group', 34, 'めがね',     'megane'),
  ('も', 'mo',  'hiragana', 'm-group', 35, 'もの',       'mono'),

  -- y-group (36–38)
  ('や', 'ya',  'hiragana', 'y-group', 36, 'やま',       'yama'),
  ('ゆ', 'yu',  'hiragana', 'y-group', 37, 'ゆき',       'yuki'),
  ('よ', 'yo',  'hiragana', 'y-group', 38, 'よる',       'yoru'),

  -- r-group (39–43)
  ('ら', 'ra',  'hiragana', 'r-group', 39, 'らいしゅう', 'raishuu'),
  ('り', 'ri',  'hiragana', 'r-group', 40, 'りんご',     'ringo'),
  ('る', 'ru',  'hiragana', 'r-group', 41, null,         null),
  ('れ', 're',  'hiragana', 'r-group', 42, null,         null),
  ('ろ', 'ro',  'hiragana', 'r-group', 43, null,         null),

  -- w-group (44–45)
  ('わ', 'wa',  'hiragana', 'w-group', 44, 'わたし',     'watashi'),
  ('を', 'wo',  'hiragana', 'w-group', 45, null,         null),

  -- n standalone (46)
  ('ん', 'n',   'hiragana', 'n',       46, null,         null)

on conflict (character, type) do nothing;
