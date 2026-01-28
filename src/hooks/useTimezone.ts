import { format, toZonedTime } from 'date-fns-tz'
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

  return {
    getFormattedDate: (
      date: Date | number,
      fixedTimezone?: string,
      formatString?: string,
    ): string => {
      const zonedDate = toZonedTime(date, fixedTimezone || timezone)
      return format(zonedDate, formatString || DATE_TIME_FORMAT_WITH_SECONDS, {
        timeZone: fixedTimezone || timezone,
      })
    },
    timezone,
    changeTimezone: (tz: string): void => {
      dispatch(setTimezone(tz))
    },
  }
}

export default useTimezone
