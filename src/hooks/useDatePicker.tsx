import React, { useState } from 'react'

import { getRangeTimestamps } from '../app/utils/dateUtils'
import PresetDateRangePicker from '../Components/PresetDateRangePicker/PresetDateRangePicker'

import useTableDateRange from './useTableDateRange'
import useTimezone from './useTimezone'

interface UseDateRangePickerOptions {
  start?: number | Date
  end?: number | Date
  daysAgo?: number
  isResetable?: boolean
  isFutureAvailable?: boolean
  isTimeShown?: boolean
  isDisabled?: boolean
  onDisabledDatesGet?: (currValue: Date) => boolean
  isPresetsDisabled?: boolean
  persist?: boolean
  storageKey?: string
  useRedux?: boolean
  defaultRange?: DateRange
}

export interface DateRange {
  start: number
  end: number
}

interface UseDateRangePickerReturn {
  dateRange: DateRange
  datePicker: React.JSX.Element
  onTableDateRangeChange: (range: DateRange | null) => void
  onDateRangeReset: () => void
}

export const useDateRangePicker = (
  options: UseDateRangePickerOptions = {},
): UseDateRangePickerReturn => {
  const {
    start,
    end,
    daysAgo,
    isResetable = true,
    isFutureAvailable = false,
    isTimeShown = false,
    isDisabled = false,
    onDisabledDatesGet,
    isPresetsDisabled = false,
    // pass-through options for useTableDateRange
    persist = false,
    storageKey,
    useRedux = false,
    defaultRange,
  } = options

  const { timezone } = useTimezone()

  const { defaultDateRange, dateRange, onTableDateRangeChange, onDateRangeReset } =
    useTableDateRange({
      start,
      end,
      daysAgo,
      isResetable,
      persist,
      storageKey,
      useRedux,
    })

  const [pickerDates, setPickerDates] = useState<DateRange>(dateRange)

  const handleDateRangeChange = (dates: [Date, Date] | [null, null] | null): void => {
    if (!dates || !dates[0] || !dates[1]) {
      onDateRangeReset()

      setPickerDates(defaultDateRange)

      return
    }

    // Type guard ensures dates is [Date, Date] here
    const validDates: [Date, Date] = [dates[0], dates[1]]
    const nextTableDateRange = getRangeTimestamps(validDates, timezone)

    // getRangeTimestamps returns [Date, Date] | [null, null], but we've validated dates are not null
    if (nextTableDateRange && nextTableDateRange[0] && nextTableDateRange[1]) {
      onTableDateRangeChange([nextTableDateRange[0], nextTableDateRange[1]])
    }

    const [start, end] = validDates

    setPickerDates({ start: start.getTime(), end: end.getTime() })
  }

  const datePicker = (
    <PresetDateRangePicker
      isEmptyValueTriggerable
      enableFutureDates={isFutureAvailable}
      showTime={isTimeShown}
      disabled={isDisabled}
      presetsDisabled={isPresetsDisabled}
      currentValue={[new Date(pickerDates.start), new Date(pickerDates.end)]}
      onRangeChange={handleDateRangeChange}
      getDisabledDates={onDisabledDatesGet}
    />
  )

  const wrappedOnTableDateRangeChange = (range: DateRange | null) => {
    if (!range) {
      setPickerDates({
        start: defaultRange?.start || defaultDateRange.start,
        end: defaultRange?.end || defaultDateRange.end,
      })
      onTableDateRangeChange(null)
      return
    }
    // Convert DateRange (with number timestamps) to [Date, Date] tuple
    onTableDateRangeChange([new Date(range.start), new Date(range.end)])
  }

  const wrappedOnDateRangeReset = () => {
    onDateRangeReset()
    setPickerDates(defaultDateRange)
  }

  return {
    dateRange,
    datePicker,
    onTableDateRangeChange: wrappedOnTableDateRangeChange,
    onDateRangeReset: wrappedOnDateRangeReset,
  }
}
