-- Backfill mnemonics_pt for all 46 base hiragana cards.
-- The column was added in 20260608000000_mnemonics_pt_array.sql but seed.sql
-- uses ON CONFLICT DO NOTHING, so existing production rows were never updated.

update cards set mnemonics_pt = array['Tem um A maiúsculo escondido — uma abelha pousada nele', 'Um abacaxi, com a coroa espetada em cima'] where character = 'あ' and type = 'hiragana';
update cards set mnemonics_pt = array['Duas ilhas pequenas lado a lado', 'Dois dedinhos fazendo sinal de paz — "íi"'] where character = 'い' and type = 'hiragana';
update cards set mnemonics_pt = array['Um urubu de perfil, com o bico curvado', 'Uma curva em U na estrada — faz o retorno, "uuu"'] where character = 'う' and type = 'hiragana';
update cards set mnemonics_pt = array['A tromba do elefante balançando', 'Uma escada com um degrau torto'] where character = 'え' and type = 'hiragana';
update cards set mnemonics_pt = array['Um menino chutando a bola — "ôba!"', 'Um óculos: repare na argolinha (a lente)'] where character = 'お' and type = 'hiragana';

update cards set mnemonics_pt = array['Um cavalo empinando', 'Uma casa com uma antena torta'] where character = 'か' and type = 'hiragana';
update cards set mnemonics_pt = array['Um kimono dobrado no varal (duas barras)', 'Dois espetos de quibe enfileirados'] where character = 'き' and type = 'hiragana';
update cards set mnemonics_pt = array['O bico aberto de um cuco (relógio cuco)', 'Um cupim mordendo (a boca em V)'] where character = 'く' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma fatia de queijo espetada no garfo', 'Alguém num golpe de karatê — "quê!"'] where character = 'け' and type = 'hiragana';
update cards set mnemonics_pt = array['Duas metades de coco empilhadas', 'Dois fios de corda enrolados — "co-co"'] where character = 'こ' and type = 'hiragana';

update cards set mnemonics_pt = array['Uma saia rodada', 'Um sapo sentado (a curva é a barriga)'] where character = 'さ' and type = 'hiragana';
update cards set mnemonics_pt = array['Um anzol comprido — peixe fisgado, "xiii!"', 'Uma xícara de lado, com a alça curva'] where character = 'し' and type = 'hiragana';
update cards set mnemonics_pt = array['Um suco com canudo enrolado', 'Um bolinho de sushi com um laço em cima'] where character = 'す' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma sereia com a cauda enrolada', 'Uma seta torta apontando o caminho'] where character = 'せ' and type = 'hiragana';
update cards set mnemonics_pt = array['Um sorvete soft com a pontinha torta', 'Linha de costura em zigue-zague — "só costurando"'] where character = 'そ' and type = 'hiragana';

update cards set mnemonics_pt = array['Um tatu se enrolando', 'Uma taça com a haste fininha'] where character = 'た' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma bola de chiclete sendo estourada', 'Um tico-tico (passarinho) cantando'] where character = 'ち' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma onda de tsunami se formando', 'Um bumerangue voando — faz "tsu" no ar'] where character = 'つ' and type = 'hiragana';
update cards set mnemonics_pt = array['O gancho de um telefone antigo', 'Uma tesoura meio aberta'] where character = 'て' and type = 'hiragana';
update cards set mnemonics_pt = array['Um tomate espetado no palito', 'Um toco de árvore com um espinho saindo'] where character = 'と' and type = 'hiragana';

update cards set mnemonics_pt = array['Um nadador mergulhando', 'Um navio com a vela enrolada'] where character = 'な' and type = 'hiragana';
update cards set mnemonics_pt = array['Um ninho com dois ovinhos', 'Dois ninjas lado a lado'] where character = 'に' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma nuvem com um cachinho enrolado embaixo', 'Um prato de macarrão enrolado no garfo (o nó)'] where character = 'ぬ' and type = 'hiragana';
update cards set mnemonics_pt = array['Um neném dormindo enroladinho', 'Um gatinho com o rabo em laço (o "ne" de neko)'] where character = 'ね' and type = 'hiragana';
update cards set mnemonics_pt = array['Um nó bem enrolado', 'Uma placa de "não entre" (o círculo cortado)'] where character = 'の' and type = 'hiragana';

update cards set mnemonics_pt = array['Uma casinha onde alguém ri "há-há"', 'Uma pessoa de braços abertos gargalhando'] where character = 'は' and type = 'hiragana';
update cards set mnemonics_pt = array['Um sorrisão rindo "hi-hi-hi"', 'Um nariz grande de perfil (a corcova)'] where character = 'ひ' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma fogueira soltando fumaça (os floquinhos)', 'O monte Fuji nevado'] where character = 'ふ' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma ladeira inclinada — "lá vai ele subindo"', 'O telhado pontudo de uma casa'] where character = 'へ' and type = 'hiragana';
update cards set mnemonics_pt = array['A chaminé do Papai Noel — "ho-ho-ho"', 'A casinha (は) ganhou um mastro com bandeira'] where character = 'ほ' and type = 'hiragana';

update cards set mnemonics_pt = array['A mamãe de cabelo preso no coque', 'Uma maçã com a folhinha torta no cabo'] where character = 'ま' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma minhoca se contorcendo', 'Uma nota musical — cante "mi" (dó-ré-mi)'] where character = 'み' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma vaca mugindo "muuu"', 'Um músculo (bíceps) flexionado'] where character = 'む' and type = 'hiragana';
update cards set mnemonics_pt = array['Um olho olhando — "olha pra mim"', 'Uma melancia com a casca em espiral'] where character = 'め' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma mola torta (o gancho enrolado)', 'Um anzol pescando "morangos" — mais um!'] where character = 'も' and type = 'hiragana';

update cards set mnemonics_pt = array['Um estilingue em formato de Y — "ya!"', 'Um iate com a vela triangular'] where character = 'や' and type = 'hiragana';
update cards set mnemonics_pt = array['Um peixe enrolado, cauda em laço — "iú!"', 'Um anzol duplo — "você (yu) pescou!"'] where character = 'ゆ' and type = 'hiragana';
update cards set mnemonics_pt = array['Um ioiô subindo e descendo', 'Uma vara de pescar com a linha pendurada'] where character = 'よ' and type = 'hiragana';

update cards set mnemonics_pt = array['Uma raposa sentada, rabo pra cima', 'Um rato em pé, farejando'] where character = 'ら' and type = 'hiragana';
update cards set mnemonics_pt = array['Dois juncos à beira do rio', 'Pingos de chuva caindo — "dri, dri"'] where character = 'り' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma rua que termina numa rotatória', 'Uma mola fazendo ruído ao enrolar'] where character = 'る' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma perna saindo da rede (de balanço)', 'Um corredor de revezamento chutando pra trás'] where character = 'れ' and type = 'hiragana';
update cards set mnemonics_pt = array['Uma rodovia sinuosa, sem alça no fim', 'Uma rosca — o caminho que dá voltas'] where character = 'ろ' and type = 'hiragana';

update cards set mnemonics_pt = array['Um cisne deslizando na água', 'Alguém acenando feliz — "uau!"'] where character = 'わ' and type = 'hiragana';
update cards set mnemonics_pt = array['Alguém tropeçando — "ó!" (partícula de objeto)', 'Uma pessoa carregando uma mochila (carrega o objeto)'] where character = 'を' and type = 'hiragana';
update cards set mnemonics_pt = array['Um rabisco que zumbe "nnn" (o n minúsculo)', 'O gancho final que fecha a sílaba com "n"'] where character = 'ん' and type = 'hiragana';
