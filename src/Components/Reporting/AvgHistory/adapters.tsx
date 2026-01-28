import _find from 'lodash/find'
import _head from 'lodash/head'
import _isNumber from 'lodash/isNumber'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _toPairs from 'lodash/toPairs'

import { WEBAPP_DISPLAY_NAME } from '../../../constants'

import { getHashrateString, getHashrateUnit } from '@/app/utils/deviceUtils'
import { formatEfficiency, formatUnit } from '@/app/utils/format'
import { getTimeRange } from '@/app/utils/getTimeRange'
import { decimalToMegaNumber } from '@/app/utils/numberUtils'
import { getFormattedPoolName } from '@/app/utils/reportingToolsUtils'
import { CHART_COLORS } from '@/constants/colors'

interface TimeSeriesEntry {
  ts: number
  efficiency_w_ths_avg_aggr?: number
  hashrate_mhs_1m_sum_aggr?: number
  hashrate_mhs_1m_group_sum_aggr?: Record<string, number>
  workers?: Array<{ container: string; hashrate?: number }>
  pool_hashrate_type_grp_sum_aggr?: Record<string, number>
  [key: string]: unknown
}

export const efficiencyAdapter = (data: TimeSeriesEntry[] | null | undefined) => {
  if (!data) return { datasets: [] }
  const actualData = _map(data, (entry: TimeSeriesEntry) => ({
    x: entry.ts,
    y: entry.efficiency_w_ths_avg_aggr ?? 0,
  }))

  const lastTs = _last(data)?.ts as number | undefined
  const headTs = _head(data)?.ts as number | undefined
  const timeRange = getTimeRange(lastTs, headTs)

  return {
    yTicksFormatter: (value: number) => formatUnit(formatEfficiency(value)),
    timeRange,
    datasets: [
      {
        type: 'line',
        label: 'Efficiency',
        data: actualData,
        borderColor: CHART_COLORS.SKY_BLUE,
        pointRadius: 1,
      },
    ],
  }
}

export const hashrateAdapter = (data: TimeSeriesEntry[] | null | undefined) => {
  if (!data) return { datasets: [] }
  const actualData = _map(data, (entry: TimeSeriesEntry) => ({
    x: entry.ts,
    y: entry.hashrate_mhs_1m_sum_aggr ?? 0,
  }))

  const lastTs = _last(data)?.ts as number | undefined
  const headTs = _head(data)?.ts as number | undefined
  const timeRange = getTimeRange(lastTs, headTs)

  return {
    yTicksFormatter: (value: number) => getHashrateString(value),
    timeRange,
    datasets: [
      {
        type: 'line',
        label: `${WEBAPP_DISPLAY_NAME} Hash Rate`,
        data: actualData,
        borderColor: CHART_COLORS.SKY_BLUE,
        pointRadius: 1,
      },
    ],
  }
}

const POOL_COLORS = [CHART_COLORS.METALLIC_BLUE, CHART_COLORS.purple, CHART_COLORS.red]

interface PoolDataPoint {
  x: number
  y: number
}

interface PoolDataAcc {
  'Aggr Pool': PoolDataPoint[]
  [poolName: string]: PoolDataPoint[]
}

export const getMultiPoolSeperatedData = (
  data: TimeSeriesEntry[],
  yValueOperator: (value: unknown) => number,
  totalPoolBEAttribute: string,
  multiplePoolBEAttribute: string,
): PoolDataAcc =>
  _reduce(
    data,
    (prev: PoolDataAcc, curr: TimeSeriesEntry) => {
      const aggregatedData: PoolDataAcc = {
        ...prev,
        'Aggr Pool': [
          ...(prev?.['Aggr Pool'] || []),
          {
            x: curr.ts,
            y: yValueOperator(curr?.[totalPoolBEAttribute]),
          },
        ],
      }

      return _reduce(
        _toPairs(curr?.[multiplePoolBEAttribute] as Record<string, unknown> | undefined),
        (acc: PoolDataAcc, [poolName, poolValue]: [string, unknown]) => {
          const formattedPoolName = getFormattedPoolName(poolName)
          return {
            ...acc,
            [formattedPoolName]: [
              ...(acc?.[formattedPoolName] || []),
              {
                x: curr.ts,
                y: yValueOperator(poolValue),
              },
            ],
          }
        },
        aggregatedData,
      )
    },
    { 'Aggr Pool': [] } as PoolDataAcc,
  )

interface F2PoolAdapterProps {
  yValueFormatter?: (value: number | undefined) => {
    value: number
    unit: string
    realValue: number
  }
  legendIcon?: unknown
  totalPoolBEAttribute?: string
  multiplePoolBEAttribute?: string
  labelSuffix?: string
  yValueOperator?: (value: unknown) => number
}

export const f2poolAdapter = (
  data: TimeSeriesEntry[] | null | undefined,
  props?: F2PoolAdapterProps,
) => {
  const {
    yValueFormatter = getHashrateUnit,
    legendIcon = undefined,
    totalPoolBEAttribute = 'hashrate',
    multiplePoolBEAttribute = 'pool_hashrate_type_grp_sum_aggr',
    labelSuffix = 'Hash Rate',
    yValueOperator = decimalToMegaNumber,
  } = props || {}

  if (!data) return { datasets: [] }

  const safeYValueOperator = (value: unknown): number => {
    if (_isNumber(value)) {
      return yValueOperator ? yValueOperator(value) : decimalToMegaNumber(value)
    }

    return 0
  }

  const multipoolData = getMultiPoolSeperatedData(
    data,
    safeYValueOperator,
    totalPoolBEAttribute,
    multiplePoolBEAttribute,
  )

  const segregatedDatasets = _map(
    _toPairs(multipoolData),
    ([poolName, poolData]: [string, PoolDataPoint[]], index: number) => {
      const latestPoolValue = _last(poolData)?.y

      return {
        type: 'line',
        label: `${poolName} ${labelSuffix}`,
        currentValue:
          latestPoolValue !== undefined && yValueFormatter
            ? yValueFormatter(latestPoolValue)
            : {
                value: latestPoolValue ?? 0,
                unit: '',
                realValue: latestPoolValue ?? 0,
              },
        data: poolData,
        borderColor: POOL_COLORS?.[index],
        pointRadius: 1,
        legendIcon,
      }
    },
  )

  return {
    datasets: segregatedDatasets,
  }
}

export const containerHashrateAdapter = (
  data: TimeSeriesEntry[] | null | undefined,
  container: string,
) => {
  if (!data) return { datasets: [] }
  const actualData = _map(data, (entry: TimeSeriesEntry) => ({
    x: entry.ts,
    y: entry.hashrate_mhs_1m_group_sum_aggr?.[container] ?? 0,
  }))

  const lastTs = _last(data)?.ts as number | undefined
  const headTs = _head(data)?.ts as number | undefined
  const timeRange = getTimeRange(lastTs, headTs)

  return {
    yTicksFormatter: (value: number) => getHashrateString(value),
    timeRange,
    datasets: [
      {
        type: 'line',
        label: `${WEBAPP_DISPLAY_NAME} Hash Rate`,
        data: actualData,
        borderColor: CHART_COLORS.SKY_BLUE,
        pointRadius: 1,
      },
    ],
  }
}

export const containerF2poolAdapter = (
  data: TimeSeriesEntry[] | null | undefined,
  container: string,
) => {
  if (!data) return { datasets: [] }
  const actualData = _map(data, (entry: TimeSeriesEntry) => {
    const worker = _find(entry.workers, ['container', container]) as
      | { hashrate?: number }
      | undefined
    return {
      x: entry.ts,
      y: decimalToMegaNumber(worker?.hashrate ?? 0),
    }
  })

  return {
    datasets: [
      {
        type: 'line',
        label: 'Pool Hash Rate Aggr.',
        data: actualData,
        borderColor: CHART_COLORS.METALLIC_BLUE,
        pointRadius: 1,
      },
    ],
  }
}
