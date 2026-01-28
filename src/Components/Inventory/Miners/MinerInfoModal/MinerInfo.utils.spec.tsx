import { getMinerMACUpdates } from './MinerInfo.utils'

const baseControllerRaw = {
  id: '0d637cac-67e3-4ad3-8a04-bff8a7c3344f',
  code: 'MINER_PART-CONTROLLER-0015',
  type: 'inventory-miner_part-controller',
  tags: [
    't-inventory-miner_part-controller',
    't-inventory-miner_part',
    't-inventory',
    'inventory',
    'miner_part',
    'site-Test',
    'id-0d637cac-67e3-4ad3-8a04-bff8a7c3344f',
    'code-MINER_PART-CONTROLLER-0015',
  ],
  info: {
    subType: 'CB4_V10',
    serialNum: 'TESTASTDY',
    macAddress: null,
    location: 'workshop.warehouse',
    status: 'ok_brand_new',
    lastComment: 'NEW',
    parentDeviceId: '06yj6il8uk0mn1g',
    lastActionId: 1749722470237,
  },
  rack: 'inventory-miner_part-controller-shelf-3',
}

const createControllerPart = ({
  macAddress = null as string | null | undefined,
  serialNum = 'TESTASTDY' as string | undefined,
  id = '0d637cac-67e3-4ad3-8a04-bff8a7c3344f',
  removed = false,
  existing = true,
} = {}) => ({
  part: 'Controller',
  serialNum,
  macAddress,
  id,
  raw: {
    ...baseControllerRaw,
    id,
    code: baseControllerRaw.code,
    info: {
      ...baseControllerRaw.info,
      serialNum,
      macAddress,
    },
  },
  existing,
  removed,
})

describe('getMinerMACUpdates', () => {
  it('returns isMACUpdated: false if no controller part is present', () => {
    const result = getMinerMACUpdates([
      {
        part: 'Psu',
        serialNum: 'TESTASTDY',
        macAddress: 'MAC',
        id: '0d637cac-67e3-4ad3-8a04-bff8a7c3344f',
        raw: {
          id: '0d637cac-67e3-4ad3-8a04-bff8a7c3344f',
          code: 'MINER_PART-PSU-0015',
          type: 'inventory-miner_part-psu',
          tags: [
            't-inventory-miner_part-psu',
            't-inventory-miner_part',
            't-inventory',
            'inventory',
            'miner_part',
            'site-Test',
            'id-0d637cac-67e3-4ad3-8a04-bff8a7c3344f',
            'code-MINER_PART-PSU-0015',
          ],
          info: {
            subType: 'CB4_V10',
            serialNum: 'TESTASTDY',
            macAddress: 'MAC',
            location: 'workshop.warehouse',
            status: 'ok_brand_new',
            lastComment: 'NEW',
            parentDeviceId: '06yj6il8uk0mn1g',
            lastActionId: 1749722470237,
          },
          rack: 'inventory-miner_part-psu-shelf-3',
        },
        existing: true,
        removed: true,
      },
    ])
    expect(result).toEqual({ isMACUpdated: false })
  })

  it('returns isMACUpdated: false if multiple controllers but none has macAddress', () => {
    const result = getMinerMACUpdates([
      createControllerPart(),
      createControllerPart({ id: 'another-id' }),
    ])
    expect(result).toEqual({ isMACUpdated: false })
  })

  it('returns isMACUpdated: true with newMAC if multiple controllers and one has macAddress', () => {
    const result = getMinerMACUpdates([
      createControllerPart(),
      createControllerPart({
        id: 'new-controller',
        macAddress: '00:1A:2B:3C:4A:5F',
        serialNum: 'TESTASTDY3G',
      }),
    ])
    expect(result).toEqual({ isMACUpdated: true, newMAC: '00:1A:2B:3C:4A:5F' })
  })

  it('returns isMACUpdated: true with null MAC if single controller is removed', () => {
    const result = getMinerMACUpdates([
      createControllerPart({
        macAddress: '00:1A:2B:3C:4D:5E',
        removed: true,
      }),
    ])
    expect(result).toEqual({ isMACUpdated: true, newMAC: null })
  })

  it('returns isMACUpdated: true with macAddress if single controller present', () => {
    const result = getMinerMACUpdates([
      createControllerPart({
        macAddress: '00:1A:2B:3C:4D:5E',
        removed: false,
      }),
    ])
    expect(result).toEqual({ isMACUpdated: true, newMAC: '00:1A:2B:3C:4D:5E' })
  })
})
