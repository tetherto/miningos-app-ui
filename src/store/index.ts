/**
 * Redux Store Configuration for MiningOS Android App
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import userInfoReducer from './slices/userInfoSlice';
import sidebarReducer from './slices/sidebarSlice';
import timezoneReducer from './slices/timezoneSlice';
import multiSiteReducer from './slices/multiSiteSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  userInfo: userInfoReducer,
  sidebar: sidebarReducer,
  timezone: timezoneReducer,
  multiSite: multiSiteReducer,
});

const persistConfig = {
  key: 'miningos',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth', 'theme', 'timezone', 'multiSite', 'sidebar', 'userInfo'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type { RootState, AppDispatch } from './types';
