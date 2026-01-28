import type { ChartDataset } from 'chart.js'
import _isObject from 'lodash/isObject'

import { getChartDataAvailability, hasDataValues } from '@/app/utils/chartUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface UseChartDataCheckParams {
  dataset?: UnknownRecord | unknown[]
  data?: UnknownRecord | unknown[]
}

function hasDatasets(data: UnknownRecord | unknown[]): data is { datasets: ChartDataset[] } {
  return _isObject(data) && data !== null && 'datasets' in data
}

function hasDataset(data: UnknownRecord | unknown[]): data is { dataset: unknown } {
  return _isObject(data) && data !== null && 'dataset' in data
}

export function useChartDataCheck({ dataset, data }: UseChartDataCheckParams) {
  if (dataset) {
    // For BarChart components that pass dataset directly
    return !hasDataValues(dataset)
  }
  if (data && hasDatasets(data)) {
    // For LineChart components that pass data.datasets
    return !getChartDataAvailability(data.datasets)
  }
  if (data && hasDataset(data)) {
    // For components that pass data.dataset
    return !hasDataValues(data.dataset)
  }
  return true
}
