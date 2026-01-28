import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import _constant from 'lodash/constant'
import qs from 'qs'

import {
  FEATURES_GET_API_ENDPOINT,
  FEATURE_CONFIG_GET_API_ENDPOINT,
  getFeaturesFromUrlParams,
} from '../../api.utils'
import { Logger } from '../../logger'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import type { FeatureFlags } from '@/types/api'

/**
 * Get features from local storage
 * To set:
 * localStorage.setItem('features', JSON.stringify({isDevelopment: true}))
 */
const getFeaturesFromLocalStorage = (): FeatureFlags => {
  const features = localStorage.getItem('features')
  if (!features) return {}

  try {
    return JSON.parse(features) as FeatureFlags
  } catch (error) {
    Logger.error('Failed to parse features from localStorage', error)
    return {}
  }
}

export const globalEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getExtData: builder.query({
    query: (payload: UnknownRecord) =>
      `ext-data?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getGlobalData: builder.query({
    query: (payload: UnknownRecord) =>
      `global/data?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  postProductionData: builder.mutation({
    query: (payload: UnknownRecord) => {
      const url = 'global/data?type=productionCosts'
      return {
        url,
        method: 'POST',
        body: payload,
      }
    },
  }),

  setSiteEnergyGlobalData: builder.mutation({
    query: (payload: UnknownRecord) => {
      const url = 'global/data?type=siteEnergy'
      return {
        url,
        method: 'POST',
        body: payload,
      }
    },
  }),

  setContainerSettings: builder.mutation({
    query: (payload: UnknownRecord) => {
      const url = 'global/data?type=containerSettings'
      return {
        url,
        method: 'POST',
        body: payload,
      }
    },
    invalidatesTags: ['ContainerSettings'],
  }),

  getContainerSettings: builder.query({
    query: (payload: { model?: string; overwriteCache?: boolean } = {}) => {
      const { model, overwriteCache } = payload
      const queryParams: Record<string, string | boolean> = { type: 'containerSettings' }

      if (model) queryParams.model = model
      if (overwriteCache) queryParams.overwriteCache = overwriteCache

      return `global/data?${qs.stringify(queryParams)}`
    },
    providesTags: ['ContainerSettings'],
  }),

  getSite: builder.query({
    query: _constant('site'),
  }),

  getGlobalConfig: builder.query({
    query: (payload: UnknownRecord) =>
      `global-config?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
    providesTags: ['GlobalConfig'],
  }),

  setGlobalConfig: builder.mutation({
    query: (payload: UnknownRecord = {}) => ({
      url: 'global-config',
      method: 'POST',
      body: payload,
    }),
    invalidatesTags: ['GlobalConfig'],
  }),

  getSettings: builder.query({
    query: (payload: UnknownRecord) =>
      `settings?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
    providesTags: ['Settings'],
  }),

  updateSettings: builder.mutation({
    query: (payload: UnknownRecord) => ({
      url: 'settings',
      method: 'PUT',
      body: payload,
    }),
    invalidatesTags: ['Settings'],
  }),

  addFeatureFlags: builder.mutation({
    query: (payload: UnknownRecord = {}) => ({
      url: 'features',
      method: 'POST',
      body: payload,
    }),
    invalidatesTags: ['Features'],
  }),

  getFeatureConfig: builder.query<UnknownRecord, void | UnknownRecord>({
    query: (payload?: UnknownRecord) =>
      `${FEATURE_CONFIG_GET_API_ENDPOINT}?${qs.stringify(payload || { overwriteCache: true }, { arrayFormat: 'comma' })}`,
  }),

  getFeatures: builder.query({
    query: (payload: UnknownRecord = { overwriteCache: true }) =>
      `${FEATURES_GET_API_ENDPOINT}?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
    transformResponse: (response: FeatureFlags) => {
      const urlFeatures = getFeaturesFromUrlParams(window.location.search)
      const localStorageFeatures = getFeaturesFromLocalStorage()

      return { ...response, ...urlFeatures, ...localStorageFeatures }
    },
    providesTags: ['Features'],
  }),
})
