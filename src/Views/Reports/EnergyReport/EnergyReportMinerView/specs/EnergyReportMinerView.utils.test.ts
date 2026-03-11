import { describe, expect, it } from 'vitest'

import { ENERGY_REPORT_MINER_VIEW_SLICES, sliceConfig } from '../EnergyReportMinerView.utils'

describe('EnergyReportMinerView.utils', () => {
  describe('ENERGY_REPORT_MINER_VIEW_SLICES', () => {
    it('exports MINER_TYPE and MINER_UNIT', () => {
      expect(ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE).toBe('MINER_TYPE')
      expect(ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT).toBe('MINER_UNIT')
    })
  })

  describe('sliceConfig', () => {
    it('MINER_TYPE slice has key and getLabelName', () => {
      const config = sliceConfig[ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE]
      expect(config.key).toBe('power_w_type_group_sum_aggr')
      expect(config.title).toBe('Power Consumption')
      expect(config.getLabelName('miner-wm-m56')).toBeDefined()
    })

    it('MINER_UNIT slice filterCategory excludes maintenance', () => {
      const config = sliceConfig[ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT]
      expect(config.filterCategory).toBeDefined()
      expect(config.filterCategory!('maintenance')).toBe(false)
      expect(config.filterCategory!('bitdeer-1')).toBe(true)
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
})
