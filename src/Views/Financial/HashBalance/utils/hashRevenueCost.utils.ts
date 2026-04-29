import _entries from 'lodash/entries'
import _forEach from 'lodash/forEach'
import _isNil from 'lodash/isNil'
import _isNull from 'lodash/isNull'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _reduce from 'lodash/reduce'
import _trim from 'lodash/trim'

import { NON_METRIC_KEYS } from '../HashBalance.constants'

/**
 * Reduce a log array to { sum, avg } objects keyed by metric name.
 * Used by Reports/OperationsEfficiency (single-site) to aggregate EfficiencySiteView data.
 */
export const getLogSummary = (log: unknown[] = []) => {
  const allNonMetricKeys = new Set<string>([...NON_METRIC_KEYS])

  const summaryData = _reduce(
    log,
    (acc, entry) => {
      _forEach(_entries(entry as Record<string, unknown>), ([key, val]) => {
        if (allNonMetricKeys.has(key)) return

        const numVal = _isNumber(val) ? val : parseFloat(String(val))
        const isMissing = _isNil(val) || (_isString(val) && _trim(val) === '')

        if (!(key in acc.sum)) {
          acc.sum[key] = isMissing ? null : numVal
        } else if (_isNull(acc.sum[key])) {
          acc.sum[key] = isMissing ? null : numVal
        } else {
          const valueToAdd = isMissing ? 0 : numVal
          if (Number.isFinite(valueToAdd)) {
            acc.sum[key] += valueToAdd
          }
        }
      })

      acc.count++
      return acc
    },
    { sum: {} as Record<string, number | null>, count: 0 },
  )

  const avg: Record<string, number | null> = {}
  _forEach(_entries(summaryData.sum), ([key, val]) => {
    avg[key] = summaryData.count > 0 && val !== null ? val / summaryData.count : null
  })

  return { sum: summaryData.sum, avg }
}
