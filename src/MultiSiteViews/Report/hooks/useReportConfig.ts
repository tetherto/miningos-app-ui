import { useMemo } from 'react'

import { ReportType } from '../Report.types'

import { TIMEFRAME_TYPE } from '@/constants/ranges'

/**
 * Period-specific configuration for report rendering
 */
export interface PeriodConfig {
  buckets: number
  days: number
  powerDays: number
  timeframeType: string
  periodLabel: string
}

/**
 * Configuration map for different report periods
 */
export const PERIOD_CONFIG: Record<ReportType, PeriodConfig> = {
  weekly: {
    buckets: 7,
    days: 7,
    powerDays: 360,
    timeframeType: TIMEFRAME_TYPE.WEEK,
    periodLabel: 'Weekly',
  },
  monthly: {
    buckets: 11,
    days: 31,
    powerDays: 360,
    timeframeType: TIMEFRAME_TYPE.MONTH,
    periodLabel: 'Monthly',
  },
  yearly: {
    buckets: 12,
    days: 365,
    powerDays: 365,
    timeframeType: TIMEFRAME_TYPE.YEAR,
    periodLabel: '1 Year',
  },
}

/**
 * Hook to get report configuration based on report type
 *
 * @param reportType - The type of report (weekly, monthly, yearly)
 * @returns Period configuration object
 */
export function useReportConfig(reportType: ReportType | string) {
  const config = useMemo(() => {
    const normalizedType = reportType as ReportType
    return PERIOD_CONFIG[normalizedType] || PERIOD_CONFIG.yearly
  }, [reportType])

  return config
}

/**
 * Get period config for a given report type (non-hook version for utilities)
 */
export function getPeriodConfig(reportType: ReportType | string): PeriodConfig {
  const normalizedType = reportType as ReportType
  return PERIOD_CONFIG[normalizedType] || PERIOD_CONFIG.yearly
}

export type UseReportConfigReturn = ReturnType<typeof useReportConfig>
