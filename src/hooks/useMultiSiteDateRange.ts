import _isDate from 'lodash/isDate'
import { useMemo, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  getMultiSiteDateRange,
  getTimeframeType,
  setMultiSiteDateRange,
  setTimeframeType,
} from '@/app/slices/multiSiteSlice'
import { getBeginningOfMonth, getEndOfYesterday } from '@/app/utils/dateUtils'
import { PERIOD } from '@/constants/ranges'
import type { MultiSiteDateRange, TimeframeType } from '@/types/redux'

const toTs = (d: Date | string | number): number =>
  _isDate(d) ? d.getTime() : new Date(d)?.getTime()

const getDefaultRange = (): MultiSiteDateRange => ({
  start: getBeginningOfMonth().getTime(),
  end: getEndOfYesterday().getTime(),
  period: PERIOD.DAILY,
})

export const useMultiSiteDateRange = () => {
  const dispatch = useDispatch()
  const stored = useSelector(getMultiSiteDateRange) as MultiSiteDateRange | null
  const timeframeType = useSelector(getTimeframeType) as TimeframeType | null
  const hasInitialized = useRef(false)

  // Memoize defaultRange to prevent creating a new object on every render
  const defaultRange = useMemo(() => getDefaultRange(), [])
  const dateRange: MultiSiteDateRange = stored || defaultRange

  // Initialize on first usage if empty - only run once
  useEffect(() => {
    if (!stored && !hasInitialized.current) {
      hasInitialized.current = true
      dispatch(setMultiSiteDateRange(getDefaultRange()))
    }
  }, [stored, dispatch])

  const onTableDateRangeChange = (
    dates: [Date | string | number, Date | string | number] | null,
    { period }: { period: string },
  ) => {
    if (!dates) {
      dispatch(setMultiSiteDateRange(getDefaultRange()))
      return
    }
    const [start, end] = dates
    dispatch(
      setMultiSiteDateRange({
        start: toTs(start),
        end: toTs(end),
        period,
      }),
    )
  }

  const onDateRangeReset = () => {
    dispatch(setMultiSiteDateRange(getDefaultRange()))
  }

  const setSelectorType = (type: string) => dispatch(setTimeframeType(type as TimeframeType | null))

  return {
    dateRange,
    onTableDateRangeChange,
    onDateRangeReset,
    timeframeType,
    setSelectorType,
  }
}

export default useMultiSiteDateRange
