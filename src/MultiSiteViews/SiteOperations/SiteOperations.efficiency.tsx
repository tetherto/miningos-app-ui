import _sumBy from 'lodash/sumBy'

import { SITE_OPERATION_CHART_CONFIG } from './SiteOperations.helper'
import { SiteOperationsPage } from './SiteOperations.Page'

import { useGetOperationsEfficiencyQuery } from '@/app/services/api'
import { PERIOD } from '@/constants/ranges'
import { useSiteOperationsBase } from '@/hooks/useSiteOperationsBase'
import { EfficiencyResponse } from '@/types'

const SiteOperationsEfficiency = () => {
  const {
    site,
    dateRange,
    onTableDateRangeChange,
    selectedSites,
    requestParams,
    isLoadingSiteList,
  } = useSiteOperationsBase()

  const { data, isLoading, isFetching } = useGetOperationsEfficiencyQuery<EfficiencyResponse>(
    requestParams,
    {
      skip: isLoadingSiteList || selectedSites.length === 0,
    },
  )

  const chartConfig = SITE_OPERATION_CHART_CONFIG.efficiency

  return (
    <SiteOperationsPage
      headerProps={{
        site,
        hasBackButton: true,
        pageTitle: 'Average Efficiency',
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
          unit: chartConfig.unit,
          isLoading: isLoading || isFetching,
          data: data?.data ?? [],
          propName: chartConfig.propName,
          nominalValue: _sumBy(data?.regions ?? [], chartConfig.nominalKey),
          legend: chartConfig.legend,
          yTicksFormatter: chartConfig.yTicksFormatter,
          customDateFormat: dateRange?.period === PERIOD.MONTHLY ? 'MM-dd' : undefined,
        },
      ]}
    />
  )
}

export default SiteOperationsEfficiency
