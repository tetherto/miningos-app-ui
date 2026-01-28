import { useGetExtDataQuery } from '@/app/services/api'
import { EXT_DATA_GROUP_RANGE } from '@/app/utils/electricityUtils'
import { DATE_RANGE } from '@/constants'
import type { DateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

/**
 * Build query params for electricity/curtailment data
 * Returns curtailment and operational issues data
 *
 * Note: Backend API returns usedEnergy/availableEnergy fields correctly
 * for both groupRange: "1D" and "1M" values.
 */
export const buildElectricityParams = ({ start, end }: DateRange) => {
  // Determine groupRange based on date range duration
  // For monthly/yearly views (>= 25 days), use monthly aggregation
  // For daily/weekly views (< 25 days), use daily aggregation
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  const daysInRange = (end - start) / MS_PER_DAY
  const isMonthlyView = daysInRange >= 25

  const groupRange = isMonthlyView ? EXT_DATA_GROUP_RANGE.MONTH1 : EXT_DATA_GROUP_RANGE.D1

  return {
    type: 'electricity',
    query: JSON.stringify({
      key: 'stats-history',
      start,
      end,
      groupRange,
      dataInterval: DATE_RANGE.H1,
    }),
  }
}

export function useElectricityCurtailmentData(dateRange: DateRange) {
  // Build query params for API call
  const electricityParams = dateRange
    ? buildElectricityParams({
        start: dateRange.start,
        end: dateRange.end,
      })
    : undefined

  const queryOptions = {
    skip: !dateRange,
    refetchOnMountOrArgChange: true,
  }

  // Electricity/Curtailment data
  return useGetExtDataQuery(electricityParams!, queryOptions)
}
