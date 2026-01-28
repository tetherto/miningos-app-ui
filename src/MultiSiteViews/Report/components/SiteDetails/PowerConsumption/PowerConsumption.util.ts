import _forEach from 'lodash/forEach'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _mean from 'lodash/mean'
import _sortBy from 'lodash/sortBy'

import { CHART_COLORS, COLOR } from '@/constants/colors'
import {
  buildLineChart,
  EMPTY_STRUCTURES,
  makeLabelFormatter,
  pickLogs,
  safeNum,
  validateApiData,
  validateLogs,
} from '@/MultiSiteViews/Report/lib'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface BuildPowerConsumptionChartOptions {
  siteCode?: string
  days?: number
  powerUnitDivisor?: number
}

interface PowerBucket {
  ts: number
  consSamples: number[]
  availSamples: number[]
}

const wToMw = (w: number, divisor = 1e6) => safeNum(w) / divisor

export function buildPowerConsumptionChart(
  api: ReportApiResponse,
  { siteCode, days = 30, powerUnitDivisor = 1e6 }: BuildPowerConsumptionChartOptions = {},
) {
  const apiValidation = validateApiData(api)
  if (!apiValidation.isValid) {
    return EMPTY_STRUCTURES.powerConsumption
  }

  const { logsPerSource, period } = pickLogs(api, siteCode ? [siteCode] : undefined)
  const logsValidation = validateLogs(logsPerSource)
  if (!logsValidation.isValid) {
    return EMPTY_STRUCTURES.powerConsumption
  }

  const labelOf = makeLabelFormatter(period)
  const dayAgg: Record<string, PowerBucket> = {}

  _forEach(logsPerSource, (logArr) => {
    const sorted = _sortBy(logArr || [], 'ts')
    _forEach(sorted, (row) => {
      const key = labelOf(row.ts)
      const bucket = (dayAgg[key] ||= { ts: row.ts, consSamples: [], availSamples: [] })

      const consMW = wToMw(row.sitePowerW, powerUnitDivisor)
      const downtime = safeNum(row.downtimeRate)
      const availMW = consMW * Math.max(0, 1 - downtime)

      bucket.consSamples.push(consMW)
      bucket.availSamples.push(availMW)
      bucket.ts = row.ts
    })
  })

  const allLabels = _sortBy(_keys(dayAgg), (k) => dayAgg[k].ts)
  const labels = allLabels.slice(-days)

  const consPoints = _map(labels, (k) => ({
    ts: dayAgg[k].ts,
    value: _mean(dayAgg[k].consSamples) || 0,
  }))

  const availPoints = _map(labels, (k) => ({
    ts: dayAgg[k].ts,
    value: _mean(dayAgg[k].availSamples) || 0,
  }))

  return buildLineChart([
    { label: 'Daily Avg Power Consumption', data: consPoints, color: CHART_COLORS.orange },
    { label: 'Daily Avg Power Availability', data: availPoints, color: COLOR.MINT_GREEN },
  ])
}
