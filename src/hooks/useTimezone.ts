import { format, toZonedTime } from 'date-fns-tz'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setTimezone } from '../app/store'
import { DATE_TIME_FORMAT_WITH_SECONDS } from '../constants/dates'

import type { RootState } from '@/types/redux'

interface UseTimezoneReturn {
  getFormattedDate: (date: Date | number, fixedTimezone?: string, formatString?: string) => string
  timezone: string
  changeTimezone: (tz: string) => void
}

const useTimezone = (): UseTimezoneReturn => {
  const { timezone } = useSelector((state: RootState) => state.timezone)

  const dispatch = useDispatch()

  const getFormattedDate = useCallback(
    (date: Date | number, fixedTimezone?: string, formatString?: string): string => {
      const zonedDate = toZonedTime(date, fixedTimezone || timezone)
      return format(zonedDate, formatString || DATE_TIME_FORMAT_WITH_SECONDS, {
        timeZone: fixedTimezone || timezone,
      })
    },
    [timezone],
  )

  const changeTimezone = useCallback(
    (tz: string): void => {
      dispatch(setTimezone(tz))
    },
    [dispatch],
  )

  return useMemo(
    () => ({ getFormattedDate, timezone, changeTimezone }),
    [getFormattedDate, timezone, changeTimezone],
  )
}

export default useTimezone
