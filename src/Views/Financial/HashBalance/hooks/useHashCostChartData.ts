import _map from 'lodash/map'

import { getHashCostMetrics } from '../utils/hashRevenueCostHelpers'

import { useGetFinanceHashRevenueQuery } from '@/app/services/api'
import { PERIOD, TIMEFRAME_TYPE } from '@/constants/ranges'
import type { FinancePeriod, MultiSiteDateRange, TimeframeType } from '@/types'

const toFinancePeriod = (period?: string): FinancePeriod => {
  if (period === PERIOD.WEEKLY) return 'weekly'
  if (period === PERIOD.YEARLY) return 'yearly'
  if (period === PERIOD.DAILY) return 'daily'
  return 'monthly'
}

interface UseHashCostChartDataParams {
  dateRange: MultiSiteDateRange
  timeFrameType?: TimeframeType | null
}

export const useHashCostChartData = ({ dateRange, timeFrameType }: UseHashCostChartDataParams) => {
  const { start, end, period } = dateRange ?? {}

  const { data, isLoading } = useGetFinanceHashRevenueQuery(
    { start: start ?? 0, end: end ?? 0, period: toFinancePeriod(period) },
    {
      skip: !start || !end || timeFrameType === TIMEFRAME_TYPE.WEEK,
      refetchOnMountOrArgChange: true,
    },
  )

  if (timeFrameType === TIMEFRAME_TYPE.WEEK) {
    return { isLoading: false, data: [], metrics: {} }
  }

  const log = data?.log ?? []
  const summary = data?.summary

  const chartData =
    timeFrameType === TIMEFRAME_TYPE.YEAR
      ? _map(log, (entry) => ({
          date: entry.ts,
          cost: entry.hashCostUSDPerPHsPerDay ?? 0,
          revenue: entry.hashRevenueUSDPerPHsPerDay ?? 0,
          networkHashprice: entry.networkHashPriceUSDPerPHsPerDay ?? 0,
        }))
      : []

  const metrics = getHashCostMetrics({
    avgHashCost: summary?.avgHashCostUSDPerPHsPerDay ?? 0,
    avgHashRevenue: summary?.avgHashRevenueUSDPerPHsPerDay ?? 0,
    avgNetworkHashprice: summary?.avgNetworkHashPriceUSDPerPHsPerDay ?? 0,
  })

  return {
    isLoading,
    data: chartData,
    metrics,
  }
}
