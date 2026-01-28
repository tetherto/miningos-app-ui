import { describe, expect, it, vi } from 'vitest'

import {
  getMainDatasetStyles,
  getOptions,
  getRawDatasets,
  isDatasetListFilled,
} from './BarSteppedLineChart.helpers'

vi.mock('@/app/utils/chartUtils', () => ({
  getBarChartDatasetBackgroundColor: vi.fn(() => ''),
  getBarChartItemLinearGradientRenderer: vi.fn(() => 'gradient-fallback'),
  getBarChartItemStyle: vi.fn((color: string) => ({
    backgroundColor: color,
    borderColor: color,
    borderWidth: 2,
  })),
}))

vi.mock('@/app/utils/format', () => ({
  getPercentFormattedNumber: vi.fn((v: number) => `${(v * 100).toFixed(2)}%`),
}))

describe('BarSteppedLineChart.helpers', () => {
  describe('isDatasetListFilled', () => {
    it('returns true when all datasets have data', () => {
      expect(isDatasetListFilled({ data: [1, 2] }, { data: [3, 4] })).toBe(true)
    })

    it('returns false when any dataset has empty data', () => {
      expect(isDatasetListFilled({ data: [] }, { data: [1] })).toBe(false)
    })

    it('returns false when data is undefined', () => {
      expect(isDatasetListFilled({ data: [1] }, { data: undefined })).toBe(false)
    })
  })

  describe('getMainDatasetStyles', () => {
    it('returns RED when value > limit', () => {
      const result = getMainDatasetStyles({ data: [10] }, { data: [5] })

      expect(result[0].backgroundColor).toBe('RED')
    })

    it('returns GREEN when value === limit', () => {
      const result = getMainDatasetStyles({ data: [5] }, { data: [5] })

      expect(result[0].backgroundColor).toBe('GREEN')
    })

    it('returns BLUE when value < limit', () => {
      const result = getMainDatasetStyles({ data: [3] }, { data: [5] })

      expect(result[0].backgroundColor).toBe('BLUE')
    })
  })

  describe('getRawDatasets', () => {
    it('returns single bar dataset when only dataset1 is provided', () => {
      const result = getRawDatasets({
        isBarDynamicallyColored: false,
        dataset1st: {
          label: 'Revenue',
          data: [10, 20],
        },
        dataSet2: undefined,
        dataSet3: undefined,
      })

      expect(result).toHaveLength(1)
      expect(result[0].label).toBe('Revenue')
      expect(result[0].barPercentage).toBeDefined()
    })

    it('adds second bar dataset when dataSet2 exists', () => {
      const result = getRawDatasets({
        isBarDynamicallyColored: false,
        dataset1st: { label: 'A', data: [1] },
        dataSet2: { label: 'B', data: [2] },
        dataSet3: undefined,
      })

      expect(result).toHaveLength(2)
      expect(result[1].label).toBe('B')
    })

    it('adds line dataset when dataSet3 exists', () => {
      const result = getRawDatasets({
        isBarDynamicallyColored: false,
        dataset1st: { label: 'A', data: [1] },
        dataSet2: undefined,
        dataSet3: { label: 'Limit', data: [2], type: 'line' },
      })

      expect(result).toHaveLength(2)
      expect(result[1].type).toBe('line')
    })

    it('uses dynamic background when isBarDynamicallyColored is true', () => {
      const bgFn = vi.fn()

      const result = getRawDatasets({
        isBarDynamicallyColored: true,
        dataset1st: {
          label: 'Dynamic',
          data: [5],
          backgroundColor: bgFn,
        },
        dataSet2: undefined,
        dataSet3: undefined,
      })

      expect(result[0].backgroundColor).toBe(bgFn)
    })
  })

  describe('getOptions', () => {
    it('returns datalabels disabled when showDataLabels is false', () => {
      const options = getOptions({
        isLegendVisible: true,
        showDataLabels: false,
        yTicksFormatter: (v) => v.toString(),
      })

      expect(options.plugins.datalabels.display).toBe(false)
    })

    it('formats datalabel values correctly', () => {
      const options = getOptions({
        isLegendVisible: true,
        showDataLabels: true,
        yTicksFormatter: (v) => `${v} USD`,
      })

      const formatter = options.plugins.datalabels.formatter!

      expect(formatter(10)).toBe('10 USD')
      expect(formatter(0)).toBe('')
      expect(formatter('x')).toBe('')
    })
  })
})
