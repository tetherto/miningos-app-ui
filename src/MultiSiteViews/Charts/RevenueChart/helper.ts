import _capitalize from 'lodash/capitalize'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _isString from 'lodash/isString'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _reduce from 'lodash/reduce'
import _set from 'lodash/set'
import _some from 'lodash/some'
import _toArray from 'lodash/toArray'
import _toUpper from 'lodash/toUpper'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import { CURRENCY } from '@/constants/units'

interface DataEntry {
  timeKey: string
  period: string
  timestamp: number
  [key: string]: unknown
}

interface SiteItem {
  id: string
  name?: string
}

interface DatasetItem {
  label: string
  stackGroup: string
  [key: string]: unknown
}

interface DateDetail {
  date: string
  sum: number
  avgPerLabel: number
  labelCount: number
}

export const getMonthlyRevenueDataset = (
  data: DataEntry[],
  siteList: (string | SiteItem)[] = [],
): DatasetItem[] => {
  if (!data || data.length === 0) {
    return []
  }

  const firstEntry = data[0]
  const regionKeys = _keys(_omit(firstEntry, ['timeKey', 'period', 'timestamp']))
  const COLORS = ['LIGHT_BLUE', 'PURPLE', 'GREEN', 'ORANGE'] as const

  // Generate labels from siteList if available, otherwise fallback to capitalized region codes
  const LABELS = _map(regionKeys, (regionKey) => {
    const site = _find(siteList, (site) => {
      const siteId = _isString(site) ? site : site.id
      return _toUpper(siteId) === _toUpper(regionKey)
    })

    if (site && !_isString(site) && site.name) {
      return site.name
    }
    return _capitalize(regionKey)
  })

  return _map(regionKeys, (key, idx) =>
    _reduce(
      data,
      (acc, entry) => {
        const label = entry.timeKey
        _set(acc, label, {
          value: entry[key] || 0,
          style: getBarChartItemStyle(COLORS[idx % COLORS.length]),
          legendColor: getBarChartItemStyle(COLORS[idx % COLORS.length])?.backgroundColor,
        })
        return acc
      },
      {
        label: LABELS[idx],
        stackGroup: 'revenue',
      } as DatasetItem,
    ),
  )
}

/**
 * Checks if any date has average per label > 1, and converts dataset to SATS if needed.
 * If average is NEVER > 1 (all averages <= 1), converts all values to SATS (multiply by 1 million).
 * @param dataset - The dataset array with label objects containing date keys
 * @returns - { dataset: converted dataset, currencyUnit: 'BTC' | 'Sats' }
 */
export const processRevenueDataset = (
  dataset: DatasetItem[],
): { dataset: DatasetItem[]; currencyUnit: string } => {
  if (!dataset || dataset.length === 0) {
    return { dataset: [], currencyUnit: CURRENCY.BTC }
  }

  // Collect all date keys from all dataset objects
  const allDateKeys = new Set<string>()
  _forEach(dataset, (labelData) => {
    _forEach(_keys(_omit(labelData, ['label', 'stackGroup'])), (key) => {
      allDateKeys.add(key)
    })
  })

  // For each date, calculate average per label
  const dateDetails: DateDetail[] = []

  _forEach(_toArray(allDateKeys) as string[], (dateKey: string) => {
    let dateSum = 0
    let labelCount = 0

    _forEach(dataset, (labelData) => {
      const dateValue = labelData[dateKey] as { value?: number } | undefined
      if (dateValue?.value !== undefined) {
        const value = dateValue.value
        dateSum += value
        labelCount += 1
      }
    })

    const avgPerLabel = labelCount > 0 ? dateSum / labelCount : 0

    dateDetails.push({
      date: dateKey,
      sum: dateSum,
      avgPerLabel,
      labelCount,
    })
  })

  // Check if any date has average > 1
  const hasAverageAboveOne = _some(dateDetails, ({ avgPerLabel }) => avgPerLabel > 1)

  // If average is NEVER > 1 (all averages <= 1), convert all values to SATS (multiply by 1 million)
  if (!hasAverageAboveOne) {
    const convertedDataset = _map(dataset, (labelData) => {
      const convertedLabelData = { ...labelData }
      _forEach(_keys(_omit(convertedLabelData, ['label', 'stackGroup'])), (key) => {
        const dateValue = convertedLabelData[key] as { value?: number } | undefined
        if (dateValue?.value !== undefined) {
          convertedLabelData[key] = {
            ...dateValue,
            value: dateValue.value * 1000000,
          }
        }
      })
      return convertedLabelData
    })
    return { dataset: convertedDataset, currencyUnit: CURRENCY.SATS }
  }

  return { dataset, currencyUnit: CURRENCY.BTC }
}
