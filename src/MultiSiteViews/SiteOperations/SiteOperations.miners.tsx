import { SITE_OPERATION_CHART_CONFIG } from './SiteOperations.helper'
import { SiteOperationsPage } from './SiteOperations.Page'

import { useGetOperationsMinersQuery } from '@/app/services/api'
import { TIMEFRAME_TYPE } from '@/constants/ranges'
import { useSiteOperationsBase } from '@/hooks/useSiteOperationsBase'

const SiteOperationsMiners = () => {
  const {
    site,
    dateRange,
    onTableDateRangeChange,
    selectedSites,
    requestParams,
    isLoadingSiteList,
    timeframeType,
  } = useSiteOperationsBase()

  const {
    data: responseData,
    isLoading,
    isFetching,
  } = useGetOperationsMinersQuery(requestParams, {
    skip: isLoadingSiteList || selectedSites.length === 0,
  })

  const customDateFormat = timeframeType === TIMEFRAME_TYPE.YEAR ? 'yyyy-MM' : 'MM-dd'

  const minersData = responseData?.data
  const chartConfig = SITE_OPERATION_CHART_CONFIG.miners

  return (
    <SiteOperationsPage
      headerProps={{
        pageTitle: 'Active Miners',
        site,
        hasBackButton: true,
        backToDestination: 'site-operations',
        breadcrumbMiddleStep: 'Operations',
        hasSiteSelect: true,
        isExtended: true,
        dateRange,
        onTableDateRangeChange,
      }}
      charts={[
        {
          title: chartConfig.title,
          isLoading: isLoading || isFetching,
          data: minersData || [],
          propName: chartConfig.propName,
          nominalValue: chartConfig.nominalKey ? minersData?.[chartConfig.nominalKey] : undefined,
          legend: chartConfig.legend,
          yTicksFormatter: chartConfig.yTicksFormatter,
          customDateFormat,
        },
      ]}
    />
  )
}

export default SiteOperationsMiners
