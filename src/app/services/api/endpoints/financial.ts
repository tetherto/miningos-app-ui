import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const financialEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getRevenue: builder.query({
    query: (payload: UnknownRecord) => `revenue?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getCosts: builder.query({
    query: (payload: UnknownRecord) => `costs?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getCostOperationalEnergy: builder.query({
    query: (payload: UnknownRecord) =>
      `costs/operational-energy?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getCostEnergy: builder.query({
    query: (payload: UnknownRecord) =>
      `costs/energy?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getCostProduction: builder.query({
    query: (payload: UnknownRecord) =>
      `costs/production-price?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getProductionCosts: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `production-costs?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
    providesTags: ['ProductionCosts'],
  }),

  setProductionCosts: builder.mutation({
    query: (payload: UnknownRecord = {}) => ({
      url: 'production-costs',
      method: 'POST',
      body: payload,
    }),
    invalidatesTags: ['ProductionCosts'],
  }),
})
