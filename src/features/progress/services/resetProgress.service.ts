/**
 * Delete every row this user owns in `user_card_progress` and `review_logs`,
 * leaving the account as if it were brand new (no FSRS state, no review history).
 *
 * Safety: RLS policies on both tables restrict writes to `user_id = auth.uid()`,
 * so this can only delete the caller's own rows.
 */

import { supabase } from '@/lib/supabase'

export async function resetAllProgressForUser(userId: string): Promise<void> {
  const [progressResult, logsResult] = await Promise.all([
    supabase.from('user_card_progress').delete().eq('user_id', userId),
    supabase.from('review_logs').delete().eq('user_id', userId),
  ])

  if (progressResult.error) throw progressResult.error
  if (logsResult.error) throw logsResult.error
}
