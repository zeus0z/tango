-- Replace the single-string `mnemonic` column with a per-language array of
-- mnemonics. PT-BR ships first; `mnemonics_en` is added later under its own ticket.
--
-- The old `mnemonic` column was never populated (all NULL), so dropping it is safe.
-- Cards are read via `select('*')`, so the new column flows through to the app
-- with no query changes. Content is seeded in supabase/seed.sql.

alter table public.cards drop column if exists mnemonic;

alter table public.cards add column mnemonics_pt text[];
