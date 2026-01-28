// Vite-specific types
/// <reference types="vite/client" />

// Global type declarations
import type { JSX, PropsWithChildren } from 'react'

// Re-export types from other type definition files
export type * from './api'
export type * from './redux'

// Re-export hook and constant types
export type * from '../hooks/hooks.types'
export type * from '../constants/constants.types'

// Re-export device utility types
export type {
  UnknownRecord,
  Device as DeviceType,
  DeviceData,
  DeviceInfo,
} from '../app/utils/deviceUtils/types'

// ============================================================================
// Common Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type Nullable<T> = T | null
export type Maybe<T> = T | null | undefined

// ============================================================================
// Common Component Prop Types
// ============================================================================

export type BaseComponentProps = PropsWithChildren<{
  className?: string
}>

// ============================================================================
// Date & Time Types
// ============================================================================

export type DateRange = [Date, Date]
export type TimestampRange = [number, number]
export type DateRangeOrNull = DateRange | null

export interface TimeRange {
  start: number
  end: number
}

export interface DateTimeInterval {
  start: Date
  end: Date
  duration: number
}

// ============================================================================
// Status & State Types
// ============================================================================

export type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance' | 'unknown'
export type SiteStatus = 'active' | 'inactive' | 'maintenance'
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed'

// ============================================================================
// Numeric & Format Types
// ============================================================================

export interface NumberFormatOptions {
  decimals?: number
  prefix?: string
  suffix?: string
  locale?: string
}

export interface CurrencyFormatOptions extends NumberFormatOptions {
  currency?: string
}

// ============================================================================
// Chart & Visualization Types
// ============================================================================

// Re-export LegendItem from chart.js for convenience
export type { LegendItem } from 'chart.js'

export interface ChartLegend {
  color: string
  label: string
}

export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
  [key: string]: unknown
}

export interface ChartDataset {
  label?: string
  data: ChartDataPoint[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  [key: string]: unknown
}

export interface ChartOptions {
  responsive?: boolean
  maintainAspectRatio?: boolean
  plugins?: unknown
  scales?: unknown
  [key: string]: unknown
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'pie' | 'scatter'
  data: {
    labels?: string[]
    datasets: ChartDataset[]
  }
  options?: ChartOptions
}

// ============================================================================
// Table & Grid Types
// ============================================================================

export interface TableColumn<T = unknown> {
  key: string
  title: string
  dataIndex?: string
  render?: (value: unknown, record: T, index: number) => JSX.Element | string | number | null
  sorter?: boolean | ((a: T, b: T) => number)
  width?: number | string
  fixed?: 'left' | 'right'
  [key: string]: unknown
}

export interface TablePagination {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface FilterOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface SearchParams {
  query?: string
  filters?: Record<string, unknown>
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
  pagination?: {
    page: number
    pageSize: number
  }
}

// ============================================================================
// Form & Validation Types
// ============================================================================

export interface FormField<T = unknown> {
  name: string
  label: string
  type: string
  value: T
  required?: boolean
  validation?: ValidationRule[]
  [key: string]: unknown
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  message: string
  value?: unknown
  validator?: (value: unknown) => boolean
}

export interface FormErrors {
  [fieldName: string]: string[]
}

// ============================================================================
// Threshold & Alert Types
// ============================================================================

export interface Threshold {
  min?: number
  max?: number
  warning?: number
  critical?: number
  unit?: string
}

export interface ThresholdConfig {
  temperature?: Threshold
  hashRate?: Threshold
  power?: Threshold
  [key: string]: Threshold | undefined
}

// ============================================================================
// Permission & Auth Types
// ============================================================================

export type PermissionAction = 'read' | 'write' | 'delete' | 'execute'
export type PermissionResource = 'device' | 'site' | 'user' | 'report' | 'settings'

export interface Permission {
  resource: PermissionResource
  actions: PermissionAction[]
}

export interface UserRole {
  id: string
  name: string
  permissions: Permission[]
}

// ============================================================================
// Export & Download Types
// ============================================================================

export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json'

export interface ExportOptions {
  format: ExportFormat
  filename?: string
  columns?: string[]
  dateRange?: DateRange
  [key: string]: unknown
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 'success' | 'info' | 'warning' | 'error'

export interface NotificationConfig {
  type: NotificationType
  message: string
  description?: string
  duration?: number
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
}

// ============================================================================
// KPI & Metrics Types
// ============================================================================

export interface KPI {
  label: string
  value: number | string
  unit?: string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  [key: string]: unknown
}

export interface MetricData {
  timestamp: number
  value: number
  [key: string]: unknown
}

export interface Metric {
  label: string
  unit: string
  value: number | string | null
  isHighlighted?: boolean
}

// Global declarations
declare global {
  const GIT_INFO: {
    branch: string
    commit: string
    date: string
    [key: string]: unknown
  }

  var vi: typeof import('vitest').vi

  interface ImportMetaEnv {
    readonly PROD: boolean
    readonly DEV: boolean
    readonly MODE: string
    readonly BASE_URL: string
    readonly VITE_BASE_URL?: string
    readonly VITE_MINIFY_DEV?: string
    // Add other env variables as needed
    [key: string]: string | boolean | undefined
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
