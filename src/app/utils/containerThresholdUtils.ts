import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _isArray from 'lodash/isArray'
import _keys from 'lodash/keys'
import _startsWith from 'lodash/startsWith'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { COLOR } from '@/constants/colors'
import { CONTAINER_MODEL, THRESHOLD_LEVEL } from '@/constants/containerConstants'

export interface ContainerSetting {
  model?: string
  thresholds?: UnknownRecord
}

interface ThresholdKeyMapping {
  [key: string]: string
}

interface ThresholdTypeMapping {
  [thresholdType: string]: ThresholdKeyMapping
}

interface ThresholdKeyMappings {
  bitdeer: ThresholdTypeMapping
  microbt: ThresholdTypeMapping
  hydro: ThresholdTypeMapping
  immersion: ThresholdTypeMapping
}

/**
 * Gets dynamic thresholds for a container type from saved settings or falls back to defaults
 * @param containerType - Container type (e.g., "bd", "mbt", "hydro")
 * @param containerSettings - Array of container settings from API
 * @param defaultThresholds - Fallback default thresholds
 * @returns Thresholds to use
 */
export const getDynamicThresholds = <T extends UnknownRecord>(
  containerType: string,
  containerSettings: ContainerSetting[],
  defaultThresholds: T,
): T => {
  if (!containerType || !_isArray(containerSettings)) {
    return defaultThresholds
  }

  // Find container by matching the containerType to the container's threshold pattern
  const matchingContainer = _find(containerSettings, ({ model }) => {
    if (!model) return false

    // Use the helper function to get container type pattern
    const containerTypePattern = getContainerTypePattern(model)
    // Only return true if this container's pattern matches the requested containerType
    return containerTypePattern === containerType
  })

  if (matchingContainer?.thresholds && _keys(matchingContainer.thresholds).length > 0) {
    return matchingContainer.thresholds as T
  }

  return defaultThresholds
}

// Helper function to get container type pattern from full model string
const getContainerTypePattern = (fullModelString: string): string | null => {
  if (_startsWith(fullModelString, 'container-bd-')) return CONTAINER_MODEL.BITDEER_THRESHOLD
  if (_startsWith(fullModelString, 'container-mbt-')) return CONTAINER_MODEL.MICROBT_THRESHOLD
  if (_startsWith(fullModelString, 'container-as-hk3')) return CONTAINER_MODEL.HYDRO_THRESHOLD
  if (_startsWith(fullModelString, 'container-as-immersion'))
    return CONTAINER_MODEL.IMMERSION_THRESHOLD
  return null
}

export const THRESHOLD_KEY_MAPPINGS: ThresholdKeyMappings = {
  // Bitdeer mappings
  bitdeer: {
    oilTemperature: {
      COLD: 'criticalLow',
      LIGHT_WARM: 'alert',
      WARM: 'normal',
      HOT: 'alarm',
      SUPERHOT: 'criticalHigh',
    },
    tankPressure: {
      CRITICAL_LOW: 'criticalLow',
      MEDIUM_LOW: 'alarmLow',
      NORMAL: 'normal',
      MEDIUM_HIGH: 'alarmHigh',
      CRITICAL_HIGH: 'criticalHigh',
    },
  },
  // MicroBT mappings
  microbt: {
    waterTemperature: {
      COLD: 'criticalLow',
      LIGHT_WARM: 'alarmLow',
      WARM: 'alarmHigh',
      HOT: 'criticalHigh',
    },
  },
  // Hydro mappings
  hydro: {
    waterTemperature: {
      COLD: 'criticalLow',
      LIGHT_WARM: 'alarmLow',
      WARM: 'normal',
      HOT: 'alarmHigh',
      SUPERHOT: 'criticalHigh',
    },
    supplyLiquidPressure: {
      LOW: 'criticalLow',
      MEDIUM_LOW: 'alarmLow',
      MEDIUM_HIGH: 'alarmHigh',
      HIGH: 'criticalHigh',
    },
  },
  // Immersion mappings
  immersion: {
    oilTemperature: {
      COLD: 'criticalLow',
      LIGHT_WARM: 'alert',
      WARM: 'normal',
      HOT: 'alarm',
      SUPERHOT: 'criticalHigh',
    },
  },
}

/**
 * Transforms API threshold format to utility function format
 * @param containerType - Container type
 * @param apiThresholds - Thresholds from API
 * @returns Transformed thresholds for utility functions
 */
export const transformThresholdsForUtility = (
  containerType: keyof ThresholdKeyMappings,
  apiThresholds: Record<string, UnknownRecord>,
): Record<string, UnknownRecord> | null => {
  if (!apiThresholds || !THRESHOLD_KEY_MAPPINGS[containerType]) {
    return null
  }

  const mappings = THRESHOLD_KEY_MAPPINGS[containerType]
  const transformed: Record<string, UnknownRecord> = {}

  _forEach(_keys(mappings), (thresholdType: string) => {
    const keyMappings = mappings[thresholdType]
    if (apiThresholds[thresholdType]) {
      transformed[thresholdType] = {}
      _forEach(_keys(keyMappings), (utilityKey: string) => {
        const apiKey = keyMappings[utilityKey]
        if (
          apiThresholds[thresholdType][apiKey] !== undefined &&
          apiThresholds[thresholdType][apiKey] !== null
        ) {
          transformed[thresholdType][utilityKey] = apiThresholds[thresholdType][apiKey]
        }
      })
    }
  })

  return transformed
}

/**
 * Threshold state result from evaluation
 */
export interface ThresholdStateResult {
  state: (typeof THRESHOLD_LEVEL)[keyof typeof THRESHOLD_LEVEL]
  color: string
  shouldFlash: boolean
  shouldFlashWidget: boolean
}

/**
 * Generic threshold evaluation function that determines the state, color, and flash behavior
 * for any property value based on threshold configuration.
 *
 * Threshold ranges (inclusive lower bound, exclusive upper bound):
 * - Critical Low: value < criticalLow
 * - Alert: criticalLow <= value < alert (or criticalLow <= value < normal if alert not defined)
 * - Normal: alert <= value < normal (or normal <= value < alarm if alert == normal)
 * - Alarm: normal <= value < alarm (or alarm <= value < criticalHigh)
 * - Critical High: value >= criticalHigh
 *
 * @param currentValue - The current value to evaluate
 * @param thresholds - Threshold configuration object with keys: criticalLow, alert, normal, alarm, criticalHigh
 * @param isContainerStopped - Whether the container is stopped (affects flashing behavior)
 * @param isContainerOffline - Whether the container is offline (affects flashing behavior)
 * @returns ThresholdStateResult with state, color, and flash flags
 */
/**
 * Result from getColorAndTooltipFromThresholds
 */
export interface ColorAndTooltipResult {
  color: string
  tooltip: string
}

/**
 * Helper function to get color and tooltip based on thresholds and container status
 * Handles disabled/offline containers by returning white color with explanation tooltip
 */
export const getColorAndTooltipFromThresholds = (
  currentValue: number | undefined | null,
  thresholds: {
    criticalLow?: number
    alert?: number
    normal?: number
    alarm?: number
    criticalHigh?: number
    alarmLow?: number
    alarmHigh?: number
  },
  isDisabled: boolean = false,
  containerStatus?: string,
): ColorAndTooltipResult => {
  // Handle undefined/null values
  if (currentValue === undefined || currentValue === null) {
    return { color: '', tooltip: '' }
  }

  // If disabled, show white/default color with tooltip
  if (isDisabled) {
    return {
      color: COLOR.WHITE,
      tooltip: 'Value shown in white because the component is disabled',
    }
  }

  // If stopped/offline, show white/default color with tooltip
  if (containerStatus === CONTAINER_STATUS.STOPPED) {
    return {
      color: COLOR.WHITE,
      tooltip: 'Value shown in white because the container is stopped',
    }
  }

  if (containerStatus === CONTAINER_STATUS.OFFLINE) {
    return {
      color: COLOR.WHITE,
      tooltip: 'Value shown in white because the container is offline',
    }
  }

  // Use the evaluator to get the color
  const result = evaluateThresholdState(currentValue, thresholds, false, false)
  return { color: result.color, tooltip: '' }
}

/**
 * Helper function to get color based on thresholds and container status
 * Handles disabled/offline containers by returning white color
 */
export const getColorFromThresholds = (
  currentValue: number | undefined | null,
  thresholds: {
    criticalLow?: number
    alert?: number
    normal?: number
    alarm?: number
    criticalHigh?: number
    alarmLow?: number
    alarmHigh?: number
  },
  isDisabled: boolean = false,
  containerStatus?: string,
): string =>
  getColorAndTooltipFromThresholds(currentValue, thresholds, isDisabled, containerStatus).color

/**
 * Helper function to determine if text should flash based on thresholds
 * Returns true for critical low, alarm, and critical high states
 */
export const getShouldFlashFromThresholds = (
  currentValue: number | undefined | null,
  thresholds: {
    criticalLow?: number
    alert?: number
    normal?: number
    alarm?: number
    criticalHigh?: number
    alarmLow?: number
    alarmHigh?: number
  },
  containerStatus?: string,
): boolean => {
  if (currentValue === undefined || currentValue === null) {
    return false
  }

  const isContainerStopped = containerStatus === CONTAINER_STATUS.STOPPED
  const isContainerOffline = containerStatus === CONTAINER_STATUS.OFFLINE

  const result = evaluateThresholdState(
    currentValue,
    thresholds,
    isContainerStopped,
    isContainerOffline,
  )

  return result.shouldFlash
}

/**
 * Helper function to determine if widget should flash based on thresholds
 * Returns true only for critical low and critical high states
 */
export const getShouldFlashWidgetFromThresholds = (
  currentValue: number | undefined | null,
  thresholds: {
    criticalLow?: number
    alert?: number
    normal?: number
    alarm?: number
    criticalHigh?: number
    alarmLow?: number
    alarmHigh?: number
  },
  containerStatus?: string,
): boolean => {
  if (currentValue === undefined || currentValue === null) {
    return false
  }

  const isContainerStopped = containerStatus === CONTAINER_STATUS.STOPPED
  const isContainerOffline = containerStatus === CONTAINER_STATUS.OFFLINE

  const result = evaluateThresholdState(
    currentValue,
    thresholds,
    isContainerStopped,
    isContainerOffline,
  )

  return result.shouldFlashWidget
}

export const evaluateThresholdState = (
  currentValue: number | undefined | null,
  thresholds: {
    criticalLow?: number
    alert?: number
    normal?: number
    alarm?: number
    criticalHigh?: number
    alarmLow?: number
    alarmHigh?: number
  },
  isContainerStopped: boolean = false,
  isContainerOffline: boolean = false,
): ThresholdStateResult => {
  // Handle undefined/null values
  if (currentValue === undefined || currentValue === null) {
    return {
      state: THRESHOLD_LEVEL.NORMAL,
      color: COLOR.GREEN,
      shouldFlash: false,
      shouldFlashWidget: false,
    }
  }

  const { criticalLow, alert, normal, alarm, criticalHigh, alarmLow, alarmHigh } = thresholds

  // Check from most extreme to least extreme
  // Critical states always take priority

  // Critical High: value >= criticalHigh
  if (criticalHigh !== undefined && currentValue >= criticalHigh) {
    return {
      state: THRESHOLD_LEVEL.CRITICAL_HIGH,
      color: COLOR.RED,
      shouldFlash: !isContainerStopped && !isContainerOffline,
      shouldFlashWidget: !isContainerStopped && !isContainerOffline,
    }
  }

  // Critical Low: value < criticalLow
  if (criticalLow !== undefined && currentValue < criticalLow) {
    return {
      state: THRESHOLD_LEVEL.CRITICAL_LOW,
      color: COLOR.RED,
      shouldFlash: !isContainerStopped && !isContainerOffline,
      shouldFlashWidget: !isContainerStopped && !isContainerOffline,
    }
  }

  // Alarm High (for alternative threshold structure): value >= alarmHigh
  if (alarmHigh !== undefined && currentValue >= alarmHigh) {
    return {
      state: THRESHOLD_LEVEL.ALARM_HIGH,
      color: COLOR.ORANGE,
      shouldFlash: !isContainerStopped && !isContainerOffline,
      shouldFlashWidget: false,
    }
  }

  // Alarm (for standard threshold structure): value >= alarm
  if (alarm !== undefined && currentValue >= alarm) {
    return {
      state: THRESHOLD_LEVEL.ALARM,
      color: COLOR.ORANGE,
      shouldFlash: !isContainerStopped && !isContainerOffline,
      shouldFlashWidget: false,
    }
  }

  // Normal range: normal <= value < alarm
  if (normal !== undefined && currentValue >= normal) {
    return {
      state: THRESHOLD_LEVEL.NORMAL,
      color: COLOR.GREEN,
      shouldFlash: false,
      shouldFlashWidget: false,
    }
  }

  // Alarm Low (for alternative threshold structure): alarmLow <= value < normal
  if (alarmLow !== undefined && currentValue >= alarmLow) {
    return {
      state: THRESHOLD_LEVEL.ALARM_LOW,
      color: COLOR.GOLD,
      shouldFlash: !isContainerStopped && !isContainerOffline,
      shouldFlashWidget: false,
    }
  }

  // Alert range: criticalLow <= value < normal (when alert is defined)
  // This handles the case where alert == criticalLow, meaning everything between criticalLow and normal is alert
  if (
    alert !== undefined &&
    normal !== undefined &&
    currentValue >= alert &&
    currentValue < normal
  ) {
    return {
      state: THRESHOLD_LEVEL.ALERT,
      color: COLOR.GOLD,
      shouldFlash: false,
      shouldFlashWidget: false,
    }
  }

  // Fallback to normal if no specific threshold is met
  return {
    state: THRESHOLD_LEVEL.NORMAL,
    color: COLOR.GREEN,
    shouldFlash: false,
    shouldFlashWidget: false,
  }
}
