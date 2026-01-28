import _divide from 'lodash/divide'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _first from 'lodash/first'
import _flatMap from 'lodash/flatMap'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _gt from 'lodash/gt'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _max from 'lodash/max'
import _min from 'lodash/min'
import _reduce from 'lodash/reduce'
import _size from 'lodash/size'
import _sortBy from 'lodash/sortBy'
import _toNumber from 'lodash/toNumber'
import _toPairs from 'lodash/toPairs'
import _uniqBy from 'lodash/uniqBy'
import _upperFirst from 'lodash/upperFirst'

import { HashRateDataPoint, HashRateLogEntry } from '../HashRateLineChart.types'

import {
  SITE_OPERATION_CHART_COLORS,
  TIMELINE_INTERVAL_MS,
  TIMELINE_TO_THRESHOLD_KEY,
} from './HashRateLineChartWithPool.const'
import {
  Dataset,
  Legend,
  PoolStat,
  Timeline,
  MinerPoolDataItem,
} from './HashRateLineChartWithPool.types'

import { getHashrateString } from '@/app/utils/deviceUtils'
import { getTimeRange, TimeRangeType } from '@/app/utils/getTimeRange'
import { decimalToMegaNumber } from '@/app/utils/numberUtils'
import { DATE_RANGE, DateRangeKey, WEBAPP_DISPLAY_NAME } from '@/constants'
import { CHART_COLORS } from '@/constants/colors'

interface HashRateTimeRange {
  start: number | undefined
  end: number | undefined
}

interface MinMaxAvg {
  min?: string
  max?: string
  avg?: string
  [key: string]: unknown
}

interface BuildChartDataProps {
  legends: Legend[]
  timeRange: TimeRangeType
  aggrPoolData: HashRateDataPoint[]
  hashRateData: HashRateDataPoint[]
  legendHidden: Record<string, boolean>
  minerPoolData: MinerPoolDataItem[] | undefined
}

const aggregatePoolStats = (items: MinerPoolDataItem[]): PoolStat[] => {
  if (_isEmpty(items)) return []

  const poolHashrates: Record<string, number[]> = {}

  _forEach(items, (item) => {
    _forEach(item.stats, (stat) => {
      if (!poolHashrates[stat.poolType]) {
        poolHashrates[stat.poolType] = []
      }
      poolHashrates[stat.poolType].push(stat.hashrate || 0)
    })
  })

  return _map(_toPairs(poolHashrates), ([poolType, hashrates]) => ({
    poolType,
    hashrate: _divide(
      _reduce(hashrates, (sum, h) => sum + h, 0),
      _size(hashrates) || 1,
    ),
  }))
}

export const downsampleToTimeline = (
  data: MinerPoolDataItem[],
  timeline: Timeline,
): MinerPoolDataItem[] => {
  if (!data || _isEmpty(data)) return []

  const intervalMs = TIMELINE_INTERVAL_MS[timeline]

  if (timeline === DATE_RANGE.M5) {
    return _sortBy(
      _uniqBy(data, (item) => _toNumber(item.ts)),
      (item) => _toNumber(item.ts),
    )
  }

  const buckets = _reduce(
    data,
    (acc, item) => {
      const ts = _toNumber(item.ts)
      const bucketKey = Math.floor(ts / intervalMs) * intervalMs

      if (!acc[bucketKey]) {
        acc[bucketKey] = []
      }
      acc[bucketKey].push(item)
      return acc
    },
    {} as Record<number, MinerPoolDataItem[]>,
  )

  return _toPairs(buckets)
    .sort(([a], [b]) => _toNumber(a) - _toNumber(b))
    .map(([bucketTs, items]) => ({
      ts: _toNumber(bucketTs),
      stats: aggregatePoolStats(items),
    }))
}

export const getMajorDatasetItems = (
  majorData: MinerPoolDataItem[] | undefined,
  legend: Legend,
): HashRateDataPoint[] | undefined =>
  _map(majorData, (dataset) => ({
    ...dataset,
    x: _toNumber(dataset.ts),
    y: decimalToMegaNumber(
      (_get(_find(dataset.stats, { poolType: legend.poolType }), ['hashrate']) as
        | number
        | undefined) ?? 0,
    ),
  }))

export const normalizeDatasets = (
  datasets: Array<Omit<Dataset, 'borderColor' | 'data'> & { data?: HashRateDataPoint[] }>,
  legendHidden: Record<string, boolean>,
): Dataset[] =>
  _map(datasets, (dataset) => {
    const label = dataset?.label
    const processedData = _sortBy(_uniqBy(dataset.data || [], 'x'), 'x')

    return {
      ...dataset,
      data: processedData,
      borderColor: dataset?.color || CHART_COLORS.SKY_BLUE,
      visible: !legendHidden[label],
    }
  })

export const getThresholdKey = (timeline: Timeline): DateRangeKey =>
  TIMELINE_TO_THRESHOLD_KEY[timeline] || DATE_RANGE.M5

export const getHashRateTimeRange = (
  data: HashRateLogEntry[] | HashRateLogEntry[][],
): HashRateTimeRange | null => {
  const firstItem = _first(data as HashRateLogEntry[])

  const flatData = Array.isArray(firstItem) ? firstItem : data

  if (_isEmpty(flatData)) return null

  const timestamps = _filter(
    _map(flatData, ({ ts }) => ts ?? 0),
    (ts) => _gt(ts, 0),
  )

  if (_isEmpty(timestamps)) return null

  return {
    start: _min(timestamps),
    end: _max(timestamps),
  }
}

export const filterAndDownsampleMinerPoolData = (
  minerpoolData: MinerPoolDataItem[] | undefined,
  hashRateTimeRange: HashRateTimeRange | null,
  timeline: Timeline,
): MinerPoolDataItem[] | undefined => {
  if (!minerpoolData) return undefined

  const filteredData = _filter(minerpoolData, ({ ts }) => {
    const itemTs = _toNumber(ts)
    if (hashRateTimeRange?.start && hashRateTimeRange?.end) {
      return itemTs >= hashRateTimeRange.start && itemTs <= hashRateTimeRange.end
    }
    return true
  })

  return downsampleToTimeline(filteredData, timeline)
}

export const transformHashRateData = (
  data: HashRateLogEntry[] | HashRateLogEntry[][],
): HashRateDataPoint[] => {
  const firstItem = _first(data as HashRateLogEntry[])

  const flatData = Array.isArray(firstItem) ? firstItem : data

  return _map(flatData, ({ ts = 0, hashrate_mhs_1m_sum_aggr = 0 }) => ({
    x: ts,
    y: hashrate_mhs_1m_sum_aggr,
  }))
}

export const calculateAggrPoolData = (
  minerPoolData: MinerPoolDataItem[] | undefined,
): HashRateDataPoint[] => {
  if (!minerPoolData) return []

  return _map(minerPoolData, ({ stats, ts }) => {
    const totalHashrate = _reduce(stats, (sum, { hashrate }) => sum + (hashrate || 0), 0)

    return {
      x: _toNumber(ts),
      y: decimalToMegaNumber(totalHashrate),
    }
  })
}

export const calculateMinMaxAvg = (hashRateData: HashRateDataPoint[]): MinMaxAvg => {
  if (_isEmpty(hashRateData)) return {}

  let totalHashrate = 0
  let minHashrate = Number.MAX_SAFE_INTEGER
  let maxHashrate = Number.MIN_SAFE_INTEGER

  _forEach(hashRateData, ({ y }) => {
    const hashrate = y || 0
    totalHashrate += hashrate

    if (hashrate < minHashrate) minHashrate = hashrate
    if (hashrate > maxHashrate) maxHashrate = hashrate
  })

  return {
    min: getHashrateString(minHashrate === Number.MAX_SAFE_INTEGER ? 0 : minHashrate),
    max: getHashrateString(maxHashrate === Number.MIN_SAFE_INTEGER ? 0 : maxHashrate),
    avg: getHashrateString(_divide(totalHashrate, _size(hashRateData) || 1)),
  }
}

export const calculateTimeRange = (hashRateData: HashRateDataPoint[]): TimeRangeType =>
  getTimeRange(_last(hashRateData)?.x ?? 0, _head(hashRateData)?.x ?? 0)

export const extractUniquePoolTypes = (
  minerPoolData: MinerPoolDataItem[] | undefined,
): string[] => {
  if (!minerPoolData || _isEmpty(minerPoolData)) return []

  const allPoolTypes = _flatMap(minerPoolData, (item) => _map(item.stats, (stat) => stat.poolType))

  return _uniqBy(
    _filter(allPoolTypes, (pt) => Boolean(pt)),
    (pt) => pt,
  )
}

export const buildLegends = (uniquePoolTypes: string[], hasData: boolean): Legend[] => {
  if (!hasData) return []

  const defaultLegend: Legend = {
    label: `${WEBAPP_DISPLAY_NAME} Hash Rate`,
    color: CHART_COLORS.SKY_BLUE,
  }

  const hasPoolData = !_isEmpty(uniquePoolTypes)

  const aggrPoolLegend: Legend = {
    label: 'Aggr Pool Hash Rate',
    color: CHART_COLORS.METALLIC_BLUE,
  }

  const mappedLegends = _map(uniquePoolTypes, (poolType, index) => ({
    poolType,
    label: `${_upperFirst(poolType)} Hash Rate`,
    color: SITE_OPERATION_CHART_COLORS[index + 1] || CHART_COLORS.purple,
  }))

  if (!hasPoolData) {
    return [defaultLegend]
  }

  return [defaultLegend, aggrPoolLegend, ...mappedLegends]
}

export interface ChartDataResult {
  datasets: Dataset[]
  timeRange?: TimeRangeType
  [key: string]: unknown
}

export const buildChartData = ({
  legends,
  hashRateData,
  aggrPoolData,
  minerPoolData,
  legendHidden,
  timeRange,
}: BuildChartDataProps): ChartDataResult => {
  const datasets = _map(legends, (legend, index) => {
    let data
    if (index === 0) {
      data = hashRateData
    } else if (index === 1) {
      data = aggrPoolData
    } else {
      data = getMajorDatasetItems(minerPoolData, legend)
    }

    return {
      ...legend,
      data,
    }
  })

  return {
    datasets: normalizeDatasets(datasets, legendHidden),
    timeRange,
  }
}
