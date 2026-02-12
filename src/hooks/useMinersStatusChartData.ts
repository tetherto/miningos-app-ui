import { endOfDay } from 'date-fns/endOfDay'
import { endOfYesterday } from 'date-fns/endOfYesterday'
import { startOfDay } from 'date-fns/startOfDay'
import { startOfYesterday } from 'date-fns/startOfYesterday'
import { sub } from 'date-fns/sub'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _isNil from 'lodash/isNil'
import { useState } from 'react'

import { useGetTailLogQuery } from '@/app/services/api'
import type { BarChartData } from '@/Components/BarChart/BarChart'
import {
  sumObjectValues,
  transformMinersStatusData,
} from '@/Views/Reports/OperationsDashboard/utils'

const DEFAULT_TIME_FRAME_DAYS = 7

interface TailLogItem {
  ts: number | string
  online_or_minor_error_miners_amount_aggr?: number
  error_miners_amount_aggr?: number
  not_mining_miners_amount_aggr?: number
  offline_cnt?: Record<string, number>
  power_mode_sleep_cnt?: Record<string, number>
  maintenance_type_cnt?: Record<string, number>
  aggrCount?: number
  [key: string]: unknown
}

interface UseMinersStatusChartDataReturn {
  /** Chart data ready for BarChart component */
  chartData: BarChartData | null
  /** Whether data is currently loading */
  isLoading: boolean
  /** Whether data has any entries */
  hasData: boolean
  /** Error object if request failed */
  error: unknown
  /** Currently selected preset time frame (1, 7, 30) or null for custom */
  presetTimeFrame: number | null
  /** Custom date range [start, end] */
  dateRange: [Date, Date]
  /** Setter for preset time frame */
  setPresetTimeFrame: (value: number | null) => void
  /** Setter for custom date range */
  setDateRange: (value: [Date, Date]) => void
}

/**
 * Custom hook for fetching and processing miners status chart data.
 * Handles time frame selection, API calls, and data transformation.
 *
 * @returns Object containing chart data, loading state, and time frame controls
 */
export const useMinersStatusChartData = (): UseMinersStatusChartDataReturn => {
  const [presetTimeFrame, setPresetTimeFrame] = useState<number | null>(DEFAULT_TIME_FRAME_DAYS)
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    startOfDay(
      sub(startOfYesterday(), {
        months: 1,
      }),
    ),
    endOfYesterday(),
  ])

  const [start, end] = !_isNil(presetTimeFrame)
    ? [
        sub(startOfYesterday(), {
          days: presetTimeFrame - 1,
        }),
        endOfYesterday(),
      ]
    : [startOfDay(dateRange[0]), endOfDay(dateRange[1])]

  // Fetch miners count data - daily aggregation with average from backend
  const {
    data: rawMinersData,
    isLoading: isQueryLoading,
    isFetching,
    error,
  } = useGetTailLogQuery({
    key: 'stat-3h',
    type: 'miner',
    tag: 't-miner',
    start: start.getTime(),
    end: end.getTime(),
    aggrFields: JSON.stringify({
      online_or_minor_error_miners_amount_aggr: 1,
      error_miners_amount_aggr: 1,
      not_mining_miners_amount_aggr: 1,
      offline_cnt: 1,
      power_mode_sleep_cnt: 1,
      maintenance_type_cnt: 1,
    }),
    groupRange: '1D',
    shouldCalculateAvg: true,
  })

  // Process miners data
  let chartData: BarChartData | null = null

  const minersDataHead = _head(rawMinersData)

  const minersData = _isArray(minersDataHead) ? minersDataHead : rawMinersData

  if (minersData && Array.isArray(minersData) && minersData.length > 0) {
    // Transform raw data - backend already provides daily averages
    const processedData = (minersData as TailLogItem[]).map((item) => ({
      ts: item.ts,
      online: item.online_or_minor_error_miners_amount_aggr || 0,
      error: item.error_miners_amount_aggr || 0,
      notMining: item.not_mining_miners_amount_aggr || 0,
      offline: sumObjectValues(item.offline_cnt),
      sleep: sumObjectValues(item.power_mode_sleep_cnt),
      maintenance: sumObjectValues(item.maintenance_type_cnt),
    }))

    const transformed = transformMinersStatusData(processedData)

    chartData = transformed as BarChartData
  }

  const isLoading = isQueryLoading || isFetching
  const hasData = isLoading || (Array.isArray(chartData?.dataset) && chartData.dataset.length > 0)

  return {
    chartData,
    isLoading,
    hasData,
    error,
    presetTimeFrame,
    dateRange,
    setPresetTimeFrame,
    setDateRange,
  }
}
