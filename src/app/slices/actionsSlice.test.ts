import { actionsSlice, getExistedIndex, selectPendingSubmissions } from './actionsSlice'

import type { ActionsState, RootState } from '@/types/redux'

const { setPendingSubmissionActions, setAddPendingSubmissionAction, removeTagsFromPendingAction, removePendingSubmissionAction, updatePendingSubmissionAction, clearAllPendingSubmissions } = actionsSlice.actions
const reducer = actionsSlice.reducer

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

  describe('reducer', () => {
    it('setPendingSubmissionActions replaces pending submissions', () => {
      const initial = { pendingSubmissions: [] }
      const payload = [{ id: 1, tags: ['a'] }]
      const state = reducer(initial, setPendingSubmissionActions(payload))
      expect(state.pendingSubmissions).toEqual(payload)
    })
    it('setAddPendingSubmissionAction appends with new id', () => {
      const initial = { pendingSubmissions: [{ id: 1, tags: [] }] }
      const state = reducer(initial, setAddPendingSubmissionAction({ tags: ['b'] }))
      expect(state.pendingSubmissions).toHaveLength(2)
      expect(state.pendingSubmissions[1].id).toBe(2)
      expect(state.pendingSubmissions[1].tags).toEqual(['b'])
    })
    it('removeTagsFromPendingAction removes tags from matching submission', () => {
      const initial = { pendingSubmissions: [{ id: 1, tags: ['a', 'b', 'c'] }] }
      const state = reducer(initial, removeTagsFromPendingAction({ submissionId: 1, tags: ['b'] }))
      expect(state.pendingSubmissions[0].tags).toEqual(['a', 'c'])
    })
    it('removePendingSubmissionAction removes submission by id', () => {
      const initial = { pendingSubmissions: [{ id: 1 }, { id: 2 }] }
      const state = reducer(initial, removePendingSubmissionAction({ id: 1 }))
      expect(state.pendingSubmissions).toHaveLength(1)
      expect(state.pendingSubmissions[0].id).toBe(2)
    })
    it('updatePendingSubmissionAction updates submission by id', () => {
      const initial = { pendingSubmissions: [{ id: 1, tags: ['a'] }] }
      const state = reducer(initial, updatePendingSubmissionAction({ id: 1, tags: ['b'] }))
      expect(state.pendingSubmissions[0].tags).toEqual(['b'])
    })
    it('clearAllPendingSubmissions clears array', () => {
      const initial = { pendingSubmissions: [{ id: 1 }] }
      const state = reducer(initial, clearAllPendingSubmissions())
      expect(state.pendingSubmissions).toEqual([])
    })
  })

  describe('selectPendingSubmissions', () => {
    it('returns pendingSubmissions from state', () => {
      const state = { actions: { pendingSubmissions: [{ id: 1 }] } } as unknown as RootState
      expect(selectPendingSubmissions(state)).toEqual([{ id: 1 }])
    })
  })
})
