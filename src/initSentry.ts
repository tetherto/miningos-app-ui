/* global GIT_INFO */
declare const __BUILD_TIME__: string
import * as Sentry from '@sentry/react'

import { Logger } from '@/app/services/logger'
import { getAppEnvironment, getSentryConfig, isProduction } from '@/app/utils/environment'

// Initialize Sentry only in production environment
if (isProduction()) {
  try {
    const sentryConfig = getSentryConfig()

    Sentry.init({
      dsn: sentryConfig.dsn,
      environment: sentryConfig.environment,
      // Sample rate for production
      tracesSampleRate: 0.1,
      // Release tracking
      release: GIT_INFO?.commit || 'unknown',
      // Additional context
      beforeSend(event) {
        // Add environment context to all events
        event.tags = {
          ...event.tags,
          app_environment: getAppEnvironment(),
          build_time: __BUILD_TIME__,
        }
        return event
      },
    })
  } catch (error: unknown) {
    Logger.error('Sentry initialization failed', error)
  }
}
