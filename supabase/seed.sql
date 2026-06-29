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

insert into cards (character, romaji, type, group_name, genki_order, example_word, example_word_romaji, mnemonics_pt, derives_from, diacritic)
values
  -- vowel (1–5)
  ('あ', 'a',   'hiragana', 'vowel',   1,  'あおい',     'aoi',      array['Tem um A maiúsculo escondido — uma abelha pousada nele', 'Um abacaxi, com a coroa espetada em cima'], null, null),
  ('い', 'i',   'hiragana', 'vowel',   2,  'いぬ',       'inu',      array['Duas ilhas pequenas lado a lado', 'Dois dedinhos fazendo sinal de paz — "íi"'], null, null),
  ('う', 'u',   'hiragana', 'vowel',   3,  'うみ',       'umi',      array['Um urubu de perfil, com o bico curvado', 'Uma curva em U na estrada — faz o retorno, "uuu"'], null, null),
  ('え', 'e',   'hiragana', 'vowel',   4,  'えき',       'eki',      array['A tromba do elefante balançando', 'Uma escada com um degrau torto'], null, null),
  ('お', 'o',   'hiragana', 'vowel',   5,  'おかあさん', 'okaasan',  array['Um menino chutando a bola — "ôba!"', 'Um óculos: repare na argolinha (a lente)'], null, null),

  -- k-group (6–10)
  ('か', 'ka',  'hiragana', 'k-group', 6,  'かさ',       'kasa',     array['Um cavalo empinando', 'Uma casa com uma antena torta'], null, null),
  ('き', 'ki',  'hiragana', 'k-group', 7,  'きって',     'kitte',    array['Um kimono dobrado no varal (duas barras)', 'Dois espetos de quibe enfileirados'], null, null),
  ('く', 'ku',  'hiragana', 'k-group', 8,  'くに',       'kuni',     array['O bico aberto de um cuco (relógio cuco)', 'Um cupim mordendo (a boca em V)'], null, null),
  ('け', 'ke',  'hiragana', 'k-group', 9,  'けいたい',   'keitai',   array['Uma fatia de queijo espetada no garfo', 'Alguém num golpe de karatê — "quê!"'], null, null),
  ('こ', 'ko',  'hiragana', 'k-group', 10, 'こども',     'kodomo',   array['Duas metades de coco empilhadas', 'Dois fios de corda enrolados — "co-co"'], null, null),

  -- s-group (11–15)
  ('さ', 'sa',  'hiragana', 's-group', 11, 'さかな',     'sakana',   array['Uma saia rodada', 'Um sapo sentado (a curva é a barriga)'], null, null),
  ('し', 'shi', 'hiragana', 's-group', 12, 'しんぶん',   'shinbun',  array['Um anzol comprido — peixe fisgado, "xiii!"', 'Uma xícara de lado, com a alça curva'], null, null),
  ('す', 'su',  'hiragana', 's-group', 13, 'すし',       'sushi',    array['Um suco com canudo enrolado', 'Um bolinho de sushi com um laço em cima'], null, null),
  ('せ', 'se',  'hiragana', 's-group', 14, 'せんせい',   'sensei',   array['Uma sereia com a cauda enrolada', 'Uma seta torta apontando o caminho'], null, null),
  ('そ', 'so',  'hiragana', 's-group', 15, 'そら',       'sora',     array['Um sorvete soft com a pontinha torta', 'Linha de costura em zigue-zague — "só costurando"'], null, null),

  -- t-group (16–20)
  ('た', 'ta',  'hiragana', 't-group', 16, 'たべもの',   'tabemono', array['Um tatu se enrolando', 'Uma taça com a haste fininha'], null, null),
  ('ち', 'chi', 'hiragana', 't-group', 17, 'ちず',       'chizu',    array['Uma bola de chiclete sendo estourada', 'Um tico-tico (passarinho) cantando'], null, null),
  ('つ', 'tsu', 'hiragana', 't-group', 18, 'つくえ',     'tsukue',   array['Uma onda de tsunami se formando', 'Um bumerangue voando — faz "tsu" no ar'], null, null),
  ('て', 'te',  'hiragana', 't-group', 19, 'てがみ',     'tegami',   array['O gancho de um telefone antigo', 'Uma tesoura meio aberta'], null, null),
  ('と', 'to',  'hiragana', 't-group', 20, 'とけい',     'tokei',    array['Um tomate espetado no palito', 'Um toco de árvore com um espinho saindo'], null, null),

  -- n-group (21–25)
  ('な', 'na',  'hiragana', 'n-group', 21, 'なまえ',     'namae',    array['Um nadador mergulhando', 'Um navio com a vela enrolada'], null, null),
  ('に', 'ni',  'hiragana', 'n-group', 22, 'にほん',     'nihon',    array['Um ninho com dois ovinhos', 'Dois ninjas lado a lado'], null, null),
  ('ぬ', 'nu',  'hiragana', 'n-group', 23, null,         null,       array['Uma nuvem com um cachinho enrolado embaixo', 'Um prato de macarrão enrolado no garfo (o nó)'], null, null),
  ('ね', 'ne',  'hiragana', 'n-group', 24, 'ねこ',       'neko',     array['Um neném dormindo enroladinho', 'Um gatinho com o rabo em laço (o "ne" de neko)'], null, null),
  ('の', 'no',  'hiragana', 'n-group', 25, 'のみもの',   'nomimono', array['Um nó bem enrolado', 'Uma placa de "não entre" (o círculo cortado)'], null, null),

  -- h-group (26–30)
  ('は', 'ha',  'hiragana', 'h-group', 26, 'はな',       'hana',     array['Uma casinha onde alguém ri "há-há"', 'Uma pessoa de braços abertos gargalhando'], null, null),
  ('ひ', 'hi',  'hiragana', 'h-group', 27, 'ひと',       'hito',     array['Um sorrisão rindo "hi-hi-hi"', 'Um nariz grande de perfil (a corcova)'], null, null),
  ('ふ', 'fu',  'hiragana', 'h-group', 28, 'ふじさん',   'fujisan',  array['Uma fogueira soltando fumaça (os floquinhos)', 'O monte Fuji nevado'], null, null),
  ('へ', 'he',  'hiragana', 'h-group', 29, null,         null,       array['Uma ladeira inclinada — "lá vai ele subindo"', 'O telhado pontudo de uma casa'], null, null),
  ('ほ', 'ho',  'hiragana', 'h-group', 30, 'ほん',       'hon',      array['A chaminé do Papai Noel — "ho-ho-ho"', 'A casinha (は) ganhou um mastro com bandeira'], null, null),

  -- m-group (31–35)
  ('ま', 'ma',  'hiragana', 'm-group', 31, 'まいにち',   'mainichi', array['A mamãe de cabelo preso no coque', 'Uma maçã com a folhinha torta no cabo'], null, null),
  ('み', 'mi',  'hiragana', 'm-group', 32, 'みみ',       'mimi',     array['Uma minhoca se contorcendo', 'Uma nota musical — cante "mi" (dó-ré-mi)'], null, null),
  ('む', 'mu',  'hiragana', 'm-group', 33, null,         null,       array['Uma vaca mugindo "muuu"', 'Um músculo (bíceps) flexionado'], null, null),
  ('め', 'me',  'hiragana', 'm-group', 34, 'めがね',     'megane',   array['Um olho olhando — "olha pra mim"', 'Uma melancia com a casca em espiral'], null, null),
  ('も', 'mo',  'hiragana', 'm-group', 35, 'もの',       'mono',     array['Uma mola torta (o gancho enrolado)', 'Um anzol pescando "morangos" — mais um!'], null, null),

  -- y-group (36–38)
  ('や', 'ya',  'hiragana', 'y-group', 36, 'やま',       'yama',     array['Um estilingue em formato de Y — "ya!"', 'Um iate com a vela triangular'], null, null),
  ('ゆ', 'yu',  'hiragana', 'y-group', 37, 'ゆき',       'yuki',     array['Um peixe enrolado, cauda em laço — "iú!"', 'Um anzol duplo — "você (yu) pescou!"'], null, null),
  ('よ', 'yo',  'hiragana', 'y-group', 38, 'よる',       'yoru',     array['Um ioiô subindo e descendo', 'Uma vara de pescar com a linha pendurada'], null, null),

  -- r-group (39–43)
  ('ら', 'ra',  'hiragana', 'r-group', 39, 'らいしゅう', 'raishuu',  array['Uma raposa sentada, rabo pra cima', 'Um rato em pé, farejando'], null, null),
  ('り', 'ri',  'hiragana', 'r-group', 40, 'りんご',     'ringo',    array['Dois juncos à beira do rio', 'Pingos de chuva caindo — "dri, dri"'], null, null),
  ('る', 'ru',  'hiragana', 'r-group', 41, null,         null,       array['Uma rua que termina numa rotatória', 'Uma mola fazendo ruído ao enrolar'], null, null),
  ('れ', 're',  'hiragana', 'r-group', 42, null,         null,       array['Uma perna saindo da rede (de balanço)', 'Um corredor de revezamento chutando pra trás'], null, null),
  ('ろ', 'ro',  'hiragana', 'r-group', 43, null,         null,       array['Uma rodovia sinuosa, sem alça no fim', 'Uma rosca — o caminho que dá voltas'], null, null),

  -- w-group (44–45)
  ('わ', 'wa',  'hiragana', 'w-group', 44, 'わたし',     'watashi',  array['Um cisne deslizando na água', 'Alguém acenando feliz — "uau!"'], null, null),
  ('を', 'wo',  'hiragana', 'w-group', 45, null,         null,       array['Alguém tropeçando — "ó!" (partícula de objeto)', 'Uma pessoa carregando uma mochila (carrega o objeto)'], null, null),

  -- n standalone (46)
  ('ん', 'n',   'hiragana', 'n',       46, null,         null,       array['Um rabisco que zumbe "nnn" (o n minúsculo)', 'O gancho final que fecha a sílaba com "n"'], null, null)

on conflict (character, type) do nothing;

-- ── Insert 25 derived hiragana (dakuten + handakuten) ─────────────────────────
-- mnemonics_pt stays null: derived cards reuse the base character's hooks on the
-- pair-intro screen.

insert into cards (character, romaji, type, group_name, genki_order, example_word, example_word_romaji, mnemonics_pt, derives_from, diacritic)
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
