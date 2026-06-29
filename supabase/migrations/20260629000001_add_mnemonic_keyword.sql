-- Migration: add mnemonic_keyword column to cards (PER-38)
--
-- Adds a parallel text[] array alongside mnemonics_pt that stores the exact
-- word or substring to highlight in each mnemonic entry. This replaces the
-- naive indexOf(romaji) approach, which reliably fails for single-vowel romaji
-- (e.g. 'o' highlights 'menino' instead of 'ôba').
--
-- Each entry in mnemonic_keyword[i] is the anchor word for mnemonics_pt[i].
-- An empty string entry means no highlight for that mnemonic.
-- MnemonicViewer gracefully skips highlighting when keyword is absent/empty.

alter table cards add column if not exists mnemonic_keyword text[];

-- Backfill all 46 base hiragana keyword arrays.
-- vowels
update cards set mnemonic_keyword = array['abelha',   'abacaxi'    ] where character = 'あ' and type = 'hiragana';
update cards set mnemonic_keyword = array['ilhas',    'íi'         ] where character = 'い' and type = 'hiragana';
update cards set mnemonic_keyword = array['urubu',    'U'          ] where character = 'う' and type = 'hiragana';
update cards set mnemonic_keyword = array['elefante', 'escada'     ] where character = 'え' and type = 'hiragana';
update cards set mnemonic_keyword = array['ôba',      'óculos'     ] where character = 'お' and type = 'hiragana';

-- k-group
update cards set mnemonic_keyword = array['cavalo',   'casa'       ] where character = 'か' and type = 'hiragana';
update cards set mnemonic_keyword = array['kimono',   'quibe'      ] where character = 'き' and type = 'hiragana';
update cards set mnemonic_keyword = array['cuco',     'cupim'      ] where character = 'く' and type = 'hiragana';
update cards set mnemonic_keyword = array['queijo',   'quê'        ] where character = 'け' and type = 'hiragana';
update cards set mnemonic_keyword = array['coco',     'co-co'      ] where character = 'こ' and type = 'hiragana';

-- s-group
update cards set mnemonic_keyword = array['saia',     'sapo'       ] where character = 'さ' and type = 'hiragana';
update cards set mnemonic_keyword = array['xiii',     'xícara'     ] where character = 'し' and type = 'hiragana';
update cards set mnemonic_keyword = array['suco',     'sushi'      ] where character = 'す' and type = 'hiragana';
update cards set mnemonic_keyword = array['sereia',   'seta'       ] where character = 'せ' and type = 'hiragana';
update cards set mnemonic_keyword = array['sorvete',  'só'         ] where character = 'そ' and type = 'hiragana';

-- t-group
update cards set mnemonic_keyword = array['tatu',     'taça'       ] where character = 'た' and type = 'hiragana';
update cards set mnemonic_keyword = array['chiclete', 'tico-tico'  ] where character = 'ち' and type = 'hiragana';
update cards set mnemonic_keyword = array['tsunami',  'tsu'        ] where character = 'つ' and type = 'hiragana';
update cards set mnemonic_keyword = array['telefone', 'tesoura'    ] where character = 'て' and type = 'hiragana';
update cards set mnemonic_keyword = array['tomate',   'toco'       ] where character = 'と' and type = 'hiragana';

-- n-group
update cards set mnemonic_keyword = array['nadador',  'navio'      ] where character = 'な' and type = 'hiragana';
update cards set mnemonic_keyword = array['ninho',    'ninjas'     ] where character = 'に' and type = 'hiragana';
update cards set mnemonic_keyword = array['nuvem',    ''           ] where character = 'ぬ' and type = 'hiragana';
update cards set mnemonic_keyword = array['neném',    'ne'         ] where character = 'ね' and type = 'hiragana';
update cards set mnemonic_keyword = array['nó',       'não'        ] where character = 'の' and type = 'hiragana';

-- h-group
update cards set mnemonic_keyword = array['há-há',    ''           ] where character = 'は' and type = 'hiragana';
update cards set mnemonic_keyword = array['hi-hi-hi', ''           ] where character = 'ひ' and type = 'hiragana';
update cards set mnemonic_keyword = array['fumaça',   'Fuji'       ] where character = 'ふ' and type = 'hiragana';
update cards set mnemonic_keyword = array['ele',      ''           ] where character = 'へ' and type = 'hiragana';
update cards set mnemonic_keyword = array['ho-ho-ho', ''           ] where character = 'ほ' and type = 'hiragana';

-- m-group
update cards set mnemonic_keyword = array['mamãe',    'maçã'       ] where character = 'ま' and type = 'hiragana';
update cards set mnemonic_keyword = array['minhoca',  'mi'         ] where character = 'み' and type = 'hiragana';
update cards set mnemonic_keyword = array['mugindo',  'músculo'    ] where character = 'む' and type = 'hiragana';
update cards set mnemonic_keyword = array['',         'melancia'   ] where character = 'め' and type = 'hiragana';
update cards set mnemonic_keyword = array['mola',     'morangos'   ] where character = 'も' and type = 'hiragana';

-- y-group
update cards set mnemonic_keyword = array['ya',       'iate'       ] where character = 'や' and type = 'hiragana';
update cards set mnemonic_keyword = array['iú',       'yu'         ] where character = 'ゆ' and type = 'hiragana';
update cards set mnemonic_keyword = array['ioiô',     ''           ] where character = 'よ' and type = 'hiragana';

-- r-group
update cards set mnemonic_keyword = array['raposa',   'rato'       ] where character = 'ら' and type = 'hiragana';
update cards set mnemonic_keyword = array['rio',      'dri'        ] where character = 'り' and type = 'hiragana';
update cards set mnemonic_keyword = array['rua',      'ruído'      ] where character = 'る' and type = 'hiragana';
update cards set mnemonic_keyword = array['rede',     'revezamento'] where character = 'れ' and type = 'hiragana';
update cards set mnemonic_keyword = array['rodovia',  'rosca'      ] where character = 'ろ' and type = 'hiragana';

-- w-group
update cards set mnemonic_keyword = array['',         'uau'        ] where character = 'わ' and type = 'hiragana';
update cards set mnemonic_keyword = array['ó',        ''           ] where character = 'を' and type = 'hiragana';

-- n standalone
update cards set mnemonic_keyword = array['nnn',      'n'          ] where character = 'ん' and type = 'hiragana';
