import { describe, expect, it } from 'vitest'

import { buildTransactionsParams } from '../useMinerpoolTransactions'

describe('useMinerpoolTransactions', () => {
  describe('buildTransactionsParams', () => {
    it('should build correct transaction params', () => {
      const start = 1735686000000 // Jan 1, 2025
      const end = 1735772400000 // Jan 2, 2025
      const result = buildTransactionsParams({ start, end })

      expect(result).toEqual({
        type: 'minerpool',
        query: JSON.stringify({ start, end, key: 'transactions' }),
      })
    })
  })
})
