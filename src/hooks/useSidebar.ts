import { useDispatch, useSelector } from 'react-redux'

import { sidebarSlice } from '@/app/slices/appSidebarSlice'
import { TOGGLE_SIDEBAR } from '@/app/slices/themeSlice'
import type { RootState } from '@/types/redux'

interface UseSidebarReturn {
  isExpanded: boolean
  toggle: VoidFunction
  setExpanded: (expanded: boolean) => void
}

export const useSidebar = (isMobile: boolean): UseSidebarReturn => {
  const dispatch = useDispatch()
  const isExpanded = useSelector((state: RootState) => state.sidebar.isExpanded)

  const { setSidebarState, toggleSidebar } = sidebarSlice.actions

  const toggle = (): void => {
    if (isMobile) {
      dispatch({ type: TOGGLE_SIDEBAR })
      dispatch(setSidebarState(true))
    } else {
      dispatch(toggleSidebar())
    }
  }

  const setExpanded = (expanded: boolean): void => {
    dispatch(setSidebarState(expanded))
  }

  return {
    isExpanded,
    toggle,
    setExpanded,
  }
}
