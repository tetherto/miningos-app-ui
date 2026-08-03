import { describe, expect, it } from 'vitest'

import { getChartData } from '../MinerTypesReport.utils'

describe('MinerTypesReport.utils', () => {
  describe('getChartData', () => {
    it('returns dataset, label and value for ALL filter', () => {
      const tailLogData = [{ type_cnt: { 'miner-wm-m56': 5, 'miner-am-s19xp': 3 } }]
      const result = getChartData({ filter: 'ALL', tailLogData })
      expect(result.label).toBe('Total Miners')
      expect(result.value).toBe(8)
      expect(result.dataset).toBeDefined()
      expect(Object.keys(result.dataset).length).toBe(2)
    })

    it('uses offline_type_cnt for OFFLINE filter', () => {
      const tailLogData = [{ offline_type_cnt: { 'miner-wm-m56': 2 } }]
      const result = getChartData({ filter: 'OFFLINE', tailLogData })
      expect(result.value).toBe(2)
    })

    it('uses maintenance_type_cnt for MAINTENANCE filter', () => {
      const tailLogData = [{ maintenance_type_cnt: { 'miner-am-s19xp': 1 } }]
      const result = getChartData({ filter: 'MAINTENANCE', tailLogData })
      expect(result.value).toBe(1)
    })

    it('handles tailLogData as array of arrays', () => {
      const tailLogData = [[{ type_cnt: { other: 4 } }]]
      const result = getChartData({ filter: 'ALL', tailLogData: tailLogData as never })
      expect(result.value).toBe(4)
    })

    it('returns total 0 when tailLogData empty', () => {
      const result = getChartData({ filter: 'ALL', tailLogData: [{}] })
      expect(result.value).toBe(0)
    })
  })
})
