grant usage on schema public to anon, authenticated;

-- authenticated users can read/write their own data (RLS enforces row-level access)
grant select, insert, update, delete
  on profiles, user_card_progress, review_logs
  to authenticated;

-- cards are seeded reference data; any visitor (even unauthenticated) can read them
grant select on cards to anon, authenticated;
