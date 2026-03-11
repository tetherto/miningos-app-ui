import { describe, expect, it, vi } from 'vitest'

import type { GetListThingsFunction } from '../apiCallUtils'
import { recursiveListThingsApiCall } from '../apiCallUtils'

describe('apiCallUtils', () => {
  describe('recursiveListThingsApiCall', () => {
    it('returns all data when single call returns fewer than itemsInOneCall', async () => {
      const getListThings: GetListThingsFunction<{ id: number }> = vi.fn().mockResolvedValue({
        data: [[{ id: 1 }, { id: 2 }]],
      })
      const result = await recursiveListThingsApiCall(getListThings, 10, 0, [], {})
      expect(result).toEqual([{ id: 1 }, { id: 2 }])
      expect(getListThings).toHaveBeenCalledTimes(1)
      expect(getListThings).toHaveBeenCalledWith({ limit: 10, offset: 0 })
    })

    it('recursively fetches until last page returns fewer items', async () => {
      const getListThings: GetListThingsFunction<{ id: number }> = vi
        .fn()
        .mockResolvedValueOnce({ data: [[{ id: 1 }, { id: 2 }, { id: 3 }]] })
        .mockResolvedValueOnce({ data: [[{ id: 4 }, { id: 5 }]] })
      const result = await recursiveListThingsApiCall(getListThings, 3, 0, [], {})
      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])
      expect(getListThings).toHaveBeenCalledTimes(2)
      expect(getListThings).toHaveBeenNthCalledWith(1, { limit: 3, offset: 0 })
      expect(getListThings).toHaveBeenNthCalledWith(2, { limit: 3, offset: 3 })
    })

    it('merges prevData with new data', async () => {
      const getListThings: GetListThingsFunction<{ id: number }> = vi.fn().mockResolvedValue({
        data: [[{ id: 3 }]],
      })
      const result = await recursiveListThingsApiCall(
        getListThings,
        10,
        2,
        [{ id: 1 }, { id: 2 }],
        {},
      )
      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    })

    it('passes listThingParams to getListThings', async () => {
      const getListThings: GetListThingsFunction<{ id: number }> = vi.fn().mockResolvedValue({
        data: [[]],
      })
      await recursiveListThingsApiCall(getListThings, 10, 0, [], { tag: 'miner' })
      expect(getListThings).toHaveBeenCalledWith(
        expect.objectContaining({ tag: 'miner', limit: 10, offset: 0 }),
      )
    })
  })
})
