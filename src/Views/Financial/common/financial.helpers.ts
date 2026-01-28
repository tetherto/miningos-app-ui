import { format } from 'date-fns/format'

import { PeriodType } from './financial.types'

import { PERIOD } from '@/constants/ranges'
import type { DateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

export const MS_PER_DAY = 86400000

export const getStartOfDay = (ts: number): number => Math.floor(ts / MS_PER_DAY) * MS_PER_DAY

export const getPeriodKey = (timestamp: number, periodType: PeriodType): string => {
  const date = new Date(timestamp)

  switch (periodType) {
    case 'month':
      return format(date, 'yyyy-MM')

    case 'week': {
      return format(date, 'MM-dd')
    }

    case 'day': {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return days[date.getDay()]
    }

    default:
      return format(date, 'yyyy-MM')
  }
}

export const getPeriodType = (dateRange: DateRange | null): PeriodType => {
  if (!dateRange?.period) return 'month'
  if (dateRange.period === PERIOD.MONTHLY) return 'month'
  if (dateRange.period === PERIOD.DAILY) {
    const days = Math.ceil((dateRange.end - dateRange.start) / MS_PER_DAY)
    return days <= 7 ? 'day' : 'week'
  }
  return 'month'
}
