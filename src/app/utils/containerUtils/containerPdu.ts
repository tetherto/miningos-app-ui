/**
 * Container PDU-related functions
 */
import _find from 'lodash/find'
import _flatMap from 'lodash/flatMap'
import _forEach from 'lodash/forEach'
import _includes from 'lodash/includes'
import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _slice from 'lodash/slice'
import _sumBy from 'lodash/sumBy'

import { isMiner } from '../deviceUtils'

import {
  isAntspaceHydro,
  isAntspaceImmersion,
  isBitdeer,
  isBitmainImmersion,
  isMicroBT,
} from './containerTypes'
import type { SocketSelection } from './types'

export interface PduData {
  pdu: string
  power_w?: number | string
  current_a?: number | string
  sockets: Socket[]
  offline?: boolean
}

interface Socket {
  socket: string
  enabled: boolean
  cooling?: boolean
}

interface Device {
  type: string
  info?: {
    container?: string
    pos?: string
  }
}

interface ContainerData {
  type: string
  last?: {
    snap?: {
      stats?: {
        container_specific?: {
          pdu_data?: PduData[]
        }
      }
    }
  }
}

export interface PduSocket {
  socket: string
  enabled: boolean
}

import { COMPLETE_CONTAINER_TYPE, CONTAINER_SETTINGS_MODEL } from '@/constants/containerConstants'
import {
  ANTSPACE_IMMERSION_PDU_DATA,
  ANTSPACE_PDU_DATA,
  BITDEER_A1346_PDU_DATA,
  BITDEER_M30_PDU_DATA,
  BITDEER_M56_PDU_DATA,
  BITDEER_RACKS_WITH_FAKE_SOCKET,
  BITDEER_S19XP_PDU_DATA,
  MICROBT_PDU_DATA,
} from '@/Views/Container/Tabs/PduTab/pduUtils'

export const getPduData = (last: ContainerData['last']): PduData[] | undefined =>
  last?.snap?.stats?.container_specific?.pdu_data

export const getMockedPduData = (type: string): PduData[] => {
  switch (type) {
    case COMPLETE_CONTAINER_TYPE.BITDEER_M30:
      return BITDEER_M30_PDU_DATA
    case COMPLETE_CONTAINER_TYPE.BITDEER_A1346:
      return BITDEER_A1346_PDU_DATA
    case COMPLETE_CONTAINER_TYPE.BITDEER_M56:
      return BITDEER_M56_PDU_DATA
    case COMPLETE_CONTAINER_TYPE.BITDEER_S19XP:
      return BITDEER_S19XP_PDU_DATA
    default:
      return MICROBT_PDU_DATA
  }
}

export const getIndexes = (pos: string): string[] => _slice(pos.match(/([^_]+)_([^_]+)/), 1)

export const getBitdeerIndexes = (pos: string): string[] => _slice(pos.match(/([^_]+)_([^_]+)/), 1)

export const getAntspaceHydroIndexes = (pos: string): string[] =>
  _slice(pos.match(/([^_]+)_([^_]+)_([^_]+)/), 1)

export const getAntspaceImmersionIndexes = (pos: string): string[] =>
  _slice(pos.match(/([^_]+)_([^_]+)/), 1)

export const getMicroBTIndexes = (pos: string): string[] => _slice(pos.match(/([^_]+)_([^_]+)/), 1)

export const getConnectedMinerForSocket = (
  devices: Device[],
  pduIndex: string,
  socketIndex: string,
): Device | undefined =>
  _find(devices, (device: Device) => {
    if (!isMiner(device.type)) {
      return false
    }
    if (
      device?.info?.container &&
      isAntspaceHydro(device.info.container) &&
      !_isNil(device?.info?.pos)
    ) {
      const [rack, pdu, socket] = getAntspaceHydroIndexes(device.info.pos)
      return rack + '_' + pdu === pduIndex && socket === socketIndex
    }
    if (device?.info?.container && isMicroBT(device.info.container) && !_isNil(device?.info?.pos)) {
      const [pdu, socket] = getMicroBTIndexes(device.info.pos)
      return pdu === pduIndex && socket === socketIndex
    }

    if (!_isNil(device?.info?.pos)) {
      const [pdu, socket] = getBitdeerIndexes(device.info.pos)
      return pdu === pduIndex && socket === socketIndex
    }

    return false
  })

export const getNumberSelected = (
  selectedSockets: Record<string, { sockets: PduSocket[] }>,
): SocketSelection => {
  const containers = _keys(selectedSockets)
  const socketsLength = _sumBy(containers, (container: string) =>
    _size(selectedSockets[container]?.sockets ?? []),
  )
  return { nContainers: containers.length, nSockets: socketsLength }
}

interface PduItem {
  sockets: PduSocket[]
  pdu: string
  [key: string]: unknown
}

const enhancedPduData = (pdus: PduData[], type: string): PduData[] =>
  _map(pdus, (pdu: unknown) => {
    const pduItem = pdu as PduItem
    const socketsList: PduSocket[] = [...pduItem.sockets]
    if (_includes(BITDEER_RACKS_WITH_FAKE_SOCKET, pduItem.pdu)) {
      const requiredSocketsByType: Record<string, string[]> = {
        [COMPLETE_CONTAINER_TYPE.BITDEER_A1346]: ['a1'],
        [COMPLETE_CONTAINER_TYPE.BITDEER_S19XP]: ['a1'],
      }
      const requiredSockets = ['a1']
      if (requiredSocketsByType[type]) {
        _forEach(requiredSockets, (requiredSocket: string) => {
          if (
            !_includes(
              _map(socketsList, (s: PduSocket) => s.socket),
              requiredSocket,
            )
          ) {
            socketsList.push({ socket: requiredSocket, enabled: false })
          }
        })
      }
    }

    return {
      ...pduItem,
      sockets: socketsList,
    } as PduData
  })

export const getContainerPduData = (
  type: string,
  last: ContainerData['last'],
): PduData[] | undefined => {
  if (isBitdeer(type) || isMicroBT(type)) {
    const pduData = getPduData(last)
    const mockedLayout = getMockedPduData(type)
    const mergedPduLayout = _map(mockedLayout, (mockedPdu: PduData) => {
      const pdu = _find(pduData, { pdu: mockedPdu.pdu })
      const pduSockets = !pdu || pdu.offline ? mockedPdu.sockets : pdu.sockets
      return {
        pdu: mockedPdu.pdu,
        power_w: pdu?.power_w || '-',
        current_a: pdu?.current_a || '-',
        sockets: pduSockets,
      }
    })
    return enhancedPduData(mergedPduLayout, type)
  }
  if (isAntspaceHydro(type)) {
    return ANTSPACE_PDU_DATA
  }
  if (isAntspaceImmersion(type)) {
    return ANTSPACE_IMMERSION_PDU_DATA
  }
  return undefined
}

export const getTotalSockets = (pduData: PduData[]): number =>
  _sumBy(pduData, (pdu: unknown) => _size((pdu as { sockets?: unknown[] }).sockets))

export const getTotalContainerSockets = (data: ContainerData): number => {
  const pduData = getContainerPduData(data?.type, data?.last)
  return getTotalSockets(pduData || [])
}

export const getContainerMinersPosition = (type: string): string[] => {
  let minerPosition: PduData[] = []
  if (isBitdeer(type) || isMicroBT(type)) {
    minerPosition = getMockedPduData(type)
  }
  if (isAntspaceHydro(type)) {
    minerPosition = ANTSPACE_PDU_DATA
  }
  if (isAntspaceImmersion(type)) {
    minerPosition = ANTSPACE_IMMERSION_PDU_DATA
  }
  return _flatMap(minerPosition, ({ pdu, sockets }) =>
    _map(sockets, ({ socket }) => `${pdu}_${socket}`),
  )
}

export const getContainerSettingsModel = (containerType: string) => {
  if (!containerType) return null

  if (isBitdeer(containerType)) {
    return CONTAINER_SETTINGS_MODEL.BITDEER
  }
  if (isMicroBT(containerType)) {
    return CONTAINER_SETTINGS_MODEL.MICROBT
  }
  if (isAntspaceHydro(containerType)) {
    return CONTAINER_SETTINGS_MODEL.HYDRO
  }
  if (isBitmainImmersion(containerType) || isAntspaceImmersion(containerType)) {
    return CONTAINER_SETTINGS_MODEL.IMMERSION
  }

  return null
}
