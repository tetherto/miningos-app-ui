import _forEach from 'lodash/forEach'
import _head from 'lodash/head'

import { useGetListThingsQuery } from '../app/services/api'
import { isContainer, isMiner } from '../app/utils/deviceUtils'
import type { UnknownRecord } from '../app/utils/deviceUtils/types'

import type { AvailableDevices } from '@/app/utils/actionUtils'

export const useGetAvailableDevices = (): AvailableDevices => {
  const { data: availableDevicesRaw } = useGetListThingsQuery({
    query: JSON.stringify({
      tags: { $in: ['t-miner', 't-container'] },
    }),
    fields: JSON.stringify({ type: 1 }),
    limit: 1,
  })
  const availableDevicesResponse = _head(availableDevicesRaw as unknown[]) as
    | UnknownRecord
    | undefined

  const availableDevices = {
    availableContainerTypes: [] as string[],
    availableMinerTypes: [] as string[],
  }

  _forEach(availableDevicesResponse, (device: unknown) => {
    const deviceRecord = device as UnknownRecord
    const type = deviceRecord?.type as string | undefined
    if (type && isContainer(type)) {
      availableDevices.availableContainerTypes.push(type)
    }
    if (type && isMiner(type)) {
      availableDevices.availableMinerTypes.push(type)
    }
  })

  return availableDevices
}
