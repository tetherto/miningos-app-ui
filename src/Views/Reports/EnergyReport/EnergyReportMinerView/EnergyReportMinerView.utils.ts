import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _isNil from 'lodash/isNil'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _toPairs from 'lodash/toPairs'

import { getContainerName } from '@/app/utils/containerUtils'
import { MINER_TYPE_NAME_MAP } from '@/constants/deviceConstants'
import type { MetricsConsumptionGroupBy, MetricsConsumptionGroupedResponse } from '@/types/api'

export const ENERGY_REPORT_MINER_VIEW_SLICES = {
  MINER_TYPE: 'MINER_TYPE',
  MINER_UNIT: 'MINER_UNIT',
} as const

export type EnergyReportMinerViewSlice =
  (typeof ENERGY_REPORT_MINER_VIEW_SLICES)[keyof typeof ENERGY_REPORT_MINER_VIEW_SLICES]

interface Container {
  type?: string
  info?: {
    container?: string
  }
}

interface SliceConfigItem {
  groupBy: MetricsConsumptionGroupBy
  title: string
  getLabelName: (category: string, containers?: Container[]) => string
  filterCategory?: (category: string) => boolean
}

// BE leaks positional rollup keys ("group-1..N", "maintenance") into the
// container-grouped response alongside real container ids. Drop them until
// BE filters at source.
const isLeakedContainerKey = (key: string): boolean =>
  key === 'maintenance' || /^group-\d+$/.test(key)

export const sliceConfig: Record<EnergyReportMinerViewSlice, SliceConfigItem> = {
  [ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE]: {
    groupBy: 'miner',
    title: 'Power Consumption',
    getLabelName: (category) => _get(MINER_TYPE_NAME_MAP, [category], category),
  },
  [ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT]: {
    groupBy: 'container',
    title: 'Power Consumption',
    filterCategory: (category) => !isLeakedContainerKey(category),
    getLabelName: (category, containers) => {
      const container = _find(containers, (c) => _get(c, ['info', 'container']) === category)
      if (_isNil(container?.type)) {
        return category
      }
      return getContainerName(category, container.type)
    },
  },
}

interface BarChartData {
  labels: string[]
  dataSet1: { label: string; data: number[] }
}

/**
 * Reduce v2 grouped consumption response to a single-bar series using the
 * latest log entry within the range. Selectors only expose day-or-coarser
 * presets, so "latest day's per-group avg power" is the meaningful snapshot.
 */
export const transformToBarData = (
  response: MetricsConsumptionGroupedResponse | undefined,
  slice: EnergyReportMinerViewSlice,
  containers: Container[],
): BarChartData => {
  const config = sliceConfig[slice]
  const latest = _last(response?.log)
  const powerW = latest?.powerW ?? {}

  const entries = _toPairs(powerW)
  const filtered = config.filterCategory
    ? _filter(entries, ([key]) => config.filterCategory!(key))
    : entries

  return {
    labels: _map(filtered, ([key]) => config.getLabelName(key, containers)),
    dataSet1: {
      label: config.title,
      data: _map(filtered, ([, value]) => value),
    },
  }
}
