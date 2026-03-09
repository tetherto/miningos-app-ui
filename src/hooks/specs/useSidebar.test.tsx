import { configureStore } from '@reduxjs/toolkit'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'

import { useSidebar } from '../useSidebar'

import { sidebarSlice } from '@/app/slices/appSidebarSlice'
import { themeSlice } from '@/app/slices/themeSlice'

const createWrapper = (isExpanded = true) => {
  const store = configureStore({
    reducer: {
      sidebar: sidebarSlice.reducer,
      theme: themeSlice.reducer,
    },
    preloadedState: {
      sidebar: { isExpanded },
    },
  })
  return {
    wrapper: function Wrapper({ children }: { children: React.ReactNode }) {
      return <Provider store={store}>{children}</Provider>
    },
    store,
  }
}

describe('useSidebar', () => {
  describe('isExpanded', () => {
    it('returns true when sidebar is expanded', () => {
      const { wrapper } = createWrapper(true)
      const { result } = renderHook(() => useSidebar(false), { wrapper })
      expect(result.current.isExpanded).toBe(true)
    })

    it('returns false when sidebar is collapsed', () => {
      const { wrapper } = createWrapper(false)
      const { result } = renderHook(() => useSidebar(false), { wrapper })
      expect(result.current.isExpanded).toBe(false)
    })
  })

  describe('setExpanded', () => {
    it('expands the sidebar', () => {
      const { wrapper } = createWrapper(false)
      const { result } = renderHook(() => useSidebar(false), { wrapper })
      act(() => {
        result.current.setExpanded(true)
      })
      expect(result.current.isExpanded).toBe(true)
    })

    it('collapses the sidebar', () => {
      const { wrapper } = createWrapper(true)
      const { result } = renderHook(() => useSidebar(false), { wrapper })
      act(() => {
        result.current.setExpanded(false)
      })
      expect(result.current.isExpanded).toBe(false)
    })
  })

  describe('toggle', () => {
    it('toggles sidebar on desktop (non-mobile)', () => {
      const { wrapper } = createWrapper(true)
      const { result } = renderHook(() => useSidebar(false), { wrapper })
      act(() => {
        result.current.toggle()
      })
      expect(result.current.isExpanded).toBe(false)
    })

    it('toggles back to expanded on desktop', () => {
      const { wrapper } = createWrapper(false)
      const { result } = renderHook(() => useSidebar(false), { wrapper })
      act(() => {
        result.current.toggle()
      })
      expect(result.current.isExpanded).toBe(true)
    })

    it('on mobile, sets isExpanded to true and dispatches theme toggle', () => {
      const { wrapper, store } = createWrapper(false)
      const dispatchSpy = vi.spyOn(store, 'dispatch')
      const { result } = renderHook(() => useSidebar(true), { wrapper })
      act(() => {
        result.current.toggle()
      })
      // On mobile, dispatches TOGGLE_SIDEBAR then setSidebarState(true)
      expect(dispatchSpy).toHaveBeenCalledTimes(2)
      expect(result.current.isExpanded).toBe(true)
    })
  })
})
