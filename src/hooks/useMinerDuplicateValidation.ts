import _compact from 'lodash/compact'
import _find from 'lodash/filter'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import { useState } from 'react'

import { useLazyGetListThingsQuery } from '../app/services/api'

import type { MinerValidationData } from './hooks.types'

export const useMinerDuplicateValidation = () => {
  const [getListThings] = useLazyGetListThingsQuery()

  const [isDuplicateCheckLoading, setIsDuplicateCheckLoading] = useState(false)
  const [duplicateError, setDuplicateError] = useState(false)

  const checkDuplicate = async (
    selectedEditSocket: { miner?: { id?: string } } | null,
    { macAddress, serialNumber, address, code }: MinerValidationData,
  ): Promise<boolean | undefined> => {
    setIsDuplicateCheckLoading(true)
    const { data } = await getListThings({
      query: JSON.stringify({
        $or: _compact([
          macAddress ? { 'info.macAddress': { $regex: `^${macAddress}$`, $options: 'i' } } : null,
          serialNumber ? { 'info.serialNum': { $in: [serialNumber] } } : null,
          address ? { 'opts.address': { $in: [address] } } : null,
          code ? { code: { $in: [code] } } : null,
        ]),
      }),
    })
    setIsDuplicateCheckLoading(false)
    if (!_isEmpty(data)) {
      const foundDuplicateItem = _find(
        _head(data as unknown[][]),
        (item: unknown) => (item as { id?: string })?.id !== selectedEditSocket?.miner?.id,
      )
      if (!_isEmpty(foundDuplicateItem)) {
        setDuplicateError(true)
        return true
      }
    }
    return false
  }

  return { duplicateError, isDuplicateCheckLoading, checkDuplicate, setDuplicateError }
}
