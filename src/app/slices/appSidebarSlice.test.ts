import { sidebarSlice } from './appSidebarSlice'

import type { SidebarState } from '@/types/redux.d'

const { setSidebarState, toggleSidebar } = sidebarSlice.actions
const reducer = sidebarSlice.reducer

describe('appSidebarSlice', () => {
  describe('initial state', () => {
    it('starts expanded', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(state.isExpanded).toBe(true)
    })
  })

  describe('setSidebarState', () => {
    it('sets sidebar to expanded', () => {
      const state = reducer({ isExpanded: false }, setSidebarState(true))
      expect(state.isExpanded).toBe(true)
    })

    it('sets sidebar to collapsed', () => {
      const state = reducer({ isExpanded: true }, setSidebarState(false))
      expect(state.isExpanded).toBe(false)
    })
  })

  describe('toggleSidebar', () => {
    it('toggles from expanded to collapsed', () => {
      const state = reducer({ isExpanded: true }, toggleSidebar())
      expect(state.isExpanded).toBe(false)
    })

    it('toggles from collapsed to expanded', () => {
      const state = reducer({ isExpanded: false }, toggleSidebar())
      expect(state.isExpanded).toBe(true)
    })
  })

  describe('immutability', () => {
    it('does not mutate the original state', () => {
      const initial: SidebarState = { isExpanded: true }
      const copy = { ...initial }
      reducer(initial, toggleSidebar())
      expect(initial).toEqual(copy)
    })
  })
})
