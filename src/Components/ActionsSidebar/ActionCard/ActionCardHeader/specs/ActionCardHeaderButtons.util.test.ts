import { describe, expect, it } from 'vitest'

import { regroupActions } from '../ActionCardHeaderButtons.util'

describe('ActionCardHeaderButtons.util', () => {
  describe('regroupActions', () => {
    it('returns empty array when pendingSubmissions is empty', () => {
      const result = regroupActions({ myActions: [], pendingSubmissions: [] })
      expect(result).toEqual([])
    })

    it('returns array when pendingSubmissions provided', () => {
      const pending = [{ action: 'setup_pools', tags: ['t1'] }] as never[]
      const result = regroupActions({ myActions: [], pendingSubmissions: pending })
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
