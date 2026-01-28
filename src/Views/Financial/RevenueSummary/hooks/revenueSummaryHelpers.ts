import { startOfDay } from 'date-fns/startOfDay'
import { startOfMonth } from 'date-fns/startOfMonth'
import { startOfYear } from 'date-fns/startOfYear'
import _isNumber from 'lodash/isNumber'

import { PERIOD } from '@/constants/ranges'
import type { PeriodValue } from '@/types'

const PERIOD_CALCULATORS = {
  daily: (timestamp: number) => getStartOfDay(timestamp),
  monthly: (timestamp: number) => startOfMonth(new Date(timestamp)).getTime(),
  yearly: (timestamp: number) => startOfYear(new Date(timestamp)).getTime(),
}

/**
 * Transform timestamp to start of day using date-fns
 */
export const getStartOfDay = (ts: number) => startOfDay(new Date(ts)).getTime()

/**
 * Get period key for a timestamp
 */
export const getPeriodKey = (timestamp: number, period: PeriodValue) => {
  const calculator =
    PERIOD_CALCULATORS[period as keyof typeof PERIOD_CALCULATORS] || PERIOD_CALCULATORS.daily
  return calculator(timestamp)
}

/**
 * Get period end date
 */
export const getPeriodEndDate = (periodTs: number, period: PeriodValue) => {
  const periodEnd = new Date(periodTs)

  if (period === PERIOD.MONTHLY) {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  if (period === PERIOD.YEARLY) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  }

  return periodEnd
}

/**
 * Safe division - returns null if denominator is 0 or invalid
 */
export const safeDiv = (
  numerator: number | undefined | null,
  denominator: number | undefined | null,
): number | null =>
  _isNumber(numerator) && _isNumber(denominator) && denominator !== 0
    ? numerator / denominator
    : null
