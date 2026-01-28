import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { SidebarState } from '@/types/redux'

const initialState: SidebarState = {
  isExpanded: true,
}

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setSidebarState: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload
    },
    toggleSidebar: (state) => {
      state.isExpanded = !state.isExpanded
    },
  },
})
