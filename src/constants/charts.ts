export const CHART_LABELS = {
  HASHRATE: 'Hashrate',
  EFFICIENCY: 'Efficiency',
} as const

export const CHART_TYPES = {
  MINER: 'miner',
  MINERPOOL: 'minerpool',
  POWERMETER: 'powermeter',
  CONTAINER: 'container',
  ELECTRICITY: 'electricity',
} as const

export const CHART_TITLES = {
  HASH_RATE: 'Hash Rate',
  POWER_CONSUMPTION: 'Power Consumption',
  POWER_CONSUMED: 'Power Consumed',
  REACTIVE_ENERGY: 'Reactive Energy',
  TANK_OIL_TEMP: 'Tank TANK_NUMBER Temperature',
  TANK_PRESSURE: 'Tank Pressure',
  SPOT_PRICE: 'Spot Price',
  EFFICIENCY: 'Efficiency',
  MINERS_ONLINE: 'Miners Online',
  REALTIME_CONSUMPTION: 'Realtime Consumption',
  HASH_RATE_BY_MINER_TYPE: 'Hash Rate By Miner Type',
} as const

export const CHART_EMPTY_DESCRIPTION = 'No data available at the moment'

export const CHART_LEGEND_OPACITY = {
  VISIBLE: 1,
  HIDDEN: 0.2,
  FILL_HIDDEN: 0.1,
} as const

// Performance Configuration
// Thresholds and settings to optimize chart rendering performance
export const CHART_PERFORMANCE = {
  // Disable animations for datasets larger than this threshold
  LARGE_DATASET_THRESHOLD: 100,
  // Data decimation threshold - when to start skipping points
  DECIMATION_THRESHOLD: 200,
  // Animation duration for normal datasets (ms)
  ANIMATION_DURATION: 300,
  // Disable animations entirely for datasets above this threshold
  NO_ANIMATION_THRESHOLD: 500,
  // Parsing optimization - skip parsing when data is already in correct format
  SKIP_PARSING: true,
  // Normalization - normalize data before rendering (can improve performance)
  NORMALIZE_DATA: false,
} as const

// Animation configurations based on dataset size
export const getChartAnimationConfig = (dataPointCount: number): false | { duration: number } => {
  if (dataPointCount > CHART_PERFORMANCE.NO_ANIMATION_THRESHOLD) {
    return false // Disable animations entirely
  }
  if (dataPointCount > CHART_PERFORMANCE.LARGE_DATASET_THRESHOLD) {
    return {
      duration: 0, // Instant render
    }
  }
  return {
    duration: CHART_PERFORMANCE.ANIMATION_DURATION,
  }
}

// Data decimation configuration for large datasets
export const getDataDecimationConfig = (
  dataPointCount: number,
): { enabled: boolean; algorithm?: string } => {
  if (dataPointCount > CHART_PERFORMANCE.DECIMATION_THRESHOLD) {
    return {
      enabled: true,
      algorithm: 'lttb', // Largest-Triangle-Three-Buckets algorithm
    }
  }
  return {
    enabled: false,
  }
}

// Keys that should be ignored when checking for data values
// These are typically metadata, styling, or non-data properties
export const LABEL_TO_IGNORE = [
  'label',
  'unit',
  'stackGroup',
  'legendColor',
  'labels',
  'backgroundColor',
  'borderColor',
  'borderWidth',
  'fill',
  'period',
  'groupByRegion',
] as const

// Type exports
export type ChartLabelKey = keyof typeof CHART_LABELS
export type ChartLabelValue = (typeof CHART_LABELS)[ChartLabelKey]
export type ChartTypeKey = keyof typeof CHART_TYPES
export type ChartTypeValue = (typeof CHART_TYPES)[ChartTypeKey]
export type ChartTitleKey = keyof typeof CHART_TITLES
export type ChartTitleValue = (typeof CHART_TITLES)[ChartTitleKey]
export type ChartLegendOpacityKey = keyof typeof CHART_LEGEND_OPACITY
export type ChartLegendOpacityValue = (typeof CHART_LEGEND_OPACITY)[ChartLegendOpacityKey]
export type ChartPerformanceKey = keyof typeof CHART_PERFORMANCE
export type LabelToIgnoreValue = (typeof LABEL_TO_IGNORE)[number]
