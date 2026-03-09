import { describe, expect, it } from 'vitest'

import { getDoughnutChartOptions } from '../DoughnutChart.utils'

describe('DoughnutChart.utils', () => {
  describe('getDoughnutChartOptions', () => {
    it('returns chart options object', () => {
      const options = getDoughnutChartOptions([1, 2, 3])
      expect(options).toHaveProperty('maintainAspectRatio', false)
      expect(options).toHaveProperty('plugins')
      expect(options.plugins?.tooltip).toBeDefined()
      expect(options.plugins?.legend?.display).toBe(false)
    })

    it('accepts tooltipValueFormatter', () => {
      const formatter = (v: number) => `${v}%`
      const options = getDoughnutChartOptions([1, 2], formatter)
      expect(options.plugins?.tooltip?.callbacks?.label).toBeDefined()
    })
  })
})
