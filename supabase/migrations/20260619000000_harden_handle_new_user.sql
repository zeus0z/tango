-- ============================================================
-- Tango — harden handle_new_user against linter warnings
-- Migration: 20260619000000_harden_handle_new_user.sql
--
-- Fixes:
--   - function_search_path_mutable: pin search_path so the
--     SECURITY DEFINER function can't be hijacked via a mutable
--     search_path. Safe because the body already fully qualifies
--     `public.profiles`.
--   - anon/authenticated_security_definer_function_executable:
--     this function only exists to run via the on_auth_user_created
--     trigger, not to be called directly via /rest/v1/rpc/handle_new_user.
--     Triggers fire regardless of EXECUTE grants, so revoking is safe.
-- ============================================================

alter function public.handle_new_user() set search_path = '';

revoke execute on function public.handle_new_user() from public, anon, authenticated;
