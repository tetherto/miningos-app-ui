import { notificationSlice, increment, decrement, reset } from './notificationSlice'

import type { NotificationState } from '@/types/redux.d'

const reducer = notificationSlice.reducer

describe('notificationSlice', () => {
  describe('initial state', () => {
    it('starts with count of 0', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(state.count).toBe(0)
    })
  })

  describe('increment', () => {
    it('increases count by 1', () => {
      const state = reducer({ count: 0 }, increment())
      expect(state.count).toBe(1)
    })

    it('can increment multiple times', () => {
      let state = reducer({ count: 0 }, increment())
      state = reducer(state, increment())
      state = reducer(state, increment())
      expect(state.count).toBe(3)
    })
  })

  describe('decrement', () => {
    it('decreases count by 1', () => {
      const state = reducer({ count: 5 }, decrement())
      expect(state.count).toBe(4)
    })

    it('does not go below 0', () => {
      const state = reducer({ count: 0 }, decrement())
      expect(state.count).toBe(0)
    })

    it('clamps to 0 when count is 1', () => {
      const state = reducer({ count: 1 }, decrement())
      expect(state.count).toBe(0)
    })
  })

  describe('reset', () => {
    it('resets count to 0 from a positive value', () => {
      const state = reducer({ count: 10 }, reset())
      expect(state.count).toBe(0)
    })

    it('resets count when already at 0', () => {
      const state = reducer({ count: 0 }, reset())
      expect(state.count).toBe(0)
    })
  })

  describe('immutability', () => {
    it('does not mutate the original state', () => {
      const initial: NotificationState = { count: 3 }
      const copy = { ...initial }
      reducer(initial, increment())
      expect(initial).toEqual(copy)
    })
  })
})
