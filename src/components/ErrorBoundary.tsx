import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { reportError } from '@/lib/errorReporter'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Page-level error boundary.
 * Catches JS errors in the subtree and shows a friendly fallback card.
 * Provides a "Try again" button that resets the boundary.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, { componentStack: info.componentStack ?? undefined })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh items-center justify-center p-4">
          <Card className="w-full max-w-sm text-center">
            <CardHeader>
              <CardTitle className="text-lg">Something went wrong</CardTitle>
              <CardDescription>
                {this.state.error?.message ?? 'An unexpected error occurred.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={this.handleReset} className="w-full">
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
