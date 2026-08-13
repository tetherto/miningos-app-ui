// API response log items
export interface TimeseriesLogItem {
  ts: number
  totalRevenueBTC?: number
  curtailmentRate?: number
  operationalIssues?: number
  hashrate?: number
  efficiency?: number
  consumption?: number
  downtimeRate?: number
}

export interface MonthlyLogItem {
  month: number
  year: number
  btcPrice?: number
  productionCostUSD?: number
}

export type LogItem = TimeseriesLogItem | MonthlyLogItem

// Region data structures
export interface RegionSummary {
  avg?: {
    downtimeRate?: number
    energyCostsUSD?: number
    productionCostUSD?: number
    hashrate?: number
    efficiency?: number
    consumption?: number
    energyRevenueUSD?: number
  }
  sum?: {
    energyCostsUSD?: number
    productionCostUSD?: number
    totalRevenueBTC?: number
  }
}

export interface RegionItem {
  region?: string
  log?: LogItem[]
  summary?: RegionSummary
}

export interface RegionSource {
  kind?: 'logMean' | 'summaryPath'
  field?: string
  path?: (string | number)[]
}

// Metrics state
export interface MetricValue {
  value: string | number
  label: string
  unit?: string
  isHighlighted?: boolean
  formatter?: (value: number) => string
}

export interface MetricsState {
  [regionKey: string]: {
    [metricKey: string]: MetricValue
  }
}

// API response structure
export interface DashboardApiResponse {
  regions?: RegionItem[]
  data?: {
    summary?: {
      avg?: Record<string, number>
      sum?: Record<string, number>
    }
  }
}

// Shared chart types
export type ColorType =
  | 'BLUE'
  | 'RED'
  | 'GREEN'
  | 'LIGHT_BLUE'
  | 'SKY_BLUE'
  | 'METALLIC_BLUE'
  | 'PURPLE'
  | 'BLUE_SEA'
  | 'YELLOW'
  | 'VIOLET'
  | 'ORANGE'

export interface SeriesDef {
  label: string
  color: ColorType
}
