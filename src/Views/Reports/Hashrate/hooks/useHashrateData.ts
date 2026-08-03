import { endOfDay } from 'date-fns/endOfDay'
import { startOfDay } from 'date-fns/startOfDay'
import { subDays } from 'date-fns/subDays'
import { useMemo } from 'react'

import { useGetMetricsHashrateGroupedQuery } from '@/app/services/api'
import type { MetricsHashrateGroupBy } from '@/types/api'

interface DateRange {
  start: number
  end: number
}

interface UseHashrateDataParams {
  dateRange?: DateRange
  groupBy: MetricsHashrateGroupBy
  skip?: boolean
}

const getDefaultDateRange = (): DateRange => {
  const yesterday = subDays(new Date(), 1)
  return {
    start: startOfDay(subDays(yesterday, 6)).getTime(),
    end: endOfDay(yesterday).getTime(),
  }
}

export const useHashrateData = ({ dateRange, groupBy, skip = false }: UseHashrateDataParams) => {
  const defaultRange = useMemo(() => getDefaultDateRange(), [])
  const { start, end } = dateRange ?? defaultRange

  const queryParams = useMemo(() => ({ start, end, groupBy }), [start, end, groupBy])

  const { data, isLoading, isFetching, error, refetch } = useGetMetricsHashrateGroupedQuery(
    queryParams,
    { skip },
  )

  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    refetch,
    queryParams,
  }
}
