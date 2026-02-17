import _filter from 'lodash/filter'
import _isFinite from 'lodash/isFinite'
import _isNil from 'lodash/isNil'
import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _set from 'lodash/set'
import _sum from 'lodash/sum'
import _values from 'lodash/values'

import { getHashrateUnit } from '@/app/utils/deviceUtils'
import { COLOR } from '@/constants/colors'

interface AggregatedMinersData {
  ts: number | string
  online: number
  error: number
  notMining: number
  offline: number
  sleep: number
  maintenance: number
}

interface MinersDatasetItem {
  label: string
  stackGroup: string
  [key: string]: unknown
}

interface TransformedMinersData {
  dataset: MinersDatasetItem[]
}

/**
 * Sums all values in an object (used for offline_cnt, not_mining_cnt, maintenance_type_cnt)
 * @param obj - Object with numeric values
 * @returns Sum of all values
 */
export const sumObjectValues = (obj: Record<string, number> | null | undefined): number => {
  if (!obj || !_isObject(obj)) return 0

  return _sum(_filter(_values(obj), _isFinite))
}

/**
 * Parses a timestamp value and returns a valid Date object or null
 * Handles:
 * - Numeric timestamps (milliseconds)
 * - String dates (e.g., "2025-11-01")
 * - ISO date strings
 * - Range strings (e.g., "1761955200000-1762041599999") - uses the start timestamp
 */
const parseTimestamp = (ts: number | string | undefined | null): Date | null => {
  if (_isNil(ts)) {
    return null
  }

  // Handle string timestamps
  if (_isString(ts)) {
    // Check if it's a range string (e.g., "1761955200000-1762041599999")
    // The format is "startTimestamp-endTimestamp" where timestamps are numeric
    if (ts.includes('-') && /^\d+-\d+$/.test(ts)) {
      const startTs = ts.split('-')[0]
      const numericTs = Number(startTs)
      if (_isFinite(numericTs)) {
        const date = new Date(numericTs)
        if (!isNaN(date.getTime())) {
          return date
        }
      }

      return null
    }

    // Try parsing as-is first (ISO date strings like "2025-11-01")
    let date = new Date(ts)
    if (!isNaN(date.getTime())) {
      return date
    }
    // Try parsing as a number (in case it's a numeric string)
    const numericTs = Number(ts)
    if (_isFinite(numericTs)) {
      date = new Date(numericTs)
      if (!isNaN(date.getTime())) {
        return date
      }
    }

    return null
  }

  // Handle numeric timestamps
  if (!_isFinite(ts)) {
    return null
  }

  const date = new Date(ts)

  if (isNaN(date.getTime())) {
    return null
  }

  return date
}

/**
 * Formats a timestamp as MM-DD for x-axis labels
 * Handles both numeric timestamps and ISO date strings
 * Returns null if timestamp is invalid
 */
const formatTimestampLabel = (ts: number | string | undefined | null): string | null => {
  const date = parseTimestamp(ts)
  if (!date) {
    return null
  }

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${month}-${day}`
}

/**
 * Transforms miners status data for stacked bar chart
 * @param aggregatedData - Data aggregated by day
 * @returns BarChart compatible dataset with style objects
 */
export const transformMinersStatusData = (
  aggregatedData: AggregatedMinersData[] | null | undefined,
): TransformedMinersData => {
  if (!Array.isArray(aggregatedData) || aggregatedData.length === 0) {
    return { dataset: [] }
  }

  // Define status configurations with colors matching Figma design
  const statusConfigs = [
    {
      key: 'online' as const,
      label: 'Online',
      backgroundColor: [`${COLOR.STRONG_GREEN}4d`, `${COLOR.STRONG_GREEN}1a`], // green gradient (30% to 10% opacity)
      borderColor: COLOR.STRONG_GREEN,
      legendColor: COLOR.STRONG_GREEN,
    },
    {
      key: 'notMining' as const,
      label: 'Not Mining (Sleep + Error)',
      backgroundColor: [`${COLOR.RED}4d`, `${COLOR.RED}1a`], // red gradient (30% to 10% opacity)
      borderColor: COLOR.RED,
      legendColor: COLOR.RED,
    },
    {
      key: 'offline' as const,
      label: 'Offline',
      backgroundColor: [`${COLOR.WHITE}4d`, `${COLOR.WHITE}1a`], // white gradient (30% to 10% opacity)
      borderColor: COLOR.WHITE,
      legendColor: COLOR.WHITE,
    },
    {
      key: 'maintenance' as const,
      label: 'Maintenance',
      backgroundColor: [`${COLOR.ORANGE_WARNING}4d`, `${COLOR.ORANGE_WARNING}1a`], // orange gradient (30% to 10% opacity)
      borderColor: COLOR.ORANGE_WARNING,
      legendColor: COLOR.ORANGE_WARNING,
    },
  ]

  // Filter out entries with invalid timestamps
  const validData = aggregatedData.filter((entry) => formatTimestampLabel(entry.ts) !== null)

  if (validData.length === 0) {
    return { dataset: [] }
  }

  // Transform data to match Revenue chart format
  const dataset = _map(statusConfigs, (config) =>
    _reduce(
      validData,
      (acc, entry) => {
        // Format timestamp as MM-DD for x-axis labels
        const label = formatTimestampLabel(entry.ts)!

        _set(acc, label, {
          value: entry[config.key] || 0,
          style: {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
            borderWidth: { top: 2 },
            legendColor: config.legendColor,
          },
        })
        return acc
      },
      {
        label: config.label,
        stackGroup: 'miners',
        legendColor: config.legendColor,
      } as MinersDatasetItem,
    ),
  )

  return { dataset }
}

/**
 * Gets the appropriate unit for a hashrate value
 * @param value - Hashrate in MH/s
 * @returns Unit (e.g., 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s')
 */
export const getHashrateDisplayUnit = (value: number | null | undefined): string => {
  if (!value) return ''

  const { unit } = getHashrateUnit(value)

  return unit
}

/**
 * Creates a hashrate formatter that converts values to a specific unit
 * @param targetUnit - Target unit (e.g., 'TH/s', 'PH/s')
 * @returns Formatter function that takes a value in MH/s and returns formatted string
 */
export const createHashrateFormatter =
  (targetUnit: string) =>
  (value: number | null | undefined): string => {
    if (!value) return '0'
    const { value: formattedValue } = getHashrateUnit(value, 2, targetUnit)

    return formattedValue?.toFixed(2) ?? '0'
  }

/**
 * Formats power consumption for display
 * @param value - Power in watts
 * @returns Formatted power value only (without unit)
 */
export const formatPowerConsumption = (value: number | null | undefined): string => {
  if (!value) return '0'

  const mw = value / 1000000 // Convert W to MW

  return mw.toFixed(2)
}

/**
 * Formats efficiency for display
 * @param value - Efficiency in W/TH/s
 * @returns Formatted efficiency value only (without unit)
 */
export const formatEfficiency = (value: number | null | undefined): string => {
  if (!value) return '0'

  return value.toFixed(2)
}
