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

    it('label callback uses tooltipValueFormatter when provided', () => {
      const formatter = (v: number) => `$${v}`
      const options = getDoughnutChartOptions([10, 20], formatter)
      const labelFn = options.plugins?.tooltip?.callbacks?.label
      const mockTooltipItem = {
        label: 'Segment A',
        parsed: 10,
        dataset: { unit: 'MW' },
      }
      const result = (labelFn as unknown as (item: unknown) => unknown)(mockTooltipItem)
      expect(Array.isArray(result)).toBe(true)
      expect((result as string[])[1]).toContain('$10')
    })

    it('label callback uses default unit format without tooltipValueFormatter', () => {
      const options = getDoughnutChartOptions([10, 20])
      const labelFn = options.plugins?.tooltip?.callbacks?.label
      const mockTooltipItem = {
        label: 'Segment B',
        parsed: 10,
        dataset: { unit: 'kW' },
      }
      const result = (labelFn as unknown as (item: unknown) => unknown)(mockTooltipItem)
      expect(Array.isArray(result)).toBe(true)
      expect((result as string[])[1]).toContain('kW')
    })

    it('label callback handles missing label and unit gracefully', () => {
      const options = getDoughnutChartOptions([5])
      const labelFn = options.plugins?.tooltip?.callbacks?.label
      const mockTooltipItem = { label: '', parsed: 5, dataset: {} }
      const result = (labelFn as unknown as (item: unknown) => unknown)(mockTooltipItem)
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
