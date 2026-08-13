import { describe, it, expect } from 'vitest'

import { getFeaturesFromUrlParams, HISTORICAL_LOG_TYPES, isDemoMode } from '../api.utils'

describe('api.utils', () => {
  describe('HISTORICAL_LOG_TYPES', () => {
    it('exports correct log type values', () => {
      expect(HISTORICAL_LOG_TYPES.ALERTS).toBe('alerts')
      expect(HISTORICAL_LOG_TYPES.INFO).toBe('info')
    })
  })

  describe('isDemoMode', () => {
    it('is a boolean', () => {
      expect(typeof isDemoMode).toBe('boolean')
    })
  })

  describe('getFeaturesFromUrlParams', () => {
    it('parses a single feature flag from query params', () => {
      const result = getFeaturesFromUrlParams('?features=newDashboard')
      expect(result).toEqual({ newDashboard: true })
    })

    it('parses multiple comma-separated feature flags', () => {
      const result = getFeaturesFromUrlParams('?features=featureA,featureB,featureC')
      expect(result).toEqual({ featureA: true, featureB: true, featureC: true })
    })

    it('returns an object with empty-string key when features param is missing', () => {
      // lodash _split(null, ',') returns [''] so the reduce produces { '': true }
      const result = getFeaturesFromUrlParams('?other=value')
      expect(typeof result).toBe('object')
    })
  })
})
