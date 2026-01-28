import _toPairs from 'lodash/toPairs'

import type { Timeline } from './HashRateLineChartWithPool.types'

import { DATE_RANGE, DateRangeKey } from '@/constants'
import { CHART_COLORS } from '@/constants/colors'

export const MINER_FIELDS = JSON.stringify({ hashrate_mhs_1m_sum: 1 })
export const MINER_AGGR_FIELDS = JSON.stringify({ hashrate_mhs_1m_sum_aggr: 1 })

export const CHART_MIN_HEIGHT = 350 // minimum height of the chart
export const MS_PER_MINUTE = 60 * 1_000 // 1 minute in milliseconds
export const MS_PER_HOUR = 60 * MS_PER_MINUTE // 1 hour in milliseconds
export const MS_PER_DAY = 24 * MS_PER_HOUR // 1 day in milliseconds

export const SITE_OPERATION_CHART_COLORS = [
  CHART_COLORS.METALLIC_BLUE,
  CHART_COLORS.purple,
  CHART_COLORS.red,
  CHART_COLORS.LIGHT_BLUE,
]

export const TIMELINE_DAILY_THRESHOLDS: Partial<Record<DateRangeKey, number>> = {
  D1: 30,
  H3: 7,
  M30: 2,
  M5: 0,
}

export const TIMELINE_TO_THRESHOLD_KEY: Record<Timeline, DateRangeKey> = {
  [DATE_RANGE.M5]: 'M5',
  [DATE_RANGE.M30]: 'M30',
  [DATE_RANGE.H3]: 'H3',
  [DATE_RANGE.D1]: 'D1',
}

export const TIMELINE_INTERVAL_MS: Record<Timeline, number> = {
  [DATE_RANGE.M5]: 5 * MS_PER_MINUTE,
  [DATE_RANGE.M30]: 30 * MS_PER_MINUTE,
  [DATE_RANGE.H3]: 3 * MS_PER_HOUR,
  [DATE_RANGE.D1]: 24 * MS_PER_HOUR,
}

export const TIMELINE_THRESHOLDS_KV_PAIRS = _toPairs(TIMELINE_DAILY_THRESHOLDS)
