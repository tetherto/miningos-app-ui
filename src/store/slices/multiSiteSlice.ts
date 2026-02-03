/**
 * Multi-Site Slice - Multi-site mode state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MultiSiteState } from '../types';

const initialState: MultiSiteState = {
  isEnabled: false,
  currentSite: null,
  sites: [],
};

export const multiSiteSlice = createSlice({
  name: 'multiSite',
  initialState,
  reducers: {
    setMultiSiteEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    setCurrentSite: (state, action: PayloadAction<string | null>) => {
      state.currentSite = action.payload;
    },
    setSites: (state, action: PayloadAction<string[]>) => {
      state.sites = action.payload;
    },
  },
});

export const { setMultiSiteEnabled, setCurrentSite, setSites } =
  multiSiteSlice.actions;

export default multiSiteSlice.reducer;
