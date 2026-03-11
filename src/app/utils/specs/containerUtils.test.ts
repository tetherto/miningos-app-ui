import {
  getContainerName,
  getTotalSockets,
  isBitmainImmersion,
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
