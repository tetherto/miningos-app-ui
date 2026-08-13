import _isNil from 'lodash/isNil'
import _isObject from 'lodash/isObject'

import {
  getColorFromThresholds,
  getShouldFlashFromThresholds,
  getShouldFlashWidgetFromThresholds,
  transformThresholdsForUtility,
} from '@/app/utils/containerThresholdUtils'
import { getStats } from '@/app/utils/deviceUtils'
import { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { CONTAINER_MODEL } from '@/constants/containerConstants'

interface AntspaceSupplyLiquidThresholds {
  COLD: number
  LIGHT_WARM: number
  WARM: number
  HOT: number
  SUPERHOT: number
  [key: string]: unknown
}

interface AntspacePressureThresholds {
  LOW: number
  MEDIUM_LOW: number
  MEDIUM_HIGH: number
  HIGH: number
  [key: string]: unknown
}

const DEFAULT_ANTSPACE_SUPPLY_LIQUID_THRESHOLDS: AntspaceSupplyLiquidThresholds = {
  COLD: 21,
  LIGHT_WARM: 25,
  WARM: 30,
  HOT: 37,
  SUPERHOT: 40,
}

const getAntspaceSupplyLiquidThresholds = (
  _data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
): AntspaceSupplyLiquidThresholds => {
  if (!containerSettings?.thresholds) {
    return DEFAULT_ANTSPACE_SUPPLY_LIQUID_THRESHOLDS
  }

  const transformed = transformThresholdsForUtility(
    CONTAINER_MODEL.HYDRO_THRESHOLD,
    containerSettings.thresholds as Record<string, UnknownRecord>,
  ) as UnknownRecord

  if (transformed?.waterTemperature && _isObject(transformed.waterTemperature)) {
    const waterTemp = transformed.waterTemperature as unknown as AntspaceSupplyLiquidThresholds
    if (
      waterTemp.COLD &&
      waterTemp.LIGHT_WARM &&
      waterTemp.WARM &&
      waterTemp.HOT &&
      waterTemp.SUPERHOT
    ) {
      return waterTemp
    }
  }

  return DEFAULT_ANTSPACE_SUPPLY_LIQUID_THRESHOLDS
}

export const BITMAIN_HYDRO_WATER_TEMP_MIN_BY_CHARACTER_MAP = {
  'Critical Low': -Infinity,
  'Alarm Low': DEFAULT_ANTSPACE_SUPPLY_LIQUID_THRESHOLDS.COLD,
  Alert: DEFAULT_ANTSPACE_SUPPLY_LIQUID_THRESHOLDS.LIGHT_WARM,
  Normal: DEFAULT_ANTSPACE_SUPPLY_LIQUID_THRESHOLDS.WARM,
  'Alarm High': DEFAULT_ANTSPACE_SUPPLY_LIQUID_THRESHOLDS.HOT,
  'Critical High': DEFAULT_ANTSPACE_SUPPLY_LIQUID_THRESHOLDS.SUPERHOT,
}

const DEFAULT_ANTSPACE_SUPPLY_LIQUID_PRESSURE_THRESHOLDS: AntspacePressureThresholds = {
  LOW: 2,
  MEDIUM_LOW: 2.3,
  MEDIUM_HIGH: 3.5,
  HIGH: 4,
}

const getAntspacePressureThresholds = (
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
): AntspacePressureThresholds => {
  if (!containerSettings?.thresholds) {
    return DEFAULT_ANTSPACE_SUPPLY_LIQUID_PRESSURE_THRESHOLDS
  }

  const transformed = transformThresholdsForUtility(
    CONTAINER_MODEL.HYDRO_THRESHOLD,
    containerSettings.thresholds as Record<string, UnknownRecord>,
  ) as UnknownRecord

  if (transformed?.supplyLiquidPressure && _isObject(transformed.supplyLiquidPressure)) {
    const supplyPressure = transformed.supplyLiquidPressure as unknown as AntspacePressureThresholds
    if (
      supplyPressure.LOW &&
      supplyPressure.MEDIUM_LOW &&
      supplyPressure.MEDIUM_HIGH &&
      supplyPressure.HIGH
    ) {
      return supplyPressure
    }
  }

  return DEFAULT_ANTSPACE_SUPPLY_LIQUID_PRESSURE_THRESHOLDS
}

export const BITMAIN_HYDRO_SUPPLY_LIQUID_PRESSURE_MIN_BY_CHARACTER_MAP = {
  'Critical Low': -Infinity,
  'Alarm Low': DEFAULT_ANTSPACE_SUPPLY_LIQUID_PRESSURE_THRESHOLDS.LOW,
  Normal: DEFAULT_ANTSPACE_SUPPLY_LIQUID_PRESSURE_THRESHOLDS.MEDIUM_LOW,
  'Alarm High': DEFAULT_ANTSPACE_SUPPLY_LIQUID_PRESSURE_THRESHOLDS.MEDIUM_HIGH,
  'Critical High': DEFAULT_ANTSPACE_SUPPLY_LIQUID_PRESSURE_THRESHOLDS.HIGH,
}

export const getAntspaceSupplyLiquidTemperatureColor = (
  currentTemp: number,
  containerStatus: string,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getAntspaceSupplyLiquidThresholds(data, containerSettings)

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
    false,
    containerStatus,
  )
}

export const getAntspaceSupplyLiquidPressureColor = (
  currentPressure: number,
  containerStatus: string,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getAntspacePressureThresholds(data, containerSettings)

  return getColorFromThresholds(
    currentPressure,
    {
      criticalLow: thresholds.LOW,
      alarmLow: thresholds.LOW,
      normal: thresholds.MEDIUM_LOW,
      alarmHigh: thresholds.MEDIUM_HIGH,
      criticalHigh: thresholds.HIGH,
    },
    false,
    containerStatus,
  )
}

export const shouldAntspacePressureFlash = (
  pressure: number,
  status: string,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getAntspacePressureThresholds(data, containerSettings)

  if (_isNil(pressure)) {
    return false
  }

  return getShouldFlashFromThresholds(
    pressure,
    {
      criticalLow: thresholds.LOW,
      alarmLow: thresholds.LOW,
      normal: thresholds.MEDIUM_LOW,
      alarmHigh: thresholds.MEDIUM_HIGH,
      criticalHigh: thresholds.HIGH,
    },
    status,
  )
}

export const shouldAntspacePressureSuperflash = (
  pressure: number,
  status: string,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getAntspacePressureThresholds(data, containerSettings)

  return getShouldFlashWidgetFromThresholds(
    pressure,
    {
      criticalLow: thresholds.LOW,
      alarmLow: thresholds.LOW,
      normal: thresholds.MEDIUM_LOW,
      alarmHigh: thresholds.MEDIUM_HIGH,
      criticalHigh: thresholds.HIGH,
    },
    status,
  )
}

export const shouldAntspaceSupplyLiquidTempFlash = (
  currentTemp: number,
  status: string,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getAntspaceSupplyLiquidThresholds(data, containerSettings)

  return getShouldFlashFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alarmLow: thresholds.COLD,
      alert: thresholds.LIGHT_WARM,
      normal: thresholds.WARM,
      alarmHigh: thresholds.HOT,
      criticalHigh: thresholds.SUPERHOT,
    },
    status,
  )
}

export const shouldAntspaceSupplyLiquidTempSuperflash = (
  currentTemp: number,
  status: string,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getAntspaceSupplyLiquidThresholds(data, containerSettings)

  return getShouldFlashWidgetFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alarmLow: thresholds.COLD,
      alert: thresholds.LIGHT_WARM,
      normal: thresholds.WARM,
      alarmHigh: thresholds.HOT,
      criticalHigh: thresholds.SUPERHOT,
    },
    status,
  )
}

export const antspaceHydroHasAlarmingValue = (
  temp1: number,
  temp2: number,
  pressure1: number,
  pressure2: number,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
): { hasAlarm: boolean; isCriticallyHigh: boolean } => {
  const tempThresholds = getAntspaceSupplyLiquidThresholds(data, containerSettings)
  const pressureThresholds = getAntspacePressureThresholds(data, containerSettings)

  // Check container status - use getStats to properly extract status from container object
  const { status } = getStats(data) as { status: string }
  const isContainerStopped = status === CONTAINER_STATUS.STOPPED
  const isContainerOffline = status === CONTAINER_STATUS.OFFLINE

  // Critical high temp - should not trigger for offline/stopped containers
  const alarmingTemp =
    !isContainerStopped &&
    !isContainerOffline &&
    (temp1 >= tempThresholds.SUPERHOT || temp2 >= tempThresholds.SUPERHOT)

  // Critical low should trigger regardless of tank status, but not offline/stopped
  const alarmingTempLow =
    !isContainerStopped &&
    !isContainerOffline &&
    (temp1 < tempThresholds.COLD || temp2 < tempThresholds.COLD)

  // Critical high pressure - should not trigger for offline/stopped containers
  const alarmingPressure =
    !isContainerStopped &&
    !isContainerOffline &&
    (pressure1 >= pressureThresholds.HIGH || pressure2 >= pressureThresholds.HIGH)

  // Critical low pressure should trigger regardless of tank status, but not offline/stopped
  const alarmingPressureLow =
    !isContainerStopped &&
    !isContainerOffline &&
    (pressure1 < pressureThresholds.LOW || pressure2 < pressureThresholds.LOW)

  const hasAlarm = alarmingTemp || alarmingTempLow || alarmingPressure || alarmingPressureLow
  const isCriticallyHigh = alarmingTemp || alarmingPressure

  return { hasAlarm, isCriticallyHigh }
}
