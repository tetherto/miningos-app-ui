import {
  getContainerMinersChartData,
  isCirculatingPumpActive,
  getMinersSummaryBoxData,
  getWidgetAlarmState,
} from '../ContainerWidget.util'

describe('ContainerWidget.util', () => {
  describe('getContainerMinersChartData', () => {
    it('returns disconnected/total when minerTailLogItem is empty', () => {
      const result = getContainerMinersChartData('container-bd-d40-m56', {} as never, 10)
      expect(result).toEqual({
        disconnected: 10,
        total: 10,
        actualMiners: 0,
      })
    })
    it('aggregates power mode counts from minerTailLogItem', () => {
      const minerTailLogItem = {
        power_mode_normal_cnt: { 'container-bd-d40-m56': 5 },
        power_mode_low_cnt: { 'container-bd-d40-m56': 2 },
        power_mode_high_cnt: { 'container-bd-d40-m56': 1 },
      }
      const result = getContainerMinersChartData('container-bd-d40-m56', minerTailLogItem as never, 10)
      expect(result.total).toBe(10)
      expect(result.actualMiners).toBe(8)
      expect(result.disconnected).toBe(2)
    })
  })

  describe('isCirculatingPumpActive', () => {
    it('returns false when container_specific has no circulating_pump', () => {
      expect(isCirculatingPumpActive({} as never)).toBe(false)
      expect(
        isCirculatingPumpActive({
          last: { snap: { stats: { container_specific: {} } } },
        } as never),
      ).toBe(false)
    })
    it('returns true when circulating_pump is truthy', () => {
      expect(
        isCirculatingPumpActive({
          last: { snap: { stats: { container_specific: { circulating_pump: true } } } },
        } as never),
      ).toBe(true)
    })
  })

  describe('getMinersSummaryBoxData', () => {
    it('returns hashrate maxtemp avgtemp from minerTailLogItem', () => {
      const minerTailLogItem = {
        hashrate_mhs_1m_group_sum_aggr: { 'bitdeer-1': 1_000_000 },
        temperature_c_group_max_aggr: { 'bitdeer-1': 65 },
        temperature_c_group_avg_aggr: { 'bitdeer-1': 55 },
      }
      const result = getMinersSummaryBoxData('bitdeer-1', minerTailLogItem as never)
      expect(result.hashrate).toBe(1)
      expect(result.maxtemp).toBeDefined()
      expect(result.avgtemp).toBeDefined()
    })
    it('returns dash when values missing', () => {
      const result = getMinersSummaryBoxData('unknown', {} as never)
      expect(result.hashrate).toBe('-')
      expect(result.maxtemp).toBe('-')
      expect(result.avgtemp).toBe('-')
    })
  })

  describe('getWidgetAlarmState', () => {
    it('returns no flash/critical when type missing', () => {
      const result = getWidgetAlarmState({} as never, null)
      expect(result).toEqual({ shouldFlash: false, isCriticallyHigh: false })
    })
    it('returns alarm state for bitdeer container', () => {
      const container = { type: 'container-bd-d40-m56' }
      const result = getWidgetAlarmState(container as never, null)
      expect(result).toHaveProperty('shouldFlash')
      expect(result).toHaveProperty('isCriticallyHigh')
    })
  })
})
