import _filter from 'lodash/filter'
import _forEach from 'lodash/forEach'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _some from 'lodash/some'

import { formatChartDate } from '@/app/utils/format'
import { COLOR } from '@/constants/colors'
import { CURRENCY } from '@/constants/units'
import { getLineDatasetByKey, getStackedComparisonDataset } from '@/MultiSiteViews/Charts/helper'

export const adaptRevenueData = (rawData, isChartDateShort) =>
  _map(
    _filter(rawData, (item) => item.totalRevenueBTC && item.totalRevenueBTC !== 0),
    (item) => {
      const totalRevenue = item.totalRevenueBTC || 0
      const fees = item.totalFeesBTC || 0
      const subsidyRaw = totalRevenue - fees
      const subsidy = subsidyRaw > 0 ? subsidyRaw : 0
      const feePercent = totalRevenue ? Math.min(1, fees / totalRevenue) : 0
      const date = formatChartDate(item.ts, !isChartDateShort)

      return {
        month: date,
        fees,
        subsidy,
        feePercent,
      }
    },
  )

export const getDataset = (data) =>
  getStackedComparisonDataset(data, {
    keyA: 'subsidy',
    keyB: 'fees',
    labels: {
      subsidy: 'Subsidy',
      fees: 'Fees',
    },
    colors: {
      subsidy: 'BLUE',
      fees: 'PURPLE',
    },
  })

export const getFeePercentLineDataset = (data) =>
  getLineDatasetByKey(data, {
    key: 'feePercent',
    label: 'Fee %',
    color: COLOR.RED,
    yAxisID: 'y1',
  })

/**
 * Processes raw revenue data and converts to appropriate currency unit (BTC or SATS).
 * Checks if the sum of values (subsidy + fees) for any month is above 1 BTC.
 * If any month has sum > 1 BTC, uses BTC for all values. Otherwise, converts all values to SATS.
 * @param {Array} data - The raw revenue data array with ts, totalRevenueBTC, and totalFeesBTC
 * @param {boolean} isDateShort - Whether to use short date format
 * @returns {Object} - { dataset: processed dataset, lineDataset: processed lineDataset, currencyUnit: 'BTC' | 'Sats' }
 */
export const processSubsidyFeesDataset = (data, isDateShort) => {
  const adaptedData = adaptRevenueData(data, isDateShort)
  const dataset = getDataset(adaptedData)
  const lineDataset = getFeePercentLineDataset(adaptedData)

  if (!adaptedData || adaptedData.length === 0) {
    return { dataset, lineDataset, currencyUnit: CURRENCY.BTC }
  }

  // Check if any month has sum (subsidy + fees) > 1 BTC
  const hasAnyMonthAboveOne = _some(adaptedData, (entry) => {
    const sum = (entry.subsidy || 0) + (entry.fees || 0)
    return sum > 1
  })

  // If no month has sum > 1 BTC, convert all values to SATS (multiply by 1,000,000)
  if (!hasAnyMonthAboveOne) {
    const SATS_MULTIPLIER = 1_000_000

    // Convert dataset values (subsidy and fees)
    const convertedDataset = _map(dataset, (labelData) => {
      const convertedLabelData = { ...labelData }
      _forEach(_keys(_omit(convertedLabelData, ['label', 'stackGroup', 'legendColor'])), (key) => {
        if (convertedLabelData[key]?.value !== undefined) {
          convertedLabelData[key] = {
            ...convertedLabelData[key],
            value: convertedLabelData[key].value * SATS_MULTIPLIER,
            original: convertedLabelData[key].original * SATS_MULTIPLIER,
          }
        }
      })
      return convertedLabelData
    })

    // Note: feePercent is a percentage (0-1), not a currency value, so we don't multiply it
    // The line dataset remains unchanged as it represents a percentage ratio
    const convertedLineDataset = lineDataset

    return {
      dataset: convertedDataset,
      lineDataset: convertedLineDataset,
      currencyUnit: CURRENCY.SATS,
    }
  }

  return { dataset, lineDataset, currencyUnit: CURRENCY.BTC }
}
