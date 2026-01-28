import _get from 'lodash/get'
import _head from 'lodash/head'
import _map from 'lodash/map'

import { getStartOfDay } from '../../common/financial.helpers'
import { useHistoricalBTCPrices } from '../../common/useHistoricalBTCPrices'
import { useMinerpoolTransactions } from '../../common/useMinerpoolTransactions'
import { useTailLog } from '../../common/useTailLog'
import {
  getLogSummary,
  proceedSiteHashRevenueData,
  processHashPricesData,
  processTailLogData,
} from '../utils/hashRevenueCost.utils'
import {
  buildHistoricalBlockSizesParams,
  buildHistoricalHashRateParams,
  getHashRevenueMetrics,
} from '../utils/hashRevenueCostHelpers'

import { useGetExtDataQuery } from '@/app/services/api'
import type {
  MinerHistoricalBlockSizesResponse,
  MinerHistoricalHashRateResponse,
  MultiSiteDateRange,
  PeriodValue,
} from '@/types'

export const useHashRevenueChartData = ({
  dateRange,
  currency,
}: {
  dateRange: MultiSiteDateRange
  currency: string
}) => {
  'use no memo'
  const { start, end, period } = dateRange ?? {}

  const { data: transactionsData, isLoading: isTransactionsLoading } = useMinerpoolTransactions({
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

  const { data: historicalHashRateData, isLoading: isHistoricalHashRateLoading } =
    useGetExtDataQuery<MinerHistoricalHashRateResponse>(
      buildHistoricalHashRateParams({ start, end }),
    )

  const { data: historicalBlockSizes, isLoading: isHistoricalBlockSizesLoading } =
    useGetExtDataQuery<MinerHistoricalBlockSizesResponse>(
      buildHistoricalBlockSizesParams({ start, end }),
    )

  const { data: tailLogData, isLoading: isTaiLogDataLoading } = useTailLog({
    start,
    end,
    period,
  })

  const hashRateData = processTailLogData(tailLogData)

  const siteHashRevenueData = proceedSiteHashRevenueData(
    transactionsData,
    historicalPricesData,
    hashRateData,
    dateRange.period as PeriodValue,
  )

  const proceedHistoricalHashRateData = _map(
    _head(historicalHashRateData || []),
    ({ ts, avgHashrateMHs }) => ({
      ts: getStartOfDay(ts),
      avgHashrateMHs,
    }),
  )

  const proceedHashPricesData = processHashPricesData(
    historicalBlockSizes,
    historicalPricesData,
    hashRateData,
  )

  const hasRevenueSummary = getLogSummary(siteHashRevenueData)
  const hashPriceSummary = getLogSummary(proceedHashPricesData)

  const avgHashRevenue = _get(hasRevenueSummary, ['avg', `hashRevenue${currency}_PHS_d`], 0) || 0
  const avgNetworkHashprice = _get(hashPriceSummary, ['avg', 'hashprice'], 0) || 0

  const metrics = getHashRevenueMetrics({
    currency,
    avgHashRevenue,
    avgNetworkHashprice,
  })

  return {
    isHashRevenueLoading: isTransactionsLoading && isHistoricalPricesLoading && isTaiLogDataLoading,
    hashRevueData: siteHashRevenueData,
    historicalHashRateData: proceedHistoricalHashRateData,
    historicalHashPriceData: proceedHashPricesData,
    isHistoricalPriceLoading:
      isHistoricalBlockSizesLoading && isHistoricalPricesLoading && isTaiLogDataLoading,
    isHistoricalHashRateLoading,
    metrics,
  }
}
