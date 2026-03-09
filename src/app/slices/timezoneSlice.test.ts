import { timezoneSlice } from './timezoneSlice'

import type { TimezoneState } from '@/types/redux.d'

const { setTimezone } = timezoneSlice.actions
const reducer = timezoneSlice.reducer

describe('timezoneSlice', () => {
  describe('initial state', () => {
    it('defaults to the system timezone', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(typeof state.timezone).toBe('string')
      expect(state.timezone.length).toBeGreaterThan(0)
    })
  })

  describe('setTimezone', () => {
    it('sets a new timezone', () => {
      const state = reducer(undefined, setTimezone('America/New_York'))
      expect(state.timezone).toBe('America/New_York')
    })

    it('overwrites an existing timezone', () => {
      const initial: TimezoneState = { timezone: 'Europe/London' }
      const state = reducer(initial, setTimezone('Asia/Tokyo'))
      expect(state.timezone).toBe('Asia/Tokyo')
    })

    it('accepts UTC', () => {
      const state = reducer(undefined, setTimezone('UTC'))
      expect(state.timezone).toBe('UTC')
    })
  })

  describe('immutability', () => {
    it('does not mutate the original state', () => {
      const initial: TimezoneState = { timezone: 'UTC' }
      const copy = { ...initial }
      reducer(initial, setTimezone('America/Los_Angeles'))
      expect(initial).toEqual(copy)
    })
  })
})
