import CostContent from './CostContent'
import { useAvgAllInPowerCostData } from './hooks/useAvgAllInPowerCostData'

import { getMetrics } from '@/hooks/useCostData'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'

/**
 * Single-site version of Cost component
 * Uses the Avg All-in Power Cost hook to fetch and display chart data
 */
const CostSingleSite = () => {
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()
  const { data: chartData, isLoading: isChartDataLoading } = useAvgAllInPowerCostData()

  // Provide empty/default data for single-site mode
  const allInCost = 0
  const energyCost = 0
  const operationsCost = 0

  // Create metrics structure using the same getMetrics function
  const metrcis = getMetrics({
    allInCost,
    energyCost,
    operationsCost,
  })

  const data = {
    costData: {},
    revenueData: chartData, // Use chart data from hook
    btcData: [],
  }
  const isDataLoading = false
  const isRevenueDataLoading = isChartDataLoading
  const site = {}

  return (
    <CostContent
      site={site}
      data={data}
      dateRange={dateRange}
      onTableDateRangeChange={onTableDateRangeChange}
      isDataLoading={isDataLoading}
      isRevenueDataLoading={isRevenueDataLoading}
      metrcis={metrcis}
    />
  )
}

export default CostSingleSite
