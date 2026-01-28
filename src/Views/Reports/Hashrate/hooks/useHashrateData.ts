import { differenceInDays } from 'date-fns/differenceInDays'
import { endOfDay } from 'date-fns/endOfDay'
import { startOfDay } from 'date-fns/startOfDay'
import { subDays } from 'date-fns/subDays'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import { useMemo } from 'react'

import { useGetTailLogQuery } from '@/app/services/api'
import { DATE_RANGE } from '@/constants'
import {
  STAT_5_MINUTES,
  STAT_3_HOURS,
  STAT_KEY_THRESHOLD_DAYS,
} from '@/constants/tailLogStatKeys.constants'

// Calculate appropriate groupRange based on date range span
export const getGroupRangeFromDateRange = (
  start: number | Date,
  end: number | Date,
): (typeof DATE_RANGE)[keyof typeof DATE_RANGE] => {
  const diffDays = differenceInDays(end, start)

  if (diffDays <= 1) return DATE_RANGE.H1
  if (diffDays <= 30) return DATE_RANGE.D1
  return DATE_RANGE.W1
}

// Get appropriate stat key based on date range span
export const getStatKeyFromDateRange = (start: number | Date, end: number | Date): string => {
  const diffDays = differenceInDays(end, start)
  return diffDays > STAT_KEY_THRESHOLD_DAYS ? STAT_3_HOURS : STAT_5_MINUTES
}

// Default date range: 7 days ending yesterday
const getDefaultDateRange = () => {
  const yesterday = subDays(new Date(), 1)
  const endDate = endOfDay(yesterday)
  const startDate = startOfDay(subDays(yesterday, 6))
  return {
    start: startDate.getTime(),
    end: endDate.getTime(),
  }
}

interface DateRange {
  start: number
  end: number
}

interface UseHashrateDataParams {
  dateRange?: DateRange
  skip?: boolean
}

export const useHashrateData = (params: UseHashrateDataParams = {}) => {
  const { dateRange, skip = false } = params
  const defaultRange = useMemo(() => getDefaultDateRange(), [])
  const { start, end } = dateRange || defaultRange
  const groupRange = useMemo(() => getGroupRangeFromDateRange(start, end), [start, end])
  const statKey = getStatKeyFromDateRange(start, end)

  const queryParams = useMemo(
    () => ({
      key: statKey,
      type: 'miner',
      tag: 't-miner',
      aggrFields: JSON.stringify({
        hashrate_mhs_5m_type_group_sum_aggr: 1,
        hashrate_mhs_5m_container_group_sum_aggr: 1,
      }),
      groupRange,
      start,
      end,
    }),
    [statKey, groupRange, start, end],
  )

  const {
    data: rawData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTailLogQuery(queryParams, { skip })

  // API returns nested arrays (one per ORK), flatten to get first ORK's data
  const data = _isArray(rawData) && _isArray(_head(rawData)) ? _head(rawData) : rawData

  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    refetch,
    queryParams,
  }
}
