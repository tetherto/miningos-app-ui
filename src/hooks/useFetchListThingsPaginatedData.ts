import _filter from 'lodash/filter'
import _findIndex from 'lodash/findIndex'
import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _reduce from 'lodash/reduce'
import { useEffect, useState, useRef } from 'react'

import { useLazyGetListThingsQuery } from '../app/services/api'
import type { UnknownRecord } from '../app/utils/deviceUtils/types'

const DEFAULT_THINGS_PER_REQUEST = 20

export const updateThingsData = (things: UnknownRecord[], prev: UnknownRecord[]): UnknownRecord[] =>
  _reduce(
    things,
    (acc, newThing) => {
      const existingIndex = _findIndex(prev, { id: (newThing as { id?: string }).id })
      if (existingIndex !== -1) {
        acc[existingIndex] = newThing
      } else {
        acc.push(newThing)
      }
      return acc
    },
    prev ? [...prev] : [],
  )

interface UseFetchListThingsPaginatedDataParams {
  query?: string
  fields?: string | UnknownRecord
  thingsPerRequest?: number
  pollingIntervalMs?: number | null
}

export const useFetchListThingsPaginatedData = ({
  query,
  fields,
  thingsPerRequest,
  pollingIntervalMs = null,
}: UseFetchListThingsPaginatedDataParams) => {
  const [lazyListThingsRequest] = useLazyGetListThingsQuery()
  const [thingsData, setThingsData] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const totalThingsPerRequest = thingsPerRequest || DEFAULT_THINGS_PER_REQUEST
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isInitialFetchRef = useRef<boolean>(true)

  useEffect(() => {
    let active = true // Prevent stale state updates
    const fetchData = async (offset: number, allIds = new Set<string>()) => {
      const response = await lazyListThingsRequest({
        query,
        fields,
        limit: totalThingsPerRequest,
        status: 1,
        offset,
      }).unwrap()

      const things = _head(response as UnknownRecord[]) as UnknownRecord[] | undefined

      if (active && things && things.length > 0) {
        _forEach(things, (thing: UnknownRecord) => allIds.add(thing.id as string))
        setThingsData((prev) => updateThingsData(things, prev))

        if (things.length >= totalThingsPerRequest) {
          await fetchData(offset + totalThingsPerRequest, allIds)
        }
        setThingsData((prev) =>
          _filter(prev, (thing: UnknownRecord) => allIds.has(thing.id as string)),
        )
      }
    }

    const startPolling = async () => {
      if (isInitialFetchRef.current) {
        setIsLoading(true)
      }
      setThingsData([])
      await fetchData(0)

      if (active && isInitialFetchRef.current) {
        setIsLoading(false)
        isInitialFetchRef.current = false
      }

      // Only start polling if pollingIntervalMs is present
      if (pollingIntervalMs) {
        intervalIdRef.current = setInterval(async () => {
          await fetchData(0)
        }, pollingIntervalMs)
      }
    }

    startPolling()

    return () => {
      // Cleanup: stop polling and prevent further updates
      active = false
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }
  }, [pollingIntervalMs, query, fields, totalThingsPerRequest])

  return { thingsData, isLoading }
}
