import dayjs from 'dayjs'
import _entries from 'lodash/entries'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _min from 'lodash/min'
import _reduce from 'lodash/reduce'
import _sum from 'lodash/sum'
import _toNumber from 'lodash/toNumber'
import _toString from 'lodash/toString'
import _values from 'lodash/values'

import type {
  BitcoinHashPricesData,
  SiteFinancialMetrics,
  SiteHashRevenueCostData,
} from '../types/HashBalance.types'

import { getPeriodPrice, safeDiv, tsToMonthYear } from './hashRevenueCostHelpers'

import { TIMEFRAME_TYPE } from '@/constants/ranges'
import type { MinerHistoricalPrice, PeriodValue, ProductionCostData, TimeframeType } from '@/types'

const getPeriodCosts = (
  costsData: ProductionCostData[],
  ts: number,
  timeFrameType?: TimeframeType | null,
) => {
  const defaultCosts = {
    totalCostsUSD: 0,
  }

  if (timeFrameType === TIMEFRAME_TYPE.WEEK) return defaultCosts

  const { year, month } = tsToMonthYear(_toString(ts))

  const filtered = _filter(costsData, ({ year: costYear, month: costMonth }) =>
    timeFrameType === TIMEFRAME_TYPE.YEAR
      ? costYear === year
      : costYear === year && costMonth === month,
  )

  return _reduce(
    filtered,
    (acc, curr) => {
      if (curr.energyCost > 0 || curr.operationalCost > 0) {
        acc.totalCostsUSD += curr.energyCost + curr.operationalCost
      }

      return acc
    },
    { ...defaultCosts },
  )
}

const calculateCostsForEntry = (
  costsData: ProductionCostData[],
  ts: number,
  timeFrameType?: TimeframeType | null,
) => {
  const costs = getPeriodCosts(costsData, ts, timeFrameType)

  return {
    totalCostsUSD: _sum(_values(costs)),
  }
}

const createLogEntry = ({
  ts,
  period,
  totalRevenueBTC,
  totalFeesBTC,
  sitePowerW,
  hashrateMHS,
  priceUSD,
  totalCostsUSD,
}: {
  ts: number
  period: PeriodValue
  totalRevenueBTC: number
  totalFeesBTC: number
  sitePowerW: number
  hashrateMHS: number
  priceUSD: number
  totalCostsUSD: number
}) => {
  const date = new Date(ts)
  const revenueUSD = totalRevenueBTC * priceUSD
  const totalFeesUSD = totalFeesBTC * priceUSD

  const hashratePHS = hashrateMHS / 1e9

  const logEntry = {
    ts,
    period,
    totalRevenueBTC,
    totalFeesBTC,
    totalFeesUSD,
    revenueUSD,
    totalCostsUSD,
    hashRevenueBTC_PHS_d: safeDiv(totalRevenueBTC, hashratePHS),
    hashRevenueUSD_PHS_d: safeDiv(revenueUSD, hashratePHS),
    hashCostBTC_PHS_d: safeDiv(totalCostsUSD / priceUSD, hashratePHS),
    hashCostUSD_PHS_d: safeDiv(totalCostsUSD, hashratePHS),
    hashrateMHS,
    sitePowerW,
  } as SiteFinancialMetrics

  if (period === 'monthly') {
    logEntry.month = date.getMonth() + 1
    logEntry.year = date.getFullYear()
    logEntry.monthName = date.toLocaleString('en-US', { month: 'long' })
  }

  return logEntry
}

export const generateLogEntries = ({
  data,
  period,
  timeFrameType,
  costsData,
  btcPricesData,
}: {
  data:
    | SiteHashRevenueCostData
    | {
        [x: string]: {
          totalRevenueBTC: number
          totalFeesBTC: number
          sitePowerW: number
          hashrateMHS: number
        }
      }
  period: PeriodValue
  timeFrameType?: TimeframeType | null
  btcPricesData: MinerHistoricalPrice[]
  costsData: ProductionCostData[]
}) =>
  _map(_entries(data), ([periodTsStr, metrics]) => {
    const ts = _toNumber(periodTsStr)
    const priceUSD = getPeriodPrice(btcPricesData, ts, period)
    const { totalCostsUSD } = calculateCostsForEntry(costsData, ts, timeFrameType)

    return createLogEntry({
      ts,
      period,
      totalCostsUSD,
      totalRevenueBTC: metrics.totalRevenueBTC,
      totalFeesBTC: metrics.totalFeesBTC,
      sitePowerW: metrics.sitePowerW,
      hashrateMHS: metrics.hashrateMHS,
      priceUSD,
    })
  })

export const getCombinedHashpriceData = (
  revenueData: SiteFinancialMetrics[] = [],
  hashPriceData: BitcoinHashPricesData[] = [],
) =>
  _map(revenueData, (rev) => {
    const hashPriceEntry = _find(hashPriceData, (hp) => {
      const revDate = dayjs(rev.ts)
      const hpDate = dayjs(hp.ts)
      return (
        Math.abs(revDate.diff(hpDate)) ===
        _min(_map(hashPriceData, (hp) => Math.abs(revDate.diff(dayjs(hp.ts)))))
      )
    })
    return {
      date: dayjs(rev.ts).format('YYYY-MM-DD'),
      cost: _get(rev, 'hashCostUSD_PHS_d', null),
      revenue: _get(rev, 'hashRevenueUSD_PHS_d', null),
      networkHashprice: _get(hashPriceEntry, 'hashprice', null),
    }
  })
