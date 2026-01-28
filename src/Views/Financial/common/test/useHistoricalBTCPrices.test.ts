import { describe, expect, it } from 'vitest'

import { buildHistoricalPricesParams } from '../useHistoricalBTCPrices'

describe('useHistoricalBTCPrices', () => {
  describe('buildHistoricalPricesParams', () => {
    it('should build correct historical prices params', () => {
      const start = 1735686000000
      const end = 1735772400000
      const result = buildHistoricalPricesParams({ start, end })

      expect(result).toEqual({
        type: 'mempool',
        query: JSON.stringify({ key: 'HISTORICAL_PRICES', start, end }),
      })
    })
  })
})
