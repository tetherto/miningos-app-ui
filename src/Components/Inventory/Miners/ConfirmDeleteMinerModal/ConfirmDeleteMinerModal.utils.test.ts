import {
  createDeleteMinerBatchAction,
  createMinerDeleteAction,
  createSparePartAction,
  createSparePartActions,
  createSparePartDeleteAction,
  createSparePartUnlinkAction,
  mapSparePartsData,
  type MappedSparePart,
  type Miner,
} from './ConfirmDeleteMinerModal.utils'

import { ACTION_TYPES, BATCH_ACTION_TYPES } from '@/constants/actions'

describe('ConfirmDeleteMinerModal.utils', () => {
  const mockMiner: Miner = {
    id: 'miner-123',
    raw: {
      rack: 'rack-abc',
      code: 'M001',
      info: {
        container: 'container-1',
        pos: 'A1',
      },
    },
  }

  const mockSparePart: MappedSparePart = {
    id: 'spare-456',
    raw: {
      rack: 'rack-xyz',
    },
    rack: 'rack-xyz',
  }

  describe('mapSparePartsData', () => {
    it('should map spare parts data correctly', () => {
      const sparePartsData = [
        [
          { id: 'sp-1', raw: { rack: 'rack-1' }, rack: 'rack-1' },
          { id: 'sp-2', raw: { rack: 'rack-2' }, rack: 'rack-2' },
        ],
      ]

      const result = mapSparePartsData(sparePartsData)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'sp-1',
        raw: { rack: 'rack-1' },
        rack: 'rack-1',
      })
    })

    it('should filter out parts without id', () => {
      const sparePartsData = [
        [
          { id: 'sp-1', raw: { rack: 'rack-1' }, rack: 'rack-1' },
          { raw: { rack: 'rack-2' }, rack: 'rack-2' },
        ],
      ]

      const result = mapSparePartsData(sparePartsData)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('sp-1')
    })

    it('should filter out parts without rack', () => {
      const sparePartsData = [
        [
          { id: 'sp-1', raw: { rack: 'rack-1' }, rack: 'rack-1' },
          { id: 'sp-2', raw: {} },
        ],
      ]

      const result = mapSparePartsData(sparePartsData)

      expect(result).toHaveLength(1)
    })

    it('should use raw.rack as fallback for rack', () => {
      const sparePartsData = [[{ id: 'sp-1', raw: { rack: 'rack-from-raw' } }]]

      const result = mapSparePartsData(sparePartsData)

      expect(result[0].rack).toBe('rack-from-raw')
    })

    it('should handle empty data', () => {
      expect(mapSparePartsData([])).toEqual([])
      expect(mapSparePartsData(null)).toEqual([])
      expect(mapSparePartsData(undefined)).toEqual([])
    })
  })

  describe('createMinerDeleteAction', () => {
    it('should create correct miner delete action', () => {
      const result = createMinerDeleteAction(mockMiner)

      expect(result).toEqual({
        type: 'voting',
        action: ACTION_TYPES.FORGET_THINGS,
        params: [
          {
            rackId: 'rack-abc',
            query: { id: 'miner-123' },
          },
        ],
        container: 'container-1',
        pos: 'A1',
        minerId: 'miner-123',
      })
    })

    it('should handle miner without info', () => {
      const minerWithoutInfo: Miner = {
        id: 'miner-456',
        raw: {
          rack: 'rack-def',
        },
      }

      const result = createMinerDeleteAction(minerWithoutInfo)

      expect(result.container).toBeUndefined()
      expect(result.pos).toBeUndefined()
      expect(result.minerId).toBe('miner-456')
    })
  })

  describe('createSparePartDeleteAction', () => {
    it('should create correct spare part delete action', () => {
      const result = createSparePartDeleteAction(mockSparePart)

      expect(result).toMatchObject({
        type: 'voting',
        action: ACTION_TYPES.FORGET_THINGS,
        params: [
          {
            rackId: 'rack-xyz',
            query: { id: 'spare-456' },
          },
        ],
        minerId: 'spare-456',
      })
    })

    it('should return null for part without rackId', () => {
      const partWithoutRack: MappedSparePart = {
        id: 'spare-789',
        raw: {},
      }

      const result = createSparePartDeleteAction(partWithoutRack)

      expect(result).toBeNull()
    })

    it('should return null for part without id', () => {
      const partWithoutId = {
        raw: { rack: 'rack-xyz' },
        rack: 'rack-xyz',
      } as MappedSparePart

      const result = createSparePartDeleteAction(partWithoutId)

      expect(result).toBeNull()
    })

    it('should use rack fallback when raw.rack is undefined', () => {
      const partWithRackOnly: MappedSparePart = {
        id: 'spare-999',
        rack: 'fallback-rack',
      }

      const result = createSparePartDeleteAction(partWithRackOnly)

      expect(result).not.toBeNull()
      expect((result?.params as Array<{ rackId: string }>)[0].rackId).toBe('fallback-rack')
    })
  })

  describe('createSparePartUnlinkAction', () => {
    it('should create correct spare part unlink action', () => {
      const result = createSparePartUnlinkAction(mockSparePart)

      expect(result).toMatchObject({
        action: ACTION_TYPES.UPDATE_THING,
        minerId: 'spare-456',
        params: [
          {
            id: 'spare-456',
            rackId: 'rack-xyz',
            info: {
              parentDeviceId: null,
              parentDeviceType: null,
              parentDeviceCode: null,
              parentDeviceSN: null,
            },
          },
        ],
      })
    })

    it('should return null for part without rackId', () => {
      const partWithoutRack: MappedSparePart = {
        id: 'spare-789',
        raw: {},
      }

      const result = createSparePartUnlinkAction(partWithoutRack)

      expect(result).toBeNull()
    })
  })

  describe('createSparePartAction', () => {
    it('should create delete action when deleteSpareParts is true', () => {
      const result = createSparePartAction(mockSparePart, true)

      expect(result).toMatchObject({
        type: 'voting',
        action: ACTION_TYPES.FORGET_THINGS,
      })
    })

    it('should create unlink action when deleteSpareParts is false', () => {
      const result = createSparePartAction(mockSparePart, false)

      expect(result).toMatchObject({
        action: ACTION_TYPES.UPDATE_THING,
      })
    })
  })

  describe('createSparePartActions', () => {
    const parts: MappedSparePart[] = [
      { id: 'sp-1', raw: { rack: 'rack-1' }, rack: 'rack-1' },
      { id: 'sp-2', raw: { rack: 'rack-2' }, rack: 'rack-2' },
    ]

    it('should create actions for all valid parts', () => {
      const result = createSparePartActions(parts, true)

      expect(result).toHaveLength(2)
    })

    it('should filter out null actions from invalid parts', () => {
      const partsWithInvalid: MappedSparePart[] = [
        { id: 'sp-1', raw: { rack: 'rack-1' }, rack: 'rack-1' },
        { id: 'sp-2', raw: {} }, // Invalid - no rack
      ]

      const result = createSparePartActions(partsWithInvalid, true)

      expect(result).toHaveLength(1)
    })

    it('should return empty array for empty parts', () => {
      const result = createSparePartActions([], true)

      expect(result).toEqual([])
    })
  })

  describe('createDeleteMinerBatchAction', () => {
    const spareParts: MappedSparePart[] = [{ id: 'sp-1', raw: { rack: 'rack-1' }, rack: 'rack-1' }]

    it('should create correct batch action structure', () => {
      const result = createDeleteMinerBatchAction(mockMiner, spareParts, false)

      expect(result.action).toBe(BATCH_ACTION_TYPES.DELETE_MINER)
      expect(result.batchActionUID).toBe('miner-123')
      expect(result.batchActionsPayload).toHaveLength(2) // 1 spare part + 1 miner
    })

    it('should include spare part actions before miner action', () => {
      const result = createDeleteMinerBatchAction(mockMiner, spareParts, false)

      // Spare part action should be first
      expect(result.batchActionsPayload[0]).toMatchObject({
        action: ACTION_TYPES.UPDATE_THING,
        minerId: 'sp-1',
      })

      // Miner action should be last
      expect(result.batchActionsPayload[1]).toMatchObject({
        action: ACTION_TYPES.FORGET_THINGS,
        minerId: 'miner-123',
      })
    })

    it('should create delete actions for spare parts when deleteSpareParts is true', () => {
      const result = createDeleteMinerBatchAction(mockMiner, spareParts, true)

      expect(result.batchActionsPayload[0]).toMatchObject({
        type: 'voting',
        action: ACTION_TYPES.FORGET_THINGS,
      })
    })

    it('should work with no spare parts', () => {
      const result = createDeleteMinerBatchAction(mockMiner, [], false)

      expect(result.batchActionsPayload).toHaveLength(1)
      expect(result.batchActionsPayload[0]).toMatchObject({
        action: ACTION_TYPES.FORGET_THINGS,
        minerId: 'miner-123',
      })
    })
  })
})
