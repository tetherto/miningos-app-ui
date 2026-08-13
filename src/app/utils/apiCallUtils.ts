import _head from 'lodash/head'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface ListThingsParams {
  limit: number
  offset: number
  [key: string]: unknown
}

interface ListThingsResponse<T> {
  data: [T[]]
}

export type GetListThingsFunction<T> = (params: ListThingsParams) => Promise<ListThingsResponse<T>>

/*
Fetch large amount of data in same api calls but break those down into consecutive 
api calls with increasing offset
*/
export const recursiveListThingsApiCall = async <T>(
  getListThings: GetListThingsFunction<T>,
  itemsInOneCall: number,
  offset: number,
  prevData: T[],
  listThingParams: UnknownRecord,
): Promise<T[]> => {
  const { data } = await getListThings({
    limit: itemsInOneCall,
    offset: offset,
    ...listThingParams,
  })
  if (_head(data)!.length >= itemsInOneCall) {
    return await recursiveListThingsApiCall(
      getListThings,
      itemsInOneCall,
      offset + itemsInOneCall,
      [...prevData, ..._head(data)!],
      listThingParams,
    )
  }
  return [...prevData, ..._head(data)!]
}
