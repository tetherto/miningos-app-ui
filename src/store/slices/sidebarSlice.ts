/**
 * Sidebar Slice - Sidebar state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SidebarState } from '../types';

const initialState: SidebarState = {
  isExpanded: true,
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setIsExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
    },
    toggleSidebar: (state) => {
      state.isExpanded = !state.isExpanded;
    },
  },
});

export const { setIsExpanded, toggleSidebar } = sidebarSlice.actions;

export default sidebarSlice.reducer;
