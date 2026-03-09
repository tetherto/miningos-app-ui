import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getBackUrl, isStagingEnv } from '../domainUtils'

describe('domainUtils', () => {
  describe('isStagingEnv', () => {
    const originalLocation = window.location

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
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

    it('returns true when hostname is in staging URLs', () => {
      expect(isStagingEnv()).toBe(true)
    })

    it('returns false when hostname is not in staging URLs', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'production.example.com' },
        writable: true,
        configurable: true,
      })
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
