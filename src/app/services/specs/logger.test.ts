import * as Sentry from '@sentry/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@sentry/react', () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
}))

import { Logger } from '../logger'

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Logger.init(false)
  })

  afterEach(() => {
    Logger.init(false)
  })

  describe('in production mode (isDevelopment=false)', () => {
    it('calls Sentry.captureMessage for info', () => {
      Logger.info('test info')
      expect(Sentry.captureMessage).toHaveBeenCalledWith('test info', 'info')
    })

    it('calls Sentry.captureMessage for warn', () => {
      Logger.warn('test warn')
      // Logger maps 'warn' → 'warning' for Sentry's SeverityLevel
      expect(Sentry.captureMessage).toHaveBeenCalledWith('test warn', 'warning')
    })

    it('calls Sentry.captureMessage for error', () => {
      Logger.error('test error')
      expect(Sentry.captureMessage).toHaveBeenCalledWith('test error', 'error')
    })

    it('calls Sentry.captureException when extra is provided', () => {
      const extra = new Error('extra detail')
      Logger.error('error msg', extra)
      expect(Sentry.captureException).toHaveBeenCalledWith(extra)
    })

    it('does not call Sentry.captureException when extra is null', () => {
      Logger.error('error msg', null)
      expect(Sentry.captureException).not.toHaveBeenCalled()
    })

    it('returns early when devOnly=true', () => {
      Logger.info('devOnly msg', null, true)
      expect(Sentry.captureMessage).not.toHaveBeenCalled()
    })
  })

  describe('in development mode (isDevelopment=true)', () => {
    beforeEach(() => {
      Logger.init(true)
    })

    afterEach(() => {
      Logger.init(false)
    })

    it('logs to console.info', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
      Logger.info('dev info')
      expect(spy).toHaveBeenCalledWith('dev info')
    })

    it('logs to console.info with extra', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
      Logger.info('dev info', { extra: 'data' })
      expect(spy).toHaveBeenCalledWith('dev info', { extra: 'data' })
    })

    it('logs to console.warn', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      Logger.warn('dev warn')
      expect(spy).toHaveBeenCalledWith('dev warn')
    })

    it('logs to console.error', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      Logger.error('dev error')
      expect(spy).toHaveBeenCalledWith('dev error')
    })

    it('still logs when devOnly=true in dev mode', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
      Logger.info('devOnly in dev', null, true)
      expect(spy).toHaveBeenCalled()
    })
  })
})
