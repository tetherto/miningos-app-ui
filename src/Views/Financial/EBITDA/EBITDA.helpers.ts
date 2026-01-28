import _every from 'lodash/every'
import _flatMap from 'lodash/flatMap'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import _mean from 'lodash/mean'
import _sortBy from 'lodash/sortBy'
import _sumBy from 'lodash/sumBy'

import { getPeriodKey, getStartOfDay } from '../common/financial.helpers'
import { PeriodType } from '../common/financial.types'

import type {
  AggregatedEbitdaData,
  DailyEbitdaData,
  EbitdaMetrics,
  MinerpoolTransactionData,
  TailLogAggrData,
} from './EBITDA.types'

import { formatNumber } from '@/app/utils/format'
import { calculateTransactionSum } from '@/app/utils/transactionUtils'
import { CHART_COLORS } from '@/constants/colors'
import { MinerHistoricalPrice, ProductionCostData } from '@/types'

/**
 * Calculate revenue BTC from minerpool transactions
 */
export const calculateTransactionRevenue = (transactions: MinerpoolTransactionData[]): number => {
  const allTransactions = _flatMap(transactions, (dayData) => dayData.transactions || [])
  return _sumBy(allTransactions, (tx) => _get(tx, 'changed_balance', 0))
}

/**
 * Merge all data sources into daily EBITDA data
 */
export const mergeDailyData = (
  transactionData: MinerpoolTransactionData[],
  priceData: MinerHistoricalPrice[],
  productionCosts: ProductionCostData[],
  tailLogData: TailLogAggrData[],
): DailyEbitdaData[] => {
  // Create lookup maps for fast access
  const priceMap = new Map<number, number>()
  let fallbackPrice: number | null = null

  if (_isArray(priceData)) {
    _forEach(priceData, (item) => {
      // Try to extract historical price data (ts + priceUSD)
      if (item?.ts && item?.priceUSD) {
        const dayTs = getStartOfDay(item.ts)
        priceMap.set(dayTs, item.priceUSD)
      }
      // Fallback: if API returns current price data instead (for future dates)
      else if (item?.currentPrice && !fallbackPrice) {
        fallbackPrice = item.currentPrice
      }
    })
  }

  // Create cost map by month
  const costMap = new Map<string, { energy: number; ops: number }>()
  if (_isArray(productionCosts)) {
    _forEach(productionCosts, (cost) => {
      if (
        cost?.year &&
        cost?.month &&
        _isNumber(cost?.energyCost) &&
        _isNumber(cost?.operationalCost)
      ) {
        const key = `${cost.year}-${cost.month}`
        costMap.set(key, { energy: cost.energyCost, ops: cost.operationalCost })
      }
    })
  }

  // Create hashrate and power maps
  const hashrateMap = new Map<number, number>()
  const powerMap = new Map<number, number>()

  if (_isArray(tailLogData)) {
    _forEach(tailLogData, (dataset) => {
      if (!dataset?.data || !_isArray(dataset.data)) return

      _forEach(dataset.data, (item) => {
        const dayTs = getStartOfDay(item.ts)
        if (dataset.type === 'miner' && item.val.hashrate_mhs_5m_sum_aggr) {
          hashrateMap.set(dayTs, item.val.hashrate_mhs_5m_sum_aggr)
        }
        if (dataset.type === 'powermeter' && item.val.site_power_w) {
          powerMap.set(dayTs, item.val.site_power_w)
        }
      })
    })
  }

  // Merge transaction data with all other sources
  const dailyDataMap = new Map<number, DailyEbitdaData>()

  if (!_isArray(transactionData)) {
    return []
  }

  _forEach(transactionData, (dayData) => {
    if (!dayData) return

    const ts = _isString(dayData.ts) ? parseInt(dayData.ts, 10) : dayData.ts
    const dayTs = getStartOfDay(ts)
    const date = new Date(dayTs)
    const costKey = `${date.getFullYear()}-${date.getMonth() + 1}`
    const costs = costMap.get(costKey) || { energy: 0, ops: 0 }

    // Calculate revenue and fees for this day
    let revenueBTC = 0
    let feesBTC = 0

    if (dayData.transactions) {
      const { revenueBTC: txRevenueBTC, feesBTC: txFeesBTC } = calculateTransactionSum(
        dayData.transactions,
      )
      revenueBTC += txRevenueBTC
      feesBTC += txFeesBTC
    }

    dailyDataMap.set(dayTs, {
      ts: dayTs,
      revenueBTC,
      feesBTC,
      priceUSD: priceMap.get(dayTs) || fallbackPrice || 0,
      energyCostsUSD: costs.energy,
      operationalCostsUSD: costs.ops,
      hashrateMHS: hashrateMap.get(dayTs) || null,
      powerW: powerMap.get(dayTs) || null,
    })
  })

  return _sortBy(Array.from(dailyDataMap.values()), 'ts')
}

/**
 * Aggregate daily data by period
 */
export const aggregateByPeriod = (
  dailyData: DailyEbitdaData[],
  periodType: PeriodType,
  currentBTCPrice: number,
): AggregatedEbitdaData[] => {
  const grouped: Record<
    string,
    {
      revenueBTC: number
      revenueUSD: number
      totalCostsUSD: number
      priceSamples: number[]
      dataPointCount: number
      firstTs: number
    }
  > = {}

  _forEach(dailyData, (day) => {
    const periodKey = getPeriodKey(day.ts, periodType)

    if (!grouped[periodKey]) {
      grouped[periodKey] = {
        revenueBTC: 0,
        revenueUSD: 0,
        totalCostsUSD: 0,
        priceSamples: [],
        dataPointCount: 0,
        firstTs: day.ts,
      }
    }

    const totalCosts = day.energyCostsUSD + day.operationalCostsUSD

    grouped[periodKey].revenueBTC += day.revenueBTC
    grouped[periodKey].revenueUSD += day.revenueBTC * day.priceUSD
    grouped[periodKey].totalCostsUSD += totalCosts
    grouped[periodKey].dataPointCount++

    if (day.priceUSD > 0) {
      grouped[periodKey].priceSamples.push(day.priceUSD)
    }
  })

  // Calculate EBITDA for each period
  return Object.entries(grouped).map(([period, data]) => {
    const ebitdaSell = data.revenueUSD - data.totalCostsUSD
    const ebitdaHodl = data.revenueBTC * currentBTCPrice - data.totalCostsUSD

    return {
      period,
      revenueBTC: data.revenueBTC,
      revenueUSD: data.revenueUSD,
      totalCostsUSD: data.totalCostsUSD,
      ebitdaSell,
      ebitdaHodl,
      priceSamples: data.priceSamples,
      dataPointCount: data.dataPointCount,
    }
  })
}

/**
 * Calculate EBITDA metrics from aggregated data
 */
export const calculateEbitdaMetrics = (
  aggregatedData: AggregatedEbitdaData[],
  currentBTCPrice: number,
): EbitdaMetrics => {
  const totalRevenueBTC = _sumBy(aggregatedData, 'revenueBTC')
  const totalCostsUSD = _sumBy(aggregatedData, 'totalCostsUSD')
  const ebitdaSellingBTC = _sumBy(aggregatedData, 'ebitdaSell')
  const ebitdaNotSellingBTC = _sumBy(aggregatedData, 'ebitdaHodl')

  // Collect all price samples and calculate average
  const allPriceSamples = _flatMap(aggregatedData, 'priceSamples')
  const avgPrice = allPriceSamples.length > 0 ? _mean(allPriceSamples) : currentBTCPrice

  // Calculate production cost per BTC
  const bitcoinProductionCost = totalRevenueBTC > 0 ? totalCostsUSD / totalRevenueBTC : 0

  return {
    bitcoinProductionCost,
    bitcoinPrice: avgPrice,
    bitcoinProduced: totalRevenueBTC,
    ebitdaSellingBTC,
    actualEbitda: ebitdaSellingBTC, // Same as selling according to API docs
    ebitdaNotSellingBTC,
  }
}

/**
 * Format currency value with compact notation (K/M suffix) and negative number handling
 */
export const formatCurrency = (number: number) => {
  const abs = Math.abs(number)
  const [prefix, suffix] = number < 0 ? ['($', ')'] : ['$', '']
  return `${prefix}${formatNumber(abs, { compactDisplay: 'short', notation: 'compact' })}${suffix}`
}

// Formatter for individual EBITDA bar labels
const ebitdaBarFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '$0'
  return formatCurrency(value)
}

/**
 * Transform aggregated data to Monthly EBITDA chart format (grouped bars for comparison)
 */
export const transformToEbitdaChartData = (aggregatedData: AggregatedEbitdaData[]) => {
  const labels = _map(aggregatedData, 'period')
  const ebitdaSellingValues = _map(aggregatedData, 'ebitdaSell')
  const ebitdaHodlValues = _map(aggregatedData, 'ebitdaHodl')

  return {
    labels,
    series: [
      {
        label: 'Sell scenario',
        values: ebitdaSellingValues,
        color: CHART_COLORS.blue,
        datalabels: {
          formatter: ebitdaBarFormatter,
          anchor: 'end',
          align: 'top',
          offset: 2,
          font: { size: 9 },
          padding: { right: 30 },
        },
      },
      {
        label: 'HODL scenario',
        values: ebitdaHodlValues,
        color: CHART_COLORS.green,
        datalabels: {
          formatter: ebitdaBarFormatter,
          anchor: 'end',
          align: 'top',
          offset: 2,
          font: { size: 9 },
          padding: { left: 30 },
        },
      },
    ],
  }
}

// Custom formatter for BTC produced data labels
const btcProducedFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0 ₿'

  // Always show 2 decimal places for BTC values
  const formatted = formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 3 })

  return `${formatted} ₿`
}

/**
 * Transform aggregated data to Bitcoin Produced chart format (simple bars)
 */
export const transformToBtcProducedChartData = (aggregatedData: AggregatedEbitdaData[]) => {
  const labels = _map(aggregatedData, 'period')
  const btcProducedValues = _map(aggregatedData, 'revenueBTC')

  return {
    labels,
    series: [
      {
        label: 'Bitcoin Produced',
        values: btcProducedValues,
        color: CHART_COLORS.orange,
        datalabels: {
          formatter: btcProducedFormatter,
        },
      },
    ],
  }
}

export const checkIfAllValuesAreZero = (
  data: { series?: { values?: number[] }[] } | null | undefined,
): boolean => {
  if (!data?.series || _isEmpty(data.series)) return true

  return _every(data.series, ({ values }) => {
    if (!values || _isEmpty(values)) return true

    return _every(values, (value) => value === 0)
  })
}
