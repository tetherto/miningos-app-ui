import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState, ThemeState } from '@/types/redux'

export const getHasSidebar = (state: RootState): boolean => state.theme.sidebar

export const getIsAlertEnabled = (state: RootState): boolean => state.theme.isAlertEnabled

const sliceName = 'theme'

export const TOGGLE_SIDEBAR = `${sliceName}/toggleSidebar`

const initialState: ThemeState = {
  value: 'dark',
  sidebar: false,
  isAlertEnabled: true,
}

export const themeSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setDarkTheme: (state) => {
      state.value = 'dark'
    },
    setLightTheme: (state) => {
      state.value = 'light'
    },
    toggleSidebar: (state, { payload }: PayloadAction<boolean | undefined>) => {
      state.sidebar = payload !== undefined ? payload : !state.sidebar
    },
    setIsAlertEnabled: (state, { payload }: PayloadAction<boolean>) => {
      state.isAlertEnabled = payload
    },
  },
})
