import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _flatMap from 'lodash/flatMap'
import _forEach from 'lodash/forEach'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _merge from 'lodash/merge'
import _reduce from 'lodash/reduce'
import _replace from 'lodash/replace'
import _size from 'lodash/size'
import _startCase from 'lodash/startCase'
import _toLower from 'lodash/toLower'
import _uniq from 'lodash/uniq'
import _values from 'lodash/values'

import { DATE_RANGE, REVENUE_MULTIPLIER } from '../../constants'

import { getUteEnergyAggrDataset } from './electricityUtils'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface Transaction {
  mining_extra?: {
    pps?: number
    pps_fee_rate?: number
    tx_fee?: number
    tx_fee_rate?: number
  }
}

interface LogEntry {
  ts: number
  transactions: Transaction[]
}

interface AggregatedPoolEntry {
  ts: number
  pps: number
  pps_fee_rate: number
  tx_fee: number
  tx_fee_rate: number
}

/**
 * Convert revenue data to readable format
 * @param revenueDataItem
 * @param multiplier
 * @returns {number}
 */
export const convertRevenue = (revenueDataItem: number, multiplier = 1): number =>
  revenueDataItem * multiplier

export const aggregatePoolRevenue = (log: LogEntry[]): AggregatedPoolEntry[] =>
  _map(log, (entry: LogEntry) => ({
    ts: entry.ts,
    pps: aggregateMiningExtra(entry.transactions, 'pps'),
    pps_fee_rate: aggregateMiningExtra(entry.transactions, 'pps_fee_rate'),
    tx_fee: aggregateMiningExtra(entry.transactions, 'tx_fee'),
    tx_fee_rate: aggregateMiningExtra(entry.transactions, 'tx_fee_rate'),
  }))

type MiningExtraKey = 'pps' | 'pps_fee_rate' | 'tx_fee' | 'tx_fee_rate'

export const aggregateMiningExtra = (transactions: Transaction[], key: MiningExtraKey): number =>
  _reduce(
    transactions,
    (sum: number, currentTransaction: Transaction) =>
      sum + (currentTransaction.mining_extra?.[key] || 0),
    0,
  )

interface DataItem {
  ts: number | string
  balance?: number
  unsettled?: number
  revenue_24h?: number
  hashrate?: number
  hashrate_1h?: number
  hashrate_24h?: number
  hashrate_stale_1h?: number
  hashrate_stale_24h?: number
  worker_count?: number
  estimated_today_income?: number
  active_workers_count?: number
}

interface AggregatedDataItem extends DataItem {
  count: number
  label: string
}

/**
 * Aggregate data based on range
 * @param data
 * @param range
 * @returns {array}
 */
export const aggregateData = (data: DataItem[], range: string): DataItem[] => {
  const grouped: Record<string, AggregatedDataItem> = {}

  if (range === DATE_RANGE.M15 || range === DATE_RANGE.H1) return data

  _forEach(data, (item: DataItem) => {
    const date = new Date(item.ts)
    let key: string
    switch (range) {
      case DATE_RANGE.D1:
        key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` // Group by day
        break
      case DATE_RANGE.W1: {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
        const daysSinceFirstDay = Math.floor(
          (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000),
        )
        const weekNumber = Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay()) / 7)
        key = `${date.getFullYear()}-${weekNumber}` // Group by week
        break
      }
      case DATE_RANGE.MONTH1:
        key = `${date.getFullYear()}-${date.getMonth() + 1}` // Group by month
        break
      default:
        return
    }

    if (!grouped[key]) {
      // Initialize values to 0 to prevent NaN during aggregation
      // Convert timestamp to start of day in ISO format
      const date = new Date(item.ts)
      date.setHours(0, 0, 0, 0)
      grouped[key] = {
        balance: item.balance ?? 0,
        unsettled: item.unsettled ?? 0,
        revenue_24h: item.revenue_24h ?? 0,
        hashrate: item.hashrate ?? 0,
        hashrate_1h: item.hashrate_1h ?? 0,
        hashrate_24h: item.hashrate_24h ?? 0,
        hashrate_stale_1h: item.hashrate_stale_1h ?? 0,
        hashrate_stale_24h: item.hashrate_stale_24h ?? 0,
        worker_count: item.worker_count ?? 0,
        estimated_today_income: item.estimated_today_income ?? 0,
        active_workers_count: item.active_workers_count ?? 0,
        ts: date.toISOString(),
        count: 1,
        label: key,
      }
    } else {
      // Aggregate sums safely
      grouped[key].balance = (grouped[key].balance ?? 0) + (item.balance ?? 0)
      grouped[key].unsettled = (grouped[key].unsettled ?? 0) + (item.unsettled ?? 0)
      grouped[key].revenue_24h = (grouped[key].revenue_24h ?? 0) + (item.revenue_24h ?? 0)
      grouped[key].hashrate = (grouped[key].hashrate ?? 0) + (item.hashrate ?? 0)
      grouped[key].hashrate_1h = (grouped[key].hashrate_1h ?? 0) + (item.hashrate_1h ?? 0)
      grouped[key].hashrate_24h = (grouped[key].hashrate_24h ?? 0) + (item.hashrate_24h ?? 0)
      grouped[key].hashrate_stale_1h =
        (grouped[key].hashrate_stale_1h ?? 0) + (item.hashrate_stale_1h ?? 0)
      grouped[key].hashrate_stale_24h =
        (grouped[key].hashrate_stale_24h ?? 0) + (item.hashrate_stale_24h ?? 0)
      grouped[key].worker_count = (grouped[key].worker_count ?? 0) + (item.worker_count ?? 0)
      grouped[key].estimated_today_income =
        (grouped[key].estimated_today_income ?? 0) + (item.estimated_today_income ?? 0)
      grouped[key].active_workers_count =
        (grouped[key].active_workers_count ?? 0) + (item.active_workers_count ?? 0)
      grouped[key].count++
    }
  })

  return _map(_values(grouped))
}

interface PoolSnap {
  stats?: PoolStats
  raw_errors?: string[]
}

interface PoolStats {
  balance?: number
  unsettled?: number
  revenue_24h?: number
  hashrate?: number
  hashrate_1h?: number
  hashrate_24h?: number
  hashrate_stale_1h?: number
  hashrate_stale_24h?: number
  worker_count?: number
  estimated_today_income?: number
  active_workers_count?: number
  yearlyBalances?: YearlyBalance[]
  containers?: UnknownRecord
}

interface YearlyBalance {
  month: string
  balance: number
}

export interface F2PoolLogEntry {
  ts: number
  pool_snap?: PoolSnap[]
  aggrCount?: number
  aggrIntervals?: number
  pool_hashrate_type_grp_sum_aggr?: unknown
  pool_active_workers_count_type_grp_sum_aggr?: unknown
}

export interface AggregatedF2PoolStats extends PoolStats {
  raw_errors: string[]
  ts: number
  aggrCount: number
  aggrIntervals: number
  key: number
  pool_hashrate_type_grp_sum_aggr?: unknown
  pool_active_workers_count_type_grp_sum_aggr?: unknown
}

export const aggregateF2PoolSnapLog = (
  list: F2PoolLogEntry[],
  timeline: string,
  multiplier?: number,
): Partial<AggregatedF2PoolStats>[] => {
  multiplier = multiplier ?? (REVENUE_MULTIPLIER as Record<string, number>)[timeline]

  const filteredNilData = _filter(list, (entry: F2PoolLogEntry) => !_isNil(entry))
  return _map(filteredNilData, (entry: F2PoolLogEntry) => {
    if (!entry.pool_snap) {
      return {
        ts: entry.ts,
        key: entry.ts,
      }
    }

    const aggregatedPoolSnap =
      aggregateF2PoolStats(
        entry.pool_snap,
        entry.ts,
        entry.aggrCount,
        entry.aggrIntervals,
        multiplier,
      ) || {}

    return {
      ...aggregatedPoolSnap,
      pool_hashrate_type_grp_sum_aggr: entry?.pool_hashrate_type_grp_sum_aggr,
      pool_active_workers_count_type_grp_sum_aggr:
        entry?.pool_active_workers_count_type_grp_sum_aggr,
    }
  })
}

export interface ThingSnapEntry {
  last?: {
    snap?: PoolSnap
  }
}

export const aggregateF2PoolThingSnap = (log: ThingSnapEntry[]): Partial<AggregatedF2PoolStats> =>
  aggregateF2PoolStats(_map(log, ({ last }) => last?.snap))

export const getFormattedPoolName = (poolName: string): string =>
  _replace(_startCase(_toLower(_replace(poolName, 'minerpool-', ''))), /\s/g, '')

export const aggregateF2PoolStats = (
  pool: (PoolSnap | undefined)[],
  ts?: number,
  aggrCount?: number,
  aggrIntervals?: number,
  multiplier = 1,
): Partial<AggregatedF2PoolStats> =>
  _reduce(
    pool,
    (result: Partial<AggregatedF2PoolStats>, snap: PoolSnap | undefined) => {
      if (!snap && _size(pool) === 1) return result
      if (!snap) return result
      const poolStats = snap.stats || {}
      _forEach(
        [
          'balance',
          'unsettled',
          'revenue_24h',
          'hashrate',
          'hashrate_1h',
          'hashrate_24h',
          'hashrate_stale_1h',
          'hashrate_stale_24h',
          'worker_count',
          'estimated_today_income',
          'active_workers_count',
        ] as const,
        (key: keyof PoolStats) => {
          const numericValue = poolStats[key] as number | undefined
          ;(result as Record<string, number>)[key] =
            ((result as Record<string, number>)[key] ?? 0) +
            (convertRevenue(numericValue ?? 0, multiplier) || 0)
        },
      )

      result.raw_errors = result.raw_errors!.concat(snap.raw_errors || [])
      // Take all months with balance from both pools
      const monthsWithBalance = _uniq(
        _flatMap(
          [result.yearlyBalances, poolStats.yearlyBalances],
          (arr: YearlyBalance[] | undefined) => _map(arr, 'month'),
        ),
      )
      // Merge balances for each month
      result.yearlyBalances = _map(monthsWithBalance, (month: string) => {
        const prevBalance = _find(result.yearlyBalances, { month })?.balance || 0
        const balanceToAdd = _find(poolStats.yearlyBalances, { month })?.balance || 0
        return { month, balance: prevBalance + balanceToAdd }
      })
      result.containers = _merge(result.containers, poolStats.containers)
      result.ts = ts ?? 0
      result.aggrCount = aggrCount ?? 0
      result.aggrIntervals = aggrIntervals ?? 0
      result.key = ts ?? 0

      return result as unknown as AggregatedF2PoolStats
    },
    {
      raw_errors: [],
      ts: 0,
      balance: 0,
      unsettled: 0,
      revenue_24h: 0,
      hashrate: 0,
      hashrate_1h: 0,
      hashrate_24h: 0,
      hashrate_stale_1h: 0,
      hashrate_stale_24h: 0,
      estimated_today_income: 0,
      worker_count: 0,
      active_workers_count: 0,
      yearlyBalances: [],
      containers: {},
      aggrCount: 0,
      aggrIntervals: 0,
      key: 0,
    } as AggregatedF2PoolStats,
  )

interface TailLogDataItem {
  ts: number
}

export const findClosestObjectToNextHour = (tailLogData: TailLogDataItem[]): TailLogDataItem => {
  const currentTime = Date.now()
  const nextHourTimestamp = currentTime + 60 * 60 * 1000
  const closestObject = _reduce(
    tailLogData,
    (closest: TailLogDataItem, currentObject: TailLogDataItem) => {
      const currentTimestamp = currentObject.ts
      const closestTimestamp = closest.ts
      const currentDifference = Math.abs(currentTimestamp - nextHourTimestamp)
      const closestDifference = Math.abs(closestTimestamp - nextHourTimestamp)

      return currentDifference < closestDifference ? currentObject : closest
    },
  )

  return closestObject!
}

interface EnergyAggrItem {
  ts: number
  key: number
  [key: string]: unknown
}

export const getKunaEnergyAggr = (tailLogData: TailLogDataItem[]): EnergyAggrItem[] =>
  _map(tailLogData, (log: TailLogDataItem) => ({
    ...getUteEnergyAggrDataset(log as unknown as UnknownRecord),
    ts: log.ts,
    key: log.ts,
  }))

export const getRangeStatsKey = (range: string): string => {
  switch (range) {
    case DATE_RANGE.MONTH1:
    case DATE_RANGE.W1:
      return DATE_RANGE.D1
    default:
      return range
  }
}
