import { themeSlice, getHasSidebar, getIsAlertEnabled, TOGGLE_SIDEBAR } from './themeSlice'

import type { RootState, ThemeState } from '@/types/redux.d'

const { setDarkTheme, setLightTheme, toggleSidebar, setIsAlertEnabled } = themeSlice.actions
const reducer = themeSlice.reducer

describe('themeSlice', () => {
  describe('initial state', () => {
    it('starts with dark theme, sidebar closed, alert enabled', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(state.value).toBe('dark')
      expect(state.sidebar).toBe(false)
      expect(state.isAlertEnabled).toBe(true)
    })
  })

  describe('TOGGLE_SIDEBAR constant', () => {
    it('has correct action type string', () => {
      expect(TOGGLE_SIDEBAR).toBe('theme/toggleSidebar')
    })
  })

  describe('setDarkTheme', () => {
    it('sets theme to dark', () => {
      const state = reducer(
        { value: 'light', sidebar: false, isAlertEnabled: true },
        setDarkTheme(),
      )
      expect(state.value).toBe('dark')
    })

    it('does not change other fields', () => {
      const state = reducer(
        { value: 'light', sidebar: true, isAlertEnabled: false },
        setDarkTheme(),
      )
      expect(state.sidebar).toBe(true)
      expect(state.isAlertEnabled).toBe(false)
    })
  })

  describe('setLightTheme', () => {
    it('sets theme to light', () => {
      const state = reducer(undefined, setLightTheme())
      expect(state.value).toBe('light')
    })

    it('does not change other fields', () => {
      const state = reducer({ value: 'dark', sidebar: true, isAlertEnabled: true }, setLightTheme())
      expect(state.sidebar).toBe(true)
    })
  })

  describe('toggleSidebar', () => {
    it('toggles sidebar from false to true when no payload', () => {
      const state = reducer(
        { value: 'dark', sidebar: false, isAlertEnabled: true },
        toggleSidebar(undefined),
      )
      expect(state.sidebar).toBe(true)
    })

    it('toggles sidebar from true to false when no payload', () => {
      const state = reducer(
        { value: 'dark', sidebar: true, isAlertEnabled: true },
        toggleSidebar(undefined),
      )
      expect(state.sidebar).toBe(false)
    })

    it('sets sidebar to explicit true', () => {
      const state = reducer(
        { value: 'dark', sidebar: false, isAlertEnabled: true },
        toggleSidebar(true),
      )
      expect(state.sidebar).toBe(true)
    })

    it('sets sidebar to explicit false', () => {
      const state = reducer(
        { value: 'dark', sidebar: true, isAlertEnabled: true },
        toggleSidebar(false),
      )
      expect(state.sidebar).toBe(false)
    })
  })

  describe('setIsAlertEnabled', () => {
    it('enables alerts', () => {
      const state = reducer(
        { value: 'dark', sidebar: false, isAlertEnabled: false },
        setIsAlertEnabled(true),
      )
      expect(state.isAlertEnabled).toBe(true)
    })

    it('disables alerts', () => {
      const state = reducer(undefined, setIsAlertEnabled(false))
      expect(state.isAlertEnabled).toBe(false)
    })
  })

  describe('immutability', () => {
    it('does not mutate the original state', () => {
      const initial: ThemeState = { value: 'dark', sidebar: false, isAlertEnabled: true }
      const copy = { ...initial }
      reducer(initial, setLightTheme())
      expect(initial).toEqual(copy)
    })
  })

  describe('selectors', () => {
    const mockState = (theme: ThemeState): RootState => ({ theme }) as RootState

    describe('getHasSidebar', () => {
      it('returns true when sidebar is open', () => {
        expect(
          getHasSidebar(mockState({ value: 'dark', sidebar: true, isAlertEnabled: true })),
        ).toBe(true)
      })

      it('returns false when sidebar is closed', () => {
        expect(
          getHasSidebar(mockState({ value: 'dark', sidebar: false, isAlertEnabled: true })),
        ).toBe(false)
      })
    })

    describe('getIsAlertEnabled', () => {
      it('returns true when alerts are enabled', () => {
        expect(
          getIsAlertEnabled(mockState({ value: 'dark', sidebar: false, isAlertEnabled: true })),
        ).toBe(true)
      })

      it('returns false when alerts are disabled', () => {
        expect(
          getIsAlertEnabled(mockState({ value: 'dark', sidebar: false, isAlertEnabled: false })),
        ).toBe(false)
      })
    })
  })
})
