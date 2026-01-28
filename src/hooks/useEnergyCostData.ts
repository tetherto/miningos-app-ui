import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _meanBy from 'lodash/meanBy'
import _reduce from 'lodash/reduce'
import _startsWith from 'lodash/startsWith'
import _values from 'lodash/values'

import type { UnknownRecord } from '../app/utils/deviceUtils/types'

import useMultiSiteRTRequestParams from './useMultiSiteRTRequestParams'

import {
  useGetCostOperationalEnergyQuery,
  useGetOperationsConsumptionQuery,
  useGetRevenueQuery,
} from '@/app/services/api'
import { PERIOD } from '@/constants/ranges'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import {
  getSiteOperationConfigEnd,
  getSiteOperationConfigStart,
} from '@/MultiSiteViews/SiteOperations/SiteOperations.helper'
import type { MultiSiteDateRange } from '@/types/redux'

interface GetMetricsParams {
  avgPowerConsumption: number
  avgAllInCost: number
  avgEnergyCost: number
  avgPowerAvailability: number
  avgEnergyRevenue: number
  avgOperationsCost: number
}

export const getMetrics = ({
  avgPowerConsumption,
  avgAllInCost,
  avgEnergyCost,
  avgPowerAvailability,
  avgEnergyRevenue,
  avgOperationsCost,
}: GetMetricsParams) => ({
  avgPowerConsumption: {
    label: 'Avg Power Consumption',
    unit: 'MW',
    value: avgPowerConsumption || 0,
  },
  avgEnergyCost: {
    label: 'Avg Energy Cost',
    unit: '$/MW',
    value: avgEnergyCost || 0,
  },
  avgAllInCost: {
    label: 'Avg All-In Cost',
    unit: '$/MW',
    value: avgAllInCost || 0,
  },
  avgPowerAvailability: {
    label: 'Avg Power Availability',
    unit: 'MW',
    value: avgPowerAvailability || 0,
  },
  avgOperationsCost: {
    label: 'Avg Operations Cost',
    unit: '$/MW',
    value: avgOperationsCost || 0,
  },
  avgEnergyRevenue: {
    label: 'Avg Energy Revenue',
    unit: '$/MW',
    value: avgEnergyRevenue || 0,
  },
})

interface UseEnergyCostDataParams {
  dateRange?: { start?: number; end?: number; period?: string }
}

export const useEnergyCostData = ({ dateRange }: UseEnergyCostDataParams) => {
  const { siteId, selectedSites, isMultiSiteModeEnabled } = useMultiSiteMode()
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const hasValidDateRange = Boolean(dateRange?.start && dateRange?.end)

  const start = hasValidDateRange
    ? getSiteOperationConfigStart(dateRange as MultiSiteDateRange)
    : null
  const end = hasValidDateRange ? getSiteOperationConfigEnd(dateRange as MultiSiteDateRange) : null

  // Determine sites array based on selectedSites and siteId
  let sites: string[]
  if (_isEmpty(selectedSites)) {
    sites = siteId ? [siteId] : []
  } else {
    sites = selectedSites
  }

  const params = buildRequestParams({
    start: start || new Date(),
    end: end ? new Date(end) : new Date(),
    period: PERIOD.DAILY,
    sites,
  })

  const queryOptions = {
    skip: !isMultiSiteModeEnabled || isParamBuilderLoading || !hasValidDateRange,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  }

  const {
    data: powerData,
    isLoading: isLoadingPower,
    isFetching: isPowerFetching,
  } = useGetOperationsConsumptionQuery(params, queryOptions)
  const {
    data: costOperationalDataRaw,
    isLoading: isLoadingCost,
    isFetching: isCostFetching,
  } = useGetCostOperationalEnergyQuery(params, queryOptions)
  const {
    data: revenueData,
    isLoading: isRevenueDataLoading,
    isFetching: isRevenueFetching,
  } = useGetRevenueQuery(params, queryOptions)

  // Early return for single-site mode to prevent API call failures
  if (!isMultiSiteModeEnabled) {
    return {
      isLoading: false,
      metrics: getMetrics({
        avgPowerConsumption: 0,
        avgAllInCost: 0,
        avgEnergyCost: 0,
        avgPowerAvailability: 0,
        avgEnergyRevenue: 0,
        avgOperationsCost: 0,
      }),
      powerData: undefined,
      isRevenueDataLoading: false,
      costData: {},
      revenueData: undefined,
    }
  }

  // Return early with default values if date range is invalid
  if (!hasValidDateRange) {
    return {
      isLoading: false,
      metrics: getMetrics({
        avgPowerConsumption: 0,
        avgAllInCost: 0,
        avgEnergyCost: 0,
        avgPowerAvailability: 0,
        avgEnergyRevenue: 0,
        avgOperationsCost: 0,
      }),
      powerData: undefined,
      isRevenueDataLoading: false,
      costData: {},
      revenueData: undefined,
    }
  }

  const entries = _values((costOperationalDataRaw as UnknownRecord)?.summary || {})
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

  const avgPowerConsumption =
    _meanBy(
      (((powerData as UnknownRecord)?.data as UnknownRecord)?.log as UnknownRecord[]) || [],
      ({ consumption }) => (consumption as UnknownRecord)?.consumption ?? 0,
    ) || 0
  const avgPowerAvailability = ((powerData as UnknownRecord)?.availablePower as number) || 0
  const avgAllInCost = (costOperationalData?.avgAllInCostsUSD as number) || 0
  const avgEnergyCost = (costOperationalData?.avgEnergyCostsUSD as number) || 0
  const avgOperationsCost = (costOperationalData?.avgOperationalCostsUSD as number) || 0
  const avgEnergyRevenue = _get(
    revenueData as UnknownRecord,
    ['summary', 'avg', 'revenueUSD'],
    0,
  ) as number

  const metrics = getMetrics({
    avgPowerConsumption,
    avgAllInCost,
    avgEnergyCost,
    avgPowerAvailability,
    avgEnergyRevenue,
    avgOperationsCost,
  })

  const isLoading =
    isLoadingPower ||
    isLoadingCost ||
    isRevenueDataLoading ||
    isParamBuilderLoading ||
    isPowerFetching ||
    isCostFetching ||
    isRevenueFetching

  return {
    isLoading,
    metrics,
    powerData,
    isRevenueDataLoading,
    costData: costOperationalData,
    revenueData: (revenueData as UnknownRecord)?.log,
  }
}
