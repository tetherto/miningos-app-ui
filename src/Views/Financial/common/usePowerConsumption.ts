import { format } from 'date-fns/format'

import { useGetTailLogRangeAggrQuery } from '@/app/services/api'
import type { DateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

const formatDate = "yyyy-MM-dd'T'HH:mm:ss'Z'"

/**
 * Build query params for tail log range aggregation (power consumption)
 */
export const buildPowerConsumptionParams = ({ start, end }: DateRange) => ({
  keys: JSON.stringify([
    {
      type: 'powermeter',
      startDate: format(new Date(start), formatDate),
      endDate: format(new Date(end), formatDate),
      fields: { site_power_w: 1 },
      aggrFields: { site_power_w: 1 },
      shouldReturnDailyData: 1,
    },
  ]),
})

export function usePowerConsumption(dateRange: DateRange) {
  // Build query params for API call
  const powerParams = dateRange
    ? buildPowerConsumptionParams({ start: dateRange.start, end: dateRange.end })
    : undefined

  const queryOptions = {
    skip: !dateRange,
    refetchOnMountOrArgChange: true,
  }

  // Power consumption (tail log range aggr)
  return useGetTailLogRangeAggrQuery(powerParams!, queryOptions)
}
