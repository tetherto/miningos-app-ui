import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit'

import type { MultiSiteState, MultiSiteDateRange, TimeframeType, RootState } from '@/types/redux'

const initialState: MultiSiteState = {
  selectedSites: [],
  isManualSelection: false,
  dateRange: null,
  timeframeType: null,
}

export const multiSiteSlice = createSlice({
  name: 'multiSite',
  initialState,
  reducers: {
    setSelectedSites: (state, action: PayloadAction<string[]>) => {
      state.selectedSites = action.payload
      state.isManualSelection = false
    },
    setSelectedSitesManually: (state, action: PayloadAction<string[]>) => {
      state.selectedSites = action.payload
      state.isManualSelection = true
    },
    setMultiSiteDateRange: (state, action: PayloadAction<MultiSiteDateRange | null>) => {
      state.dateRange = action.payload
    },
    setTimeframeType: (state, action: PayloadAction<TimeframeType | null>) => {
      state.timeframeType = action.payload
    },
    clearSelectedSites: (state) => {
      state.selectedSites = []
    },
    clearMultiSiteDateRange: (state) => {
      state.dateRange = null
    },
    clearTimeframeType: (state) => {
      state.timeframeType = null
    },
  },
})

const selectMultiSiteState = (state: RootState): MultiSiteState => state.multiSite

export const getSelectedSites = createSelector(
  [selectMultiSiteState],
  (multiSite: MultiSiteState): string[] => multiSite.selectedSites,
)

export const getIsManualSelection = createSelector(
  [selectMultiSiteState],
  (multiSite: MultiSiteState): boolean => multiSite.isManualSelection,
)

export const getMultiSiteDateRange = createSelector(
  [selectMultiSiteState],
  (multiSite: MultiSiteState): MultiSiteDateRange | null => multiSite.dateRange,
)

export const getTimeframeType = createSelector(
  [selectMultiSiteState],
  (multiSite: MultiSiteState): TimeframeType | null => multiSite.timeframeType,
)

export const {
  setSelectedSites,
  setSelectedSitesManually,
  clearSelectedSites,
  setMultiSiteDateRange,
  clearMultiSiteDateRange,
  setTimeframeType,
  clearTimeframeType,
} = multiSiteSlice.actions

export default multiSiteSlice.reducer
