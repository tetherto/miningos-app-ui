/**
 * Shared type definitions for utility functions
 */

// ============================================================================
// Value/Unit Types
// ============================================================================

export interface ValueUnit {
  value: number | string | null
  unit: string
  realValue: number
}

export interface HashrateUnit extends ValueUnit {
  unit: string
}

export interface CurrencyUnit extends ValueUnit {
  unit: string
}

// ============================================================================
// Unit Label Types
// ============================================================================

export type UnitLabel = 'decimal' | 'k' | 'M' | 'G' | 'T' | 'P'

// ============================================================================
// Error Types
// ============================================================================

export interface ErrorWithTimestamp {
  msg?: string
  message?: string
  timestamp?: number | string
}

// ============================================================================
// Time Range Types
// ============================================================================

export interface TimeRangeFormatted {
  start: string
  end: string
  formatted: string
}

export interface Interval {
  start: number
  end: number
}

// ============================================================================
// Weighted Average Types
// ============================================================================

export interface WeightedDataPoint {
  value: number
  weight: number
}
