import { format } from 'date-fns/format'
import { toZonedTime } from 'date-fns-tz'
import _isDate from 'lodash/isDate'

import { DateLabelWrapper, LabelHeader } from '../Common.style'

import useTimezone from '@/hooks/useTimezone'

interface DateLabelProps {
  startDate?: Date | null
  endDate?: Date | null
}

export const DateLabel = ({ startDate, endDate }: DateLabelProps) => {
  const { timezone } = useTimezone()

  const formatDate = (date?: Date | null): string => {
    if (!_isDate(date) || isNaN(date?.getTime?.())) return '--/--/--'

    const zonedDate = toZonedTime(date, timezone)
    return format(zonedDate, 'dd/MM/yy')
  }

  return (
    <DateLabelWrapper>
      <LabelHeader>PERIOD:</LabelHeader>
      <span>{formatDate(startDate)}</span>
      <span>-</span>
      <span>{formatDate(endDate)}</span>
    </DateLabelWrapper>
  )
}
