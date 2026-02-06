import _find from 'lodash/find'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'

import {
  useGetGlobalConfigQuery,
  useGetTailLogQuery,
  useGetTailLogRangeAggrQuery,
} from '@/app/services/api'
import {
  sumObjectValues,
  transformMinersStatusData,
} from '@/Views/Reports/OperationsDashboard/utils'

interface DateRange {
  start: number
  end: number
}

interface TailLogItem {
  ts: number | string
  online_or_minor_error_miners_amount_aggr?: number
  error_miners_amount_aggr?: number
  power_mode_sleep_cnt?: Record<string, number>
  not_mining_miners_amount_aggr?: number
  offline_cnt?: Record<string, number>
  maintenance_type_cnt?: Record<string, number>
  aggrCount?: number
  [key: string]: unknown
}

interface GlobalConfig {
  nominalSiteHashrate_MHS?: number
  nominalPowerAvailability_MW?: number
  nominalPowerConsumption_MW?: number
  nominalSiteWeightedAvgEfficiency?: number
  nominalSiteMinerCapacity?: number
}

interface RangeAggrResponse {
  type: string
  data: Array<{
    ts: number
    val: Record<string, number>
  }>
}

interface ChartData<T> {
  data: T
  nominalValue?: number | null
  isLoading: boolean
  error: unknown
}

interface MinersChartData {
  dataset: Array<{
    label: string
    stackGroup: string
    legendColor?: string
    [key: string]: unknown
  }>
}

interface OperationsDashboardData {
  isAnyLoading: boolean
  hashrate: ChartData<Array<{ ts: number; hashrate: number }>>
  consumption: ChartData<Array<{ ts: number; consumption: number }>>
  efficiency: ChartData<Array<{ ts: number; efficiency: number }>>
  miners: Omit<ChartData<MinersChartData | null>, 'nominalValue'>
}

interface DataPoint {
  ts: number
  val: Record<string, number>
}

/**
 * Custom hook to fetch and process all operations dashboard data
 * Uses backend daily aggregation APIs for better performance
 */
export const useOperationsDashboardData = (dateRange: DateRange): OperationsDashboardData => {
  // In demo mode, always use the fixed date range from when mock data was captured
  // This ensures charts display data regardless of the selected date range
  const isDemoMode = import.meta.env.VITE_USE_MOCKDATA === 'true'
  const fixedDateRange = isDemoMode
    ? {
        start: 1769025600000, // Jan 21, 2026 20:00:00 UTC (Jan 22 00:00 UTC+4)
        end: 1769630399999, // Jan 28, 2026 19:59:59 UTC (Jan 28 23:59:59 UTC+4)
      }
    : dateRange

  // Convert timestamps to ISO date strings
  const startDate = new Date(fixedDateRange.start).toISOString()
  const endDate = new Date(fixedDateRange.end).toISOString()

  // Fetch global config for nominal values
  const { data: globalConfig, isLoading: isLoadingNominalValues } = useGetGlobalConfigQuery({})

  // Fetch hashrate data - daily aggregation from backend
  const {
    data: hashrateResponse,
    isLoading: isLoadingHashrate,
    isFetching: isFetchingHashrate,
    error: hashrateError,
  } = useGetTailLogRangeAggrQuery({
    keys: JSON.stringify([
      {
        type: 'miner',
        startDate,
        endDate,
        fields: { hashrate_mhs_5m_sum_aggr: 1 },
        shouldReturnDailyData: 1,
      },
    ]),
  })

  // Fetch miner efficiency data - daily aggregation from backend
  const {
    data: efficiencyResponse,
    isLoading: isLoadingEfficiency,
    isFetching: isFetchingEfficiency,
    error: efficiencyError,
  } = useGetTailLogRangeAggrQuery({
    keys: JSON.stringify([
      {
        type: 'miner',
        startDate,
        endDate,
        fields: { efficiency_w_ths_avg_aggr: 1 },
        shouldReturnDailyData: 1,
      },
    ]),
  })

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
        fields: { site_power_w: 1 },
        shouldReturnDailyData: 1,
      },
    ]),
  })

  // Fetch miners count data - daily aggregation with average from backend
  const {
    data: rawMinersData,
    isLoading: isLoadingMiners,
    isFetching: isFetchingMiners,
    error: minersError,
  } = useGetTailLogQuery({
    key: 'stat-3h',
    type: 'miner',
    tag: 't-miner',
    start: dateRange.start,
    end: dateRange.end,
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

  // ----- hashrate -----
  let hashrateChartData: { ts: number; hashrate: number }[] = []

  if (hashrateResponse) {
    const arr = _isArray(hashrateResponse) ? _head(hashrateResponse) : hashrateResponse

    if (_isArray(arr) && !_isEmpty(arr)) {
      const minerData = _find(arr, (item: RangeAggrResponse) => item.type === 'miner')

      if (minerData?.data) {
        hashrateChartData = _map(minerData.data, ({ ts, val }: DataPoint) => ({
          ts,
          hashrate: _get(val, 'hashrate_mhs_5m_sum_aggr', 0),
        }))
      }
    }
  }

  // ----- efficiency -----
  let efficiencyChartData: { ts: number; efficiency: number }[] = []

  if (efficiencyResponse) {
    const arr = _isArray(efficiencyResponse) ? _head(efficiencyResponse) : efficiencyResponse

    if (_isArray(arr) && !_isEmpty(arr)) {
      const minerData = _find(arr, (item: RangeAggrResponse) => item.type === 'miner')

      if (minerData?.data) {
        efficiencyChartData = _map(minerData.data, ({ ts, val }: DataPoint) => ({
          ts,
          efficiency: _get(val, 'efficiency_w_ths_avg_aggr', 0),
        }))
      }
    }
  }

  // ----- consumption -----
  let consumptionChartData: { ts: number; consumption: number }[] = []

  if (consumptionResponse) {
    const arr = _isArray(consumptionResponse) ? _head(consumptionResponse) : consumptionResponse

    if (_isArray(arr) && !_isEmpty(arr)) {
      const powermeter = _find(arr, (item: RangeAggrResponse) => item.type === 'powermeter')

      if (powermeter?.data) {
        consumptionChartData = _map(powermeter.data, ({ ts, val }: DataPoint) => ({
          ts,
          consumption: _get(val, 'site_power_w', 0),
        }))
      }
    }
  }

  // ----- miners -----
  let minersChartData: MinersChartData | null = null

  const minersDataHead = _head(rawMinersData)

  const minersData = _isArray(minersDataHead) ? minersDataHead : rawMinersData

  if (_isArray(minersData) && !_isEmpty(minersData)) {
    const processed = _map(minersData as TailLogItem[], (item: TailLogItem) => ({
      ts: item.ts,
      online: _get(item, 'online_or_minor_error_miners_amount_aggr', 0),
      error: _get(item, 'error_miners_amount_aggr', 0),
      notMining: _get(item, 'not_mining_miners_amount_aggr', 0),
      offline: sumObjectValues(_get(item, 'offline_cnt', {})),
      sleep: sumObjectValues(_get(item, 'power_mode_sleep_cnt', {})),
      maintenance: sumObjectValues(_get(item, 'maintenance_type_cnt', {})),
    }))

    minersChartData = transformMinersStatusData(processed)
  }

  const isAnyLoading =
    isLoadingNominalValues ||
    isLoadingHashrate ||
    isFetchingHashrate ||
    isLoadingEfficiency ||
    isFetchingEfficiency ||
    isLoadingConsumption ||
    isFetchingConsumption ||
    isLoadingMiners ||
    isFetchingMiners

  return {
    isAnyLoading,
    hashrate: {
      data: hashrateChartData,
      nominalValue: isLoadingNominalValues
        ? null
        : _head(globalConfig as GlobalConfig[])?.nominalSiteHashrate_MHS,
      isLoading: isLoadingHashrate || isFetchingHashrate,
      error: hashrateError,
    },
    consumption: {
      data: consumptionChartData,
      nominalValue: isLoadingNominalValues
        ? null
        : (_head(globalConfig as GlobalConfig[])?.nominalPowerAvailability_MW ?? 0) * 1_000_000, // Convert MW to W
      isLoading: isLoadingConsumption || isFetchingConsumption,
      error: consumptionError,
    },
    efficiency: {
      data: efficiencyChartData,
      nominalValue: isLoadingNominalValues
        ? null
        : _head(globalConfig as GlobalConfig[])?.nominalSiteWeightedAvgEfficiency,
      isLoading: isLoadingEfficiency || isFetchingEfficiency,
      error: efficiencyError,
    },
    miners: {
      data: minersChartData,
      isLoading: isLoadingMiners || isFetchingMiners,
      error: minersError,
    },
  }
}
