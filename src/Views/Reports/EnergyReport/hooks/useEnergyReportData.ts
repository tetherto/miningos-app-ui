import _head from 'lodash/head'

import { useGetTailLogRangeAggrQuery, useGetGlobalConfigQuery } from '@/app/services/api'

interface DateRange {
  start: number
  end: number
}

interface GlobalConfig {
  nominalPowerAvailability_MW?: number
}

interface RangeAggrResponse {
  type: string
  data: Array<{
    ts: number
    val: Record<string, number>
  }>
}

interface PowerConsumptionData {
  data: Array<{ ts: number; consumption: number }>
  nominalValue?: number | null
  isLoading: boolean
  error: unknown
}

/**
 * Custom hook to fetch power consumption data for the Energy Report
 * @param dateRange - Date range object with start and end timestamps
 * @returns Power consumption chart data and loading states
 */
export const useEnergyReportData = (dateRange: DateRange): PowerConsumptionData => {
  // Convert timestamps to ISO date strings
  const startDate = new Date(dateRange.start).toISOString()
  const endDate = new Date(dateRange.end).toISOString()

  // Fetch global config for nominal values
  const { data: globalConfig, isLoading: isLoadingNominalValues } = useGetGlobalConfigQuery({})

  // Fetch site power consumption data - daily aggregation from backend
  const {
    data: consumptionResponse,
    isLoading: isLoadingConsumption,
    isFetching: isFetchingConsumption,
    error: consumptionError,
  } = useGetTailLogRangeAggrQuery({
    keys: JSON.stringify([
      {
        type: 'powermeter',
        startDate,
        endDate,
        fields: {
          site_power_w: 1,
        },
        shouldReturnDailyData: 1,
      },
    ]),
  })

  // Process consumption data
  let consumptionChartData: Array<{ ts: number; consumption: number }> = []
  if (consumptionResponse) {
    // Response is wrapped in an array, get the first element
    const responseData = Array.isArray(consumptionResponse)
      ? consumptionResponse[0]
      : consumptionResponse
    if (Array.isArray(responseData)) {
      const powermeterData = responseData.find(
        (item: RangeAggrResponse) => item.type === 'powermeter',
      )
      if (powermeterData?.data) {
        consumptionChartData = powermeterData.data.map(
          (item: { ts: number; val: Record<string, number> }) => ({
            ts: item.ts,
            consumption: item.val.site_power_w || 0,
          }),
        )
      }
    }
  }

  return {
    data: consumptionChartData,
    nominalValue: isLoadingNominalValues
      ? null
      : (_head(globalConfig as GlobalConfig[])?.nominalPowerAvailability_MW ?? 0) * 1000000, // Convert MW to W
    isLoading: isLoadingConsumption || isFetchingConsumption,
    error: consumptionError,
  }
}
