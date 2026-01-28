/**
 * Container name formatting and display functions
 */
import _capitalize from 'lodash/capitalize'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _slice from 'lodash/slice'
import _split from 'lodash/split'
import _toUpper from 'lodash/toUpper'

import {
  getDeviceData,
  getMinerName,
  getPowerSensorName,
  getTemperatureSensorName,
  isAntminer,
  isAvalon,
  isContainer,
  isMiner,
  isPowerMeter,
  isSparePart,
  isTempSensor,
  isWhatsminer,
  separateByHyphenRegExp,
  separateByTwoHyphensRegExp,
} from '../deviceUtils'
import type { Device } from '../deviceUtils/types'

import {
  isAntminerContainer,
  isAvalonContainer,
  isBitdeer,
  isMicroBT,
  isWhatsminerContainer,
} from './containerTypes'

import { getSparePartDetailedName } from '@/Components/Inventory/SpareParts/SpareParts.utils'
import {
  COMPLETE_CONTAINER_TYPE,
  CONTAINER_TYPE_NAME_MAP,
  MAINTENANCE_CONTAINER,
} from '@/constants/containerConstants'
import { MINER_TYPE } from '@/constants/deviceConstants'

interface ContainerPosInfo {
  containerInfo?: {
    container?: string
  }
  pdu?: string
  socket?: string
  pos?: string
}

interface DeviceInfo {
  id: string
  type?: string
  info?: {
    container?: string
    pos?: string
  }
  code?: string
}

export const getContainerName = (container: string | undefined, type?: string): string => {
  if (_isEmpty(container)) {
    return ''
  }
  if (container === MAINTENANCE_CONTAINER) {
    return 'Maintenance'
  }
  const isBitdeerContainer = (container && isBitdeer(container)) || (type && isBitdeer(type))
  const isMicroBTContainer = (container && isMicroBT(container)) || (type && isMicroBT(type))

  if (isBitdeerContainer || isMicroBTContainer) {
    const [name, id] = _slice(container?.match(separateByHyphenRegExp), 1)
    const containerName = `${_capitalize(name)} ${id}`
    if (!type) {
      return containerName
    }
    const [, containerModel] = _slice(type.match(separateByHyphenRegExp), 1)
    if (isMicroBTContainer) {
      let typeKey: string | undefined

      if (_includes(COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA, containerModel)) {
        typeKey = COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA
      } else if (_includes(COMPLETE_CONTAINER_TYPE.MICROBT_WONDERINT, containerModel)) {
        typeKey = COMPLETE_CONTAINER_TYPE.MICROBT_WONDERINT
      }

      if (!typeKey) {
        return `MicroBT ${id}`
      }

      const [name, model] = _split(
        (CONTAINER_TYPE_NAME_MAP as Record<string, string>)[typeKey] || '',
        ' ',
      )
      return `${name} ${id} ${model}`
    }
    // Bitdeer labels
    return `${containerName} ${_toUpper(containerModel)}`
  }
  const [name, model, id] = _slice(container?.match(separateByTwoHyphensRegExp), 1)
  return `${_capitalize(name)} ${_capitalize(model)} ${id}`
}

export const getMinerTypeFromContainerType = (type: string): string | undefined => {
  if (isAvalonContainer(type)) {
    return MINER_TYPE.AVALON
  }
  if (isWhatsminerContainer(type)) {
    return MINER_TYPE.WHATSMINER
  }
  if (isAntminerContainer(type)) {
    return MINER_TYPE.ANTMINER
  }
  return undefined
}

export const getSupportedContainerTypesFromMinerType = (type: string): string[] => {
  if (isAvalon(type)) {
    return [COMPLETE_CONTAINER_TYPE.BITDEER_A1346]
  }
  if (isWhatsminer(type)) {
    return [
      COMPLETE_CONTAINER_TYPE.BITDEER_M56,
      COMPLETE_CONTAINER_TYPE.MICROBT_WONDERINT,
      COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA,
      COMPLETE_CONTAINER_TYPE.BITDEER_M30,
    ]
  }
  if (isAntminer(type)) {
    return [
      COMPLETE_CONTAINER_TYPE.BITDEER_S19XP,
      COMPLETE_CONTAINER_TYPE.BITMAIN_HYDRO,
      COMPLETE_CONTAINER_TYPE.BITMAIN_IMMERSION,
    ]
  }
  return []
}

export const getDeviceContainerPosText = (containerPosInfo: ContainerPosInfo): string => {
  const { containerInfo, pdu, socket, pos } = containerPosInfo || {}
  if ((!pdu || !socket) && !pos) {
    return `${getContainerName(containerInfo?.container)}`
  }
  const destination = pos || `${pdu}_${socket}`
  return `${getContainerName(containerInfo?.container)} ${destination}`
}

export const getDeviceName = (device: DeviceInfo, includeMinerName = true): string => {
  if (!device) return ''
  const { id, type, info } = device

  if (type && isTempSensor(type)) {
    return id
  }

  if (type && info) {
    const namePrefix = includeMinerName ? `${getMinerName(type)} ` : ''
    const posSuffix = info.pos ? `-${info.pos}` : ''

    return `${namePrefix}${getContainerName(info.container, type)}${posSuffix}`
  }

  return id
}

export const getDetailedDeviceName = (type?: string, pos?: string, device?: DeviceInfo): string => {
  type = type ?? _get(device, ['type'])
  pos = pos ?? _get(device, ['info', 'pos'])
  switch (true) {
    case isTempSensor(type!):
      return getTemperatureSensorName(type!, pos!)
    case isPowerMeter(type!):
      return getPowerSensorName(type!, pos)
    case isContainer(type!):
      return getContainerName(device?.info?.container, type)
    case isMiner(type!): {
      const [, deviceStats] = getDeviceData(device as unknown as Device)
      const deviceModel = deviceStats!.type
      return getMinerName(deviceModel)
    }
    case isSparePart(type!):
      return getSparePartDetailedName({ type: type ?? '', code: device?.code ?? '' })
    default:
      return 'Unknown device'
  }
}
