import { getExistedIndex } from './actionsSlice'

import type { ActionsState } from '@/types/redux'

describe('actionsSlice', () => {
  describe('getExistedIndex', () => {
    it('should return the index of the item in the array', () => {
      const state: ActionsState = {
        pendingSubmissions: [{ id: 1 }, { id: 2 }, { id: 3 }],
      }
      const payloadId = 2
      const result = getExistedIndex(state, payloadId)
      expect(result).toBe(1)
    })

    it('should return -1 if the item is not in the array', () => {
      const state: ActionsState = {
        pendingSubmissions: [{ id: 1 }, { id: 2 }, { id: 3 }],
      }
      const payloadId = 4
      const result = getExistedIndex(state, payloadId)
      expect(result).toBe(-1)
    })

    it('should return -1 if the array is empty', () => {
      const state: ActionsState = {
        pendingSubmissions: [],
      }
      const payloadId = 4
      const result = getExistedIndex(state, payloadId)
      expect(result).toBe(-1)
    })

    it('should return -1 if the array is undefined', () => {
      const state = {} as ActionsState
      const payloadId = 4
      const result = getExistedIndex(state, payloadId)
      expect(result).toBe(-1)
    })

    it('should return -1 if nothing is passed', () => {
      const result = getExistedIndex({} as ActionsState, 0)
      expect(result).toBe(-1)
    })
  })
})
