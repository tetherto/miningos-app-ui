import _find from 'lodash/find'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _meanBy from 'lodash/meanBy'

const WATTS_PER_MW = 1_000_000

interface DataPoint {
  ts: number
  val: {
    site_power_w?: number
    aggrIntervals?: number
    [key: string]: unknown
  }
}

interface RangeAggrResponse {
  type: string
  data?: DataPoint[]
  [key: string]: unknown
}

/**
 * Extracts powermeter data from tail log range aggregation response
 * @param response - Response from useGetTailLogRangeAggrQuery
 * @returns Array of powermeter data points or null if not found
 */
export const extractPowermeterData = (response: unknown): DataPoint[] | null => {
  if (!response) {
    return null
  }

  // Handle response format: can be nested array [[...]] or direct array [...]
  let arr: unknown
  if (_isArray(response)) {
    // If it's an array, check if first element is also an array (nested)
    const firstElement = _head(response)
    arr = _isArray(firstElement) ? firstElement : response
  } else {
    return null
  }

  if (!_isArray(arr) || _isEmpty(arr)) {
    return null
  }

  // Find powermeter data in the response
  const powermeter = _find(arr, (item: RangeAggrResponse) => item.type === 'powermeter')

  if (!powermeter?.data || !_isArray(powermeter.data)) {
    return null
  }

  return powermeter.data
}

/**
 * Calculates average power consumption in MW from powermeter data points
 * @param dataPoints - Array of data points with site_power_w values
 * @returns Average power consumption in MW
 */
export const calculateAveragePowerMW = (dataPoints: DataPoint[] | null): number => {
  if (!dataPoints || _isEmpty(dataPoints)) {
    return 0
  }

  // Calculate average from daily data points.
  const avgPowerConsumptionW =
    _meanBy(dataPoints, (item: DataPoint) => {
      const sitePowerW = _get(item.val, 'site_power_w', 0) as number
      const aggrIntervals = _get(item.val, 'aggrIntervals', 0) as number
      if (aggrIntervals && aggrIntervals > 0) return sitePowerW / aggrIntervals
      return sitePowerW
    }) || 0

  return avgPowerConsumptionW / WATTS_PER_MW
}

/**
 * Calculates average power consumption in MW from tail log range aggregation response
 * @param response - Response from useGetTailLogRangeAggrQuery
 * @returns Average power consumption in MW
 */
export const calculateAvgPowerConsumptionMW = (response: unknown): number => {
  const powermeterData = extractPowermeterData(response)
  return calculateAveragePowerMW(powermeterData)
}
