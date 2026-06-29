-- Migration: add English mnemonic columns to cards (PER-27)
--
-- mnemonics_en text[]       — EN memory hooks, parallel to mnemonics_pt (2 per base kana)
-- mnemonic_keyword_en text[] — per-hook highlight keyword, parallel to mnemonics_en
--
-- Both columns are nullable. Existing rows have null until the seed/backfill populates them.
-- MnemonicViewer gracefully skips highlighting when keyword is absent/empty.

alter table cards add column if not exists mnemonics_en text[];
alter table cards add column if not exists mnemonic_keyword_en text[];

-- Backfill all 46 base hiragana English mnemonic arrays.
-- Each entry: [shape-hook, sound-hook] or [sound-hook-1, sound-hook-2].

-- vowels
update cards set mnemonics_en = array['An arch with a crossbar — like an "A" reaching out',  'An ape swinging from the crossbar of the letter A'],
                 mnemonic_keyword_en = array['arch', 'ape'] where character = 'あ' and type = 'hiragana';

update cards set mnemonics_en = array['Two icicles hanging side by side — "ee"',  'Two eels swimming in parallel'],
                 mnemonic_keyword_en = array['icicles', 'eels'] where character = 'い' and type = 'hiragana';

update cards set mnemonics_en = array['A fishhook curving — "oooh!"',  'A unicorn''s curved horn from above'],
                 mnemonic_keyword_en = array['oooh', 'unicorn'] where character = 'う' and type = 'hiragana';

update cards set mnemonics_en = array['An elephant''s trunk swaying — "eh?"',  'A person shrugging — "eh!"'],
                 mnemonic_keyword_en = array['elephant', 'eh'] where character = 'え' and type = 'hiragana';

update cards set mnemonics_en = array['Someone shouts "oh!" kicking a ball',  'An ogre with one big eye (the loop)'],
                 mnemonic_keyword_en = array['oh', 'ogre'] where character = 'お' and type = 'hiragana';

-- k-group
update cards set mnemonics_en = array['A karate kick splitting a board',  'A car with a tall antenna — vroom!'],
                 mnemonic_keyword_en = array['karate', 'car'] where character = 'か' and type = 'hiragana';

update cards set mnemonics_en = array['A key with two teeth on the blade',  'A kite stuck in a fence'],
                 mnemonic_keyword_en = array['key', 'kite'] where character = 'き' and type = 'hiragana';

update cards set mnemonics_en = array['A cuckoo bird opening its beak — "coo!"',  'A boomerang — "coo!"'],
                 mnemonic_keyword_en = array['coo', 'coo'] where character = 'く' and type = 'hiragana';

update cards set mnemonics_en = array['A keg tapped with a spout',  'A cage with bars for a pet'],
                 mnemonic_keyword_en = array['keg', 'cage'] where character = 'け' and type = 'hiragana';

update cards set mnemonics_en = array['Two coins stacked on top of each other',  'A coat hanger lying flat'],
                 mnemonic_keyword_en = array['coins', 'coat'] where character = 'こ' and type = 'hiragana';

-- s-group
update cards set mnemonics_en = array['A samurai sword with a curved guard',  'A saw cutting through wood'],
                 mnemonic_keyword_en = array['samurai', 'saw'] where character = 'さ' and type = 'hiragana';

update cards set mnemonics_en = array['A shepherd''s hook — "shee!" goes the sheep',  'A shiny fishing hook'],
                 mnemonic_keyword_en = array['shee', 'shiny'] where character = 'し' and type = 'hiragana';

update cards set mnemonics_en = array['Sushi roll with a chopstick curling through it',  'A suede lasso swinging in a loop'],
                 mnemonic_keyword_en = array['sushi', 'suede'] where character = 'す' and type = 'hiragana';

update cards set mnemonics_en = array['A seagull landing on a post',  'Seven flags planted in a row'],
                 mnemonic_keyword_en = array['seagull', 'seven'] where character = 'せ' and type = 'hiragana';

update cards set mnemonics_en = array['A sonar wave rippling outward',  'The musical note sol curling'],
                 mnemonic_keyword_en = array['sonar', 'sol'] where character = 'そ' and type = 'hiragana';

-- t-group
update cards set mnemonics_en = array['A taxi cab with an antenna on top',  'A tall cross with a crooked foot'],
                 mnemonic_keyword_en = array['taxi', 'tall'] where character = 'た' and type = 'hiragana';

update cards set mnemonics_en = array['A cheeky grin — see the smile curve?',  'A chicken leg pointing left'],
                 mnemonic_keyword_en = array['cheeky', 'chicken'] where character = 'ち' and type = 'hiragana';

update cards set mnemonics_en = array['A tsunami wave cresting',  'A tool curving like a crescent moon'],
                 mnemonic_keyword_en = array['tsunami', 'tool'] where character = 'つ' and type = 'hiragana';

update cards set mnemonics_en = array['A telephone hook waiting for a call',  'A tent peg driven into the ground'],
                 mnemonic_keyword_en = array['telephone', 'tent'] where character = 'て' and type = 'hiragana';

update cards set mnemonics_en = array['A toe with a splinter sticking out',  'A torch pointing upward'],
                 mnemonic_keyword_en = array['toe', 'torch'] where character = 'と' and type = 'hiragana';

-- n-group
update cards set mnemonics_en = array['A nail hammered into the wood',  '"Nah!" — someone crossing their arms'],
                 mnemonic_keyword_en = array['nail', 'nah'] where character = 'な' and type = 'hiragana';

update cards set mnemonics_en = array['Knee bends at right angles',  'A needle and thread'],
                 mnemonic_keyword_en = array['knee', 'needle'] where character = 'に' and type = 'hiragana';

update cards set mnemonics_en = array['A noodle tangled in loops and knots',  'A gnu (wildebeest) with curved horns'],
                 mnemonic_keyword_en = array['noodle', 'gnu'] where character = 'ぬ' and type = 'hiragana';

update cards set mnemonics_en = array['A net with a fish caught inside',  'Neck of a guitar with tuning pegs'],
                 mnemonic_keyword_en = array['net', 'neck'] where character = 'ね' and type = 'hiragana';

update cards set mnemonics_en = array['A "no" sign — circle with a line through it',  'A knob spiraling inward'],
                 mnemonic_keyword_en = array['no', 'knob'] where character = 'の' and type = 'hiragana';

-- h-group
update cards set mnemonics_en = array['"Ha!" — a laughing face wide open',  '"Ha-ha!" — two exclamation marks'],
                 mnemonic_keyword_en = array['ha', 'ha-ha'] where character = 'は' and type = 'hiragana';

update cards set mnemonics_en = array['"Hee-hee!" — a giggling grin',  'A hill with a small bump on top'],
                 mnemonic_keyword_en = array['hee-hee', 'hill'] where character = 'ひ' and type = 'hiragana';

update cards set mnemonics_en = array['Full moon rising over a snowy peak',  'A fool dancing on four feet'],
                 mnemonic_keyword_en = array['full', 'fool'] where character = 'ふ' and type = 'hiragana';

update cards set mnemonics_en = array['A rooftop peak — "hello mountain!"',  '"Heh!" a tiny tent shape'],
                 mnemonic_keyword_en = array['hello', 'heh'] where character = 'へ' and type = 'hiragana';

update cards set mnemonics_en = array['"Ho-ho-ho!" — Santa''s chimney',  'A house with a flag on top'],
                 mnemonic_keyword_en = array['ho-ho-ho', 'house'] where character = 'ほ' and type = 'hiragana';

-- m-group
update cards set mnemonics_en = array['A magician with a hat and wand',  '"Ma!" — a hand waving at mama'],
                 mnemonic_keyword_en = array['magician', 'ma'] where character = 'ま' and type = 'hiragana';

update cards set mnemonics_en = array['A mermaid''s tail curling in the water',  'The musical note "me" (do-re-mi)'],
                 mnemonic_keyword_en = array['mermaid', 'me'] where character = 'み' and type = 'hiragana';

update cards set mnemonics_en = array['A mooing cow — "moo!"',  'A musical horn (tuba) facing right'],
                 mnemonic_keyword_en = array['mooing', 'musical'] where character = 'む' and type = 'hiragana';

update cards set mnemonics_en = array['"Me!" — an eye staring right at you',  'A medallion with a spiral pattern'],
                 mnemonic_keyword_en = array['me', 'medallion'] where character = 'め' and type = 'hiragana';

update cards set mnemonics_en = array['More and more hooks — can''t stop fishing',  'A mop with tangled strings'],
                 mnemonic_keyword_en = array['more', 'mop'] where character = 'も' and type = 'hiragana';

-- y-group
update cards set mnemonics_en = array['A yak''s horns making a Y shape',  '"Ya!" — a slingshot ready to fire'],
                 mnemonic_keyword_en = array['yak', 'ya'] where character = 'や' and type = 'hiragana';

update cards set mnemonics_en = array['A young eel curling in the water',  '"Yoo-hoo!" — waving from a boat'],
                 mnemonic_keyword_en = array['young', 'yoo-hoo'] where character = 'ゆ' and type = 'hiragana';

update cards set mnemonics_en = array['A yo-yo spinning up and down',  'A yoke over someone''s shoulders'],
                 mnemonic_keyword_en = array['yo-yo', 'yoke'] where character = 'よ' and type = 'hiragana';

-- r-group
update cards set mnemonics_en = array['A rabbit sitting up on its hind legs',  'A raven perched on a branch'],
                 mnemonic_keyword_en = array['rabbit', 'raven'] where character = 'ら' and type = 'hiragana';

update cards set mnemonics_en = array['Reed stalks bending in the river',  'Two ribbons tied together'],
                 mnemonic_keyword_en = array['river', 'ribbons'] where character = 'り' and type = 'hiragana';

update cards set mnemonics_en = array['A rooster''s tail curling in a loop',  'A rug rolled up tightly'],
                 mnemonic_keyword_en = array['rooster', 'rug'] where character = 'る' and type = 'hiragana';

update cards set mnemonics_en = array['A reed blowing in the wind',  '"Re-wind!" — a leg kicking backward'],
                 mnemonic_keyword_en = array['reed', 're-wind'] where character = 'れ' and type = 'hiragana';

update cards set mnemonics_en = array['A road winding without an exit',  'A rolling wave with no curl'],
                 mnemonic_keyword_en = array['road', 'rolling'] where character = 'ろ' and type = 'hiragana';

-- w-group
update cards set mnemonics_en = array['A wave cresting on the beach — "wahoo!"',  'A walrus rearing up'],
                 mnemonic_keyword_en = array['wave', 'walrus'] where character = 'わ' and type = 'hiragana';

update cards set mnemonics_en = array['"Woah!" — someone stumbling on an obstacle',  '"Woe is me!" (the object particle)'],
                 mnemonic_keyword_en = array['woah', 'woe'] where character = 'を' and type = 'hiragana';

-- n standalone
update cards set mnemonics_en = array['A curvy lowercase "n" humming at the end',  'Humming "nnn…" — the nasal final sound'],
                 mnemonic_keyword_en = array['n', 'nnn'] where character = 'ん' and type = 'hiragana';
