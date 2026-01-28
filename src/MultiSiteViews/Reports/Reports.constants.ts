import { eachMonthOfInterval } from 'date-fns/eachMonthOfInterval'
import { eachWeekOfInterval } from 'date-fns/eachWeekOfInterval'
import { eachYearOfInterval } from 'date-fns/eachYearOfInterval'
import { startOfMonth } from 'date-fns/startOfMonth'
import { startOfWeek } from 'date-fns/startOfWeek'
import { startOfYear } from 'date-fns/startOfYear'
import _map from 'lodash/map'
import _values from 'lodash/values'

export const REPORT_DURATIONS = {
  YEARLY: 'yearly',
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
} as const

export type ReportDuration = (typeof REPORT_DURATIONS)[keyof typeof REPORT_DURATIONS]

export const REPORT_DURATION_NAMES: Record<ReportDuration, string> = {
  [REPORT_DURATIONS.YEARLY]: 'Yearly',
  [REPORT_DURATIONS.MONTHLY]: 'Monthly',
  [REPORT_DURATIONS.WEEKLY]: 'Weekly',
}

interface ReportDurationOption {
  id: ReportDuration
  label: string
}

export const reportDurationOptions: ReportDurationOption[] = _map(
  _values(REPORT_DURATIONS),
  (value) => ({
    id: value,
    label: REPORT_DURATION_NAMES[value],
  }),
)

interface ReportGenerationConfig {
  durationInterval: 'weeks' | 'months' | 'years'
  getEndDate: (date: Date | number) => Date
  getIntervals: (interval: { start: Date | number; end: Date | number }) => Date[]
}

export const REPORTS_GENERATION_CONFIG: Record<ReportDuration, ReportGenerationConfig> = {
  [REPORT_DURATIONS.WEEKLY]: {
    durationInterval: 'weeks',
    getEndDate: startOfWeek,
    getIntervals: eachWeekOfInterval,
  },
  [REPORT_DURATIONS.MONTHLY]: {
    durationInterval: 'months',
    getEndDate: startOfMonth,
    getIntervals: eachMonthOfInterval,
  },
  [REPORT_DURATIONS.YEARLY]: {
    durationInterval: 'years',
    getEndDate: startOfYear,
    getIntervals: eachYearOfInterval,
  },
}
