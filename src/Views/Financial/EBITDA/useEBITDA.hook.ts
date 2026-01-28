import _compact from 'lodash/compact'
import _every from 'lodash/every'
import _isArray from 'lodash/isArray'
import _map from 'lodash/map'
import _some from 'lodash/some'

import { getPeriodType } from '../common/financial.helpers'
import { useCurrentBTCPrice } from '../common/useCurrentBTCPrice'
import { useFinancialDateRange } from '../common/useFinancialDateRange'
import { useHistoricalBTCPrices } from '../common/useHistoricalBTCPrices'
import { useMinerpoolTransactions } from '../common/useMinerpoolTransactions'
import { useProductionCosts } from '../common/useProductionCosts'
import { useTailLog } from '../common/useTailLog'

import {
  aggregateByPeriod,
  calculateEbitdaMetrics,
  mergeDailyData,
  transformToBtcProducedChartData,
  transformToEbitdaChartData,
} from './EBITDA.helpers'
import type { MinerpoolTransactionData, TailLogAggrData } from './EBITDA.types'

import type { MinerHistoricalPrice, ProductionCostData } from '@/types'

const useEBITDA = () => {
  const { dateRange, handleRangeChange } = useFinancialDateRange()
  const periodType = getPeriodType(dateRange)

  // Minerpool transactions (revenue data)
  const transactionsResponse = useMinerpoolTransactions(dateRange!)

  // Historical BTC prices
  const pricesResponse = useHistoricalBTCPrices(dateRange!)

  // Current BTC price
  const currentBTCResponse = useCurrentBTCPrice()

  // Production costs
  const productionCostsResponse = useProductionCosts()

  // Tail log range aggregation (hashrate + power)
  const tailLogResponse = useTailLog(dateRange!)

  const isLoading = _some(
    [
      transactionsResponse,
      pricesResponse,
      currentBTCResponse,
      productionCostsResponse,
      tailLogResponse,
    ],
    ({ isLoading }) => isLoading,
  )

  const errors = _compact(
    _map(
      [
        [transactionsResponse.error, 'Transactions data failed'],
        [pricesResponse.error, 'Price data failed'],
        [currentBTCResponse.error, 'Current BTC data failed'],
        [productionCostsResponse.error, 'Production costs data failed'],
        [tailLogResponse.error, 'Tail log data failed'],
      ],
      ([error, message]) => error && message,
    ),
  )

  const hasData = _every(
    [
      transactionsResponse,
      pricesResponse,
      currentBTCResponse,
      productionCostsResponse,
      tailLogResponse,
    ],
    ({ data }) => data,
  )

  const { data: transactionsData } = transactionsResponse
  const { data: pricesData } = pricesResponse
  const { data: productionCostsData } = productionCostsResponse
  const { data: tailLogData } = tailLogResponse
  const { currentBTCPrice } = currentBTCResponse

  // process and aggregate data
  const processData = () => {
    if (!hasData || !dateRange || currentBTCPrice === 0) {
      return {
        metrics: null,
        ebitdaChartData: null,
        btcProducedChartData: null,
      }
    }

    // extract nested array data
    const transactions = (_isArray(transactionsData) && transactionsData[0]) || []
    const prices = (_isArray(pricesData) && pricesData[0]) || ([] as MinerHistoricalPrice[])
    const costs = _isArray(productionCostsData) ? productionCostsData : []
    const tailLog = _isArray(tailLogData) ? tailLogData : []

    // merge all data sources into daily data
    const dailyData = mergeDailyData(
      transactions as MinerpoolTransactionData[],
      prices as MinerHistoricalPrice[],
      costs as ProductionCostData[],
      tailLog as TailLogAggrData[],
    )

    // aggregate by period
    const aggregatedData = aggregateByPeriod(dailyData, periodType, currentBTCPrice)

    // calculate metrics
    const calculatedMetrics = calculateEbitdaMetrics(aggregatedData, currentBTCPrice)

    // transform to chart data
    const ebitdaChart = transformToEbitdaChartData(aggregatedData)
    const btcProducedChart = transformToBtcProducedChartData(aggregatedData)

    return {
      metrics: calculatedMetrics,
      ebitdaChartData: ebitdaChart,
      btcProducedChartData: btcProducedChart,
    }
  }
  const { metrics, ebitdaChartData, btcProducedChartData } = processData()

  return {
    metrics,
    ebitdaChartData,
    btcProducedChartData,
    isLoading,
    handleRangeChange,
    dateRange,
    errors,
    currentBTCPrice,
  }
}

export default useEBITDA
