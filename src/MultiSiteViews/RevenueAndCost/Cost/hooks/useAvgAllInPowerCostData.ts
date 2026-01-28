import { startOfMonth } from 'date-fns/startOfMonth'
import _entries from 'lodash/entries'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _groupBy from 'lodash/groupBy'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'
import _mean from 'lodash/mean'
import _sortBy from 'lodash/sortBy'

import {
  mockTransactionsData,
  mockBtcPricesData,
  mockPowerData,
  mockProductionCostsData,
} from './mocks'

import {
  useGetExtDataQuery,
  useGetGlobalDataQuery,
  useGetTailLogRangeAggrQuery,
} from '@/app/services/api'
import { calculateTransactionSum } from '@/app/utils/transactionUtils'
import { PERIOD } from '@/constants/ranges'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { getStartOfDay } from '@/Views/Financial/RevenueSummary/hooks/revenueSummaryHelpers'

// Flag to enable/disable mocks - set to true to use mock data
export const USE_MOCKS = false

const WATTS_PER_MW = 1e6
const HOURS_PER_DAY = 24

interface ChartDataPoint {
  ts: number
  revenueUSD: number
  hashCostUSD: number
}

interface UseAvgAllInPowerCostDataReturn {
  data: ChartDataPoint[]
  isLoading: boolean
}

/**
 * Hook to fetch and calculate data for "Avg All-in Power Cost" chart
 * Calculates Revenue and Cost per MWh per month
 */
export const useAvgAllInPowerCostData = (): UseAvgAllInPowerCostDataReturn => {
  const { dateRange } = useMultiSiteDateRange()
  useMultiSiteMode() // Hook called for side effects, but values not used in this hook

  const startTimestamp = dateRange?.start ? new Date(dateRange.start).getTime() : undefined
  const endTimestamp = dateRange?.end ? new Date(dateRange.end).getTime() : undefined
  const hasValidDateRange = Boolean(startTimestamp && endTimestamp)
  const startTs = startTimestamp ?? Date.now()
  const endTs = endTimestamp ?? Date.now()

  // Build tail-log/range-aggr params for power consumption
  const tailLogParams = !hasValidDateRange
    ? undefined
    : {
        keys: JSON.stringify([
          {
            type: 'powermeter',
            startDate: new Date(startTs).toISOString(),
            endDate: new Date(endTs).toISOString(),
            fields: { site_power_w: 1 },
            aggrFields: { site_power_w: 1 },
            shouldReturnDailyData: 1,
          },
        ]),
      }

  // Build ext-data params for transactions
  const transactionsParams = !hasValidDateRange
    ? undefined
    : {
        type: 'minerpool',
        query: JSON.stringify({
          start: startTs,
          end: endTs,
          key: 'transactions',
        }),
      }

  // Build ext-data params for BTC prices
  const btcPricesParams = !hasValidDateRange
    ? undefined
    : {
        type: 'mempool',
        query: JSON.stringify({
          key: 'HISTORICAL_PRICES',
          start: startTs,
          end: endTs,
        }),
      }

  // Build production costs params
  const productionCostsParams = {
    type: 'productionCosts',
  }

  // Fetch data (skip if using mocks or invalid date range)
  // Note: RTK Query hooks must be called unconditionally, so we provide empty object as fallback
  const { data: powerData, isLoading: isLoadingPower } = useGetTailLogRangeAggrQuery(
    tailLogParams || {},
    {
      skip: !hasValidDateRange || !tailLogParams,
    },
  )

  const { data: transactionsData, isLoading: isLoadingTransactions } = useGetExtDataQuery(
    transactionsParams || {},
    {
      skip: !hasValidDateRange || !transactionsParams,
    },
  )

  const { data: btcPricesData, isLoading: isLoadingBtcPrices } = useGetExtDataQuery(
    btcPricesParams || {},
    {
      skip: !hasValidDateRange || !btcPricesParams,
    },
  )

  const { data: productionCostsData, isLoading: isLoadingProductionCosts } = useGetGlobalDataQuery(
    productionCostsParams,
    {
      skip: !hasValidDateRange || !productionCostsParams,
    },
  )

  // Use mocks if enabled
  let finalPowerData = powerData
  let finalTransactionsData = transactionsData
  let finalBtcPricesData = btcPricesData
  let finalProductionCostsData = productionCostsData

  if (USE_MOCKS) {
    finalPowerData = mockPowerData
    finalTransactionsData = mockTransactionsData
    finalBtcPricesData = mockBtcPricesData
    finalProductionCostsData = mockProductionCostsData
  }

  const isLoading = USE_MOCKS
    ? false
    : isLoadingPower || isLoadingTransactions || isLoadingBtcPrices || isLoadingProductionCosts

  // Process and calculate data
  if (isLoading || !dateRange?.start || !dateRange?.end) {
    return {
      data: [],
      isLoading,
    }
  }

  const chartData = (() => {
    // Determine if this is a yearly period
    const isYearlyPeriod = dateRange?.period === PERIOD.YEARLY

    // Calculate the start and end month timestamps for filtering
    const startMonthTs = startOfMonth(new Date(startTs)).getTime()
    const endMonthTs = startOfMonth(new Date(endTs)).getTime()

    // For yearly period, get the year from the start date
    const selectedYear = isYearlyPeriod ? new Date(startTs).getFullYear() : null

    const powerSumWByDay: Record<number, number> = {}
    const powerCountByDay: Record<number, number> = {}
    if (finalPowerData && _isArray(finalPowerData)) {
      const powerArray = _head(finalPowerData) as Array<{
        type?: string
        data?:
          | Array<{ ts: number; val?: { site_power_w?: number; aggrIntervals?: number } }>
          | { site_power_w?: number; aggrIntervals?: number }
      }>
      if (_isArray(powerArray)) {
        const powermeterData = _find(powerArray, (item) => item?.type === 'powermeter') as
          | {
              data?:
                | Array<{ ts: number; val?: { site_power_w?: number; aggrIntervals?: number } }>
                | { site_power_w?: number; aggrIntervals?: number }
            }
          | undefined

        if (powermeterData?.data) {
          // Handle daily data format (array with ts and val)
          if (_isArray(powermeterData.data)) {
            _forEach(powermeterData.data, ({ ts, val }) => {
              const dayTs = getStartOfDay(ts)
              // Only include days within the selected date range
              if (dayTs >= getStartOfDay(startTs) && dayTs <= getStartOfDay(endTs)) {
                const sitePowerW = val?.site_power_w || 0
                const aggrIntervals = val?.aggrIntervals || 0
                const avgPowerW =
                  aggrIntervals && aggrIntervals > 0 ? sitePowerW / aggrIntervals : sitePowerW
                powerSumWByDay[dayTs] = (powerSumWByDay[dayTs] || 0) + avgPowerW
                powerCountByDay[dayTs] = (powerCountByDay[dayTs] || 0) + 1
              }
            })
          } else {
            // Handle aggregated format (object) - fallback for non-daily data
            const dayTs = getStartOfDay(startTs)
            // Only include if within the selected date range
            if (dayTs >= getStartOfDay(startTs) && dayTs <= getStartOfDay(endTs)) {
              const sitePowerW = powermeterData.data.site_power_w || 0
              const aggrIntervals = powermeterData.data.aggrIntervals || 1
              // Avg Consumption in W = site_power_w / aggrIntervals
              const avgPowerW = sitePowerW / aggrIntervals
              powerSumWByDay[dayTs] = avgPowerW
              powerCountByDay[dayTs] = 1
            }
          }
        }
      }
    }

    // Process transactions data
    const revenueBTCByDay: Record<number, number> = {}
    if (finalTransactionsData && _isArray(finalTransactionsData)) {
      const transactionsArray = _head(finalTransactionsData) as Array<{
        ts?: string | number
        transactions?: Array<{
          changed_balance?: number
          satoshis_net_earned?: number
          fees_colected_satoshis?: number
          mining_extra?: { tx_fee?: number }
        }>
      }>
      if (_isArray(transactionsArray)) {
        _forEach(transactionsArray, ({ ts, transactions }) => {
          if (!ts || !transactions) return
          const dayTs = getStartOfDay(Number(ts))
          // Only include days within the selected date range
          if (dayTs >= getStartOfDay(startTs) && dayTs <= getStartOfDay(endTs)) {
            const { revenueBTC } = calculateTransactionSum(transactions)
            revenueBTCByDay[dayTs] = (revenueBTCByDay[dayTs] || 0) + revenueBTC
          }
        })
      }
    }

    // Process BTC prices data
    // Group by day and average prices per day, then use that average to multiply revenue
    const btcPricesByDay: Record<number, number> = {}
    if (finalBtcPricesData) {
      // Handle ApiResponse format: { data: [...], success: true }
      const pricesData = 'data' in finalBtcPricesData ? finalBtcPricesData.data : finalBtcPricesData
      if (_isArray(pricesData)) {
        const pricesArray = _head(pricesData) as
          | Array<{ ts?: number; priceUSD?: number }>
          | undefined
        if (_isArray(pricesArray)) {
          // Group by day and average prices per day
          // Filter to only include days within the selected date range
          const grouped = _groupBy(pricesArray, ({ ts }) => (ts ? getStartOfDay(ts) : 0))
          _forEach(_entries(grouped), ([dayTs, dayPrices]) => {
            const dayTimestamp = Number(dayTs)
            // Only include days within the selected date range
            if (dayTimestamp >= getStartOfDay(startTs) && dayTimestamp <= getStartOfDay(endTs)) {
              const avgPrice = _mean(_map(dayPrices, 'priceUSD'))
              if (_isNumber(avgPrice)) {
                btcPricesByDay[dayTimestamp] = avgPrice
              }
            }
          })
        }
      }
    }

    // Process production costs data
    // For yearly period: include all costs for that year
    // For other periods: filter to only include months within the selected date range
    const productionCostsByMonth: Record<string, number> = {}
    if (finalProductionCostsData && _isArray(finalProductionCostsData)) {
      _forEach(
        finalProductionCostsData,
        (item: {
          site?: string
          year?: number
          month?: number
          energyCostsUSD?: number // Legacy format (from mocks)
          energyCost?: number // Backend format
          operationalCost?: number // Backend format
        }) => {
          if (item?.site && item?.year && item?.month) {
            let shouldInclude = false

            if (isYearlyPeriod && selectedYear !== null) {
              // For yearly period: include all months of the selected year
              shouldInclude = item.year === selectedYear
            } else {
              // For other periods: check if this month falls within the selected date range
              const monthDate = new Date(Number(item.year), Number(item.month) - 1, 1)
              const monthTs = startOfMonth(monthDate).getTime()
              shouldInclude = monthTs >= startMonthTs && monthTs <= endMonthTs
            }

            if (shouldInclude) {
              const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`
              // Backend returns energyCost + operationalCost, sum them for total cost
              // Fallback to energyCostsUSD for legacy/mock data
              const totalCost =
                (_isNumber(item.energyCost) ? item.energyCost : 0) +
                (_isNumber(item.operationalCost) ? item.operationalCost : 0) +
                (_isNumber(item.energyCostsUSD) ? item.energyCostsUSD : 0)
              if (totalCost > 0) {
                // If multiple entries for same month, sum them
                productionCostsByMonth[monthKey] =
                  (productionCostsByMonth[monthKey] || 0) + totalCost
              }
            }
          }
        },
      )
    }

    // Calculate Revenue per day: totalRevenueBTC per day * BTC price per day
    const revenueUSDByDay: Record<number, number> = {}
    _forEach(_entries(revenueBTCByDay), ([dayTs, revenueBTC]) => {
      const btcPrice = btcPricesByDay[Number(dayTs)]
      if (_isNumber(btcPrice) && _isNumber(revenueBTC)) {
        revenueUSDByDay[Number(dayTs)] = revenueBTC * btcPrice
      }
    })

    // Group by month and calculate monthly totals
    const monthlyData: Record<number, { revenueUSD: number; mWh: number; costUSD: number }> = {}

    // Calculate Revenue per month
    _forEach(_entries(revenueUSDByDay), ([dayTs, revenueUSD]) => {
      const monthTs = startOfMonth(new Date(Number(dayTs))).getTime()
      if (!monthlyData[monthTs]) {
        monthlyData[monthTs] = { revenueUSD: 0, mWh: 0, costUSD: 0 }
      }
      monthlyData[monthTs].revenueUSD += revenueUSD
    })

    const dailyAvgWByDay: Record<number, number> = {}
    _forEach(_entries(powerSumWByDay), ([dayTs, sumW]) => {
      const dayTimestamp = Number(dayTs)
      const count = powerCountByDay[dayTimestamp] || 1
      dailyAvgWByDay[dayTimestamp] = sumW / count
    })

    const dailyAvgWByMonth: Record<number, number[]> = {}
    _forEach(_entries(dailyAvgWByDay), ([dayTs, avgW]) => {
      const monthTs = startOfMonth(new Date(Number(dayTs))).getTime()
      if (!dailyAvgWByMonth[monthTs]) dailyAvgWByMonth[monthTs] = []
      dailyAvgWByMonth[monthTs].push(avgW)
    })

    _forEach(_entries(dailyAvgWByMonth), ([monthTs, dailyAvgW]) => {
      const monthTimestamp = Number(monthTs)
      if (!monthlyData[monthTimestamp]) {
        monthlyData[monthTimestamp] = { revenueUSD: 0, mWh: 0, costUSD: 0 }
      }
      const avgPowerW = _mean(dailyAvgW) || 0
      const avgPowerMW = avgPowerW / WATTS_PER_MW
      const daysInBucket = dailyAvgW.length
      monthlyData[monthTimestamp].mWh = avgPowerMW * HOURS_PER_DAY * daysInBucket
    })

    // Add production costs per month
    _forEach(_entries(productionCostsByMonth), ([monthKey, costUSD]) => {
      const [year, month] = monthKey.split('-')
      const monthDate = new Date(Number(year), Number(month) - 1, 1)
      const monthTs = startOfMonth(monthDate).getTime()
      if (!monthlyData[monthTs]) {
        monthlyData[monthTs] = { revenueUSD: 0, mWh: 0, costUSD: 0 }
      }
      monthlyData[monthTs].costUSD = costUSD
    })

    // Calculate Revenue per MWh and Cost per MWh
    // Filter to only include months within the selected date range
    const chartDataPoints: ChartDataPoint[] = []
    _forEach(_entries(monthlyData), ([monthTs, { revenueUSD, mWh, costUSD }]) => {
      const monthTimestamp = Number(monthTs)
      // Only include months that fall within the selected date range
      if (monthTimestamp >= startMonthTs && monthTimestamp <= endMonthTs) {
        const revenuePerMWh = mWh > 0 ? revenueUSD / mWh : 0
        const costPerMWh = mWh > 0 ? costUSD / mWh : 0

        chartDataPoints.push({
          ts: monthTimestamp,
          revenueUSD: revenuePerMWh,
          hashCostUSD: costPerMWh,
        })
      }
    })

    // Sort by timestamp
    return _sortBy(chartDataPoints, 'ts')
  })()

  return {
    data: chartData,
    isLoading,
  }
}
