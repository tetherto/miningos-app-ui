import _head from 'lodash/head'
import _keyBy from 'lodash/keyBy'
import { useEffect, useState } from 'react'

import { useLazyGetExtDataQuery } from '../app/services/api'

interface Worker {
  name: string
  [key: string]: unknown
}

export const useMinerpoolWorkers = () => {
  const [lazyWorkersRequest] = useLazyGetExtDataQuery()
  const WORKERS_PER_REQUEST = 500
  const [workersSliceOffset, setWorkersSliceOffset] = useState(0)
  const [workersData, setWorkersData] = useState<Worker[]>([])
  const [workersObj, setWorkersObj] = useState<Record<string, Worker> | undefined>()

  useEffect(() => {
    const fetchData = async (offset: number) => {
      const response = await lazyWorkersRequest({
        type: 'minerpool',
        query: JSON.stringify({
          key: 'workers',
          limit: WORKERS_PER_REQUEST,
          offset,
        }),
        limit: 1,
      }).unwrap()

      const firstItem = _head(response as Array<{ workers?: Worker[] } | undefined>)
      const workers = firstItem?.workers || []

      if (workers && workers.length > 0) {
        setWorkersSliceOffset(offset + WORKERS_PER_REQUEST)
        setWorkersData((prev) => [...prev, ...workers])
        fetchData(offset + WORKERS_PER_REQUEST)
      } else {
        setWorkersObj(_keyBy(workersData, 'name'))
      }
    }

    fetchData(workersSliceOffset)
  }, [workersSliceOffset, lazyWorkersRequest])

  return { workersObj }
}
