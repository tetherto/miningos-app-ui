import { format } from 'date-fns/format'
import { getDaysInMonth } from 'date-fns/getDaysInMonth'
import { getMonth } from 'date-fns/getMonth'
import { getYear } from 'date-fns/getYear'
import { subYears } from 'date-fns/subYears'
import _entries from 'lodash/entries'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _groupBy from 'lodash/groupBy'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isNumber from 'lodash/isNumber'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _mapValues from 'lodash/mapValues'
import _mean from 'lodash/mean'
import _reduce from 'lodash/reduce'
import _sortBy from 'lodash/sortBy'
import _sumBy from 'lodash/sumBy'
import _toLower from 'lodash/toLower'
import { useState } from 'react'

import type { DateRange } from '../RevenueSummary.types'

import {
  USE_DOCUMENTATION_MOCKS,
  mockBlockSizesDataFromDoc,
  mockElectricityDataFromDoc,
  mockHistoricalPricesDataFromDoc,
  mockMempoolDataFromDoc,
  mockProductionCostsFromDoc,
  mockSiteDataFromDoc,
  mockTailLogRangeAggrDataFromDoc,
  mockTransactionsDataFromDoc,
} from './documentationMocks'
import { getPeriodEndDate, getPeriodKey, getStartOfDay, safeDiv } from './revenueSummaryHelpers'

import {
  useGetExtDataQuery,
  useGetGlobalDataQuery,
  useGetSiteQuery,
  useGetTailLogRangeAggrQuery,
} from '@/app/services/api'
import { getRangeTimestamps } from '@/app/utils/dateUtils'
import { formatPowerConsumption, getHashrateUnit } from '@/app/utils/deviceUtils'
import {
  toMW,
  toPHS,
  W_TO_MW,
  BTC_SATS,
  MS_PER_HOUR,
  HOURS_IN_DAY,
  SECONDS_PER_DAY,
  HASHRATE_PER_PHS,
  calculateCurtailment,
} from '@/app/utils/electricityUtils'
import { formatNumber } from '@/app/utils/format'
import { calculateTransactionSum } from '@/app/utils/transactionUtils'
import { DATE_RANGE } from '@/constants'
import { PERIOD } from '@/constants/ranges'
import { useNominalConfigValues } from '@/hooks/useNominalConfigValues'
import useTimezone from '@/hooks/useTimezone'
import {
  convertToChartFormat,
  transformRevenueDataForChart,
} from '@/MultiSiteViews/RevenueAndCost/revenueDataHelpers'
import { rangeOfMonth, rangeOfYear } from '@/MultiSiteViews/SharedComponents/Header/helper'
import type { DateRange as TimeframeDateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'
import type {
  ApiResponse,
  ElectricityDataEnergy,
  ElectricityDataEntry,
  HashrateAggregateResponse,
  MinerHistoricalBlockSizesResponse,
  MinerHistoricalPriceResponse,
  MinerPoolData,
  MinerPoolResponse,
  MinerTransactionResponse,
  PeriodValue,
  UnknownRecord,
} from '@/types'

type ProcessedElectricityData = Pick<ElectricityDataEnergy, 'ts' | 'usedEnergy'>

interface RevenueSummaryLogEntry {
  ts: number
  period: string
  totalRevenueBTC: number
  totalFeesBTC: number
  totalFeesUSD: number
  revenueUSD: number
  totalCostsUSD: number
  ebitdaSellingBTC: number | null
  ebitdaNotSellingBTC: number | null
  energyRevenueBTC_MW: number | null
  energyRevenueUSD_MW: number | null
  hashRevenueBTC: number | null
  hashRevenueUSD: number | null
  hashCostBTC_PHS_d: number | null
  hashCostUSD_PHS_d: number | null
  hashrateMHS: number
  sitePowerW: number
  avgFeesSatsVByte: number | null
  currentBTCPrice: number
  region: string
  [key: string]: unknown
}

interface ProcessedTransactionData {
  [key: number]: {
    ts: number
    totalRevenueBTC: number
    totalFeesBTC: number
  }
}

interface ProcessedTailLogData {
  [key: number]: {
    ts: number
    hashrateMHS: number
    sitePowerW: number
  }
}

/**
 * Process transaction data and aggregate by day
 * Sums all changed_balance values from all transactions
 */
export const processTransactionData = (
  transactionsRes: MinerTransactionResponse | undefined,
): ProcessedTransactionData => {
  if (!transactionsRes) return {}

  // Handle ApiResponse format
  const transactionsArray = 'data' in transactionsRes ? transactionsRes.data : transactionsRes
  if (!Array.isArray(transactionsArray)) return {}

  const transactions = _head(transactionsArray) as Array<{
    ts: string
    transactions: Array<{
      changed_balance?: number
      satoshis_net_earned?: number
      fees_colected_satoshis?: number
      mining_extra?: { tx_fee?: number }
    }>
  }>

  if (!transactions) return {}

  return _reduce(
    transactions,
    (acc, { ts, transactions: txs }) => {
      const dayTs = getStartOfDay(Number(ts))

      // Step 1: Sum all changed_balance values from all transactions in this timestamp object
      const sums = calculateTransactionSum(txs)

      // Step 2: If multiple timestamps exist for the same day, sum their totals
      // Example: If we have ts="1755734400000" with sum=0.003 and ts="1755738000000" (same day) with sum=0.009,
      // the totalRevenueBTC for that day will be 0.003 + 0.009 = 0.012
      if (acc[dayTs]) {
        acc[dayTs].totalRevenueBTC += sums.revenueBTC
        acc[dayTs].totalFeesBTC += sums.feesBTC
      } else {
        acc[dayTs] = {
          ts: dayTs,
          totalRevenueBTC: sums.revenueBTC,
          totalFeesBTC: sums.feesBTC,
        }
      }

      return acc
    },
    {} as ProcessedTransactionData,
  )
}

/**
 * Process tail log range aggregation data (hashrate and power)
 * Sums values per day (needed for revenue calculations)
 */
export const processTailLogData = (
  tailLogRangeAggrRes: HashrateAggregateResponse | undefined,
): ProcessedTailLogData => {
  if (!tailLogRangeAggrRes) return {}

  // Handle ApiResponse format
  const tailLogArray =
    'data' in tailLogRangeAggrRes ? tailLogRangeAggrRes.data : tailLogRangeAggrRes
  if (!Array.isArray(tailLogArray)) return {}

  const tailLogData = _head(tailLogArray)
  if (!tailLogData || !Array.isArray(tailLogData)) return {}

  // Type assertion: actual runtime structure has type and data properties
  const minerData = _find(
    tailLogData,
    (item: unknown) => (item as { type?: string })?.type === 'miner',
  ) as { data?: Array<{ ts: number; val?: { hashrate_mhs_5m_sum_aggr?: number } }> } | undefined
  const powermeterData = _find(
    tailLogData,
    (item: unknown) => (item as { type?: string })?.type === 'powermeter',
  ) as { data?: Array<{ ts: number; val?: { site_power_w?: number } }> } | undefined

  const minerDataArray = minerData?.data || []
  const powermeterDataArray = powermeterData?.data || []

  const processed: ProcessedTailLogData = {}

  // Process hashrate data - sum per day
  _forEach(minerDataArray, ({ ts, val }) => {
    const dayTs = getStartOfDay(ts)
    const hashrateMHS = val?.hashrate_mhs_5m_sum_aggr || 0

    if (processed[dayTs]) {
      // Sum if multiple timestamps per day
      processed[dayTs].hashrateMHS += hashrateMHS
    } else {
      processed[dayTs] = {
        ts: dayTs,
        hashrateMHS,
        sitePowerW: 0,
      }
    }
  })

  // Process power data - sum per day
  _forEach(powermeterDataArray, ({ ts, val }) => {
    const dayTs = getStartOfDay(ts)
    const sitePowerW = val?.site_power_w || 0

    if (processed[dayTs]) {
      // Sum if multiple timestamps per day
      processed[dayTs].sitePowerW += sitePowerW
    } else {
      if (!processed[dayTs]) {
        processed[dayTs] = {
          ts: dayTs,
          hashrateMHS: 0,
          sitePowerW: 0,
        }
      }
      processed[dayTs].sitePowerW += sitePowerW
    }
  })

  return processed
}

/**
 * Process historical prices data
 */
export const processHistoricalPrices = (
  historicalPricesRes: MinerHistoricalPriceResponse | undefined,
): Array<{ ts: number; priceUSD: number }> => {
  if (!historicalPricesRes) return []

  // Handle ApiResponse format
  const pricesArray = 'data' in historicalPricesRes ? historicalPricesRes.data : historicalPricesRes
  if (!Array.isArray(pricesArray)) return []

  const prices = _head(pricesArray) as Array<{ ts: number; priceUSD: number }> | undefined
  if (!prices) return []

  // Group by day and average prices per day
  const grouped = _groupBy(prices, ({ ts }) => getStartOfDay(ts))

  return _map(_entries(grouped), ([dayTs, dayPrices]) => ({
    ts: Number(dayTs),
    priceUSD: _mean(_map(dayPrices, 'priceUSD')),
  }))
}

/**
 * Process historical block sizes data
 */
const processHistoricalBlockSizes = (
  blockSizesRes: MinerHistoricalBlockSizesResponse | undefined,
): Array<{ ts: number; blockSize: number }> => {
  if (!blockSizesRes) return []

  // Handle ApiResponse format
  const blocksArray = 'data' in blockSizesRes ? blockSizesRes.data : blockSizesRes
  if (!Array.isArray(blocksArray)) return []

  const blocks = _head(blocksArray) as
    | Array<{
        ts: number
        blockSize: number
      }>
    | undefined

  if (!blocks) return []

  // Group by day and sum block sizes per day
  const grouped = _groupBy(blocks, ({ ts }) => getStartOfDay(ts))

  return _map(_entries(grouped), ([dayTs, dayBlocks]) => ({
    ts: Number(dayTs),
    blockSize: _sumBy(dayBlocks, 'blockSize'),
  }))
}

/**
 * Get price for a specific period
 */
const getPeriodPrice = (
  prices: Array<{ ts: number; priceUSD: number }>,
  periodTs: number,
  period: PeriodValue,
): number => {
  if (period === PERIOD.DAILY) {
    return _find(prices, ({ ts }) => ts === periodTs)?.priceUSD || 0
  }

  const periodEnd = getPeriodEndDate(periodTs, period)
  const entriesInPeriod = prices.filter(({ ts }) => ts >= periodTs && ts < periodEnd.getTime())

  if (entriesInPeriod.length === 0) {
    return _find(prices, ({ ts }) => ts === periodTs)?.priceUSD || 0
  }

  return _mean(_map(entriesInPeriod, 'priceUSD'))
}

/**
 * Get block size for a specific period
 */
const getPeriodBlockSize = (
  blocks: Array<{ ts: number; blockSize: number }>,
  periodTs: number,
  period: PeriodValue,
): number => {
  if (period === PERIOD.DAILY) {
    return _find(blocks, ({ ts }) => ts === periodTs)?.blockSize || 0
  }

  const periodEnd = getPeriodEndDate(periodTs, period)
  const entriesInPeriod = blocks.filter(({ ts }) => ts >= periodTs && ts < periodEnd.getTime())

  return _sumBy(entriesInPeriod, 'blockSize')
}

/**
 * Get production costs for a specific period
 */
const getPeriodCosts = (
  costsData:
    | Array<{ year: number; month: number; energyCostsUSD?: number; operationalCostsUSD?: number }>
    | undefined,
  periodTs: number,
  period: PeriodValue,
): number => {
  if (!costsData || period === PERIOD.DAILY) return 0

  const date = new Date(periodTs)
  const year = date.getFullYear()
  const month = period === PERIOD.MONTHLY ? date.getMonth() + 1 : undefined

  const filtered = costsData.filter((d) => {
    if (period === PERIOD.YEARLY) return d.year === year
    return d.year === year && d.month === month
  })

  return _reduce(
    filtered,
    (acc, curr) => {
      const energy = curr.energyCostsUSD || 0
      const operational = curr.operationalCostsUSD || 0
      return acc + energy + operational
    },
    0,
  )
}

/**
 * Aggregate data by period
 */
const aggregateByPeriod = (
  transactionData: ProcessedTransactionData,
  tailLogData: ProcessedTailLogData,
  period: PeriodValue,
) => {
  const allTimestamps = new Set([
    ..._keys(transactionData).map(Number),
    ..._keys(tailLogData).map(Number),
  ])

  const grouped = _groupBy(Array.from(allTimestamps), (ts) => getPeriodKey(ts, period))

  return _mapValues(grouped, (timestamps) => {
    const merged = _reduce(
      timestamps,
      (acc, ts) => {
        const tx = transactionData[ts]
        const tail = tailLogData[ts]

        if (tx) {
          acc.totalRevenueBTC += tx.totalRevenueBTC
          acc.totalFeesBTC += tx.totalFeesBTC
          acc.count += 1
        }

        if (tail) {
          acc.sitePowerW += tail.sitePowerW
          acc.hashrateMHS += tail.hashrateMHS
          acc.powerCount += 1
          acc.hashrateCount += 1
        }

        return acc
      },
      {
        totalRevenueBTC: 0,
        totalFeesBTC: 0,
        sitePowerW: 0,
        hashrateMHS: 0,
        count: 0,
        powerCount: 0,
        hashrateCount: 0,
      },
    )

    return {
      totalRevenueBTC: merged.totalRevenueBTC,
      totalFeesBTC: merged.totalFeesBTC,
      sitePowerW: merged.powerCount > 0 ? merged.sitePowerW / merged.powerCount : 0,
      hashrateMHS: merged.hashrateCount > 0 ? merged.hashrateMHS / merged.hashrateCount : 0,
    }
  })
}

/**
 * Get number of periods based on date range and period type
 */
export const getNumberOfPeriods = (dateRange: DateRange, period: PeriodValue): number => {
  if (period === PERIOD.WEEKLY) {
    return 7
  }
  if (period === PERIOD.YEARLY) {
    return 12
  }
  if (period === PERIOD.MONTHLY) {
    // Get number of days in the selected month using date-fns
    const startDate = new Date(dateRange.start)
    return getDaysInMonth(startDate)
  }
  // For daily period, return 1
  return 1
}

/**
 * Calculate daily revenue ratios for energy and hash
 * Returns array of daily ratios: { dayTs, energyRatio, hashRatio }
 */
export const calculateDailyRevenueRatios = (
  processedTransactionData: ProcessedTransactionData,
  processedTailLogData: ProcessedTailLogData,
  processedPrices: Array<{ ts: number; priceUSD: number }>,
): Array<{ dayTs: number; energyRatio: number; hashRatio: number }> => {
  const ratios: Array<{ dayTs: number; energyRatio: number; hashRatio: number }> = []

  // Get all unique days from transaction data
  const allDays = _keys(processedTransactionData).map(Number)

  _forEach(allDays, (dayTs) => {
    const txData = processedTransactionData[dayTs]
    const tailData = processedTailLogData[dayTs]

    if (!txData || !tailData) return

    const revenueBTC = txData.totalRevenueBTC
    const sitePowerW = tailData.sitePowerW
    const hashrateMHS = tailData.hashrateMHS

    // Get price for this day
    const priceData = _find(processedPrices, ({ ts }) => ts === dayTs)
    const priceUSD = priceData?.priceUSD || 0

    if (priceUSD === 0 || revenueBTC === 0) return

    // Convert revenueBTC to USD
    const revenueUSD = revenueBTC * priceUSD

    // Calculate ratios
    // Energy: revenueUSD / sitePowerW (in $/W)
    // Hash: revenueUSD / hashrateMHS (in $/MH/s)

    // Convert Hashrate from MH/s to PH/s
    const hashratePHS = toPHS(hashrateMHS)
    // convert sitePowerW from W to MW
    const sitePowerMW = toMW(sitePowerW)

    const energyRatio = safeDiv(revenueUSD, sitePowerMW) || 0
    const hashRatio = safeDiv(revenueUSD, hashratePHS) || 0

    if (energyRatio > 0 || hashRatio > 0) {
      ratios.push({
        dayTs,
        energyRatio,
        hashRatio,
      })
    }
  })

  return ratios
}

/**
 * Calculate average revenue metrics based on daily ratios
 */
export const calculateAvgRevenueMetrics = (
  dailyRatios: Array<{ dayTs: number; energyRatio: number; hashRatio: number }>,
  dateRange: DateRange,
  period: PeriodValue,
  avgBTCPriceUSD: number,
): {
  avgEnergyRevenue: number
  avgHashRevenue: number
  avgEnergyRevenueSats: number
  avgHashRevenueSats: number
} => {
  if (dailyRatios.length === 0) {
    return {
      avgEnergyRevenue: 0,
      avgHashRevenue: 0,
      avgEnergyRevenueSats: 0,
      avgHashRevenueSats: 0,
    }
  }

  const numberOfPeriods = getNumberOfPeriods(dateRange, period)

  // Sum all daily ratios
  const sumEnergyRatio = _reduce(dailyRatios, (sum, ratio) => sum + ratio.energyRatio, 0)
  const sumHashRatio = _reduce(dailyRatios, (sum, ratio) => sum + ratio.hashRatio, 0)

  // Average the ratios
  const avgEnergyRatio = sumEnergyRatio / numberOfPeriods
  const avgHashRatio = sumHashRatio / numberOfPeriods

  // Convert units:
  // Energy: from $/W to $/MWh
  // If power is P watts running for 24 hours, energy = P * 24 watt-hours = P * 24 / WATTS_PER_MW MWh
  // So $/MWh = revenueUSD / (P * 24 / WATTS_PER_MW) = revenueUSD * WATTS_PER_MW / (P * 24) = energyRatio * WATTS_PER_MW / 24
  const avgEnergyRevenue = (avgEnergyRatio * W_TO_MW) / HOURS_IN_DAY

  // Hash: from $/MH/s to $/PH/s/day
  // 1 PH/s = 1,000,000,000 MH/s
  // 1 day = 86,400 seconds
  // $/MH/s / HASHRATE_PER_PHS = $/PH/s, then * 86400 = $/PH/s/day
  const avgHashRevenue = (avgHashRatio / HASHRATE_PER_PHS) * SECONDS_PER_DAY

  // Convert USD values to Sats using average BTC price
  // Sats/MWh = ($/MWh) / (BTC price USD) * BTC_SATS
  const avgEnergyRevenueSats =
    avgBTCPriceUSD > 0 ? (avgEnergyRevenue / avgBTCPriceUSD) * BTC_SATS : 0

  // Sats/PH/s/day = ($/PH/s/day) / (BTC price USD) * BTC_SATS
  const avgHashRevenueSats = avgBTCPriceUSD > 0 ? (avgHashRevenue / avgBTCPriceUSD) * BTC_SATS : 0

  return {
    avgEnergyRevenue,
    avgHashRevenue,
    avgEnergyRevenueSats,
    avgHashRevenueSats,
  }
}

/**
 * Calculate Avg Energy Revenue - At Prod. Date Price
 * Formula:
 * - Calculate the Avg price of each day
 * - Calculate the change_balance of each day
 * - Multiply the daily change_balance by the daily avg price
 * - Divide the final result by (Avg power consumption multiplied by the number of hours in that period)
 */
export const calculateAvgEnergyRevenueAtProdDate = (
  processedTransactionData: ProcessedTransactionData,
  processedPrices: Array<{ ts: number; priceUSD: number }>,
  avgPowerConsumptionW: number,
  hoursInPeriod: number,
): number => {
  if (
    _keys(processedTransactionData).length === 0 ||
    processedPrices.length === 0 ||
    avgPowerConsumptionW === 0 ||
    hoursInPeriod === 0
  ) {
    return 0
  }

  // Sum of (daily change_balance * daily avg price)
  let totalRevenueUSD = 0

  _forEach(_entries(processedTransactionData), ([dayTsStr, txData]) => {
    const dayTs = Number(dayTsStr)
    const changeBalanceBTC = txData.totalRevenueBTC

    // Find the price for this day
    const priceData = _find(processedPrices, ({ ts }) => ts === dayTs)
    const avgPriceUSD = priceData?.priceUSD || 0

    if (avgPriceUSD > 0 && changeBalanceBTC > 0) {
      // Multiply daily change_balance by daily avg price
      totalRevenueUSD += changeBalanceBTC * avgPriceUSD
    }
  })

  // Convert avg power consumption from W to MW
  const avgPowerConsumptionMW = toMW(avgPowerConsumptionW)

  // Divide by (Avg power consumption * hours in period)
  // Result is in $/MWh
  return safeDiv(totalRevenueUSD, avgPowerConsumptionMW * hoursInPeriod) || 0
}

/**
 * Calculate Avg Hash Revenue - At Prod. Date Price
 * Formula steps:
 * 1. Calculate the Avg price of each day (already done in processHistoricalPrices)
 * 2. Calculate the change_balance of each day (already done in processTransactionData)
 * 3. Multiply the daily change_balance by the daily avg price
 * 4. Divide by the avg Hashrate (converted to PH/s)
 * 5. Multiply by 60*60*24 (seconds per day)
 * Result is in $/PH/s/day
 */
export const calculateAvgHashRevenueAtProdDate = (
  processedTransactionData: ProcessedTransactionData,
  processedPrices: Array<{ ts: number; priceUSD: number }>,
  avgHashrateMHS: number,
): number => {
  if (
    _keys(processedTransactionData).length === 0 ||
    processedPrices.length === 0 ||
    avgHashrateMHS === 0
  ) {
    return 0
  }

  // Step 3: Sum of (daily change_balance × daily avg price)
  let totalRevenueUSD = 0

  _forEach(_entries(processedTransactionData), ([dayTsStr, txData]) => {
    const dayTs = Number(dayTsStr)
    const changeBalanceBTC = txData.totalRevenueBTC

    // Find the avg price for this day (Step 1 already done)
    const priceData = _find(processedPrices, ({ ts }) => ts === dayTs)
    const avgPriceUSD = priceData?.priceUSD || 0

    if (avgPriceUSD > 0 && changeBalanceBTC > 0) {
      // Step 3: Multiply daily change_balance by daily avg price
      totalRevenueUSD += changeBalanceBTC * avgPriceUSD
    }
  })

  // Step 4: Convert hashrate from MH/s to PH/s and divide
  const avgHashratePHS = toPHS(avgHashrateMHS)

  // Step 5: Multiply by 60*60*24 (seconds per day)
  // Formula: (Total Revenue USD / Avg Hashrate PH/s) × seconds per day
  // Equivalent to: Total Revenue USD × seconds per day / Avg Hashrate PH/s
  const secondsPerDay = 60 * 60 * 24 // 86400
  return safeDiv(totalRevenueUSD * secondsPerDay, avgHashratePHS) || 0
}

/**
 * Calculate average power consumption
 * - For week/month: average by day
 * - For year: average by month
 */
export const calculateAvgPowerConsumption = (
  processedTailLogData: ProcessedTailLogData,
  dateRange: DateRange,
  period: PeriodValue,
): number => {
  if (_keys(processedTailLogData).length === 0) {
    return 0
  }

  // For week/month: average daily values
  if (period === PERIOD.WEEKLY || period === PERIOD.MONTHLY) {
    const dailyValues = _map(_entries(processedTailLogData), ([, data]) => data.sitePowerW)
    return _mean(dailyValues) || 0
  }

  // For year: group by month and average monthly values
  if (period === PERIOD.YEARLY) {
    const groupedByMonth = _groupBy(_entries(processedTailLogData), ([dayTs]) =>
      getPeriodKey(Number(dayTs), PERIOD.MONTHLY),
    )

    const monthlyAverages = _mapValues(groupedByMonth, (dayEntries) => {
      const dailyValues = _map(dayEntries, ([, data]) => data.sitePowerW)
      return _mean(dailyValues) || 0
    })

    const monthlyValues = _map(_entries(monthlyAverages), ([, avg]) => avg)
    return _mean(monthlyValues) || 0
  }

  // For daily: return the single day's value
  const dailyValues = _map(_entries(processedTailLogData), ([, data]) => data.sitePowerW)
  return _mean(dailyValues) || 0
}

/**
 * Calculate average hashrate
 * - For week/month: average by day
 * - For year: average by month
 */
export const calculateAvgHashrate = (
  processedTailLogData: ProcessedTailLogData,
  dateRange: DateRange,
  period: PeriodValue,
): number => {
  if (_keys(processedTailLogData).length === 0) {
    return 0
  }

  // For week/month: average daily values
  if (period === PERIOD.WEEKLY || period === PERIOD.MONTHLY) {
    const dailyValues = _map(_entries(processedTailLogData), ([, data]) => data.hashrateMHS)
    return _mean(dailyValues) || 0
  }

  // For year: group by month and average monthly values
  if (period === PERIOD.YEARLY) {
    const groupedByMonth = _groupBy(_entries(processedTailLogData), ([dayTs]) =>
      getPeriodKey(Number(dayTs), PERIOD.MONTHLY),
    )

    const monthlyAverages = _mapValues(groupedByMonth, (dayEntries) => {
      const dailyValues = _map(dayEntries, ([, data]) => data.hashrateMHS)
      return _mean(dailyValues) || 0
    })

    const monthlyValues = _map(_entries(monthlyAverages), ([, avg]) => avg)
    return _mean(monthlyValues) || 0
  }

  // For daily: return the single day's value
  const dailyValues = _map(_entries(processedTailLogData), ([, data]) => data.hashrateMHS)
  return _mean(dailyValues) || 0
}

/**
 * Build query params for transactions
 */
const buildTransactionsParams = ({ start, end }: { start: number; end: number }) => ({
  type: 'minerpool',
  query: JSON.stringify({ start, end, key: 'transactions' }),
})

/**
 * Build query params for historical prices
 */
const buildHistoricalPricesParams = ({ start, end }: { start: number; end: number }) => ({
  type: 'mempool',
  query: JSON.stringify({ key: 'HISTORICAL_PRICES', start, end }),
})

/**
 * Build query params for historical block sizes
 */
const buildHistoricalBlockSizesParams = ({ start, end }: { start: number; end: number }) => ({
  type: 'mempool',
  query: JSON.stringify({ key: 'HISTORICAL_BLOCKSIZES', start, end }),
})

/**
 * Build query params for tail log range aggregation
 */
const buildTailLogRangeAggrParams = ({ start, end }: { start: number; end: number }) => {
  const formatDate = "yyyy-MM-dd'T'HH:mm:ss'Z'"
  return {
    keys: JSON.stringify([
      {
        type: 'miner',
        startDate: format(new Date(start), formatDate),
        endDate: format(new Date(end), formatDate),
        fields: { hashrate_mhs_5m_sum_aggr: 1 },
      },
      {
        type: 'powermeter',
        startDate: format(new Date(start), formatDate),
        endDate: format(new Date(end), formatDate),
        fields: { site_power_w: 1 },
        aggrFields: { site_power_w: 1 },
      },
    ]),
  }
}

/**
 * Build query params for electricity data
 */
const buildElectricityParams = ({
  start,
  end,
  aggregationPeriod,
}: {
  start: number
  end: number
  aggregationPeriod: PeriodValue
}) => {
  const groupRange = aggregationPeriod === PERIOD.MONTHLY ? DATE_RANGE.MONTH1 : DATE_RANGE.D1
  return {
    type: 'electricity',
    query: JSON.stringify({
      start,
      end,
      key: 'stats-history',
      groupRange,
      dataInterval: '1h',
    }),
  }
}

export const processElectricityData = (
  electricityRes: ElectricityDataEntry[] | undefined,
): ProcessedElectricityData[] => {
  if (!electricityRes || !Array.isArray(electricityRes)) return []
  if (electricityRes.length === 0) return []

  const result: ProcessedElectricityData[] = []
  _forEach(electricityRes, (dayArray) => {
    if (!Array.isArray(dayArray)) return
    _forEach(dayArray, (entry) => {
      const usedEnergy = entry?.energy?.usedEnergy

      if (entry.ts && _isNumber(usedEnergy)) {
        result.push({
          ts: entry.ts,
          usedEnergy,
        })
      }
    })
  })

  return result
}

/**
 * Calculate hashrate capacity factors
 * Formula: capacityFactor = (actualHashrate / nominalHashrate) * 100
 */
export const calculateHashrateCapacityFactors = (
  actualHashrateMHS: number,
  nominalHashrateMHS: number,
): number => {
  if (!nominalHashrateMHS || nominalHashrateMHS === 0) return 0
  return (actualHashrateMHS / nominalHashrateMHS) * 100
}

/**
 * Extract average hashrate directly from aggregated response
 * Formula: hashrate_mhs_5m_sum_aggr / aggrIntervals
 */
export const extractAvgHashrateFromAggregatedResponse = (
  tailLogRangeAggrRes: HashrateAggregateResponse | undefined,
): number => {
  if (!tailLogRangeAggrRes) return 0

  // Handle ApiResponse format
  const tailLogArray =
    'data' in tailLogRangeAggrRes ? tailLogRangeAggrRes.data : tailLogRangeAggrRes
  if (!_isArray(tailLogArray)) return 0

  const tailLogData = _head(tailLogArray)
  if (!tailLogData || !_isArray(tailLogData)) return 0

  // Find miner data in the response
  const minerData = _find(
    tailLogData,
    (item: unknown) => (item as { type?: string })?.type === 'miner',
  ) as { data?: { hashrate_mhs_5m_sum_aggr?: number; aggrIntervals?: number } } | undefined

  const hashrateSum = minerData?.data?.hashrate_mhs_5m_sum_aggr
  const aggrIntervals = minerData?.data?.aggrIntervals

  if (!_isNumber(hashrateSum) || !_isNumber(aggrIntervals) || aggrIntervals === 0) {
    return 0
  }

  // Calculate average: hashrate_mhs_5m_sum_aggr / aggrIntervals
  return hashrateSum / aggrIntervals
}

/**
 * Extract average power consumption directly from aggregated response
 * Formula: site_power_w / aggrIntervals
 */
export const extractAvgPowerConsumptionFromAggregatedResponse = (
  tailLogRangeAggrRes: HashrateAggregateResponse | undefined,
): number => {
  if (!tailLogRangeAggrRes) return 0

  // Handle ApiResponse format
  const tailLogArray =
    'data' in tailLogRangeAggrRes ? tailLogRangeAggrRes.data : tailLogRangeAggrRes
  if (!_isArray(tailLogArray)) return 0

  const tailLogData = _head(tailLogArray)
  if (!tailLogData || !_isArray(tailLogData)) return 0

  // Find powermeter data in the response
  const powermeterData = _find(
    tailLogData,
    (item: unknown) => (item as { type?: string })?.type === 'powermeter',
  ) as { data?: { site_power_w?: number; aggrIntervals?: number } } | undefined

  const sitePowerW = powermeterData?.data?.site_power_w
  const aggrIntervals = powermeterData?.data?.aggrIntervals

  if (!_isNumber(sitePowerW) || !_isNumber(aggrIntervals) || aggrIntervals === 0) {
    return 0
  }

  // Calculate average: site_power_w / aggrIntervals
  // site_power_w is in W, so the result is in W
  return sitePowerW / aggrIntervals
}

/**
 * Hook to fetch and process revenue summary data
 * Handles all data gathering, processing, and state management
 */
export const useRevenueSummaryData = () => {
  const { timezone } = useTimezone()

  // Initialize with current month as default (matching TimeframeControls default: daily bars for a month)
  // Or use documentation period if mocks are enabled
  const getDefaultDateRange = () => {
    if (USE_DOCUMENTATION_MOCKS) {
      // Documentation period: Nov 2025 (1761955200000 to 1764460800000)
      return {
        start: 1761955200000,
        end: 1764460800000,
        period: PERIOD.DAILY,
      }
    }
    const now = new Date()
    const currentYear = getYear(now)
    const currentMonth = getMonth(now)
    const [start, end] = rangeOfMonth(currentYear, currentMonth)
    const timestamps = getRangeTimestamps([start, end], timezone, true)
    if (!timestamps[0] || !timestamps[1]) return null
    return {
      start: timestamps[0].getTime(),
      end: timestamps[1].getTime(),
      period: PERIOD.DAILY,
    }
  }

  const getLastYearDateRange = () => {
    if (USE_DOCUMENTATION_MOCKS) {
      // Keep mocks stable; reset should keep the documented period.
      return getDefaultDateRange()
    }
    const lastYearDate = subYears(new Date(), 1)
    const year = getYear(lastYearDate)
    const [start, end] = rangeOfYear(year)
    const timestamps = getRangeTimestamps([start, end], timezone, true)
    if (!timestamps[0] || !timestamps[1]) return null
    return {
      start: timestamps[0].getTime(),
      end: timestamps[1].getTime(),
      period: PERIOD.MONTHLY,
    }
  }

  const defaultDateRange = getDefaultDateRange()

  const [dateRange, setDateRange] = useState<DateRange | null>(defaultDateRange)

  const normalizeAggregationPeriod = (period?: string): PeriodValue =>
    _includes([PERIOD.MONTHLY, PERIOD.YEARLY], period) ? PERIOD.MONTHLY : PERIOD.DAILY

  // Handle range change from TimeframeControls
  const handleRangeChange = (
    dates: [Date, Date],
    options?: { year?: number; month?: number; period?: string },
  ) => {
    const timestamps = getRangeTimestamps(dates, timezone)
    if (!timestamps[0] || !timestamps[1]) return

    setDateRange({
      start: timestamps[0].getTime(),
      end: timestamps[1].getTime(),
      period: options?.period || PERIOD.DAILY,
    })
  }

  const handleReset = () => {
    setDateRange(getLastYearDateRange())
  }

  const hasValidDateRange = Boolean(dateRange?.start && dateRange?.end)
  const aggregationPeriod = normalizeAggregationPeriod(dateRange?.period)

  // Fetch site data (or use mock if enabled)
  const { data: siteDataFromApi, isLoading: isSiteLoadingFromApi } = useGetSiteQuery(
    {},
    { skip: USE_DOCUMENTATION_MOCKS },
  )
  const siteData = USE_DOCUMENTATION_MOCKS ? mockSiteDataFromDoc : siteDataFromApi
  const isSiteLoading = USE_DOCUMENTATION_MOCKS ? false : isSiteLoadingFromApi

  // Extract site name and ID from API response or mock
  const siteName = ((siteData as UnknownRecord)?.site as string) || 'SITE'
  const siteId = ((siteData as UnknownRecord)?.site as string) || ''

  // Fetch transactions (or use mock if enabled)
  const { data: transactionsDataFromApi, isLoading: isTransactionsLoadingFromApi } =
    useGetExtDataQuery<MinerTransactionResponse>(
      buildTransactionsParams({
        start: dateRange?.start || 0,
        end: dateRange?.end || 0,
      }),
      { skip: !hasValidDateRange || USE_DOCUMENTATION_MOCKS, refetchOnMountOrArgChange: true },
    )
  const transactionsData = USE_DOCUMENTATION_MOCKS
    ? mockTransactionsDataFromDoc
    : transactionsDataFromApi
  const isTransactionsLoading = USE_DOCUMENTATION_MOCKS ? false : isTransactionsLoadingFromApi

  // Fetch historical prices (or use mock if enabled)
  const { data: historicalPricesDataFromApi, isLoading: isHistoricalPricesLoadingFromApi } =
    useGetExtDataQuery<MinerHistoricalPriceResponse>(
      buildHistoricalPricesParams({
        start: dateRange?.start || 0,
        end: dateRange?.end || 0,
      }),
      { skip: !hasValidDateRange || USE_DOCUMENTATION_MOCKS, refetchOnMountOrArgChange: true },
    )
  const historicalPricesData = USE_DOCUMENTATION_MOCKS
    ? mockHistoricalPricesDataFromDoc
    : historicalPricesDataFromApi
  const isHistoricalPricesLoading = USE_DOCUMENTATION_MOCKS
    ? false
    : isHistoricalPricesLoadingFromApi

  // Fetch historical block sizes (or use mock if enabled)
  const { data: historicalBlockSizesDataFromApi, isLoading: isHistoricalBlockSizesLoadingFromApi } =
    useGetExtDataQuery<MinerHistoricalBlockSizesResponse>(
      buildHistoricalBlockSizesParams({
        start: dateRange?.start || 0,
        end: dateRange?.end || 0,
      }),
      { skip: !hasValidDateRange || USE_DOCUMENTATION_MOCKS, refetchOnMountOrArgChange: true },
    )
  const historicalBlockSizesData = USE_DOCUMENTATION_MOCKS
    ? mockBlockSizesDataFromDoc
    : historicalBlockSizesDataFromApi
  const isHistoricalBlockSizesLoading = USE_DOCUMENTATION_MOCKS
    ? false
    : isHistoricalBlockSizesLoadingFromApi

  // Fetch current BTC price (or use mock if enabled)
  const { data: mempoolDataFromApi, isLoading: isMempoolLoadingFromApi } =
    useGetExtDataQuery<MinerPoolResponse>(
      {
        type: 'mempool',
        query: JSON.stringify({ type: 'mempool' }),
      },
      { skip: !hasValidDateRange || USE_DOCUMENTATION_MOCKS },
    )
  const mempoolData = USE_DOCUMENTATION_MOCKS ? mockMempoolDataFromDoc : mempoolDataFromApi
  const isMempoolLoading = USE_DOCUMENTATION_MOCKS ? false : isMempoolLoadingFromApi

  // Fetch tail log range aggregation (hashrate + power) (or use mock if enabled)
  const { data: tailLogRangeAggrResFromApi, isLoading: isTailLogLoadingFromApi } =
    useGetTailLogRangeAggrQuery<HashrateAggregateResponse>(
      buildTailLogRangeAggrParams({
        start: dateRange?.start || 0,
        end: dateRange?.end || 0,
      }),
      { skip: !hasValidDateRange || USE_DOCUMENTATION_MOCKS, refetchOnMountOrArgChange: true },
    )
  const tailLogRangeAggrRes = USE_DOCUMENTATION_MOCKS
    ? mockTailLogRangeAggrDataFromDoc
    : tailLogRangeAggrResFromApi
  const isTailLogLoading = USE_DOCUMENTATION_MOCKS ? false : isTailLogLoadingFromApi

  // Fetch production costs (or use mock if enabled)
  const { data: productionCostsDataFromApi, isLoading: isProductionCostsLoadingFromApi } =
    useGetGlobalDataQuery(
      {
        type: 'productionCosts',
      },
      {
        skip: !hasValidDateRange || aggregationPeriod === PERIOD.DAILY || USE_DOCUMENTATION_MOCKS,
      },
    )
  const productionCostsData = USE_DOCUMENTATION_MOCKS
    ? mockProductionCostsFromDoc
    : productionCostsDataFromApi
  const isProductionCostsLoading = USE_DOCUMENTATION_MOCKS ? false : isProductionCostsLoadingFromApi

  const {
    nominalAvailablePowerMWh,
    nominalHashrateMHS,
    isLoading: isNominalConfigValuesLoading,
  } = useNominalConfigValues()

  // Fetch electricity data for curtailment calculation (or use mock if enabled)
  const { data: electricityDataFromApi, isLoading: isElectricityLoadingFromApi } =
    useGetExtDataQuery(
      buildElectricityParams({
        start: dateRange?.start || 0,
        end: dateRange?.end || 0,
        aggregationPeriod,
      }),
      { skip: !hasValidDateRange || USE_DOCUMENTATION_MOCKS, refetchOnMountOrArgChange: true },
    )
  const electricityData = USE_DOCUMENTATION_MOCKS
    ? mockElectricityDataFromDoc
    : electricityDataFromApi
  const isElectricityLoading = USE_DOCUMENTATION_MOCKS ? false : isElectricityLoadingFromApi

  // Helper to normalize response format
  const normalizeResponse = <T>(
    data: T | ApiResponse<T> | undefined,
  ): ApiResponse<T> | undefined => {
    if (!data) return undefined
    if (typeof data === 'object' && 'data' in data && 'success' in data) {
      return data as ApiResponse<T>
    }
    return { data: data as T, success: true } as ApiResponse<T>
  }

  // Normalize API responses
  const finalTransactionsData = normalizeResponse(transactionsData) as
    | MinerTransactionResponse
    | undefined
  const finalHistoricalPricesData = normalizeResponse(historicalPricesData) as
    | MinerHistoricalPriceResponse
    | undefined
  const finalHistoricalBlockSizesData = normalizeResponse(historicalBlockSizesData) as
    | MinerHistoricalBlockSizesResponse
    | undefined
  const finalMempoolData = normalizeResponse(mempoolData) as MinerPoolResponse | undefined
  const finalTailLogRangeAggrRes = normalizeResponse(tailLogRangeAggrRes) as
    | HashrateAggregateResponse
    | undefined
  const finalProductionCostsData = productionCostsData

  // Process data
  const processedTransactionData = processTransactionData(finalTransactionsData)

  const processedTailLogData = processTailLogData(finalTailLogRangeAggrRes)

  const processedPrices = processHistoricalPrices(finalHistoricalPricesData)

  const processedBlockSizes = processHistoricalBlockSizes(finalHistoricalBlockSizesData)

  const processedElectricityData = processElectricityData(electricityData)

  const getMempoolCurrentData = () => {
    if (!finalMempoolData) return {} as Partial<MinerPoolData>
    // Handle ApiResponse format
    const mempoolArray = 'data' in finalMempoolData ? finalMempoolData.data : finalMempoolData
    return (
      (_get(mempoolArray, '[0][0]', {}) as Partial<MinerPoolData>) || ({} as Partial<MinerPoolData>)
    )
  }

  const mempoolCurrentData = getMempoolCurrentData()

  // Aggregate by period
  const aggregatedData = aggregateByPeriod(
    processedTransactionData,
    processedTailLogData,
    aggregationPeriod,
  )

  // Generate log entries
  const getRevenueLog = () => {
    const costsData = Array.isArray(finalProductionCostsData)
      ? finalProductionCostsData.filter((item: { site?: string }) => {
          if (!siteId) return true
          return _toLower(item.site) === _toLower(siteId)
        })
      : []

    return _map(_entries(aggregatedData), ([periodTsStr, metrics]) => {
      const periodTs = Number(periodTsStr)
      const priceUSD = getPeriodPrice(processedPrices, periodTs, aggregationPeriod)
      const blockSize = getPeriodBlockSize(processedBlockSizes, periodTs, aggregationPeriod)
      const totalCostsUSD = getPeriodCosts(costsData, periodTs, aggregationPeriod)

      const revenueUSD = metrics.totalRevenueBTC * priceUSD
      const totalFeesUSD = metrics.totalFeesBTC * priceUSD
      const hashratePHS = toPHS(metrics.hashrateMHS)
      const sitePowerMW = toMW(metrics.sitePowerW)
      const currentBTCPrice = mempoolCurrentData.currentPrice || priceUSD

      // Calculate EBITDA (only for monthly/yearly periods, not daily)
      // ebitdaSellingBTC = revenueUSD - totalCostsUSD
      // ebitdaNotSellingBTC = (totalRevenueBTC * currentBTCPrice) - totalCostsUSD
      const ebitdaSellingBTC =
        aggregationPeriod === PERIOD.DAILY ? null : revenueUSD - totalCostsUSD
      const ebitdaNotSellingBTC =
        aggregationPeriod === PERIOD.DAILY
          ? null
          : metrics.totalRevenueBTC * currentBTCPrice - totalCostsUSD

      const entry: RevenueSummaryLogEntry = {
        ts: periodTs,
        period: aggregationPeriod,
        totalRevenueBTC: metrics.totalRevenueBTC,
        totalFeesBTC: metrics.totalFeesBTC,
        totalFeesUSD,
        revenueUSD,
        totalCostsUSD,
        ebitdaSellingBTC: ebitdaSellingBTC || null,
        ebitdaNotSellingBTC: ebitdaNotSellingBTC || null,
        energyRevenueBTC_MW: safeDiv(metrics.totalRevenueBTC, sitePowerMW),
        energyRevenueUSD_MW: safeDiv(revenueUSD, sitePowerMW),
        hashRevenueBTC: safeDiv(metrics.totalRevenueBTC, hashratePHS),
        hashRevenueUSD: safeDiv(revenueUSD, hashratePHS),
        hashCostBTC_PHS_d: safeDiv(totalCostsUSD / priceUSD, hashratePHS),
        hashCostUSD_PHS_d: safeDiv(totalCostsUSD, hashratePHS),
        hashrateMHS: metrics.hashrateMHS,
        sitePowerW: metrics.sitePowerW,
        avgFeesSatsVByte: safeDiv(metrics.totalRevenueBTC * BTC_SATS, blockSize),
        currentBTCPrice,
        region: siteName,
      }

      return entry
    })
  }

  const revenueLog = getRevenueLog()

  const sortedRevenueLog = _sortBy(revenueLog, ['ts'])

  // Calculate average power consumption directly from aggregated response
  const avgPowerConsumption =
    !dateRange || !hasValidDateRange
      ? 0
      : extractAvgPowerConsumptionFromAggregatedResponse(finalTailLogRangeAggrRes)

  // Calculate average hashrate directly from aggregated response
  const avgHashrate =
    !dateRange || !hasValidDateRange
      ? 0
      : extractAvgHashrateFromAggregatedResponse(finalTailLogRangeAggrRes)

  // Calculate hours in period for "At Prod. Date Price" calculations
  const { start, end } = dateRange || {}
  const hoursInPeriod = start && end ? (end - start) / MS_PER_HOUR : 0

  // Calculate Avg Energy Revenue - At Prod. Date Price
  // Formula: Sum(daily change_balance * daily avg price) / (Avg power consumption * hours in period)
  const avgEnergyRevenueAtProdDate =
    !dateRange || !hasValidDateRange
      ? 0
      : calculateAvgEnergyRevenueAtProdDate(
          processedTransactionData,
          processedPrices,
          avgPowerConsumption,
          hoursInPeriod,
        )

  // Calculate Avg Hash Revenue - At Prod. Date Price
  // Formula: Revenue at Production Date Price × seconds per day / Avg Hashrate in PH/s
  const avgHashRevenueAtProdDate =
    !dateRange || !hasValidDateRange
      ? 0
      : calculateAvgHashRevenueAtProdDate(processedTransactionData, processedPrices, avgHashrate)

  // Calculate curtailment rate
  const getCurtailmentRate = () => {
    if (!dateRange || !hasValidDateRange || processedElectricityData.length === 0) {
      return 0
    }

    const usedEnergy = _sumBy(processedElectricityData, 'usedEnergy')
    const powerConsumptionMW = toMW(avgPowerConsumption)

    const { curtailmentRate } = calculateCurtailment(
      usedEnergy,
      nominalAvailablePowerMWh,
      powerConsumptionMW,
      hoursInPeriod,
    )

    return curtailmentRate
  }

  const curtailmentRate = getCurtailmentRate()

  // Calculate hashrate capacity factors
  const hashrateCapacityFactors =
    !dateRange || !hasValidDateRange || nominalHashrateMHS === 0
      ? 0
      : calculateHashrateCapacityFactors(avgHashrate, nominalHashrateMHS)

  // Check loading states for all API queries
  const isLoading =
    isSiteLoading ||
    isTransactionsLoading ||
    isHistoricalPricesLoading ||
    isHistoricalBlockSizesLoading ||
    isMempoolLoading ||
    isTailLogLoading ||
    isProductionCostsLoading ||
    isNominalConfigValuesLoading ||
    isElectricityLoading

  const logEntries = sortedRevenueLog

  // Calculate metrics from log entries
  const getMetrics = () => {
    if (logEntries.length === 0) {
      return {
        totalBitcoin: '0',
        avgEnergyRevenueAtProdDate: '0',
        avgEnergyRevenueAtProdDateSats: '0',
        avgEnergyRevenueInBitcoin: '0',
        avgPowerConsumption: '0',
        avgPowerConsumptionUnit: '',
        energyCurtailmentRate: '0',
        avgHashRevenueAtProdDate: '0',
        avgHashRevenueAtProdDateSats: '0',
        avgHashRevenueInBitcoin: '0',
        avgHashrate: '0',
        avgHashrateUnit: '',
        hashrateCapacityFactors: '0',
      }
    }

    // Sum all totalRevenueBTC from all log entries for Total Bitcoin card
    const totalBTC = _reduce(logEntries, (sum, { totalRevenueBTC = 0 }) => sum + totalRevenueBTC, 0)
    const avgEnergyRevenueBTC =
      _reduce(logEntries, (sum, entry) => sum + (entry.energyRevenueBTC_MW || 0), 0) /
      logEntries.length
    const avgHashRevenueBTC =
      _reduce(logEntries, (sum, entry) => sum + (entry.hashRevenueBTC || 0), 0) / logEntries.length

    // Convert power consumption using formatPowerConsumption to dynamically determine unit
    // The avgPowerConsumption is in W
    // formatPowerConsumption will automatically select kW for values >= 1000 and < 1e6
    // and MW for values >= 1e6
    const powerConsumptionUnitData = formatPowerConsumption(avgPowerConsumption)
    // Convert hashrate from MH/s to appropriate unit using getHashrateUnit
    // Use 3 decimal places to preserve precision (e.g., 1.525 PH/s instead of 1.53 PH/s)
    const hashrateUnitData = getHashrateUnit(avgHashrate, 3)
    // Convert curtailment rate to percentage
    const curtailmentRatePercent = curtailmentRate * 100

    // avgHashrate is in MH/s, convert to PH/s
    const avgHashratePHS = avgHashrate > 0 ? toPHS(avgHashrate) : 0
    // Formula: Avg Hash Revenue (BTC) = Total Bitcoin Produced × 60 × 60 × 24 / Avg Hashrate in PH/s
    // = Total Bitcoin Produced × 86400 / Avg Hashrate in PH/s
    const secondsPerDay = 60 * 60 * 24 // 86400
    const avgHashRevenueBTCPerPHS =
      avgHashratePHS > 0 ? (totalBTC * secondsPerDay) / avgHashratePHS : 0
    const avgHashRevenueSatsPerPHS = avgHashRevenueBTCPerPHS * BTC_SATS

    // Calculate Avg Energy Revenue - In Bitcoin Terms
    // Formula: Avg Energy Revenue (BTC) = Total Bitcoin Produced / Total MWh
    // Total MWh = Avg Consumption in MW × Number of hours in period
    const avgPowerConsumptionMW = avgPowerConsumption > 0 ? toMW(avgPowerConsumption) : 0
    const totalMWh = avgPowerConsumptionMW * hoursInPeriod
    const avgEnergyRevenueBTCPerMWh = totalMWh > 0 ? totalBTC / totalMWh : 0
    // Formula: Total Bitcoin Produced / Total MWh, then convert to SATS
    const avgEnergyRevenueSatsPerMWh = avgEnergyRevenueBTCPerMWh * BTC_SATS

    return {
      totalBitcoin: formatNumber(totalBTC, { maximumFractionDigits: 8 }),
      avgEnergyRevenueAtProdDate: formatNumber(avgEnergyRevenueAtProdDate, {
        maximumFractionDigits: 2,
      }),
      avgEnergyRevenueAtProdDateSats: formatNumber(avgEnergyRevenueSatsPerMWh, {
        maximumFractionDigits: 0,
      }),
      avgEnergyRevenueInBitcoin: formatNumber(avgEnergyRevenueBTC * 1e8, {
        maximumFractionDigits: 0,
      }), // Convert to sats
      avgPowerConsumption: formatNumber(powerConsumptionUnitData.value || 0, {
        maximumFractionDigits: 3,
      }),
      avgPowerConsumptionUnit: powerConsumptionUnitData.unit || '',
      energyCurtailmentRate: formatNumber(curtailmentRatePercent, { maximumFractionDigits: 2 }),
      avgHashRevenueAtProdDate: formatNumber(avgHashRevenueAtProdDate, {
        maximumFractionDigits: 2,
      }),
      avgHashRevenueAtProdDateSats: formatNumber(avgHashRevenueSatsPerPHS, {
        maximumFractionDigits: 0,
      }),
      avgHashRevenueInBitcoin: formatNumber(avgHashRevenueBTC * 1e8, {
        maximumFractionDigits: 0,
      }), // Convert to sats
      // Use formatNumber directly instead of formatHashrate to preserve 3 decimal places
      avgHashrate: formatNumber(hashrateUnitData.value || 0, { maximumFractionDigits: 3 }),
      avgHashrateUnit: hashrateUnitData.unit || '',
      hashrateCapacityFactors: formatNumber(hashrateCapacityFactors, { maximumFractionDigits: 2 }),
    }
  }

  const metrics = getMetrics()

  // Prepare chart data for RevenueChart component
  // Transform data to match the format expected by RevenueChart
  const getRevenueChartData = () => {
    const revenueDataForChart = {
      regions: [
        {
          region: siteName,
          log: sortedRevenueLog,
        },
      ],
    }

    if (!revenueDataForChart.regions || revenueDataForChart.regions.length === 0) {
      return []
    }

    // Transform revenue data to chart format (same as useRevenueData hook)
    const transformedData = transformRevenueDataForChart(revenueDataForChart)

    // Get site list for the chart (single site in this case)
    const chartSiteList = siteName ? [{ id: siteName, name: siteName }] : []

    // Convert to chart format (use case-insensitive matching for Financial page)
    return convertToChartFormat(transformedData, chartSiteList, {
      caseInsensitiveMatching: true,
    }) as Array<{
      timeKey: string
      period: string
      timestamp: number
      [key: string]: unknown
    }>
  }

  const revenueChartData = getRevenueChartData()

  // Prepare site list for charts
  const siteList = siteName ? [{ id: siteName, name: siteName }] : []

  // Calculate raw values for backward compatibility
  // Calculate Avg Energy Revenue - In Bitcoin Terms
  // Formula: Avg Energy Revenue (BTC) = Total Bitcoin Produced / Total MWh, then convert to SATS
  const totalBTC = _reduce(logEntries, (sum, { totalRevenueBTC = 0 }) => sum + totalRevenueBTC, 0)
  const avgPowerConsumptionMW = avgPowerConsumption > 0 ? toMW(avgPowerConsumption) : 0
  const totalMWh = avgPowerConsumptionMW * hoursInPeriod
  const avgEnergyRevenueBTCPerMWh = totalMWh > 0 ? totalBTC / totalMWh : 0
  const avgEnergyRevenueSatsPerMWh = avgEnergyRevenueBTCPerMWh * BTC_SATS

  // Avg Hash Revenue - In Bitcoin Terms
  // Formula: Avg Hash Revenue (BTC) = Total Bitcoin Produced × 60 × 60 × 24 / Avg Hashrate in PH/s
  // = Total Bitcoin Produced × 86400 / Avg Hashrate in PH/s
  const avgHashratePHS = avgHashrate > 0 ? toPHS(avgHashrate) : 0
  const secondsPerDay = 60 * 60 * 24 // 86400
  const avgHashRevenueBTCPerPHS =
    avgHashratePHS > 0 ? (totalBTC * secondsPerDay) / avgHashratePHS : 0
  const avgHashRevenueSatsPerPHS = avgHashRevenueBTCPerPHS * BTC_SATS

  return {
    isLoading,
    dateRange: dateRange as TimeframeDateRange | undefined,
    handleRangeChange,
    handleReset,
    revenueData: {
      regions: [
        {
          region: siteName,
          log: sortedRevenueLog,
        },
      ],
    },
    metrics,
    revenueChartData,
    siteList,
    // Keep raw values for backward compatibility if needed
    avgEnergyRevenueAtProdDate,
    avgHashRevenueAtProdDate,
    avgEnergyRevenueAtProdDateSats: avgEnergyRevenueSatsPerMWh,
    avgHashRevenueAtProdDateSats: avgHashRevenueSatsPerPHS,
    avgPowerConsumption,
    avgHashrate,
    curtailmentRate,
    hashrateCapacityFactors,
  }
}
