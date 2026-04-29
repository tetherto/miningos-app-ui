import _map from 'lodash/map'

import { useGetFinanceCostSummaryQuery, useGetSiteQuery } from '@/app/services/api'
import { PERIOD } from '@/constants/ranges'
import { getMetrics } from '@/hooks/useCostData'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { useAvgAllInPowerCostData } from '@/MultiSiteViews/RevenueAndCost/Cost/hooks/useAvgAllInPowerCostData'
import type { FinancePeriod } from '@/types'

const toFinancePeriod = (period?: string): FinancePeriod => {
  if (period === PERIOD.WEEKLY) return 'weekly'
  if (period === PERIOD.YEARLY) return 'yearly'
  if (period === PERIOD.DAILY) return 'daily'
  return 'monthly'
}

/**
 * Custom hook for fetching and processing cost summary data for single-site mode.
 * Delegates aggregation to the v2 `/auth/finance/cost-summary` endpoint.
 */
export const useCostSummaryData = () => {
  const { siteId, site, selectedSites, siteList, isMultiSiteModeEnabled } = useMultiSiteMode()
  const { dateRange, onTableDateRangeChange, onDateRangeReset } = useMultiSiteDateRange()

  // Pull site name from API for URL-less single-site navigation
  const { data: siteData } = useGetSiteQuery(undefined, {
    skip: isMultiSiteModeEnabled || Boolean(siteId),
  })

  const { start, end, period } = dateRange ?? {}
  const hasValidDateRange = Boolean(start && end)

  const {
    data: costSummary,
    isLoading: isCostSummaryLoading,
    isFetching: isCostSummaryFetching,
  } = useGetFinanceCostSummaryQuery(
    {
      start: start ?? 0,
      end: end ?? 0,
      period: toFinancePeriod(period),
    },
    {
      skip: !hasValidDateRange || isMultiSiteModeEnabled,
      refetchOnMountOrArgChange: true,
    },
  )

  const { data: revenueData, isLoading: isRevenueDataLoading } = useAvgAllInPowerCostData()

  // Early return for multi-site mode - this hook is single-site only
  if (isMultiSiteModeEnabled) {
    const emptyMetrics = getMetrics({ allInCost: 0, energyCost: 0, operationsCost: 0 })
    return {
      site,
      data: {
        costData: {},
        revenueData: [],
        allInCost: 0,
        energyCost: 0,
        operationsCost: 0,
        btcData: { log: [] },
        metrics: emptyMetrics,
      },
      isDataLoading: false,
      isRevenueDataLoading: false,
      metrics: emptyMetrics,
      dateRange,
      onTableDateRangeChange,
      onDateRangeReset,
      siteId,
      selectedSites,
      siteList,
    }
  }

  const log = costSummary?.log ?? []
  const summary = costSummary?.summary

  const allInCost = summary?.avgAllInCostPerMWh ?? null
  const energyCost = summary?.avgEnergyCostPerMWh ?? null
  const operationsCost =
    summary && summary.totalConsumptionMWh > 0
      ? summary.totalOperationalCostsUSD / summary.totalConsumptionMWh
      : null

  const metrics = getMetrics({ allInCost, energyCost, operationsCost })

  const costData =
    log.length > 0
      ? {
          summary: _map(log, (entry) => ({ ts: entry.ts, totalCost: entry.totalCostsUSD })),
          energyCostsUSD: summary?.totalEnergyCostsUSD ?? 0,
          operationalCostsUSD: summary?.totalOperationalCostsUSD ?? 0,
        }
      : {}

  const btcPriceChartData = {
    log: _map(log, (entry) => ({ ts: entry.ts, priceUSD: entry.btcPrice })),
  }

  const isDataLoading = isCostSummaryLoading || isCostSummaryFetching

  const siteNameFromApi = (siteData as { site?: string } | undefined)?.site
  const currentSite = site || (siteNameFromApi ? { name: siteNameFromApi } : site)

  return {
    site: currentSite,
    data: {
      costData,
      revenueData: revenueData || [],
      allInCost,
      energyCost,
      operationsCost,
      btcData: btcPriceChartData,
      metrics,
    },
    isDataLoading,
    isRevenueDataLoading: isRevenueDataLoading || false,
    metrics,
    dateRange,
    onTableDateRangeChange,
    onDateRangeReset,
    siteId,
    selectedSites,
    siteList,
  }
}
