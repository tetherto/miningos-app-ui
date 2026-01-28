import _entries from 'lodash/entries'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _isNull from 'lodash/isNull'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _toNumber from 'lodash/toNumber'
import _trim from 'lodash/trim'

import { getStartOfDay } from '../../common/financial.helpers'
import { BLOCKS_PER_DAY, BTC_SATS, NON_METRIC_KEYS } from '../HashBalance.constants'
import type { BitcoinHashPricesData, HashrateData, RevenueRecord } from '../types/HashBalance.types'

import {
  aggregateByPeriod,
  getPeriodPrice,
  mergeDataSources,
  safeDiv,
} from './hashRevenueCostHelpers'

import type {
  HashrateAggregateData,
  HashratePowermeter,
  MinerHistoricalBlockSizes,
  MinerHistoricalPrice,
  MinerTransaction,
  PeriodValue,
} from '@/types'

const calculateTransactionSum = (transactions: MinerTransaction['transactions']) =>
  _reduce(
    transactions || [],
    (acc, tx) => {
      if (_isNumber(tx?.changed_balance)) {
        acc.revenue += tx.changed_balance
        acc.fees += tx.mining_extra.tx_fee
      } else if (_isNumber(tx?.satoshis_net_earned)) {
        acc.revenue += tx.satoshis_net_earned / BTC_SATS
        acc.fees += tx.fees_colected_satoshis as number
      }
      return acc
    },
    { revenue: 0, fees: 0 },
  )

export const processTransactionData = (transactionsRes: MinerTransaction[][]): RevenueRecord =>
  _reduce(
    _head(transactionsRes) as MinerTransaction[],
    (acc: RevenueRecord, { ts, transactions }: MinerTransaction) => {
      const dayTs = getStartOfDay(Number(ts))
      acc[dayTs] = {
        ts: dayTs,
        totalRevenueBTC: calculateTransactionSum(transactions).revenue,
        totalFeesBTC: calculateTransactionSum(transactions).fees,
      }

      return acc
    },
    {} as RevenueRecord,
  )

export const processTailLogData = (
  tailLogRangeAggrRes: HashrateAggregateData[][],
): HashrateData => {
  const tailLogData = _head(tailLogRangeAggrRes) || []
  const minerData = _head(tailLogData)?.data || []
  const powermeterData: HashratePowermeter[] = _get(tailLogData, ['1', 'data']) || []

  let processedData: HashrateData = {}

  _forEach(minerData, ({ ts, val }) => {
    const dayTs = getStartOfDay(ts)
    const hashrateVal =
      'hashrate_mhs_5m_sum_aggr' in (val || {})
        ? (val as { hashrate_mhs_5m_sum_aggr: number }).hashrate_mhs_5m_sum_aggr
        : 0
    processedData[dayTs] = {
      ...processedData[dayTs],
      ts: dayTs,
      hashrateMHS: hashrateVal + (processedData[dayTs]?.hashrateMHS ?? 0),
    }
  })

  _forEach(powermeterData, ({ ts, val }) => {
    const dayTs = getStartOfDay(ts)
    processedData[dayTs] = {
      ...processedData[dayTs],
      ts: dayTs,
      sitePowerW: (val?.['site_power_w'] || 0) + (processedData[dayTs]?.sitePowerW ?? 0),
    }
  })

  return processedData
}

export const getLogSummary = (log: unknown[] = []) => {
  const allNonMetricKeys = new Set<string>([...NON_METRIC_KEYS])

  const summaryData = _reduce(
    log,
    (acc, entry) => {
      _forEach(_entries(entry as Record<string, unknown>), ([key, val]) => {
        if (allNonMetricKeys.has(key)) return

        const numVal = _isNumber(val) ? val : parseFloat(String(val))
        const isMissing = _isNil(val) || (_isString(val) && _trim(val) === '')

        // Initialize to null only once if not present
        if (!(key in acc.sum)) {
          acc.sum[key] = isMissing ? null : numVal
        } else {
          if (_isNull(acc.sum[key])) {
            acc.sum[key] = isMissing ? null : numVal
          } else {
            const valueToAdd = isMissing ? 0 : numVal
            if (Number.isFinite(valueToAdd)) {
              acc.sum[key] += valueToAdd
            }
          }
        }
      })

      acc.count++
      return acc
    },
    { sum: {} as Record<string, number | null>, count: 0 },
  )

  const avg: Record<string, number | null> = {}
  _forEach(_keys(summaryData.sum), (key) => {
    const value = summaryData.sum[key]
    avg[key] = _isNumber(value) && summaryData.count ? value / summaryData.count : null
  })

  return {
    sum: summaryData.sum,
    avg,
  }
}

export const processHashPricesData = (
  blocksData: MinerHistoricalBlockSizes[][],
  pricesData: MinerHistoricalPrice[][],
  btcHashrateData: HashrateData,
): BitcoinHashPricesData[] =>
  _map(_head(blocksData || []), (block) => {
    const ts = getStartOfDay(block.ts)
    const subsidySats = block.blockReward - block.blockTotalFees
    const subsidyBTC = subsidySats / BTC_SATS
    const feesBTC = block.blockTotalFees / BTC_SATS
    const priceUSD =
      _find(_head(pricesData || []), ({ ts: hashPriceTs }) => hashPriceTs === Number(ts))
        ?.priceUSD ?? null

    const dailyRevenueUSD =
      priceUSD !== null ? (subsidyBTC + feesBTC) * priceUSD * BLOCKS_PER_DAY : null
    const networkHashrateTHs = safeDiv(btcHashrateData[ts]?.hashrateMHS, 1000000)
    const hashprice = safeDiv(dailyRevenueUSD, networkHashrateTHs)

    return {
      ts,
      hashprice,
      networkHashrateTHs,
      dailyRevenueUSD,
      priceUSD,
      feesBTC,
      subsidyBTC,
      subsidySats,
    }
  })

export const proceedSiteHashRevenueData = (
  transactionsData: MinerTransaction[][],
  pricesData: MinerHistoricalPrice[][],
  hashRateData: HashrateData,
  period: PeriodValue,
) => {
  const proceedTransactionData = processTransactionData(transactionsData)
  const mergedData = mergeDataSources(hashRateData, proceedTransactionData)
  const aggregatedData = aggregateByPeriod(mergedData, period)

  return _map(_entries(aggregatedData), ([periodTsStr, { totalRevenueBTC, hashrateMHS }]) => {
    const ts = _toNumber(periodTsStr)
    const priceUSD = getPeriodPrice(_head(pricesData) || [], ts, period)

    const hashratePHS = hashrateMHS / 1e9
    const revenueUSD = priceUSD && totalRevenueBTC * priceUSD

    const hashRevenueBTC_PHS_d = safeDiv(totalRevenueBTC, hashratePHS)
    const hashRevenueUSD_PHS_d = safeDiv(revenueUSD, hashratePHS)

    return {
      ts,
      hashRevenueBTC_PHS_d,
      hashRevenueUSD_PHS_d,
    }
  })
}
