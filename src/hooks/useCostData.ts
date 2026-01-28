import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _startsWith from 'lodash/startsWith'
import _values from 'lodash/values'

import { useGetBtcDataHashPriceQuery, useGetCostOperationalEnergyQuery } from '@/app/services/api'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { useEnergyCostData } from '@/hooks/useEnergyCostData'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import useMultiSiteRTRequestParams from '@/hooks/useMultiSiteRTRequestParams'

const DOLLAR_PER_MWH = '$/MWh'

interface GetMetricsParams {
  allInCost: number | null
  energyCost: number | null
  operationsCost: number | null
}

export const getMetrics = ({ allInCost, energyCost, operationsCost }: GetMetricsParams) => ({
  totalBtc: {
    label: 'All-in Cost',
    unit: DOLLAR_PER_MWH,
    value: allInCost,
    isHighlighted: true,
  },
  energyCostBtc: {
    label: 'Energy Cost',
    unit: DOLLAR_PER_MWH,
    value: energyCost,
  },
  operationsCostBtc: {
    label: 'Operations Cost',
    unit: DOLLAR_PER_MWH,
    value: operationsCost,
  },
})

export const useCostData = () => {
  const { siteId, site, selectedSites, siteList, isMultiSiteModeEnabled } = useMultiSiteMode()
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const { start, end, period } = dateRange ?? {}

  // Determine sites array based on selectedSites and siteId
  let sites: string[]
  if (_isEmpty(selectedSites)) {
    sites = siteId ? [siteId] : []
  } else {
    sites = selectedSites
  }

  const params = buildRequestParams({
    start,
    end,
    period: period as 'daily' | 'weekly' | 'monthly',
    sites,
  })

  const options = {
    skip: !isMultiSiteModeEnabled || !dateRange?.start || !dateRange?.end || isParamBuilderLoading,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  }

  const {
    isLoading: isBtcDataLoading,
    isFetching: isBtcDataFetching,
    data: btcData,
  } = useGetBtcDataHashPriceQuery(params, options)
  const {
    isLoading: isCostOperationalDataLoading,
    isFetching: isCostOperationalDataFetching,
    data: costOperationalDataRaw,
  } = useGetCostOperationalEnergyQuery(params, options)

  const { costData, revenueData, isRevenueDataLoading, isLoading } = useEnergyCostData({
    dateRange,
  })

  // Early return for single-site mode to prevent API call failures
  if (!isMultiSiteModeEnabled) {
    return {
      data: {
        costData: {},
        revenueData: [],
        allInCost: 0,
        energyCost: 0,
        operationsCost: 0,
        btcData: [],
        metrcis: {},
      },
      isDataLoading: false,
      isRevenueDataLoading: false,
      metrcis: {},
      dateRange,
      onTableDateRangeChange,
      siteId,
      site,
      selectedSites,
      siteList,
    }
  }

  const entries = _values(costOperationalDataRaw || {})
  const count = entries.length

  const costOperationalData: UnknownRecord = {}

  if (entries.length > 0) {
    const firstEntry = entries[0] as UnknownRecord
    for (const key in firstEntry) {
      const values = _map(entries, (obj: unknown) => (obj as UnknownRecord)[key])
      if (_startsWith(key, 'avg')) {
        costOperationalData[key] =
          _reduce(values, (sum, val) => (sum as number) + (val as number), 0) / count
      } else {
        costOperationalData[key] = _reduce(
          values,
          (sum, val) => (sum as number) + (val as number),
          0,
        )
      }
    }
  }

  const allInCost = (costOperationalData?.allInCostsUSD as number) || 0
  const energyCost = (costOperationalData?.energyCostsUSD as number) || 0
  const operationsCost = (costOperationalData?.operationalCostsUSD as number) || 0

  const metrcis = getMetrics({
    allInCost,
    energyCost,
    operationsCost,
  })

  const isDataLoading =
    isLoading ||
    isParamBuilderLoading ||
    isRevenueDataLoading ||
    isBtcDataLoading ||
    isCostOperationalDataLoading ||
    isBtcDataFetching ||
    isCostOperationalDataFetching

  return {
    data: {
      costData,
      revenueData,
      allInCost,
      energyCost,
      operationsCost,
      btcData,
      metrcis,
    },
    isDataLoading,
    isRevenueDataLoading,
    metrcis,
    dateRange,
    onTableDateRangeChange,
    siteId,
    site,
    selectedSites,
    siteList,
  }
}
