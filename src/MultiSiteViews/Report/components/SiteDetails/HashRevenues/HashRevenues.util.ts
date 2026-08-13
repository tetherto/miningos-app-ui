import _compact from 'lodash/compact'
import _forEach from 'lodash/forEach'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _mean from 'lodash/mean'
import _reduce from 'lodash/reduce'
import _sortBy from 'lodash/sortBy'
import _uniq from 'lodash/uniq'

import { CHART_COLORS } from '@/constants/colors'
import {
  buildBarChart,
  buildLineChart,
  calculateHashRevenueUSD,
  EMPTY_STRUCTURES,
  makeLabelFormatter,
  mhsToPhs,
  pickLogs,
  processAggregatedData,
  safeNum,
  validateApiData,
  validateLogs,
} from '@/MultiSiteViews/Report/lib'
import { ChartBuilderOptions, ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface BuildHashRevenuesChartsOptions extends ChartBuilderOptions {
  regionLabelMap?: Record<string, string>
  regionColors?: Record<string, string>
  days?: number
}

interface HashRevenueCell {
  usd: number
  btc: number
}

interface HashRevenueBucket {
  ts: number
  _all: {
    usdSum: number
    phsSum: number
  }
  [regionName: string]: unknown
}

interface HashMetric {
  id: string
  label: string
  value: number
  unit: string
}

export function buildHashRevenuesCharts(
  api: ReportApiResponse,
  {
    regionFilter,
    regionLabelMap,
    regionColors,
    days = 30,
    startDate,
    endDate,
  }: BuildHashRevenuesChartsOptions = {},
) {
  const apiValidation = validateApiData(api)
  if (!apiValidation.isValid) {
    return EMPTY_STRUCTURES.hashRevenues
  }

  const { logsPerSource, period } = pickLogs(api, regionFilter)
  const logsValidation = validateLogs(logsPerSource)
  if (!logsValidation.isValid) {
    return EMPTY_STRUCTURES.hashRevenues
  }

  let sourceNames: string[]
  if (regionFilter?.length) {
    sourceNames = _map(regionFilter, (code) => regionLabelMap?.[code] || code)
  } else if (api?.data?.log) {
    sourceNames = ['All']
  } else {
    const discovered = _uniq(_compact(_map(api.regions || [], 'region')))
    sourceNames = _map(discovered, (code) => regionLabelMap?.[code] || code)
  }

  const labelOf = makeLabelFormatter(period)

  const dayAgg: Record<string, HashRevenueBucket> = {}

  _forEach(logsPerSource, (logArr, idx) => {
    const name = sourceNames[idx] || `S${idx + 1}`
    const sorted = _sortBy(logArr || [], 'ts')

    _forEach(sorted, (row) => {
      const key = labelOf(row.ts)
      const bucket = (dayAgg[key] ||= { ts: row.ts, _all: { usdSum: 0, phsSum: 0 } })

      const priceUSD = safeNum(row.currentBTCPrice)
      const hashRevBTC = safeNum(row.hashRevenueBTC ?? row.totalRevenueBTC)
      const hashRevUSD = calculateHashRevenueUSD(hashRevBTC, priceUSD, safeNum(row.hashRevenueUSD))

      const cell = (bucket[name] ||= { usd: 0, btc: 0 }) as HashRevenueCell
      cell.usd += hashRevUSD
      cell.btc += hashRevBTC

      const phs = mhsToPhs(row.hashrateMHS)
      bucket._all.usdSum += hashRevUSD
      bucket._all.phsSum += phs

      bucket.ts = row.ts
    })
  })

  const allLabels = _sortBy(_keys(dayAgg), (k) => dayAgg[k].ts)

  const finalAggregatedData = processAggregatedData(
    dayAgg,
    allLabels,
    period,
    startDate,
    endDate,
    days,
  )

  const labels = _map(finalAggregatedData, 'label')

  const palette = [CHART_COLORS.blue, CHART_COLORS.red, CHART_COLORS.orange, CHART_COLORS.green]
  const pickColor = (name: string, i: number) => regionColors?.[name] || palette[i % palette.length]

  // Create a map for easy access to data by label
  const dataMap = _reduce(
    finalAggregatedData,
    (acc, item) => {
      const label = item.label as string
      acc[label] = item
      return acc
    },
    {} as Record<string, Record<string, unknown>>,
  )

  const siteHashUSD = buildBarChart(
    labels,
    _map(sourceNames, (name, i) => ({
      label: name,
      values: _map(labels, (L) => (dataMap[L]?.[name] as HashRevenueCell)?.usd ?? 0),
      color: pickColor(name, i),
    })),
  )

  const siteHashBTC = buildBarChart(
    labels,
    _map(sourceNames, (name, i) => ({
      label: name,
      values: _map(labels, (L) => (dataMap[L]?.[name] as HashRevenueCell)?.btc ?? 0),
      color: pickColor(name, i),
      options: { datalabels: { display: false } },
    })),
  )

  const networkHashratePoints = _map(labels, (L) => ({
    ts: Number(dataMap[L]?.ts) || 0,
    value: Number((dataMap[L]?._all as HashRevenueBucket['_all'])?.phsSum) || 0,
  }))
  const networkHashrate = buildLineChart([
    {
      label: 'Hashrate',
      data: networkHashratePoints,
      color: CHART_COLORS.orange,
    },
  ])

  const networkHashpriceValues = _map(labels, (L) => {
    const allData = dataMap[L]?._all as HashRevenueBucket['_all'] | undefined
    const usd = Number(allData?.usdSum) || 0
    const phs = Number(allData?.phsSum) || 0
    return phs > 0 ? usd / phs : 0
  })
  const networkHashprice = buildBarChart(labels, [
    {
      label: 'Hashprice',
      values: networkHashpriceValues,
      color: CHART_COLORS.VIOLET,
    },
  ])

  const avgHashprice = _mean(networkHashpriceValues) || 0
  const avgHashRevenueUsdPerDay =
    _mean(
      _map(labels, (L) => Number((dataMap[L]?._all as HashRevenueBucket['_all'])?.usdSum) || 0),
    ) || 0

  const hashMetrics: HashMetric[] = [
    {
      id: 'avg_hash_revenue',
      label: 'Avg Hash Revenue',
      value: avgHashRevenueUsdPerDay,
      unit: '$/day',
    },
    { id: 'avg_hashprice', label: 'Avg Hashprice', value: avgHashprice, unit: '$/PH/s/day' },
  ]

  return { siteHashUSD, siteHashBTC, networkHashrate, networkHashprice, hashMetrics }
}
