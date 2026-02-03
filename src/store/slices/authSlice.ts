/**
 * Auth Slice - Authentication state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState } from '../types';

const initialState: AuthState = {
  token: null,
  refreshToken: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string | null>) => {
      state.refreshToken = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken?: string }>
    ) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    clearAuth: (state) => {
      state.token = null;
      state.refreshToken = null;
    },
  },
});

export const { setToken, setRefreshToken, setCredentials, clearAuth } =
  authSlice.actions;

export default authSlice.reducer;
