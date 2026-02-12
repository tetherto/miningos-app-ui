import { endOfMonth } from 'date-fns/endOfMonth'
import { startOfMonth } from 'date-fns/startOfMonth'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { isDemoMode } from '@/app/services/api.utils'
import { setTimeframeType } from '@/app/slices/multiSiteSlice'
import { getRangeTimestamps } from '@/app/utils/dateUtils'
import { PERIOD, TIMEFRAME_TYPE } from '@/constants/ranges'
import useTimezone from '@/hooks/useTimezone'
import type { DateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'
import type { TimeframeType } from '@/types/redux'

interface UseFinancialDateRangeOptions {
  defaultPeriod?: string
}

const TIMEFRAME_BY_PERIOD: Record<string, TimeframeType> = {
  [PERIOD.MONTHLY]: TIMEFRAME_TYPE.YEAR,
  [PERIOD.DAILY]: TIMEFRAME_TYPE.MONTH,
}

export const useFinancialDateRange = (options?: UseFinancialDateRangeOptions) => {
  const { defaultPeriod = PERIOD.DAILY } = options || {}
  const dispatch = useDispatch()
  const { timezone } = useTimezone()

  // In demo mode, initialize with fixed date range immediately
  const [dateRange, setDateRange] = useState<DateRange | null>(
    isDemoMode
      ? {
          start: 1769025600000, // Jan 21, 2026 20:00:00 UTC (Jan 22 00:00 UTC+4)
          end: 1769630399999, // Jan 28, 2026 19:59:59 UTC (Jan 28 23:59:59 UTC+4)
          period: defaultPeriod,
        }
      : null,
  )

  const handleRangeChange = (
    dates: [Date, Date] | null,
    rangeOptions?: { year?: number; month?: number; period?: string },
  ) => {
    if (!dates) return
    const [start, end] = getRangeTimestamps(dates, timezone)
    if (!start || !end) return

    setDateRange({
      start: start.getTime(),
      end: end.getTime(),
      period: rangeOptions?.period || PERIOD.MONTHLY,
    })
  }

  useEffect(() => {
    if (!dateRange && !isDemoMode) {
      // Only set default date range in production mode (demo mode already initialized in useState)
      const now = new Date()
      handleRangeChange([startOfMonth(now), endOfMonth(now)], { period: defaultPeriod })
    }
    if (dateRange) {
      dispatch(
        setTimeframeType(
          TIMEFRAME_BY_PERIOD[dateRange.period || defaultPeriod] || TIMEFRAME_TYPE.MONTH,
        ),
      )
    }
  }, [dateRange?.period])

  // In demo mode, always return the fixed date range regardless of user selection
  const effectiveDateRange =
    isDemoMode && dateRange
      ? {
          start: 1769025600000, // Jan 21, 2026 20:00:00 UTC (Jan 22 00:00 UTC+4)
          end: 1769630399999, // Jan 28, 2026 19:59:59 UTC (Jan 28 23:59:59 UTC+4)
          period: dateRange.period,
        }
      : dateRange

  return {
    dateRange: effectiveDateRange,
    setDateRange,
    handleRangeChange,
    timezone,
  }
}
