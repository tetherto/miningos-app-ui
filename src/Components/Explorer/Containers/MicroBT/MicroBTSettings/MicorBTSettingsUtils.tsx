import {
  getColorFromThresholds,
  getShouldFlashFromThresholds,
  transformThresholdsForUtility,
} from '@/app/utils/containerThresholdUtils'
import { getContainerSpecificStats } from '@/app/utils/deviceUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { CONTAINER_MODEL } from '@/constants/containerConstants'

interface MicroBTTempThresholds extends UnknownRecord {
  COLD: number
  LIGHT_WARM: number
  WARM: number
  HOT: number
}

const DEFAULT_MICROBT_TEMP_THRESHOLDS: MicroBTTempThresholds = {
  COLD: 25,
  LIGHT_WARM: 33,
  WARM: 37,
  HOT: 39,
}

const getMicroBTTempThresholds = (
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
): MicroBTTempThresholds => {
  if (!containerSettings?.thresholds) {
    return DEFAULT_MICROBT_TEMP_THRESHOLDS
  }

  const transformed = transformThresholdsForUtility(
    CONTAINER_MODEL.MICROBT_THRESHOLD,
    containerSettings.thresholds as Record<string, UnknownRecord>,
  )

  if (transformed?.waterTemperature) {
    const waterTemp = transformed.waterTemperature as UnknownRecord
    return {
      COLD: (waterTemp.COLD as number) ?? DEFAULT_MICROBT_TEMP_THRESHOLDS.COLD,
      LIGHT_WARM: (waterTemp.LIGHT_WARM as number) ?? DEFAULT_MICROBT_TEMP_THRESHOLDS.LIGHT_WARM,
      WARM: (waterTemp.WARM as number) ?? DEFAULT_MICROBT_TEMP_THRESHOLDS.WARM,
      HOT: (waterTemp.HOT as number) ?? DEFAULT_MICROBT_TEMP_THRESHOLDS.HOT,
    }
  }

  return DEFAULT_MICROBT_TEMP_THRESHOLDS
}

export const MICROBT_WATER_TEMP_MIN_BY_CHARACTER_MAP = {
  'Critical Low': -Infinity,
  'Alarm Low': DEFAULT_MICROBT_TEMP_THRESHOLDS.COLD,
  Normal: DEFAULT_MICROBT_TEMP_THRESHOLDS.LIGHT_WARM,
  'Alarm High': DEFAULT_MICROBT_TEMP_THRESHOLDS.WARM,
  'Critical High': DEFAULT_MICROBT_TEMP_THRESHOLDS.HOT,
}

export const getMicroBTThresholdSettingsData = (data: UnknownRecord) => {
  const containerStats = getContainerSpecificStats(data as Device)
  const cdu = (containerStats?.cdu as UnknownRecord) || {}

  return {
    coolingFanRunningSpeedThreshold: cdu.cooling_fan_running_speed_threshold as number | undefined,
    coolingFanStartTemperatureThreshold: cdu.cooling_fan_start_temperature_threshold as
      | number
      | undefined,
    coolingFanStopTemperatureThreshold: cdu.cooling_fan_stop_temperature_threshold as
      | number
      | undefined,
  }
}

export const getMicroBtInletTempColor = (
  currentTemp: number,
  isCoolingEnabled: boolean,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getMicroBTTempThresholds(data, containerSettings)

  return getColorFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alarmLow: thresholds.COLD,
      normal: thresholds.LIGHT_WARM,
      alarmHigh: thresholds.WARM,
      criticalHigh: thresholds.HOT,
    },
    !isCoolingEnabled, // disabled if cooling is not enabled
  )
}

export const shouldMicroBtTemperatureFlash = (
  currentTemp: number,
  isCoolingEnabled: boolean,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  // If cooling is disabled, don't flash
  if (!isCoolingEnabled) {
    return false
  }

  const thresholds = getMicroBTTempThresholds(data, containerSettings)

  const status = data?.status as string

  return getShouldFlashFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alarmLow: thresholds.COLD,
      normal: thresholds.LIGHT_WARM,
      alarmHigh: thresholds.WARM,
      criticalHigh: thresholds.HOT,
    },
    status,
  )
}

export const shouldMicroBtTemperatuerSuperflash = (
  currentTemp: number,
  isCoolingEnabled: boolean,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
): boolean =>
  // Superflash logic is the same as alarming value logic for MicroBT
  microBtHasAlarmingValue(currentTemp, data, containerSettings).hasAlarm

export const microBtHasAlarmingValue = (
  currentTemp: number,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
): { hasAlarm: boolean; isCriticallyHigh: boolean } => {
  const thresholds = getMicroBTTempThresholds(data, containerSettings)
  const status = data?.status as string
  const isContainerStopped = status === CONTAINER_STATUS.STOPPED
  const isContainerOffline = status === CONTAINER_STATUS.OFFLINE

  // Critical low should trigger regardless of cooling status, but not offline/stopped
  const isCriticalLow = !isContainerStopped && !isContainerOffline && currentTemp < thresholds.COLD
  // Critical high should also not trigger for offline/stopped containers
  const isCriticalHigh = !isContainerStopped && !isContainerOffline && currentTemp >= thresholds.HOT

  const hasAlarm = isCriticalLow || isCriticalHigh
  const isCriticallyHigh = isCriticalHigh

  return { hasAlarm, isCriticallyHigh }
}
