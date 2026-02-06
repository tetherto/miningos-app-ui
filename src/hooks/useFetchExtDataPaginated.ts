import _gt from 'lodash/gt'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _size from 'lodash/size'
import _sortBy from 'lodash/sortBy'
import _toNumber from 'lodash/toNumber'
import _uniqBy from 'lodash/uniqBy'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useLazyGetExtDataQuery } from '../app/services/api'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const DEFAULT_PAGE_SIZE_DAYS = 7
const DEFAULT_MAX_HISTORY_DAYS = 90
const DEFAULT_INITIAL_CHUNK_DAYS = 1

interface WithTimestamp {
  ts: number | string
}

interface UseFetchExtDataPaginatedParams {
  type: string
  skip?: boolean
  queryKey: string
  pageSizeDays?: number
  initialChunkDays?: number
  maxHistoryDays?: number
}

interface UseFetchExtDataPaginatedResult<Item> {
  error: unknown
  isError: boolean
  isLoading: boolean
  isInitialLoading: boolean
  isFetchingMore: boolean
  refetch: VoidFunction
  data: Item[] | undefined
}

const deduplicateAndSort = <Item extends WithTimestamp>(items: Item[]): Item[] =>
  _sortBy(
    _uniqBy(items, (item) => _toNumber(item.ts)),
    (item) => _toNumber(item.ts),
  )

export const useFetchExtDataPaginated = <Item extends WithTimestamp>({
  type,
  queryKey,
  pageSizeDays = DEFAULT_PAGE_SIZE_DAYS,
  initialChunkDays = DEFAULT_INITIAL_CHUNK_DAYS,
  maxHistoryDays = DEFAULT_MAX_HISTORY_DAYS,
  skip = false,
}: UseFetchExtDataPaginatedParams): UseFetchExtDataPaginatedResult<Item> => {
  const [lazyGetExtData] = useLazyGetExtDataQuery()

  const [data, setData] = useState<Item[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(!skip)
  const [isInitialLoading, setIsInitialLoading] = useState(!skip)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const isFetchingRef = useRef(false)
  const hasFetchedRef = useRef(false)
  const fetchIdRef = useRef(0)

  const fetchAllPages = useCallback(async () => {
    if (isFetchingRef.current || skip) return

    const currentFetchId = ++fetchIdRef.current

    isFetchingRef.current = true
    setIsLoading(true)
    setIsInitialLoading(true)
    setIsFetchingMore(false)
    setIsError(false)
    setError(null)

    const allData: Item[] = []
    const now = Date.now()
    const oldestAllowed = now - maxHistoryDays * MS_PER_DAY
    let currentEnd = now
    let hasMoreData = true
    let isFirstPage = true

    try {
      while (hasMoreData) {
        if (fetchIdRef.current !== currentFetchId) {
          return
        }

        // Stop if we've reached the max history limit
        if (currentEnd <= oldestAllowed) {
          hasMoreData = false
          break
        }

        // Use smaller initial chunk for fast first render, then larger chunks for background loading
        const chunkSize = isFirstPage ? initialChunkDays : pageSizeDays
        let currentStart = currentEnd - chunkSize * MS_PER_DAY

        // Clamp to oldest allowed timestamp
        if (currentStart < oldestAllowed) {
          currentStart = oldestAllowed
        }

        const response = await lazyGetExtData({
          type,
          query: JSON.stringify({
            key: queryKey,
            start: currentStart,
            end: currentEnd,
            fields: {
              ts: 1,
              'stats.poolType': 1,
              'stats.username': 1,
              'stats.timestamp': 1,
              'stats.balance': 1,
              'stats.unsettled': 1,
              'stats.revenue_24h': 1,
              'stats.estimated_today_income': 1,
              'stats.hashrate': 1,
              'stats.hashrate_1h': 1,
              'stats.hashrate_24h': 1,
              'stats.hashrate_stale_1h': 1,
              'stats.hashrate_stale_24h': 1,
              'stats.worker_count': 1,
              'stats.active_workers_count': 1,
            },
          }),
        }).unwrap()

        if (fetchIdRef.current !== currentFetchId) {
          return
        }

        const pageData = _head(response as Item[][]) as Item[] | undefined

        if (!pageData || _isEmpty(pageData)) {
          hasMoreData = false
        } else {
          allData.unshift(...pageData)

          const currentDeduped = deduplicateAndSort(allData)
          setData(_gt(_size(currentDeduped), 0) ? currentDeduped : undefined)

          if (isFirstPage) {
            setIsLoading(false)
            setIsInitialLoading(false)
            setIsFetchingMore(true)
            isFirstPage = false
          }

          currentEnd = currentStart
        }
      }

      hasFetchedRef.current = true
    } catch (err) {
      if (fetchIdRef.current === currentFetchId) {
        setIsError(true)
        setError(err)

        if (_isEmpty(allData)) {
          setData(undefined)
        }
      }
    } finally {
      if (fetchIdRef.current === currentFetchId) {
        setIsLoading(false)
        setIsInitialLoading(false)
        setIsFetchingMore(false)
        isFetchingRef.current = false
      }
    }
  }, [lazyGetExtData, type, queryKey, pageSizeDays, initialChunkDays, maxHistoryDays, skip])

  useEffect(() => {
    if (skip) {
      setData(undefined)
      setIsLoading(false)
      setIsInitialLoading(false)
      setIsFetchingMore(false)
      hasFetchedRef.current = false
      return
    }

    if (!hasFetchedRef.current && !isFetchingRef.current) {
      fetchAllPages()
    }
  }, [fetchAllPages, skip])

  const refetch = useCallback(() => {
    hasFetchedRef.current = false
    setData(undefined)
    fetchAllPages()
  }, [fetchAllPages])

  return {
    data,
    isLoading,
    isInitialLoading,
    isFetchingMore,
    isError,
    error,
    refetch,
  }
}
