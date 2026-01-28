import type { DevicePayload, DeviceTagPayload } from '../ListView.types'

import { getContainerName } from '@/app/utils/containerUtils'
import type { Device } from '@/app/utils/deviceUtils/types'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'

/**
 * Converts a Device to a DeviceTagPayload for device tag selection
 */
export const deviceToDeviceTagPayload = (device: Device): DeviceTagPayload => ({
  id: device.id,
  info: {
    pos: device.info?.pos as string | undefined,
    container: getContainerName(device.info?.container ?? MAINTENANCE_CONTAINER, device.type),
    ...(device.info || {}),
  },
})

/**
 * Converts a Device to a DevicePayload for device selection
 */
export const deviceToDevicePayload = (device: Device): DevicePayload => {
  const { id, ...rest } = device
  return {
    id,
    ...rest,
  }
}
