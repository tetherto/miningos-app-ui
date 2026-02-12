import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _sum from 'lodash/sum'
import _values from 'lodash/values'

import {
  isAntspaceHydro,
  isBitdeer,
  isBitmainImmersion,
  isMicroBT,
} from '@/app/utils/containerUtils'
import {
  Device,
  getContainerSpecificStats,
  getStats,
  megaToTera,
  UnknownRecord,
} from '@/app/utils/deviceUtils'
import { convertMpaToBar, formatNumber } from '@/app/utils/format'
import { MINER_POWER_MODE, MinerStatuses } from '@/app/utils/statusUtils'
import {
  bitdeerHasAlarmingValue,
  getBitdeerOilTemperatureColorAndTooltip,
  getBitdeerTankPressureColorAndTooltip,
  shouldBitdeerOilTemperatureFlash,
  shouldBitdeerTankPressureFlash,
} from '@/Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings.utils'
import {
  antspaceHydroHasAlarmingValue,
  getAntspaceSupplyLiquidPressureColor,
  getAntspaceSupplyLiquidTemperatureColor,
  shouldAntspacePressureFlash,
  shouldAntspaceSupplyLiquidTempFlash,
} from '@/Components/Explorer/Containers/BitMainHydro/HydroSettings.utils'
import { immersionHasAlarmingValue } from '@/Components/Explorer/Containers/BitMainImmersion/ImmersionSettings.utils'
import { microBtHasAlarmingValue } from '@/Components/Explorer/Containers/MicroBT/MicroBTSettings/MicorBTSettingsUtils'
import { UNITS } from '@/constants/units'
import { getCoolingSystem } from '@/Views/Container/Tabs/HomeTab/HomeTab.util'

export interface Container extends Device {
  info?: {
    container?: string
    cooling_system?: Record<string, unknown>
    cdu?: Record<string, unknown>
    primary_supply_temp?: number
    second_supply_temp1?: number
    second_supply_temp2?: number
    supply_liquid_temp?: number
    supply_liquid_set_temp?: number
    supply_liquid_pressure?: number
    return_liquid_pressure?: number
  }
  last?: {
    snap?: {
      stats?: {
        container_specific?: Record<string, unknown>
      }
    }
  }
}

interface CoolingSystem {
  oil_pump?: Array<{
    cold_temp_c: number
    [key: string]: unknown
  }>
  [key: string]: unknown
}

export interface ContainerSettings {
  model?: string
  thresholds?: UnknownRecord
  parameters?: UnknownRecord
  site?: string
  [key: string]: unknown
}

export interface MinerTailLogItem {
  [key: string]: Record<string, number>
}

const PowerModesMap: Record<
  string,
  | (typeof MinerStatuses)[keyof typeof MinerStatuses]
  | (typeof MINER_POWER_MODE)[keyof typeof MINER_POWER_MODE]
> = {
  offline_cnt: MinerStatuses.OFFLINE,
  not_mining_cnt: MinerStatuses.NOT_MINING,
  power_mode_normal_include_error_cnt: MinerStatuses.ERROR,
  power_mode_low_cnt: MINER_POWER_MODE.LOW,
  power_mode_normal_cnt: MINER_POWER_MODE.NORMAL,
  power_mode_high_cnt: MINER_POWER_MODE.HIGH,
}

export const getContainerMinersChartData = (
  containerModel: string,
  minerTailLogItem: MinerTailLogItem,
  total: number,
) => {
  if (_isEmpty(minerTailLogItem)) {
    return {
      disconnected: total,
      total,
      actualMiners: 0,
    }
  }

  const data = _reduce(
    _keys(PowerModesMap),
    (accum: Record<string, number>, key) => ({
      ...accum,
      [PowerModesMap[key]]: minerTailLogItem[key]?.[containerModel] || 0,
    }),
    {},
  )

  const disconnected = total - _sum(_values(data))
  const actualMiners = total - Math.max(0, disconnected)

  return {
    ...data,
    disconnected: Math.max(0, disconnected),
    total,
    actualMiners,
  }
}

export const getSupplyLiquidBoxItems = (
  container: Container,
  containerSettings: ContainerSettings | null = null,
) => {
  const { supply_liquid_flow, supply_liquid_pressure, supply_liquid_temp } =
    (container?.last?.snap?.stats?.container_specific as {
      supply_liquid_flow: number
      supply_liquid_pressure: number
      supply_liquid_temp: number
    }) || {}
  const { status } = getStats(container) as { status: string }

  return [
    {
      name: 'Flow',
      value: supply_liquid_flow,
      unit: UNITS.FLOW_M3H,
    },
    {
      name: 'Pressure',
      value: convertMpaToBar(supply_liquid_pressure),
      unit: UNITS.PRESSURE_BAR,
      color: getAntspaceSupplyLiquidPressureColor(
        convertMpaToBar(supply_liquid_pressure),
        status,
        container,
        containerSettings,
      ),
      flash: shouldAntspacePressureFlash(
        convertMpaToBar(supply_liquid_pressure),
        status,
        container,
        containerSettings,
      ),
    },
    {
      name: 'Temperature',
      value: supply_liquid_temp,
      color: getAntspaceSupplyLiquidTemperatureColor(
        supply_liquid_temp,
        status,
        container,
        containerSettings,
      ),
      flash: shouldAntspaceSupplyLiquidTempFlash(
        supply_liquid_temp,
        status,
        container,
        containerSettings,
      ),
      unit: UNITS.TEMPERATURE_C,
    },
  ]
}

export const isCirculatingPumpActive = (container: Container): boolean =>
  Boolean(container?.last?.snap?.stats?.container_specific?.circulating_pump)

export const getTanksBoxData = (
  container: Container,
  containerSettings: ContainerSettings | null = null,
) => {
  const coolingSystem = _get(container, [
    'last',
    'snap',
    'stats',
    'container_specific',
    'cooling_system',
  ]) as CoolingSystem

  const { status } = getStats(container) as { status: string }
  const { tank1_bar, tank2_bar } = getCoolingSystem(container) as {
    tank1_bar: number
    tank2_bar: number
  }
  const { oil_pump } = { ...coolingSystem }

  const oilPumpsWithColor = _map(oil_pump, (pump) => {
    // Use pump.enabled (oil pump status) for color/tooltip logic, not tank status
    const isPumpEnabled: boolean = Boolean(pump?.enabled)
    const { color: tempColor, tooltip: tempTooltip } = getBitdeerOilTemperatureColorAndTooltip(
      isPumpEnabled,
      pump?.cold_temp_c,
      status,
      containerSettings,
    )

    return {
      ...pump,
      color: tempColor,
      tooltip: tempTooltip,
      flash: shouldBitdeerOilTemperatureFlash(
        isPumpEnabled,
        pump?.cold_temp_c,
        status,
        container,
        containerSettings,
      ),
    }
  })

  const pressureWithColor = _map([tank1_bar, tank2_bar], (bar, index) => {
    // Get oil pump enabled status for this tank
    const isPumpEnabled: boolean = Boolean(oil_pump?.[index]?.enabled)
    const { color: pressureColor, tooltip: pressureTooltip } =
      getBitdeerTankPressureColorAndTooltip(isPumpEnabled, bar, status, containerSettings)

    return {
      value: bar,
      color: pressureColor,
      tooltip: pressureTooltip,
      flash: shouldBitdeerTankPressureFlash(
        isPumpEnabled,
        bar,
        status,
        container,
        containerSettings,
      ),
    }
  })

  return { ...coolingSystem, oil_pump: oilPumpsWithColor, pressure: pressureWithColor }
}

export const getMinersSummaryBoxData = (
  containerModel: string,
  minerTailLogItem: MinerTailLogItem,
) => {
  const hashrateValue = minerTailLogItem?.hashrate_mhs_1m_group_sum_aggr?.[containerModel]
  const maxContainerTemp = minerTailLogItem?.temperature_c_group_max_aggr?.[containerModel]
  const avgContainerTemp = minerTailLogItem?.temperature_c_group_avg_aggr?.[containerModel]

  return {
    hashrate: hashrateValue ? megaToTera(hashrateValue) : '-',
    maxtemp: formatNumber(maxContainerTemp, {}, '-'),
    avgtemp: formatNumber(avgContainerTemp, {}, '-'),
  }
}

export const getWidgetAlarmState = (
  container: Container,
  containerSettings: ContainerSettings | null = null,
): { shouldFlash: boolean; isCriticallyHigh: boolean } => {
  const { type } = container

  if (!type) return { shouldFlash: false, isCriticallyHigh: false }

  if (isBitdeer(type)) {
    const alarmState = bitdeerHasAlarmingValue(container, containerSettings)
    return { shouldFlash: alarmState.hasAlarm, isCriticallyHigh: alarmState.isCriticallyHigh }
  }

  if (isBitmainImmersion(container.info?.container as string)) {
    const containerSpecificStats = getContainerSpecificStats(container)
    const alarmState = immersionHasAlarmingValue(containerSpecificStats, containerSettings)
    return { shouldFlash: alarmState.hasAlarm, isCriticallyHigh: alarmState.isCriticallyHigh }
  }

  if (isMicroBT(type)) {
    const containerStats = getContainerSpecificStats(container)
    const { cdu } = containerStats as {
      cdu?: { unit_inlet_temp_t2: number }
    }
    if (!cdu?.unit_inlet_temp_t2) {
      return { shouldFlash: false, isCriticallyHigh: false }
    }
    const alarmState = microBtHasAlarmingValue(cdu.unit_inlet_temp_t2, container, containerSettings)
    return { shouldFlash: alarmState.hasAlarm, isCriticallyHigh: alarmState.isCriticallyHigh }
  }

  if (isAntspaceHydro(type)) {
    const {
      supply_liquid_temp,
      supply_liquid_set_temp,
      supply_liquid_pressure,
      return_liquid_pressure,
    } = getContainerSpecificStats(container) as {
      supply_liquid_temp: number
      supply_liquid_set_temp: number
      supply_liquid_pressure: number
      return_liquid_pressure: number
    }
    const pressureInBar1 = convertMpaToBar(supply_liquid_pressure)
    const pressureInBar2 = convertMpaToBar(return_liquid_pressure)

    const alarmState = antspaceHydroHasAlarmingValue(
      supply_liquid_temp,
      supply_liquid_set_temp,
      pressureInBar1,
      pressureInBar2,
      container,
      containerSettings,
    )
    return { shouldFlash: alarmState.hasAlarm, isCriticallyHigh: alarmState.isCriticallyHigh }
  }

  return { shouldFlash: false, isCriticallyHigh: false }
}
