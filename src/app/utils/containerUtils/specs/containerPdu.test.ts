import {
  getPduData,
  getMockedPduData,
  getIndexes,
  getBitdeerIndexes,
  getAntspaceHydroIndexes,
  getAntspaceImmersionIndexes,
  getMicroBTIndexes,
  getConnectedMinerForSocket,
  getNumberSelected,
  getContainerPduData,
  getTotalSockets,
  getTotalContainerSockets,
  getContainerMinersPosition,
  getContainerSettingsModel,
} from '../containerPdu'

import { COMPLETE_CONTAINER_TYPE } from '@/constants/containerConstants'

describe('containerPdu', () => {
  describe('getPduData', () => {
    it('returns undefined when last is undefined', () => {
      expect(getPduData(undefined)).toBeUndefined()
    })
    it('returns pdu_data from last.snap.stats.container_specific', () => {
      const last = {
        snap: {
          stats: {
            container_specific: {
              pdu_data: [{ pdu: 'pdu1', sockets: [] }],
            },
          },
        },
      }
      expect(getPduData(last)).toHaveLength(1)
      expect(getPduData(last)?.[0].pdu).toBe('pdu1')
    })
  })

  describe('getMockedPduData', () => {
    it('returns type-specific data for known types', () => {
      expect(getMockedPduData(COMPLETE_CONTAINER_TYPE.BITDEER_M30)).toBeDefined()
      expect(getMockedPduData(COMPLETE_CONTAINER_TYPE.BITDEER_A1346)).toBeDefined()
      expect(getMockedPduData(COMPLETE_CONTAINER_TYPE.BITDEER_M56)).toBeDefined()
      expect(getMockedPduData(COMPLETE_CONTAINER_TYPE.BITDEER_S19XP)).toBeDefined()
    })
    it('returns MICROBT_PDU_DATA for unknown type', () => {
      expect(getMockedPduData('unknown')).toBeDefined()
    })
  })

  describe('getIndexes, getBitdeerIndexes, getMicroBTIndexes', () => {
    it('getIndexes extracts two segments', () => {
      expect(getIndexes('pdu1_socket1')).toEqual(['pdu1', 'socket1'])
    })
    it('getBitdeerIndexes', () => {
      expect(getBitdeerIndexes('pdu_socket')).toEqual(['pdu', 'socket'])
    })
    it('getAntspaceHydroIndexes extracts three segments', () => {
      expect(getAntspaceHydroIndexes('r1_pdu1_socket1')).toEqual(['r1', 'pdu1', 'socket1'])
    })
    it('getAntspaceImmersionIndexes', () => {
      expect(getAntspaceImmersionIndexes('pdu_socket')).toEqual(['pdu', 'socket'])
    })
    it('getMicroBTIndexes', () => {
      expect(getMicroBTIndexes('pdu_socket')).toEqual(['pdu', 'socket'])
    })
  })

  describe('getConnectedMinerForSocket', () => {
    it('returns undefined when no matching device', () => {
      const devices = [{ type: 'miner-wm', info: { pos: 'pdu2_s2' } }]
      expect(getConnectedMinerForSocket(devices as never, 'pdu1', 's1')).toBeUndefined()
    })
    it('returns device when bitdeer pos matches', () => {
      const devices = [{ type: 'miner-wm', info: { container: 'bitdeer-1', pos: 'pdu1_s1' } }]
      expect(getConnectedMinerForSocket(devices as never, 'pdu1', 's1')).toBeDefined()
    })
    it('returns device when microbt pos matches', () => {
      const devices = [
        { type: 'miner-wm', info: { container: 'container-mbt-kehua', pos: 'pdu1_s1' } },
      ]
      expect(getConnectedMinerForSocket(devices as never, 'pdu1', 's1')).toBeDefined()
    })
  })

  describe('getNumberSelected', () => {
    it('counts containers and sockets', () => {
      const selected = {
        c1: {
          sockets: [
            { socket: 's1', enabled: true },
            { socket: 's2', enabled: true },
          ],
        },
        c2: { sockets: [{ socket: 's1', enabled: true }] },
      }
      const result = getNumberSelected(selected)
      expect(result.nContainers).toBe(2)
      expect(result.nSockets).toBe(3)
    })
  })

  describe('getContainerPduData', () => {
    it('returns undefined for unknown type', () => {
      expect(getContainerPduData('unknown', undefined)).toBeUndefined()
    })
    it('returns ANTSPACE_PDU_DATA for antspace hydro', () => {
      const result = getContainerPduData('container-as-hk3', undefined)
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
    it('returns merged pdu data for bitdeer when last provided', () => {
      const last = {
        snap: {
          stats: {
            container_specific: {
              pdu_data: [{ pdu: 'pdu1', sockets: [], power_w: 100 }],
            },
          },
        },
      }
      const result = getContainerPduData(COMPLETE_CONTAINER_TYPE.BITDEER_M56, last)
      expect(result).toBeDefined()
    })
  })

  describe('getTotalSockets', () => {
    it('sums socket count across pdus', () => {
      const pduData = [
        {
          pdu: 'p1',
          sockets: [
            { socket: 'a', enabled: true },
            { socket: 'b', enabled: true },
          ],
        },
        { pdu: 'p2', sockets: [{ socket: 'c', enabled: true }] },
      ]
      expect(getTotalSockets(pduData)).toBe(3)
    })
  })

  describe('getTotalContainerSockets', () => {
    it('returns 0 when no pdu data', () => {
      expect(getTotalContainerSockets({ type: 'unknown' })).toBe(0)
    })
  })

  describe('getContainerMinersPosition', () => {
    it('returns pdu_socket strings for bitdeer', () => {
      const result = getContainerMinersPosition(COMPLETE_CONTAINER_TYPE.BITDEER_M56)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getContainerSettingsModel', () => {
    it('returns null for empty type', () => {
      expect(getContainerSettingsModel('')).toBeNull()
    })
    it('returns model for bitdeer', () => {
      expect(getContainerSettingsModel('container-bd-d40-m56')).toBeDefined()
    })
    it('returns null for unknown type', () => {
      expect(getContainerSettingsModel('unknown')).toBeNull()
    })
  })
})
