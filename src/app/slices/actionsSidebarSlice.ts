import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { ACTIONS_SIDEBAR_TYPES } from '../../Components/ActionsSidebar/ActionsSidebar.types'

import type { ActionsSidebarState, ActionsSidebarData, RootState } from '@/types/redux'

const initialState: ActionsSidebarState = {
  isActionsSidebarOpen: false,
  currentActionsData: {
    type: ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION,
    actions: [],
  },
  isActionsSidebarPinned: false,
}

export const actionsSidebarSlice = createSlice({
  name: 'actionsSidebar',
  initialState,
  reducers: {
    setIsActionsSidebarOpen: (state, { payload }: PayloadAction<boolean>) => {
      state.isActionsSidebarOpen = payload
    },
    setCurrentActionsData: (state, { payload }: PayloadAction<ActionsSidebarData>) => {
      state.currentActionsData = payload
    },
    setIsActionsSidebarPinned: (state, { payload }: PayloadAction<boolean>) => {
      state.isActionsSidebarPinned = payload
    },
  },
})

export const selectIsActionsSidebarOpen = (state: RootState): boolean =>
  state.actionsSidebar.isActionsSidebarOpen
export const selectCurrentActionsData = (state: RootState): ActionsSidebarData =>
  state.actionsSidebar.currentActionsData
export const selectIsActionsSidebarPinned = (state: RootState): boolean =>
  state.actionsSidebar.isActionsSidebarPinned
