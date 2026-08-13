/**
 * Device type checking functions
 */
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _startsWith from 'lodash/startsWith'
import _toLower from 'lodash/toLower'

import { MinerStatuses } from '../statusUtils'

import { getConfig, getStats } from './deviceData'
import type { Device } from './types'

import { MINER_TYPE } from '@/constants/deviceConstants'

export const isMiner = (type: string): boolean => _startsWith(type, 'miner-')

export const isPowerMeter = (type: string): boolean => _startsWith(type, 'powermeter-')

export const isTempSensor = (type: string): boolean => _startsWith(type, 'sensor-temp-')

export const isCabinet = (type: string): boolean => _startsWith(type, 'cabinet')

export const isElectricity = (type: string): boolean => _startsWith(type, 'electricity-')

export const isContainer = (type: string): boolean => _startsWith(type, 'container-')

export const isSparePart = (type: string): boolean => _startsWith(type, 'inventory-miner_part-')

export const isAvalon = (type: string): boolean =>
  isMiner(type) && _includes(type, MINER_TYPE.AVALON)

export const isWhatsminer = (type: string): boolean =>
  isMiner(type) && _includes(type, MINER_TYPE.WHATSMINER)

export const isAntminer = (type: string): boolean =>
  isMiner(type) && _includes(type, MINER_TYPE.ANTMINER)

export const isS21SeriesAntminer = (type: string): boolean =>
  isMiner(type) && _includes(type, MINER_TYPE.ANTMINER) && _includes(type, 's21')

export const isMinerOffline = (device: Device): boolean => {
  const stats = getStats(device)
  const isEmptyStats = _isEmpty(stats)
  const isEmptyConfig = _isEmpty(getConfig(device))
  const isOffline = stats?.status === MinerStatuses.OFFLINE
  return (isEmptyStats && isEmptyConfig) || isOffline
}

export const isTransformerPowermeter = (type: string, pos: string): boolean => {
  const regex = /^tr\d+$/
  return isPowerMeter(type) && regex.test(pos)
}

export const isLVCabinet = (device: Device): boolean => _includes(device?.id, 'lv')

export const isTransformerCabinet = (device: Device): boolean => _includes(device?.id, 'tr')

export const getIsTransformerTempSensor = (devicePos: string): boolean =>
  _startsWith(devicePos, 'tr')

export const isContainerTag = (tag: string): boolean => _includes(tag, 'container-')

export const checkIsIdTag = (tag: string): boolean =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(tag)

export const getDeviceModel = (selectedDevice: Device): string => {
  const type = selectedDevice?.type
  if (isContainer(type) && _includes(_toLower(type), 'bd-d40')) {
    return 'container-bd-d40'
  }
  return type
}
