import { describe, expect, it } from 'vitest'

import { getChartOptions } from '../TimelineChart.helper'

describe('TimelineChart.helper', () => {
  describe('getChartOptions', () => {
    it('returns options with range and axis titles', () => {
      const range = { min: 0, max: 100 }
      const axisTitleText = { x: 'Time', y: 'Value' }
      const options = getChartOptions(range, axisTitleText)
      expect(options.indexAxis).toBe('y')
      expect(options.responsive).toBe(true)
      expect(options.plugins?.zoom?.limits?.x).toEqual(range)
      expect(options.scales?.x?.min).toBe(0)
      expect(options.scales?.x?.max).toBe(100)
      expect(options.scales?.x?.title?.text).toBe('Time')
      expect(options.scales?.y?.title?.text).toBe('Value')
    })
  })
})
