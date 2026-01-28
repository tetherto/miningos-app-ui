import { format } from 'date-fns/format'
import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'
import _toUpper from 'lodash/toUpper'

import { useMultiSiteMode } from './useMultiSiteMode'

import { PERIOD } from '@/constants/ranges'

export const useMultiSiteRTRequestParams = () => {
  const { siteList, isLoading } = useMultiSiteMode()

  const allSites = _map(siteList, ({ id }) => _toUpper(id))

  interface BuildRequestParamsOptions {
    start: Date | number
    end: Date | number
    sites: string[]
    period?: 'daily' | 'weekly' | 'monthly'
    groupByRegion?: boolean
  }

  const buildRequestParams = ({
    start,
    end,
    sites,
    period = PERIOD.DAILY,
    groupByRegion = false,
  }: BuildRequestParamsOptions) => {
    if (isLoading) return {}

    const selectedRegions = _map(_compact(sites), _toUpper)
    const regions = JSON.stringify(_isEmpty(selectedRegions) ? allSites : selectedRegions)

    const startDate = _isNumber(start) ? new Date(start) : start
    const endDate = _isNumber(end) ? new Date(end) : end

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      regions,
      period,
      groupByRegion,
    }
  }

  return {
    isLoading,
    buildRequestParams,
  }
}

export default useMultiSiteRTRequestParams
