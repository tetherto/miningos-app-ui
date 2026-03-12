import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  Container,
  ContainerSettings,
  getContainerMinersChartData,
  getMinersSummaryBoxData,
  getSupplyLiquidBoxItems,
  getWidgetAlarmState,
  MinerTailLogItem,
} from '../ContainerWidget.util'

import * as deviceUtils from '@/app/utils/deviceUtils'
import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import * as BitdeerUtils from '@/Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings.utils'
import * as HydroUtils from '@/Components/Explorer/Containers/BitMainHydro/HydroSettings.utils'
import * as ImmersionUtils from '@/Components/Explorer/Containers/BitMainImmersion/ImmersionSettings.utils'
import * as MicroBTUtils from '@/Components/Explorer/Containers/MicroBT/MicroBTSettings/MicorBTSettingsUtils'

vi.mock('@/Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings.utils')
vi.mock('@/Components/Explorer/Containers/BitMainHydro/HydroSettings.utils')
vi.mock('@/Components/Explorer/Containers/BitMainImmersion/ImmersionSettings.utils')
vi.mock('@/Components/Explorer/Containers/MicroBT/MicroBTSettings/MicorBTSettingsUtils')
vi.mock('@/Components/Container/ContentBox/helper', () => ({
  getContainerState: vi.fn(() => ({ isCoolingOn: true })),
}))
vi.mock('@/app/utils/deviceUtils', () => ({
  getContainerSpecificStats: vi.fn(() => ({})),
  getStats: vi.fn(() => ({ status: CONTAINER_STATUS.RUNNING })),
  megaToTera: vi.fn((v: number) => v / 1_000_000),
}))

describe('getWidgetAlarmState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to default running status
    vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.RUNNING })
    vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({})
  })

  describe('when container is stopped', () => {
    it('should not flash regardless of values', () => {
      const container: Container = {
        id: 'container-123',
        type: 'container-bd-d40',
        info: { container: 'container-bd-d40' },
      }
      vi.mocked(deviceUtils.getStats).mockReturnValue({ status: CONTAINER_STATUS.STOPPED })
      vi.mocked(BitdeerUtils.bitdeerHasAlarmingValue).mockReturnValue({
        hasAlarm: false,
        isCriticallyHigh: false,
      })

      const result = getWidgetAlarmState(container, null)

      expect(result).toEqual({ shouldFlash: false, isCriticallyHigh: false })
    })
  })

  describe('Bitdeer containers', () => {
    it('should use default thresholds when containerSettings is null', () => {
      const container: Container = {
        id: 'container-123',
        type: 'container-bd-d40',
        info: { container: 'container-bd-d40' },
      }
      vi.mocked(BitdeerUtils.bitdeerHasAlarmingValue).mockReturnValue({
        hasAlarm: false,
        isCriticallyHigh: false,
      })

      const result = getWidgetAlarmState(container, null)

      expect(BitdeerUtils.bitdeerHasAlarmingValue).toHaveBeenCalledWith(container, null)
      expect(result).toEqual({ shouldFlash: false, isCriticallyHigh: false })
    })

    it('should use custom thresholds when containerSettings is provided', () => {
      const container: Container = {
        id: 'container-123',
        type: 'container-bd-d40',
        info: { container: 'container-bd-d40' },
      }
      const containerSettings: ContainerSettings = {
        model: 'container-bd-d40-a1346',
        thresholds: {
          oilTemperature: {
            criticalLow: 30,
            alert: 35,
            normal: 40,
            alarm: 45,
            criticalHigh: 50,
          },
        },
      }
      vi.mocked(BitdeerUtils.bitdeerHasAlarmingValue).mockReturnValue({
        hasAlarm: true,
        isCriticallyHigh: true,
      })

      const result = getWidgetAlarmState(container, containerSettings)

      expect(BitdeerUtils.bitdeerHasAlarmingValue).toHaveBeenCalledWith(
        container,
        containerSettings,
      )
      expect(result).toEqual({ shouldFlash: true, isCriticallyHigh: true })
    })

    it('should distinguish between low and high critical values', () => {
      const container: Container = {
        id: 'container-123',
        type: 'container-bd-d40',
        info: { container: 'container-bd-d40' },
      }
      // Container has low values (should flash but not beep)
      vi.mocked(BitdeerUtils.bitdeerHasAlarmingValue).mockReturnValue({
        hasAlarm: true,
        isCriticallyHigh: false,
      })

      const result = getWidgetAlarmState(container, null)

      expect(result).toEqual({ shouldFlash: true, isCriticallyHigh: false })
    })

    it('should not flash or beep for orange/yellow/green (alarm/alert) values', () => {
      const container: Container = {
        id: 'container-123',
        type: 'container-bd-d40',
        info: { container: 'container-bd-d40' },
      }
      // Container has alarm/alert values (orange/yellow/green) - should NOT flash or beep
      vi.mocked(BitdeerUtils.bitdeerHasAlarmingValue).mockReturnValue({
        hasAlarm: false,
        isCriticallyHigh: false,
      })

      const result = getWidgetAlarmState(container, null)

      expect(result).toEqual({ shouldFlash: false, isCriticallyHigh: false })
    })
  })

  describe('Bitmain Hydro containers', () => {
    it('should use default thresholds when containerSettings is null', () => {
      const container: Container = {
        id: 'container-456',
        type: 'container-as-hk3',
        info: { container: 'bitmain-hydro-1' },
      }
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        supply_liquid_temp: 40,
        supply_liquid_set_temp: 35,
        supply_liquid_pressure: 3.0,
        return_liquid_pressure: 2.8,
      })
      vi.mocked(HydroUtils.antspaceHydroHasAlarmingValue).mockReturnValue({
        hasAlarm: false,
        isCriticallyHigh: false,
      })

      const result = getWidgetAlarmState(container, null)

      expect(HydroUtils.antspaceHydroHasAlarmingValue).toHaveBeenCalled()
      expect(result).toEqual({ shouldFlash: false, isCriticallyHigh: false })
    })

    it('should use custom thresholds and flash when temp exceeds threshold', () => {
      const container: Container = {
        id: 'container-456',
        type: 'container-as-hk3',
        info: { container: 'bitmain-hydro-1' },
      }
      const containerSettings: ContainerSettings = {
        model: 'container-as-hk3',
        thresholds: {
          waterTemperature: {
            criticalLow: 20,
            alarmLow: 25,
            alert: 25,
            normal: 40, // Threshold is 40°C
            alarmHigh: 50,
            criticalHigh: 50,
          },
        },
      }
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        supply_liquid_temp: 45, // Above threshold
        supply_liquid_set_temp: 35,
        supply_liquid_pressure: 3.0,
        return_liquid_pressure: 2.8,
      })
      vi.mocked(HydroUtils.antspaceHydroHasAlarmingValue).mockReturnValue({
        hasAlarm: true,
        isCriticallyHigh: true,
      })

      const result = getWidgetAlarmState(container, containerSettings)

      expect(HydroUtils.antspaceHydroHasAlarmingValue).toHaveBeenCalled()
      expect(result).toEqual({ shouldFlash: true, isCriticallyHigh: true })
    })
  })

  describe('Bitmain Immersion containers', () => {
    it('should use default thresholds when containerSettings is null', () => {
      const container: Container = {
        id: 'container-789',
        type: 'other',
        info: { container: 'container-as-immersion-001' },
      }
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        primary_supply_temp: 45,
        second_supply_temp1: 44,
        second_supply_temp2: 43,
      })
      vi.mocked(ImmersionUtils.immersionHasAlarmingValue).mockReturnValue({
        hasAlarm: false,
        isCriticallyHigh: false,
      })

      const result = getWidgetAlarmState(container, null)

      expect(ImmersionUtils.immersionHasAlarmingValue).toHaveBeenCalled()
      expect(result).toEqual({ shouldFlash: false, isCriticallyHigh: false })
    })

    it('should use custom thresholds when containerSettings is provided', () => {
      const container: Container = {
        id: 'container-789',
        type: 'other',
        info: { container: 'container-as-immersion-001' },
      }
      const containerSettings: ContainerSettings = {
        model: 'container-as-immersion-001',
        thresholds: {
          oilTemperature: {
            criticalLow: 30,
            alert: 35,
            normal: 45,
            alarm: 50,
            criticalHigh: 55,
          },
        },
      }
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        primary_supply_temp: 52,
        second_supply_temp1: 51,
        second_supply_temp2: 50,
      })
      vi.mocked(ImmersionUtils.immersionHasAlarmingValue).mockReturnValue({
        hasAlarm: true,
        isCriticallyHigh: true,
      })

      const result = getWidgetAlarmState(container, containerSettings)

      expect(ImmersionUtils.immersionHasAlarmingValue).toHaveBeenCalledWith(
        expect.objectContaining({
          primary_supply_temp: 52,
          second_supply_temp1: 51,
          second_supply_temp2: 50,
        }),
        containerSettings,
      )
      expect(result).toEqual({ shouldFlash: true, isCriticallyHigh: true })
    })
  })

  describe('MicroBT containers', () => {
    it('should use default thresholds when containerSettings is null', () => {
      const container: Container = {
        id: 'container-321',
        type: 'container-mbt-kehua',
        info: { container: 'microbt-1' },
      }
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        cdu: {
          unit_inlet_temp_t2: 35,
        },
      })
      vi.mocked(MicroBTUtils.microBtHasAlarmingValue).mockReturnValue({
        hasAlarm: false,
        isCriticallyHigh: false,
      })

      const result = getWidgetAlarmState(container, null)

      expect(MicroBTUtils.microBtHasAlarmingValue).toHaveBeenCalledWith(35, container, null)
      expect(result).toEqual({ shouldFlash: false, isCriticallyHigh: false })
    })

    it('should use custom thresholds when containerSettings is provided', () => {
      const container: Container = {
        id: 'container-321',
        type: 'container-mbt-kehua',
        info: { container: 'microbt-1' },
      }
      const containerSettings: ContainerSettings = {
        model: 'container-mbt-kehua-001',
        thresholds: {
          waterTemperature: {
            criticalLow: 20,
            alarmLow: 25,
            normal: 35,
            alarmHigh: 40,
            criticalHigh: 45,
          },
        },
      }
      vi.mocked(deviceUtils.getContainerSpecificStats).mockReturnValue({
        cdu: {
          unit_inlet_temp_t2: 42, // Above threshold
        },
      })
      vi.mocked(MicroBTUtils.microBtHasAlarmingValue).mockReturnValue({
        hasAlarm: true,
        isCriticallyHigh: true,
      })

      const result = getWidgetAlarmState(container, containerSettings)

      expect(MicroBTUtils.microBtHasAlarmingValue).toHaveBeenCalledWith(
        42,
        container,
        containerSettings,
      )
      expect(result).toEqual({ shouldFlash: true, isCriticallyHigh: true })
    })
  })

  describe('getSupplyLiquidBoxItems', () => {
    it('returns three items for flow, pressure, and temperature', () => {
      const container: Container = {
        id: 'container-hydro',
        type: 'container-as-hk3',
        info: { container: 'bitmain-hydro-1' },
        last: {
          snap: {
            stats: {
              container_specific: {
                supply_liquid_flow: 2.5,
                supply_liquid_pressure: 0.5,
                supply_liquid_temp: 35,
              },
            },
          },
        },
      }
      vi.mocked(HydroUtils.getAntspaceSupplyLiquidPressureColor).mockReturnValue('green')
      vi.mocked(HydroUtils.shouldAntspacePressureFlash).mockReturnValue(false)
      vi.mocked(HydroUtils.getAntspaceSupplyLiquidTemperatureColor).mockReturnValue('yellow')
      vi.mocked(HydroUtils.shouldAntspaceSupplyLiquidTempFlash).mockReturnValue(false)

      const result = getSupplyLiquidBoxItems(container, null)

      expect(result).toHaveLength(3)
      expect(result[0].name).toBe('Flow')
      expect(result[0].value).toBe(2.5)
      expect(result[1].name).toBe('Pressure')
      expect(result[2].name).toBe('Temperature')
      expect(result[2].value).toBe(35)
    })

    it('returns items with flashing state when alarms are triggered', () => {
      const container: Container = {
        id: 'container-hydro',
        type: 'container-as-hk3',
        info: { container: 'bitmain-hydro-1' },
        last: {
          snap: {
            stats: {
              container_specific: {
                supply_liquid_flow: 5,
                supply_liquid_pressure: 0.9,
                supply_liquid_temp: 55,
              },
            },
          },
        },
      }
      vi.mocked(HydroUtils.getAntspaceSupplyLiquidPressureColor).mockReturnValue('red')
      vi.mocked(HydroUtils.shouldAntspacePressureFlash).mockReturnValue(true)
      vi.mocked(HydroUtils.getAntspaceSupplyLiquidTemperatureColor).mockReturnValue('red')
      vi.mocked(HydroUtils.shouldAntspaceSupplyLiquidTempFlash).mockReturnValue(true)

      const result = getSupplyLiquidBoxItems(container, null)

      expect(result[1].flash).toBe(true)
      expect(result[2].flash).toBe(true)
    })
  })

  describe('getMinersSummaryBoxData', () => {
    it('returns dash when minerTailLogItem is empty', () => {
      const result = getMinersSummaryBoxData('container-bd-d40', {} as MinerTailLogItem)
      expect(result.hashrate).toBe('-')
      expect(result.maxtemp).toBe('-')
      expect(result.avgtemp).toBe('-')
    })

    it('computes hashrate and temps when data is available', () => {
      const minerTailLogItem = {
        hashrate_mhs_1m_group_sum_aggr: { 'container-bd-d40': 100_000_000 },
        temperature_c_group_max_aggr: { 'container-bd-d40': 75 },
        temperature_c_group_avg_aggr: { 'container-bd-d40': 65 },
      } as unknown as MinerTailLogItem
      const result = getMinersSummaryBoxData('container-bd-d40', minerTailLogItem)
      expect(typeof result.hashrate).toBe('number')
      expect(result.maxtemp).toBe('75')
      expect(result.avgtemp).toBe('65')
    })
  })

  describe('getContainerMinersChartData', () => {
    it('should return actualMiners as 0 when minerTailLogItem is empty', () => {
      const containerModel = 'container-bd-d40'
      const minerTailLogItem = {} as MinerTailLogItem
      const total = 100

      const result = getContainerMinersChartData(containerModel, minerTailLogItem, total)

      expect(result).toEqual({
        disconnected: 100,
        total: 100,
        actualMiners: 0,
      })
    })

    it('should calculate actualMiners correctly when miners are connected', () => {
      const containerModel = 'container-bd-d40'
      const minerTailLogItem = {
        offline_cnt: { 'container-bd-d40': 10 },
        not_mining_cnt: { 'container-bd-d40': 5 },
        power_mode_normal_cnt: { 'container-bd-d40': 20 },
        power_mode_low_cnt: { 'container-bd-d40': 15 },
      } as unknown as MinerTailLogItem
      const total = 100

      const result = getContainerMinersChartData(containerModel, minerTailLogItem, total)

      // Total connected: 10 + 5 + 20 + 15 = 50
      // Disconnected: 100 - 50 = 50
      // ActualMiners: 100 - 50 = 50
      expect(result.actualMiners).toBe(50)
      expect(result.disconnected).toBe(50)
      expect(result.total).toBe(100)
    })

    it('should return actualMiners equal to total when all sockets have miners', () => {
      const containerModel = 'container-bd-d40'
      const minerTailLogItem = {
        power_mode_normal_cnt: { 'container-bd-d40': 100 },
      } as unknown as MinerTailLogItem
      const total = 100

      const result = getContainerMinersChartData(containerModel, minerTailLogItem, total)

      expect(result.actualMiners).toBe(100)
      expect(result.disconnected).toBe(0)
      expect(result.total).toBe(100)
    })

    it('should handle negative disconnected values by clamping to 0', () => {
      const containerModel = 'container-bd-d40'
      const minerTailLogItem = {
        power_mode_normal_cnt: { 'container-bd-d40': 150 }, // More than total
      } as unknown as MinerTailLogItem
      const total = 100

      const result = getContainerMinersChartData(containerModel, minerTailLogItem, total)

      expect(result.disconnected).toBe(0) // Clamped to 0
      expect(result.actualMiners).toBe(100) // Should be total when disconnected is 0
    })
  })
})
