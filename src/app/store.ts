import {
  configureStore,
  isRejectedWithValue,
  type Middleware,
  type MiddlewareAPI,
} from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import notification from 'antd/es/notification'
import _includes from 'lodash/includes'
import { combineReducers } from 'redux'
import { persistReducer, persistStore, type Persistor } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import type { RootState } from '../types/redux'
import { ERROR_CODES } from '../Views/SignIn/SignIn.const'

import { api } from './services/api'
import { isDemoMode } from './services/api.utils'
import { actionsSidebarSlice } from './slices/actionsSidebarSlice'
import { actionsSlice } from './slices/actionsSlice'
import { sidebarSlice } from './slices/appSidebarSlice'
import { authSlice } from './slices/authSlice'
import { devicesSlice } from './slices/devicesSlice'
import { minersSlice } from './slices/minersSlice'
import { multiSiteSlice } from './slices/multiSiteSlice'
import { notificationSlice } from './slices/notificationSlice'
import { pduSlice } from './slices/pduSlice'
import { themeSlice } from './slices/themeSlice'
import { timezoneSlice } from './slices/timezoneSlice'
import { userInfoSlice } from './slices/userInfoSlice'

import { setPermissions, setToken } from '@/hooks/usePermissions'

export const { setDarkTheme, setLightTheme, setIsAlertEnabled } = themeSlice.actions

export const { setTimezone } = timezoneSlice.actions

const reducers = combineReducers({
  theme: themeSlice.reducer,
  timezone: timezoneSlice.reducer,
  auth: authSlice.reducer,
  [api.reducerPath]: api.reducer,
  devices: devicesSlice.reducer,
  actions: actionsSlice.reducer,
  miners: minersSlice.reducer,
  pdu: pduSlice.reducer,
  actionsSidebar: actionsSidebarSlice.reducer,
  notifications: notificationSlice.reducer,
  multiSite: multiSiteSlice.reducer,
  sidebar: sidebarSlice.reducer,
  userInfo: userInfoSlice.reducer,
})

const persistConfig = {
  key: 'miningos',
  storage,
  whitelist: ['auth', 'theme', 'devices', 'timezone', 'multiSite', 'sidebar', 'userInfo'],
}

const persistedReducer = persistReducer(persistConfig, reducers)

const rtkQueryErrorHandler: Middleware = (api: MiddlewareAPI) => (next) => (action: unknown) => {
  if (isRejectedWithValue(action)) {
    const rejectedAction = action as {
      payload?: {
        data?: {
          code?: string
          message?: string
        }
        status?: number
      }
      meta?: {
        arg?: {
          queryCacheKey?: string
        }
      }
    }

    // Ensure action.payload.data exists before accessing 'code'
    // Silence errors in demo mode to avoid showing missing mock data errors
    if (
      process.env.NODE_ENV === 'development' &&
      !isDemoMode &&
      rejectedAction.payload?.data?.code !== 'CHANNEL_CLOSED'
    ) {
      notification.error({
        message: 'Async error!',
        description: rejectedAction.meta?.arg?.queryCacheKey,
      })
    }

    if (
      rejectedAction.payload?.data?.message === ERROR_CODES.ERR_AUTH_FAIL &&
      !_includes([500, 502, 503], rejectedAction.payload.status)
    ) {
      api.dispatch(setToken(null))
      api.dispatch(setPermissions(null))
    }
  }

  return next(action)
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat([api.middleware, rtkQueryErrorHandler]),
  devTools: true,
})

setupListeners(store.dispatch)

export const persistor: Persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type { RootState }
export type AppDispatch = typeof store.dispatch
