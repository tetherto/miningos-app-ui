import _compact from 'lodash/compact'
import _filter from 'lodash/filter'
import _forEach from 'lodash/forEach'
import _includes from 'lodash/includes'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _mean from 'lodash/mean'
import _reduce from 'lodash/reduce'
import _sortBy from 'lodash/sortBy'
import _uniq from 'lodash/uniq'

import { CHART_COLORS } from '@/constants/colors'
import {
  validateApiData,
  validateLogs,
  safeNum,
  mhsToPhs,
  buildLineChart,
  EMPTY_STRUCTURES,
  pickLogs,
  makeLabelFormatter,
  processAggregatedData,
} from '@/MultiSiteViews/Report/lib'
import { ChartBuilderOptions, ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface BuildOperationsChartsOptions extends ChartBuilderOptions {
  days?: number
  hashrateDivisor?: number
  powerDivisor?: number
}

interface OperationsBucket {
  ts: number
  hashratePhs: number
  effSamples: number[]
  sitePowerMW: number
  activeMiners: number
  [key: string]: unknown
}

const wToMw = (w: number) => safeNum(w) / 1e6

export function buildOperationsCharts(
  api: ReportApiResponse,
  {
    regionFilter,
    days = 30,
    hashrateDivisor,
    powerDivisor,
    startDate,
    endDate,
  }: BuildOperationsChartsOptions = {},
) {
  const apiValidation = validateApiData(api)
  if (!apiValidation.isValid) {
    return EMPTY_STRUCTURES.operations
  }

  const { logsPerSource, period } = pickLogs(api, regionFilter)
  const logsValidation = validateLogs(logsPerSource)
  if (!logsValidation.isValid) {
    return EMPTY_STRUCTURES.operations
  }
  const labelOf = makeLabelFormatter(period)

  const discovered = _uniq(_compact(_map(api.regions || [], 'region')))
  const active = regionFilter?.length
    ? _filter(discovered, (r) => _includes(regionFilter, r))
    : discovered

  let minerCapacityTotal = 0
  const effSamples: number[] = []
  let nominalHashratePHs = 0

  _forEach(api.regions || [], (r) => {
    if (!_includes(active, r.region)) return
    const cap = safeNum(r.nominalMinerCapacity)
    minerCapacityTotal += cap

    const nomEff = safeNum(r.nominalEfficiency)
    if (nomEff > 0) effSamples.push(nomEff)

    const nominalHs = safeNum(r.nominalHashrate)
    nominalHashratePHs += nominalHs / 1e15
  })

  const nominalEfficiency = effSamples.length ? _mean(effSamples) : 0

  const dayAgg: Record<string, OperationsBucket> = {}

  _forEach(logsPerSource, (logArr) => {
    const sorted = _sortBy(logArr || [], 'ts')
    _forEach(sorted, (row) => {
      const key = labelOf(row.ts)
      const bucket = (dayAgg[key] ||= {
        ts: row.ts,
        hashratePhs: 0,
        effSamples: [],
        sitePowerMW: 0,
        activeMiners: 0,
      })

      const phs =
        hashrateDivisor !== undefined
          ? safeNum(row.hashrateMHS) / hashrateDivisor
          : mhsToPhs(row.hashrateMHS)
      bucket.hashratePhs += phs

      const eff = safeNum(row.efficiencyWThs)
      if (eff > 0) bucket.effSamples.push(eff)

      const powerMW =
        powerDivisor !== undefined ? safeNum(row.sitePowerW) / powerDivisor : wToMw(row.sitePowerW)
      bucket.sitePowerMW += powerMW

      const downtime = safeNum(row.downtimeRate)
      const activeMiners = minerCapacityTotal * Math.max(0, 1 - downtime)
      bucket.activeMiners += activeMiners

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

  const hashrateSeriesVals = _map(labels, (L) => Number(dataMap[L]?.hashratePhs) || 0)
  const efficiencySeriesVals = _map(labels, (L) => {
    const s = (dataMap[L]?.effSamples as number[]) || []
    return s.length ? _mean(_map(s, (v) => safeNum(v))) : 0
  })
  const workersSeriesVals = _map(labels, (L) => Number(dataMap[L]?.activeMiners) || 0)
  const powerConsVals = _map(labels, (L) => Number(dataMap[L]?.sitePowerMW) || 0)

  const powerAvailVals = _map(labels, (L, idx) => {
    const active = workersSeriesVals[idx] || 0
    return minerCapacityTotal > 0
      ? powerConsVals[idx] * Math.min(1, active / minerCapacityTotal)
      : 0
  })

  const toPoint = (key: string, val: number) => ({
    ts: Number(dataMap[key]?.ts) || 0,
    value: val,
  })

  const hashrate = buildLineChart(
    [
      {
        label: 'Daily Average Hashrate',
        data: _map(labels, (k, i) => toPoint(k, hashrateSeriesVals[i])),
        color: CHART_COLORS.blue,
      },
    ],
    [{ label: 'Installed Nominal Hashrate', value: nominalHashratePHs, color: CHART_COLORS.red }],
  )

  const efficiency = buildLineChart(
    [
      {
        label: 'Actual Sites Efficiency',
        data: _map(labels, (k, i) => toPoint(k, efficiencySeriesVals[i])),
        color: CHART_COLORS.blue,
      },
    ],
    [{ label: 'Nominal Miners Efficiency', value: nominalEfficiency, color: CHART_COLORS.red }],
  )

  const workers = buildLineChart(
    [
      {
        label: 'Daily Average Active Miners',
        data: _map(labels, (k, i) => toPoint(k, workersSeriesVals[i])),
        color: CHART_COLORS.blue,
      },
    ],
    [{ label: 'Total Miner Capacity', value: minerCapacityTotal, color: CHART_COLORS.red }],
  )

  const powerConsumption = buildLineChart([
    {
      label: 'Daily Avg Power Consumption',
      data: _map(labels, (k, i) => toPoint(k, powerConsVals[i])),
      color: CHART_COLORS.blue,
    },
    {
      label: 'Daily Avg Power Availability',
      data: _map(labels, (k, i) => toPoint(k, powerAvailVals[i])),
      color: CHART_COLORS.red,
    },
  ])

  return { hashrate, efficiency, workers, powerConsumption }
}
