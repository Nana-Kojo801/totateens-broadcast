import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { ErrorScreen } from '@/pages/error'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return <ErrorScreen error={this.state.error} onReload={this.handleReload} />
    }
    return this.props.children
  }
}
