import { describe, expect, it } from 'vitest'

import {
  ENERGY_REPORT_MINER_VIEW_SLICES,
  sliceConfig,
  transformToBarData,
} from '../EnergyReportMinerView.utils'

import type { MetricsConsumptionGroupedResponse } from '@/types/api'

describe('EnergyReportMinerView.utils', () => {
  describe('ENERGY_REPORT_MINER_VIEW_SLICES', () => {
    it('exports MINER_TYPE and MINER_UNIT', () => {
      expect(ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE).toBe('MINER_TYPE')
      expect(ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT).toBe('MINER_UNIT')
    })
  })

  describe('sliceConfig', () => {
    it('MINER_TYPE slice groups by miner type', () => {
      const config = sliceConfig[ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE]
      expect(config.groupBy).toBe('miner')
      expect(config.title).toBe('Power Consumption')
      expect(config.getLabelName('miner-wm-m56')).toBeDefined()
    })

    it('MINER_UNIT slice groups by container', () => {
      const config = sliceConfig[ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT]
      expect(config.groupBy).toBe('container')
      expect(config.title).toBe('Power Consumption')
    })

    it('MINER_UNIT filterCategory drops leaked rollup keys', () => {
      const { filterCategory } = sliceConfig[ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT]
      expect(filterCategory).toBeDefined()
      expect(filterCategory!('maintenance')).toBe(false)
      expect(filterCategory!('group-1')).toBe(false)
      expect(filterCategory!('group-12')).toBe(false)
      expect(filterCategory!('bitdeer-1')).toBe(true)
    })

    it('MINER_UNIT getLabelName returns category when container has no type', () => {
      const config = sliceConfig[ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT]
      expect(config.getLabelName('unknown-container', [])).toBe('unknown-container')
      expect(config.getLabelName('cat', [{ info: { container: 'other' } }])).toBe('cat')
    })

    it('MINER_UNIT getLabelName returns container name when container has type', () => {
      const config = sliceConfig[ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT]
      const containers = [{ info: { container: 'bitdeer-1' }, type: 'container-bd-d40-m56' }]
      const label = config.getLabelName('bitdeer-1', containers)
      expect(label).toBeDefined()
      expect(typeof label).toBe('string')
    })
  })

  describe('transformToBarData', () => {
    const mockResponse = (
      log: MetricsConsumptionGroupedResponse['log'],
    ): MetricsConsumptionGroupedResponse => ({
      log,
      summary: { avgPowerW: null, totalConsumptionMWh: 0 },
    })

    it('returns empty chart data when response is undefined', () => {
      const chart = transformToBarData(undefined, ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE, [])
      expect(chart.labels).toEqual([])
      expect(chart.dataSet1.data).toEqual([])
    })

    it('returns empty chart data when log is empty', () => {
      const chart = transformToBarData(
        mockResponse([]),
        ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE,
        [],
      )
      expect(chart.labels).toEqual([])
      expect(chart.dataSet1.data).toEqual([])
    })

    it('uses the latest log entry for the bar values', () => {
      const response = mockResponse([
        { ts: 1, powerW: { 'miner-wm-m56': 100 }, consumptionMWh: { 'miner-wm-m56': 0.0024 } },
        { ts: 2, powerW: { 'miner-wm-m56': 250 }, consumptionMWh: { 'miner-wm-m56': 0.006 } },
      ])
      const chart = transformToBarData(response, ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE, [])
      expect(chart.dataSet1.data).toEqual([250])
      expect(chart.labels).toHaveLength(1)
    })

    it('drops leaked rollup keys for MINER_UNIT', () => {
      const response = mockResponse([
        {
          ts: 1,
          powerW: { 'bitdeer-1': 100, 'group-1': 50, maintenance: 25 },
          consumptionMWh: null,
        },
      ])
      const chart = transformToBarData(response, ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT, [])
      expect(chart.dataSet1.data).toEqual([100])
      expect(chart.labels).toEqual(['bitdeer-1'])
    })

    it('keeps all keys for MINER_TYPE (no filter)', () => {
      const response = mockResponse([
        { ts: 1, powerW: { 'miner-a': 100, 'miner-b': 200 }, consumptionMWh: null },
      ])
      const chart = transformToBarData(response, ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE, [])
      expect(chart.dataSet1.data).toEqual([100, 200])
    })
  })
})
