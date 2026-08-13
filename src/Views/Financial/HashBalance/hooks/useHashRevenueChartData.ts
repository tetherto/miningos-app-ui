import _map from 'lodash/map'

import { getHashRevenueMetrics } from '../utils/hashRevenueCostHelpers'

import { useGetFinanceHashRevenueQuery } from '@/app/services/api'
import { PERIOD } from '@/constants/ranges'
import type { FinancePeriod, MultiSiteDateRange } from '@/types'

const toFinancePeriod = (period?: string): FinancePeriod => {
  if (period === PERIOD.WEEKLY) return 'weekly'
  if (period === PERIOD.YEARLY) return 'yearly'
  if (period === PERIOD.DAILY) return 'daily'
  return 'monthly'
}

export const useHashRevenueChartData = ({
  dateRange,
  currency,
}: {
  dateRange: MultiSiteDateRange
  currency: string
}) => {
  'use no memo'
  const { start, end, period } = dateRange ?? {}

  const { data, isLoading } = useGetFinanceHashRevenueQuery(
    { start: start ?? 0, end: end ?? 0, period: toFinancePeriod(period) },
    { skip: !start || !end, refetchOnMountOrArgChange: true },
  )

  const log = data?.log ?? []
  const summary = data?.summary

  const hashRevueData = _map(log, (entry) => ({
    ts: entry.ts,
    hashRevenueUSD_PHS_d: entry.hashRevenueUSDPerPHsPerDay ?? 0,
    hashRevenueBTC_PHS_d: entry.hashRevenueBTCPerPHsPerDay ?? 0,
  }))

  const historicalHashRateData = _map(log, (entry) => ({
    ts: entry.ts,
    avgHashrateMHs: entry.networkHashrateMhs,
  }))

  const historicalHashPriceData = _map(log, (entry) => ({
    ts: entry.ts,
    hashprice: entry.networkHashPriceUSDPerPHsPerDay ?? 0,
    dailyRevenueUSD: entry.revenueUSD,
    priceUSD: entry.btcPrice,
  }))

  const avgHashRevenue =
    currency === 'BTC'
      ? (summary?.avgHashRevenueBTCPerPHsPerDay ?? 0)
      : (summary?.avgHashRevenueUSDPerPHsPerDay ?? 0)

  const avgNetworkHashprice = summary?.avgNetworkHashPriceUSDPerPHsPerDay ?? 0

  const metrics = getHashRevenueMetrics({
    currency,
    avgHashRevenue,
    avgNetworkHashprice,
  })

  return {
    isHashRevenueLoading: isLoading,
    hashRevueData,
    historicalHashRateData,
    historicalHashPriceData,
    isHistoricalPriceLoading: isLoading,
    isHistoricalHashRateLoading: isLoading,
    metrics,
  }
}
