import _isNumber from 'lodash/isNumber'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _toPairs from 'lodash/toPairs'

import { getHashrateUnit } from '@/app/utils/deviceUtils'
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
interface PoolDataPoint {
  x: number
  y: number
}

interface PoolDataAcc {
  'Aggr Pool': PoolDataPoint[]
  [poolName: string]: PoolDataPoint[]
}

const POOL_COLORS = [CHART_COLORS.METALLIC_BLUE, CHART_COLORS.purple, CHART_COLORS.red]

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
