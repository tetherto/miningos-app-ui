import { useSelector } from 'react-redux'

import {
  getSiteOperationConfigStart,
  getSiteOperationConfigEnd,
} from '../MultiSiteViews/SiteOperations/SiteOperations.helper'

import useMultiSiteRTRequestParams from './useMultiSiteRTRequestParams'

import { getSelectedSites } from '@/app/slices/multiSiteSlice'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'

export const useSiteOperationsBase = () => {
  const { dateRange, onTableDateRangeChange, timeframeType } = useMultiSiteDateRange()
  const { site, siteId, isLoading: isLoadingSiteList, siteSelectOptions } = useMultiSiteMode()
  const { buildRequestParams } = useMultiSiteRTRequestParams()
  const selectedSites = useSelector(getSelectedSites)

  const start = getSiteOperationConfigStart(dateRange) as unknown as number | Date
  const end = getSiteOperationConfigEnd(dateRange) as unknown as number | Date

  const requestParams = buildRequestParams({
    start,
    end,
    period: dateRange?.period as 'daily' | 'weekly' | 'monthly',
    sites: siteId ? [siteId] : selectedSites,
    groupByRegion: true,
  })

  return {
    site,
    dateRange,
    onTableDateRangeChange,
    siteSelectOptions: siteSelectOptions,
    selectedSites,
    requestParams,
    isLoadingSiteList,
    timeframeType,
  }
}
