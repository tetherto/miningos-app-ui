import { render } from '@testing-library/react'
import React from 'react'
import { describe, it, expect } from 'vitest'

import {
  sumObjectValues,
  transformMinersStatusData,
  createHashrateFormatter,
  getHashrateDisplayUnit,
  formatPowerConsumption,
  formatEfficiency,
} from './utils'
import * as styles from './styles'

describe('OperationsDashboard.utils', () => {
  describe('sumObjectValues', () => {
    it('should sum all numeric values in an object', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(sumObjectValues(obj)).toBe(6)
    })

    it('should handle empty object', () => {
      expect(sumObjectValues({})).toBe(0)
    })

    it('should handle null/undefined', () => {
      expect(sumObjectValues(null)).toBe(0)
      expect(sumObjectValues(undefined)).toBe(0)
    })

    it('should ignore non-numeric values', () => {
      const obj = { a: 1, b: null as unknown as number, c: 3, d: undefined as unknown as number }
      expect(sumObjectValues(obj)).toBe(4)
    })
  })

  describe('transformMinersStatusData', () => {
    it('should transform aggregated data to chart format', () => {
      const aggregatedData = [
        {
          ts: 1704067200000, // 2024-01-01
          online: 100,
          error: 0,
          notMining: 7,
          offline: 3,
          sleep: 0,
          maintenance: 10,
        },
        {
          ts: 1704153600000, // 2024-01-02
          online: 105,
          error: 0,
          notMining: 4,
          offline: 2,
          sleep: 0,
          maintenance: 9,
        },
      ]

      const result = transformMinersStatusData(aggregatedData)

      expect(result.dataset).toHaveLength(5)
      expect(result.dataset[0].label).toBe('Online')
      expect(result.dataset[1].label).toBe('Error')
      expect(result.dataset[2].label).toBe('Offline')
      expect(result.dataset[3].label).toBe('Sleep')
      expect(result.dataset[4].label).toBe('Maintenance')

      // Check that each dataset has the correct stackGroup
      expect(result.dataset[0].stackGroup).toBe('miners')
      expect(result.dataset[1].stackGroup).toBe('miners')

      // Check that data is structured correctly with date labels as keys
      expect(result.dataset[0]['01-01']).toBeDefined()
      expect((result.dataset[0]['01-01'] as { value: number }).value).toBe(100)
      expect((result.dataset[1]['01-01'] as { value: number }).value).toBe(0)
      expect((result.dataset[2]['01-01'] as { value: number }).value).toBe(3)
      expect((result.dataset[3]['01-01'] as { value: number }).value).toBe(0)
      expect((result.dataset[4]['01-01'] as { value: number }).value).toBe(10)

      // Check second day
      expect((result.dataset[0]['01-02'] as { value: number }).value).toBe(105)
      expect((result.dataset[1]['01-02'] as { value: number }).value).toBe(0)
      expect((result.dataset[2]['01-02'] as { value: number }).value).toBe(2)
    })

    it('should handle timestamp range strings (e.g., "1704067200000-1704153599999")', () => {
      const aggregatedData = [
        {
          ts: '1704067200000-1704153599999', // Range string for 2024-01-01
          online: 100,
          error: 0,
          notMining: 7,
          offline: 3,
          sleep: 0,
          maintenance: 10,
        },
        {
          ts: '1704153600000-1704239999999', // Range string for 2024-01-02
          online: 105,
          error: 0,
          notMining: 4,
          offline: 2,
          sleep: 0,
          maintenance: 9,
        },
      ]

      const result = transformMinersStatusData(aggregatedData)

      expect(result.dataset).toHaveLength(5)
      expect(result.dataset[0].label).toBe('Online')

      // Check that date labels are correctly extracted from range strings
      expect(result.dataset[0]['01-01']).toBeDefined()
      expect((result.dataset[0]['01-01'] as { value: number }).value).toBe(100)
      expect(result.dataset[0]['01-02']).toBeDefined()
      expect((result.dataset[0]['01-02'] as { value: number }).value).toBe(105)
    })

    it('should handle mixed numeric and string timestamps', () => {
      const aggregatedData = [
        {
          ts: 1704067200000, // Numeric timestamp for 2024-01-01
          online: 100,
          error: 0,
          notMining: 7,
          offline: 3,
          sleep: 0,
          maintenance: 10,
        },
        {
          ts: '1704153600000-1704239999999', // Range string for 2024-01-02
          online: 105,
          error: 0,
          notMining: 4,
          offline: 2,
          sleep: 0,
          maintenance: 9,
        },
      ]

      const result = transformMinersStatusData(aggregatedData)

      expect(result.dataset).toHaveLength(5)
      expect(result.dataset[0]['01-01']).toBeDefined()
      expect(result.dataset[0]['01-02']).toBeDefined()
    })

    it('should filter out entries with invalid timestamps', () => {
      const aggregatedData = [
        {
          ts: 1704067200000, // Valid timestamp
          online: 100,
          notMining: 7,
          offline: 3,
          maintenance: 10,
        },
        {
          ts: 'invalid-timestamp',
          online: 50,
          notMining: 2,
          offline: 1,
          maintenance: 5,
        },
        {
          ts: NaN,
          online: 25,
          notMining: 1,
          offline: 0,
          maintenance: 2,
        },
      ]

      const result = transformMinersStatusData(
        aggregatedData as unknown as Parameters<typeof transformMinersStatusData>[0],
      )

      expect(result.dataset).toHaveLength(5)
      // Only the valid entry should be included
      expect(result.dataset[0]['01-01']).toBeDefined()
      expect((result.dataset[0]['01-01'] as { value: number }).value).toBe(100)
      // Invalid entries should not create keys
      expect(Object.keys(result.dataset[0]).filter((k) => k.match(/^\d{2}-\d{2}$/))).toHaveLength(1)
    })

    it('should return empty dataset when all timestamps are invalid', () => {
      const aggregatedData = [
        {
          ts: 'invalid',
          online: 100,
          notMining: 7,
          offline: 3,
          maintenance: 10,
        },
      ]

      const result = transformMinersStatusData(
        aggregatedData as unknown as Parameters<typeof transformMinersStatusData>[0],
      )

      expect(result.dataset).toEqual([])
    })

    it('should handle empty array', () => {
      const result = transformMinersStatusData([])
      expect(result.dataset).toEqual([])
    })

    it('should handle null and undefined input', () => {
      expect(transformMinersStatusData(null)).toEqual({ dataset: [] })
      expect(transformMinersStatusData(undefined)).toEqual({ dataset: [] })
    })
  })

  describe('getHashrateDisplayUnit', () => {
    it('should return appropriate unit based on magnitude', () => {
      expect(getHashrateDisplayUnit(100)).toBe('MH/s') // 100 MH/s
      expect(getHashrateDisplayUnit(1000)).toBe('GH/s') // 1 GH/s
      expect(getHashrateDisplayUnit(1000000)).toBe('TH/s') // 1 TH/s
      expect(getHashrateDisplayUnit(78275000)).toBe('TH/s') // 78.28 TH/s
      expect(getHashrateDisplayUnit(1000000000)).toBe('PH/s') // 1 PH/s
    })

    it('should handle zero', () => {
      expect(getHashrateDisplayUnit(0)).toBe('')
    })

    it('should handle null/undefined', () => {
      expect(getHashrateDisplayUnit(null)).toBe('')
      expect(getHashrateDisplayUnit(undefined)).toBe('')
    })
  })

  describe('createHashrateFormatter', () => {
    it('should create formatter that converts to specified unit', () => {
      const thsFormatter = createHashrateFormatter('TH/s')
      expect(thsFormatter(1000000)).toBe('1.00') // 1 TH/s
      expect(thsFormatter(78275000)).toBe('78.28') // 78.28 TH/s

      const phsFormatter = createHashrateFormatter('PH/s')
      expect(phsFormatter(1000000000)).toBe('1.00') // 1 PH/s
      expect(phsFormatter(59319000000)).toBe('59.32') // 59.32 PH/s
    })

    it('should handle zero', () => {
      const formatter = createHashrateFormatter('TH/s')
      expect(formatter(0)).toBe('0')
    })

    it('should handle null/undefined', () => {
      const formatter = createHashrateFormatter('TH/s')
      expect(formatter(null)).toBe('0')
      expect(formatter(undefined)).toBe('0')
    })
  })

  describe('formatPowerConsumption', () => {
    it('should format power from watts to MW (numeric value only)', () => {
      expect(formatPowerConsumption(1000000)).toBe('1.00')
      expect(formatPowerConsumption(22489000)).toBe('22.49')
    })

    it('should handle zero', () => {
      expect(formatPowerConsumption(0)).toBe('0')
    })

    it('should handle null/undefined', () => {
      expect(formatPowerConsumption(null)).toBe('0')
      expect(formatPowerConsumption(undefined)).toBe('0')
    })
  })

  describe('formatEfficiency', () => {
    it('should format efficiency with 2 decimal places (numeric value only)', () => {
      expect(formatEfficiency(34.52)).toBe('34.52')
      expect(formatEfficiency(32.0)).toBe('32.00')
    })

    it('should handle zero', () => {
      expect(formatEfficiency(0)).toBe('0')
    })

    it('should handle null/undefined', () => {
      expect(formatEfficiency(null)).toBe('0')
      expect(formatEfficiency(undefined)).toBe('0')
    })
  })
})

describe('OperationsDashboard.styles', () => {
  it('renders all exported styled components', () => {
    const {
      DashboardWrapper,
      DatePickerContainer,
      ChartsGrid,
      ChartCardWrapper,
      ChartHeader,
      ChartTitle,
      ChartActions,
      ExpandIcon,
      CompressIcon,
      InfoIcon,
      ChartContent,
      LoadingContainer,
      ErrorContainer,
      NoDataContainer,
    } = styles

    const { unmount: u1 } = render(React.createElement(DashboardWrapper, null))
    u1()
    const { unmount: u2 } = render(React.createElement(DatePickerContainer, null))
    u2()
    const { unmount: u3 } = render(React.createElement(ChartsGrid, null))
    u3()
    const { unmount: u4 } = render(React.createElement(ChartCardWrapper, { $isExpanded: false }, null))
    u4()
    const { unmount: u5 } = render(React.createElement(ChartCardWrapper, { $isExpanded: true }, null))
    u5()
    const { unmount: u6 } = render(React.createElement(ChartHeader, { $hasHeaderMarginBottom: false, $hasHeaderPaddingLeft: false }, null))
    u6()
    const { unmount: u7 } = render(React.createElement(ChartTitle, null))
    u7()
    const { unmount: u8 } = render(React.createElement(ChartActions, null))
    u8()
    const { unmount: u9 } = render(React.createElement(ExpandIcon, null))
    u9()
    const { unmount: u10 } = render(React.createElement(CompressIcon, null))
    u10()
    const { unmount: u11 } = render(React.createElement(InfoIcon, null))
    u11()
    const { unmount: u12 } = render(React.createElement(ChartContent, null))
    u12()
    const { unmount: u13 } = render(React.createElement(ChartContent, { $contentCentered: true }, null))
    u13()
    const { unmount: u14 } = render(React.createElement(LoadingContainer, null))
    u14()
    const { unmount: u15 } = render(React.createElement(ErrorContainer, null))
    u15()
    const { unmount: u16 } = render(React.createElement(NoDataContainer, null))
    u16()

    expect(Object.keys(styles).length).toBeGreaterThan(0)
  })
})
