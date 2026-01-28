/**
 * Container type checking functions
 */
import _includes from 'lodash/includes'
import _toLower from 'lodash/toLower'

import { isContainer } from '../deviceUtils'

import {
  CONTAINER_MODEL,
  CONTAINER_TYPE,
  COMPLETE_CONTAINER_TYPE,
} from '@/constants/containerConstants'
import { CONTAINERS_MINER_TYPE } from '@/constants/deviceConstants'

export const isA1346 = (type: string): boolean => type === COMPLETE_CONTAINER_TYPE.BITDEER_A1346

export const isM30 = (type: string): boolean => type === COMPLETE_CONTAINER_TYPE.BITDEER_M30

export const isS19XP = (type: string): boolean => type === COMPLETE_CONTAINER_TYPE.BITDEER_S19XP

export const isBitdeer = (type: string): boolean =>
  _includes(_toLower(type), CONTAINER_TYPE.BITDEER) ||
  _includes(_toLower(type), CONTAINER_MODEL.BITDEER)

export const isAntspaceHydro = (type: string): boolean =>
  _includes(_toLower(type), CONTAINER_TYPE.ANTSPACE_HYDRO) ||
  _includes(_toLower(type), CONTAINER_MODEL.ANTSPACE_HYDRO) ||
  _includes(_toLower(type), CONTAINER_MODEL.BITMAIN_HYDRO)

export const isMicroBT = (type: string): boolean =>
  _includes(_toLower(type), CONTAINER_TYPE.MICROBT) ||
  _includes(_toLower(type), CONTAINER_MODEL.MICROBT)

export const isMicroBTKehua = (type: string): boolean =>
  _includes(_toLower(type), COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA)

export const isAntspaceImmersion = (type: string): boolean =>
  _includes(_toLower(type), CONTAINER_TYPE.ANTSPACE_IMMERSION) ||
  _includes(_toLower(type), CONTAINER_MODEL.ANTSPACE_IMMERSION) ||
  _includes(_toLower(type), CONTAINER_MODEL.BITMAIN_IMMERSION) ||
  _includes(_toLower(type), CONTAINER_MODEL.BITMAIN_IMM)

export const isBitmainImmersion = (type: string): boolean =>
  _includes(_toLower(type), CONTAINER_MODEL.BITMAIN_IMMERSION) ||
  _includes(_toLower(type), CONTAINER_MODEL.BITMAIN_IMM) ||
  _includes(_toLower(type), CONTAINER_MODEL.IMMERSION_CONTAINER)

export const isAvalonContainer = (type: string): boolean =>
  isContainer(type) && _includes(type, CONTAINERS_MINER_TYPE.A1346)

export const isWhatsminerContainer = (type: string): boolean =>
  isContainer(type) &&
  (_includes(type, CONTAINERS_MINER_TYPE.M56) ||
    _includes(type, CONTAINERS_MINER_TYPE.M30) ||
    isMicroBT(type))

export const isAntminerContainer = (type: string): boolean =>
  isContainer(type) &&
  (_includes(type, CONTAINERS_MINER_TYPE.S19XP) ||
    isAntspaceImmersion(type) ||
    isAntspaceHydro(type))

export const isContainerControlNotsupported = (container: string): boolean =>
  isAntspaceHydro(container) || isAntspaceImmersion(container)

interface ContainerSnap {
  stats?: {
    status?: string
  }
}

export const isContainerOffline = (snap: ContainerSnap): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CONTAINER_STATUS } = require('../statusUtils')
  return snap?.stats?.status === CONTAINER_STATUS.OFFLINE
}
