import { describe, expect, it } from 'vitest'

import { getMetrics } from '@/hooks/useCostData'

describe('useCostData', () => {
  describe('getMetrics', () => {
    it('should return metrics with correct values', () => {
      const metrics = getMetrics({
        allInCost: 100,
        energyCost: 50,
        operationsCost: 30,
      })

      expect(metrics).toEqual({
        totalBtc: {
          label: 'All-in Cost',
          unit: '$/MWh',
          value: 100,
          isHighlighted: true,
        },
        energyCostBtc: {
          label: 'Energy Cost',
          unit: '$/MWh',
          value: 50,
        },
        operationsCostBtc: {
          label: 'Operations Cost',
          unit: '$/MWh',
          value: 30,
        },
      })
    })

    it('should handle zero values correctly', () => {
      const metrics = getMetrics({
        allInCost: 0,
        energyCost: 0,
        operationsCost: 0,
      })

      expect(metrics).toEqual({
        totalBtc: {
          label: 'All-in Cost',
          unit: '$/MWh',
          value: 0,
          isHighlighted: true,
        },
        energyCostBtc: {
          label: 'Energy Cost',
          unit: '$/MWh',
          value: 0,
        },
        operationsCostBtc: {
          label: 'Operations Cost',
          unit: '$/MWh',
          value: 0,
        },
      })
    })
  })
})
