import { describe, expect, it } from 'vitest'

import { getChartData } from './helper'

import { CHART_COLORS } from '@/constants/colors'
import { CURRENCY } from '@/constants/units'
import { DONUT_CHART_SETTINGS } from '@/MultiSiteViews/Charts/constants'

// Fallback colors to ensure tests work in CI
const VIOLET_COLOR = '#867DF9'
const SKY_BLUE_COLOR = '#59E8E8'

describe('OperationsEnergyCostChart/helper.test.js', () => {
  describe('getChartData', () => {
    it('should return chart data with correct values and colors', () => {
      const operationsCost = 1000
      const energyCost = 500

      const expectedData = {
        unit: CURRENCY.USD,
        label: null,
        value: null,
        dataset: {
          Operations: {
            value: operationsCost,
            color: CHART_COLORS.VIOLET || VIOLET_COLOR,
          },
          Energy: {
            value: energyCost,
            color: CHART_COLORS.SKY_BLUE || SKY_BLUE_COLOR,
          },
        },
        ...DONUT_CHART_SETTINGS,
      }

      const result = getChartData({
        operationsCost,
        energyCost,
      })

      expect(result).toEqual(expectedData)
    })

    it('should handle zero costs', () => {
      const operationsCost = 0
      const energyCost = 0

      const expectedData = {
        unit: CURRENCY.USD,
        label: null,
        value: null,
        dataset: {},
        ...DONUT_CHART_SETTINGS,
      }

      const result = getChartData({
        operationsCost,
        energyCost,
      })

      expect(result).toEqual(expectedData)
    })
  })
})
