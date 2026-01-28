import _findIndex from 'lodash/findIndex'
import _head from 'lodash/head'
import _reduce from 'lodash/reduce'
import _slice from 'lodash/slice'
import { useEffect, useState } from 'react'

import { useLazyGetHistoricalLogsQuery } from '../app/services/api'
import { breakTimeIntoIntervals } from '../app/utils/breakTimeIntoIntervals'
import type { UnknownRecord } from '../app/utils/deviceUtils/types'

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
  intervalLength = 12 * 60 * 60 * 1000, // 12 hours
}: UseFetchHistoricalLogsPaginatedDataParams) => {
  const [lazyHistoricalLogsQuery, { isLoading: isAlertsLogLoading }] =
    useLazyGetHistoricalLogsQuery()
  const [historicalData, setHistoricalData] = useState<HistoricalLogData[]>([])

  useEffect(() => {
    if (!start || !end) return
    const intervals = breakTimeIntoIntervals(start, end, intervalLength)
    const fetchData = async () => {
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
    }
    fetchData()
  }, [logType, intervalLength, start, end, lazyHistoricalLogsQuery])

  return { data: historicalData, isLoading: isAlertsLogLoading }
}
