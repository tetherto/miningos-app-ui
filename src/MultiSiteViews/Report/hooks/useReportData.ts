import _filter from 'lodash/filter'
import _map from 'lodash/map'
import _toLower from 'lodash/toLower'
import _toUpper from 'lodash/toUpper'
import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router'

import { parseDateRange, PERIOD_MAP } from '../Report.util'

import { useGetReportsQuery } from '@/app/services/api'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'

/**
 * Hook to fetch and filter report data based on URL parameters and site selection
 *
 * Handles:
 * - URL siteId parameter for single-site view
 * - Selected sites filter for multi-site view
 * - Report type and date range from search params
 */
export function useReportData() {
  const { siteId } = useParams()
  const [searchParams] = useSearchParams()
  const { selectedSites, siteList, getSiteById } = useMultiSiteMode()

  const reportType = searchParams.get('reportType') || 'annual'
  const dateRange = searchParams.get('dateRange') || ''
  const location = searchParams.get('location') || 'All Sites'

  const { startDate, endDate } = parseDateRange(dateRange)

  // Priority: URL param > selected filter > all sites
  const regions = useMemo(() => {
    if (siteId) {
      return [_toUpper(siteId)]
    }
    if (selectedSites?.length > 0) {
      return _map(selectedSites, (id) => _toUpper(id))
    }
    return _map(siteList, (s) => _toUpper(s.id))
  }, [siteId, selectedSites, siteList])

  // Filter site list based on URL param if present
  const filteredSiteList = useMemo(() => {
    if (siteId) {
      return _filter(siteList, (s) => _toLower(s.id) === _toLower(siteId))
    }
    return siteList
  }, [siteId, siteList])

  const period = PERIOD_MAP[reportType] || 'monthly'

  const {
    data: reportData,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetReportsQuery({
    regions,
    startDate,
    endDate,
    period,
  })

  // Get site info if viewing a single site
  const currentSite = siteId ? getSiteById(siteId) : null

  return {
    // Data
    reportData,
    error,
    isLoading,
    isFetching,
    refetch,

    // URL/Query params
    reportType,
    dateRange,
    location,
    siteId,

    // Computed
    regions,
    filteredSiteList,
    currentSite,
    startDate,
    endDate,
    period,

    // Helpers
    isSingleSite: !!siteId,
    hasData: !!reportData && !!reportData.regions,
  }
}

export type UseReportDataReturn = ReturnType<typeof useReportData>
