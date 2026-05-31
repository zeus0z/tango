-- Add nullable mnemonic column to cards.
-- Content (the actual 46 mnemonics) is deferred — this just lays the column
-- so the upcoming Learn-as-teaching feature can populate it.

alter table public.cards add column mnemonic text;
