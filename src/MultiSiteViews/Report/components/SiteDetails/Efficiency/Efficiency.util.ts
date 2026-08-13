import _get from 'lodash/get'
import _map from 'lodash/map'
import _sortBy from 'lodash/sortBy'

import { CHART_COLORS } from '@/constants/colors'
import {
  buildLineChart,
  EMPTY_STRUCTURES,
  extractNominalValues,
  findRegionBySite,
  safeNum,
  validateApiData,
} from '@/MultiSiteViews/Report/lib'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface BuildEfficiencyChartOptions {
  siteCode?: string
  buckets?: number
}

export function buildEfficiencyChart(
  api: ReportApiResponse,
  { siteCode, buckets = 30 }: BuildEfficiencyChartOptions = {},
) {
  const apiValidation = validateApiData(api)
  if (!apiValidation.isValid) {
    return EMPTY_STRUCTURES.efficiency
  }

  const region = findRegionBySite(api, siteCode)
  if (!region) return EMPTY_STRUCTURES.efficiency

  const { efficiency: nominalEfficiency } = extractNominalValues(region)
  const sorted = _sortBy(region.log || [], 'ts')
  const tail = sorted.slice(-buckets)

  const points = _map(tail, (row) => ({
    ts: _get(row, ['ts'], 0),
    value: safeNum(_get(row, ['efficiencyWThs'], 0)),
  }))

  return buildLineChart(
    [
      {
        label: 'Actual Sites Efficiency',
        data: points,
        color: CHART_COLORS.blue,
      },
    ],
    [
      {
        label: 'Nominal Miners Efficiency',
        value: nominalEfficiency,
        color: CHART_COLORS.red,
      },
    ],
  )
}
