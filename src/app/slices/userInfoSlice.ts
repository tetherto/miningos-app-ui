import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import _get from 'lodash/get'

import type { RootState, UserInfoState } from '@/types/redux'

const initialState: UserInfoState = {
  email: '',
  id: 0,
  roles: '',
  password: null,
  created: 0,
  ips: [],
  metadata: null,
  token: '',
}

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    setUserInfo: (state, { payload }: PayloadAction<UserInfoState>) => {
      Object.assign(state, payload)
    },
  },
})

export const selectUserInfo = (state: RootState): UserInfoState | null => state.userInfo
export const selectUserEmail = (state: RootState): string | undefined => {
  const userInfo = selectUserInfo(state)

  return _get(userInfo, 'metadata.email', '') || _get(userInfo, 'email', '') || ''
}
