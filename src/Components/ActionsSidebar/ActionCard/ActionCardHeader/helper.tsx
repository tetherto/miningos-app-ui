import {
  head as _head,
  isArray as _isArray,
  includes as _includes,
  isUndefined as _isUndefined,
} from 'lodash'

import { getContainerName } from '../../../../app/utils/containerUtils'
import { formatMacAddress } from '../../../../app/utils/format'
import { MAINTENANCE_CONTAINER } from '../../../../constants/containerConstants'

interface DeviceInfo {
  container?: string
  pos?: string
  serialNum?: string
  macAddress?: string
}

interface DeviceParam {
  id?: string
  info?: DeviceInfo
  code?: string
}

interface PreviousDevice {
  container?: string
  pos?: string
}

export const getUpdateThingRightText = (
  params: DeviceParam[],
  actionName: string,
  previousDevice?: PreviousDevice,
) => {
  const firstParam = _head(params)
  const {
    id: minerId,
    info: { container, pos, serialNum, macAddress } = {},
    code: shortCode,
  } = firstParam || {}

  const previousMinerText = `from ${getContainerName(previousDevice?.container)} ${
    !_includes(previousDevice?.pos, 'undefined') ? previousDevice?.pos : ''
  }`

  if (
    container === MAINTENANCE_CONTAINER ||
    (_isUndefined(pos) && container !== MAINTENANCE_CONTAINER)
  ) {
    return `${actionName} miner:
      Code: ${shortCode},
      ${serialNum ? 'SN: ' + serialNum : ''},
      ${macAddress ? 'MAC: ' + formatMacAddress(macAddress) : ''}`
  }

  return `${actionName} miner: ${shortCode ?? minerId} ${previousMinerText} to ${getContainerName(
    container,
  )} ${pos}`
}

export const determineActionName = (
  container: string | undefined,
  pos: string | undefined,
  posHistory: unknown[],
) => {
  let actionName = 'Change position of'

  if (container === MAINTENANCE_CONTAINER) {
    actionName = 'Add to maintenance'
  } else if (_isUndefined(pos) && container !== MAINTENANCE_CONTAINER) {
    actionName = 'Change miner info'
  }

  const previousDevice = _head(posHistory) as PreviousDevice | undefined
  if (_isArray(posHistory) && previousDevice?.container === MAINTENANCE_CONTAINER) {
    actionName = 'Back from maintenance'
  }

  return { actionName, previousDevice }
}
