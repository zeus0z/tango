alter table public.cards
  add column derives_from text,
  add column diacritic text check (diacritic in ('dakuten','handakuten'));
