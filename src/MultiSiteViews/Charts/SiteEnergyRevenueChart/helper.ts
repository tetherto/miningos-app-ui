import { format } from 'date-fns/format'
import _every from 'lodash/every'
import _forEach from 'lodash/forEach'
import _isArray from 'lodash/isArray'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _reduce from 'lodash/reduce'
import _set from 'lodash/set'

import {
  CURRENCY_KEY_MAP,
  CURRENCY_LABEL_MAP,
  CURRENCY_SYMBOL_MAP,
} from './SiteEnergyRevenueChart.const'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import type { BarChartDataset } from '@/Components/BarChart/BarChart'
import { CURRENCY as CURRENCY_UNITS, UNITS } from '@/constants/units'
import { CURRENCY } from '@/MultiSiteViews/constants'

interface SiteEnergyRevenueDataItem {
  ts: number
  energyRevenueUSD_MW?: number | null
  energyRevenueBTC_MW?: number | null
}

interface ProcessedDatasetResult {
  dataset: BarChartDataset[]
  unit: string
}

export const formatTimestampToYYYYMMDD = (timestamp: number): string => {
  const date = new Date(timestamp)
  return format(date, 'yyyy-MM-dd')
}

export const getDatasets = (
  data: SiteEnergyRevenueDataItem[],
  currency: typeof CURRENCY.BTC | typeof CURRENCY.USD,
): BarChartDataset[] => {
  const currencyKey = `${CURRENCY_KEY_MAP[currency]}_MW`

  const currencyLabel = CURRENCY_LABEL_MAP[currency]
  const color = currency === CURRENCY.USD ? 'BLUE' : 'RED'

  const hasNoValidData = _every(
    data,
    (entry) => entry[currencyKey as keyof SiteEnergyRevenueDataItem] === null,
  )

  if (hasNoValidData) {
    return []
  }

  return [
    _reduce(
      data,
      (acc, entry) => {
        const dateLabel = formatTimestampToYYYYMMDD(entry.ts)
        const value = entry[currencyKey as keyof SiteEnergyRevenueDataItem] as
          | number
          | null
          | undefined

        _set(acc, dateLabel, {
          value,
          style: getBarChartItemStyle(color),
          legendColor: getBarChartItemStyle(color)?.backgroundColor,
        })
        acc.label = currencyLabel

        return acc
      },
      {} as BarChartDataset,
    ),
  ]
}

export const getCurrencySymbol = (currency: typeof CURRENCY.BTC | typeof CURRENCY.USD): string =>
  CURRENCY_SYMBOL_MAP[currency]

const BTC_TO_SATS_MULTIPLIER = 1_000_000
const BTC_THRESHOLD = 1

/**
 * Checks if any value in the dataset for any date/label is above 1 BTC.
 * If none of the values are above 1 BTC, converts all values to Sats (multiplies by 1,000,000).
 *
 * @param dataset - The dataset array from getDatasets, where each object has date keys as properties
 *                  Each date key contains an object with a `value` property
 * @returns { dataset: processed dataset, unit: 'BTC/MWh' | 'Sats/MWh' }
 */
export const processBtcDatasetForSatsConversion = (
  dataset: BarChartDataset[] | null | undefined,
): ProcessedDatasetResult => {
  if (!dataset || dataset.length === 0) {
    return { dataset: [], unit: `${CURRENCY_UNITS.BTC}/${UNITS.ENERGY_MWH}` }
  }

  // Collect all date keys from all dataset objects (excluding 'label' property)
  const allDateKeys = new Set<string>()
  _forEach(dataset, (labelData) => {
    _forEach(_keys(_omit(labelData, ['label'])), (key) => {
      allDateKeys.add(key)
    })
  })

  // Check if any value for any date is above 1 BTC
  let hasValueAboveThreshold = false

  _forEach(dataset, (labelData) => {
    _forEach(Array.from(allDateKeys), (dateKey) => {
      const dataItem = labelData[dateKey]
      if (
        dataItem &&
        _isObject(dataItem) &&
        !_isArray(dataItem) &&
        'value' in dataItem &&
        _isNumber(dataItem.value) &&
        dataItem.value > BTC_THRESHOLD
      ) {
        hasValueAboveThreshold = true
      }
    })
  })

  // If no values are above 1 BTC, convert all values to Sats
  if (!hasValueAboveThreshold) {
    const convertedDataset = _map(dataset, (labelData) => {
      const convertedLabelData = { ...labelData }

      _forEach(Array.from(allDateKeys), (dateKey) => {
        const dataItem = convertedLabelData[dateKey]
        if (
          dataItem &&
          _isObject(dataItem) &&
          !_isArray(dataItem) &&
          'value' in dataItem &&
          _isNumber(dataItem.value)
        ) {
          convertedLabelData[dateKey] = {
            ...dataItem,
            value: dataItem.value * BTC_TO_SATS_MULTIPLIER,
          }
        }
      })

      return convertedLabelData
    })

    return {
      dataset: convertedDataset,
      unit: `${CURRENCY_UNITS.SATS}/${UNITS.ENERGY_MWH}`,
    }
  }

  return {
    dataset,
    unit: `${CURRENCY_UNITS.BTC}/${UNITS.ENERGY_MWH}`,
  }
}
