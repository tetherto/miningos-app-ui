/**
 * Type definitions for hooks
 */

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import type { ValueUnit } from '@/app/utils/utils.types'

// Re-export auth types used by hooks
export type { PermissionCheck } from '@/app/utils/authUtils'

// ============================================================================
// Date Range Types
// ============================================================================

export interface DateRange {
  start: number | Date
  end: number | Date
}

export interface DateRangeWithPeriod {
  start: number
  end: number
  period: string
}

export interface TableDateRangeOptions {
  daysAgo?: number
  start?: number | Date
  end?: number | Date
  isResetable?: boolean
  persist?: boolean
  storageKey?: string
  useRedux?: boolean
}

export interface TableDateRangeResult {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  resetDateRange?: VoidFunction
}

// ============================================================================
// Tail Log Types
// ============================================================================

export interface TailLogEntry {
  ts?: number
  hashrate_mhs_1m_cnt_aggr?: number
  hashrate_mhs_1m_cnt_active_aggr?: number
  hashrate_mhs_1m_sum_aggr?: number
  hashrate_mhs_5m_sum_aggr?: number
  nominal_hashrate_mhs_sum_aggr?: number
  efficiency_w_ths_type_group_avg_aggr?: Record<string, number>
  online_or_minor_error_miners_amount_aggr?: number
  offline_or_sleeping_miners_amount_aggr?: number
  error_miners_amount_aggr?: number
  not_mining_miners_amount_aggr?: number
  container_nominal_miner_capacity_sum_aggr?: number
  site_power_w?: number
  [key: string]: unknown
}

export interface TailLogDataItem {
  ts?: number
  data?: UnknownRecord
  [key: string]: unknown
}

export interface TailLogRangeAggrEntry {
  type?: string
  data?: UnknownRecord
  hashrate_mhs_5m_sum_aggr?: number
  hashrate_mhs_1m_sum_aggr?: number
  [key: string]: unknown
}

export interface MinerPoolSnapLog {
  pool_snap?: Array<{
    stats?: {
      hashrate?: number
      active_workers_count?: number
      worker_count?: number
      [key: string]: unknown
    }
  }>
  hashrate?: number
  active_workers_count?: number
  [key: string]: unknown
}

export interface MinerpoolExtDataStats {
  poolType?: string
  hashrate?: number
  worker_count?: number
  active_workers_count?: number
  balance?: number
  unsettled?: number
  revenue_24h?: number
  estimated_today_income?: number
}

export interface MinerpoolExtDataEntry {
  ts?: string
  stats?: MinerpoolExtDataStats[]
}

// ============================================================================
// Global Config Types
// ============================================================================

export interface GlobalConfig {
  nominalSiteMinerCapacity?: number
  nominalSiteHashrate_MHS?: number
  nominalSiteWeightedAvgEfficiency?: number
  [key: string]: unknown
}

// ============================================================================
// Device Types (extending base types)
// ============================================================================

export interface DeviceSnap {
  stats?: {
    power_w?: number
    hashrate?: number
    worker_count?: number
    status?: string
    temp_c?: number
    active_workers_count?: number
    [key: string]: unknown
  }
  config?: UnknownRecord
}

export interface DeviceLast {
  err?: string
  snap?: DeviceSnap
  alerts?: unknown[]
  [key: string]: unknown
}

export interface Device {
  id: string
  type: string
  tags?: string[]
  rack?: string
  last?: DeviceLast
  username?: string
  info?: {
    container?: string
    pos?: string
    [key: string]: unknown
  }
  containerId?: string
  address?: string
  code?: string
  alerts?: Alert[]
  powerMeters?: Device[]
  tempSensors?: Device[]
  transformerTempSensor?: Device
  rootTempSensor?: Device
  [key: string]: unknown
}

// ============================================================================
// Site Data Types
// ============================================================================

export interface SiteData {
  site?: string
  [key: string]: unknown
}

// ============================================================================
// Mining Data Types
// ============================================================================

export interface MiningData {
  workers: number
  totalWorkers: number
  hashrate: number
  [key: string]: unknown
}

// ============================================================================
// Alert Types
// ============================================================================

export interface Alert {
  id?: string
  severity: string
  createdAt: number | string
  name: string
  description: string
  message?: string
  uuid?: string
  code?: string | number
  [key: string]: unknown
}

// ============================================================================
// Action Types
// ============================================================================

export interface Action {
  id: string
  type: string
  status: string
  deviceId?: string
  deviceIds?: string[]
  createdAt?: number
  updatedAt?: number
  success?: boolean
  message?: string
  remove?: string
  create?: unknown
  action?: string
  [key: string]: unknown
}

export interface ActionResponse {
  success: boolean
  message?: string
  data?: unknown
  [key: string]: unknown
}

// ============================================================================
// Line Chart Data Types
// ============================================================================

export interface LineChartDataParams {
  timeline?: string
  end?: number | Date
  lineType: string
  lineTag: string
  time?: number
  skipPolling?: boolean
  skipUpdates?: boolean
  dataAdapters?: Array<(data: unknown) => unknown>
  dataProcessors?: Array<(data: unknown) => unknown>
  addYesterdayAggr?: boolean
  dateRange?: DateRange
  fields?: Record<string, number>
  aggrFields?: Record<string, number>
  isChartLoading?: boolean
  isFieldsCompulsory?: boolean
  extraTailLogParams?: UnknownRecord
  aggrDaily?: boolean
}

// ============================================================================
// Revenue Data Types
// ============================================================================

export interface RevenueLogEntry {
  ts?: number
  timeKey?: string
  period?: string
  totalRevenueBTC?: number
  totalFeesBTC?: number
  curtailmentRate?: number
  [key: string]: unknown
}

export interface RevenueRegion {
  region: string
  log?: RevenueLogEntry[]
  [key: string]: unknown
}

export interface RevenueSummary {
  sum: UnknownRecord
  avg: UnknownRecord
}

export interface RevenueData {
  regions?: RevenueRegion[] | null
  log?: RevenueLogEntry[] | null
  logs?: RevenueLogEntry[] | null
  data?: {
    summary?: RevenueSummary
  }
  [key: string]: unknown
}

// ============================================================================
// Consumption State Types
// ============================================================================

export interface ConsumptionState {
  formattedConsumption: ValueUnit
  consumptionAlert: string
  rawConsumptionW: number | string
  isLoading?: boolean
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationParams {
  offset: number
  limit: number
}

// ============================================================================
// List View Filter Types
// ============================================================================

export interface ListViewFiltersParams {
  site?: string
  selectedType?: string
}

// ============================================================================
// Miner Duplicate Validation Types
// ============================================================================

export interface MinerValidationData {
  macAddress?: string | null
  serialNumber?: string | null
  address?: string
  code?: string
}

// ============================================================================
// User Role Types
// ============================================================================

export interface UserRole {
  role: string
  permissions?: string[]
  [key: string]: unknown
}

// ============================================================================
// Profitability Data Types
// ============================================================================

export interface ProfitabilityData {
  dateRange?: DateRange
  [key: string]: unknown
}
