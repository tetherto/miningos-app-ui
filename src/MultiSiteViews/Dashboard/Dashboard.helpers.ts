import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _meanBy from 'lodash/meanBy'
import _omit from 'lodash/omit'
import _some from 'lodash/some'
import _toUpper from 'lodash/toUpper'
import _values from 'lodash/values'

import type {
  DashboardApiResponse,
  MetricsState,
  RegionItem,
  RegionSource,
} from './Dashboard.types'

import { CURRENCY } from '@/constants/units'
import { ALL_SITES } from '@/MultiSiteViews/constants'

export const DASHBOARD_DURATIONS = {
  YEARLY: 'year',
  MONTHLY: 'month',
  WEEKLY: 'week',
} as const

export const DASHBOARD_NAMES: Record<string, string> = {
  [DASHBOARD_DURATIONS.YEARLY]: 'Year to Date',
  [DASHBOARD_DURATIONS.MONTHLY]: 'Month to Date',
  [DASHBOARD_DURATIONS.WEEKLY]: 'Week to Date',
}

interface DurationOption {
  id: string
  label: string
}

export const dashboardDurationOptions: DurationOption[] = _map(
  _values(DASHBOARD_DURATIONS),
  (value: string) => ({
    id: value,
    label: DASHBOARD_NAMES[value],
  }),
)

export const readRegionValue = (
  regionItem: RegionItem | null,
  regionSource?: RegionSource,
): number => {
  if (!regionItem) return 0
  const { kind, field, path } = regionSource || {}

  switch (kind) {
    case 'logMean':
      return _meanBy(regionItem.log || [], field) || 0
    case 'summaryPath':
      return _get(regionItem.summary, path!, 0)
    default:
      return 0
  }
}

interface UpdateConfig {
  metricKey: string
  regionSource?: RegionSource
  allSitesPath?: (string | number)[]
}

export const updateMetricFromData = (
  prevMetrics: MetricsState,
  data: DashboardApiResponse | null,
  cfg: UpdateConfig,
): MetricsState => {
  if (!data) return prevMetrics
  const { metricKey, regionSource, allSitesPath } = cfg

  _forEach(data.regions, (item: RegionItem) => {
    const regionKey = _toUpper(item.region || '')
    const container = _get(prevMetrics, [regionKey, metricKey])
    if (!container) return
    container.value = readRegionValue(item, regionSource)
  })

  const allSitesKey = _toUpper(ALL_SITES)
  const allTarget = _get(prevMetrics, [allSitesKey, metricKey])
  if (allTarget) {
    allTarget.value = _get(data, allSitesPath!, 0)
  }

  return { ...prevMetrics }
}

/**
 * Processes the revenue dataset to determine currency unit (BTC or SATS).
 * If the average of the sum of values for any label is above 1M SATS (1 BTC), use BTC, otherwise use SATS.
 * If using SATS, all values are multiplied by 1,000,000.
 * @param {Array} dataset - The dataset array with label objects containing date keys
 * @returns {Object} - { dataset: processed dataset, currencyUnit: 'BTC' | 'Sats' }
 */
export const processRevenueDatasetWith1MThreshold = (
  dataset: Record<string, unknown>[] | null | undefined,
) => {
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
  const dateDetails: Array<{ date: string; sum: number; avgPerLabel: number; labelCount: number }> =
    []

  _forEach(Array.from(allDateKeys), (dateKey: string) => {
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

  // Check if any date has average > 1,000,000 SATS (1 BTC)
  // Since values are in BTC, we check if average > 1
  const THRESHOLD_BTC = 1 // 1 BTC = 1,000,000 SATS
  const hasAverageAboveThreshold = _some(
    dateDetails,
    ({ avgPerLabel }) => avgPerLabel > THRESHOLD_BTC,
  )

  // If average is NEVER > 1 BTC (all averages <= 1 BTC), convert all values to SATS (multiply by 1 million)
  if (!hasAverageAboveThreshold) {
    const convertedDataset = _map(dataset, (labelData) => {
      const convertedLabelData = { ...labelData }
      _forEach(_keys(_omit(convertedLabelData, ['label', 'stackGroup'])), (key) => {
        const dateValue = convertedLabelData[key] as { value?: number } | undefined
        if (dateValue?.value !== undefined) {
          convertedLabelData[key] = {
            ...dateValue,
            value: dateValue.value * 1_000_000,
          }
        }
      })
      return convertedLabelData
    })
    return { dataset: convertedDataset, currencyUnit: CURRENCY.SATS }
  }

  return { dataset, currencyUnit: CURRENCY.BTC }
}
