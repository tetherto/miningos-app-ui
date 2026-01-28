import * as Sentry from '@sentry/react'

import type { LogLevel, LoggerService } from '@/types/api'

/**
 * Logger service to handle logging messages in development and production environments.
 * To enable dev mode please run
 * ```localStorage.setItem('features', JSON.stringify({isDevelopment: true}))```
 * in the browser console.
 */
export const Logger: LoggerService = (() => {
  let isDevelopment = process.env.NODE_ENV === 'development'

  const init = (isDev: boolean): void => {
    isDevelopment = isDev
  }

  const logToConsole = (level: LogLevel, message: string, extra?: unknown): void => {
    if (extra) {
      // eslint-disable-next-line no-console
      console[level](message, extra)
    } else {
      // eslint-disable-next-line no-console
      console[level](message)
    }
  }

  const logToSentry = (level: LogLevel, message: string, extra?: unknown): void => {
    Sentry.captureMessage(message, level as Sentry.SeverityLevel)
    if (extra) {
      Sentry.captureException(extra)
    }
  }

  const log = (level: LogLevel, message: string, extra: unknown = null, devOnly = false): void => {
    if (devOnly && !isDevelopment) return

    if (isDevelopment) {
      logToConsole(level, message, extra)
    } else {
      logToSentry(level, message, extra)
    }
  }

  return {
    init,
    log,
    info: (msg: string, extra: unknown = null, devOnly = false): void =>
      log('info', msg, extra, devOnly),
    warn: (msg: string, extra: unknown = null, devOnly = false): void =>
      log('warn', msg, extra, devOnly),
    error: (msg: string, extra: unknown = null, devOnly = false): void =>
      log('error', msg, extra, devOnly),
  }
})()
