import _keys from 'lodash/keys'
import { describe, it, expect } from 'vitest'

import { getDataset } from './helper'

describe('AverageFeeChart helpers', () => {
  describe('getDataset', () => {
    it('should return dataset with correct structure', () => {
      const data = [
        { ts: 1752710400000, avgFeesSatsVByte: 100 },
        { ts: 1752796800000, avgFeesSatsVByte: 200 },
        { ts: 1752883200000, avgFeesSatsVByte: null }, // Should be ignored
      ]

      const result = getDataset(data)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('label', 'Average Fees in Sats/vByte')
      expect(_keys(result[0])).toContain('2025-07-17')
      expect(_keys(result[0])).toContain('2025-07-18')

      expect(result[0]['2025-07-17']).toEqual({
        value: 100,
        style: expect.any(Object),
        legendColor: expect.any(Array),
      })
      expect(result[0]['2025-07-18']).toEqual({
        value: 200,
        style: expect.any(Object),
        legendColor: expect.any(Array),
      })
    })

    it('should ignore entries without timestamp or avgFeesSatsVByte', () => {
      const data = [
        { ts: null, avgFeesSatsVByte: 100 },
        { ts: 1752796800000, avgFeesSatsVByte: null },
      ]

      const result = getDataset(data)

      expect(result).toHaveLength(1)
      expect(_keys(result[0])).not.toContain('Jul 18, 2025')
    })
  })
})
