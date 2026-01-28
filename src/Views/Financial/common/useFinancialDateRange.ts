import { endOfMonth } from 'date-fns/endOfMonth'
import { startOfMonth } from 'date-fns/startOfMonth'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

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
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

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
    if (!dateRange) {
      const now = new Date()
      handleRangeChange([startOfMonth(now), endOfMonth(now)], { period: defaultPeriod })
      dispatch(setTimeframeType(TIMEFRAME_BY_PERIOD[defaultPeriod] || TIMEFRAME_TYPE.MONTH))
    }
  }, [])

  return {
    dateRange,
    setDateRange,
    handleRangeChange,
    timezone,
  }
}
