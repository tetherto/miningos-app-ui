import _gt from 'lodash/gt'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _isNumber from 'lodash/isNumber'

import { CURRENCY } from '@/constants/units'

interface ChartDataPoint {
  label?: string
  value?: number
}

/**
 * Determines the appropriate unit (BTC or Sats) for Bitcoin chart data
 * based on whether any data point exceeds 1 BTC
 */
export const getBtcChartUnit = (chartData: ChartDataPoint[]): string => {
  if (!chartData || !_isArray(chartData) || _isEmpty(chartData)) {
    return CURRENCY.SATS
  }

  const hasValueAboveOneBtc = chartData.some((dataPoint) => {
    const value = dataPoint?.value
    return _isNumber(value) && _gt(value, 1)
  })

  return hasValueAboveOneBtc ? CURRENCY.BTC : CURRENCY.SATS
}
