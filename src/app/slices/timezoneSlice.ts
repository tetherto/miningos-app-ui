import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { TimezoneState } from '@/types/redux'

const sliceName = 'timezone'

const initialState: TimezoneState = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

export const timezoneSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setTimezone: (state, { payload }: PayloadAction<string>) => {
      state.timezone = payload
    },
  },
})
