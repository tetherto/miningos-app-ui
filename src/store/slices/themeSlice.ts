/**
 * Theme Slice - Theme and alert settings
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ThemeState } from '../types';

const initialState: ThemeState = {
  value: 'dark',
  isAlertEnabled: true,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setDarkTheme: (state) => {
      state.value = 'dark';
    },
    setLightTheme: (state) => {
      state.value = 'light';
    },
    toggleTheme: (state) => {
      state.value = state.value === 'dark' ? 'light' : 'dark';
    },
    setIsAlertEnabled: (state, action: PayloadAction<boolean>) => {
      state.isAlertEnabled = action.payload;
    },
  },
});

export const { setDarkTheme, setLightTheme, toggleTheme, setIsAlertEnabled } =
  themeSlice.actions;

export default themeSlice.reducer;
