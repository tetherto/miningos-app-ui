import _isNumber from 'lodash/isNumber'
import _some from 'lodash/some'

import {
  getColorFromThresholds,
  getShouldFlashFromThresholds,
  getShouldFlashWidgetFromThresholds,
  transformThresholdsForUtility,
} from '@/app/utils/containerThresholdUtils'
import { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { CONTAINER_MODEL } from '@/constants/containerConstants'

const DEFAULT_IMMERSION_TEMP_THRESHOLDS = {
  COLD: 33,
  LIGHT_WARM: 42,
  WARM: 46,
  HOT: 48,
  SUPERHOT: 48, // Default to same as HOT if not provided
} as Record<string, number>

const getImmersionTempThresholds = (
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  if (!containerSettings?.thresholds) {
    return DEFAULT_IMMERSION_TEMP_THRESHOLDS
  }

  const transformed = transformThresholdsForUtility(
    CONTAINER_MODEL.IMMERSION_THRESHOLD,
    containerSettings.thresholds as Record<string, UnknownRecord>,
  )

  if (transformed?.oilTemperature) {
    return transformed.oilTemperature
  }

  return DEFAULT_IMMERSION_TEMP_THRESHOLDS
}

export const BITMAIN_IMMERSION_OIL_TEMP_MIN_BY_CHARACTER_MAP = {
  'Critical Low': -Infinity,
  Alert: DEFAULT_IMMERSION_TEMP_THRESHOLDS.COLD,
  Normal: DEFAULT_IMMERSION_TEMP_THRESHOLDS.LIGHT_WARM,
  Alarm: DEFAULT_IMMERSION_TEMP_THRESHOLDS.WARM,
  'Critical High': DEFAULT_IMMERSION_TEMP_THRESHOLDS.HOT,
}

export const getImmersionTemperatureColor = (
  currentTemp: number,
  containerStatus: string,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getImmersionTempThresholds(data, containerSettings) as Record<string, number>

  // Logic: Everything between COLD and LIGHT_WARM should be YELLOW (alert)
  return getColorFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alert: thresholds.COLD, // Alert starts where critical low ends
      normal: thresholds.LIGHT_WARM,
      alarm: thresholds.WARM,
      criticalHigh: thresholds.HOT,
    },
    false,
    containerStatus,
  )
}

export const shouldImmersionTemperatureFlash = (
  currentTemp: number,
  containerStatus: string,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getImmersionTempThresholds(data, containerSettings) as Record<string, number>

  return getShouldFlashFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alert: thresholds.COLD,
      normal: thresholds.LIGHT_WARM,
      alarm: thresholds.WARM,
      criticalHigh: thresholds.HOT,
    },
    containerStatus,
  )
}

export const shouldImmersionTemperatureSuperflash = (
  currentTemp: number,
  containerStatus: string,
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
) => {
  const thresholds = getImmersionTempThresholds(data, containerSettings) as Record<string, number>

  return getShouldFlashWidgetFromThresholds(
    currentTemp,
    {
      criticalLow: thresholds.COLD,
      alert: thresholds.COLD,
      normal: thresholds.LIGHT_WARM,
      alarm: thresholds.WARM,
      criticalHigh: thresholds.HOT,
    },
    containerStatus,
  )
}

export const immersionHasAlarmingValue = (
  data: UnknownRecord,
  containerSettings: UnknownRecord | null = null,
): { hasAlarm: boolean; isCriticallyHigh: boolean } => {
  const thresholds = getImmersionTempThresholds(data, containerSettings) as Record<string, number>
  const { primary_supply_temp, second_supply_temp1, second_supply_temp2, status } = data
  const isPrimaryCirculatingPumpAlarmOn = data?.primary_circulating_pump

  // Check container status
  const isContainerStopped = status === CONTAINER_STATUS.STOPPED
  const isContainerOffline = status === CONTAINER_STATUS.OFFLINE

  // Trigger whole card flash ONLY for critical values (red), not alarm/alert (orange/yellow/green)
  // Temperature: critical high is ONLY SUPERHOT (if exists) - never use HOT as fallback
  // HOT is alarm level (orange), not critical (red)

  // Critical low should trigger regardless of tank status, but not offline/stopped
  const anyTempCriticalLow =
    !isContainerStopped &&
    !isContainerOffline &&
    _some(
      [primary_supply_temp, second_supply_temp1, second_supply_temp2],
      (temp: unknown) => _isNumber(temp) && temp < thresholds.COLD,
    )

  // Critical high should also not trigger for offline/stopped containers
  // Only check SUPERHOT - never use HOT as fallback (HOT is alarm/orange, not critical/red)
  const superhotThreshold = thresholds.SUPERHOT
  const anyTempCriticalHigh =
    !isContainerStopped &&
    !isContainerOffline &&
    superhotThreshold !== undefined &&
    _some(
      [primary_supply_temp, second_supply_temp1, second_supply_temp2],
      (temp: unknown) => _isNumber(temp) && temp >= superhotThreshold,
    )

  const hasAlarm = !!isPrimaryCirculatingPumpAlarmOn || anyTempCriticalLow || anyTempCriticalHigh
  const isCriticallyHigh = anyTempCriticalHigh

  return { hasAlarm, isCriticallyHigh }
}
