import {
  getContainerName,
  getContainerSettingsModel,
  getMockedPduData,
  getPduData,
  getTotalSockets,
  isBitmainImmersion,
  isMicroBTKehua,
  sortAlphanumeric,
} from '../containerUtils'
import type { UnknownRecord } from '../deviceUtils/types'

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

  describe('isMicroBTKehua', () => {
    it('returns true for mbt-kehua type', () => {
      expect(isMicroBTKehua('container-mbt-kehua')).toBe(true)
    })

    it('returns false for non-kehua mbt type', () => {
      expect(isMicroBTKehua('container-mbt-other')).toBe(false)
    })
  })

  describe('getContainerSettingsModel', () => {
    it('returns null for empty type', () => {
      expect(getContainerSettingsModel('')).toBeNull()
    })

    it('returns bitdeer model for bitdeer container', () => {
      expect(getContainerSettingsModel('container-bd-d40')).toBe('bd')
    })

    it('returns microbt model for microbt container', () => {
      expect(getContainerSettingsModel('container-mbt-kehua')).toBe('mbt')
    })

    it('returns hydro model for antspace hydro container', () => {
      expect(getContainerSettingsModel('container-as-hk3')).toBe('hydro')
    })

    it('returns immersion model for bitmain immersion container', () => {
      expect(getContainerSettingsModel('container-as-immersion')).toBe('immersion')
    })

    it('returns null for unknown container type', () => {
      expect(getContainerSettingsModel('container-unknown')).toBeNull()
    })
  })

  describe('getPduData', () => {
    it('returns undefined for undefined last', () => {
      expect(getPduData(undefined)).toBeUndefined()
    })

    it('returns pdu_data from deeply nested structure', () => {
      const last = {
        snap: {
          stats: {
            container_specific: {
              pdu_data: [{ id: 'pdu1' }],
            },
          },
        },
      }
      const result = getPduData(last as never)
      expect(result).toEqual([{ id: 'pdu1' }])
    })
  })

  describe('getMockedPduData', () => {
    it('returns default mock data for unknown type', () => {
      const result = getMockedPduData('unknown-type')
      expect(result).toBeDefined()
    })

    it('returns type-specific pdu data for known container types', () => {
      const result1 = getMockedPduData('container-bd-d40-m30')
      const result2 = getMockedPduData('container-bd-d40-a1346')
      const result3 = getMockedPduData('container-bd-d40-m56')
      const result4 = getMockedPduData('container-bd-d40-s19xp')
      expect(result1).toBeDefined()
      expect(result2).toBeDefined()
      expect(result3).toBeDefined()
      expect(result4).toBeDefined()
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
