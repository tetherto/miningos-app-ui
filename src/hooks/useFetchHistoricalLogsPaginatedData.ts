import _findIndex from 'lodash/findIndex'
import _head from 'lodash/head'
import _reduce from 'lodash/reduce'
import _slice from 'lodash/slice'
import { useEffect, useState } from 'react'

import { useLazyGetHistoricalLogsQuery } from '../app/services/api'
import { breakTimeIntoIntervals } from '../app/utils/breakTimeIntoIntervals'
import type { UnknownRecord } from '../app/utils/deviceUtils/types'

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1_000 // 24 hours
interface HistoricalLogData extends UnknownRecord {
  thing?: { id?: string }
}

export const updateHistoricalData = (
  data: HistoricalLogData[],
  prev: HistoricalLogData[],
): HistoricalLogData[] =>
  _reduce(
    data,
    (acc, newData) => {
      const existingIndex = _findIndex(acc, (singleData) => singleData.uuid === newData.uuid)
      if (existingIndex !== -1) {
        acc[existingIndex] = newData
      } else {
        acc.push(newData)
      }
      return acc
    },
    _slice(prev),
  )

interface UseFetchHistoricalLogsPaginatedDataParams {
  start?: number
  end?: number
  logType?: string
  intervalLength?: number
}

export const useFetchHistoricalLogsPaginatedData = ({
  start,
  end,
  logType,
  intervalLength = ONE_DAY_IN_MS,
}: UseFetchHistoricalLogsPaginatedDataParams) => {
  const [lazyHistoricalLogsQuery] = useLazyGetHistoricalLogsQuery()
  const [historicalData, setHistoricalData] = useState<HistoricalLogData[]>([])
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if (!start || !end) return

    const intervals = breakTimeIntoIntervals(start, end, intervalLength)

    const fetchData = async () => {
      setIsFetching(true)
      setHistoricalData([])
      for (const interval of intervals) {
        try {
          const response = await lazyHistoricalLogsQuery({
            start: interval.start,
            end: interval.end,
            logType,
          }).unwrap()

          setHistoricalData((prev) =>
            updateHistoricalData(_head(response) as HistoricalLogData[], prev),
          )
        } catch {
          // Ignore errors for individual requests
        }
      }
      setIsFetching(false)
    }
    fetchData()
  }, [logType, intervalLength, start, end, lazyHistoricalLogsQuery])

  return { data: historicalData, isLoading: isFetching }
}
