/**
 * Type definitions for MultiSite Reports
 *
 * These types define the structure of data used throughout the reporting system,
 * including API responses, chart configurations, and component props.
 */

import { ReactNode } from 'react'

// ============================================================================
// Report Types
// ============================================================================

export type ReportType = 'weekly' | 'monthly' | 'yearly'
export type ReportPeriod = 'daily' | 'monthly' | 'yearly'

/**
 * Common options for chart building functions
 */
export interface ChartBuilderOptions {
  regionFilter?: string[]
  buckets?: number
  startDate?: string | Date | number
  endDate?: string | Date | number
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Base log entry containing all common metrics
 * Used for both daily and monthly aggregations
 */
export interface BaseLogEntry {
  ts: number
  period: ReportPeriod
  totalRevenueBTC: number
  totalFeesBTC: number
  totalFeesUSD: number | null
  revenueUSD: number | null
  totalCostsUSD: number
  ebitdaSellingBTC: number | null
  ebitdaNotSellingBTC: number
  energyRevenueBTC_MW: number | null
  energyRevenueUSD_MW: number | null
  hashRevenueBTC_PHS_d: number | null
  hashRevenueUSD_PHS_d: number | null
  hashCostBTC_PHS_d: number | null
  hashCostUSD_PHS_d: number | null
  hashrateMHS: number
  sitePowerW: number
  avgFeesSatsVByte: number | null
  currentBTCPrice: number
  efficiencyWThs: number
  totalEnergyCostsUSD: number
  totalOperationalCostsUSD: number
  curtailmentMWh: number
  curtailmentRate: number
  operationalIssues: number | null
  downtimeRate: number
  region?: string
  // Optional fields used for calculations (may not exist in all responses)
  hashRevenueBTC?: number
  hashRevenueUSD?: number
}

/**
 * Summary entry type - same as BaseLogEntry but without ts and period
 * Used for summary.sum and summary.avg which don't have these fields
 */
export type SummaryEntry = Omit<BaseLogEntry, 'ts' | 'period'>

/**
 * Daily log entry (used in weekly and monthly reports)
 */
export interface DailyLogEntry extends BaseLogEntry {
  period: 'daily'
}

/**
 * Monthly log entry (used in annual reports)
 * Includes additional month identification fields
 */
export interface MonthlyLogEntry extends BaseLogEntry {
  period: 'monthly'
  month: number
  year: number
  monthName?: string // Optional - not always present in API response
}

/**
 * Yearly log entry (used in multi-year reports)
 * Includes year identification field
 */
export interface YearlyLogEntry extends BaseLogEntry {
  period: 'yearly'
  year: number
}

/**
 * Union type for all log entry types
 */
export type LogEntry = DailyLogEntry | MonthlyLogEntry | YearlyLogEntry

/**
 * Per-region data structure
 * Contains logs, summary statistics, and nominal values for a specific site/region
 */
export interface RegionData {
  region: string
  log: LogEntry[]
  summary: {
    sum: SummaryEntry
    avg: SummaryEntry
  }
  nominalHashrate: number
  nominalEfficiency: number
  nominalMinerCapacity: number
}

/**
 * Aggregated data across all sites
 * Includes summary statistics (sum and average)
 */
export interface AggregatedData {
  log: LogEntry[]
  summary: {
    sum: SummaryEntry
    avg: SummaryEntry
  }
  nominalHashrate: number
  nominalMinerCapacity: number
  nominalEfficiency: number
}

/**
 * Complete API response structure for report data
 */
export interface ReportApiResponse {
  regions: RegionData[]
  data: AggregatedData
  period: ReportPeriod
}

// ============================================================================
// Data Processing Types
// ============================================================================

/**
 * Aggregated data item with label and arbitrary properties
 * Used by date range utilities and data processors
 */
export interface AggregatedDataItem {
  label: string
  ts?: number
  [key: string]: unknown
}

// ============================================================================
// Chart Types
// ============================================================================

/**
 * Single data series for charts
 */
export interface ChartSeries {
  name: string
  values: number[]
  color?: string
  gradient?: {
    from: string
    to: string
  }
  type?: 'bar' | 'line' | 'area'
}

/**
 * Chart data structure with labels and series
 */
export interface ChartData {
  labels: string[]
  series: ChartSeries[]
  unit?: string
  title?: string
}

/**
 * Line chart configuration
 */
export interface LineChartData extends ChartData {
  yFormatter?: (value: number) => string
  xFormatter?: (label: string) => string
}

/**
 * Bar chart configuration
 */
export interface BarChartData extends ChartData {
  yTicksFormatter?: (value: number) => string
  barWidth?: number
  stacked?: boolean
}

/**
 * Threshold line for charts
 */
export interface ThresholdLine {
  value: number
  label: string
  color?: string
}

/**
 * Chart configuration with thresholds
 */
export interface ThresholdChartData extends ChartData {
  thresholds?: ThresholdLine[]
  constants?: Array<{
    value: number
    label: string
    color: string
    dashArray?: string
  }>
}

// ============================================================================
// Date Range Types
// ============================================================================

/**
 * Parsed date range object
 */
export interface DateRange {
  startDate: Date
  endDate: Date
}

/**
 * Date range as string (from URL params)
 * Example: "Oct 03 - Oct 09, 2025"
 */
export type DateRangeString = string

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Common props for report components
 */
export interface ReportComponentProps {
  data: ReportApiResponse
  dateRange: DateRangeString
  reportType: ReportType
}

/**
 * Props for site-specific report sections
 */
export interface SiteReportProps extends ReportComponentProps {
  region?: string
}

/**
 * Metric card data structure
 */
export interface MetricCardData {
  id?: string
  label: string
  value: string | number
  unit?: string
  isHighlighted?: boolean
  isNegative?: boolean
  prefix?: string
  suffix?: string
  formatter?: (value: number) => string
}

/**
 * Report configuration for PDF export
 */
export interface ReportConfig {
  title: string
  subtitle: string
  fileName: string
  component: ReactNode
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Helper type to make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Extract the value type from an array
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * Ensure a value is not null or undefined
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>
}
