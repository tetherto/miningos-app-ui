import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import _isEmpty from 'lodash/isEmpty'
import qs from 'qs'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const actionsEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getActions: builder.query({
    query: (payload: UnknownRecord = {}) => {
      const queryString = _isEmpty(payload)
        ? ''
        : `?${qs.stringify(payload, { arrayFormat: 'comma' })}`
      return `actions${queryString}`
    },
    providesTags: ['Action'],
  }),

  getBatchActions: builder.query({
    query: (payload: UnknownRecord = {}) => {
      const queryString = _isEmpty(payload)
        ? ''
        : `?${qs.stringify(payload, { arrayFormat: 'comma' })}`
      return `actions/batch${queryString}`
    },
    providesTags: ['Action'],
  }),

  getAction: builder.query({
    query: (payload: { type: string; id: number | string }) => {
      const { type, id } = payload
      return `actions/${type}/${id}`
    },
  }),

  addNewAction: builder.mutation({
    query: (payload: { type: string; [key: string]: unknown }) => {
      const { type, ...body } = payload
      return { url: `actions/${type}`, method: 'POST', body }
    },
  }),

  addNewBatchAction: builder.mutation({
    query: (payload: { type: string; [key: string]: unknown }) => {
      const { type, ...body } = payload
      return { url: `actions/${type}/batch`, method: 'POST', body }
    },
  }),

  voteForAction: builder.mutation({
    query: (payload: { approve: boolean; id: string | number }) => {
      const { approve, id } = payload
      return {
        url: `actions/voting/${id}/vote`,
        method: 'PUT',
        body: { approve },
      }
    },
    invalidatesTags: ['Action'],
  }),

  cancelActions: builder.mutation({
    query: (payload: { type: string; ids: string[] }) => {
      const { type, ids } = payload
      return {
        url: `actions/${type}/cancel?${qs.stringify({ ids }, { arrayFormat: 'comma' })}`,
        method: 'DELETE',
      }
    },
  }),
})
