import type { EndpointBuilder, BaseQueryFn, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'

import { API_PATHS } from '../constants'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const authEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getUserinfo: builder.query({
    query: () => API_PATHS.USERINFO,
    transformResponse: (value: unknown, meta: FetchBaseQueryMeta | undefined) => ({
      ...(value || null),
      isGeoLocationRestricted: meta?.response?.headers?.get?.('gloc') === '2',
    }),
  }),

  postToken: builder.query({
    query: (payload: UnknownRecord = {}) => ({
      url: 'token',
      method: 'POST',
      body: payload,
    }),
  }),

  getUserPermissions: builder.query({
    query: () => ({ url: 'permissions', method: 'GET' }),
  }),

  getRolesPermissions: builder.query({
    query: () => ({ url: 'roles/permissions', method: 'GET' }),
    providesTags: ['RolePermissions'],
  }),
})
