import CostContent from './CostContent'

import { useCostData } from '@/hooks/useCostData'

const CostMultiSite = () => {
  const {
    site,
    data,
    dateRange,
    onTableDateRangeChange,
    isDataLoading,
    isRevenueDataLoading,
    metrics,
  } = useCostData()

  return (
    <CostContent
      site={site}
      data={data}
      dateRange={dateRange}
      onTableDateRangeChange={onTableDateRangeChange}
      isDataLoading={isDataLoading}
      isRevenueDataLoading={isRevenueDataLoading}
      metrics={metrics}
    />
  )
}

export default CostMultiSite
