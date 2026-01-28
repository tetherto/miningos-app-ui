import _get from 'lodash/get'

import useMultiSiteRTRequestParams from './useMultiSiteRTRequestParams'

import { useGetBtcDataPriceQuery } from '@/app/services/api'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import type { MultiSiteDateRange } from '@/types/redux'

export const useAverageBtcPrice = (dateRange: MultiSiteDateRange) => {
  const { siteId, selectedSites, isMultiSiteModeEnabled } = useMultiSiteMode()
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  // Skip API call in single-site mode to prevent failures
  const shouldSkip =
    !isMultiSiteModeEnabled || !dateRange?.start || !dateRange?.end || isParamBuilderLoading

  let sites: string[] = []
  if (siteId) {
    sites = [siteId]
  } else if (selectedSites?.length) {
    sites = selectedSites
  }

  const params = shouldSkip
    ? {}
    : buildRequestParams({
        start: dateRange?.start,
        end: dateRange?.end,
        period: dateRange.period as 'daily' | 'weekly' | 'monthly',
        // Empty sites means "all" per buildRequestParams
        sites,
      })

  const options = {
    skip: shouldSkip,
  }

  const { data, isLoading: isBtcDataPriceLoading } = useGetBtcDataPriceQuery(params, options)
  const averageBtcPrice = _get(data, ['summary', 'avg', 'priceUSD'])

  const isLoading = isParamBuilderLoading || isBtcDataPriceLoading

  return {
    averageBtcPrice,
    isLoading,
  }
}
