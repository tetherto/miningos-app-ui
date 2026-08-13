import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import _constant from 'lodash/constant'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const usersEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getUsers: builder.query({
    query: _constant('users'),
    providesTags: ['User'],
  }),

  updateUser: builder.mutation({
    query: (payload: UnknownRecord) => ({
      url: 'users',
      method: 'PUT',
      body: payload,
    }),
    invalidatesTags: ['User'],
    extraOptions: {
      maxRetries: 0,
    },
  }),

  deleteUser: builder.mutation({
    query: (payload: UnknownRecord) => ({
      url: 'users/delete',
      method: 'POST',
      body: payload,
    }),
    invalidatesTags: ['User'],
    extraOptions: {
      maxRetries: 0,
    },
  }),

  createUser: builder.mutation({
    query: (payload: UnknownRecord) => ({
      url: 'users',
      method: 'POST',
      body: payload,
    }),
    invalidatesTags: ['User'],
    extraOptions: {
      maxRetries: 0,
    },
  }),
})
