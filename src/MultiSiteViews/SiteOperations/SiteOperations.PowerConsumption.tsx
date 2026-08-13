import _map from 'lodash/map'
import _round from 'lodash/round'
import _sumBy from 'lodash/sumBy'

import { SITE_OPERATION_CHART_CONFIG } from './SiteOperations.helper'
import { SiteOperationsPage } from './SiteOperations.Page'

import { useGetOperationsConsumptionQuery } from '@/app/services/api'
import { formatPowerConsumption } from '@/app/utils/deviceUtils'
import { TIMEFRAME_TYPE } from '@/constants/ranges'
import { useSiteOperationsBase } from '@/hooks/useSiteOperationsBase'
import { ConsumptionResponse } from '@/types'

const SiteOperationsPowerConsumption = () => {
  const {
    site,
    dateRange,
    onTableDateRangeChange,
    selectedSites,
    requestParams,
    isLoadingSiteList,
    timeframeType,
  } = useSiteOperationsBase()

  const { data, isLoading, isFetching } = useGetOperationsConsumptionQuery<ConsumptionResponse>(
    requestParams,
    {
      skip: isLoadingSiteList || selectedSites.length === 0,
    },
  )

  const chartConfig = SITE_OPERATION_CHART_CONFIG.consumption
  const customDateFormat = timeframeType === TIMEFRAME_TYPE.YEAR ? 'yyyy-MM' : 'MM-dd'

  const chartData = _map(data?.data?.log || [], ({ ts, consumption }) => ({
    ts,
    consumption: _round(formatPowerConsumption(consumption).value as number, 2),
  }))

  const nominalValue = _sumBy(data?.regions, chartConfig.nominalKey)

  return (
    <SiteOperationsPage
      headerProps={{
        site,
        pageTitle: 'Power Consumption',
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
          unit: chartConfig.unit,
          data: chartData,
          propName: chartConfig.propName,
          nominalValue,
          legend: chartConfig.legend,
          yTicksFormatter: chartConfig.yTicksFormatter,
          customDateFormat,
        },
      ]}
    />
  )
}

export default SiteOperationsPowerConsumption
