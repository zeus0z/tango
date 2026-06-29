import { useMutation, useQueryClient } from '@tanstack/react-query'

import { resetAllProgressForUser } from '../services/resetProgress.service'

/**
 * Mutation hook to wipe all FSRS progress + review history for the current user.
 * On success, invalidates every cached query so home / progress / session screens
 * refetch their now-empty data.
 */
export function useResetProgress(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not signed in')
      await resetAllProgressForUser(userId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries()
    },
  })
}
