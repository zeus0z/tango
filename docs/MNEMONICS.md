# MNEMONICS.md — Tango mnemonic source of truth

This is the **canonical, human-readable list** of card mnemonics. It is the authoring source that
gets transcribed into `supabase/seed.sql` (`mnemonics_pt text[]`) and mirrored in
`src/lib/constants/hiragana.ts`. Edit here first, then sync the code.

- **Language:** Brazilian Portuguese (PT-BR) — first pass. English (`mnemonics_en`) is a later ticket.
- **Count:** up to ~2 hooks per character. The UI shows **one at a time** with ‹ › arrows
  (`MnemonicViewer`), so the **first** entry is the primary/default.
- **Style:** each hook anchors on the **Portuguese sound + the kana's shape**. Keep it short,
  concrete, and imageable (≤ ~12 words). Favour Brazilian everyday words.
- **Scope:** the 46 base hiragana (gojūon). Derived chars (dakuten/handakuten) reuse the base
  character's hooks via the pair-intro screen, so they are not listed separately.

> Hard cases (no clean PT sound match): the silent-**h** row は/ひ/へ/ほ, plus つ (tsu) and ゆ (yu).
> There we lean on onomatopoeia, laughter, or the character's example word. Flagged with ⚠️ below.

---

## Vogais

| # | Kana | Romaji | Mnemônico 1 (primário) | Mnemônico 2 |
|---|------|--------|------------------------|-------------|
| 1 | あ | a | Tem um **A** maiúsculo escondido — uma **a**belha pousada nele | Um **a**bacaxi, com a coroa espetada em cima |
| 2 | い | i | Duas **i**lhas pequenas lado a lado | Dois dedinhos fazendo sinal de paz — "íi" |
| 3 | う | u | Um **u**rubu de perfil, com o bico curvado | Uma curva em **U** na estrada — faz o retorno, "uuu" |
| 4 | え | e | A tromba do **e**lefante balançando | Uma **e**scada com um degrau torto |
| 5 | お | o | Um menino chutando a b**o**la — "ôba!" | Um **ó**culos: repare na argolinha (a lente) |

## K — か-group

| # | Kana | Romaji | Mnemônico 1 (primário) | Mnemônico 2 |
|---|------|--------|------------------------|-------------|
| 6 | か | ka | Um **ca**valo empinando | Uma **ca**sa com uma antena torta |
| 7 | き | ki | Um **ki**mono dobrado no varal (duas barras) | Dois espetos de **qui**be enfileirados |
| 8 | く | ku | O bico aberto de um **cu**co (relógio cuco) | Um **cu**pim mordendo (a boca em V) |
| 9 | け | ke | Uma fatia de **que**ijo espetada no garfo | Alguém num golpe de karatê — "quê!" |
| 10 | こ | ko | Duas metades de **co**co empilhadas | Dois fios de **co**rda enrolados — "co-co" |

## S — さ-group

| # | Kana | Romaji | Mnemônico 1 (primário) | Mnemônico 2 |
|---|------|--------|------------------------|-------------|
| 11 | さ | sa | Uma **sa**ia rodada | Um **sa**po sentado (a curva é a barriga) |
| 12 | し | shi | Um anzol comprido — peixe fisgado, "xiii!" | Uma **xí**cara de lado, com a alça curva |
| 13 | す | su | Um **su**co com canudo enrolado | Um bolinho de **su**shi com um laço em cima |
| 14 | せ | se | Uma **se**reia com a cauda enrolada | Uma **se**ta torta apontando o caminho |
| 15 | そ | so | Um **so**rvete soft com a pontinha torta | Linha de costura em zigue-zague — "só costurando" |

## T — た-group

| # | Kana | Romaji | Mnemônico 1 (primário) | Mnemônico 2 |
|---|------|--------|------------------------|-------------|
| 16 | た | ta | Um **ta**tu se enrolando | Uma **ta**ça com a haste fininha |
| 17 | ち | chi | Uma bola de **chi**clete sendo estourada | Um **ti**co-tico (passarinho) cantando |
| 18 | つ | tsu ⚠️ | Uma onda de **tsu**nami se formando | Um bumerangue voando — faz "tsu" no ar |
| 19 | て | te | O gancho de um **te**lefone antigo | Uma **te**soura meio aberta |
| 20 | と | to | Um **to**mate espetado no palito | Um **to**co de árvore com um espinho saindo |

## N — な-group

| # | Kana | Romaji | Mnemônico 1 (primário) | Mnemônico 2 |
|---|------|--------|------------------------|-------------|
| 21 | な | na | Um **na**dador mergulhando | Um **na**vio com a vela enrolada |
| 22 | に | ni | Um **ni**nho com dois ovinhos | Dois **ni**njas lado a lado |
| 23 | ぬ | nu ⚠️ | Uma **nu**vem com um cachinho enrolado embaixo | Um prato de macarrão enrolado no garfo (o nó) |
| 24 | ね | ne | Um **ne**ném dormindo enroladinho | Um gatinho com o rabo em laço (o "ne" de neko) |
| 25 | の | no | Um **nó** bem enrolado | Uma placa de "**não** entre" (o círculo cortado) |

## H — は-group

| # | Kana | Romaji | Mnemônico 1 (primário) | Mnemônico 2 |
|---|------|--------|------------------------|-------------|
| 26 | は | ha ⚠️ | Uma casinha onde alguém ri "**há**-há" | Uma pessoa de braços abertos gargalhando |
| 27 | ひ | hi ⚠️ | Um sorrisão rindo "**hi**-hi-hi" | Um nariz grande de perfil (a corcova) |
| 28 | ふ | fu | Uma fogueira soltando **fu**maça (os floquinhos) | O monte **Fu**ji nevado |
| 29 | へ | he ⚠️ | Uma ladeira inclinada — "lá vai **e**le subindo" | O telhado pontudo de uma casa |
| 30 | ほ | ho ⚠️ | A chaminé do Papai Noel — "**ho**-ho-ho" | A casinha (は) ganhou um mastro com bandeira |

## M — ま-group

| # | Kana | Romaji | Mnemônico 1 (primário) | Mnemônico 2 |
|---|------|--------|------------------------|-------------|
| 31 | ま | ma | A **ma**mãe de cabelo preso no coque | Uma **ma**çã com a folhinha torta no cabo |
| 32 | み | mi | Uma **mi**nhoca se contorcendo | Uma nota musical — cante "**mi**" (dó-ré-mi) |
| 33 | む | mu | Uma vaca mugindo "**muuu**" | Um **mú**sculo (bíceps) flexionado |
| 34 | め | me | Um olho olhando — "olha pra **mim**" | Uma **me**lancia com a casca em espiral |
| 35 | も | mo | Uma **mo**la torta (o gancho enrolado) | Um anzol pescando "**mo**rangos" — mais um! |

## Y — や-group

| # | Kana | Romaji | Mnemônico 1 (primário) | Mnemônico 2 |
|---|------|--------|------------------------|-------------|
| 36 | や | ya | Um estilingue em formato de **Y** — "ya!" | Um **ia**te com a vela triangular |
| 37 | ゆ | yu ⚠️ | Um peixe enrolado, cauda em laço — "iú!" | Um anzol duplo — "**você** (yu) pescou!" |
| 38 | よ | yo | Um io**iô** subindo e descendo | Uma vara de pescar com a linha pendurada |

## R — ら-group

| # | Kana | Romaji | Mnemônico 1 (primário) | Mnemônico 2 |
|---|------|--------|------------------------|-------------|
| 39 | ら | ra | Uma **ra**posa sentada, rabo pra cima | Um **ra**to em pé, farejando |
| 40 | り | ri | Dois juncos à beira do **ri**o | Pingos de chuva caindo — "dri, dri" |
| 41 | る | ru | Uma **ru**a que termina numa rotatória | Uma mola fazendo **ru**ído ao enrolar |
| 42 | れ | re | Uma perna saindo da **re**de (de balanço) | Um corredor de **re**vezamento chutando pra trás |
| 43 | ろ | ro | Uma **ro**dovia sinuosa, sem alça no fim | Uma **ro**sca — o caminho que dá voltas |

## W — わ-group + ん

| # | Kana | Romaji | Mnemônico 1 (primário) | Mnemônico 2 |
|---|------|--------|------------------------|-------------|
| 44 | わ | wa | Um cisne deslizando na á**gua** | Alguém acenando feliz — "uau!" |
| 45 | を | wo | Alguém tropeçando — "ó!" (partícula de objeto) | Uma pessoa carregando uma mochila (carrega o objeto) |
| 46 | ん | n | Um rabisco que zumbe "nnn" (o **n** minúsculo) | O gancho final que fecha a sílaba com "n" |

---

## Where PT-BR shines

Hooks that feel native rather than translated: さ **saia**, む vaca **muuu**, た **tatu**, ま **mamãe**,
よ io**iô**, の **nó**, み **minhoca**, ら **raposa**, り **rio**, る **rua** / ろ **rodovia** (ótimo par
mínimo), に **ninho**, ね **neném**.

## Sync checklist (when editing this file)

1. Update the tables above.
2. Mirror into `supabase/seed.sql` → `mnemonics_pt` (ARRAY[...] per base card, primary first).
3. Mirror into `src/lib/constants/hiragana.ts` → `mnemonics_pt` on the 46 base entries.
4. Re-run `supabase db reset` (or push) locally so the seeded DB reflects the change.
