import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'

export const settingsEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getHeaderControls: builder.query({
    query: () => 'settings/header-controls',
    providesTags: ['HeaderControls'],
    extraOptions: { maxRetries: 3 },
  }),

  updateHeaderControls: builder.mutation({
    query: (payload) => ({ url: 'settings/header-controls', method: 'PUT', body: payload }),
    invalidatesTags: ['HeaderControls'],
    extraOptions: { maxRetries: 3 },
  }),

  getExportSettings: builder.query({
    query: () => 'settings/export',
    extraOptions: { maxRetries: 3 },
  }),

  importSettings: builder.mutation({
    query: (payload) => ({ url: 'settings/import', method: 'POST', body: payload }),
    invalidatesTags: ['HeaderControls', 'Features', 'Settings'],
    extraOptions: { maxRetries: 3 },
  }),
})
