import _isNil from 'lodash/isNil'

import { getHashrateUnit } from '@/app/utils/deviceUtils'
import { HEATMAP_MODE } from '@/constants/temperatureConstants'
import { UNITS } from '@/constants/units'

type RangeKey = 'min' | 'max'
type Ranges = Record<string, { min?: number; max?: number }>

/**
 * Returns the appropriate unit string based on the heatmap mode and value.
 * For hashrate, dynamically determines the unit based on the max value.
 */
export const getHeatmapUnit = (mode: string, ranges?: Ranges): string => {
  if (mode === HEATMAP_MODE.HASHRATE) {
    const maxValue = ranges?.[mode]?.max
    if (maxValue !== undefined && maxValue !== null && Number.isFinite(maxValue)) {
      const { unit } = getHashrateUnit(maxValue)
      return unit || UNITS.HASHRATE_TH_S
    }
    return UNITS.HASHRATE_TH_S
  }
  return UNITS.TEMPERATURE_C
}

/**
 * Extracts and rounds a range value (min or max) for the given mode.
 * For hashrate mode, converts MH/s to the appropriate unit (TH/s, PH/s, etc.)
 * Returns '-' if the value is unavailable.
 */
export const getHeatmapRangeValue = (
  ranges: Ranges | undefined,
  mode: string,
  key: RangeKey,
): string | number => {
  if (!ranges || !mode) return '-'
  const range = ranges[mode]
  const value = range?.[key]
  if (_isNil(value) || !Number.isFinite(value)) return '-'

  if (mode === HEATMAP_MODE.HASHRATE) {
    // Get the max value to determine the unit to use for both min and max
    const maxValue = ranges[mode]?.max
    if (maxValue !== undefined && maxValue !== null && Number.isFinite(maxValue)) {
      const { unit } = getHashrateUnit(maxValue)
      // Force the same unit for both min and max for consistency
      const { value: formattedValue } = getHashrateUnit(value, 2, unit || null)
      return formattedValue !== null ? formattedValue : '-'
    }

    return '-'
  }

  return Math.round(value)
}
