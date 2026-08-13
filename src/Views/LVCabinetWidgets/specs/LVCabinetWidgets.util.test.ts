import { describe, expect, it } from 'vitest'

import { getErrorMessage } from '../LVCabinetWidgets.util'

describe('LVCabinetWidgets.util', () => {
  describe('getErrorMessage', () => {
    it('extracts message from err.data.message', () => {
      expect(getErrorMessage({ data: { message: 'Server error' } })).toBe('Server error')
    })

    it('extracts message from err.error', () => {
      expect(getErrorMessage({ error: 'Network error' })).toBe('Network error')
    })

    it('extracts message from err.message', () => {
      expect(getErrorMessage({ message: 'Generic error' })).toBe('Generic error')
    })

    it('returns fallback when no message found in non-empty err', () => {
      expect(getErrorMessage({ code: 500 })).toBe('Failed to load cabinets.')
    })

    it('uses custom fallback when provided and err has no message', () => {
      expect(getErrorMessage({ status: 404 }, 'Custom fallback')).toBe('Custom fallback')
    })

    it('returns null when err is empty object', () => {
      expect(getErrorMessage({})).toBeNull()
    })

    it('returns empty string when fallback is empty and no message', () => {
      expect(getErrorMessage({ code: 1 }, '')).toBe('')
    })
  })
})
