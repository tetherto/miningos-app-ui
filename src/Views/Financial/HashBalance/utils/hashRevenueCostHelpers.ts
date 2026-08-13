import { getBeginningOfMonth, getEndOfYesterday } from '@/app/utils/dateUtils'
import { PERIOD, TIMEFRAME_TYPE } from '@/constants/ranges'
import { CURRENCY, UNITS } from '@/constants/units'
import { rangeOfYear } from '@/MultiSiteViews/SharedComponents/Header/helper'
import type { MultiSiteDateRange, TimeframeType } from '@/types'

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
