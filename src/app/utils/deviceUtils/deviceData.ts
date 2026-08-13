/**
 * Device data accessor functions
 */
import type { Device, DeviceDataResult, DeviceLast, DeviceSnap } from './types'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const separateByHyphenRegExp = /([^_]+)-([^_]+)/
export const separateByTwoHyphensRegExp = /([^_]+)-([^_]+)-([^_]+)/

export const getLast = (data: Device): DeviceLast => data?.last || {}

export const getSnap = (data: Device): DeviceSnap => getLast(data)?.snap || {}

export const getStats = (data: Device): UnknownRecord => getSnap(data)?.stats || {}

export const getConfig = (data: Device): UnknownRecord => getSnap(data)?.config || {}

export const getContainerSpecificStats = (data?: Device): UnknownRecord => {
  if (!data) return {}

  return (getStats(data)?.container_specific as UnknownRecord) || {}
}

export const getContainerSpecificConfig = (data: Device): UnknownRecord =>
  (getConfig(data)?.container_specific as UnknownRecord) || {}

export const getDeviceData = (device: Device | null | undefined): DeviceDataResult => {
  if (!device) return ['Device Not Found', undefined]
  const { id, type, tags, rack, last, username, info, containerId, address } = device

  if (!last)
    return [
      undefined,
      {
        id,
        type,
        tags,
        rack,
        username,
        info,
        containerId,
        address,
        snap: { stats: {}, config: {} },
        err: 'Last Device info not found',
      },
    ]
  const { err, snap, alerts } = last
  return [
    err,
    {
      id,
      type,
      tags,
      rack,
      snap: snap ?? { stats: {}, config: {} },
      alerts,
      username,
      info,
      containerId,
      address,
      err,
    },
  ]
}
