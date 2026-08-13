import _chunk from 'lodash/chunk'
import _values from 'lodash/values'

import type { DateRangeWithPeriod, RevenueData } from './hooks.types'
import useMultiSiteRTRequestParams from './useMultiSiteRTRequestParams'

import {
  useGetDowntimeCurtailmentQuery,
  useGetGlobalConfigQuery,
  useGetOperationsHashrateQuery,
  useGetRevenueQuery,
} from '@/app/services/api'
import {
  convertToChartFormat,
  createBTCMetrics,
  createRevenueMetrics,
  createSubsidyFeesData,
  transformRevenueDataForChart,
} from '@/MultiSiteViews/RevenueAndCost/revenueDataHelpers'

/**
 * Custom hook for fetching and processing all revenue-related data
 * @typedef {Object} RevenueDataHookParams
 * @property {Array<string>} selectedSites - Array of selected site IDs
 * @property {Array<{id: string, name: string }>|undefined} siteList - Array of full site objects with names
 * @property {string|undefined} siteId - Fallback site ID
 * @property {string} siteName - Fallback site name
 * @property {{start: string, end: string, period: string}} dateRange - Date range object
 * @property {Function} onTableDateRangeChange - Function to handle date range changes
 *
 * @typedef {Object} RevenueDataHookResult
 * @property {RevenueData|undefined} revenueData - Raw revenue data
 * @property {{log?: {[key: string]: unknown}[]}|undefined} downtimeData - Raw downtime data
 * @property {unknown} globalConfig - Raw global config data
 * @property {{data?: {summary: {avg: {[key: string]: unknown}}, [key: string]: unknown}}|undefined} hashrateData - Raw hashrate data
 * @property {ReturnType<typeof createBTCMetrics>} transformedBTCMetrics - Processed BTC metrics
 * @property {ReturnType<typeof createRevenueMetrics>} revenueMetrics - Processed revenue metrics
 * @property {ReturnType<typeof convertToChartFormat>} chartData - Chart data for visualization
 * @property {ReturnType<typeof createSubsidyFeesData>} subsidyFeesData - Subsidy and fees data
 * @property {Array<ReturnType<typeof createRevenueMetrics>[string]>} firstMetricsChunk - First chunk of revenue metrics
 * @property {Array<ReturnType<typeof createRevenueMetrics>[string]>} secondMetricsChunk - Second chunk of revenue metrics
 * @property {boolean} isLoading - Overall loading state
 * @property {boolean} isRevenueLoading - Revenue loading state
 * @property {boolean} isRevenueFetching - Revenue fetching state
 * @property {boolean} isParamBuilderLoading - Param builder loading state
 * @property {{start: string, end: string, period: string}} dateRange - Date range object
 * @property {Function} onTableDateRangeChange - Date range change handler
 * @property {Function} buildRequestParams - Request params builder
 * @property {Object} params - Request params
 * @property {Object} options - Query options
 *
 * Custom hook for fetching and processing all revenue-related data
 * @param {RevenueDataHookParams} params
 * @returns {RevenueDataHookResult}
 */
interface UseRevenueDataParams {
  selectedSites: string[]
  siteList?: Array<{ id: string; name: string }>
  siteId?: string
  siteName: string
  dateRange: DateRangeWithPeriod
  onTableDateRangeChange: (dates: [Date, Date] | null, options?: { period?: string }) => void
}

export const useRevenueData = ({
  selectedSites,
  siteList,
  siteId,
  siteName,
  dateRange,
  onTableDateRangeChange,
}: UseRevenueDataParams) => {
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const { start, end, period } = dateRange ?? {}

  const params = buildRequestParams({
    start,
    end,
    period: period as 'daily' | 'weekly' | 'monthly' | undefined,
    sites: selectedSites?.length > 0 ? selectedSites : [siteId ?? ''],
    groupByRegion: true,
  })

  const options = {
    skip: !dateRange?.start || !dateRange?.end || isParamBuilderLoading,
  }

  const {
    data: revenueData,
    isLoading: isRevenueLoading,
    isFetching: isRevenueFetching,
  } = useGetRevenueQuery(params, options)
  const { data: downtimeData, isLoading: isDowntimeLoading } = useGetDowntimeCurtailmentQuery(
    params,
    options,
  )
  const { data: globalConfig, isLoading: isGlobalConfigLoading } = useGetGlobalConfigQuery(params)
  const { data: hashrateData, isLoading: isHashrateLoading } = useGetOperationsHashrateQuery(
    params,
    options,
  )

  const isLoading =
    isParamBuilderLoading ||
    isRevenueLoading ||
    isDowntimeLoading ||
    isGlobalConfigLoading ||
    isHashrateLoading

  // Processed site list
  const processedSiteList =
    siteList && siteList.length > 0
      ? siteList
      : [{ id: siteId ?? '', name: siteName || siteId || '' }]

  // Data transformations
  const transformedBTCMetrics = createBTCMetrics(revenueData as RevenueData, processedSiteList)

  const revenueMetrics = createRevenueMetrics(
    revenueData as RevenueData,
    downtimeData as { log?: { [key: string]: unknown }[] },
    hashrateData as {
      data?: { summary: { avg: { [key: string]: unknown } }; [key: string]: unknown }
    },
  )

  const chartData = convertToChartFormat(
    transformRevenueDataForChart(revenueData as RevenueData),
    processedSiteList,
  )

  const subsidyFeesData = createSubsidyFeesData(revenueData as RevenueData)

  // Split revenue metrics into chunks for display
  const allMetrics = _values(revenueMetrics)
  const [firstMetricsChunk, secondMetricsChunk] = _chunk(
    allMetrics,
    Math.ceil(allMetrics.length / 2),
  )

  return {
    // Raw data
    revenueData,
    downtimeData,
    globalConfig,
    hashrateData,

    // Processed metrics
    transformedBTCMetrics,
    revenueMetrics,
    chartData,
    subsidyFeesData,
    firstMetricsChunk,
    secondMetricsChunk,

    // Loading states
    isLoading,
    isRevenueLoading,
    isRevenueFetching,
    isParamBuilderLoading,

    // Date range utilities
    dateRange,
    onTableDateRangeChange,

    // Request utilities
    buildRequestParams,
    params,
    options,
  }
}
