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

insert into cards (character, romaji, type, group_name, genki_order, example_word, example_word_romaji, mnemonic, derives_from, diacritic)
values
  -- vowel (1–5)
  ('あ', 'a',   'hiragana', 'vowel',   1,  'あおい',     'aoi',      null, null, null),
  ('い', 'i',   'hiragana', 'vowel',   2,  'いぬ',       'inu',      null, null, null),
  ('う', 'u',   'hiragana', 'vowel',   3,  'うみ',       'umi',      null, null, null),
  ('え', 'e',   'hiragana', 'vowel',   4,  'えき',       'eki',      null, null, null),
  ('お', 'o',   'hiragana', 'vowel',   5,  'おかあさん', 'okaasan',  null, null, null),

  -- k-group (6–10)
  ('か', 'ka',  'hiragana', 'k-group', 6,  'かさ',       'kasa',     null, null, null),
  ('き', 'ki',  'hiragana', 'k-group', 7,  'きって',     'kitte',    null, null, null),
  ('く', 'ku',  'hiragana', 'k-group', 8,  'くに',       'kuni',     null, null, null),
  ('け', 'ke',  'hiragana', 'k-group', 9,  'けいたい',   'keitai',   null, null, null),
  ('こ', 'ko',  'hiragana', 'k-group', 10, 'こども',     'kodomo',   null, null, null),

  -- s-group (11–15)
  ('さ', 'sa',  'hiragana', 's-group', 11, 'さかな',     'sakana',   null, null, null),
  ('し', 'shi', 'hiragana', 's-group', 12, 'しんぶん',   'shinbun',  null, null, null),
  ('す', 'su',  'hiragana', 's-group', 13, 'すし',       'sushi',    null, null, null),
  ('せ', 'se',  'hiragana', 's-group', 14, 'せんせい',   'sensei',   null, null, null),
  ('そ', 'so',  'hiragana', 's-group', 15, 'そら',       'sora',     null, null, null),

  -- t-group (16–20)
  ('た', 'ta',  'hiragana', 't-group', 16, 'たべもの',   'tabemono', null, null, null),
  ('ち', 'chi', 'hiragana', 't-group', 17, 'ちず',       'chizu',    null, null, null),
  ('つ', 'tsu', 'hiragana', 't-group', 18, 'つくえ',     'tsukue',   null, null, null),
  ('て', 'te',  'hiragana', 't-group', 19, 'てがみ',     'tegami',   null, null, null),
  ('と', 'to',  'hiragana', 't-group', 20, 'とけい',     'tokei',    null, null, null),

  -- n-group (21–25)
  ('な', 'na',  'hiragana', 'n-group', 21, 'なまえ',     'namae',    null, null, null),
  ('に', 'ni',  'hiragana', 'n-group', 22, 'にほん',     'nihon',    null, null, null),
  ('ぬ', 'nu',  'hiragana', 'n-group', 23, null,         null,       null, null, null),
  ('ね', 'ne',  'hiragana', 'n-group', 24, 'ねこ',       'neko',     null, null, null),
  ('の', 'no',  'hiragana', 'n-group', 25, 'のみもの',   'nomimono', null, null, null),

  -- h-group (26–30)
  ('は', 'ha',  'hiragana', 'h-group', 26, 'はな',       'hana',     null, null, null),
  ('ひ', 'hi',  'hiragana', 'h-group', 27, 'ひと',       'hito',     null, null, null),
  ('ふ', 'fu',  'hiragana', 'h-group', 28, 'ふじさん',   'fujisan',  null, null, null),
  ('へ', 'he',  'hiragana', 'h-group', 29, null,         null,       null, null, null),
  ('ほ', 'ho',  'hiragana', 'h-group', 30, 'ほん',       'hon',      null, null, null),

  -- m-group (31–35)
  ('ま', 'ma',  'hiragana', 'm-group', 31, 'まいにち',   'mainichi', null, null, null),
  ('み', 'mi',  'hiragana', 'm-group', 32, 'みみ',       'mimi',     null, null, null),
  ('む', 'mu',  'hiragana', 'm-group', 33, null,         null,       null, null, null),
  ('め', 'me',  'hiragana', 'm-group', 34, 'めがね',     'megane',   null, null, null),
  ('も', 'mo',  'hiragana', 'm-group', 35, 'もの',       'mono',     null, null, null),

  -- y-group (36–38)
  ('や', 'ya',  'hiragana', 'y-group', 36, 'やま',       'yama',     null, null, null),
  ('ゆ', 'yu',  'hiragana', 'y-group', 37, 'ゆき',       'yuki',     null, null, null),
  ('よ', 'yo',  'hiragana', 'y-group', 38, 'よる',       'yoru',     null, null, null),

  -- r-group (39–43)
  ('ら', 'ra',  'hiragana', 'r-group', 39, 'らいしゅう', 'raishuu',  null, null, null),
  ('り', 'ri',  'hiragana', 'r-group', 40, 'りんご',     'ringo',    null, null, null),
  ('る', 'ru',  'hiragana', 'r-group', 41, null,         null,       null, null, null),
  ('れ', 're',  'hiragana', 'r-group', 42, null,         null,       null, null, null),
  ('ろ', 'ro',  'hiragana', 'r-group', 43, null,         null,       null, null, null),

  -- w-group (44–45)
  ('わ', 'wa',  'hiragana', 'w-group', 44, 'わたし',     'watashi',  null, null, null),
  ('を', 'wo',  'hiragana', 'w-group', 45, null,         null,       null, null, null),

  -- n standalone (46)
  ('ん', 'n',   'hiragana', 'n',       46, null,         null,       null, null, null)

on conflict (character, type) do nothing;

-- ── Insert 25 derived hiragana (dakuten + handakuten) ─────────────────────────

insert into cards (character, romaji, type, group_name, genki_order, example_word, example_word_romaji, mnemonic, derives_from, diacritic)
values
  -- g-group (47–51): dakuten on k-group
  ('が', 'ga',  'hiragana', 'g-group', 47, null, null, null, 'か', 'dakuten'),
  ('ぎ', 'gi',  'hiragana', 'g-group', 48, null, null, null, 'き', 'dakuten'),
  ('ぐ', 'gu',  'hiragana', 'g-group', 49, null, null, null, 'く', 'dakuten'),
  ('げ', 'ge',  'hiragana', 'g-group', 50, null, null, null, 'け', 'dakuten'),
  ('ご', 'go',  'hiragana', 'g-group', 51, null, null, null, 'こ', 'dakuten'),

  -- z-group (52–56): dakuten on s-group
  ('ざ', 'za',  'hiragana', 'z-group', 52, null, null, null, 'さ', 'dakuten'),
  ('じ', 'ji',  'hiragana', 'z-group', 53, null, null, null, 'し', 'dakuten'),
  ('ず', 'zu',  'hiragana', 'z-group', 54, null, null, null, 'す', 'dakuten'),
  ('ぜ', 'ze',  'hiragana', 'z-group', 55, null, null, null, 'せ', 'dakuten'),
  ('ぞ', 'zo',  'hiragana', 'z-group', 56, null, null, null, 'そ', 'dakuten'),

  -- d-group (57–61): dakuten on t-group
  ('だ', 'da',  'hiragana', 'd-group', 57, null, null, null, 'た', 'dakuten'),
  ('ぢ', 'ji',  'hiragana', 'd-group', 58, null, null, null, 'ち', 'dakuten'),
  ('づ', 'zu',  'hiragana', 'd-group', 59, null, null, null, 'つ', 'dakuten'),
  ('で', 'de',  'hiragana', 'd-group', 60, null, null, null, 'て', 'dakuten'),
  ('ど', 'do',  'hiragana', 'd-group', 61, null, null, null, 'と', 'dakuten'),

  -- b-group (62–66): dakuten on h-group
  ('ば', 'ba',  'hiragana', 'b-group', 62, null, null, null, 'は', 'dakuten'),
  ('び', 'bi',  'hiragana', 'b-group', 63, null, null, null, 'ひ', 'dakuten'),
  ('ぶ', 'bu',  'hiragana', 'b-group', 64, null, null, null, 'ふ', 'dakuten'),
  ('べ', 'be',  'hiragana', 'b-group', 65, null, null, null, 'へ', 'dakuten'),
  ('ぼ', 'bo',  'hiragana', 'b-group', 66, null, null, null, 'ほ', 'dakuten'),

  -- p-group (67–71): handakuten on h-group
  ('ぱ', 'pa',  'hiragana', 'p-group', 67, null, null, null, 'は', 'handakuten'),
  ('ぴ', 'pi',  'hiragana', 'p-group', 68, null, null, null, 'ひ', 'handakuten'),
  ('ぷ', 'pu',  'hiragana', 'p-group', 69, null, null, null, 'ふ', 'handakuten'),
  ('ぺ', 'pe',  'hiragana', 'p-group', 70, null, null, null, 'へ', 'handakuten'),
  ('ぽ', 'po',  'hiragana', 'p-group', 71, null, null, null, 'ほ', 'handakuten')

on conflict (character, type) do nothing;
