import { Component as ReactComponent, ComponentType, ErrorInfo, ReactNode } from 'react'

import {
  ErrorBoundaryComponentName,
  ErrorBoundaryMessage,
  ErrorBoundaryRoot,
  ErrorBoundaryTitle,
} from './ErrorBoundary.styles'
import { getStackTrace } from './ErrorBoundary.utils'

interface ErrorBoundaryState {
  failed: boolean
  stackTrace: ReactNode | null
}

export const withErrorBoundary = <P extends object>(
  Component: ComponentType<P>,
  title: string = (Component as ComponentType<P> & { name?: string; displayName?: string }).name ||
    (Component as ComponentType<P> & { name?: string; displayName?: string }).displayName ||
    'Component',
  onError?: (error: Error, info: ErrorInfo) => void,
) =>
  class ErrorBoundary extends ReactComponent<P, ErrorBoundaryState> {
    override state: ErrorBoundaryState = {
      failed: false,
      stackTrace: null,
    }

    override componentDidCatch(error: Error, info: ErrorInfo) {
      this.setState({
        failed: true,
        stackTrace: getStackTrace(error),
      })

      onError?.(error, info)
    }

    override render() {
      const { failed, stackTrace } = this.state

      if (failed) {
        return (
          <ErrorBoundaryRoot
            items={[
              {
                label: (
                  <ErrorBoundaryTitle>
                    <ErrorBoundaryComponentName>{title}</ErrorBoundaryComponentName>: Component
                    error
                  </ErrorBoundaryTitle>
                ),
                children: (
                  <>
                    <ErrorBoundaryMessage>
                      An unexpected error occurred.
                      <br />
                      Please refresh the page or contact support if the issue persists
                    </ErrorBoundaryMessage>
                    <br />
                    <br />
                    <div>{stackTrace}</div>
                  </>
                ),
              },
            ]}
          />
        )
      }

      return <Component {...this.props} />
    }
  }
