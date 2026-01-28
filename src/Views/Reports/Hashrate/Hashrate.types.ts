/**
 * Hashrate Page Type Definitions
 */

// Tab types
export type HashrateTab = 'site' | 'minerType' | 'miningUnit'

// Period types for bar chart views
export type PeriodType = '1D' | '7D' | '30D' | 'custom'

// Filter option types
export interface FilterOption {
  value: string
  label: string
}

// Miner type data
export interface MinerTypeData {
  id: string
  name: string
  hashrate: number // TH/s
}

// Mining unit (site) data
export interface MiningUnitData {
  id: string
  name: string
  hashrate: number // TH/s
}

// Time series data point for line chart
export interface HashrateTimePoint {
  ts: string // ISO timestamp
  value: number // TH/s
}

// Line style for chart series
export interface LineStyle {
  color?: string
  borderDash?: number[]
  borderWidth?: number
  tension?: number
  pointRadius?: number
}

// Series data for line chart
export interface HashrateSeries {
  label: string
  points: HashrateTimePoint[]
  color?: string
  style?: LineStyle
}

// Constant line for threshold/target
export interface HashrateConstant {
  label: string
  value: number
  color?: string
  style?: LineStyle
}

// Line chart data structure (Site View)
export interface SiteViewChartData {
  series: HashrateSeries[]
  constants?: HashrateConstant[]
}

// Bar chart data structure (Miner Type & Mining Unit Views)
export interface BarChartData {
  labels: string[]
  series: {
    label: string
    values: number[]
    color: string
  }[]
}

// Filter state for Site View
export interface SiteViewFilters {
  minerType: string[]
  timeframe: string[]
  miningUnit: string[]
}

// Filter state for Miner Type View
export interface MinerTypeViewFilters {
  miningUnit: string[]
}

// Filter state for Mining Unit View
export interface MiningUnitViewFilters {
  minerType: string[]
}

// API response types
export interface HashrateApiDataPoint {
  hashrate_mhs_5m_type_group_sum_aggr: Record<string, number>
  hashrate_mhs_5m_container_group_sum_aggr: Record<string, number>
  ts: string // Format: "startTs-endTs"
  aggrTsRange: string
  aggrCount: number
  aggrIntervals: number
}

export type HashrateApiResponse = HashrateApiDataPoint[]
