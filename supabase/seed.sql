-- ============================================================
-- Tango — card seed
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

insert into cards (character, romaji, type, group_name, genki_order, example_word, example_word_romaji, mnemonic)
values
  -- vowel (1–5)
  ('あ', 'a',   'hiragana', 'vowel',   1,  'あおい',     'aoi',      null),
  ('い', 'i',   'hiragana', 'vowel',   2,  'いぬ',       'inu',      null),
  ('う', 'u',   'hiragana', 'vowel',   3,  'うみ',       'umi',      null),
  ('え', 'e',   'hiragana', 'vowel',   4,  'えき',       'eki',      null),
  ('お', 'o',   'hiragana', 'vowel',   5,  'おかあさん', 'okaasan',  null),

  -- k-group (6–10)
  ('か', 'ka',  'hiragana', 'k-group', 6,  'かさ',       'kasa',     null),
  ('き', 'ki',  'hiragana', 'k-group', 7,  'きって',     'kitte',    null),
  ('く', 'ku',  'hiragana', 'k-group', 8,  'くに',       'kuni',     null),
  ('け', 'ke',  'hiragana', 'k-group', 9,  'けいたい',   'keitai',   null),
  ('こ', 'ko',  'hiragana', 'k-group', 10, 'こども',     'kodomo',   null),

  -- s-group (11–15)
  ('さ', 'sa',  'hiragana', 's-group', 11, 'さかな',     'sakana',   null),
  ('し', 'shi', 'hiragana', 's-group', 12, 'しんぶん',   'shinbun',  null),
  ('す', 'su',  'hiragana', 's-group', 13, 'すし',       'sushi',    null),
  ('せ', 'se',  'hiragana', 's-group', 14, 'せんせい',   'sensei',   null),
  ('そ', 'so',  'hiragana', 's-group', 15, 'そら',       'sora',     null),

  -- t-group (16–20)
  ('た', 'ta',  'hiragana', 't-group', 16, 'たべもの',   'tabemono', null),
  ('ち', 'chi', 'hiragana', 't-group', 17, 'ちず',       'chizu',    null),
  ('つ', 'tsu', 'hiragana', 't-group', 18, 'つくえ',     'tsukue',   null),
  ('て', 'te',  'hiragana', 't-group', 19, 'てがみ',     'tegami',   null),
  ('と', 'to',  'hiragana', 't-group', 20, 'とけい',     'tokei',    null),

  -- n-group (21–25)
  ('な', 'na',  'hiragana', 'n-group', 21, 'なまえ',     'namae',    null),
  ('に', 'ni',  'hiragana', 'n-group', 22, 'にほん',     'nihon',    null),
  ('ぬ', 'nu',  'hiragana', 'n-group', 23, null,         null,       null),
  ('ね', 'ne',  'hiragana', 'n-group', 24, 'ねこ',       'neko',     null),
  ('の', 'no',  'hiragana', 'n-group', 25, 'のみもの',   'nomimono', null),

  -- h-group (26–30)
  ('は', 'ha',  'hiragana', 'h-group', 26, 'はな',       'hana',     null),
  ('ひ', 'hi',  'hiragana', 'h-group', 27, 'ひと',       'hito',     null),
  ('ふ', 'fu',  'hiragana', 'h-group', 28, 'ふじさん',   'fujisan',  null),
  ('へ', 'he',  'hiragana', 'h-group', 29, null,         null,       null),
  ('ほ', 'ho',  'hiragana', 'h-group', 30, 'ほん',       'hon',      null),

  -- m-group (31–35)
  ('ま', 'ma',  'hiragana', 'm-group', 31, 'まいにち',   'mainichi', null),
  ('み', 'mi',  'hiragana', 'm-group', 32, 'みみ',       'mimi',     null),
  ('む', 'mu',  'hiragana', 'm-group', 33, null,         null,       null),
  ('め', 'me',  'hiragana', 'm-group', 34, 'めがね',     'megane',   null),
  ('も', 'mo',  'hiragana', 'm-group', 35, 'もの',       'mono',     null),

  -- y-group (36–38)
  ('や', 'ya',  'hiragana', 'y-group', 36, 'やま',       'yama',     null),
  ('ゆ', 'yu',  'hiragana', 'y-group', 37, 'ゆき',       'yuki',     null),
  ('よ', 'yo',  'hiragana', 'y-group', 38, 'よる',       'yoru',     null),

  -- r-group (39–43)
  ('ら', 'ra',  'hiragana', 'r-group', 39, 'らいしゅう', 'raishuu',  null),
  ('り', 'ri',  'hiragana', 'r-group', 40, 'りんご',     'ringo',    null),
  ('る', 'ru',  'hiragana', 'r-group', 41, null,         null,       null),
  ('れ', 're',  'hiragana', 'r-group', 42, null,         null,       null),
  ('ろ', 'ro',  'hiragana', 'r-group', 43, null,         null,       null),

  -- w-group (44–45)
  ('わ', 'wa',  'hiragana', 'w-group', 44, 'わたし',     'watashi',  null),
  ('を', 'wo',  'hiragana', 'w-group', 45, null,         null,       null),

  -- n standalone (46)
  ('ん', 'n',   'hiragana', 'n',       46, null,         null,       null)

on conflict (character, type) do nothing;
