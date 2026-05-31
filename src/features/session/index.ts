/**
 * Public API for the session feature.
 *
 * Only import from this file when consuming session from other features/pages.
 */

export { SessionCardView } from './components/SessionCardView'
export { SessionSummary } from './components/SessionSummary'
export { SessionProgress } from './components/SessionProgress'
export { RatingButtons } from './components/RatingButtons'
export { IntroduceCharacter } from './components/IntroduceCharacter'
export { useSessionQueueQuery, useTeachingPlanQuery } from './hooks/useSessionQueue'
export {
  buildLearnQueue,
  buildLearnTeachingQueue,
  buildReviewRecentQueue,
  buildReviewAllQueue,
  NEW_CARDS_PER_SESSION,
} from './utils/buildSession'
export type { TeachingItem } from './utils/buildSession'
export { persistReview, fetchCardProgress } from './utils/persistReview'
