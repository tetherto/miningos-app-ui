import { ACTIONS_SIDEBAR_TYPES } from '../../Components/ActionsSidebar/ActionsSidebar.types'

import {
  actionsSidebarSlice,
  selectIsActionsSidebarOpen,
  selectCurrentActionsData,
  selectIsActionsSidebarPinned,
} from './actionsSidebarSlice'

import type { ActionsSidebarState, RootState } from '@/types/redux.d'

const { setIsActionsSidebarOpen, setCurrentActionsData, setIsActionsSidebarPinned } =
  actionsSidebarSlice.actions
const reducer = actionsSidebarSlice.reducer

const mockState = (actionsSidebar: ActionsSidebarState): RootState =>
  ({ actionsSidebar }) as RootState

describe('actionsSidebarSlice', () => {
  describe('initial state', () => {
    it('starts closed, not pinned, with empty pending submission actions', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(state.isActionsSidebarOpen).toBe(false)
      expect(state.isActionsSidebarPinned).toBe(false)
      expect(state.currentActionsData.type).toBe(ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION)
      expect(state.currentActionsData.actions).toEqual([])
    })
  })

  describe('setIsActionsSidebarOpen', () => {
    it('opens the sidebar', () => {
      const state = reducer(undefined, setIsActionsSidebarOpen(true))
      expect(state.isActionsSidebarOpen).toBe(true)
    })

    it('closes the sidebar', () => {
      const initial: ActionsSidebarState = {
        isActionsSidebarOpen: true,
        currentActionsData: { type: ACTIONS_SIDEBAR_TYPES.DONE, actions: [] },
        isActionsSidebarPinned: false,
      }
      const state = reducer(initial, setIsActionsSidebarOpen(false))
      expect(state.isActionsSidebarOpen).toBe(false)
    })
  })

  describe('setCurrentActionsData', () => {
    it('sets the actions data type and payload', () => {
      const actions = [{ id: 1 }, { id: 2 }]
      const state = reducer(
        undefined,
        setCurrentActionsData({ type: ACTIONS_SIDEBAR_TYPES.EXECUTING, actions }),
      )
      expect(state.currentActionsData.type).toBe(ACTIONS_SIDEBAR_TYPES.EXECUTING)
      expect(state.currentActionsData.actions).toEqual(actions)
    })

    it('replaces previous actions data', () => {
      const initial: ActionsSidebarState = {
        isActionsSidebarOpen: true,
        currentActionsData: { type: ACTIONS_SIDEBAR_TYPES.DONE, actions: [{ id: 99 }] },
        isActionsSidebarPinned: false,
      }
      const state = reducer(
        initial,
        setCurrentActionsData({ type: ACTIONS_SIDEBAR_TYPES.FAILED, actions: [] }),
      )
      expect(state.currentActionsData.type).toBe(ACTIONS_SIDEBAR_TYPES.FAILED)
      expect(state.currentActionsData.actions).toEqual([])
    })
  })

  describe('setIsActionsSidebarPinned', () => {
    it('pins the sidebar', () => {
      const state = reducer(undefined, setIsActionsSidebarPinned(true))
      expect(state.isActionsSidebarPinned).toBe(true)
    })

    it('unpins the sidebar', () => {
      const initial: ActionsSidebarState = {
        isActionsSidebarOpen: false,
        currentActionsData: { type: ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION, actions: [] },
        isActionsSidebarPinned: true,
      }
      const state = reducer(initial, setIsActionsSidebarPinned(false))
      expect(state.isActionsSidebarPinned).toBe(false)
    })
  })

  describe('immutability', () => {
    it('does not mutate original state', () => {
      const initial: ActionsSidebarState = {
        isActionsSidebarOpen: false,
        currentActionsData: { type: ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION, actions: [] },
        isActionsSidebarPinned: false,
      }
      const copy = { ...initial }
      reducer(initial, setIsActionsSidebarOpen(true))
      expect(initial).toEqual(copy)
    })
  })

  describe('selectors', () => {
    describe('selectIsActionsSidebarOpen', () => {
      it('returns true when open', () => {
        const state = mockState({
          isActionsSidebarOpen: true,
          currentActionsData: { type: '', actions: [] },
          isActionsSidebarPinned: false,
        })
        expect(selectIsActionsSidebarOpen(state)).toBe(true)
      })

      it('returns false when closed', () => {
        const state = mockState({
          isActionsSidebarOpen: false,
          currentActionsData: { type: '', actions: [] },
          isActionsSidebarPinned: false,
        })
        expect(selectIsActionsSidebarOpen(state)).toBe(false)
      })
    })

    describe('selectCurrentActionsData', () => {
      it('returns the current actions data', () => {
        const data = { type: ACTIONS_SIDEBAR_TYPES.APPROVED, actions: [{ id: 5 }] }
        const state = mockState({
          isActionsSidebarOpen: false,
          currentActionsData: data,
          isActionsSidebarPinned: false,
        })
        expect(selectCurrentActionsData(state)).toEqual(data)
      })
    })

    describe('selectIsActionsSidebarPinned', () => {
      it('returns true when pinned', () => {
        const state = mockState({
          isActionsSidebarOpen: false,
          currentActionsData: { type: '', actions: [] },
          isActionsSidebarPinned: true,
        })
        expect(selectIsActionsSidebarPinned(state)).toBe(true)
      })

      it('returns false when not pinned', () => {
        const state = mockState({
          isActionsSidebarOpen: false,
          currentActionsData: { type: '', actions: [] },
          isActionsSidebarPinned: false,
        })
        expect(selectIsActionsSidebarPinned(state)).toBe(false)
      })
    })
  })
})
