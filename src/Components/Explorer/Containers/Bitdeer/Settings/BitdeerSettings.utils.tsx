import _isObject from 'lodash/isObject'
import _some from 'lodash/some'

import {
  getColorAndTooltipFromThresholds,
  getColorFromThresholds,
  getShouldFlashFromThresholds,
  getShouldFlashWidgetFromThresholds,
  transformThresholdsForUtility,
  type ColorAndTooltipResult,
} from '@/app/utils/containerThresholdUtils'
import {
  getContainerSpecificConfig,
  getContainerSpecificStats,
  getStats,
} from '@/app/utils/deviceUtils'
import type { Device } from '@/app/utils/deviceUtils/types'
import { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { COLOR } from '@/constants/colors'
import { CONTAINER_MODEL } from '@/constants/containerConstants'
import { getCoolingSystem } from '@/Views/Container/Tabs/HomeTab/HomeTab.util'
import { Container } from '@/Views/ContainerWidgets/ContainerWidget.util'

interface OilTempThresholds {
  COLD: number
  LIGHT_WARM: number
  WARM: number
  HOT: number
  SUPERHOT?: number
  [key: string]: unknown
}

interface PressureThresholds {
  CRITICAL_LOW: number
  MEDIUM_LOW: number
  NORMAL?: number
  MEDIUM_HIGH: number
  CRITICAL_HIGH: number
  [key: string]: unknown
}

// Default thresholds (fallback values)
const DEFAULT_BITDEER_OIL_TEMP_THRESHOLDS: OilTempThresholds = {
  COLD: 33,
  LIGHT_WARM: 39,
  WARM: 42,
  HOT: 45,
}

const DEFAULT_BITDEER_PRESSURE_THRESHOLDS: PressureThresholds = {
  CRITICAL_LOW: 2,
  MEDIUM_LOW: 2.3,
  NORMAL: 2.3, // Default: normal starts where alarm low ends
  MEDIUM_HIGH: 3.5,
  CRITICAL_HIGH: 4,
}

// Helper function to get thresholds from container settings or use defaults
const getBitdeerOilTempThresholds = (
  containerSettings: UnknownRecord | null = null,
): OilTempThresholds => {
  if (!containerSettings?.thresholds) {
    return DEFAULT_BITDEER_OIL_TEMP_THRESHOLDS
  }

  const transformed = transformThresholdsForUtility(
    CONTAINER_MODEL.BITDEER_THRESHOLD,
    containerSettings.thresholds as Record<string, UnknownRecord>,
  ) as UnknownRecord

  if (transformed?.oilTemperature && _isObject(transformed.oilTemperature)) {
    const oilTemp = transformed.oilTemperature as unknown as OilTempThresholds
    // Use !== undefined instead of truthy check to allow 0 values
    if (
      oilTemp.COLD !== undefined &&
      oilTemp.LIGHT_WARM !== undefined &&
      oilTemp.WARM !== undefined &&
      oilTemp.HOT !== undefined
    ) {
      return oilTemp
    }
  }

  return DEFAULT_BITDEER_OIL_TEMP_THRESHOLDS
}

const getBitdeerPressureThresholds = (
  containerSettings: UnknownRecord | null = null,
): PressureThresholds => {
  if (!containerSettings?.thresholds) {
    return DEFAULT_BITDEER_PRESSURE_THRESHOLDS
  }

  const transformed = transformThresholdsForUtility(
    CONTAINER_MODEL.BITDEER_THRESHOLD,
    containerSettings.thresholds as Record<string, UnknownRecord>,
  ) as UnknownRecord

  if (transformed?.tankPressure && _isObject(transformed.tankPressure)) {
    const tankPressure = transformed.tankPressure as unknown as PressureThresholds
    // Use !== undefined instead of truthy check to allow 0 values
    if (
      tankPressure.CRITICAL_LOW !== undefined &&
      tankPressure.MEDIUM_LOW !== undefined &&
      tankPressure.MEDIUM_HIGH !== undefined &&
      tankPressure.CRITICAL_HIGH !== undefined
    ) {
      return tankPressure
    }
  }

  return DEFAULT_BITDEER_PRESSURE_THRESHOLDS
}

export const getBitdeerCoolingSystemData = (data: UnknownRecord) => {
  const cooling_system = getContainerSpecificStats(data as Device)?.cooling_system as
    | {
        exhaust_fan_enabled?: boolean
        dry_cooler?: boolean
        water_pump?: boolean
        oil_pump?: boolean
      }
    | undefined

  return {
    exhaustFanEnabled: cooling_system?.exhaust_fan_enabled,
    dryCooler: cooling_system?.dry_cooler,
    waterPump: cooling_system?.water_pump,
    oilPump: cooling_system?.oil_pump,
  }
}

export const getBitdeerTacticsData = (data: UnknownRecord) =>
  getContainerSpecificConfig(data as Device)?.tactics

export const getBitdeerParameterSettingsData = (data: UnknownRecord) => {
  const alarms = getContainerSpecificConfig(data as Device)?.alarms
  const set_temps = getContainerSpecificConfig(data as Device)?.set_temps as
    | { cold_oil_temp_c?: number }
    | undefined
  return { alarms, set_temps }
}

export const getBitdeerTemperatureColor = (data: UnknownRecord, currentTemp: number) => {
  const { set_temps } = getBitdeerParameterSettingsData(data)
  const coldOilSetTemp = set_temps?.cold_oil_temp_c

  if (coldOilSetTemp !== undefined) {
    if (currentTemp > coldOilSetTemp + 5) {
      return 'red'
    }
    if (currentTemp > coldOilSetTemp) {
      return 'orange'
    }
  }
  return ''
}

export const getBitdeerOilTemperatureColor = (
  isOilPumpEnabled: boolean,
  currentTemp: number | undefined,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getBitdeerOilTempThresholds(containerSettings)

  // Logic: Everything between COLD and WARM should be YELLOW (alert)
  return getColorFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alert: thresholds.COLD, // Alert starts where critical low ends
      normal: thresholds.WARM,
      alarm: thresholds.HOT,
      criticalHigh: thresholds.SUPERHOT,
    },
    !isOilPumpEnabled, // disabled if oil pump is not running
  )
}

export const getBitdeerOilTemperatureColorAndTooltip = (
  isOilPumpEnabled: boolean,
  currentTemp: number | undefined,
  containerStatus: string,
  containerSettings: UnknownRecord | null = null,
): ColorAndTooltipResult => {
  const thresholds = getBitdeerOilTempThresholds(containerSettings)

  // If oil pump is disabled, return white with custom tooltip
  if (!isOilPumpEnabled) {
    return {
      color: COLOR.WHITE,
      tooltip: 'Temperature monitoring disabled - Oil pump is turned off',
    }
  }

  // Logic: Everything between COLD and WARM should be YELLOW (alert)
  return getColorAndTooltipFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alert: thresholds.COLD, // Alert starts where critical low ends
      normal: thresholds.WARM,
      alarm: thresholds.HOT,
      criticalHigh: thresholds.SUPERHOT,
    },
    false, // not disabled
    containerStatus,
  )
}

export const shouldBitdeerOilTemperatureFlash = (
  _isOilPumpEnabled: boolean,
  currentTemp: number,
  status: string,
  _data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getBitdeerOilTempThresholds(containerSettings)

  return getShouldFlashFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alert: thresholds.COLD,
      normal: thresholds.WARM,
      alarm: thresholds.HOT,
      criticalHigh: thresholds.SUPERHOT,
    },
    status,
  )
}

export const shouldBitdeerOilTemperatureSuperflash = (
  _isOilPumpEnabled: boolean,
  currentTemp: number,
  status: string,
  _data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getBitdeerOilTempThresholds(containerSettings)

  return getShouldFlashWidgetFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alert: thresholds.COLD,
      normal: thresholds.WARM,
      alarm: thresholds.HOT,
      criticalHigh: thresholds.SUPERHOT,
    },
    status,
  )
}

export const shouldBitdeerTankPressureFlash = (
  isOilPumpEnabled: boolean,
  currentPressure: number,
  containerStatus: string,
  _data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  // If oil pump is off, pressure should never flash
  if (!isOilPumpEnabled) {
    return false
  }

  const thresholds = getBitdeerPressureThresholds(containerSettings)

  return getShouldFlashFromThresholds(
    currentPressure,
    {
      criticalLow: thresholds.CRITICAL_LOW,
      alarmLow: thresholds.MEDIUM_LOW,
      normal: thresholds.NORMAL,
      alarmHigh: thresholds.MEDIUM_HIGH,
      criticalHigh: thresholds.CRITICAL_HIGH,
    },
    containerStatus,
  )
}

export const shouldBitdeerTankPressureSuperflash = (
  _isOilPumpEnabled: boolean,
  currentPressure: number,
  status: string,
  _data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getBitdeerPressureThresholds(containerSettings)

  return getShouldFlashWidgetFromThresholds(
    currentPressure,
    {
      criticalLow: thresholds.CRITICAL_LOW,
      alarmLow: thresholds.MEDIUM_LOW,
      normal: thresholds.NORMAL,
      alarmHigh: thresholds.MEDIUM_HIGH,
      criticalHigh: thresholds.CRITICAL_HIGH,
    },
    status,
  )
}

export const bitdeerHasAlarmingValue = (
  container: Container,
  containerSettings: UnknownRecord | null = null,
): { hasAlarm: boolean; isCriticallyHigh: boolean } => {
  const coolingSystem = getCoolingSystem(container) as {
    oil_pump?: Array<{ cold_temp_c?: number; enabled?: boolean }>
    tank1_bar?: number
    tank2_bar?: number
  }
  const {
    oil_pump: [{ cold_temp_c: cold_temp_c_1 } = {}, { cold_temp_c: cold_temp_c_2 } = {}] = [],
    oil_pump = [],
    tank1_bar,
    tank2_bar,
  } = coolingSystem

  const pressureThresholds = getBitdeerPressureThresholds(containerSettings)
  const oilTempThresholds = getBitdeerOilTempThresholds(containerSettings)

  // Get container status for critical low checks
  const { status } = getStats(container) as { status: string }
  const isContainerStopped = status === CONTAINER_STATUS.STOPPED
  const isContainerOffline = status === CONTAINER_STATUS.OFFLINE

  // Check if oil pumps are enabled
  const pump1Enabled = oil_pump?.[0]?.enabled ?? false
  const pump2Enabled = oil_pump?.[1]?.enabled ?? false

  // Only check pressures for ENABLED oil pumps
  const pressuresToCheck = []
  if (pump1Enabled && tank1_bar !== undefined) {
    pressuresToCheck.push(tank1_bar)
  }
  if (pump2Enabled && tank2_bar !== undefined) {
    pressuresToCheck.push(tank2_bar)
  }

  // Critical low pressure should only trigger for ENABLED pumps, and not offline/stopped
  const anyPressureTooLow =
    !isContainerStopped &&
    !isContainerOffline &&
    _some(
      pressuresToCheck,
      (value: number | undefined) => (value ?? 0) < pressureThresholds.CRITICAL_LOW,
    )
  // Critical high pressure should only trigger for ENABLED pumps, and not offline/stopped
  const anyPressureTooHigh =
    !isContainerStopped &&
    !isContainerOffline &&
    _some(
      pressuresToCheck,
      (value: number | undefined) => (value ?? 0) >= pressureThresholds.CRITICAL_HIGH,
    )
  // Trigger whole card flash ONLY for critical values (red), not alarm/alert (orange/yellow/green)
  // Temperature: critical high is ONLY SUPERHOT (if exists) - never use HOT as fallback
  // HOT is alarm level (orange), not critical (red)
  // Pressure: critical high is CRITICAL_HIGH
  // Critical high temp should not trigger for offline/stopped containers
  // IMPORTANT: Only check temperatures for ENABLED oil pumps (disabled pumps should not cause widget flash)
  const superhotThreshold = oilTempThresholds.SUPERHOT
  const tempsToCheck = []
  // pump1Enabled and pump2Enabled already defined above
  if (pump1Enabled) tempsToCheck.push(cold_temp_c_1)
  if (pump2Enabled) tempsToCheck.push(cold_temp_c_2)

  const anyTempCriticalHigh =
    !isContainerStopped &&
    !isContainerOffline &&
    superhotThreshold !== undefined &&
    _some(tempsToCheck, (value: number | undefined) => (value ?? 0) >= superhotThreshold)
  // Check for critical low temperature only for ENABLED tanks, but not offline/stopped
  const anyTempCriticalLow =
    !isContainerStopped &&
    !isContainerOffline &&
    _some(tempsToCheck, (value: number | undefined) => (value ?? 0) < oilTempThresholds.COLD)

  const hasAlarm =
    anyTempCriticalHigh || anyTempCriticalLow || anyPressureTooLow || anyPressureTooHigh
  const isCriticallyHigh = anyTempCriticalHigh || anyPressureTooHigh

  return { hasAlarm, isCriticallyHigh }
}

const PRESSURE_COLORS = {
  NORMAL: COLOR.WHITE,
  EXPECTED: COLOR.GREEN,
  ALARM_LOW: COLOR.GOLD, // Yellow/Gold for alarm low
  ALARM_HIGH: COLOR.ORANGE, // Orange for alarm high
}

export const getBitdeerTankPressureColor = (
  _isOilPumpEnabled: boolean,
  currentPressure: number,
  _data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getBitdeerPressureThresholds(containerSettings)

  return getColorFromThresholds(
    currentPressure,
    {
      criticalLow: thresholds.CRITICAL_LOW,
      alarmLow: thresholds.MEDIUM_LOW,
      normal: thresholds.NORMAL,
      alarmHigh: thresholds.MEDIUM_HIGH,
      criticalHigh: thresholds.CRITICAL_HIGH,
    },
    false, // pressure colors always show regardless of oil pump status
  )
}

export const getBitdeerTankPressureColorAndTooltip = (
  isOilPumpEnabled: boolean,
  currentPressure: number,
  containerStatus: string,
  containerSettings: UnknownRecord | null = null,
): ColorAndTooltipResult => {
  const thresholds = getBitdeerPressureThresholds(containerSettings)

  // If oil pump is disabled, return white with custom tooltip
  if (!isOilPumpEnabled) {
    return {
      color: COLOR.WHITE,
      tooltip: 'Pressure monitoring disabled - Oil pump is turned off',
    }
  }

  return getColorAndTooltipFromThresholds(
    currentPressure,
    {
      criticalLow: thresholds.CRITICAL_LOW,
      alarmLow: thresholds.MEDIUM_LOW, // Alarm Low: MEDIUM_LOW to NORMAL (yellow)
      normal: thresholds.NORMAL, // Normal: NORMAL to MEDIUM_HIGH (green)
      alarmHigh: thresholds.MEDIUM_HIGH, // Alarm High: MEDIUM_HIGH to CRITICAL_HIGH (orange, blinking)
      criticalHigh: thresholds.CRITICAL_HIGH,
    },
    false,
    containerStatus,
  )
}

export const getBitdeerTankPressureColorByCharacter = (
  _isTankEnabled: boolean,
  currentPressure: number,
  _data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getBitdeerPressureThresholds(containerSettings)

  if (!_isTankEnabled) {
    return PRESSURE_COLORS.NORMAL
  }
  if (currentPressure < thresholds.CRITICAL_LOW) {
    return COLOR.RED // Critical low - red
  }
  if (currentPressure < thresholds.MEDIUM_LOW) {
    return PRESSURE_COLORS.ALARM_LOW // Alarm low - yellow/gold
  }
  if (currentPressure < thresholds.MEDIUM_HIGH) {
    return PRESSURE_COLORS.EXPECTED // Normal - green
  }
  if (currentPressure < thresholds.CRITICAL_HIGH) {
    return PRESSURE_COLORS.ALARM_HIGH // Alarm high - orange
  }
  return COLOR.RED // Critical high - red
}
