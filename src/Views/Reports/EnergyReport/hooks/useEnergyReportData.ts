import _head from 'lodash/head'
import _map from 'lodash/map'

import { useGetGlobalConfigQuery, useGetMetricsConsumptionQuery } from '@/app/services/api'

interface DateRange {
  start: number
  end: number
}

interface GlobalConfig {
  nominalPowerAvailability_MW?: number
}

interface PowerConsumptionData {
  data: Array<{ ts: number; consumption: number }>
  nominalValue?: number | null
  isLoading: boolean
  error: unknown
}

/**
 * Fetches site power consumption for the Energy Report site chart from the
 * v2 /auth/metrics/consumption endpoint.
 */
export const useEnergyReportData = (dateRange: DateRange): PowerConsumptionData => {
  const { data: globalConfig, isLoading: isLoadingNominalValues } = useGetGlobalConfigQuery({})

  const {
    data: consumptionResponse,
    isLoading: isLoadingConsumption,
    isFetching: isFetchingConsumption,
    error: consumptionError,
  } = useGetMetricsConsumptionQuery({ start: dateRange.start, end: dateRange.end })

  const data = _map(consumptionResponse?.log ?? [], ({ ts, powerW }) => ({
    ts,
    consumption: powerW,
  }))

  return {
    data,
    nominalValue: isLoadingNominalValues
      ? null
      : (_head(globalConfig as GlobalConfig[])?.nominalPowerAvailability_MW ?? 0) * 1_000_000, // MW → W
    isLoading: isLoadingConsumption || isFetchingConsumption,
    error: consumptionError,
  }
}
