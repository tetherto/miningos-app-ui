/**
 * Mining Report Utilities Library
 *
 * Centralized utilities for building mining reports with consistent patterns,
 * data processing, and chart structures.
 */

// Data utilities
export {
  mhsToPhs,
  wToMw,
  hsToPhs,
  safeNum,
  avg,
  tsToISO,
  toPerPh,
  calculateHashRevenueUSD,
  validateApiData,
  validateLogs,
} from './mining-utils'

// Chart building utilities
export {
  buildSeries,
  buildLineSeries,
  buildConstant,
  buildBarChart,
  buildLineChart,
  buildHashrateChart,
  buildEfficiencyChart,
  buildRevenueChart,
  createEmptyChart,
  EMPTY_STRUCTURES,
  DEFAULT_GRADIENT,
  DEFAULT_DATALABELS,
} from './chart-builders'

// Data processing utilities
export {
  processSortedLogs,
  groupLogsByPeriod,
  applyDayLimit,
  createHashrateAggregator,
  createCostAggregator,
  createEfficiencyAggregator,
  processNetworkData,
  findRegionBySite,
  extractNominalValues,
  processAggregatedData,
} from './data-processors'

// Date range utilities
export {
  generateTimeRange,
  generateMonthRange,
  fillMissingMonths,
  fillMissingMonthsInAggregated,
  fillMissingMonthsInSeries,
  fillMissingPeriodsInAggregated,
  getLabelFormat,
} from './date-range-utils'

// Chart data processing utilities
export {
  processChartDataWithMissingMonths,
  processChartDataWithMissingPeriods,
  processSeriesDataWithMissingMonths,
  createChartDataProcessor,
} from './chart-data-processor'

export { pickLogs, makeLabelFormatter, getPeriod } from '../Report.util'
