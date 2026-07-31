import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getBackUrl, isStagingEnv } from '../domainUtils'

describe('domainUtils', () => {
  describe('isStagingEnv', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('returns true on staging', () => {
      vi.stubEnv('VITE_APP_ENV', 'staging')
      expect(isStagingEnv()).toBe(true)
    })

    it('returns true in development', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      expect(isStagingEnv()).toBe(true)
    })

    it('returns false in production', () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      expect(isStagingEnv()).toBe(false)
    })
  })

  describe('getBackUrl', () => {
    const originalLocation = window.location

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { search: '' },
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('returns backUrl from search params when present', () => {
      Object.defineProperty(window, 'location', {
        value: { search: '?backUrl=/dashboard' },
        writable: true,
        configurable: true,
      })
      expect(getBackUrl()).toBe('/dashboard')
    })

    it('returns null when backUrl is not in search', () => {
      expect(getBackUrl()).toBe(null)
    })
  })
})
