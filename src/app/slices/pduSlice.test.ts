import { pduSlice, getCurrentLayout } from './pduSlice'

import type { PduState, RootState } from '@/types/redux.d'

const { switchLayout } = pduSlice.actions
const reducer = pduSlice.reducer

describe('pduSlice', () => {
  describe('initial state', () => {
    it('starts with PDU layout enabled', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(state.isPduLayout).toBe(true)
    })
  })

  describe('switchLayout', () => {
    it('toggles from true to false', () => {
      const state = reducer({ isPduLayout: true }, switchLayout())
      expect(state.isPduLayout).toBe(false)
    })

    it('toggles from false to true', () => {
      const state = reducer({ isPduLayout: false }, switchLayout())
      expect(state.isPduLayout).toBe(true)
    })

    it('can toggle multiple times', () => {
      let state = reducer(undefined, switchLayout())
      expect(state.isPduLayout).toBe(false)
      state = reducer(state, switchLayout())
      expect(state.isPduLayout).toBe(true)
    })
  })

  describe('immutability', () => {
    it('does not mutate the original state', () => {
      const initial: PduState = { isPduLayout: true }
      const copy = { ...initial }
      reducer(initial, switchLayout())
      expect(initial).toEqual(copy)
    })
  })

  describe('selectors', () => {
    const mockState = (pdu: PduState): RootState => ({ pdu }) as RootState

    describe('getCurrentLayout', () => {
      it('returns true when PDU layout is active', () => {
        expect(getCurrentLayout(mockState({ isPduLayout: true }))).toBe(true)
      })

      it('returns false when PDU layout is inactive', () => {
        expect(getCurrentLayout(mockState({ isPduLayout: false }))).toBe(false)
      })
    })
  })
})
