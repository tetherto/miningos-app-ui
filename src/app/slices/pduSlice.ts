import { createSlice } from '@reduxjs/toolkit'

import type { PduState, RootState } from '@/types/redux'

const switchLayout = (state: PduState): void => {
  state.isPduLayout = !state.isPduLayout
}

const initialState: PduState = {
  isPduLayout: true,
}

export const pduSlice = createSlice({
  name: 'pduLayout',
  initialState,
  reducers: {
    switchLayout,
  },
})

export default pduSlice.reducer

export const getCurrentLayout = (state: RootState): boolean => state.pdu.isPduLayout
