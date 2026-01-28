import _every from 'lodash/every'
import _map from 'lodash/map'

import { appendContainerToTag, appendIdToTag } from '../../../app/utils/deviceUtils'
import { CONTAINER_STATUS } from '../../../app/utils/statusUtils'

interface Device {
  id?: string
  info?: {
    container?: string
  }
  [key: string]: unknown
}

interface ContainerData {
  container_specific?: {
    pdu_data?: Array<{
      power_w?: number
      status?: number
    }>
  }
  status?: string
  [key: string]: unknown
}

export const getAllSelectedContainerInfo = (devices: Device[], isTag: boolean) =>
  _map(devices, (device: Device) => {
    const container = device?.info?.container
    return container && isTag ? appendContainerToTag(container) : container || undefined
  }).filter((item): item is string => item !== undefined)

export const getAllSelectedContainerIds = (devices: Device[]) =>
  _map(devices, (device: Device) => {
    const id = device?.id
    return id ? appendIdToTag(id) : undefined
  }).filter((item): item is string => item !== undefined)

export const getContainerActionPayload = (
  isBatch: boolean,
  selectedDevices: Device[],
  data: Device,
) => {
  if (isBatch) {
    return {
      idTags: getAllSelectedContainerIds(selectedDevices),
      containerInfo: getAllSelectedContainerInfo(selectedDevices, false),
    }
  }
  const id = data?.id
  const container = data?.info?.container
  return {
    idTags: id ? [appendIdToTag(id)] : [],
    containerInfo: container ? [container] : [],
  }
}

export const getContainerState = (containerData: ContainerData) => {
  const { pdu_data } = containerData?.container_specific || {}

  const { status } = containerData || {}

  const containerState = {
    isStarted: status === CONTAINER_STATUS.RUNNING,
    isAllSocketsOn: _every(
      pdu_data,
      ({ power_w, status }: { power_w?: number; status?: number }) =>
        status === 1 || (power_w ?? 0) > 0,
    ),
  }

  return containerState
}
