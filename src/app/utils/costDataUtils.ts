import { eachMonthOfInterval } from 'date-fns/eachMonthOfInterval'
import _filter from 'lodash/filter'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _sumBy from 'lodash/sumBy'
import _toLower from 'lodash/toLower'

export interface ProductionCostItem {
  site: string
  year: number
  month: number
  energyCost: number
  operationalCost: number
}

export interface CostSummaryPoint {
  ts: number
  totalCost: number
}

export interface FilteredCostData {
  totalEnergyCost: number
  totalOperationalCost: number
  costSummary: CostSummaryPoint[]
}

/**
 * Creates a set of year-month strings for a given date range
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Set of "year-month" strings (e.g., "2025-1", "2025-2")
 */
export const createYearMonthSet = (startDate: Date, endDate: Date): Set<string> => {
  const monthsInRange = eachMonthOfInterval({ start: startDate, end: endDate })

  return new Set(monthsInRange.map((date) => `${date.getFullYear()}-${date.getMonth() + 1}`))
}

/**
 * Filters production costs by site and date range
 * @param costs - Array of production cost items
 * @param siteId - Site identifier to filter by (case-insensitive)
 * @param yearMonthSet - Set of year-month combinations to include
 * @returns Filtered array of production cost items
 */
export const filterCostsBySiteAndDateRange = (
  costs: ProductionCostItem[],
  siteId: string,
  yearMonthSet: Set<string>,
): ProductionCostItem[] => {
  const normalizedSiteId = _toLower(siteId)

  return _filter(costs, (item: ProductionCostItem) => {
    const itemKey = `${item.year}-${item.month}`
    return _toLower(item.site) === normalizedSiteId && yearMonthSet.has(itemKey)
  })
}

/**
 * Converts production cost items to time-series summary points
 * @param costs - Array of production cost items
 * @returns Array of cost summary points with timestamp and total cost
 */
export const createCostSummary = (costs: ProductionCostItem[]): CostSummaryPoint[] =>
  _map(costs, (item: ProductionCostItem) => {
    // Create timestamp for the first day of the month
    const monthDate = new Date(item.year, item.month - 1, 1)
    const ts = monthDate.getTime()
    const totalCost = (item.energyCost || 0) + (item.operationalCost || 0)

    return { ts, totalCost }
  })

/**
 * Processes production costs data for a given site and date range
 * @param costs - Array of production cost items
 * @param siteId - Site identifier to filter by
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Filtered and processed cost data with totals and summary
 */
export const processProductionCosts = (
  costs: ProductionCostItem[] | undefined,
  siteId: string | undefined,
  startDate: Date,
  endDate: Date,
): FilteredCostData => {
  // Default empty result
  const emptyResult: FilteredCostData = {
    totalEnergyCost: 0,
    totalOperationalCost: 0,
    costSummary: [],
  }

  // Validate inputs
  if (!costs || !Array.isArray(costs) || costs.length === 0 || !siteId) {
    return emptyResult
  }

  // Create year-month set for filtering
  const yearMonthSet = createYearMonthSet(startDate, endDate)

  // Filter costs by site and date range
  const filteredCosts = filterCostsBySiteAndDateRange(costs, siteId, yearMonthSet)

  if (_isEmpty(filteredCosts)) {
    return emptyResult
  }

  // Calculate totals
  const totalEnergyCost = _sumBy(filteredCosts, 'energyCost') || 0
  const totalOperationalCost = _sumBy(filteredCosts, 'operationalCost') || 0

  // Create time-series summary
  const costSummary = createCostSummary(filteredCosts)

  return {
    totalEnergyCost,
    totalOperationalCost,
    costSummary,
  }
}

/**
 * Calculates cost per MWh metrics
 * @param totalEnergyCost - Total energy cost in USD
 * @param totalOperationalCost - Total operational cost in USD
 * @param avgPowerConsumptionMW - Average power consumption in MW
 * @param hoursInPeriod - Number of hours in the period
 * @returns Object with allInCost, energyCost, and operationsCost per MWh
 */
export const calculateCostMetrics = (
  totalEnergyCost: number,
  totalOperationalCost: number,
  avgPowerConsumptionMW: number,
  hoursInPeriod: number,
): { allInCost: number; energyCost: number; operationsCost: number } => {
  // Formula: Cost / (Avg consumption MW * Hours in period)
  const denominator = avgPowerConsumptionMW * hoursInPeriod

  if (denominator <= 0) {
    return {
      allInCost: 0,
      energyCost: 0,
      operationsCost: 0,
    }
  }

  return {
    allInCost: (totalEnergyCost + totalOperationalCost) / denominator,
    energyCost: totalEnergyCost / denominator,
    operationsCost: totalOperationalCost / denominator,
  }
}
