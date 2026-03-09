import {
  ANTSPACE_ALARM_STATUS,
  getAntspaceFaultAlarmStatus,
  getAntspaceAlarms,
  getBitdeerIndexes,
  getAntspaceHydroIndexes,
  getContainerName,
  getContainerSettingsModel,
  getIndexes,
  getMicroBTIndexes,
  getMockedPduData,
  getMinerTypeFromContainerType,
  getNumberSelected,
  getPduData,
  getSupportedContainerTypesFromMinerType,
  getTotalSockets,
  isA1346,
  isAvalonContainer,
  isAntminerContainer,
  isAntspaceHydro,
  isBitdeer,
  isBitmainImmersion,
  isContainerControlNotsupported,
  isContainerOffline,
  isM30,
  isMicroBT,
  isMicroBTKehua,
  isS19XP,
  isWhatsminerContainer,
  sortAlphanumeric,
} from '../containerUtils'
import type { UnknownRecord } from '../deviceUtils/types'
import { COMPLETE_CONTAINER_TYPE } from '@/constants/containerConstants'

const GET_CONTAINER_NAME_TEST_ARGS = {
  bitdeer: { type: 'container-bd-d40-m56', container: 'bitdeer-5a' },
  bitmainImmersion: { type: 'container-as-immersion', container: 'antspace-immersion-2' },
  bitmainHydro: { type: 'container-as-hk3', container: 'bitmain-hydro-1' },
  microBT: { type: 'container-mbt-kehua', container: 'microbt-1' },
}

describe('Container Utils', () => {
  test('getContainerName', () => {
    expect(
      getContainerName(
        GET_CONTAINER_NAME_TEST_ARGS.bitdeer.container,
        GET_CONTAINER_NAME_TEST_ARGS.bitdeer.type,
      ),
    ).toBe('Bitdeer 5a M56')

    expect(
      getContainerName(
        GET_CONTAINER_NAME_TEST_ARGS.bitmainImmersion.container,
        GET_CONTAINER_NAME_TEST_ARGS.bitmainImmersion.type,
      ),
    ).toBe('Antspace Immersion 2')

    expect(
      getContainerName(
        GET_CONTAINER_NAME_TEST_ARGS.bitmainHydro.container,
        GET_CONTAINER_NAME_TEST_ARGS.bitmainHydro.type,
      ),
    ).toBe('Bitmain Hydro 1')

    expect(
      getContainerName(
        GET_CONTAINER_NAME_TEST_ARGS.microBT.container,
        GET_CONTAINER_NAME_TEST_ARGS.microBT.type,
      ),
    ).toBe('MicroBT 1 Kehua')
  })

  describe('getTotalSockets', () => {
    it('correctly sums the number of sockets from all PDUs', () => {
      const pduData = [
        {
          pdu: 'pdu1',
          sockets: [
            { socket: 'A', enabled: true },
            { socket: 'B', enabled: true },
            { socket: 'C', enabled: true },
          ],
        },
        {
          pdu: 'pdu2',
          sockets: [
            { socket: 'D', enabled: true },
            { socket: 'E', enabled: true },
          ],
        },
        { pdu: 'pdu3', sockets: [{ socket: 'F', enabled: true }] },
      ]
      expect(getTotalSockets(pduData)).toBe(6)
    })

    it('returns 0 if there are no PDUs', () => {
      expect(getTotalSockets([])).toBe(0)
    })

    it('returns 0 if PDUs have no sockets', () => {
      const pduData = [
        { pdu: 'pdu1', sockets: [] },
        { pdu: 'pdu2', sockets: [] },
      ]
      expect(getTotalSockets(pduData)).toBe(0)
    })

    it('handles PDUs with a varying number of sockets', () => {
      const pduData = [
        { pdu: 'pdu1', sockets: [{ socket: 'A', enabled: true }] },
        {
          pdu: 'pdu2',
          sockets: [
            { socket: 'B', enabled: true },
            { socket: 'C', enabled: true },
            { socket: 'D', enabled: true },
            { socket: 'E', enabled: true },
            { socket: 'F', enabled: true },
          ],
        },
        { pdu: 'pdu3', sockets: [] },
        { pdu: 'pdu4', sockets: [{ socket: 'G', enabled: true }] },
      ]
      expect(getTotalSockets(pduData)).toBe(7)
    })

    it('ignores PDUs without a sockets property', () => {
      const pduData = [
        {
          pdu: 'pdu1',
          sockets: [
            { socket: 'A', enabled: true },
            { socket: 'B', enabled: true },
          ],
        },
        { pdu: 'pdu2', sockets: [] },
      ]
      expect(getTotalSockets(pduData)).toBe(2)
    })
  })

  describe('isBitmainImmersion', () => {
    it('returns true if container is bitmain immersion', () => {
      expect(isBitmainImmersion('bitmain-immersion')).toBe(true)
    })

    it('returns true if container is bitmain immersion (short name)', () => {
      expect(isBitmainImmersion('bitmain-imm-e3')).toBe(true)
    })

    it('should return true if container is bitmain immersion (container-as-immersion)', () => {
      expect(isBitmainImmersion('container-as-immersion')).toBe(true)
    })

    it('returns false if container is not bitmain immersion', () => {
      expect(isBitmainImmersion('container-as-hk3')).toBe(false)
    })
  })

  describe('sortAlphanumeric', () => {
    it('should sort an array of strings alphabetically', () => {
      const arr = ['c', 'a', 'b']
      expect(sortAlphanumeric(arr)).toEqual(['a', 'b', 'c'])
    })

    it('should sort an array of strings alphabetically with numbers', () => {
      const arr = ['c', 'a', 'b', '10', '1', '2']
      expect(sortAlphanumeric(arr)).toEqual(['1', '2', '10', 'a', 'b', 'c'])
    })
  })
})

describe('containerUtils type guards and helpers', () => {
  describe('isA1346, isM30, isS19XP', () => {
    it('isA1346', () => {
      expect(isA1346(COMPLETE_CONTAINER_TYPE.BITDEER_A1346)).toBe(true)
      expect(isA1346('other')).toBe(false)
    })
    it('isM30', () => {
      expect(isM30(COMPLETE_CONTAINER_TYPE.BITDEER_M30)).toBe(true)
    })
    it('isS19XP', () => {
      expect(isS19XP(COMPLETE_CONTAINER_TYPE.BITDEER_S19XP)).toBe(true)
    })
  })
  describe('isBitdeer, isMicroBT, isAntspaceHydro, isMicroBTKehua', () => {
    it('isBitdeer', () => {
      expect(isBitdeer('container-bd-d40')).toBe(true)
      expect(isBitdeer('bitdeer-1')).toBe(true)
      expect(isBitdeer('other')).toBe(false)
    })
    it('isMicroBT', () => {
      expect(isMicroBT('container-mbt-kehua')).toBe(true)
      expect(isMicroBT('microbt-1')).toBe(true)
    })
    it('isAntspaceHydro', () => {
      expect(isAntspaceHydro('container-as-hk3')).toBe(true)
      expect(isAntspaceHydro('antspace-hydro')).toBe(true)
    })
    it('isMicroBTKehua', () => {
      expect(isMicroBTKehua('container-mbt-kehua')).toBe(true)
    })
  })
  describe('getContainerSettingsModel', () => {
    it('returns null for empty', () => {
      expect(getContainerSettingsModel('')).toBe(null)
    })
    it('returns bd for bitdeer type', () => {
      expect(getContainerSettingsModel('container-bd-d40-m56')).toBe('bd')
    })
    it('returns mbt for microbt type', () => {
      expect(getContainerSettingsModel('container-mbt-kehua')).toBe('mbt')
    })
    it('returns hydro for antspace hydro', () => {
      expect(getContainerSettingsModel('container-as-hk3')).toBe('hydro')
    })
    it('returns immersion for bitmain immersion', () => {
      expect(getContainerSettingsModel('container-as-immersion')).toBe('immersion')
    })
    it('returns null for unknown', () => {
      expect(getContainerSettingsModel('unknown-type')).toBe(null)
    })
  })
  describe('getPduData', () => {
    it('returns pdu_data from last.snap.stats.container_specific', () => {
      const last = {
        snap: { stats: { container_specific: { pdu_data: [{ pdu: '1' }] } } },
      }
      expect(getPduData(last)).toEqual([{ pdu: '1' }])
    })
    it('returns undefined when path missing', () => {
      expect(getPduData(undefined)).toBeUndefined()
      expect(getPduData({})).toBeUndefined()
    })
  })
  describe('getMockedPduData', () => {
    it('returns correct data for known types', () => {
      expect(getMockedPduData(COMPLETE_CONTAINER_TYPE.BITDEER_M30)).toBeDefined()
      expect(getMockedPduData(COMPLETE_CONTAINER_TYPE.BITDEER_A1346)).toBeDefined()
      expect(getMockedPduData(COMPLETE_CONTAINER_TYPE.BITDEER_M56)).toBeDefined()
      expect(getMockedPduData(COMPLETE_CONTAINER_TYPE.BITDEER_S19XP)).toBeDefined()
    })
    it('returns MICROBT_PDU_DATA for default', () => {
      expect(getMockedPduData('unknown')).toBeDefined()
    })
  })
  describe('getIndexes, getBitdeerIndexes, getAntspaceHydroIndexes, getMicroBTIndexes', () => {
    it('getIndexes extracts two segments', () => {
      expect(getIndexes('pdu1_socket1')).toEqual(['pdu1', 'socket1'])
    })
    it('getBitdeerIndexes', () => {
      expect(getBitdeerIndexes('pdu_socket')).toEqual(['pdu', 'socket'])
    })
    it('getAntspaceHydroIndexes extracts three segments', () => {
      expect(getAntspaceHydroIndexes('r1_pdu1_socket1')).toEqual(['r1', 'pdu1', 'socket1'])
    })
    it('getMicroBTIndexes', () => {
      expect(getMicroBTIndexes('pdu_socket')).toEqual(['pdu', 'socket'])
    })
  })
  describe('getNumberSelected', () => {
    it('counts containers and sockets', () => {
      const selected = {
        c1: { sockets: { s1: true, s2: true } },
        c2: { sockets: { s1: true } },
      }
      expect(getNumberSelected(selected)).toEqual({ nContainers: 2, nSockets: 3 })
    })
  })
  describe('getAntspaceFaultAlarmStatus', () => {
    it('returns UNAVAILABLE for non-boolean', () => {
      expect(getAntspaceFaultAlarmStatus(null)).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
    })
    it('returns FAULT for true', () => {
      expect(getAntspaceFaultAlarmStatus(true)).toBe(ANTSPACE_ALARM_STATUS.FAULT)
    })
    it('returns NORMAL for false', () => {
      expect(getAntspaceFaultAlarmStatus(false)).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })
  })
  describe('getAntspaceAlarms', () => {
    it('returns array of alarm objects', () => {
      const stats = { power_fault: false, liquid_level_low: true }
      const alarms = getAntspaceAlarms(stats)
      expect(Array.isArray(alarms)).toBe(true)
      expect(alarms.length).toBeGreaterThan(0)
      expect(alarms[0]).toHaveProperty('label')
      expect(alarms[0]).toHaveProperty('id')
      expect(alarms[0]).toHaveProperty('status')
    })
  })
  describe('isAvalonContainer, isWhatsminerContainer, isAntminerContainer', () => {
    it('isAvalonContainer', () => {
      expect(isAvalonContainer('container-bd-d40-a1346')).toBe(true)
      expect(isAvalonContainer('miner-wm')).toBe(false)
    })
    it('isWhatsminerContainer', () => {
      expect(isWhatsminerContainer('container-bd-d40-m56')).toBe(true)
      expect(isWhatsminerContainer('container-mbt-kehua')).toBe(true)
    })
    it('isAntminerContainer', () => {
      expect(isAntminerContainer('container-bd-d40-s19xp')).toBe(true)
      expect(isAntminerContainer('container-as-immersion')).toBe(true)
    })
  })
  describe('getMinerTypeFromContainerType', () => {
    it('returns MINER_TYPE for container types', () => {
      expect(getMinerTypeFromContainerType('container-bd-d40-a1346')).toBe('av')
      expect(getMinerTypeFromContainerType('container-bd-d40-m56')).toBe('wm')
      expect(getMinerTypeFromContainerType('container-bd-d40-s19xp')).toBe('am')
    })
    it('returns undefined for unknown', () => {
      expect(getMinerTypeFromContainerType('unknown')).toBeUndefined()
    })
  })
  describe('isContainerOffline', () => {
    it('returns true when status is offline', () => {
      expect(isContainerOffline({ stats: { status: 'offline' } })).toBe(true)
    })
    it('returns false when status is not offline', () => {
      expect(isContainerOffline({ stats: { status: 'online' } })).toBe(false)
    })
    it('returns false when snap undefined', () => {
      expect(isContainerOffline(undefined)).toBe(false)
    })
  })
  describe('getSupportedContainerTypesFromMinerType', () => {
    it('returns types for avalon miner', () => {
      const types = getSupportedContainerTypesFromMinerType('miner-av-a1346')
      expect(types).toContain(COMPLETE_CONTAINER_TYPE.BITDEER_A1346)
    })
    it('returns types for whatsminer', () => {
      const types = getSupportedContainerTypesFromMinerType('miner-wm-m56')
      expect(types?.length).toBeGreaterThan(0)
    })
    it('returns types for antminer', () => {
      const types = getSupportedContainerTypesFromMinerType('miner-am-s19')
      expect(types?.length).toBeGreaterThan(0)
    })
    it('returns empty for unknown', () => {
      expect(getSupportedContainerTypesFromMinerType('miner-unknown')).toEqual([])
    })
  })
  describe('isContainerControlNotsupported', () => {
    it('returns true for antspace hydro or immersion', () => {
      expect(isContainerControlNotsupported('container-as-hk3')).toBe(true)
      expect(isContainerControlNotsupported('container-as-immersion')).toBe(true)
    })
    it('returns false for bitdeer', () => {
      expect(isContainerControlNotsupported('container-bd-d40-m56')).toBe(false)
    })
  })
})
