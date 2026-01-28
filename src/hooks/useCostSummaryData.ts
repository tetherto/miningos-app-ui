import _entries from 'lodash/entries'
import _filter from 'lodash/filter'
import _flatten from 'lodash/flatten'
import _groupBy from 'lodash/groupBy'
import _map from 'lodash/map'
import _mean from 'lodash/mean'
import _sumBy from 'lodash/sumBy'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import {
  useGetExtDataQuery,
  useGetGlobalDataQuery,
  useGetSiteQuery,
  useGetTailLogRangeAggrQuery,
} from '@/app/services/api'
import { getTimeframeType } from '@/app/slices/multiSiteSlice'
import {
  calculateCostMetrics,
  processProductionCosts,
  type ProductionCostItem,
} from '@/app/utils/costDataUtils'
import { calculateAveragePowerMW, extractPowermeterData } from '@/app/utils/powerConsumptionUtils'
import { TIMEFRAME_TYPE } from '@/constants/ranges'
import { getMetrics } from '@/hooks/useCostData'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { useAvgAllInPowerCostData } from '@/MultiSiteViews/RevenueAndCost/Cost/hooks/useAvgAllInPowerCostData'
import type { MinerHistoricalPriceResponse } from '@/types'
import { getPeriodKey, getPeriodType } from '@/Views/Financial/common/financial.helpers'

const MS_PER_DAY = 1000 * 60 * 60 * 24

type BtcPriceEntry = { ts: number; priceUSD: number }

/**
 * Extract and flatten BTC prices from API response
 */
const extractPrices = (response: unknown): BtcPriceEntry[] => {
  if (!response) return []
  const pricesArray =
    typeof response === 'object' && 'data' in response
      ? (response as { data: unknown }).data
      : response
  if (!Array.isArray(pricesArray)) return []
  return _flatten(pricesArray) as BtcPriceEntry[]
}

/**
 * Aggregate prices to a single monthly average
 */
const aggregateToMonthly = (
  prices: BtcPriceEntry[],
  start: number,
  end: number,
): BtcPriceEntry[] => {
  const pricesInRange = prices.filter((p) => p.ts >= start && p.ts <= end)
  if (pricesInRange.length === 0) return []

  const avgPrice = _mean(_map(pricesInRange, 'priceUSD')) || 0
  const startDate = new Date(start)
  const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1).getTime()

  return [{ ts: monthStart, priceUSD: avgPrice }]
}

/**
 * Aggregate prices by month (for yearly view)
 */
const aggregateByMonth = (
  prices: BtcPriceEntry[],
  dateRange: { start: number; end: number; period?: string } | null,
): BtcPriceEntry[] => {
  const periodType = getPeriodType(dateRange)
  const grouped = _groupBy(prices, ({ ts }) => getPeriodKey(ts, periodType))

  return _map(_entries(grouped), ([periodKey, groupPrices]) => {
    const avgPrice = _mean(_map(groupPrices, 'priceUSD')) || 0
    const [year, month] = periodKey.split('-').map(Number)
    return { ts: new Date(year, month - 1, 1).getTime(), priceUSD: avgPrice }
  }).sort((a, b) => a.ts - b.ts)
}

/**
 * Aggregate prices by day (fallback)
 */
const aggregateByDay = (prices: BtcPriceEntry[]): BtcPriceEntry[] => {
  const grouped = _groupBy(prices, ({ ts }) => {
    const date = new Date(ts)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  })

  return _map(_entries(grouped), ([, groupPrices]) => {
    const avgPrice = _mean(_map(groupPrices, 'priceUSD')) || 0
    const firstTs = groupPrices[0]?.ts || 0
    return { ts: Math.floor(firstTs / MS_PER_DAY) * MS_PER_DAY, priceUSD: avgPrice }
  }).sort((a, b) => a.ts - b.ts)
}

/**
 * Custom hook for fetching and processing cost summary data for single-site mode
 * Fetches production costs from global data API and calculates metrics based on
 * average consumption and hours in period
 */
export const useCostSummaryData = () => {
  const { siteId, site, selectedSites, siteList, isMultiSiteModeEnabled } = useMultiSiteMode()
  const { dateRange, onTableDateRangeChange, onDateRangeReset } = useMultiSiteDateRange()

  // Get timeframe type from Redux (year, month, week)
  const timeframeType = useSelector(getTimeframeType)

  // Get site name from API for single-site mode (when siteId is not in URL)
  const { data: siteData } = useGetSiteQuery(undefined, {
    skip: isMultiSiteModeEnabled || Boolean(siteId),
  })
  const siteNameFromApi = (siteData as { site?: string } | undefined)?.site

  // Use siteId from URL params if available, otherwise use site name from API
  const currentSiteId = siteId || siteNameFromApi

  const { start, end } = dateRange ?? {}
  const hasValidDateRange = Boolean(start && end)

  const queryOptions = {
    skip: !hasValidDateRange || isMultiSiteModeEnabled,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  }

  // Build tail log range aggr params for power consumption (single-site)
  // Use ISO string format to match other hooks (e.g., useEnergyReportData)
  const tailLogParams =
    hasValidDateRange && start && end
      ? {
          keys: JSON.stringify([
            {
              type: 'powermeter',
              startDate: new Date(start).toISOString(),
              endDate: new Date(end).toISOString(),
              fields: { site_power_w: 1 },
              aggrFields: { site_power_w: 1 },
              shouldReturnDailyData: 1,
            },
          ]),
        }
      : undefined

  // Fetch production costs data
  const {
    data: productionCostsData,
    isLoading: isProductionCostsLoading,
    isFetching: isProductionCostsFetching,
  } = useGetGlobalDataQuery(
    {
      type: 'productionCosts',
    },
    queryOptions,
  ) as { data: ProductionCostItem[] | undefined; isLoading: boolean; isFetching: boolean }

  // Fetch power consumption data using tail-log/range-aggr (works for single-site)
  const {
    data: powerDataResponse,
    isLoading: isPowerLoading,
    isFetching: isPowerFetching,
  } = useGetTailLogRangeAggrQuery(tailLogParams!, {
    ...queryOptions,
    skip: !hasValidDateRange || !tailLogParams || isMultiSiteModeEnabled,
  })

  const { data: revenueData, isLoading: isRevenueDataLoading } = useAvgAllInPowerCostData()

  // Build BTC price query params
  const btcPriceParams =
    hasValidDateRange && start && end
      ? {
          type: 'mempool',
          query: JSON.stringify({
            key: 'HISTORICAL_PRICES',
            start,
            end,
          }),
        }
      : undefined

  // Fetch historical BTC prices
  const {
    data: btcPriceDataResponse,
    isLoading: isBtcPriceLoading,
    isFetching: isBtcPriceFetching,
  } = useGetExtDataQuery<MinerHistoricalPriceResponse>(btcPriceParams!, {
    ...queryOptions,
    skip: !hasValidDateRange || !btcPriceParams || isMultiSiteModeEnabled,
  })

  // Use timeframe type from Redux to determine view type
  // Must be defined before useMemo to satisfy React Hooks rules
  const isYearView = timeframeType === TIMEFRAME_TYPE.YEAR
  const isMonthView = timeframeType === TIMEFRAME_TYPE.MONTH
  const isWeekView = timeframeType === TIMEFRAME_TYPE.WEEK

  // Process BTC price data and aggregate by period
  // Must be called before any early returns to satisfy React Hooks rules
  const processedBtcPriceData = useMemo(() => {
    if (isWeekView || isMultiSiteModeEnabled) return []

    const prices = extractPrices(btcPriceDataResponse)
    if (prices.length === 0) return []

    if (isMonthView && start && end) {
      return aggregateToMonthly(prices, start, end)
    }

    if (isYearView) {
      return aggregateByMonth(prices, dateRange)
    }

    return aggregateByDay(prices)
  }, [
    btcPriceDataResponse,
    dateRange,
    start,
    end,
    isYearView,
    isMonthView,
    isWeekView,
    isMultiSiteModeEnabled,
  ])

  // Early return for multi-site mode - this hook is only for single-site
  if (isMultiSiteModeEnabled) {
    return {
      data: {
        costData: {},
        revenueData: [],
        allInCost: 0,
        energyCost: 0,
        operationsCost: 0,
        btcData: [],
        metrcis: {},
      },
      isDataLoading: false,
      isRevenueDataLoading: false,
      metrcis: {},
      dateRange,
      onTableDateRangeChange,
      onDateRangeReset,
      siteId,
      site,
      selectedSites,
      siteList,
    }
  }

  const powermeterPointsAll = extractPowermeterData(powerDataResponse) || []
  const powermeterPointsInRange =
    start && end ? _filter(powermeterPointsAll, (p) => p.ts >= start && p.ts <= end) : []
  const daysInResponse = powermeterPointsInRange.length
  const avgPowerConsumptionMW = calculateAveragePowerMW(powermeterPointsInRange)
  const hoursInPeriod = daysInResponse * 24

  // Process production costs: filter by site and date range, calculate totals
  const {
    totalEnergyCost,
    totalOperationalCost,
    costSummary: rawCostSummary,
  } = hasValidDateRange && start && end
    ? processProductionCosts(productionCostsData, currentSiteId, new Date(start), new Date(end))
    : { totalEnergyCost: 0, totalOperationalCost: 0, costSummary: [] }

  // For single month view, aggregate all cost entries to a single value
  // For week view, return empty (will show "No data available")
  const getCostSummary = () => {
    if (isWeekView) return []
    if (isMonthView && rawCostSummary.length > 0 && start) {
      return [
        {
          ts: new Date(new Date(start).getFullYear(), new Date(start).getMonth(), 1).getTime(),
          totalCost: _sumBy(rawCostSummary, 'totalCost') || 0,
        },
      ]
    }
    return rawCostSummary
  }
  const costSummary = getCostSummary()

  // Calculate cost metrics ($/MWh)
  // For week view, return null metrics since cost data is only available at monthly granularity
  const { allInCost, energyCost, operationsCost } = isWeekView
    ? { allInCost: null, energyCost: null, operationsCost: null }
    : calculateCostMetrics(
        totalEnergyCost,
        totalOperationalCost,
        avgPowerConsumptionMW,
        hoursInPeriod,
      )

  const metrcis = getMetrics({
    allInCost,
    energyCost,
    operationsCost,
  })

  const isDataLoading =
    isProductionCostsLoading ||
    isPowerLoading ||
    isProductionCostsFetching ||
    isPowerFetching ||
    isBtcPriceLoading ||
    isBtcPriceFetching

  // Prepare chart data for ProductionCostPriceChart (needs summary array)
  // and OperationsEnergyCostChart (needs simple object)
  // For week view, return empty data to show "No data available"
  const getChartData = () => {
    if (isWeekView) return {}
    if (costSummary.length > 0) {
      return {
        summary: costSummary,
        energyCostsUSD: totalEnergyCost,
        operationalCostsUSD: totalOperationalCost,
      }
    }
    return {}
  }
  const chartData = getChartData()

  // Format BTC price data for chart (chart expects { log: [...] })
  const btcPriceChartData = { log: processedBtcPriceData }

  return {
    site,
    data: {
      costData: chartData,
      revenueData: revenueData || [],
      allInCost,
      energyCost,
      operationsCost,
      btcData: btcPriceChartData,
      metrcis,
    },
    isDataLoading,
    isRevenueDataLoading: isRevenueDataLoading || false,
    metrcis,
    dateRange,
    onTableDateRangeChange,
    onDateRangeReset,
    siteId,
    selectedSites,
    siteList,
  }
}
