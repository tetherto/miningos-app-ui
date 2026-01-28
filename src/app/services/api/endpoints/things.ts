import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const thingsEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getListThings: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `list-things?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getListRacks: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `list-racks?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  addThingComment: builder.mutation({
    query: (payload: UnknownRecord = {}) => ({
      url: 'thing/comment',
      method: 'POST',
      body: payload,
    }),
  }),

  editThingComment: builder.mutation({
    query: (payload: UnknownRecord = {}) => ({
      url: 'thing/comment',
      method: 'PUT',
      body: payload,
    }),
  }),

  deleteThingComment: builder.mutation({
    query: (payload: UnknownRecord = {}) => ({
      url: 'thing/comment',
      method: 'DELETE',
      body: payload,
    }),
  }),

  getThingConfig: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `thing-config?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),
})
