import { format } from 'date-fns/format'

import { useGetTailLogRangeAggrQuery } from '@/app/services/api'
import type { DateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

const formatDate = "yyyy-MM-dd'T'HH:mm:ss'Z'"

/**
 * Build query params for tail log range aggregation (hashrate + power)
 */
export const buildTailLogRangeAggrParams = ({ start, end }: DateRange) => ({
  keys: JSON.stringify([
    {
      type: 'miner',
      startDate: format(new Date(start), formatDate),
      endDate: format(new Date(end), formatDate),
      shouldReturnDailyData: 1,
      fields: { hashrate_mhs_5m_sum_aggr: 1 },
    },
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

export function useTailLog(dateRange: DateRange) {
  // Build query params for API call
  const powerParams = dateRange
    ? buildTailLogRangeAggrParams({ start: dateRange.start, end: dateRange.end })
    : undefined

  const queryOptions = {
    skip: !dateRange,
    refetchOnMountOrArgChange: true,
  }

  // Tail log range aggregation (hashrate + power)
  return useGetTailLogRangeAggrQuery(powerParams!, queryOptions)
}
