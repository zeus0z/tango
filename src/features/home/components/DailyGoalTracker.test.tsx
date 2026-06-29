import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DailyGoalTracker } from './DailyGoalTracker'

/**
 * Establishes the React Testing Library pattern: render a prop-driven component
 * into jsdom and assert what the user sees.
 */
describe('DailyGoalTracker', () => {
  it('shows the count against the daily goal of 5', () => {
    render(<DailyGoalTracker learnedToday={2} />)
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
    expect(screen.getByText('Daily goal')).toBeInTheDocument()
  })

  it('does not show the goal-reached message before the goal is met', () => {
    render(<DailyGoalTracker learnedToday={4} />)
    expect(screen.queryByText(/Goal reached/i)).not.toBeInTheDocument()
  })

  it('shows the goal-reached message once the goal is met', () => {
    render(<DailyGoalTracker learnedToday={5} />)
    expect(screen.getByText('5 / 5')).toBeInTheDocument()
    expect(screen.getByText(/Goal reached/i)).toBeInTheDocument()
  })

  it('renders a skeleton (no labels) while loading', () => {
    render(<DailyGoalTracker learnedToday={0} isLoading />)
    expect(screen.queryByText('Daily goal')).not.toBeInTheDocument()
    expect(screen.queryByText(/\/ 5/)).not.toBeInTheDocument()
  })
})
