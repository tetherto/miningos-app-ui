import _split from 'lodash/split'

import type { Device } from '@/app/utils/deviceUtils/types'
import { COMPLETE_CONTAINER_TYPE } from '@/constants/containerConstants'

interface Socket {
  socket: string
  enabled: boolean
}

interface PduUnit {
  pdu: string
  sockets: Socket[]
}

const sockets1to7: Socket[] = [
  { socket: '1', enabled: true },
  { socket: '2', enabled: true },
  { socket: '3', enabled: true },
  { socket: '4', enabled: true },
  { socket: '5', enabled: true },
  { socket: '6', enabled: true },
  { socket: '7', enabled: true },
]

export const ANTSPACE_PDU_DATA: PduUnit[] = [
  {
    pdu: 'a_a',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_b',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_c',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_d',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_e',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_f',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_g',
    sockets: sockets1to7,
  },

  {
    pdu: 'a_h',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_i',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_j',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_k',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_l',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_m',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_n',
    sockets: sockets1to7,
  },
  {
    pdu: 'a_o',
    sockets: sockets1to7,
  },

  {
    pdu: 'b_a',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_b',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_c',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_d',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_e',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_f',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_g',
    sockets: sockets1to7,
  },

  {
    pdu: 'b_h',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_i',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_j',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_k',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_l',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_m',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_n',
    sockets: sockets1to7,
  },
  {
    pdu: 'b_o',
    sockets: sockets1to7,
  },
]

const sockets1to9 = [
  { socket: '1', enabled: true },
  { socket: '2', enabled: true },
  { socket: '3', enabled: true },
  { socket: '4', enabled: true },
  { socket: '5', enabled: true },
  { socket: '6', enabled: true },
  { socket: '7', enabled: true },
  { socket: '8', enabled: true },
  { socket: '9', enabled: true },
]

const sockets9to1 = [
  { socket: '9', enabled: true },
  { socket: '8', enabled: true },
  { socket: '7', enabled: true },
  { socket: '6', enabled: true },
  { socket: '5', enabled: true },
  { socket: '4', enabled: true },
  { socket: '3', enabled: true },
  { socket: '2', enabled: true },
  { socket: '1', enabled: true },
]

const sockets1to6 = [
  { socket: '1', enabled: true },
  { socket: '2', enabled: true },
  { socket: '3', enabled: true },
  { socket: '4', enabled: true },
  { socket: '5', enabled: true },
  { socket: '6', enabled: true },
]

export const ANTSPACE_IMMERSION_PDU_DATA: PduUnit[] = [
  {
    pdu: 'd1',
    sockets: sockets1to9,
  },
  {
    pdu: 'd2',
    sockets: sockets1to9,
  },
  {
    pdu: 'd3',
    sockets: sockets1to9,
  },
  {
    pdu: 'd4',
    sockets: sockets1to9,
  },
  {
    pdu: 'd5',
    sockets: sockets1to9,
  },
  {
    pdu: 'd6',
    sockets: sockets1to9,
  },
  {
    pdu: 'd7',
    sockets: sockets1to9,
  },

  {
    pdu: 'b1',
    sockets: sockets9to1,
  },
  {
    pdu: 'b2',
    sockets: sockets9to1,
  },
  {
    pdu: 'b3',
    sockets: sockets9to1,
  },
  {
    pdu: 'b4',
    sockets: sockets9to1,
  },
  {
    pdu: 'b5',
    sockets: sockets9to1,
  },
  {
    pdu: 'b6',
    sockets: sockets9to1,
  },
  {
    pdu: 'b7',
    sockets: sockets9to1,
  },

  {
    pdu: 'c1',
    sockets: sockets1to6,
  },
  {
    pdu: 'c2',
    sockets: sockets1to6,
  },
  {
    pdu: 'c3',
    sockets: sockets1to6,
  },
  {
    pdu: 'c4',
    sockets: sockets1to6,
  },
  {
    pdu: 'c5',
    sockets: sockets1to6,
  },
  {
    pdu: 'c6',
    sockets: sockets1to6,
  },
  {
    pdu: 'c7',
    sockets: sockets1to6,
  },

  {
    pdu: 'a1',
    sockets: sockets9to1,
  },
  {
    pdu: 'a2',
    sockets: sockets9to1,
  },
  {
    pdu: 'a3',
    sockets: sockets9to1,
  },
  {
    pdu: 'a4',
    sockets: sockets9to1,
  },
  {
    pdu: 'a5',
    sockets: sockets9to1,
  },
  {
    pdu: 'a6',
    sockets: sockets9to1,
  },
  {
    pdu: 'a7',
    sockets: sockets9to1,
  },
]

// BITDEER PDU DATA
const socket_a1 = { socket: 'a1', enabled: false }
const sockets_a2to5 = [
  { socket: 'a2', enabled: false },
  { socket: 'a3', enabled: false },
  { socket: 'a4', enabled: false },
  { socket: 'a5', enabled: false },
]
const socket_a6 = { socket: 'a6', enabled: false }
const sockets_a1to5 = [socket_a1, ...sockets_a2to5]
const sockets_a1to6 = [...sockets_a1to5, socket_a6]

const sockets_b1to4 = [
  { socket: 'b1', enabled: false },
  { socket: 'b2', enabled: false },
  { socket: 'b3', enabled: false },
  { socket: 'b4', enabled: false },
]
const socket_b5 = { socket: 'b5', enabled: false }
const sockets_b1to5 = [...sockets_b1to4, socket_b5]

const sockets_c1to4 = [
  { socket: 'c1', enabled: false },
  { socket: 'c2', enabled: false },
  { socket: 'c3', enabled: false },
  { socket: 'c4', enabled: false },
]
const socket_c5 = { socket: 'c5', enabled: false }
const sockets_c1to5 = [...sockets_c1to4, socket_c5]

export const BITDEER_M30_PDU_DATA: PduUnit[] = [
  { pdu: '1-1', sockets: [...sockets_a1to6, ...sockets_b1to5, ...sockets_c1to5] },
  { pdu: '1-2', sockets: [...sockets_a1to6, ...sockets_b1to5, ...sockets_c1to5] },
  { pdu: '1-3', sockets: [...sockets_a1to6, ...sockets_b1to5, ...sockets_c1to4] },
  { pdu: '1-4', sockets: [...sockets_a1to6, ...sockets_b1to5, ...sockets_c1to4] },
  { pdu: '2-1', sockets: [...sockets_a1to6, ...sockets_b1to5, ...sockets_c1to5] },
  { pdu: '2-2', sockets: [...sockets_a1to6, ...sockets_b1to5, ...sockets_c1to5] },
  { pdu: '2-3', sockets: [...sockets_a1to6, ...sockets_b1to5, ...sockets_c1to4] },
  { pdu: '2-4', sockets: [...sockets_a1to6, ...sockets_b1to5, ...sockets_c1to4] },
]

export const BITDEER_A1346_PDU_DATA: PduUnit[] = [
  { pdu: '1-1', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '1-2', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '1-3', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '1-4', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '2-1', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '2-2', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '2-3', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '2-4', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
]
const sockets1to14 = [
  { socket: '1', enabled: false },
  { socket: '2', enabled: false },
  { socket: '3', enabled: false },
  { socket: '4', enabled: false },
  { socket: '5', enabled: false },
  { socket: '6', enabled: false },
  { socket: '7', enabled: false },
  { socket: '8', enabled: false },
  { socket: '9', enabled: false },
  { socket: '10', enabled: false },
  { socket: '11', enabled: false },
  { socket: '12', enabled: false },
  { socket: '13', enabled: false },
  { socket: '14', enabled: false },
]

export const BITDEER_M56_PDU_DATA: PduUnit[] = [
  { pdu: '1-1', sockets: sockets1to14 },
  { pdu: '1-2', sockets: sockets1to14 },
  { pdu: '1-3', sockets: sockets1to14 },
  { pdu: '1-4', sockets: sockets1to14 },
  { pdu: '2-1', sockets: sockets1to14 },
  { pdu: '2-2', sockets: sockets1to14 },
  { pdu: '2-3', sockets: sockets1to14 },
  { pdu: '2-4', sockets: sockets1to14 },
]

export const BITDEER_S19XP_PDU_DATA: PduUnit[] = [
  { pdu: '1-1', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '1-2', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '1-3', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '1-4', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '2-1', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '2-2', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '2-3', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
  { pdu: '2-4', sockets: [...sockets_a1to5, ...sockets_b1to4, ...sockets_c1to4] },
]

const sockets_1to20 = [
  { socket: '1', enabled: false },
  { socket: '2', enabled: false },
  { socket: '3', enabled: false },
  { socket: '4', enabled: false },
  { socket: '5', enabled: false },
  { socket: '6', enabled: false },
  { socket: '7', enabled: false },
  { socket: '8', enabled: false },
  { socket: '9', enabled: false },
  { socket: '10', enabled: false },
  { socket: '11', enabled: false },
  { socket: '12', enabled: false },
  { socket: '13', enabled: false },
  { socket: '14', enabled: false },
  { socket: '15', enabled: false },
  { socket: '16', enabled: false },
  { socket: '17', enabled: false },
  { socket: '18', enabled: false },
  { socket: '19', enabled: false },
  { socket: '20', enabled: false },
]

export const MICROBT_PDU_DATA: PduUnit[] = [
  { pdu: '1', sockets: sockets_1to20 },
  { pdu: '2', sockets: sockets_1to20 },
  { pdu: '3', sockets: sockets_1to20 },
  { pdu: '4', sockets: sockets_1to20 },
  { pdu: '5', sockets: sockets_1to20 },
  { pdu: '6', sockets: sockets_1to20 },
  { pdu: '7', sockets: sockets_1to20 },
  { pdu: '8', sockets: sockets_1to20 },
  { pdu: '9', sockets: sockets_1to20 },
  { pdu: '10', sockets: sockets_1to20 },
  { pdu: '11', sockets: sockets_1to20 },
  { pdu: '12', sockets: sockets_1to20 },
]

export const BITDEER_RACKS_WITH_FAKE_SOCKET: string[] = ['1-3', '1-4', '2-3', '2-4']

const microBtShelves = `
  "1 11"
  "2 12"
  "3 13"
  "4 14"
  "5 15"
  "6 16"
  "7 17"
  "8 18"
  "9 19"
  "10 20"
`

const bitdeerShelvesType1 = `
  "a1 a2 a4 b1 b3 c1 c3"
  ". a3 a5 b2 b4 c2 c4"
`

const bitdeerShelvesType2 = `
  ". a2 a4 b1 b3 c1 c3"
  "a1 a3 a5 b2 b4 c2 c4"
`

const bitdeerShelvesType3 = `
  "a1 a2 a4 a6 b2 b4 c1 c3 c5"
  ".  a3 a5 b1 b3 b5 c2 c4  ."
`

export const DEVICE_TEMPLATE_AREAS = {
  [COMPLETE_CONTAINER_TYPE.MICROBT_WONDERINT]: {
    1: microBtShelves,
    2: microBtShelves,
    3: microBtShelves,
    4: microBtShelves,
    5: microBtShelves,
    6: microBtShelves,
    7: microBtShelves,
    8: microBtShelves,
    9: microBtShelves,
    10: microBtShelves,
    11: microBtShelves,
    12: microBtShelves,
  },
  [COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA]: {
    1: microBtShelves,
    2: microBtShelves,
    3: microBtShelves,
    4: microBtShelves,
    5: microBtShelves,
    6: microBtShelves,
    7: microBtShelves,
    8: microBtShelves,
    9: microBtShelves,
    10: microBtShelves,
    11: microBtShelves,
    12: microBtShelves,
  },
  [COMPLETE_CONTAINER_TYPE.BITDEER_A1346]: {
    '1-2': bitdeerShelvesType2,
    '1-3': bitdeerShelvesType1,
    '1-4': bitdeerShelvesType1,
    '2-2': bitdeerShelvesType2,
    '2-3': bitdeerShelvesType1,
    '2-4': bitdeerShelvesType1,
  },
  [COMPLETE_CONTAINER_TYPE.BITDEER_M30]: {
    '1-3': bitdeerShelvesType3,
    '2-3': bitdeerShelvesType3,
  },
  [COMPLETE_CONTAINER_TYPE.BITDEER_S19XP]: {
    '1-3': bitdeerShelvesType1,
    '1-4': bitdeerShelvesType1,
    '2-3': bitdeerShelvesType1,
    '2-4': bitdeerShelvesType1,
  },
}

export const getSelectableName = (pdu: string, socket: string) =>
  JSON.stringify({
    pduIndex: pdu,
    socketIndex: socket,
  })

export const getPduIndex = (device: Device) => _split(device.info?.pos, '_', 1)[0]

export const getSocketIndex = (device: Device) => _split(device.info?.pos, '_').slice(1).join('_')
