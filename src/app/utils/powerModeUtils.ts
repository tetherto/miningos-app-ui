import { isAntminerContainer, isAvalonContainer, isWhatsminerContainer } from './containerUtils'
import { isAntminer, isAvalon, isWhatsminer } from './deviceUtils'

import { MINER_TYPE } from '@/constants/deviceConstants'

interface Device {
  type?: string
}

export const getDeviceModel = (device: Device | undefined): string => {
  const deviceType = device?.type
  if (!deviceType) return 'other'

  if (isAvalon(deviceType) || isAvalonContainer(deviceType)) {
    return MINER_TYPE.AVALON
  }
  if (isWhatsminer(deviceType) || isWhatsminerContainer(deviceType)) {
    return MINER_TYPE.WHATSMINER
  }
  if (isAntminer(deviceType) || isAntminerContainer(deviceType)) {
    return MINER_TYPE.ANTMINER
  }

  return 'other'
}
