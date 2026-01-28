import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _toLower from 'lodash/toLower'
import _toUpper from 'lodash/toUpper'

import { useLazyGetListThingsQuery } from '../../../app/services/api'
import { getRackNameFromId } from '../../../app/utils/deviceUtils'

const useCheckInventoryDuplicate = () => {
  const [getListThings, { isLoading }] = useLazyGetListThingsQuery()

  const checkDuplicate = async (
    {
      serialNum,
      rackId,
      macAddress,
      code,
    }: {
      serialNum?: string | string[]
      rackId?: string
      macAddress?: string | string[]
      code?: string | string[]
    },
    returnDuplicates = false,
  ) => {
    const buildFieldQuery = (
      entries: string | string[] | undefined,
    ): { $in: string[] } | string => {
      if (!entries) return ''
      return _isArray(entries) ? { $in: entries } : entries
    }
    const orQueries = []
    if (serialNum) {
      orQueries.push({
        'info.serialNum': buildFieldQuery(serialNum),
      })
    }

    if (macAddress) {
      if (_isArray(macAddress)) {
        orQueries.push({ 'info.macAddress': buildFieldQuery(_map(macAddress, _toLower)) })
        orQueries.push({ 'info.macAddress': buildFieldQuery(_map(macAddress, _toLower)) })
      } else {
        orQueries.push({ 'info.macAddress': _toUpper(macAddress) })
        orQueries.push({ 'info.macAddress': _toLower(macAddress) })
      }
    }
    if (code) {
      orQueries.push({ code: buildFieldQuery(code) })
    }
    interface QueryType {
      $or: Array<Record<string, { $in: string[] } | string | string[] | undefined>>
      type?: string
    }

    const query: QueryType = {
      $or: orQueries as Array<Record<string, { $in: string[] } | string | string[] | undefined>>,
    }

    if (rackId) {
      query.type = getRackNameFromId(rackId)
    }

    const response = await getListThings({
      query: JSON.stringify(query),
      limit: 1,
    }).unwrap()

    let responseArray: unknown[] = []
    if (Array.isArray(response)) {
      responseArray = response
    } else if (Array.isArray((response as { data?: unknown }).data)) {
      responseArray = (response as { data: unknown[] }).data
    }
    const firstItem = _head(responseArray)
    if (returnDuplicates) {
      return firstItem
    }

    return !_isEmpty(firstItem)
  }

  return {
    checkDuplicate,
    isLoading,
  }
}

export default useCheckInventoryDuplicate
