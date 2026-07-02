import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DailyGoalTracker } from './DailyGoalTracker'
import { t } from '@/lib/constants/strings'

/**
 * Establishes the React Testing Library pattern: render a prop-driven component
 * into jsdom and assert what the user sees.
 */
describe('DailyGoalTracker', () => {
  it('shows the count against the daily goal of 5', () => {
    render(<DailyGoalTracker learnedToday={2} />)
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
    expect(screen.getByText(t.home.dailyGoalLabel)).toBeInTheDocument()
  })

  it('does not show the goal-reached message before the goal is met', () => {
    render(<DailyGoalTracker learnedToday={4} />)
    expect(screen.queryByText(t.home.goalReached)).not.toBeInTheDocument()
  })

  it('shows the goal-reached message once the goal is met', () => {
    render(<DailyGoalTracker learnedToday={5} />)
    expect(screen.getByText('5 / 5')).toBeInTheDocument()
    expect(screen.getByText(t.home.goalReached)).toBeInTheDocument()
  })

  it('renders a skeleton (no labels) while loading', () => {
    render(<DailyGoalTracker learnedToday={0} isLoading />)
    expect(screen.queryByText(t.home.dailyGoalLabel)).not.toBeInTheDocument()
    expect(screen.queryByText(/\/ 5/)).not.toBeInTheDocument()
  })
})
