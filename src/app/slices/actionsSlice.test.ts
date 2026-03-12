import { actionsSlice, getExistedIndex, selectPendingSubmissions } from './actionsSlice'

import type { ActionsState, RootState } from '@/types/redux'

const {
  setPendingSubmissionActions,
  setAddPendingSubmissionAction,
  removeTagsFromPendingAction,
  removePendingSubmissionAction,
  updatePendingSubmissionAction,
  clearAllPendingSubmissions,
} = actionsSlice.actions

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

  describe('reducers', () => {
    const initialState: ActionsState = { pendingSubmissions: [] }

    it('setPendingSubmissionActions replaces pendingSubmissions', () => {
      const state = reducer(initialState, setPendingSubmissionActions([{ id: 1 }, { id: 2 }]))
      expect(state.pendingSubmissions).toHaveLength(2)
      expect(state.pendingSubmissions[0].id).toBe(1)
    })

    it('setAddPendingSubmissionAction appends with auto-incremented id', () => {
      const state = reducer(
        { pendingSubmissions: [{ id: 1 }] },
        setAddPendingSubmissionAction({ tags: ['tag1'] }),
      )
      expect(state.pendingSubmissions).toHaveLength(2)
      expect(state.pendingSubmissions[1].id).toBe(2)
    })

    it('removeTagsFromPendingAction removes specified tags', () => {
      const state = reducer(
        { pendingSubmissions: [{ id: 1, tags: ['a', 'b', 'c'] }] },
        removeTagsFromPendingAction({ submissionId: 1, tags: ['a', 'c'] }),
      )
      expect(state.pendingSubmissions[0].tags).toEqual(['b'])
    })

    it('removeTagsFromPendingAction does nothing when submission not found', () => {
      const initial = { pendingSubmissions: [{ id: 1, tags: ['a'] }] }
      const state = reducer(initial, removeTagsFromPendingAction({ submissionId: 99, tags: ['a'] }))
      expect(state.pendingSubmissions[0].tags).toEqual(['a'])
    })

    it('removeTagsFromPendingAction does nothing when submission has no tags', () => {
      const initial = { pendingSubmissions: [{ id: 1 }] }
      const state = reducer(initial, removeTagsFromPendingAction({ submissionId: 1, tags: ['a'] }))
      expect(state.pendingSubmissions[0].tags).toBeUndefined()
    })

    it('removePendingSubmissionAction removes the item by id', () => {
      const state = reducer(
        { pendingSubmissions: [{ id: 1 }, { id: 2 }] },
        removePendingSubmissionAction({ id: 1 }),
      )
      expect(state.pendingSubmissions).toHaveLength(1)
      expect(state.pendingSubmissions[0].id).toBe(2)
    })

    it('updatePendingSubmissionAction merges partial data', () => {
      const state = reducer(
        { pendingSubmissions: [{ id: 1, tags: ['old'] }] },
        updatePendingSubmissionAction({ id: 1, tags: ['new'] }),
      )
      expect(state.pendingSubmissions[0].tags).toEqual(['new'])
    })

    it('clearAllPendingSubmissions empties the list', () => {
      const state = reducer(
        { pendingSubmissions: [{ id: 1 }, { id: 2 }] },
        clearAllPendingSubmissions(),
      )
      expect(state.pendingSubmissions).toHaveLength(0)
    })
  })

  describe('selectPendingSubmissions', () => {
    it('selects pendingSubmissions from root state', () => {
      const rootState = {
        actions: { pendingSubmissions: [{ id: 42 }] },
      } as unknown as RootState
      expect(selectPendingSubmissions(rootState)).toEqual([{ id: 42 }])
    })
  })
})
