import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _map from 'lodash/map'

import type { ChartDataset } from './ContainersChart.types'

import { CHART_COLORS } from '@/constants/colors'

type ChartDataMap = Record<string, ChartDataset>

const colors: string[] = _map(
  _keys(CHART_COLORS),
  (key) => CHART_COLORS[key as keyof typeof CHART_COLORS],
)

export const getEmptySet = (legendName: string, borderColor: string): ChartDataset => ({
  type: 'line',
  label: legendName,
  data: [],
  borderColor,
  pointRadius: 1,
})

export const addChartLine = (target: ChartDataMap, prop: string, color: string): void => {
  if (!target[prop]) {
    target[prop] = getEmptySet(prop, color)
  }
}

export const getLineColor = (index: number): string =>
  index < colors.length ? colors[index] : colors[index % colors.length]

export const addDataPoint = (
  target: ChartDataset | undefined,
  value: number | null | undefined,
  ts: number | string,
): void => {
  if (target?.data && !_isNil(value)) {
    target.data.push({ x: ts, y: value })
  }
}
