import _sortBy from 'lodash/sortBy'
import _sumBy from 'lodash/sumBy'

import { transformHashrateDataToCards } from '../SiteOperations/SiteOperations.helper'

import { SITE_OPERATION_CHART_CONFIG } from './SiteOperations.helper'
import { SiteOperationsPage } from './SiteOperations.Page'

import { useGetBtcDataHashPriceQuery, useGetOperationsHashrateQuery } from '@/app/services/api'
import { PERIOD } from '@/constants/ranges'
import { CURRENCY } from '@/constants/units'
import { useSiteOperationsBase } from '@/hooks/useSiteOperationsBase'
import { HashpriceResponse, HashrateResponse } from '@/types'

const SiteOperationsHashrate = () => {
  const {
    site,
    dateRange,
    onTableDateRangeChange,
    selectedSites,
    requestParams,
    isLoadingSiteList,
  } = useSiteOperationsBase()

  // Fetch hashrate data
  const { data, isLoading, isFetching } = useGetOperationsHashrateQuery<HashrateResponse>(
    requestParams,
    {
      skip: isLoadingSiteList || selectedSites.length === 0,
    },
  )

  // Fetch average BTC hashprice data
  const {
    data: avgData,
    isLoading: isLoadingAvgPrice,
    isFetching: isAvgPriceFetching,
  } = useGetBtcDataHashPriceQuery<HashpriceResponse>(requestParams, {
    skip: isLoadingSiteList || selectedSites.length === 0,
  })

  // BE returns array in decreasing order, so sort ascending by timestamp
  const hashpriceData = _sortBy(avgData?.log ?? [], 'ts')

  const { hashrate: hashrateChartConfig, hashprice: hashpriceChartConfig } =
    SITE_OPERATION_CHART_CONFIG

  const cardsData = transformHashrateDataToCards(data, !!site)

  const commonChartConfig =
    dateRange?.period === PERIOD.MONTHLY
      ? {
          customDateFormat: 'MM-dd',
          uniformDistribution: true,
        }
      : undefined

  return (
    <SiteOperationsPage
      cardsData={cardsData}
      headerProps={{
        site,
        pageTitle: 'Average Hashrate',
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
          ...commonChartConfig,
          title: hashrateChartConfig.title,
          isLoading: isLoading || isFetching,
          unit: hashrateChartConfig.unit,
          data: data?.data ?? [],
          propName: hashrateChartConfig.propName,
          nominalValue: _sumBy(data?.regions ?? [], hashrateChartConfig.nominalKey),
          legend: hashrateChartConfig.legend,
          yTicksFormatter: hashrateChartConfig.yTicksFormatter,
        },
        {
          ...commonChartConfig,
          title: hashpriceChartConfig.title,
          isLoading: isLoadingAvgPrice || isAvgPriceFetching,
          unit: hashpriceChartConfig.unit ?? CURRENCY.USD_LABEL,
          data: hashpriceData,
          propName: hashpriceChartConfig.propName,
          legend: hashpriceChartConfig.legend,
          yTicksFormatter: hashpriceChartConfig.yTicksFormatter,
        },
      ]}
    />
  )
}

export default SiteOperationsHashrate
