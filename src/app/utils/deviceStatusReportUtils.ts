import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _reduce from 'lodash/reduce'
import _toPairs from 'lodash/toPairs'

import { getChartDatasetItemLegendColor } from './chartUtils'

import type { BarChartItemBorderColorKey } from '@/constants/colors'
import {
  MINER_TYPES_COLOR_MAP,
  MINER_TYPES_BAR_CHART_ITEM_STYLE_KEY_MAP,
  MINER_TYPE_BAR_CHART_ITEM_STYLE_KEY_DEFAULT,
} from '@/constants/deviceConstants'

interface DatasetValue {
  value: number
  color?: string
  styleKey?: BarChartItemBorderColorKey
}

interface TailLogDataItem {
  [key: string]: unknown
}

export const getDeviceBarDataSet = (
  tailLogData: TailLogDataItem[],
  attribute: string,
  labels: string[] = [],
  filterWithNoValue?: boolean,
): Record<string, DatasetValue> => {
  const baseData = _reduce(
    _toPairs(_head(tailLogData)?.[attribute] as Record<string, number | null | undefined>),
    (acc, [miner, result]) => {
      if (filterWithNoValue && _isNil(result)) {
        return acc
      }

      const styleKey =
        ((MINER_TYPES_BAR_CHART_ITEM_STYLE_KEY_MAP as Record<string, string>)[
          miner
        ] as BarChartItemBorderColorKey) ?? MINER_TYPE_BAR_CHART_ITEM_STYLE_KEY_DEFAULT

      return {
        ...acc,
        [miner]: {
          value: result ?? 0,
          color: getChartDatasetItemLegendColor({ styleKey }),
          styleKey,
        },
      }
    },
    {} as Record<string, DatasetValue>,
  )

  if (labels.length === 0) {
    return baseData
  }

  const finalData: Record<string, DatasetValue> = {}
  _forEach(labels, (label: string) => {
    finalData[label] = baseData[label] ?? { value: 0 }
  })
  return finalData
}

interface DoughnutDatasetValue {
  color?: string
  value: number
}

export const getMinerTypeDoughnutDataSet = (
  tailLogData: TailLogDataItem[],
  attribute: string,
): Record<string, DoughnutDatasetValue> =>
  _reduce(
    _toPairs(_head(tailLogData)?.[attribute] as Record<string, number>),
    (acc, [miner, result]) => ({
      ...acc,
      [miner]: {
        color: (MINER_TYPES_COLOR_MAP as Record<string, string>)[miner],
        value: result,
      },
    }),
    {} as Record<string, DoughnutDatasetValue>,
  )
