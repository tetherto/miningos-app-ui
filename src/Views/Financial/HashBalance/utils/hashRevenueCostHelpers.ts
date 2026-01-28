import { startOfMonth } from 'date-fns/startOfMonth'
import { startOfYear } from 'date-fns/startOfYear'
import _entries from 'lodash/entries'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _groupBy from 'lodash/groupBy'
import _isNumber from 'lodash/isNumber'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _mapValues from 'lodash/mapValues'
import _mean from 'lodash/mean'
import _reduce from 'lodash/reduce'
import _transform from 'lodash/transform'
import _union from 'lodash/union'

import { getStartOfDay } from '../../common/financial.helpers'
import {
  DateRangeParams,
  HashrateData,
  RevenueRecord,
  SiteHashRevenueCostData,
} from '../types/HashBalance.types'

import { getBeginningOfMonth, getEndOfYesterday } from '@/app/utils/dateUtils'
import { PERIOD, PeriodValue, TIMEFRAME_TYPE } from '@/constants/ranges'
import { CURRENCY, UNITS } from '@/constants/units'
import { rangeOfYear } from '@/MultiSiteViews/SharedComponents/Header/helper'
import { MinerHistoricalPrice, MultiSiteDateRange, TimeframeType, UnknownRecord } from '@/types'

const PERIOD_CALCULATORS = {
  daily: (timestamp: number) => getStartOfDay(timestamp),
  monthly: (timestamp: number) => startOfMonth(new Date(timestamp)).getTime(),
  yearly: (timestamp: number) => startOfYear(new Date(timestamp)).getTime(),
}

const isTimestampInPeriod = (timestamp: number, periodTs: number, period: PeriodValue) => {
  if (period === PERIOD.DAILY) return timestamp === periodTs

  const periodEnd = getPeriodEndDate(periodTs, period)
  return timestamp >= periodTs && timestamp < periodEnd.getTime()
}

export const safeDiv = (
  numerator: number | undefined | null,
  denominator: number | undefined | null,
) =>
  _isNumber(numerator) && _isNumber(denominator) && denominator !== 0
    ? numerator / denominator
    : null

export const buildHistoricalHashRateParams = ({ start, end }: DateRangeParams): UnknownRecord => ({
  type: 'mempool',
  query: JSON.stringify({ key: 'HISTORICAL_HASHRATE', start, end }),
})

export const buildHistoricalBlockSizesParams = ({
  start,
  end,
}: DateRangeParams): UnknownRecord => ({
  type: 'mempool',
  query: JSON.stringify({ key: 'HISTORICAL_BLOCKSIZES', start, end }),
})

export const getHashCostMetrics = ({
  avgHashCost,
  avgHashRevenue,
  avgNetworkHashprice,
}: {
  avgHashCost: number
  avgHashRevenue: number
  avgNetworkHashprice: number
}) => ({
  avgHashCost: {
    label: 'Avg Hash Cost',
    unit: `${CURRENCY.USD}/${UNITS.HASHRATE_PH_S}/day`,
    value: avgHashCost,
    isHighlighted: true,
  },
  avgHashRevenue: {
    label: 'Avg Hash Revenue',
    unit: `${CURRENCY.USD}/${UNITS.HASHRATE_PH_S}/day`,
    value: avgHashRevenue,
  },
  avgNetworkHashprice: {
    label: 'Avg Network Hashprice',
    unit: `${CURRENCY.USD}/${UNITS.HASHRATE_PH_S}/day`,
    value: avgNetworkHashprice,
  },
})

export const getHashRevenueMetrics = ({
  currency,
  avgHashRevenue,
  avgNetworkHashprice,
}: {
  currency: string
  avgHashRevenue: number
  avgNetworkHashprice: number
}) => ({
  avgHashRevenue: {
    label: 'Avg Hash Revenue',
    unit: `${currency}/${UNITS.HASHRATE_PH_S}/day`,
    value: avgHashRevenue,
  },
  avgNetworkHashprice: {
    label: 'Avg Network Hashprice',
    unit: `${currency}/${UNITS.HASHRATE_PH_S}/day`,
    value: avgNetworkHashprice,
  },
})

export const tsToMonthYear = (timestamp: string) => {
  const date = new Date(parseInt(timestamp))
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  }
}

export const getPeriodKey = (timestamp: number, period: string) => {
  const calculator =
    PERIOD_CALCULATORS[period as keyof typeof PERIOD_CALCULATORS] || PERIOD_CALCULATORS.daily
  return calculator(timestamp)
}

export const getPeriodEndDate = (periodTs: number, period: PeriodValue) => {
  const periodEnd = new Date(periodTs)

  if (period === PERIOD.MONTHLY) {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  if (period === PERIOD.YEARLY) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  }

  return periodEnd
}

export const mergeDataSources = (tailLogData: HashrateData, transactionData: RevenueRecord) => {
  const tailKeys = _keys(tailLogData)
  const txKeys = _keys(transactionData)

  const allKeys = _union(tailKeys, txKeys)

  return _transform(
    allKeys,
    (result, key) => {
      const tail = _get(tailLogData, key, {})
      const tx = _get(transactionData, key, {})

      result[key] = {
        [key]: {
          sitePowerW: _get(tail, 'sitePowerW', 0),
          hashrateMHS: _get(tail, 'hashrateMHS', 0),
          totalRevenueBTC: _get(tx, 'totalRevenueBTC', 0),
          totalFeesBTC: _get(tx, 'totalFeesBTC', 0),
        },
      }
    },
    {} as SiteHashRevenueCostData,
  )
}

export const aggregateByPeriod = (data: SiteHashRevenueCostData, period: PeriodValue) => {
  if (period === 'daily')
    return _entries(data).reduce(
      (acc, [ts, values]) => {
        acc[ts] = {
          ...values[ts],
        }
        return acc
      },
      {} as {
        [x: string]: {
          totalRevenueBTC: number
          totalFeesBTC: number
          sitePowerW: number
          hashrateMHS: number
        }
      },
    )

  const grouped = _groupBy(_entries(data), ([tsStr]) => getPeriodKey(Number(tsStr), period))

  return _mapValues(grouped, (entries) => {
    const merged = _reduce(
      entries,
      (acc, [ts, values]) => {
        acc.totalRevenueBTC += _get(values[ts], 'totalRevenueBTC', 0)
        acc.totalFeesBTC += _get(values[ts], 'totalFeesBTC', 0)
        acc.sitePowerW += _get(values[ts], 'sitePowerW', 0)
        acc.hashrateMHS += _get(values[ts], 'hashrateMHS', 0)
        acc.count += 1
        return acc
      },
      {
        totalRevenueBTC: 0,
        totalFeesBTC: 0,
        sitePowerW: 0,
        hashrateMHS: 0,
        count: 0,
      },
    )

    return {
      totalRevenueBTC: merged.totalRevenueBTC,
      totalFeesBTC: merged.totalFeesBTC,
      sitePowerW: merged.sitePowerW / merged.count,
      hashrateMHS: merged.hashrateMHS / merged.count,
    }
  })
}

export const getPeriodPrice = (
  btcPricesData: MinerHistoricalPrice[],
  periodTs: number,
  period: PeriodValue,
) => {
  if (period === PERIOD.DAILY) {
    return _find(btcPricesData, ({ ts }) => ts === periodTs)?.priceUSD || 0
  }

  const entriesInPeriod = _filter(btcPricesData, ({ ts }) =>
    isTimestampInPeriod(Number(ts), periodTs, period),
  )

  const values = _map(entriesInPeriod, ({ priceUSD }) => priceUSD)

  return values.length > 0
    ? _mean(values)
    : _find(btcPricesData, ({ ts }) => ts === periodTs)?.priceUSD || 0
}

export const getDefaultRange = (timeframeType: TimeframeType | null): MultiSiteDateRange => {
  const isDailyPeriod =
    timeframeType === TIMEFRAME_TYPE.MONTH || timeframeType === TIMEFRAME_TYPE.WEEK

  if (isDailyPeriod) {
    return {
      period: PERIOD.DAILY,
      start: getBeginningOfMonth().getTime(),
      end: getEndOfYesterday().getTime(),
    }
  }

  const CURRENT_YEAR = new Date().getFullYear()
  const [start, end] = rangeOfYear(CURRENT_YEAR)

  return {
    period: PERIOD.MONTHLY,
    start: start.getTime(),
    end: end.getTime(),
  }
}
