import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import { useEffect, useState } from 'react'

import { useLazyGetListThingsQuery } from '@/app/services/api'

const DEFAULT_THINGS_PER_PAGE = 20

export type GetListThingsPaginatedQueryFnParams = {
  limit: number
  offset: number
  status: 1
} & Omit<GetListThingsPaginatedParams, 'queryFn'>

export type GetListThingsPaginatedParams = {
  queryFn: (params: GetListThingsPaginatedQueryFnParams) => Promise<unknown[][]>
  query: string
  fields: string
  perPage?: number
  overwriteCache?: boolean
}

export const getListThingsPaginated = async ({
  queryFn,
  query,
  fields,
  perPage = DEFAULT_THINGS_PER_PAGE,
  overwriteCache = false,
}: GetListThingsPaginatedParams) => {
  const getPage = async ({ page }: { page: number }) => {
    const offset = (page - 1) * perPage

    const response = await queryFn({
      overwriteCache,
      query,
      fields,
      offset,
      limit: perPage,
      status: 1,
    })

    return _head(response)
  }

  let page = 1
  const thingsMap = new Map<string, unknown>()
  while (true) {
    const thingsInPage = await getPage({ page })
    if (_isEmpty(thingsInPage)) {
      break
    }

    _forEach(thingsInPage as { id: string; [key: string]: unknown }[], (thing) => {
      // Map preserves order of the original key if set is called again using the same key
      thingsMap.set(thing.id, thing)
    })
    page++
  }

  return [...thingsMap.values()]
}

export type UseGetListThingsPaginatedParams = Omit<GetListThingsPaginatedParams, 'queryFn'>

export const useGetListThingsPaginated = ({
  query,
  fields,
  perPage = DEFAULT_THINGS_PER_PAGE,
  overwriteCache = false,
}: UseGetListThingsPaginatedParams) => {
  const [getListThings, { isLoading, isFetching }] = useLazyGetListThingsQuery()

  const [things, setThings] = useState<unknown[]>([])

  useEffect(() => {
    fetchThings()
  }, [query, fields, perPage, overwriteCache])

  const fetchThings = async () => {
    const things = await getListThingsPaginated({
      queryFn: async (params: GetListThingsPaginatedQueryFnParams) => {
        const response = await getListThings(params).unwrap()
        return response as unknown[][]
      },
      query,
      fields,
      perPage,
      overwriteCache,
    })

    setThings(things)
  }

  useEffect(() => {
    fetchThings()
  }, [])

  return {
    things,
    isLoading,
    isFetching,
    refetch: fetchThings,
  }
}
