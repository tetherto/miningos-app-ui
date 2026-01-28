import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const operationsEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getOperationsHashrate: builder.query({
    query: (payload: UnknownRecord) =>
      `operations/hashrate?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getOperationsConsumption: builder.query({
    query: (payload: UnknownRecord) =>
      `operations/consumption?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getOperationsWorkers: builder.query({
    query: (payload: UnknownRecord) =>
      `operations/workers?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getOperationsEfficiency: builder.query({
    query: (payload: UnknownRecord) =>
      `operations/efficiency?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),
})
