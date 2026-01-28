import _isEqual from 'lodash/isEqual'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getTimeRoundedToMinute } from '../app/utils/dateTimeUtils'
import { getBeginningOfMonth, getEndOfYesterday } from '../app/utils/dateUtils'

import type { DateRangeWithPeriod, TableDateRangeOptions } from './hooks.types'
import usePreviousValue from './usePreviousValue'

import { getMultiSiteDateRange, setMultiSiteDateRange } from '@/app/slices/multiSiteSlice'
import { PERIOD } from '@/constants/ranges'

const MS_PER_DAY = 24 * 60 * 60 * 1_000
const DEFAULT_STORAGE_KEY = 'ms_dateRange'

const parseTimestamp = (ts: number | Date | string): number => new Date(ts)?.getTime()

const loadStoredRange = (storageKey: string): DateRangeWithPeriod | null => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const stored = JSON.parse(raw)
    if (!stored || !stored.start || !stored.end || !stored.period) return null
    return {
      start: parseTimestamp(stored.start),
      end: parseTimestamp(stored.end),
      period: stored.period,
    }
  } catch {
    return null
  }
}

const saveStoredRange = (storageKey: string, range: DateRangeWithPeriod): void => {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ start: range.start, end: range.end, period: range.period }),
    )
  } catch {
    // Ignore localStorage errors
  }
}

const getDefaultDateRange = ({
  start,
  end,
  daysAgo,
}: Partial<TableDateRangeOptions> = {}): DateRangeWithPeriod => {
  if (start && end) {
    return {
      start: parseTimestamp(start),
      end: parseTimestamp(end),
      period: PERIOD.DAILY,
    }
  }

  if (daysAgo) {
    const currentTimestamp = getTimeRoundedToMinute()
    return {
      start: currentTimestamp - daysAgo * MS_PER_DAY,
      end: currentTimestamp,
      period: PERIOD.DAILY,
    }
  }

  // Default to current month (1st to yesterday)
  return {
    start: getBeginningOfMonth().getTime(),
    end: getEndOfYesterday().getTime(),
    period: PERIOD.DAILY,
  }
}

export const useTableDateRange = ({
  isResetable = false,
  daysAgo,
  persist = false,
  storageKey = DEFAULT_STORAGE_KEY,
  useRedux = false,
  ...defaultRangeParams
}: TableDateRangeOptions = {}) => {
  const defaultDateRange = getDefaultDateRange({ ...defaultRangeParams, daysAgo })
  const prevDaysAgo = usePreviousValue(daysAgo)
  const dispatch = useDispatch()
  const storeRange = useSelector(getMultiSiteDateRange)

  const [dateRange, setDateRange] = useState<DateRangeWithPeriod>(() => {
    if (useRedux && storeRange) return storeRange
    if (persist) return loadStoredRange(storageKey) || defaultDateRange
    return defaultDateRange
  })

  useEffect(() => {
    if (!_isEqual(daysAgo, prevDaysAgo)) {
      setDateRange(getDefaultDateRange({ daysAgo }))
    }
  }, [daysAgo, prevDaysAgo])

  // keep in sync with redux store if enabled
  useEffect(() => {
    if (useRedux && storeRange) {
      setDateRange(storeRange)
    }
  }, [useRedux, storeRange?.start, storeRange?.end, storeRange?.period])

  const onDateRangeReset = () => {
    setDateRange(defaultDateRange)
    if (persist) saveStoredRange(storageKey, defaultDateRange)
    if (useRedux) dispatch(setMultiSiteDateRange(defaultDateRange))
  }

  const onTableDateRangeChange = (
    dates: [Date, Date] | null,
    { period }: { period?: string } = {},
  ) => {
    if (!dates) {
      if (isResetable) {
        onDateRangeReset()
      }

      return
    }

    const [startDate, endDate] = dates

    const next: DateRangeWithPeriod = {
      start: parseTimestamp(startDate),
      end: parseTimestamp(endDate),
      period: period || PERIOD.DAILY,
    }
    setDateRange(next)
    if (persist) saveStoredRange(storageKey, next)
    if (useRedux) dispatch(setMultiSiteDateRange(next))
  }

  return {
    defaultDateRange,
    dateRange,
    onTableDateRangeChange,
    onDateRangeReset,
  }
}

export default useTableDateRange
