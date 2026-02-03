/**
 * Timezone Slice - Timezone settings
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TimezoneState } from '../types';

const initialState: TimezoneState = {
  timezone: 'UTC',
  offset: 0,
};

export const timezoneSlice = createSlice({
  name: 'timezone',
  initialState,
  reducers: {
    setTimezone: (
      state,
      action: PayloadAction<{ timezone: string; offset: number }>
    ) => {
      state.timezone = action.payload.timezone;
      state.offset = action.payload.offset;
    },
  },
});

export const { setTimezone } = timezoneSlice.actions;

export default timezoneSlice.reducer;
