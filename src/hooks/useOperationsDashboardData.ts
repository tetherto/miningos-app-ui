import _get from 'lodash/get'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'

import {
  useGetGlobalConfigQuery,
  useGetMetricsConsumptionQuery,
  useGetMetricsEfficiencyQuery,
  useGetMetricsHashrateQuery,
  useGetTailLogQuery,
} from '@/app/services/api'
import { isDemoMode } from '@/app/services/api.utils'
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

export const useOperationsDashboardData = (dateRange: DateRange): OperationsDashboardData => {
  // In demo mode, always use the fixed date range from when mock data was captured
  // This ensures charts display data regardless of the selected date range
  const fixedDateRange = isDemoMode
    ? {
        start: 1769025600000,
        end: 1769630399999,
      }
    : dateRange

  const { start, end } = fixedDateRange

  const { data: globalConfig, isLoading: isLoadingNominalValues } = useGetGlobalConfigQuery({})

  const {
    data: hashrateResponse,
    isLoading: isLoadingHashrate,
    isFetching: isFetchingHashrate,
    error: hashrateError,
  } = useGetMetricsHashrateQuery({ start, end })

  const {
    data: efficiencyResponse,
    isLoading: isLoadingEfficiency,
    isFetching: isFetchingEfficiency,
    error: efficiencyError,
  } = useGetMetricsEfficiencyQuery({ start, end })

  const {
    data: consumptionResponse,
    isLoading: isLoadingConsumption,
    isFetching: isFetchingConsumption,
    error: consumptionError,
  } = useGetMetricsConsumptionQuery({ start, end })

  // TODO: migrate to /auth/metrics/miner-status once BE adds `error` + `notMining`
  // counts. Current handler folds those into "online", which would collapse the
  // chart's Error stack.
  const {
    data: rawMinersData,
    isLoading: isLoadingMiners,
    isFetching: isFetchingMiners,
    error: minersError,
  } = useGetTailLogQuery({
    key: 'stat-3h',
    type: 'miner',
    tag: 't-miner',
    start,
    end,
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

  const hashrateChartData = _map(hashrateResponse?.log ?? [], ({ ts, hashrateMhs }) => ({
    ts,
    hashrate: hashrateMhs,
  }))

  const efficiencyChartData = _map(efficiencyResponse?.log ?? [], ({ ts, efficiencyWThs }) => ({
    ts,
    efficiency: efficiencyWThs,
  }))

  const consumptionChartData = _map(consumptionResponse?.log ?? [], ({ ts, powerW }) => ({
    ts,
    consumption: powerW,
  }))

  let minersChartData: MinersChartData | null = null
  const minersDataHead = _head(rawMinersData as unknown[])
  const minersData = _isArray(minersDataHead) ? minersDataHead : (rawMinersData as unknown[])

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
        : (_head(globalConfig as GlobalConfig[])?.nominalPowerAvailability_MW ?? 0) * 1_000_000,
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
