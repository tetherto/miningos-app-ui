import { ReportType } from '../../Report.types'

import { TIMEFRAME_TYPE } from '@/constants/ranges'

/**
 * Period-specific configuration for SiteDetails rendering
 */
export interface SiteDetailsPeriodConfig {
  buckets: number
  days: number
  powerDays: number
  subsidyDays: number
  timeframeType: string
  periodLabel: string
  // Whether to show yearly-specific pages (CostSummary, Ebitda, EnergyCosts, HashCosts)
  showYearlyPages: boolean
}

/**
 * Configuration map for different report periods in SiteDetails
 */
export const SITE_DETAILS_CONFIG: Record<ReportType, SiteDetailsPeriodConfig> = {
  weekly: {
    buckets: 7,
    days: 7,
    powerDays: 360,
    subsidyDays: 7,
    timeframeType: TIMEFRAME_TYPE.WEEK,
    periodLabel: 'Weekly',
    showYearlyPages: false,
  },
  monthly: {
    buckets: 11,
    days: 11,
    powerDays: 360,
    subsidyDays: 15,
    timeframeType: TIMEFRAME_TYPE.MONTH,
    periodLabel: 'Monthly',
    showYearlyPages: false,
  },
  yearly: {
    buckets: 12,
    days: 12,
    powerDays: 12,
    subsidyDays: 12,
    timeframeType: TIMEFRAME_TYPE.YEAR,
    periodLabel: '1 Year',
    showYearlyPages: true,
  },
}

/**
 * Get SiteDetails config for a given report type
 */
export function getSiteDetailsConfig(reportType: ReportType | string): SiteDetailsPeriodConfig {
  const normalizedType = reportType as ReportType
  return SITE_DETAILS_CONFIG[normalizedType] || SITE_DETAILS_CONFIG.yearly
}
