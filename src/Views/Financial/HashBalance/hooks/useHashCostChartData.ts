import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _sortBy from 'lodash/sortBy'

import { useHistoricalBTCPrices } from '../../common/useHistoricalBTCPrices'
import { useMinerpoolTransactions } from '../../common/useMinerpoolTransactions'
import { useProductionCosts } from '../../common/useProductionCosts'
import { useTailLog } from '../../common/useTailLog'
import { generateLogEntries, getCombinedHashpriceData } from '../utils/hashCost.utils'
import {
  getLogSummary,
  processHashPricesData,
  processTailLogData,
  processTransactionData,
} from '../utils/hashRevenueCost.utils'
import {
  aggregateByPeriod,
  buildHistoricalBlockSizesParams,
  getHashCostMetrics,
  mergeDataSources,
} from '../utils/hashRevenueCostHelpers'

import { useGetExtDataQuery, useGetSiteQuery } from '@/app/services/api'
import { TIMEFRAME_TYPE } from '@/constants/ranges'
import {
  TimeframeType,
  type MinerHistoricalBlockSizesResponse,
  type MultiSiteDateRange,
  type PeriodValue,
} from '@/types'

interface UseHashCostChartDataParams {
  dateRange: MultiSiteDateRange
  timeFrameType?: TimeframeType | null
}

export const useHashCostChartData = ({ dateRange, timeFrameType }: UseHashCostChartDataParams) => {
  const { start, end, period } = dateRange ?? {}

  const { data: siteData } = useGetSiteQuery(undefined)

  const { data: transactionsData, isLoading: isTransactionsLoading } = useMinerpoolTransactions({
    start,
    end,
    period,
  })

  const { data: tailLogRangeAggrRes, isLoading: isTaiLogDataLoading } = useTailLog({
    start,
    end,
    period,
  })

  const { data: historicalPricesData, isLoading: isHistoricalPricesLoading } =
    useHistoricalBTCPrices({
      start,
      end,
      period,
    })

  const { data: historicalBlockSizes, isLoading: isHistoricalBlockSizesLoading } =
    useGetExtDataQuery<MinerHistoricalBlockSizesResponse>(
      buildHistoricalBlockSizesParams({ start, end }),
    )
  const { data: costsData, isLoading: isCostsDataLoading } = useProductionCosts()

  if (timeFrameType === TIMEFRAME_TYPE.WEEK) {
    return {
      isLoading: false,
      data: [],
      metrics: {},
    }
  }

  const tailLogData = processTailLogData(tailLogRangeAggrRes)
  const processedTransactionData = processTransactionData(transactionsData)
  const currentSite = _get(siteData, ['site']) as string | undefined

  const mergedData = mergeDataSources(tailLogData, processedTransactionData)
  const aggregatedData = aggregateByPeriod(mergedData, period as PeriodValue)
  const btcPricesData = _head(historicalPricesData) || []
  const currentSiteCostsData = _filter(costsData, ({ site }) => site === currentSite)

  const revenueLog = generateLogEntries({
    data: aggregatedData,
    period: period as PeriodValue,
    timeFrameType,
    costsData: currentSiteCostsData,
    btcPricesData,
  })
  const revenueLogSortedByTs = _sortBy(revenueLog, ['ts'])

  const proceedHashPricesData = processHashPricesData(
    historicalBlockSizes,
    historicalPricesData,
    tailLogData,
  )

  const summary = getLogSummary(revenueLogSortedByTs)
  const hashPriceSummary = getLogSummary(proceedHashPricesData)

  const avgHashCost = _get(summary, ['avg', 'hashCostUSD_PHS_d'], 0) || 0
  const avgHashRevenue = _get(summary, ['avg', 'hashRevenueUSD_PHS_d'], 0) || 0
  const avgNetworkHashprice = _get(hashPriceSummary, ['avg', 'hashprice'], 0) || 0

  const data =
    timeFrameType === TIMEFRAME_TYPE.YEAR
      ? getCombinedHashpriceData(revenueLogSortedByTs, proceedHashPricesData)
      : []

  const metrics = getHashCostMetrics({
    avgHashCost,
    avgHashRevenue,
    avgNetworkHashprice,
  })

  return {
    isLoading:
      isTransactionsLoading ||
      isTaiLogDataLoading ||
      isHistoricalPricesLoading ||
      isCostsDataLoading ||
      isHistoricalBlockSizesLoading,
    data,
    metrics,
  }
}
