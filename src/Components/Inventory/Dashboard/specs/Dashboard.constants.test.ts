import { describe, it, expect } from 'vitest'

import {
  minersDistributionColumns,
  minersFaultColumns,
  dryCoolerColumns,
  inventoryData,
  tableTwoData,
  SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER,
  ALL_MINERS,
  MINERS_MULTI_TAIL_LOG_QUERY_ORDER,
  MINER_STATUS_PIE_CHART_COLORS,
  MINER_LOCATION_PIE_CHART_COLORS,
  SPARE_PART_STATUS_PIE_CHART_COLORS,
} from '../Dashboard.constants'

describe('Dashboard.constants', () => {
  it('exports minersDistributionColumns array with expected columns', () => {
    expect(Array.isArray(minersDistributionColumns)).toBe(true)
    expect(minersDistributionColumns.length).toBeGreaterThan(0)
    const minerCol = minersDistributionColumns.find((c) => c.key === 'miner')
    expect(minerCol).toBeDefined()
  })

  it('minersDistributionColumns render functions work', () => {
    const numericCols = minersDistributionColumns.filter((c) => 'render' in c && c.render)
    expect(numericCols.length).toBeGreaterThan(0)
    for (const col of numericCols) {
      const render = col.render as ((v: number) => string) | undefined
      if (render) {
        expect(render(0)).toBeDefined()
        expect(render(100)).toBeDefined()
      }
    }
  })

  it('minersDistributionColumns sorter functions work', () => {
    const sortableCols = minersDistributionColumns.filter((c) => 'sorter' in c && c.sorter)
    for (const col of sortableCols) {
      const sorter = (col as { sorter?: (a: unknown, b: unknown) => number }).sorter
      if (sorter) {
        const result = sorter(
          { totalPositions: 10, freePositions: 5 },
          { totalPositions: 20, freePositions: 3 },
        )
        expect(typeof result).toBe('number')
      }
    }
  })

  it('exports minersFaultColumns with render functions', () => {
    expect(Array.isArray(minersFaultColumns)).toBe(true)
    const renderCols = minersFaultColumns.filter((c) => 'render' in c)
    for (const col of renderCols) {
      const render = col.render as ((v: number | undefined) => string) | undefined
      if (render) {
        expect(render(42)).toBeDefined()
        expect(render(undefined)).toBeDefined()
      }
    }
  })

  it('exports dryCoolerColumns', () => {
    expect(Array.isArray(dryCoolerColumns)).toBe(true)
    expect(dryCoolerColumns.some((c) => c.key === 'site')).toBe(true)
  })

  it('exports tableTwoData and inventoryData arrays', () => {
    expect(Array.isArray(tableTwoData)).toBe(true)
    expect(Array.isArray(inventoryData)).toBe(true)
  })

  it('exports SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER', () => {
    expect(typeof SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER).toBe('object')
    expect(Object.keys(SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER).length).toBeGreaterThan(0)
  })

  it('exports ALL_MINERS constant', () => {
    expect(ALL_MINERS).toBe('miner')
  })

  it('exports MINERS_MULTI_TAIL_LOG_QUERY_ORDER', () => {
    expect(typeof MINERS_MULTI_TAIL_LOG_QUERY_ORDER).toBe('object')
    expect(MINERS_MULTI_TAIL_LOG_QUERY_ORDER[ALL_MINERS]).toBe(0)
  })

  it('exports pie chart color objects', () => {
    expect(typeof MINER_STATUS_PIE_CHART_COLORS).toBe('object')
    expect(typeof MINER_LOCATION_PIE_CHART_COLORS).toBe('object')
    expect(typeof SPARE_PART_STATUS_PIE_CHART_COLORS).toBe('object')
  })
})
