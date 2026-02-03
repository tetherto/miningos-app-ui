/**
 * User Info Slice - User information state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserInfoState } from '../types';

const initialState: UserInfoState = {
  email: null,
  name: null,
  picture: null,
  roles: [],
};

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<Partial<UserInfoState>>) => {
      return { ...state, ...action.payload };
    },
    clearUserInfo: () => initialState,
  },
});

export const { setUserInfo, clearUserInfo } = userInfoSlice.actions;

export default userInfoSlice.reducer;
