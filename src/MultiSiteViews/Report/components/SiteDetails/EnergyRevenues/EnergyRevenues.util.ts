import _forEach from 'lodash/forEach'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _meanBy from 'lodash/meanBy'
import _reduce from 'lodash/reduce'
import _sortBy from 'lodash/sortBy'

import { CHART_COLORS, COLOR } from '@/constants/colors'
import {
  buildBarChart,
  buildLineChart,
  EMPTY_STRUCTURES,
  makeLabelFormatter,
  pickLogs,
  processAggregatedData,
  safeNum,
  validateApiData,
  validateLogs,
} from '@/MultiSiteViews/Report/lib'
import { ChartBuilderOptions, ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface BuildEnergyRevenuesChartsOptions extends ChartBuilderOptions {
  regionLabelMap?: Record<string, string>
  regionColors?: Record<string, string>
  days?: number
  powerDays?: number
  powerUnitDivisor?: number
}

interface EnergyRevenueCell {
  usd: number
  btc: number
}

interface EnergyRevenueBucket {
  ts: number
  _all: {
    curtail: number[]
    opIssues: number[]
  }
  [regionName: string]: unknown
}

interface PowerBucket {
  ts: number
  cons: number[]
  avail: number[]
}

export function buildEnergyRevenuesCharts(
  api: ReportApiResponse,
  {
    regionFilter,
    regionLabelMap,
    regionColors,
    days = 30,
    powerDays = 30,
    powerUnitDivisor = 1e6,
    startDate,
    endDate,
  }: BuildEnergyRevenuesChartsOptions = {},
) {
  const apiValidation = validateApiData(api)
  if (!apiValidation.isValid) {
    return EMPTY_STRUCTURES.energyRevenues
  }

  const { logsPerSource, period } = pickLogs(api, regionFilter)
  const logsValidation = validateLogs(logsPerSource)
  if (!logsValidation.isValid) {
    return EMPTY_STRUCTURES.energyRevenues
  }

  let sourceNames: string[]
  if (regionFilter?.length) {
    sourceNames = _map(regionFilter, (code) => regionLabelMap?.[code] || code)
  } else if (api?.data?.log) {
    sourceNames = ['All']
  } else {
    sourceNames = _map(api?.regions || [], (r) => regionLabelMap?.[r.region] || r.region)
  }

  const labelOf = makeLabelFormatter(period)

  const dayAgg: Record<string, EnergyRevenueBucket> = {}

  _forEach(logsPerSource, (logArr, idx) => {
    const name = sourceNames[idx] || `S${idx + 1}`
    const sorted = _sortBy(logArr || [], 'ts')

    _forEach(sorted, (row) => {
      const key = labelOf(row.ts)
      const curtail = safeNum(row.curtailmentRate)
      const downtime = safeNum(row.downtimeRate)
      const opIssues = Math.max(0, downtime - curtail)

      const usd = safeNum(row.energyRevenueUSD_MW ?? row.revenueUSD)
      const btc = safeNum(row.energyRevenueBTC_MW ?? row.totalRevenueBTC)

      const cell = (dayAgg[key] ||= { ts: row.ts, _all: { curtail: [], opIssues: [] } })
      const bucket = (cell[name] ||= { usd: 0, btc: 0 }) as EnergyRevenueCell

      bucket.usd += usd
      bucket.btc += btc
      cell._all.curtail.push(curtail)
      cell._all.opIssues.push(opIssues)

      cell.ts = row.ts
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

  const palette = [CHART_COLORS.blue, CHART_COLORS.red, CHART_COLORS.orange, CHART_COLORS.green]
  const pickColor = (name: string, i: number) => regionColors?.[name] || palette[i % palette.length]

  const siteRevenueUSD = buildBarChart(
    labels,
    _map(sourceNames, (name, i) => ({
      label: name,
      values: _map(labels, (L) => (dataMap[L]?.[name] as EnergyRevenueCell)?.usd ?? 0),
      color: pickColor(name, i),
    })),
  )

  const siteRevenueBTC = buildBarChart(
    labels,
    _map(sourceNames, (name, i) => ({
      label: name,
      values: _map(labels, (L) => (dataMap[L]?.[name] as EnergyRevenueCell)?.btc ?? 0),
      color: pickColor(name, i),
    })),
  )

  const dailyAvgDowntime = buildBarChart(labels, [
    {
      label: 'Curtailment',
      values: _map(labels, (L) =>
        _meanBy((dataMap[L]?._all as EnergyRevenueBucket['_all'])?.curtail || [0], (v) =>
          safeNum(v),
        ),
      ),
      color: CHART_COLORS.VIOLET,
      options: { stack: 'DT' },
    },
    {
      label: 'Op. Issues',
      values: _map(labels, (L) =>
        _meanBy((dataMap[L]?._all as EnergyRevenueBucket['_all'])?.opIssues || [0], (v) =>
          safeNum(v),
        ),
      ),
      color: CHART_COLORS.SKY_BLUE,
      options: { stack: 'DT' },
    },
  ])

  const dayPower: Record<string, PowerBucket> = {}
  _forEach(logsPerSource, (logArr) => {
    const sorted = _sortBy(logArr || [], 'ts')
    _forEach(sorted, (row) => {
      const key = labelOf(row.ts)
      const consMW = safeNum(row.sitePowerW) / powerUnitDivisor
      const downtime = safeNum(row.downtimeRate)
      const availMW = consMW * Math.max(0, 1 - downtime)

      const b = (dayPower[key] ||= { ts: row.ts, cons: [], avail: [] })
      b.cons.push(consMW)
      b.avail.push(availMW)
      b.ts = row.ts
    })
  })

  const powerKeys = _sortBy(_keys(dayPower), (k) => dayPower[k].ts).slice(-powerDays)

  const powerConsumptionData = _map(powerKeys, (k) => ({
    ts: dayPower[k].ts,
    value: _meanBy(dayPower[k].cons, (v) => safeNum(v)),
  }))

  const powerAvailabilityData = _map(powerKeys, (k) => ({
    ts: dayPower[k].ts,
    value: _meanBy(dayPower[k].avail, (v) => safeNum(v)),
  }))

  const powerSeries = buildLineChart([
    {
      label: 'Power Consumption',
      data: powerConsumptionData,
      color: CHART_COLORS.orange,
    },
    {
      label: 'Power Availability',
      data: powerAvailabilityData,
      color: COLOR.MINT_GREEN,
    },
  ])

  return { siteRevenueUSD, siteRevenueBTC, dailyAvgDowntime, powerSeries }
}
