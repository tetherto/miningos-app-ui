import { addHours } from 'date-fns/addHours'
import { format } from 'date-fns/format'
import { startOfHour } from 'date-fns/startOfHour'
import { startOfMinute } from 'date-fns/startOfMinute'
import { sub } from 'date-fns/sub'
import { toZonedTime } from 'date-fns-tz'

import type { TimeRangeFormatted } from './utils.types'

const DEFAULT_TIMEZONE = 'America/Montevideo'

export const getTimeRoundedToMinute = (date: Date = new Date()): number => {
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date.getTime()
}

export function getNextHourRange(timestampMs?: number): TimeRangeFormatted {
  if (!timestampMs) {
    return {
      start: '',
      end: '',
      formatted: '',
    }
  }

  const dateUTC = new Date(timestampMs)
  const zonedTime = toZonedTime(dateUTC, DEFAULT_TIMEZONE)

  const nextHourStart = startOfHour(addHours(zonedTime, 1))
  const nextHourEnd = addHours(nextHourStart, 1)

  const startStr = format(nextHourStart, 'HH:mm')
  const endStr = format(nextHourEnd, 'HH:mm')

  return {
    start: startStr,
    end: endStr,
    formatted: `${startStr} - ${endStr}`,
  }
}

export const getLastMinuteTime = () =>
  startOfMinute(
    sub(new Date(), {
      minutes: 1,
    }),
  )
